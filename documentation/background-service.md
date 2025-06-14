# Background Service Documentation

## Overview

The background service (`background.js`) operates as a Chrome extension service worker that provides persistent functionality and context menu integration for the clicPOST extension. It runs independently of the popup interface and enables users to send webpage data through right-click context menus.

This component handles context menu creation, user interactions outside the popup interface, server communication, and system notifications. It serves as the backbone for seamless data transmission without requiring the popup interface.

## Usage

### Context Menu Integration
- Right-click anywhere on a webpage
- Select "POST send to Server 📤" from the context menu
- Data is automatically sent to the configured server

### Automatic Operations
- Service worker loads automatically when extension starts
- Context menu is created during extension installation
- Handles all context menu interactions transparently

## API / Props / Parameters

### Event Handlers

#### `chrome.runtime.onInstalled.addListener(callback)`
**Purpose**: Initializes extension components on installation/startup
**Parameters**: None (callback function)
**Returns**: None
**Side Effects**: Creates context menu items

#### `chrome.contextMenus.onClicked.addListener(callback)`
**Purpose**: Handles context menu item selection
**Parameters**: 
- `info` (object): Context menu click information
- `tab` (object): Current tab information
**Returns**: None
**Side Effects**: Triggers data transmission to server

### Core Functions

#### Context Menu Creation
```javascript
chrome.contextMenus.create({
  id: 'sendToServer',
  title: 'POST send to Server 📤',
  contexts: ['all']
});
```

#### Data Collection and Transmission
**Input Sources**:
- `tab.url`: Current page URL
- `tab.title`: Page title  
- `info.selectionText`: Selected text (when available)

**Output Format**:
```javascript
{
  url: string,        // Current tab URL
  title: string,      // Page title
  selected?: string   // Selected text (optional)
}
```

### Chrome API Integration

#### Storage API Usage
```javascript
chrome.storage.sync.get(['serverUrl', 'headers'], callback)
```
- Retrieves persistent configuration
- Accesses server URL and custom headers
- Validates configuration before operations

#### Notifications API Usage
```javascript
chrome.notifications.create({
  type: 'basic',
  iconUrl: 'icon.png',
  title: 'Success/Error',
  message: 'Operation result message'
});
```

## Component Hierarchy

```
background.js (Service Worker)
├── Chrome Runtime API
│   └── onInstalled Event Handler
├── Chrome Context Menus API
│   ├── Context Menu Creation
│   └── Click Event Handling
├── Chrome Storage API
│   └── Settings Retrieval
├── Chrome Tabs API
│   └── Current Tab Information
├── Chrome Notifications API
│   └── User Feedback
└── Fetch API
    └── Server Communication
```

## State Management

### Persistent State
- **No Local State**: Service worker is stateless
- **Configuration**: Retrieved from Chrome storage on demand
- **Settings**: Managed by popup component, consumed by background service

### Event-Driven Architecture
1. **Installation**: Context menu created
2. **Context Menu Click**: Event triggered
3. **Settings Retrieval**: Configuration loaded from storage
4. **Data Collection**: Tab and selection information gathered
5. **Server Communication**: HTTP POST request sent
6. **User Feedback**: Notification displayed

### State Flow Diagram
```
Extension Install → Context Menu Created
                           ↓
User Right-Click → Context Menu Displayed
                           ↓
Menu Item Click → Settings Retrieved → Data Collected → Server Request → Notification
```

## Behavior

### Expected Behavior in Different Scenarios

#### Normal Operation with Configuration
1. User right-clicks on webpage
2. Context menu appears with "POST send to Server 📤" option
3. User selects menu item
4. Data is collected and sent to configured server
5. Success notification appears

#### First Use (No Configuration)
1. User right-clicks and selects context menu
2. Error logged: "Server URL not configured"
3. No notification displayed
4. User must configure through popup first

#### With Text Selection
1. User selects text on webpage
2. Right-clicks within selection
3. Selects context menu item
4. Selected text is included in payload
5. Success notification mentions "Text sent successfully"

#### Without Text Selection
1. User right-clicks on page (no text selected)
2. Selects context menu item
3. Only URL and title are sent
4. Success notification mentions "Page sent successfully"

### Error Handling Scenarios

#### Network Errors
- Request timeout or connection failure
- Error notification displayed
- Error logged to console for debugging

#### Server Errors
- HTTP error status codes (4xx, 5xx)
- Response text displayed in error notification
- Detailed error information logged

#### Configuration Errors
- Missing server URL
- Invalid server URL format
- Silent failure with console logging

## Error Handling

### Error Detection and Handling

#### Network Error Handling
```javascript
.catch(error => {
  console.error('Network error:', error);
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Network Error',
    message: 'Failed to connect to server. Please check your connection.'
  });
});
```

