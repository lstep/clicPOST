# clicPOST Extension Architecture Documentation

## Overview

clicPOST is a Chrome browser extension designed to facilitate seamless transmission of webpage data to remote servers. The extension employs a modern Chrome Manifest V3 architecture with a service worker-based background script, popup interface, and comprehensive Chrome API integration.

The extension enables users to capture and send webpage URLs, titles, and selected text through two primary interaction methods: a toolbar popup interface for configuration and direct sending, and a right-click context menu for quick operations.

## System Architecture

### High-Level Architecture Diagram
```
┌─────────────────────────────────────────────────────┐
│                    Chrome Browser                   │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌──────────────┐              │
│  │   Popup     │◄───┤   Toolbar    │              │
│  │ Interface   │    │    Icon      │              │
│  │ (popup.js)  │    └──────────────┘              │
│  └─────────────┘                                   │
│         │                                          │
│         ▼                                          │
│  ┌─────────────────────────────────────────────┐   │
│  │         Chrome Storage API                  │   │
│  │      (Settings Persistence)                 │   │
│  └─────────────────────────────────────────────┘   │
│         ▲                    ▲                     │
│         │                    │                     │
│  ┌─────────────┐    ┌─────────────────┐           │
│  │  Background │    │  Context Menu   │           │
│  │   Service   │◄───┤   Integration   │           │
│  │(background.js)│    └─────────────────┘           │
│  └─────────────┘                                   │
│         │                                          │
└─────────┼──────────────────────────────────────────┘
          ▼
┌─────────────────────────────────────────────────────┐
│                 Remote Server                      │
│              (User-Configured)                     │
└─────────────────────────────────────────────────────┘
```

### Core Components

#### 1. Popup Interface (`popup.js` + `popup.html`)
- **Purpose**: Primary user interface for configuration and direct operations
- **Responsibilities**:
  - Server URL configuration
  - Custom headers management
  - Tags input and management
  - Direct data transmission
  - Settings persistence
  - User feedback and status display

#### 2. Background Service Worker (`background.js`)
- **Purpose**: Persistent background functionality and context menu integration
- **Responsibilities**:
  - Context menu creation and management
  - Alternative data transmission pathway
  - System notifications
  - Event-driven operations
  - Chrome API coordination

#### 3. Extension Manifest (`manifest.json`)
- **Purpose**: Extension configuration and permissions declaration
- **Key Configurations**:
  - Manifest V3 compliance
  - Required permissions
  - Service worker registration
  - Icon and metadata

## Data Flow Architecture

### Primary Data Flow (Popup Interface)
```
User Interaction → Popup Opens → Settings Loaded
                                       ↓
                    User Configures Settings
                                       ↓
                    Settings Saved to Chrome Storage
                                       ↓
User Clicks Send → Current Tab Data Collected → Content Script Injection
                                       ↓
                    Selected Text Extracted (if any)
                                       ↓
                    Data Package Created → HTTP POST Request
                                       ↓
                    Server Response → User Feedback → Popup Remains Open
```

### Secondary Data Flow (Context Menu)
```
User Right-Click → Context Menu Displayed → Menu Item Selected
                                                    ↓
                         Settings Retrieved from Chrome Storage
                                                    ↓
                         Current Tab Data Collected
                                                    ↓
                         Selected Text Included (if any)
                                                    ↓
                         HTTP POST Request → Server Response
                                                    ↓
                         System Notification → Operation Complete
```

## Technical Architecture

### Chrome Extension APIs Integration

#### Storage API
```javascript
// Configuration persistence
chrome.storage.sync.get(['serverUrl', 'headers', 'tags'])
chrome.storage.sync.set({serverUrl, headers, tags})
```

#### Tabs API
```javascript
// Current page data access
chrome.tabs.query({active: true, currentWindow: true})
```

#### Scripting API
```javascript
// Content script injection for text selection
chrome.scripting.executeScript({
  target: {tabId: tab.id},
  function: getSelectedText
})
```

#### Context Menus API
```javascript
// Right-click menu integration
chrome.contextMenus.create({
  id: 'sendToServer',
  title: 'POST send to Server 📤',
  contexts: ['all']
})
```

#### Notifications API
```javascript
// User feedback system
chrome.notifications.create({
  type: 'basic',
  iconUrl: 'icon.png',
  title: 'Success',
  message: 'Data sent successfully'
})
```

### Security Architecture

#### Permissions Model
- **`tabs`**: Access current tab information
- **`storage`**: Persist user settings
- **`activeTab`**: Access active tab content
- **`scripting`**: Inject content scripts for text selection
- **`contextMenus`**: Create right-click menu items
- **`<all_urls>`**: Send data to any user-configured server

#### Data Security
- **Local Storage**: Settings stored in Chrome's secure storage
- **HTTPS Enforcement**: User-configured servers should use HTTPS
- **No Data Persistence**: No local caching of transmitted data
- **User Control**: Complete user control over server endpoints

#### Privacy Considerations
- **Explicit User Action**: Data sent only on explicit user request
- **No Background Transmission**: No automatic data collection
- **User-Configured Endpoints**: No hardcoded external services
- **Minimal Data Collection**: Only URL, title, and user-selected text

