# Developer Guide

## Overview

This guide is for developers who want to contribute to, modify, or extend the clicPOST Chrome extension. It covers the development environment setup, coding standards, architecture patterns, and contribution guidelines.

## Development Environment Setup

### Prerequisites
- **Node.js** (v16 or higher) for build tools and testing
- **Google Chrome** (latest stable version)
- **Git** for version control
- **Code Editor** (VS Code recommended with Chrome extension tools)

### Project Setup
```bash
# Clone the repository
git clone https://github.com/your-username/clicPOST.git
cd clicPOST

# Install development dependencies (if any)
npm install  # Only if package.json exists

# Load extension in Chrome
# 1. Open Chrome and go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select the project directory
```

### Development Tools
```bash
# Recommended VS Code extensions
code --install-extension ms-vscode.vscode-chrome-debug
code --install-extension bradlc.vscode-tailwindcss  # If using Tailwind
code --install-extension esbenp.prettier-vscode

# Chrome DevTools for extensions
# Navigate to chrome://extensions/ and click "Inspect views: background page"
```

## Project Structure

```
clicPOST/
├── manifest.json           # Extension configuration
├── popup.html             # Popup interface HTML
├── popup.js               # Popup logic and UI handling
├── background.js          # Service worker (background script)
├── icon.png              # Extension icon
├── screenshots/          # Demo screenshots
├── documentation/        # Comprehensive documentation
│   ├── README.md
│   ├── user-guide.md
│   ├── developer-guide.md
│   ├── api-integration.md
│   ├── extension-architecture.md
│   ├── popup-component.md
│   └── background-service.md
├── .windsurf/            # Windsurf workflows
│   └── workflows/
└── README.md             # Project overview
```

### File Responsibilities

#### Core Extension Files
- **`manifest.json`**: Extension metadata, permissions, and configuration
- **`popup.html`**: User interface structure and styling
- **`popup.js`**: UI logic, settings management, and data transmission
- **`background.js`**: Service worker for context menu and background operations

#### Documentation Files
- **`documentation/`**: Complete technical and user documentation
- **`README.md`**: Project overview and quick start guide

## Architecture Patterns

### Chrome Extension Architecture (Manifest V3)
```javascript
// Service Worker Pattern (background.js)
chrome.runtime.onInstalled.addListener(() => {
  // Initialize extension components
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Handle user interactions
});

// Popup Interface Pattern (popup.js)
document.addEventListener('DOMContentLoaded', function() {
  // Initialize UI
  loadSettings();
  attachEventHandlers();
});

// Settings Management Pattern
chrome.storage.sync.get(['key'], function(result) {
  // Handle settings
});
```

### Data Flow Patterns
```javascript
// Settings Persistence Pattern
async function saveSettings(settings) {
  try {
    await chrome.storage.sync.set(settings);
    showStatus('Settings saved successfully', 'success');
  } catch (error) {
    showStatus('Failed to save settings', 'error');
  }
}

// HTTP Request Pattern
async function sendToServer(data) {
  try {
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...customHeaders
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Send failed:', error);
    throw error;
  }
}
```

### Error Handling Patterns
```javascript
// User-Friendly Error Display
function showStatus(message, type) {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.className = `status ${type}`;
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusElement.textContent = '';
    statusElement.className = 'status';
  }, 3000);
}

// Comprehensive Error Handling
async function handleOperation(operation) {
  try {
    await operation();
  } catch (error) {
    console.error('Operation failed:', error);
    
    if (error.name === 'NetworkError') {
      showStatus('Network connection failed', 'error');
    } else if (error.name === 'ValidationError') {
      showStatus(error.message, 'error');
    } else {
      showStatus('An unexpected error occurred', 'error');
    }
  }
}
```

## Coding Standards

