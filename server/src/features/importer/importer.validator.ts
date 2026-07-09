import { z } from 'zod';

const CrmStatusEnum = z.enum([
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE'
]);

const DataSourceEnum = z.enum([
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots'
]);

// Validator for the mapped records returned by AI/services
export const MappedRecordSchema = z.object({
  row_index: z.number().int().optional(),
  created_at: z.string().refine(
    (val) => {
      const timestamp = Date.parse(val);
      return !isNaN(timestamp);
    },
    { message: 'created_at must be convertible to a valid Date' }
  ),
  name: z.string().default(''),
  email: z.string().default(''),
  country_code: z.string().default(''),
  mobile_without_country_code: z.string().default(''),
  company: z.string().default(''),
  city: z.string().default(''),
  state: z.string().default(''),
  country: z.string().default(''),
  lead_owner: z.string().default(''),
  // Map empty string or other values to null
  crm_status: z.preprocess(
    (val) => (val === '' || val === undefined ? null : val),
    CrmStatusEnum.nullable().default(null)
  ),
  crm_note: z.string().default(''),
  data_source: z.preprocess(
    (val) => (val === '' || val === undefined ? null : val),
    DataSourceEnum.nullable().default(null)
  ),
  possession_time: z.string().default(''),
  description: z.string().default('')
});

// Validator for POST /api/process-batch request body
export const ProcessBatchSchema = z.object({
  records: z.array(z.record(z.string(), z.any())).min(1, 'Records batch cannot be empty')
});
