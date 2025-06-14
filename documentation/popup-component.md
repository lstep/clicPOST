# Popup Component Documentation

## Overview

The popup component (`popup.js`) serves as the primary user interface for the clicPOST Chrome extension. It provides configuration options for server settings, custom headers, and tags, while also enabling users to send webpage data to a configured remote server. The popup appears when users click the extension icon in the Chrome toolbar.

This component manages user settings persistence, dynamic header configuration, and provides immediate feedback for user actions through status messages and visual indicators.

## Usage

### Opening the Popup
- Click the clicPOST extension icon in Chrome's toolbar
- The popup interface will load and display saved settings automatically

### Basic Configuration
```javascript
// Example server URL configuration
serverUrl: "https://your-server.com/api/endpoint"

// Example tags for categorization
tags: "important, work, research"
```

### Adding Custom Headers
1. Click "Add Header" button
2. Enter header name and value
3. Multiple headers can be added dynamically
4. Headers are saved with other settings

## API / Props / Parameters

### Main Functions

#### `sendUrlAndClose()`
**Purpose**: Triggers the send operation and closes the popup
**Parameters**: None
**Returns**: None
**Usage**: Called when Enter key is pressed in tags input

#### `addHeaderRow(name = '', value = '')`
**Purpose**: Dynamically adds a new header input row to the interface
**Parameters**:
- `name` (string, optional): Pre-filled header name
- `value` (string, optional): Pre-filled header value
**Returns**: None
**Side Effects**: Creates new DOM elements for header input

#### `showStatus(message, type)`
**Purpose**: Displays status messages to the user
**Parameters**:
- `message` (string): The message to display
- `type` (string): Message type ('success', 'error', 'info')
**Returns**: None
**Side Effects**: Updates DOM with styled status message

### Data Structures

#### Settings Object
```javascript
{
  serverUrl: string,    // Target server endpoint
  headers: [            // Array of custom headers
    {
      name: string,     // Header name
      value: string     // Header value
    }
  ],
  tags: string         // Comma-separated tags
}
```

#### Send Data Payload
```javascript
{
  url: string,         // Current tab URL
  title: string,       // Page title
  selected: string,    // Selected text (if any)
  tags: string        // User-defined tags
}
```

## Component Hierarchy

```
popup.js (Main Controller)
├── Chrome Storage API (Settings Persistence)
├── Chrome Tabs API (Current Tab Data)
├── Chrome Scripting API (Content Script Injection)
├── HTTP Fetch API (Server Communication)
└── DOM Manipulation
    ├── Header Management
    ├── Settings Form
    └── Status Display
```

## State Management

### Persistent State (Chrome Storage)
- **serverUrl**: Stored in `chrome.storage.sync`
- **headers**: Array of header objects in `chrome.storage.sync`
- **tags**: Tag string in `chrome.storage.sync`

### Transient State (DOM/Memory)
- Current form field values
- Dynamic header rows
- Status message display
- Loading states

### State Flow
1. **Load**: Settings loaded from Chrome storage on popup open
2. **Modify**: User changes form values
3. **Save**: Settings persisted to Chrome storage
4. **Send**: Current tab data + settings sent to server
5. **Feedback**: Status displayed to user

## Behavior

### Expected Behavior in Different Scenarios

#### First Use (No Saved Settings)
- Empty server URL field
- No headers displayed
- Empty tags field
- Save button saves minimal configuration

#### Normal Operation
- Saved settings auto-populate on popup open
- Add Header button creates new header rows
- Send button collects all data and sends to server
- Status messages provide immediate feedback

#### Error Conditions
- Missing server URL: Shows error "Please enter a valid URL"
- Network failure: Shows error "Failed to send data"
- No selected text: Sends page data without selection
- Invalid server response: Shows error message

### User Interaction Flows

#### Configuration Flow
1. User opens popup
2. Enters server URL
3. Optionally adds custom headers
4. Optionally adds tags
5. Clicks "Save Settings"
6. Receives confirmation message

#### Send Data Flow
1. User navigates to interesting webpage
2. Optionally selects text on page
3. Opens popup (settings pre-filled)
4. Optionally modifies tags
5. Clicks "Send Selected Text/URL"
6. Receives success/error feedback
7. Popup remains open for additional actions

