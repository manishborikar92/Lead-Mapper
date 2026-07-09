// Set environment mock before config imports
process.env.GEMINI_API_KEY = 'mock_gemini_api_key_for_testing';
process.env.NODE_ENV = 'test';

import { test, describe, mock } from 'node:test';
import assert from 'node:assert';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiService } from '../../src/features/importer/ai.service';

describe('AI Service Unit Tests', () => {
  test('should successfully call mocked Gemini API and return validated records', async () => {
    // Mock the generateContent result
    const mockResponseText = JSON.stringify({
      records: [
        {
          row_index: 0,
          created_at: "2026-05-13 14:20:48",
          name: "John Doe",
          email: "john.doe@example.com",
          country_code: "+91",
          mobile_without_country_code: "9876543210",
          company: "GrowEasy",
          city: "Mumbai",
          state: "Maharashtra",
          country: "India",
          lead_owner: "test@gmail.com",
          crm_status: "GOOD_LEAD_FOLLOW_UP",
          crm_note: "Client is asking to reschedule demo",
          data_source: "meridian_tower",
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

    // Mock GoogleGenerativeAI prototype method
    const getGenerativeModelMock = mock.method(
      GoogleGenerativeAI.prototype,
      'getGenerativeModel',
      () => {
        return {
          generateContent: mockGenerateContent
        };
      }
    );

    const aiService = new AiService();
    const rawRecords = [
      {
        "Full Name": "John Doe",
        "Email ID": "john.doe@example.com",
        "Mobile": "9876543210"
      }
    ];

    const result = await aiService.processBatch(rawRecords);

    // Verify mocks were invoked
    assert.strictEqual(getGenerativeModelMock.mock.callCount(), 1);
    assert.strictEqual(mockGenerateContent.mock.callCount(), 1);

    // Validate outcomes
    assert.strictEqual(result.records.length, 1);
    assert.strictEqual(result.skipped.length, 0);
    assert.strictEqual(result.records[0].name, 'John Doe');
    assert.strictEqual(result.records[0].crm_status, 'GOOD_LEAD_FOLLOW_UP');
    assert.strictEqual(result.records[0].data_source, 'meridian_tower');

    // Clean up mock methods
    getGenerativeModelMock.mock.restore();
  });

  test('should programmatically filter out and skip records that do not contain email and mobile subscriber number', async () => {
    // Mock return with a record missing both email and mobile
    const mockResponseText = JSON.stringify({
      records: [
        {
          row_index: 0,
          created_at: "2026-05-13 14:20:48",
          name: "Invalid Lead",
          email: "",
          country_code: "",
          mobile_without_country_code: "", // Missing subscriber number!
          company: "",
          city: "",
          state: "",
          country: "",
          lead_owner: "",
          crm_status: null,
          crm_note: "No contact info",
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

    const aiService = new AiService();
    const rawRecords = [
      {
        "Full Name": "Invalid Lead"
      }
    ];

    const result = await aiService.processBatch(rawRecords);

    // Mapped record should be omitted from records and classified as skipped
    assert.strictEqual(result.records.length, 0);
    assert.strictEqual(result.skipped.length, 1);
    assert.strictEqual(result.skipped[0]['Full Name'], 'Invalid Lead');

    getGenerativeModelMock.mock.restore();
  });
});
