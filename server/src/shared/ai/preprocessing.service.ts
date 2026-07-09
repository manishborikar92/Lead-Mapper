import { CRMRecord, CRMStatus, DataSource } from '../../features/importer/types.js';
import { ConfidenceBand, PreprocessedRecord, PreprocessingResult } from './types.js';

// Synonyms map for fuzzy matching
const SYNONYMS: Record<keyof CRMRecord, string[]> = {
  row_index: [],
  created_at: ['created_at', 'created_time', 'time', 'date', 'inquiry date', 'when', 'timestamp'],
  name: ['name', 'full_name', 'customer_name', 'who is this', 'client_name', 'prospect'],
  email: ['email', 'email_id', 'primary_email', 'email_address', 'mail', 'primary_email_address'],
  country_code: ['country_code', 'code'],
  mobile_without_country_code: ['mobile_without_country_code', 'phone', 'phone_number', 'mobile', 'mobile no', 'ph number', 'contact', 'contact_cell', 'cell', 'cell_phone'],
  company: ['company', 'company_name', 'organization', 'org'],
  city: ['city', 'location', 'town'],
  state: ['state', 'region', 'province'],
  country: ['country', 'nation'],
  lead_owner: ['lead_owner', 'owner', 'agent', 'assigned to'],
  crm_status: ['crm_status', 'status', 'inquiry_status', 'lead_status'],
  crm_note: ['crm_note', 'note', 'customer_note', 'remarks', 'notes', 'comments', 'remarks_notes'],
  data_source: ['data_source', 'source', 'project', 'project_interested'],
  possession_time: ['possession_time', 'possession_timeline', 'timeline'],
  description: ['description', 'details', 'desc']
};