## Error Handling Architecture

### Error Types and Handling Strategies

#### Configuration Errors
```
Missing Server URL → User-friendly validation message
Invalid URL Format → Input validation and feedback
Empty Headers → Graceful handling, optional validation
```

#### Network Errors
```
Connection Timeout → Retry suggestion and error notification
DNS Resolution → Clear error message with troubleshooting
SSL/TLS Errors → Security warning and recommendation
```

#### Server Errors
```
HTTP 4xx → Client error notification with status code
HTTP 5xx → Server error notification
Invalid Response → Fallback error handling
```

#### Chrome API Errors
```
Permission Denied → Console logging, graceful degradation
API Unavailable → Feature degradation, user notification
Tab Access Error → Silent failure with logging
```

## Performance Architecture

### Resource Optimization
- **Service Worker**: Event-driven, minimal resource usage
- **Popup Interface**: Lightweight, loads only when needed
- **Network Requests**: Single POST per operation
- **Memory Management**: Stateless design, automatic cleanup

### Scalability Considerations
- **Concurrent Requests**: Single request per user action
- **Rate Limiting**: User-controlled interaction frequency
- **Server Load**: Minimal, user-initiated requests only
- **Browser Performance**: Negligible impact on browsing

## Extension Lifecycle

### Installation and Initialization
1. **Extension Install**: Chrome Web Store or developer mode
2. **Manifest Processing**: Chrome parses extension configuration
3. **Service Worker Registration**: Background script activated
4. **Context Menu Creation**: Right-click menu item added
5. **Icon Display**: Extension icon appears in toolbar

### Runtime Operations
1. **Service Worker Dormancy**: Background script sleeps when idle
2. **Event Activation**: User interactions wake service worker
3. **Popup Loading**: Interface loads on icon click
4. **Settings Synchronization**: Chrome storage sync across devices
5. **Resource Cleanup**: Automatic cleanup after operations

### Update and Maintenance
1. **Automatic Updates**: Chrome Web Store distribution
2. **Settings Preservation**: User configuration maintained
3. **Backward Compatibility**: Graceful handling of setting migrations
4. **Error Recovery**: Robust error handling for update scenarios

## Integration Architecture

### Server Integration Requirements

#### API Endpoint Specification
```javascript
POST /your-endpoint
Content-Type: application/json

{
  "url": "https://example.com/page",
  "title": "Page Title",
  "selected": "Selected text content",  // Optional
  "tags": "tag1, tag2, tag3"           // Optional
}
```

#### Server Response Handling
```javascript
// Success Response (200 OK)
{
  "success": true,
  "message": "Data processed successfully"
}

// Error Response (4xx/5xx)
{
  "error": true,
  "message": "Error description"
}
```

#### Custom Headers Support
```javascript
// User-configured headers included in requests
{
  "Authorization": "Bearer token123",
  "X-Custom-Header": "custom-value",
  "Content-Type": "application/json"  // Always included
}
```

### Plugin Ecosystem Integration

#### Obsidian Plugin Integration
- **Daily Notes**: Automatic webpage archiving
- **Tag Support**: Categorization and organization
- **Link Preservation**: Maintain reference links

#### Custom Plugin Development
- **Server-side Processing**: Flexible data transformation
- **Multiple Endpoints**: Route to different services
- **Data Enrichment**: Add metadata and processing

## Testing Architecture

### Component Testing Strategy
- **Unit Tests**: Individual function testing
- **Integration Tests**: Chrome API interaction testing
- **End-to-End Tests**: Complete user workflow testing

### Testing Considerations
- **Chrome Extension Environment**: Specialized testing setup required
- **Chrome API Mocking**: Mock Chrome APIs for testing
- **Server Integration**: Test with mock and real servers
- **Error Condition Testing**: Comprehensive error scenario coverage

## Deployment Architecture

### Distribution Methods
1. **Chrome Web Store**: Official distribution channel
2. **Developer Mode**: Manual installation for development
3. **Enterprise Deployment**: Corporate policy deployment

### Configuration Management
- **Default Settings**: Sensible defaults for first use
- **Settings Migration**: Backward compatibility handling
- **Cross-Device Sync**: Chrome account synchronization

## Future Architecture Considerations

### Scalability Enhancements
- **Batch Operations**: Multiple page sending
- **Queue Management**: Offline operation queuing
- **Sync Improvements**: Better cross-device synchronization

### Security Enhancements
- **API Key Management**: Secure credential storage
- **Encryption**: End-to-end data encryption
- **Certificate Pinning**: Enhanced server validation

### Feature Extensions
- **Content Processing**: Client-side data transformation
- **Template System**: Customizable data formats
- **Webhook Support**: Real-time server notifications
- **Analytics Integration**: Usage metrics and insights

## Related Documentation

- **[Popup Component](./popup-component.md)**: Detailed popup interface documentation
- **[Background Service](./background-service.md)**: Service worker implementation details
- **[Extension Manifest](./extension-manifest.md)**: Configuration and permissions
- **[API Integration](./api-integration.md)**: Server integration guide
- **[User Guide](./user-guide.md)**: End-user instructions
- **[Developer Guide](./developer-guide.md)**: Development and customization
