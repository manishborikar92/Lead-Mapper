# Lead-Mapper Sample CSV Data Registry

This directory contains realistic sample CSV files for testing, covering diverse layouts, formats, and structural edge cases to verify the robust performance of the AI CSV Importer.

---

## Sample CSV File Registry

### 1. [facebook_leads.csv](file:///c:/Users/manis/Projects/Lead-Mapper/docs/sample-data/facebook_leads.csv)
* **Description**: Simulates a standard Facebook Ads Lead Form CSV export.
* **Key Columns**: `created_time`, `full_name`, `email`, `phone_number`, `company_name`.
* **Verification Scope**:
  * Verify that raw campaign timestamps (e.g. `2026-05-13T14:20:48Z`) are parsed into Date-compatible created_at strings.
  * Verify that phone numbers containing spaces/special symbols (e.g. `+91 98765 43211`) are normalized to local subscriber strings and country codes (`+91` and `9876543211`).
  * Verify that column synonyms like `full_name` and `phone_number` map correctly to `name` and `mobile_without_country_code`.

### 2. [google_ads.csv](file:///c:/Users/manis/Projects/Lead-Mapper/docs/sample-data/google_ads.csv)
* **Description**: Simulates Google Ads offline conversion upload/export format.
* **Key Columns**: `Conversion Time`, `Name`, `Email`, `Phone`, `Company`, `City`, `State`, `Country`.
* **Verification Scope**:
  * Verify that location fields (`City`, `State`, `Country`) are parsed and mapped.
  * Verify that the date structure `YYYY-MM-DD HH:MM:SS` is processed.

### 3. [real_estate.csv](file:///c:/Users/manis/Projects/Lead-Mapper/docs/sample-data/real_estate.csv)
* **Description**: Mimics standard CRM exports from property portal websites.
* **Key Columns**: `Primary Email`, `Mobile No.`, `Project Interested`, `Possession Timeline`, `Inquiry Status`, `Lead Owner`, `Customer Note`.
* **Verification Scope**:
  * **Status Enums**: Verify raw inquiry status strings map to target statuses (e.g. "Follow up requested" => `GOOD_LEAD_FOLLOW_UP`, "Booking completed" => `SALE_DONE`, "Junk lead" => `BAD_LEAD`, "Busy will call back" => `DID_NOT_CONNECT`).
  * **Source Enums**: Verify "Project Interested" maps to standard GrowEasy data sources (e.g. "Meridian Tower" => `meridian_tower`, "Eden Park" => `eden_park`, "Varah Swamy" => `varah_swamy`, "Sarjapur Plots" => `sarjapur_plots`).
  * **Lead Owner**: Verify owner emails match.
  * **CRM Note**: Verify "Customer Note" maps to `crm_note`.

### 4. [messy_spreadsheet.csv](file:///c:/Users/manis/Projects/Lead-Mapper/docs/sample-data/messy_spreadsheet.csv)
* **Description**: Simulates messy manually entered Excel/Spreadsheet data.
* **Key Columns**: `Who is this?`, `Email ID`, `Ph Number`, `When?`, `Remarks`.
* **Verification Scope**:
  * Verify AI maps column synonyms like `Who is this?` to `name` and `Email ID` to `email`.
  * Verify parsing of unusual date strings (e.g. `15-May-2026`, `May 16 2026`) into standard timestamps.
  * Verify mapping of raw remarks into `crm_note`.

### 5. [edge_cases.csv](file:///c:/Users/manis/Projects/Lead-Mapper/docs/sample-data/edge_cases.csv)
* **Description**: Hard edge-case verification CSV.
* **Key Columns**: `Name`, `Email`, `Phone`, `Date`, `Notes`.
* **Verification Scope**:
  * **Multiple Emails**: `john1@example.com; john2@example.com` -> `email` should receive `john1@example.com`, and `[Emails: john2@example.com]` should be appended to `crm_note`.
  * **Multiple Phones**: `+91 96666 66666 / +91 96666 66667` -> `mobile_without_country_code` should receive `9666666666`, and `[Phones: +919666666667]` should be appended to `crm_note`.
  * **Row Skipping**: The row `Sarah NoContact` contains neither email nor phone number. Verify that this row is completely omitted by the importer.
  * **Single Contact (Keep)**: Verify that rows with only email (and no phone) or only phone (and no email) are successfully imported.
  * **Swapped Columns**: The row `Swapped Lead` has phone numbers in the Email column and email in the Phone column. Verify that the AI identifies this and corrects it!
