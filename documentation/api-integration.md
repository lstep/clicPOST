# API Integration Guide

## Overview

This guide provides comprehensive information for developers who want to create server endpoints that integrate with the clicPOST Chrome extension. The extension sends webpage data via HTTP POST requests to user-configured server endpoints, enabling flexible server-side processing and integration with various services.

The extension supports two types of endpoints:
1. **Remote Server URL** - For storing and processing webpage data
2. **AI Remote URL** - For generating descriptions of webpages using AI services

The API follows RESTful principles with JSON payloads and supports custom headers for authentication and additional metadata.

## API Specification

### Endpoint Requirements

#### HTTP Method
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Expected Response**: JSON (recommended) or plain text

### Endpoint Types

#### 1. Remote Server URL
The primary endpoint for storing and processing webpage data.

#### 2. AI Remote URL
Optional endpoint for generating descriptions of webpages using AI services. When configured, a "Generate description" button appears in the popup.

#### Request Format
```http
POST /your-endpoint HTTP/1.1
Host: your-server.com
Content-Type: application/json
Authorization: Bearer your-token  # Optional custom header
X-Custom-Header: custom-value     # Optional custom headers

{
  "url": "https://example.com/article",
  "title": "Article Title Here",
  "description": "Page description",          # Optional field
  "selected": "User selected text content",   # Optional field
  "tags": "important, work, research"         # Optional field
}
```

#### Request Payload Schema
```javascript
{
  "url": {
    "type": "string",
    "required": true,
    "description": "Full URL of the webpage",
    "example": "https://example.com/article"
  },
  "title": {
    "type": "string", 
    "required": true,
    "description": "Page title from HTML <title> tag",
    "example": "How to Build Chrome Extensions"
  },
  "description": {
    "type": "string",
    "required": false,
    "description": "Optional description of the page",
    "example": "A tutorial about Chrome extension development"
  },
  "selected": {
    "type": "string",
    "required": false,
    "description": "Text selected by user on the page",
    "example": "This is important information..."
  },
  "tags": {
    "type": "string",
    "required": false,
    "description": "Comma-separated tags entered by user",
    "example": "programming, tutorial, chrome"
  },
  "generate_description": {
    "type": "boolean",
    "required": false,
    "description": "Flag indicating this is a request to generate a description (only present in AI Remote URL requests)",
    "example": true
  }
}
```

### Response Format

#### Success Response for Remote Server URL (Recommended)
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "message": "Data processed successfully",
  "id": "unique-record-id",          # Optional
  "url": "/view/record/123"          # Optional
}
```

#### Success Response for AI Remote URL (Required Format)
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "generated_description": "This is an AI-generated description of the webpage content..."
}
```

#### Error Response
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": true,
  "message": "Invalid data format",
  "details": "URL field is required"  # Optional
}
```

#### Alternative Response Formats
```http
# Simple text response (also supported)
HTTP/1.1 200 OK
Content-Type: text/plain

Success: Data saved successfully

# No content response
HTTP/1.1 204 No Content
```

## Implementation Examples

### Node.js with Express
```javascript
const express = require('express');
const app = express();

app.use(express.json());

