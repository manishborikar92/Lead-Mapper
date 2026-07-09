import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CsvService } from '../src/features/importer/csv.service.js';
import { ExtractionPipeline } from '../src/shared/ai/extraction-pipeline.js';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_DIR = path.resolve(__dirname, './sample-data');
const csvFiles = [
  'facebook_leads.csv',
  'google_ads.csv',
  'real_estate.csv',
  'messy_spreadsheet.csv',
  'edge_cases.csv'
];

async function verifyAll() {
  console.log('=== STARTING LIVE API VERIFICATION FOR LEAD-MAPPER ===\n');
  
  const csvService = new CsvService();

  for (const filename of csvFiles) {
    const filepath = path.join(SAMPLE_DIR, filename);
    console.log(`----------------------------------------------------------------`);
    console.log(`Processing File: ${filename}`);
    
    try {
      const content = await fs.readFile(filepath, 'utf-8');
      const rawRecords = await csvService.parse(content);
      console.log(`Parsed ${rawRecords.length} raw records from CSV.`);
      
      console.log('Calling Gemini AI Live API to map columns...');
      const start = Date.now();
      const outcome = await ExtractionPipeline.process(rawRecords);
      const duration = ((Date.now() - start) / 1000).toFixed(2);
      console.log(`Gemini responded in ${duration}s.`);
      
      console.log(`\nImport Outcome:`);
      console.log(` - Successfully Mapped: ${outcome.records.length}`);
      console.log(` - Programmatically Skipped: ${outcome.skipped.length}`);
      
      console.log('\nMapped Records:');
      outcome.records.forEach((rec: any, idx: number) => {
        console.log(`  [Lead ${idx + 1}] Name: "${rec.name}", Email: "${rec.email}", Phone: "${rec.country_code} ${rec.mobile_without_country_code}", Source: "${rec.data_source}", Status: "${rec.crm_status}"`);
        if (rec.crm_note) {
          console.log(`    Note: "${rec.crm_note}"`);
        }
      });
      
      if (outcome.skipped.length > 0) {
        console.log('\nSkipped Records:');
        outcome.skipped.forEach((skip: any, idx: number) => {
          console.log(`  [Skipped ${idx + 1}] ${JSON.stringify(skip)}`);
        });
      }
      
      // Save output JSON
      const outputDir = path.join(SAMPLE_DIR, 'output');
      await fs.mkdir(outputDir, { recursive: true });
      const outputFilename = filename.replace('.csv', '_output.json');
      const outputPath = path.join(outputDir, outputFilename);
      await fs.writeFile(outputPath, JSON.stringify(outcome, null, 2), 'utf-8');
      console.log(`\nSaved live response output to: server/tests/sample-data/output/${outputFilename}`);

      // Perform automated checks/assertions on the results
      validateOutcome(filename, outcome);
      
    } catch (err: any) {
      console.error(`[ERROR] Failed to process ${filename}:`, err.message);
    }
    
    // Sleep 15 seconds between files to respect the Gemini Free Tier rate limits (5 RPM)
    if (filename !== csvFiles[csvFiles.length - 1]) {
      console.log('Sleeping 15 seconds to avoid Gemini rate limits...\n');
      await new Promise((r) => setTimeout(r, 15000));
    }
    console.log(`----------------------------------------------------------------\n`);
  }
}

function validateOutcome(filename: string, outcome: any) {
  console.log('\n[Validation Checks]');
  let passed = true;

  if (filename === 'facebook_leads.csv') {
    if (outcome.records.length !== 4) {
      console.log(' ❌ Fail: Expected exactly 4 mapped leads, got', outcome.records.length);
      passed = false;
    } else {
      console.log(' ✅ Pass: Exactly 4 leads mapped.');
    }
  }

  if (filename === 'real_estate.csv') {
    const statuses = outcome.records.map((r: any) => r.crm_status);
    const sources = outcome.records.map((r: any) => r.data_source);
    
    // Check if correct sources mapped
    const expectedSources = ['meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots'];
    const sourcesCorrect = expectedSources.every(s => sources.includes(s));
    if (sourcesCorrect) {
      console.log(' ✅ Pass: All data sources mapped correctly to enums.');
    } else {
      console.log(' ❌ Fail: Missing expected data sources from list:', sources);
      passed = false;
    }

    // Check status mapping
    const expectedStatuses = ['GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE'];
    const statusesCorrect = expectedStatuses.every(s => statuses.includes(s));
    if (statusesCorrect) {
      console.log(' ✅ Pass: All CRM statuses mapped correctly to enums.');
    } else {
      console.log(' ❌ Fail: Missing expected CRM statuses from list:', statuses);
      passed = false;
    }
  }

  if (filename === 'edge_cases.csv') {
    // Check that Sarah NoContact is skipped
    const sarahSkipped = outcome.skipped.some((s: any) => s.Name === 'Sarah NoContact' || s.Name?.includes('NoContact'));
    if (sarahSkipped) {
      console.log(' ✅ Pass: "Sarah NoContact" row skipped programmatically due to missing email/phone.');
    } else {
      console.log(' ❌ Fail: "Sarah NoContact" was not skipped or was mapped incorrectly.');
      passed = false;
    }

    // Check swapped email/phone row is corrected
    const swapped = outcome.records.find((r: any) => r.name === 'Swapped Lead');
    if (swapped) {
      if (swapped.email === 'swapped@example.com' && swapped.mobile_without_country_code === '9666666669') {
        console.log(' ✅ Pass: Column-swapped lead was corrected.');
      } else {
        console.log(' ❌ Fail: Swapped Lead was mapped but fields were not corrected:', swapped);
        passed = false;
      }
    } else {
      console.log(' ❌ Fail: Swapped Lead was not mapped.');
      passed = false;
    }

    // Check multiple emails / multiple phones
    const multi = outcome.records.find((r: any) => r.name === 'John Multi');
    if (multi) {
      const emailPass = multi.email === 'john1@example.com' && multi.crm_note.includes('john2@example.com');
      const phonePass = multi.mobile_without_country_code === '9666666666' && multi.crm_note.replace(/\s+/g, '').includes('9666666667');
      if (emailPass && phonePass) {
        console.log(' ✅ Pass: Multiple emails and phones mapped correctly, with secondary values appended to crm_note.');
      } else {
        console.log(' ❌ Fail: Multiple contacts parsing failed:', multi);
        passed = false;
      }
    }
  }

  if (passed) {
    console.log(' ✨ FILE VALIDATION STATUS: PASSED');
  } else {
    console.log(' 🚨 FILE VALIDATION STATUS: FAILED');
  }
}

verifyAll().catch(err => {
  console.error('Execution failed:', err);
});