### JavaScript Style Guide
```javascript
// Use modern JavaScript features
const config = await chrome.storage.sync.get(['serverUrl']);

// Prefer const/let over var
const serverUrl = config.serverUrl;
let retryCount = 0;

// Use descriptive function names
async function sendWebpageDataToServer(data) {
  // Implementation
}

// Use template literals for strings
const message = `Data sent to ${serverUrl} successfully`;

// Use destructuring for cleaner code
const { url, title, selected } = webpageData;

// Use async/await over Promise chains
try {
  const result = await sendData(payload);
  handleSuccess(result);
} catch (error) {
  handleError(error);
}
```

### HTML/CSS Standards
```html
<!-- Use semantic HTML -->
<main class="popup-container">
  <section class="config-section">
    <h2>Server Configuration</h2>
    <form id="config-form">
      <label for="serverUrl">Server URL:</label>
      <input type="url" id="serverUrl" required>
    </form>
  </section>
</main>

<!-- Use accessible form elements -->
<label for="tags">Tags (comma-separated):</label>
<input type="text" id="tags" placeholder="work, important, research">

<!-- Use consistent CSS classes -->
.status.success { color: green; }
.status.error { color: red; }
.status.info { color: blue; }
```

### Error Handling Standards
```javascript
// Always handle Chrome API errors
chrome.storage.sync.get(['key'], (result) => {
  if (chrome.runtime.lastError) {
    console.error('Storage error:', chrome.runtime.lastError);
    return;
  }
  // Handle result
});

// Use try-catch for async operations
async function safeOperation() {
  try {
    const result = await riskyOperation();
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    // Handle error appropriately
    throw new Error('User-friendly error message');
  }
}

// Validate user input
function validateServerUrl(url) {
  if (!url) {
    throw new ValidationError('Server URL is required');
  }
  
  try {
    new URL(url);
  } catch {
    throw new ValidationError('Invalid URL format');
  }
  
  if (!url.startsWith('https://') && !url.startsWith('http://')) {
    throw new ValidationError('URL must include protocol (http:// or https://)');
  }
}
```

## Testing Guidelines

### Manual Testing Checklist
```markdown
## Installation Testing
- [ ] Extension loads without errors
- [ ] Icon appears in toolbar
- [ ] Popup opens when icon is clicked
- [ ] Context menu appears on right-click

## Functionality Testing
- [ ] Settings save and persist
- [ ] URL and title capture correctly
- [ ] Selected text detection works
- [ ] Context menu sends data
- [ ] Error messages display appropriately
- [ ] Status messages show and hide correctly

## Edge Case Testing
- [ ] Empty server URL handling
- [ ] Invalid URL handling
- [ ] Network disconnection
- [ ] Server error responses
- [ ] Very long URLs/titles/selections
- [ ] Special characters in content
- [ ] Multiple header configurations
```

### Browser Console Testing
```javascript
// Test in extension context (popup or background)
// Open DevTools on the extension popup or background page

// Test settings operations
chrome.storage.sync.clear(); // Clear all settings
chrome.storage.sync.set({serverUrl: 'https://test.com'}); // Set test data

// Test data capture
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  console.log('Current tab:', tabs[0]);
});

// Test error scenarios
fetch('https://invalid-url-for-testing.com', {method: 'POST'})
  .catch(error => console.log('Expected error:', error));
```

### Automated Testing Framework
```javascript
// Example test structure (future implementation)
describe('clicPOST Extension', () => {
  let extensionId;
  
  beforeEach(async () => {
    // Load extension in test environment
    extensionId = await loadExtension();
  });
  
  afterEach(async () => {
    // Clean up test environment
    await unloadExtension(extensionId);
  });
  
  describe('Settings Management', () => {
    it('should save and retrieve settings', async () => {
      const testSettings = {
        serverUrl: 'https://test.com',
        headers: [{name: 'test', value: 'value'}]
      };
      
      await chrome.storage.sync.set(testSettings);
      const result = await chrome.storage.sync.get(['serverUrl', 'headers']);
      
      expect(result.serverUrl).toBe(testSettings.serverUrl);
      expect(result.headers).toEqual(testSettings.headers);
    });
  });
  
  describe('Data Transmission', () => {
    it('should send correct data format', async () => {
      // Mock server endpoint
      const mockServer = new MockServer();
      mockServer.start();
      
      // Configure extension
      await setServerUrl(mockServer.url);
      
      // Trigger send operation
      await sendWebpageData({
        url: 'https://example.com',
        title: 'Test Page'
      });
      
      // Verify request
      expect(mockServer.lastRequest).toMatchObject({
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: {
          url: 'https://example.com',
          title: 'Test Page'
        }
      });
    });
  });
});
```

