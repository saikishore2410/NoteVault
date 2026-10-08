# QA Test Case Scenarios

## API validation
| ID | Scenario | Expected |
|---|---|---|
| NV-API-01 | POST /api/chat with valid message | 200 response with reply payload |
| NV-API-02 | POST /api/chat with empty/invalid message | 400 with validation error |
| NV-API-03 | Non-POST request to POST-only API | 405 Method Not Allowed |
| NV-API-04 | POST /api/search-grounding with valid query | 200 response with summary/model |
| NV-API-05 | Missing query/prompt/image/audio/operationName | 400 validation response |
| NV-API-06 | OPTIONS preflight for CORS endpoint | 200 with CORS headers |
| NV-API-07 | Gemini key unset or whitespace-only | Health reports aiConfigured=false |
| NV-API-08 | Downstream Gemini failure/quota error | 500 with sanitized actionable error |

## Media and integration
| ID | Scenario | Expected |
|---|---|---|
| NV-MED-01 | Video generation with prompt | Operation name returned |
| NV-MED-02 | Video status with missing operation | 400 |
| NV-MED-03 | Video download before completion | 404, no crash |
| NV-MED-04 | OCR with data-URL image | Base64 prefix is stripped before Gemini call |
| NV-WS-01 | WebSocket client disconnects | Gemini session is closed without server crash |

## Security
| ID | Scenario | Expected |
|---|---|---|
| NV-SEC-01 | Client sends oversized JSON | Request is rejected safely |
| NV-SEC-02 | API error contains provider credentials | Response does not expose secret values |
| NV-SEC-03 | Missing API key | Server remains bootable and reports configuration failure clearly |
