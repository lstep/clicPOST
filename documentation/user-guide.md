# clicPOST User Guide

## Overview

clicPOST is a Chrome extension that allows you to easily send webpage information (URL, title, and selected text) to your personal server or service. Whether you want to save interesting articles to your notes, integrate with your workflow tools, or build a personal knowledge base, clicPOST makes it simple with just a click.

## Quick Start

### Installation

#### From Chrome Web Store (Recommended)
1. Visit the Chrome Web Store (link coming soon)
2. Click "Add to Chrome"
3. Click "Add extension" in the confirmation dialog
4. The clicPOST icon will appear in your toolbar

#### Manual Installation (Developer Mode)
1. Download the extension files from the repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" toggle in the top-right
4. Click "Load unpacked" and select the extension folder
5. The clicPOST icon will appear in your toolbar

### Initial Setup
1. Click the clicPOST icon in your Chrome toolbar
2. Click the "Settings" button to open the options page
3. Enter your server URL in the "Remote Server URL" field
4. Add any custom headers if needed
5. Click "Save Settings"
6. You're ready to start sending webpage data!

## Using clicPOST

### Method 1: Using the Popup Interface

#### Basic Usage
1. **Navigate** to any webpage you want to save
2. **Select text** (optional) if you want to capture specific content
3. **Click** the clicPOST icon in your toolbar
4. **Add tags** (optional) for organization
5. **Click** "Send URL"
6. **Confirm** success with the status message

#### With Text Selection
1. Highlight interesting text on any webpage
2. Click the clicPOST icon
3. The selected text will be included automatically
4. Add relevant tags if desired
5. Click send to save both the page and your selection

#### Without Text Selection
1. Simply click the clicPOST icon on any page
2. The page URL and title will be captured
3. Add tags for categorization
4. Click send to save the page information

### Method 2: Using Right-Click Context Menu

#### Quick Send (Fastest Method)
1. **Right-click** anywhere on a webpage
2. **Select** "POST send to Server 📤" from the context menu
3. **Done!** The page data is sent automatically

#### With Text Selection
1. **Select text** on the webpage first
2. **Right-click** within your selection
3. **Choose** "POST send to Server 📤"
4. Both the page and selected text are sent

## Configuration Options

### Accessing Options Page
There are two ways to access the options page:
1. Click the clicPOST icon in your toolbar, then click the "Settings" button
2. Right-click on the clicPOST icon, select "Options"

### Server URL Setup
- **Required**: Your server endpoint that will receive the data
- **Format**: Must be a complete URL (e.g., `https://your-server.com/api/webhook`)
- **Security**: HTTPS recommended for secure transmission
- **Location**: Configure in the options page, not the popup

### Custom Headers
Custom headers allow you to send additional information with each request, such as authentication tokens or metadata.

#### Adding Headers
1. Open the clicPOST options page
2. Click "Add Header"
3. Enter the header name (e.g., "Authorization")
4. Enter the header value (e.g., "Bearer your-token-123")
5. Click "Save Settings"

#### Common Header Examples
- **Authentication**: `Authorization: Bearer your-api-token`
- **API Keys**: `X-API-Key: your-secret-key`
- **Content Type**: `Content-Type: application/json` (automatically added)
- **Custom Metadata**: `X-Source: clicPOST-extension`

#### Managing Headers
- **Add Multiple**: Click "Add Header" multiple times for several headers
- **Remove Headers**: Delete the content and save settings
- **Edit Headers**: Modify existing values and save

### Tags System
Tags help organize and categorize your saved content.

#### Using Tags
- **Format**: Comma-separated values (e.g., "work, important, research")
- **Flexibility**: Use any tags that make sense for your workflow
- **Consistency**: Develop a consistent tagging system for better organization

#### Tag Examples
- **By Topic**: `programming, design, marketing`
- **By Priority**: `urgent, important, reference`
- **By Project**: `project-alpha, client-work, personal`
- **By Type**: `article, tutorial, documentation`

## Data Format

When you send data using clicPOST, your server receives a JSON payload with the following structure:

```json
{
  "url": "https://example.com/article",
  "title": "Article Title",
  "selected": "Selected text content",  // Only if text was selected
  "tags": "work, important, research"   // Only if tags were added
}
```

### Data Fields Explained
- **url**: The complete URL of the webpage
- **title**: The page title from the HTML `<title>` tag
- **selected**: Any text you highlighted on the page (optional)
- **tags**: Your comma-separated tags (optional)

## Troubleshooting

### Common Issues and Solutions

#### "Server URL not configured" Error
**Problem**: You haven't set up a server URL yet.
**Solution**: 
1. Click the clicPOST icon
2. Click the "Settings" button to open the options page
3. Enter your server URL in the configuration field
4. Click "Save Settings"

