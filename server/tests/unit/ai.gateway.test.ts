// Set environment mock before config imports
process.env.GEMINI_API_KEY = 'mock_gemini_api_key_for_testing';
process.env.NODE_ENV = 'test';

import { test, describe, mock, beforeEach } from 'node:test';
import assert from 'node:assert';
import { PreprocessingService } from '../../src/shared/ai/preprocessing.service.js';
import { RequestCache } from '../../src/shared/ai/request-cache.js';
import { PolicyEngine } from '../../src/shared/ai/policy-engine.js';
import { ModelRegistry } from '../../src/shared/ai/model-registry.js';
import { ExtractionPipeline } from '../../src/shared/ai/extraction-pipeline.js';
import { GoogleGeminiProvider } from '../../src/shared/ai/gemini.provider.js';

describe('AI Gateway & Extraction Pipeline Unit Tests', () => {
  beforeEach(() => {
    RequestCache.clear();
    // Reset registry health and cooldowns
    ModelRegistry.getModels().forEach((m) => {
      m.health.consecutiveFailures = 0;
      m.health.cooldownUntil = null;
      m.health.healthScore = 100;
      m.health.failureCount = { quota: 0, timeout: 0, schema: 0, transient: 0 };
    });
  });

  describe('Preprocessing Service', () => {
    test('should resolve fuzzy headers to CRM fields', () => {
      const rawHeaders = ['Who is this?', 'Primary E-mail Address', 'contact cell', 'Remarks/Notes'];
      const mapping = PreprocessingService.mapHeaders(rawHeaders);

      assert.strictEqual(mapping['Who is this?'], 'name');
      assert.strictEqual(mapping['Primary E-mail Address'], 'email');
      assert.strictEqual(mapping['contact cell'], 'mobile_without_country_code');
      assert.strictEqual(mapping['Remarks/Notes'], 'crm_note');
    });

    test('should partition records into correct confidence bands', () => {
      // 1. High Confidence: Clean rows, standard values
      const cleanRows = [
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          mobile: '9876543210',
          status: 'Active follow up',
          source: 'Leads on demand'
        }
      ];
      const result1 = PreprocessingService.preprocess(cleanRows);
      assert.strictEqual(result1.confidence, 'High');
      assert.strictEqual(result1.records[0].confidence, 'High');

      // 2. Medium Confidence: Multiple emails / phones or irregular enums
      const irregularRows = [
        {
          name: 'Sarah Johnson',
          email: 'sarah1@mail.com; sarah2@mail.com', // multiple emails
          mobile: '9876543211',
          status: 'rescheduled to sunday morning', // irregular status
          source: 'Leads on demand'
        }
      ];
      const result2 = PreprocessingService.preprocess(irregularRows);
      assert.strictEqual(result2.confidence, 'Medium');
      assert.strictEqual(result2.records[0].confidence, 'Medium');
    });
  });

  describe('Request Cache', () => {
    test('should cache and retrieve successful validated responses', () => {
      const records = [{ name: 'Test Lead', email: 'test@mail.com' }];
      const hash = RequestCache.hashPayload(records);

      const cachedResponse = {
        records: [
          {
            row_index: 0,
            created_at: '2026-05-15 14:00:00',
            name: 'Test Lead',
            email: 'test@mail.com',
            country_code: '+91',
            mobile_without_country_code: '',
            company: '',
            city: '',
            state: '',
            country: '',
            lead_owner: '',
            crm_note: '',
            possession_time: '',
            description: '',
            crm_status: null,
            data_source: null
          }
        ],
        skipped: []
      };

      RequestCache.set(hash, cachedResponse);

      const hit = RequestCache.get(hash);
      assert.ok(hit);
      assert.strictEqual(hit.records[0].name, 'Test Lead');
    });

    test('should evict oldest LRU records when max size is hit', () => {
      // Set max size limit simulation by caching MAX_SIZE entries
      for (let i = 0; i < 505; i++) {
        const payload = [{ name: `Lead ${i}` }];
        const hash = RequestCache.hashPayload(payload);
        RequestCache.set(hash, { records: [], skipped: [] });
      }

      // First entries should be evicted (as cache size caps at 500)
      const firstPayload = [{ name: 'Lead 0' }];
      const firstHash = RequestCache.hashPayload(firstPayload);
      const hit = RequestCache.get(firstHash);
      assert.strictEqual(hit, null); // Evicted!
    });
  });

  describe('Policy Engine', () => {
    test('should sort models by capability tiers for routing policies', () => {
      const highQualityList = PolicyEngine.getPriorityList('HighQuality');
      // Preferred HighQuality model is gemini-2.5-flash or gemini-3.5-flash
      assert.ok(highQualityList[0].capabilities.qualityTier === 'high');

      const highThroughputList = PolicyEngine.getPriorityList('HighThroughput');
      // Preferred HighThroughput model has fast speed tier
      assert.ok(highThroughputList[0].capabilities.speedTier === 'fast');
    });
  });

  describe('AI Gateway Cooldown & Fallback Failover Routing', () => {
    test('should failover to next model and put failing model on cooldown', async () => {
      const callModelMock = mock.method(
        GoogleGeminiProvider.prototype,
        'callModel',
        mock.fn()
      );

      // Attempt 1: gemini-3.1-flash-lite -> Throws 429
      callModelMock.mock.mockImplementationOnce(async () => {
        throw new Error('[GoogleGenerativeAI Error]: ResourceExhausted 429');
      }, 0);

      // Attempt 2: gemini-2.5-flash-lite -> Succeeds
      const mockResponseText = JSON.stringify({
        records: [
          {
            row_index: 0,
            created_at: '2026-05-15 14:00:00',
            name: 'Fallback Mapped Lead',
            email: 'fallback@mail.com',
            country_code: '+91',
            mobile_without_country_code: '9999999999',
            company: '',
            city: '',
            state: '',
            country: '',
            lead_owner: '',
            crm_status: 'GOOD_LEAD_FOLLOW_UP',
            crm_note: '',
            data_source: 'leads_on_demand',
            possession_time: '',
            description: ''
          }
        ]
      });
      callModelMock.mock.mockImplementationOnce(async () => {
        return mockResponseText;
      }, 1);

      const rawRecords = [
        {
          name: 'Fallback Mapped Lead',
          email: 'fallback@mail.com',
          mobile: '9999999999',
          status: 'reschedule demo' // Needs AI
        }
      ];

      // Execute pipeline
      const outcome = await ExtractionPipeline.process(rawRecords, 'Balanced');

      // Assertions
      assert.strictEqual(outcome.records.length, 1);
      assert.strictEqual(outcome.records[0].name, 'Fallback Mapped Lead');
      assert.strictEqual(outcome.records[0].crm_status, 'GOOD_LEAD_FOLLOW_UP');

      // Verify that gemini-3.1-flash-lite was put on cooldown
      const firstModel = ModelRegistry.getModel('models/gemini-3.1-flash-lite');
      assert.ok(firstModel);
      assert.ok(ModelRegistry.isOnCooldown(firstModel.id)); // Cooldown is active!
      assert.strictEqual(firstModel.health.consecutiveFailures, 1);

      callModelMock.mock.restore();
    });
  });
});
