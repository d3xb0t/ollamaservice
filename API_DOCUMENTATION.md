# ChatBot API Specification

## Overview

This document provides a detailed specification of the ChatBot API, which enables interaction with Ollama-powered AI models. The API follows REST principles and provides a single endpoint for sending prompts to the AI and receiving responses.

## API Endpoint

```
POST /
```

### Description

Sends a text prompt to the Ollama-powered AI chatbot and returns the generated response.

### Request

#### Headers

| Header       | Required | Value              | Description           |
|--------------|----------|--------------------|-----------------------|
| Content-Type | Yes      | application/json   | Specifies JSON format |

#### Body

The request body must be a JSON object with the following structure:

```json
{
  "prompt": "string"
}
```

##### Fields

| Field  | Type   | Required | Constraints                         | Description                     |
|--------|--------|----------|-------------------------------------|---------------------------------|
| prompt | string | Yes      | 1-4096 characters, not whitespace-only | The user's prompt for the AI model |

#### Example Request

```bash
curl -X POST http://localhost:3000/ \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?"}'
```

```javascript
fetch('http://localhost:3000/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'Hello, how are you?'
  })
})
```

### Response

#### Success Response (200 OK)

When the request is successful, the API returns a 200 status code with a JSON response:

```json
{
  "model": "qwen3:0.6b",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "message": {
    "role": "assistant",
    "content": "I'm doing well, thank you for asking!"
  },
  "done": true,
  "totalDuration": 1234567890,
  "loadDuration": 123456789,
  "promptEvalCount": 5
}
```

##### Fields

| Field            | Type    | Description                                           |
|------------------|---------|-------------------------------------------------------|
| model            | string  | The AI model used for the response                    |
| createdAt        | string  | ISO 8601 timestamp of when the response was created   |
| message          | object  | Contains the role and content of the response         |
| message.role     | string  | Role of the responder (always "assistant")            |
| message.content  | string  | The content of the AI response                        |
| done             | boolean | Indicates if the response is complete                 |
| totalDuration    | number  | Total duration of the request in nanoseconds          |
| loadDuration     | number  | Duration of loading the model in nanoseconds          |
| promptEvalCount  | number  | Number of tokens evaluated in the prompt              |

#### Error Responses

##### Bad Request (400 Bad Request)

Returned when the request body is invalid or contains forbidden content:

```json
{
  "error": "Contenido no permitido",
  "message": "El prompt contiene patrones bloqueados por seguridad (jailbreak, etc.)."
}
```

Or for validation errors:

```json
{
  "status": "error",
  "error": "Invalid request body",
  "details": [
    {
      "field": "prompt",
      "message": "El campo \"prompt\" es obligatorio."
    }
  ]
}
```

##### Service Unavailable (503 Service Unavailable)

Returned when the Ollama service is not available:

```json
{
  "status": "error",
  "error": "Ollama, Service Unavailable: connect ECONNREFUSED 127.0.0.1:11434"
}
```

##### Rate Limit Exceeded (429 Too Many Requests)

Returned when the rate limit is exceeded:

```json
{
  "error": "Límite de solicitudes excedido",
  "message": "Has realizado demasiadas solicitudes. Por favor, espera un momento."
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- Maximum 20 requests per IP address per minute
- Exceeding this limit results in a 429 status code

## Security Features

### Input Validation

All inputs are validated using Zod schema validation:
- Prompt must be a string
- Length between 1 and 4096 characters
- Cannot consist only of whitespace

### Forbidden Patterns

The API checks prompts against a list of forbidden patterns to prevent jailbreak attempts:
- ignore previous / ignore all instructions
- jailbreak / bypass
- system prompt / reveal your instructions
- act as / pretend to be
- unleash / developer mode
- dan (developer mode references)

### CORS Policy

Cross-Origin Resource Sharing is configured to only allow requests from:
- http://localhost:5173

## Error Handling

The API implements comprehensive error handling:
1. Validation errors are caught and returned with detailed information
2. Connection errors to Ollama are handled gracefully
3. All errors are logged and audited
4. Error responses follow a consistent format

## Traceability

Each request is assigned a unique request ID:
- Included in response headers as `X-Request-ID`
- Used in all log entries for request tracking
- Stored in audit logs for debugging purposes

## Audit Logging

All requests are automatically logged with:
- Request ID
- Timestamp
- HTTP method and URL
- Request headers, body, query parameters
- Client IP address and user agent
- Response status code and response time

Error requests are additionally logged with:
- Error details (name, message, stack trace)
- Status code
- Full request information

## Performance Considerations

1. Rate limiting prevents resource exhaustion
2. Connection pooling for database and message queue
3. Asynchronous processing for non-blocking operations
4. Efficient JSON parsing and generation

## Integration Points

1. **Ollama Service**: AI model processing
2. **MongoDB**: Audit and error logging
3. **RabbitMQ**: Message queuing for audit data
4. **File System**: Log file storage

## Monitoring and Debugging

1. Request tracing via unique IDs
2. Comprehensive logging at multiple levels
3. Error auditing with full context
4. Health checks through standard responses
5. Log rotation to prevent disk space issues

## Example Usage

### Basic Chat Interaction

```javascript
const response = await fetch('http://localhost:3000/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt: 'What is the weather like today?' })
});

const data = await response.json();
console.log(data.message.content);
```

### Error Handling

```javascript
try {
  const response = await fetch('http://localhost:3000/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: '' }) // Invalid empty prompt
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.error);
  }
} catch (err) {
  console.error('Network Error:', err);
}
```