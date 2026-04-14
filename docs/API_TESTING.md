# Chapter 6: API Testing and Execution

To complete your internship report, you can use the following structured data. Since you need images (Fig 6.4 - Fig 6.7) for your report, use the provided JSON payloads to test in Postman and capture the screenshots, or you can paste these code blocks directly if your university allows code snippets instead of images.

### Fig 6.4 API Testing (Postman)
*Note: To create the screenshot for your report, open Postman, set the method to `POST`, URL to `http://localhost:5000/api/ingest`, add the JSON body below in the "Raw" tab, and click Send.*

**Request Setup in Postman:**
*   **Method:** `POST`
*   **URL:** `http://localhost:5000/api/ingest` / `http://localhost:5000/api/logs`
*   **Headers:** `Content-Type: application/json`
*   **Body (Raw JSON):**
```json
{
  "type": "NETWORK",
  "message": "Multiple failed SSH login attempts detected from unknown host.",
  "ipAddress": "192.168.1.105",
  "severity": "HIGH",
  "endpoint": "/ssh/auth"
}
```

---

### Fig 6.5 API Endpoints Response
*Note: This is the typical JSON response structure when querying multiple endpoints like getting all logs (`GET /api/logs`) or alerts.*

**Request:** `GET http://localhost:5000/api/logs?limit=2`

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "661cfdf7b1f3bb2c4d123456",
      "type": "NETWORK",
      "message": "Multiple failed SSH login attempts detected from unknown host.",
      "ipAddress": "192.168.1.105",
      "severity": "HIGH",
      "endpoint": "/ssh/auth",
      "createdAt": "2026-04-14T10:15:30.000Z",
      "__v": 0
    },
    {
      "_id": "661cfdf7b1f3bb2c4d123457",
      "type": "SYSTEM",
      "message": "CPU utilization exceeded 95% on worker node.",
      "ipAddress": "10.0.0.12",
      "severity": "MEDIUM",
      "endpoint": "/system/metrics",
      "createdAt": "2026-04-14T09:45:10.000Z",
      "__v": 0
    }
  ]
}
```

---

### Fig 6.6 API Success Response (200 OK)
*Note: Take a screenshot focusing on the `200 OK` status code in Postman (right-hand side) along with this standard response body.*

**HTTP Status:** `200 OK`
**Time:** `42 ms`

**JSON Output:**
```json
{
  "success": true,
  "message": "Log successfully ingested and processed.",
  "data": {
    "logId": "661cfdf7b1f3bb2c4d123456",
    "threatDetected": true,
    "alertGenerated": true
  }
}
```

---

### Fig 6.7 API Schema / JSON Structure
*Note: This represents the database schema and expected JSON structure for a standard Log metric in the SOC SIEM Dashboard. You can present this in your report as the backend data model.*

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Log Schema",
  "type": "object",
  "properties": {
    "_id": {
      "type": "string",
      "description": "MongoDB ObjectID"
    },
    "type": {
      "type": "string",
      "enum": ["AUTH", "NETWORK", "SYSTEM", "API", "FIREWALL", "EXTERNAL"],
      "description": "Category of the log event"
    },
    "message": {
      "type": "string",
      "maxLength": 1000,
      "description": "Human-readable description of the event"
    },
    "ipAddress": {
      "type": "string",
      "maxLength": 64,
      "description": "Source IP address of the generated event"
    },
    "severity": {
      "type": "string",
      "enum": ["HIGH", "MEDIUM", "LOW"],
      "description": "Importance level of the log"
    },
    "endpoint": {
      "type": "string",
      "maxLength": 256,
      "description": "API or system endpoint from where the event triggered"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 Timestamp of event creation"
    }
  },
  "required": ["type", "message", "ipAddress", "severity"]
}
```