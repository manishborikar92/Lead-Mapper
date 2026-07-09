import { test, describe } from 'node:test';
import assert from 'node:assert';
import { CsvService } from '../../src/features/importer/csv.service';

describe('CSV Service Unit Tests', () => {
  const csvService = new CsvService();

  test('should parse a valid CSV string into records', async () => {
    const csvContent = `Full Name,Email,Phone
John Doe,john.doe@example.com,9876543210
Sarah Connor,sarah@example.com,9876543211`;

    const records = await csvService.parse(Buffer.from(csvContent));
    
    assert.strictEqual(records.length, 2);
    assert.strictEqual(records[0]['Full Name'], 'John Doe');
    assert.strictEqual(records[0]['Email'], 'john.doe@example.com');
    assert.strictEqual(records[1]['Full Name'], 'Sarah Connor');
    assert.strictEqual(records[1]['Phone'], '9876543211');
  });

  test('should trim surrounding whitespace from keys and values', async () => {
    const csvContent = `  Full Name  ,   Email   , Phone 
  John Doe  ,  john@example.com  ,  9876543210  `;

    const records = await csvService.parse(Buffer.from(csvContent));
    
    assert.strictEqual(records.length, 1);
    assert.ok(records[0]['Full Name']);
    assert.strictEqual(records[0]['Full Name'], 'John Doe');
    assert.strictEqual(records[0]['Email'], 'john@example.com');
    assert.strictEqual(records[0]['Phone'], '9876543210');
  });

  test('should handle rows with uneven column counts gracefully', async () => {
    const csvContent = `Full Name,Email,Phone
John Doe,john@example.com
Sarah Connor,sarah@example.com,9876543211,extra_value`;

    const records = await csvService.parse(Buffer.from(csvContent));
    
    assert.strictEqual(records.length, 2);
    assert.strictEqual(records[0]['Full Name'], 'John Doe');
    assert.strictEqual(records[0]['Email'], 'john@example.com');
    assert.strictEqual(records[0]['Phone'], undefined);
    assert.strictEqual(records[1]['Full Name'], 'Sarah Connor');
  });

  test('should reject malformed or binary non-CSV files', async () => {
    // Malformed CSV (e.g. mismatched quotes or unclosed quotes)
    const malformedContent = `Full Name,Email,Phone
"John Doe,john@example.com,9876543210`;

    await assert.rejects(async () => {
      await csvService.parse(Buffer.from(malformedContent));
    });
  });
});