// CORS for development (adjust for production)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.post('/api/webpage', async (req, res) => {
  try {
    const { url, title, selected, tags } = req.body;
    
    // Validate required fields
    if (!url || !title) {
      return res.status(400).json({
        error: true,
        message: 'URL and title are required'
      });
    }
    
    // Process the data (save to database, etc.)
    const record = await saveWebpageData({
      url,
      title,
      selectedText: selected,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      timestamp: new Date()
    });
    
    res.json({
      success: true,
      message: 'Webpage saved successfully',
      id: record.id
    });
    
  } catch (error) {
    console.error('Error processing webpage:', error);
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Python with Flask
```python
from flask import Flask, request, jsonify
import json
from datetime import datetime

app = Flask(__name__)

@app.route('/api/webpage', methods=['POST'])
def receive_webpage():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('url') or not data.get('title'):
            return jsonify({
                'error': True,
                'message': 'URL and title are required'
            }), 400
        
        # Process the data
        webpage_data = {
            'url': data['url'],
            'title': data['title'],
            'selected_text': data.get('selected'),
            'tags': data.get('tags', '').split(',') if data.get('tags') else [],
            'timestamp': datetime.now().isoformat()
        }
        
        # Save to database (implementation depends on your DB)
        record_id = save_webpage_data(webpage_data)
        
        return jsonify({
            'success': True,
            'message': 'Webpage saved successfully',
            'id': record_id
        })
        
    except Exception as e:
        print(f"Error processing webpage: {e}")
        return jsonify({
            'error': True,
            'message': 'Internal server error'
        }), 500

def save_webpage_data(data):
    # Implement your database saving logic here
    # Return unique record ID
    pass

if __name__ == '__main__':
    app.run(debug=True, port=3000)
```

### Go with Standard Library
```go
package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "strings"
    "time"
)

type WebpageRequest struct {
    URL      string `json:"url"`
    Title    string `json:"title"`
    Selected string `json:"selected,omitempty"`
    Tags     string `json:"tags,omitempty"`
}

type Response struct {
    Success bool   `json:"success,omitempty"`
    Error   bool   `json:"error,omitempty"`
    Message string `json:"message"`
    ID      string `json:"id,omitempty"`
}

func main() {
    http.HandleFunc("/api/webpage", handleWebpage)
    
    fmt.Println("Server starting on :3000")
    log.Fatal(http.ListenAndServe(":3000", nil))
}

func handleWebpage(w http.ResponseWriter, r *http.Request) {
    // Set CORS headers
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Content-Type", "application/json")
    
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }
    
    var req WebpageRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        sendError(w, "Invalid JSON format", http.StatusBadRequest)
        return
    }
    
    // Validate required fields
    if req.URL == "" || req.Title == "" {
        sendError(w, "URL and title are required", http.StatusBadRequest)
        return
    }
    
    // Process the data
    id, err := saveWebpageData(req)
    if err != nil {
        sendError(w, "Failed to save data", http.StatusInternalServerError)
        return
    }
    
    response := Response{
        Success: true,
        Message: "Webpage saved successfully",
        ID:      id,
    }
    
    json.NewEncoder(w).Encode(response)
}

func sendError(w http.ResponseWriter, message string, statusCode int) {
    w.WriteHeader(statusCode)
    response := Response{
        Error:   true,
        Message: message,
    }
    json.NewEncoder(w).Encode(response)
}

func saveWebpageData(req WebpageRequest) (string, error) {
    // Implement your data saving logic here
    // Return unique ID and any error
    return fmt.Sprintf("id_%d", time.Now().Unix()), nil
}
```

## Authentication Examples

### Bearer Token Authentication
```javascript
// Express.js middleware example
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: true,
      message: 'Access token required'
    });
  }
  
  // Verify token (implementation depends on your auth system)
  if (!verifyToken(token)) {
    return res.status(403).json({
      error: true,
      message: 'Invalid or expired token'
    });
  }
  
  next();
};

// Use middleware
app.post('/api/webpage', authenticateToken, handleWebpage);
```

### API Key Authentication
```javascript
// Custom header authentication
app.post('/api/webpage', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || !validateApiKey(apiKey)) {
    return res.status(401).json({
      error: true,
      message: 'Valid API key required'
    });
  }
  
  // Process request...
});
```

### Basic Authentication
```javascript
// Basic auth example
app.post('/api/webpage', (req, res) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({
      error: true,
      message: 'Basic authentication required'
    });
  }
  
  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
  const [username, password] = credentials.split(':');
  
  if (!validateCredentials(username, password)) {
    return res.status(401).json({
      error: true,
      message: 'Invalid credentials'
    });
  }
  
  // Process request...
});
```

## Data Processing Examples

### Obsidian Integration
```javascript
const fs = require('fs').promises;
const path = require('path');

async function saveToObsidian(webpageData) {
  const { url, title, selected, tags } = webpageData;
  const today = new Date().toISOString().split('T')[0];
  const dailyNotePath = path.join(OBSIDIAN_VAULT, `Daily Notes/${today}.md`);
  
  let content = '';
  
  // Check if daily note exists
  try {
    content = await fs.readFile(dailyNotePath, 'utf8');
  } catch (error) {
    // Create new daily note
    content = `# ${today}\n\n## Web Clippings\n\n`;
  }
  
  // Format the webpage entry
  const entry = `
### ${title}
- **URL**: ${url}
- **Tags**: ${tags || 'none'}
- **Saved**: ${new Date().toLocaleString()}

${selected ? `> ${selected}\n` : ''}
---
`;
  
  // Append to daily note
  content += entry;
  await fs.writeFile(dailyNotePath, content);
  
  return { success: true, file: dailyNotePath };
}
```

### Database Integration
```javascript
// PostgreSQL example with pg library
const { Pool } = require('pg');