#### Server Error Handling
```javascript
if (!response.ok) {
  const errorText = await response.text();
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Server Error',
    message: `Server responded with error: ${response.status}`
  });
}
```

#### Configuration Error Handling
```javascript
if (!result.serverUrl) {
  console.error('Server URL not configured');
  // Silent failure - user should configure through popup
  return;
}
```

### Error Recovery Strategies
- **Automatic Retry**: Not implemented (by design - avoid spam)
- **User Notification**: Clear error messages guide user action
- **Graceful Degradation**: Missing configuration doesn't crash extension
- **Logging**: Comprehensive console logging for debugging

## Performance Considerations

### Service Worker Optimization
- **Event-Driven**: Only active during user interactions
- **Stateless Design**: No persistent memory usage
- **Minimal CPU**: Dormant when not in use
- **Quick Startup**: Minimal initialization overhead

### Network Efficiency
- **Single Request**: One HTTP POST per operation
- **Minimal Payload**: Only essential data transmitted
- **No Polling**: Event-driven, no unnecessary requests
- **Error Boundaries**: Failed requests don't affect extension stability

### Chrome Extension Performance
- **Service Worker Lifecycle**: Proper event handling for worker termination/restart
- **Memory Management**: No memory leaks due to stateless design
- **Background Processing**: Minimal impact on browser performance

## Accessibility

### Context Menu Accessibility
- **Keyboard Access**: Context menu accessible via keyboard shortcuts
- **Screen Reader Support**: Context menu items properly labeled
- **Clear Labeling**: Descriptive menu item text with emoji for visual identification

### Notification Accessibility
- **Screen Reader Compatible**: Notifications work with assistive technologies
- **Clear Messaging**: Success/error states clearly communicated
- **Non-Intrusive**: Notifications don't interrupt user workflow

## Testing

### Manual Testing Procedures

#### Context Menu Testing
1. **Installation Test**
   - Install extension → context menu should appear
   - Right-click on various page elements → menu should be available

2. **Functionality Test**
   - Configure server URL in popup
   - Right-click and select menu item → should send data
   - Check server logs for received data

3. **Selection Test**
   - Select text on page
   - Right-click within selection → should include selected text
   - Verify server receives selection data

#### Error Condition Testing
1. **No Configuration**
   - Fresh install without server URL
   - Use context menu → should handle gracefully

2. **Network Errors**
   - Configure invalid server URL
   - Use context menu → should display error notification

3. **Server Errors**
   - Configure server that returns errors
   - Use context menu → should display server error message

### Automated Testing Strategy
```javascript
// Example test structure for service worker testing
describe('Background Service Worker', () => {
  beforeEach(() => {
    // Mock Chrome APIs
    global.chrome = mockChrome;
  });

  it('should create context menu on installation', () => {
    // Test context menu creation
  });

  it('should handle context menu clicks correctly', () => {
    // Test event handling
  });

  it('should send correct data format', () => {
    // Test data transmission
  });
});
```

### Integration Testing
- **Cross-Component**: Test background service with popup settings
- **Chrome API**: Verify proper integration with Chrome extension APIs
- **Server Integration**: End-to-end testing with actual server

## Related Components/Features

### Primary Relationships
- **[Popup Component](./popup-component.md)**: Provides configuration consumed by background service
- **[Extension Manifest](./extension-manifest.md)**: Defines permissions and service worker configuration

### Chrome API Dependencies
- **Chrome Runtime**: Extension lifecycle management
- **Chrome Context Menus**: User interaction interface
- **Chrome Storage**: Configuration retrieval
- **Chrome Tabs**: Current page data access
- **Chrome Notifications**: User feedback system

### External Dependencies
- **Server Endpoint**: Receives and processes transmitted data
- **Network Stack**: HTTP communication layer

## Advanced Usage Examples

### Custom Header Integration
```javascript
// Headers configured in popup are automatically included
const headers = {
  'Content-Type': 'application/json',
  ...result.headers  // Custom headers from storage
};
```

### Handling Different Content Types
```javascript
// Different notification messages based on content type
const message = info.selectionText 
  ? 'Text sent successfully' 
  : 'Page sent successfully';
```

### Error Logging for Debugging
```javascript
// Comprehensive error logging
console.error('Send failed:', {
  error: error.message,
  serverUrl: result.serverUrl,
  tabUrl: tab.url,
  hasSelection: !!info.selectionText
});
```

### Notification Customization
```javascript
// Dynamic notification content based on operation result
chrome.notifications.create({
  type: 'basic',
  iconUrl: 'icon.png',
  title: response.ok ? 'Success' : 'Error',
  message: response.ok 
    ? `Sent to ${new URL(result.serverUrl).hostname}`
    : `Failed: ${response.status} ${response.statusText}`
});
```
