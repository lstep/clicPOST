# Popup Component Documentation

## Overview

The popup component (`popup.js`) serves as the streamlined user interface for the clicPOST Chrome extension. It focuses on the primary action of sending webpage data with tags, while configuration options for server settings and custom headers have been moved to a dedicated options page. The popup appears when users click the extension icon in the Chrome toolbar.

This component manages user settings persistence, dynamic header configuration, and provides immediate feedback for user actions through status messages and visual indicators.

## Usage

### Opening the Popup
- Click the clicPOST extension icon in Chrome's toolbar
- The popup interface will load and display saved settings automatically

### Basic Usage
```javascript
// Example tags for categorization
tags: "important, work, research"
```

### Accessing Options
1. Click "Settings" button to open the options page
2. Configure server URL and custom headers in the options page
3. Settings are saved through the options page

## API / Props / Parameters

### Main Functions

#### `sendUrlAndClose()`
**Purpose**: Triggers the send operation and closes the popup
**Parameters**: None
**Returns**: None
**Usage**: Called when Enter key is pressed in tags input



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
  tags: string         // Comma-separated tags
}

// Server URL and headers are now configured in the options page
```
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
popup.js (Streamlined Interface)
├── Chrome Storage API (Tags Persistence)
├── Chrome Tabs API (Current Tab Data)
├── Chrome Scripting API (Content Script Injection)
├── Chrome Runtime API (Options Page Access)
└── DOM Manipulation
    ├── Tags Input
    ├── Send Button
    └── Status Display
```

## State Management

### Persistent State (Chrome Storage)
- **tags**: Tag string in `chrome.storage.sync`
- **serverUrl**: Managed by options page, accessed from `chrome.storage.sync`
- **headers**: Managed by options page, accessed from `chrome.storage.sync`

### Transient State (DOM/Memory)
- Current tags field value
- Status message display
- Loading states

### State Flow
1. **Load**: Tags loaded from Chrome storage on popup open
2. **Modify**: User changes tags value
3. **Send**: Current tab data + settings sent to server
4. **Save**: Tags persisted to Chrome storage
5. **Feedback**: Status displayed to user

## Behavior

### Expected Behavior in Different Scenarios

#### First Use (No Saved Settings)
- Empty tags field
- User should configure server URL in options page first
- Status message will indicate need for server configuration

#### Normal Operation
- Saved tags auto-populate on popup open
- Send button collects all data and sends to server
- Settings button opens options page for configuration
- Status messages provide immediate feedback

#### Error Conditions
- Missing server URL: Shows error "Please enter a valid URL"
- Network failure: Shows error "Failed to send data"
- No selected text: Sends page data without selection
- Invalid server response: Shows error message

### User Interaction Flows

#### Configuration Flow
1. User opens popup
2. Clicks "Settings" button
3. Options page opens
4. User configures server URL and custom headers
5. Clicks "Save Settings" in options page
6. Returns to popup for sending operation

#### Send Data Flow
1. User navigates to interesting webpage
2. Optionally selects text on page
3. Opens popup (tags pre-filled if previously used)
4. Optionally modifies tags
5. Clicks "Send URL"
6. Receives success/error feedback
7. Popup automatically closes on success

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
- [`options.js`](./options-component.md) - Settings management interface
- [`options.html`](./options-interface.md) - Options page HTML structure
- [`manifest.json`](./extension-manifest.md) - Extension configuration

### Integration Points
- **Chrome Storage API**: Tags persistence
- **Chrome Tabs API**: Current page data retrieval
- **Chrome Scripting API**: Content script injection for text selection
- **Chrome Runtime API**: Options page opening
- **Remote Server API**: POST endpoint for data transmission

### Extension Architecture
```
User Interface (popup.js) ←→ Background Service (background.js)
         ↓                              ↓
   Chrome Storage API              Context Menu API
         ↓                              ↓
 Options Interface (options.js)   Alternative Send Method
         ↓
   Settings Configuration
```

## Code Examples

### Opening the Options Page
```javascript
// Open the options page programmatically
document.getElementById('openOptions').addEventListener('click', function() {
  chrome.runtime.openOptionsPage();
});
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
