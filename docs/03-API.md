# 03 — API Specification

### Status: **ARCHITECTURE FROZEN**

---

## 1. Endpoints Overview

The backend exposes three principal endpoints:

| Endpoint | Method | Description | Auth |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | Server health status check. | None |
| `/api/process-batch` | `POST` | Processes a batch of raw records via AI mapping. | None |
| `/api/import` | `POST` | Direct CSV file upload and processing. | None |

---

## 2. Endpoint Details

### `GET /health`
Verifies server health and active AI provider state.
* **Response Headers**: `Content-Type: application/json`
* **Response Body (`200 OK`)**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-07-09T18:00:00.000Z",
    "uptime": 123.45,
    "provider": "gemini-2.5-flash"
  }
  ```

### `POST /api/process-batch`
Primary ingestion route. Maps and validates a raw chunk of CSV records.
* **Request Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "records": [
      {
        "Full Name": "Jane Doe",
        "E-mail Address": "jane.doe@example.com",
        "Phone": "+91 98765 43210",
        "Status": "Follow up requested",
        "Property Name": "Meridian Tower",
        "Date Entered": "2026-05-13 14:20:48"
      }
    ]
  }
  ```
* **Response Headers**: `Content-Type: application/json`
* **Response Body (`200 OK`)**:
  ```json
  {
    "success": true,
    "processedCount": 1,
    "skippedCount": 0,
    "records": [
      {
        "created_at": "2026-05-13 14:20:48",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "country_code": "+91",
        "mobile_without_country_code": "9876543210",
        "company": "",
        "city": "",
        "state": "",
        "country": "",
        "lead_owner": "",
        "crm_status": "GOOD_LEAD_FOLLOW_UP",
        "crm_note": "Original Status: Follow up requested. Primary phone: +91 98765 43210",
        "data_source": "meridian_tower",
        "possession_time": "",
        "description": ""
      }
    ],
    "skipped": []
  }
  ```

### `POST /api/import`
Uploads a binary CSV file directly. Parses and maps in a single operation.
* **Request Headers**: `Content-Type: multipart/form-data`
* **Request Body**:
  * `file`: (Binary CSV file)
* **Response Headers**: `Content-Type: application/json`
* **Response Body (`200 OK`)**:
  ```json
  {
    "success": true,
    "totalImported": 1,
    "totalSkipped": 0,
    "records": [ ... ],
    "skipped": []
  }
  ```

---

## 3. Error Schemas

The API uses a consistent error response format.

### `400 Bad Request`
Fires when parameters are missing, malformed, or violate validation guards.
```json
{
  "success": false,
  "error": "Validation Error",
  "details": [
    {
      "field": "records",
      "message": "Required parameter is missing or empty"
    }
  ]
}
```

### `500 Internal Server Error`
Fires when unexpected execution errors occur or the LLM provider fails.
```json
{
  "success": false,
  "error": "Internal Server Error",
  "details": "Timeout connection or rate limit reached from generative AI endpoint"
}
```