## Error Handling

### Client-Side Errors
- **Empty Server URL**: Validation prevents sending, shows user-friendly error
- **Network Errors**: Caught by fetch promise rejection, displays network error message
- **Chrome API Errors**: Console logging for debugging, graceful degradation

### Server-Side Errors
- **HTTP Error Responses**: Status codes handled, error message displayed to user
- **Invalid Response Format**: Fallback error handling for unexpected responses

### Error Recovery
- Status messages auto-hide after 3 seconds
- Users can retry operations immediately
- Settings persist through error conditions

```javascript
// Error handling pattern
.catch(error => {
  console.error('Send failed:', error);
  showStatus('Failed to send data. Please check your server URL and try again.', 'error');
});
```

## Performance Considerations

### Optimization Notes
- **Chrome Storage**: Minimal data stored, efficient sync across devices
- **DOM Manipulation**: Event delegation used where appropriate
- **Network Requests**: Single fetch per send operation
- **Memory Usage**: Popup closes after use, no persistent memory footprint

### Performance Characteristics
- **Load Time**: ~50ms for settings retrieval and UI population
- **Send Operation**: Network-dependent, typically 100-1000ms
- **Memory Footprint**: Minimal, cleaned up on popup close
- **Battery Impact**: Negligible, operates only during user interaction

## Accessibility

### Accessibility Features
- **Keyboard Navigation**: Tab order follows logical flow
- **Enter Key Support**: Tags input accepts Enter for quick sending
- **Focus Management**: Proper focus handling for dynamic elements
- **Screen Reader Support**: Semantic HTML structure

### Compliance
- Follows Chrome extension accessibility guidelines
- Compatible with common screen readers
- Keyboard-only operation supported

## Testing

### Manual Testing Checklist
1. **Settings Persistence**
   - Save settings, close popup, reopen → settings should persist
   - Test with various server URLs and header combinations

2. **Header Management**
   - Add multiple headers → UI should update correctly
   - Remove headers → settings should update
   - Save/reload → headers should persist

3. **Send Functionality**
   - Send with selected text → server should receive selection
   - Send without selection → server should receive page data
   - Test with various tag combinations

4. **Error Conditions**
   - Invalid server URL → should show error
   - Network disconnection → should handle gracefully
   - Server error responses → should display appropriate message

### Automated Testing Approach
```javascript
// Example test structure for future implementation
describe('Popup Component', () => {
  beforeEach(() => {
    // Mock Chrome APIs
    // Load popup in test environment
  });

  it('should load saved settings on initialization', () => {
    // Test settings loading
  });

  it('should save settings to Chrome storage', () => {
    // Test settings persistence
  });

  it('should send correct data format to server', () => {
    // Test data transmission
  });
});
```

## Related Components/Features

### Direct Dependencies
- [`background.js`](./background-service.md) - Service worker handling context menu and notifications
- [`popup.html`](./popup-interface.md) - HTML structure and styling
- [`manifest.json`](./extension-manifest.md) - Extension configuration

### Integration Points
- **Chrome Storage API**: Settings persistence
- **Chrome Tabs API**: Current page data retrieval
- **Chrome Scripting API**: Content script injection for text selection
- **Remote Server API**: POST endpoint for data transmission

### Extension Architecture
```
User Interface (popup.js) ←→ Background Service (background.js)
         ↓                              ↓
   Chrome Storage API              Context Menu API
         ↓                              ↓
   Settings Persistence        Alternative Send Method
```

## Code Examples

### Adding a Custom Header Programmatically
```javascript
// Add a new header row with pre-filled values
addHeaderRow('Authorization', 'Bearer your-token-here');
```

### Handling Custom Server Response
```javascript
fetch(serverUrl, {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(result => {
  if (result.success) {
    showStatus('Data sent successfully!', 'success');
  } else {
    showStatus(result.message || 'Server error', 'error');
  }
});
```

### Validating Settings Before Save
```javascript
function validateSettings(serverUrl, headers) {
  if (!serverUrl.match(/^https?:\/\/.+/)) {
    throw new Error('Please enter a valid HTTP/HTTPS URL');
  }
  
  headers.forEach(header => {
    if (!header.name.trim()) {
      throw new Error('Header name cannot be empty');
    }
  });
}
```