## Chrome Extension APIs

### Essential APIs for clicPOST

#### Storage API
```javascript
// Persistent settings storage
chrome.storage.sync.set({key: value});
chrome.storage.sync.get(['key1', 'key2'], callback);
chrome.storage.sync.clear();

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
    console.log(`${key} changed from ${oldValue} to ${newValue}`);
  }
});
```

#### Tabs API
```javascript
// Get current active tab
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  const currentTab = tabs[0];
  console.log('URL:', currentTab.url);
  console.log('Title:', currentTab.title);
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Tab finished loading
  }
});
```

#### Scripting API (for text selection)
```javascript
// Inject script to get selected text
chrome.scripting.executeScript({
  target: {tabId: tabId},
  function: getSelectedText
}, (results) => {
  const selectedText = results[0].result;
  console.log('Selected:', selectedText);
});

function getSelectedText() {
  return window.getSelection().toString();
}
```

#### Context Menus API
```javascript
// Create context menu
chrome.contextMenus.create({
  id: 'unique-id',
  title: 'Menu Item Text',
  contexts: ['all'], // or ['selection', 'page', 'link']
  onclick: handleContextMenuClick
});

// Handle clicks
function handleContextMenuClick(info, tab) {
  console.log('Clicked:', info.menuItemId);
  console.log('Selection:', info.selectionText);
}
```

#### Notifications API
```javascript
// Show notification
chrome.notifications.create('notification-id', {
  type: 'basic',
  iconUrl: 'icon.png',
  title: 'Notification Title',
  message: 'Notification message'
});

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log('Notification clicked:', notificationId);
});
```

## Common Development Tasks

### Adding a New Feature
1. **Plan the feature**
   - Define user requirements
   - Design data flow
   - Consider UI changes
   - Plan testing approach

2. **Update manifest.json** (if new permissions needed)
   ```json
   {
     "permissions": ["newPermission"]
   }
   ```

3. **Implement the feature**
   - Add UI elements to popup.html
   - Add logic to popup.js or background.js
   - Update settings structure if needed

4. **Test thoroughly**
   - Manual testing
   - Edge cases
   - Error conditions
   - Performance impact

5. **Update documentation**
   - User guide updates
   - API documentation changes
   - Architecture documentation

### Debugging Extension Issues

#### Common Debugging Locations
```javascript
// popup.js debugging
console.log('Popup loaded');
console.error('Error in popup:', error);

// background.js debugging (view in chrome://extensions/ -> Inspect views)
console.log('Background script loaded');
console.error('Background error:', error);

// Content script debugging (if implemented)
console.log('Content script loaded on:', window.location.href);
```

#### Chrome Extension DevTools
- **Extension popup**: Right-click popup → Inspect
- **Background script**: chrome://extensions/ → Inspect views: background page
- **Options page**: chrome://extensions/ → Inspect views: options.html
- **Content scripts**: Regular page DevTools

#### Common Issues and Solutions
```javascript
// Issue: chrome.runtime.lastError
chrome.storage.sync.get(['key'], (result) => {
  if (chrome.runtime.lastError) {
    console.error('Storage error:', chrome.runtime.lastError.message);
    return;
  }
  // Handle result
});

// Issue: Popup not updating
// Solution: Reload extension after changes
// Go to chrome://extensions/ and click the reload button

// Issue: Background script not responding
// Solution: Check for syntax errors in background.js
// View background page console for errors

// Issue: Permissions not working
// Solution: Check manifest.json permissions
// Ensure all required permissions are declared
```

### Performance Optimization