const pool = new Pool({
  user: 'username',
  host: 'localhost',
  database: 'webclips',
  password: 'password',
  port: 5432,
});

async function saveToDatabase(webpageData) {
  const { url, title, selected, tags } = webpageData;
  
  const query = `
    INSERT INTO webpages (url, title, selected_text, tags, created_at)
    VALUES ($1, $2, $3, $4, NOW())
    RETURNING id
  `;
  
  const values = [
    url,
    title,
    selected || null,
    tags ? tags.split(',').map(t => t.trim()) : []
  ];
  
  const result = await pool.query(query, values);
  return result.rows[0].id;
}
```

### Webhook Integration
```javascript
// Forward data to multiple services
async function processWebhooks(webpageData) {
  const webhooks = [
    'https://hook1.example.com/webhook',
    'https://hook2.example.com/webhook'
  ];
  
  const promises = webhooks.map(webhook =>
    fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webpageData)
    })
  );
  
  const results = await Promise.allSettled(promises);
  
  return results.map((result, index) => ({
    webhook: webhooks[index],
    success: result.status === 'fulfilled',
    error: result.reason?.message
  }));
}
```

## Error Handling Best Practices

### Comprehensive Error Responses
```javascript
app.post('/api/webpage', async (req, res) => {
  try {
    // Validation
    const errors = validateRequest(req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Validation failed',
        details: errors
      });
    }
    
    // Process data
    const result = await processWebpageData(req.body);
    
    res.json({
      success: true,
      message: 'Data processed successfully',
      data: result
    });
    
  } catch (error) {
    console.error('Processing error:', error);
    
    // Different error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: true,
        message: 'Validation error',
        details: error.message
      });
    }
    
    if (error.name === 'DatabaseError') {
      return res.status(500).json({
        error: true,
        message: 'Database error occurred'
      });
    }
    
    // Generic error
    res.status(500).json({
      error: true,
      message: 'Internal server error'
    });
  }
});
```

### Input Validation
```javascript
function validateRequest(data) {
  const errors = [];
  
  // Required fields
  if (!data.url) errors.push('URL is required');
  if (!data.title) errors.push('Title is required');
  
  // URL validation
  if (data.url && !isValidUrl(data.url)) {
    errors.push('Invalid URL format');
  }
  
  // Length validation
  if (data.title && data.title.length > 500) {
    errors.push('Title too long (max 500 characters)');
  }
  
  if (data.selected && data.selected.length > 10000) {
    errors.push('Selected text too long (max 10000 characters)');
  }
  
  return errors;
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
```

## Testing Your Integration

### Manual Testing
```bash
# Test with curl
curl -X POST http://localhost:3000/api/webpage \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "url": "https://example.com",
    "title": "Test Page",
    "selected": "Test selection",
    "tags": "test, development"
  }'
```

### Integration Testing Script
```javascript
// Node.js test script
const fetch = require('node-fetch');

async function testEndpoint() {
  const testData = {
    url: 'https://example.com/test',
    title: 'Test Page Title',
    selected: 'This is selected text',
    tags: 'test, integration'
  };
  
  try {
    const response = await fetch('http://localhost:3000/api/webpage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    console.log('Response:', result);
    console.log('Status:', response.status);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEndpoint();
```

## Deployment Considerations

### HTTPS Requirements
- **Security**: Use HTTPS in production for encrypted data transmission
- **CORS**: Configure appropriate CORS policies for security
- **Certificates**: Ensure valid SSL certificates

### Performance Optimization
- **Response Time**: Keep response times under 5 seconds
- **Rate Limiting**: Implement rate limiting to prevent abuse
- **Caching**: Use appropriate caching strategies
- **Monitoring**: Implement logging and monitoring

### Security Best Practices
- **Input Sanitization**: Sanitize all input data
- **SQL Injection Prevention**: Use parameterized queries
- **XSS Prevention**: Escape output when rendering
- **Authentication**: Implement proper authentication mechanisms
- **Authorization**: Verify user permissions
- **Logging**: Log security events and errors

## Related Documentation

- **[Extension Architecture](./extension-architecture.md)**: Overall system architecture
- **[Popup Component](./popup-component.md)**: Client-side configuration
- **[Background Service](./background-service.md)**: Request handling details
- **[User Guide](./user-guide.md)**: End-user setup instructions