export class PreprocessingService {
  /**
   * Computes the Levenshtein distance between two strings.
   */
  private static getLevenshteinDistance(a: string, b: string): number {
    const tmp = [];
    for (let i = 0; i <= a.length; i++) { tmp[i] = [i]; }
    for (let j = 0; j <= b.length; j++) { tmp[0][j] = j; }
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        tmp[i][j] = Math.min(
          tmp[i - 1][j] + 1,
          tmp[i][j - 1] + 1,
          tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
      }
    }
    return tmp[a.length][b.length];
  }

  /**
   * Determines if a raw header matches a target key using exact and fuzzy matching.
   */
  private static matchHeader(rawHeader: string, targetKey: keyof CRMRecord): boolean {
    const header = rawHeader.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const synonyms = SYNONYMS[targetKey];
    if (!synonyms) return false;

    for (const syn of synonyms) {
      const normalizedSyn = syn.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (header === normalizedSyn) {
        return true;
      }
      const dist = this.getLevenshteinDistance(header, normalizedSyn);
      const maxLength = Math.max(header.length, normalizedSyn.length);
      const similarity = 1 - dist / maxLength;
      if (similarity > 0.85) {
        return true;
      }
    }
    return false;
  }

  /**
   * Identifies the header mapping index mappings for a parsed CSV dataset.
   */
  public static mapHeaders(rawHeaders: string[]): Record<string, keyof CRMRecord | null> {
    const mapping: Record<string, keyof CRMRecord | null> = {};
    
    rawHeaders.forEach((header) => {
      let matchedKey: keyof CRMRecord | null = null;
      for (const key of Object.keys(SYNONYMS) as Array<keyof CRMRecord>) {
        if (this.matchHeader(header, key)) {
          matchedKey = key;
          break;
        }
      }
      mapping[header] = matchedKey;
    });

    return mapping;
  }

  /**
   * Preprocesses a batch of raw records, partitioning them into confidence bands.
   */
  public static preprocess(rawRecords: Record<string, any>[]): PreprocessingResult {
    if (rawRecords.length === 0) {
      return { records: [], confidence: 'High' };
    }

    const rawHeaders = Object.keys(rawRecords[0]);
    const headerMap = this.mapHeaders(rawHeaders);
    
    const preprocessed: PreprocessedRecord[] = [];
    const seenContacts = new Set<string>();

    rawRecords.forEach((row, idx) => {
      // 1. Map row fields to a raw CRM record
      const mappedRecord: Partial<CRMRecord> = {
        row_index: idx
      };

      Object.entries(row).forEach(([header, val]) => {
        const key = headerMap[header];
        if (key && val !== undefined && val !== null) {
          (mappedRecord as any)[key] = String(val).trim();
        }
      });

      // 2. Normalize and check values
      let confidence: ConfidenceBand = 'High';
      
      // A. Contact details normalization
      const email = (mappedRecord.email || '').trim();
      const phoneRaw = (mappedRecord.mobile_without_country_code || '').trim();

      // Check if multiple emails or phones are present
      if (email.includes(';') || email.includes(',') || email.includes('/')) {
        confidence = 'Medium'; // Requires AI splitting
      }
      if (phoneRaw.includes('/') || phoneRaw.includes(';') || phoneRaw.includes(',')) {
        confidence = 'Medium'; // Requires AI splitting
      }

      // Check for swapped columns or irregular formats
      const emailColHasAt = email.includes('@');
      const phoneColHasDigits = phoneRaw.replace(/[^0-9]/g, '').length >= 7;

      // Scan all cells in the row to support swapped column scenarios
      const rowValues = Object.values(row).map(v => String(v).trim());
      const hasEmailInRow = rowValues.some(v => v.includes('@'));
      const hasPhoneInRow = rowValues.some(v => v.replace(/[^0-9]/g, '').length >= 7);

      if (!hasEmailInRow && !hasPhoneInRow) {
        // High confidence to skip
        preprocessed.push({ record: row, confidence: 'High', mappedRecord: undefined });
        return;
      }

      if ((email.length > 0 && !emailColHasAt) || (phoneRaw.length > 0 && !phoneColHasDigits)) {
        confidence = 'Medium'; // Send to AI Gateway for swapped column restoration
      }

      const hasEmail = emailColHasAt;
      const hasPhone = phoneColHasDigits;

      // Phone normalization regex
      if (hasPhone && confidence === 'High') {
        const cleanedPhone = phoneRaw.replace(/[^0-9+]/g, '');
        if (cleanedPhone.startsWith('+')) {
          // Has country code
          if (cleanedPhone.startsWith('+91')) {
            mappedRecord.country_code = '+91';
            mappedRecord.mobile_without_country_code = cleanedPhone.substring(3);
          } else {
            mappedRecord.country_code = cleanedPhone.substring(0, 3);
            mappedRecord.mobile_without_country_code = cleanedPhone.substring(3);
          }
        } else {
          // No country code, check Indian length
          const digits = phoneRaw.replace(/[^0-9]/g, '');
          if (digits.length === 10) {
            mappedRecord.country_code = '+91';
            mappedRecord.mobile_without_country_code = digits;
          } else if (digits.length === 12 && digits.startsWith('91')) {
            mappedRecord.country_code = '+91';
            mappedRecord.mobile_without_country_code = digits.substring(2);
          } else {
            mappedRecord.country_code = '';
            mappedRecord.mobile_without_country_code = digits;
          }
        }
      }

      // B. Date normalization
      const rawDate = mappedRecord.created_at || '';
      if (rawDate) {
        const parsedTime = Date.parse(rawDate);
        if (!isNaN(parsedTime)) {
          const d = new Date(parsedTime);
          mappedRecord.created_at = d.toISOString().replace('T', ' ').slice(0, 19);
        } else {
          confidence = 'Medium'; // Unstructured date format -> AI mapping
        }
      } else {
        // Default to now
        const d = new Date();
        mappedRecord.created_at = d.toISOString().replace('T', ' ').slice(0, 19);
      }

      // C. Status mapping enums
      const statusRaw = (mappedRecord.crm_status || '').toLowerCase().replace(/[^a-z]/g, '');
      if (statusRaw) {
        if (statusRaw.includes('follow') || statusRaw.includes('progress') || statusRaw.includes('active')) {
          mappedRecord.crm_status = 'GOOD_LEAD_FOLLOW_UP';
        } else if (statusRaw.includes('busy') || statusRaw.includes('notconnect') || statusRaw.includes('noanswer')) {
          mappedRecord.crm_status = 'DID_NOT_CONNECT';
        } else if (statusRaw.includes('junk') || statusRaw.includes('bad') || statusRaw.includes('notinterested') || statusRaw.includes('wrong')) {
          mappedRecord.crm_status = 'BAD_LEAD';
        } else if (statusRaw.includes('sale') || statusRaw.includes('done') || statusRaw.includes('complete') || statusRaw.includes('closed')) {
          mappedRecord.crm_status = 'SALE_DONE';
        } else {
          confidence = 'Medium'; // Irregular status wording -> AI mapping
          mappedRecord.crm_status = null;
        }
      } else {
        mappedRecord.crm_status = null;
      }

      // D. Data Source enums
      const sourceRaw = (mappedRecord.data_source || '').toLowerCase().replace(/[^a-z]/g, '');
      if (sourceRaw) {
        if (sourceRaw.includes('demand') || sourceRaw.includes('leadsondemand')) {
          mappedRecord.data_source = 'leads_on_demand';
        } else if (sourceRaw.includes('meridian')) {
          mappedRecord.data_source = 'meridian_tower';
        } else if (sourceRaw.includes('eden')) {
          mappedRecord.data_source = 'eden_park';
        } else if (sourceRaw.includes('varah')) {
          mappedRecord.data_source = 'varah_swamy';
        } else if (sourceRaw.includes('sarjapur')) {
          mappedRecord.data_source = 'sarjapur_plots';
        } else {
          confidence = 'Medium'; // Irregular source -> AI mapping
          mappedRecord.data_source = null;
        }
      } else {
        mappedRecord.data_source = null;
      }

      // Duplicate detection
      const contactKey = `${email || ''}_${mappedRecord.mobile_without_country_code || ''}`;
      if (email.length > 0 || (mappedRecord.mobile_without_country_code || '').length > 0) {
        if (seenContacts.has(contactKey)) {
          // Duplicate found, mark as medium confidence for AI note merging
          confidence = 'Medium';
          mappedRecord.crm_note = `[Duplicate Lead] ${mappedRecord.crm_note || ''}`.trim();
        } else {
          seenContacts.add(contactKey);
        }
      }

      // Default fields
      mappedRecord.name = mappedRecord.name || '';
      mappedRecord.email = email;
      mappedRecord.company = mappedRecord.company || '';
      mappedRecord.city = mappedRecord.city || '';
      mappedRecord.state = mappedRecord.state || '';
      mappedRecord.country = mappedRecord.country || '';
      mappedRecord.lead_owner = mappedRecord.lead_owner || '';
      mappedRecord.crm_note = mappedRecord.crm_note || '';
      mappedRecord.possession_time = mappedRecord.possession_time || '';
      mappedRecord.description = mappedRecord.description || '';

      // If critical headers (Name) were not matched at all, flag as Low confidence
      const hasNameMatched = rawHeaders.some(h => headerMap[h] === 'name');
      if (!hasNameMatched) {
        confidence = 'Low';
      }

      preprocessed.push({
        record: row,
        confidence,
        mappedRecord: mappedRecord as CRMRecord
      });
    });

    // Determine overall batch confidence
    let overallConfidence: ConfidenceBand = 'High';
    const confCounts = { High: 0, Medium: 0, Low: 0 };
    preprocessed.forEach(r => confCounts[r.confidence]++);

    if (confCounts.Low > 0) {
      overallConfidence = 'Low';
    } else if (confCounts.Medium > 0) {
      overallConfidence = 'Medium';
    }

    return {
      records: preprocessed,
      confidence: overallConfidence
    };
  }
}
