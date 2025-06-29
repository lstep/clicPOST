if (typeof importScripts === 'function') {
  importScripts('browser-polyfill.min.js');
}
console.log('Background script loaded');

// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'sendToServer',
    title: 'POST send to Server 📤',
    contexts: ['all']  // Show in all contexts, not just selection
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'sendToServer') {
    // Get saved settings
    chrome.storage.local.get(['serverUrl', 'headers'], function(result) {
      if (!result.serverUrl) {
        console.error('Server URL not configured');
        return;
      }

      const data = {
        url: tab.url,
        title: tab.title || ''
      };

      // Add selected text if any is selected
      if (info.selectionText) {
        data.selected = info.selectionText;
      }

      // Make the request
      fetch(result.serverUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(result.headers || {})
        },
        body: JSON.stringify(data)
      })
      .then(async response => {
        if (response.ok) {
          // Show notification on success
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Success',
            message: info.selectionText ? 'Text sent successfully' : 'Page sent successfully'
          });
        } else {
          throw new Error(`Server returned ${response.status}`);
        }
      })
      .catch(error => {
        console.error('Error:', error);
        // Show error notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Error',
          message: 'Failed to send to server'
        });
      });
    });
  }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  // Handle both sendUrl and generateDescription actions
  if (request.action === 'sendUrl' || request.action === 'generateDescription') {
    console.log(`Processing ${request.action} action`);
    const { data, serverUrl, headers } = request;
    
    console.log('Sending POST request to:', serverUrl);
    
    // Make the request using fetch
    fetch(serverUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    })
    .then(async response => {
      console.log('Request completed with status:', response.status);
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
        console.log('Parsed response:', data);
      } catch (e) {
        console.log('Response is not JSON, using text');
        data = text;
      }
      
      if (response.ok) {
        sendResponse({ success: true, data });
      } else {
        console.error('Request failed with status:', response.status);
        sendResponse({ 
          success: false, 
          error: `Server returned status ${response.status}`
        });
      }
    })
    .catch(error => {
      console.error('Network error occurred:', error);
      sendResponse({ 
        success: false, 
        error: 'Network error occurred'
      });
    });
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
});