#### Service Worker Optimization
```javascript
// Use event-driven architecture
chrome.runtime.onInstalled.addListener(() => {
  // Initialize only what's needed
});

// Avoid persistent background operations
// Let service worker go dormant when not needed

// Cache frequently used data
let cachedSettings = null;
chrome.storage.onChanged.addListener(() => {
  cachedSettings = null; // Invalidate cache
});
```

#### Memory Management
```javascript
// Clean up event listeners
function cleanup() {
  document.removeEventListener('click', handleClick);
  chrome.storage.onChanged.removeListener(handleStorageChange);
}

// Use weak references for large objects
const cache = new WeakMap();

// Limit data size in storage
function validateDataSize(data) {
  const dataSize = JSON.stringify(data).length;
  if (dataSize > 100000) { // 100KB limit
    throw new Error('Data too large for storage');
  }
}
```

## Security Considerations

### Input Validation
```javascript
// Validate URLs
function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

// Sanitize user input
function sanitizeInput(input) {
  return input.trim().replace(/[<>]/g, '');
}

// Validate headers
function validateHeaders(headers) {
  return headers.every(header => 
    header.name && 
    header.name.length <= 100 &&
    header.value.length <= 1000
  );
}
```

### Secure Communication
```javascript
// Prefer HTTPS endpoints
function validateServerUrl(url) {
  if (url.startsWith('http://') && !url.includes('localhost')) {
    console.warn('HTTP endpoints are not secure. Consider using HTTPS.');
  }
}

// Secure header handling
function sanitizeHeaders(headers) {
  // Don't log sensitive headers
  const publicHeaders = headers.filter(h => 
    !h.name.toLowerCase().includes('auth') &&
    !h.name.toLowerCase().includes('token')
  );
  console.log('Public headers:', publicHeaders);
}
```

### Content Security Policy
```json
// manifest.json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self';"
  }
}
```

## Contribution Guidelines

### Code Review Process
1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Update documentation**
6. **Submit a pull request**

### Pull Request Requirements
- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commit messages are descriptive
- [ ] No breaking changes without discussion

### Commit Message Format
```
type(scope): brief description

Longer description if needed.

Fixes #issue-number
```

Examples:
```
feat(popup): add bulk operations support
fix(background): handle network timeouts properly
docs(api): update integration examples
test(popup): add validation test cases
```

## Release Process

### Version Management
```json
// manifest.json
{
  "version": "1.2.3",
  "version_name": "1.2.3 Beta"
}
```

### Release Checklist
- [ ] All tests pass
- [ ] Documentation is up-to-date
- [ ] Version number updated
- [ ] Changelog updated
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Cross-browser testing (if applicable)

### Distribution
1. **Chrome Web Store**: Official distribution
2. **GitHub Releases**: Source code and manual installation
3. **Enterprise**: Custom distribution channels

## Future Development

### Planned Features
- **Batch Operations**: Send multiple pages at once
- **Template System**: Customizable data formats
- **Sync Improvements**: Better cross-device synchronization
- **Offline Support**: Queue operations when offline

### Architecture Improvements
- **Modular Design**: Split functionality into modules
- **Plugin System**: Allow third-party extensions
- **Configuration UI**: Enhanced settings interface
- **Analytics**: Usage metrics and performance monitoring

### Technology Upgrades
- **TypeScript**: Add type safety
- **Build System**: Webpack or Vite integration
- **Testing Framework**: Automated testing suite
- **CI/CD**: Continuous integration and deployment

## Getting Help

### Resources
- **Chrome Extension Documentation**: [developer.chrome.com](https://developer.chrome.com/docs/extensions/)
- **MDN Web APIs**: [developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API)
- **Stack Overflow**: Tag questions with `google-chrome-extension`

### Community
- **GitHub Discussions**: Project-specific questions
- **Chrome Extension Developers**: Google Groups
- **Reddit**: r/webdev, r/chrome_extensions

### Debugging Tools
- **Chrome DevTools**: Built-in debugging
- **Extension Reloader**: Auto-reload during development
- **Chrome Extension Source Viewer**: Inspect other extensions
- **Lighthouse**: Performance and best practices audit

---

*This developer guide is a living document. Please contribute improvements and updates as the project evolves.*
