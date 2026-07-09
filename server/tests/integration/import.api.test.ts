// Set environment mock before config imports
process.env.GEMINI_API_KEY = 'mock_gemini_api_key_for_testing';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import { test, describe, mock } from 'node:test';
import assert from 'node:assert';
import { app } from '../../src/app';
import { GoogleGenerativeAI } from '@google/generative-ai';

describe('API Integration Tests', () => {
  test('GET /health should return 200 OK and healthy status', async () => {
    const res = await request(app).get('/health');
    
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'healthy');
    assert.ok(res.body.timestamp);
    assert.strictEqual(res.body.provider, 'gemini');
  });

  test('POST /api/process-batch should map records successfully', async () => {
    // Mock return payload
    const mockResponseText = JSON.stringify({
      records: [
        {
          row_index: 0,
          created_at: "2026-05-13 14:20:48",
          name: "Alice Smith",
          email: "alice@example.com",
          country_code: "+91",
          mobile_without_country_code: "9876543219",
          company: "",
          city: "",
          state: "",
          country: "",
          lead_owner: "",
          crm_status: "GOOD_LEAD_FOLLOW_UP",
          crm_note: "Original Status: Follow up requested",
          data_source: "eden_park",
          possession_time: "",
          description: ""
        }
      ]
    });

    const mockGenerateContent = mock.fn(async () => {
      return {
        response: {
          text: () => mockResponseText
        }
      };
    });

    const getGenerativeModelMock = mock.method(
      GoogleGenerativeAI.prototype,
      'getGenerativeModel',
      () => {
        return {
          generateContent: mockGenerateContent
        };
      }
    );

    const rawPayload = {
      records: [
        {
          "Full Name": "Alice Smith",
          "Email ID": "alice@example.com",
          "Mobile": "9876543219"
        }
      ]
    };

    const res = await request(app)
      .post('/api/process-batch')
      .send(rawPayload)
      .set('Content-Type', 'application/json');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.processedCount, 1);
    assert.strictEqual(res.body.skippedCount, 0);
    assert.strictEqual(res.body.records[0].name, 'Alice Smith');
    assert.strictEqual(res.body.records[0].data_source, 'eden_park');

    getGenerativeModelMock.mock.restore();
  });

  test('POST /api/process-batch should return 400 Bad Request on validation failure', async () => {
    const invalidPayload = {
      records: [] // Empty array violates ProcessBatchSchema validator (.min(1))
    };

    const res = await request(app)
      .post('/api/process-batch')
      .send(invalidPayload)
      .set('Content-Type', 'application/json');

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error, 'Validation Error');
  });

  test('POST /api/import should accept a valid CSV file upload', async () => {
    // Mock response for the CSV file rows
    const mockResponseText = JSON.stringify({
      records: [
        {
          row_index: 0,
          created_at: "2026-05-13 14:20:48",
          name: "John Doe",
          email: "john@example.com",
          country_code: "+91",
          mobile_without_country_code: "9876543210",
          company: "",
          city: "",
          state: "",
          country: "",
          lead_owner: "",
          crm_status: "GOOD_LEAD_FOLLOW_UP",
          crm_note: "",
          data_source: null,
          possession_time: "",
          description: ""
        }
      ]
    });

    const mockGenerateContent = mock.fn(async () => {
      return {
        response: {
          text: () => mockResponseText
        }
      };
    });

    const getGenerativeModelMock = mock.method(
      GoogleGenerativeAI.prototype,
      'getGenerativeModel',
      () => {
        return {
          generateContent: mockGenerateContent
        };
      }
    );

    const csvContent = 'Name,Email,Phone\nJohn Doe,john@example.com,9876543210';
    const csvBuffer = Buffer.from(csvContent, 'utf-8');

    const res = await request(app)
      .post('/api/import')
      .attach('file', csvBuffer, 'leads.csv');

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.totalImported, 1);
    assert.strictEqual(res.body.totalSkipped, 0);
    assert.strictEqual(res.body.records[0].name, 'John Doe');

    getGenerativeModelMock.mock.restore();
  });
});