#### "Failed to send data" Error
**Possible Causes and Solutions**:

1. **Network Connection**
   - Check your internet connection
   - Try accessing your server URL in a browser

2. **Invalid Server URL**
   - Verify the URL is correct and complete
   - Ensure it starts with `http://` or `https://`
   - Test the endpoint with other tools if possible

3. **Server Issues**
   - Your server might be down or unreachable
   - Check server logs for error messages
   - Verify your server accepts POST requests

4. **CORS Issues**
   - Your server needs to allow requests from Chrome extensions
   - Check server CORS configuration

#### Context Menu Not Appearing
**Problem**: Right-click menu doesn't show clicPOST option.
**Solution**:
1. Check that the extension is installed and enabled
2. Try refreshing the webpage
3. Right-click in different areas of the page

#### Selected Text Not Being Captured
**Problem**: Text selection isn't included in sent data.
**Solutions**:
1. Make sure text is actually selected (highlighted)
2. Try selecting text differently (click and drag)
3. Use the popup method instead of context menu
4. Refresh the page and try again

### Advanced Troubleshooting

#### Checking Extension Status
1. Go to `chrome://extensions/`
2. Find clicPOST in the list
3. Ensure it's enabled (toggle should be blue)
4. Check for any error messages

#### Viewing Browser Console
1. Right-click on any webpage
2. Select "Inspect" or "Inspect Element"
3. Click the "Console" tab
4. Look for clicPOST-related error messages

#### Testing Server Connectivity
You can test your server endpoint manually:
```bash
# Using curl (in terminal/command prompt)
curl -X POST https://your-server.com/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"url":"test","title":"test"}'
```

## Privacy and Security

### Data Handling
- **No Storage**: clicPOST doesn't store your data locally
- **Direct Transmission**: Data goes directly from your browser to your server
- **User Control**: You control where your data is sent
- **No Tracking**: The extension doesn't track your browsing

### Security Best Practices
- **Use HTTPS**: Always use HTTPS server endpoints for encryption
- **Secure Tokens**: Keep authentication tokens private
- **Regular Updates**: Keep the extension updated
- **Server Security**: Ensure your receiving server is properly secured

### Permissions Explained
clicPOST requests these Chrome permissions:
- **tabs**: To access current page URL and title
- **storage**: To save your settings (server URL, headers, tags)
- **activeTab**: To access the current tab's content
- **scripting**: To detect selected text on pages
- **contextMenus**: To add the right-click menu option
- **<all_urls>**: To send data to your configured server

## Use Cases and Examples

### Personal Knowledge Management
- **Save Articles**: Quickly save interesting articles with tags
- **Capture Quotes**: Select meaningful text and send to your notes
- **Research Organization**: Tag content by topic or project

### Workflow Integration
- **Task Management**: Send URLs to your task tracker
- **Team Sharing**: Forward interesting content to team tools
- **Content Curation**: Build curated lists of resources

### Development and Learning
- **Code Examples**: Save useful code snippets and tutorials
- **Documentation**: Bookmark important documentation pages
- **Learning Resources**: Organize educational content

## Tips and Best Practices

### Efficient Tagging
- **Develop Standards**: Create consistent tag categories
- **Use Abbreviations**: Keep tags short but meaningful
- **Think Search**: Use tags you'll remember when searching later

### Smart Workflows
- **Options Configuration**: Set up your server URL and headers once in the options page
- **Quick Sending**: Use the simplified popup for daily sending with tags
- **Keyboard Shortcuts**: Use the Enter key in tags field for quick sending
- **Regular Review**: Periodically review and organize your saved content

### Server Setup Tips
- **Test Thoroughly**: Test your server endpoint before heavy use
- **Monitor Usage**: Keep track of how much data you're sending
- **Backup Strategy**: Ensure your server data is backed up

## Getting Help

### Support Resources
- **Documentation**: Check the full technical documentation
- **GitHub Issues**: Report bugs or request features
- **Community**: Connect with other users

### Reporting Issues
When reporting problems, please include:
1. Chrome version
2. Extension version
3. Error messages (if any)
4. Steps to reproduce the issue
5. Your server endpoint type (without revealing sensitive URLs)

### Feature Requests
We welcome suggestions for new features! Consider:
- How the feature would improve your workflow
- Whether it aligns with the extension's core purpose
- Technical feasibility and complexity

## Appendix

### Keyboard Shortcuts
- **Enter key** in tags field: Triggers send operation
- **Tab navigation**: Move between form fields in popup

### Browser Compatibility
- **Chrome**: Fully supported (Manifest V3)
- **Other Browsers**: Not currently supported

### Version History
Check the extension's Chrome Web Store page or GitHub repository for detailed version history and changelog information.

---

*For technical documentation and integration guides, see the `/documentation` folder in the project repository.*
