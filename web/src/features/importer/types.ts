export type CRMStatus =
  | 'GOOD_LEAD_FOLLOW_UP'
  | 'DID_NOT_CONNECT'
  | 'BAD_LEAD'
  | 'SALE_DONE';

export type DataSource =
  | 'leads_on_demand'
  | 'meridian_tower'
  | 'eden_park'
  | 'varah_swamy'
  | 'sarjapur_plots';

export interface CRMRecord {
  row_index?: number;
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: CRMStatus | null;
  crm_note: string;
  data_source: DataSource | null;
  possession_time: string;
  description: string;
}

export type ImportStep = 'upload' | 'preview' | 'importing' | 'results';

export interface ImportProgress {
  status: 'idle' | 'importing' | 'completed' | 'failed';
  message: string;
}
