document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup loaded');
  
  // Load saved settings when popup opens
  chrome.storage.sync.get(['tags'], function(result) {
    console.log('Loaded settings:', result);
    
    if (result.tags) {
      document.getElementById('tags').value = result.tags;
    }
  });

  // Open options page when settings button is clicked
  document.getElementById('openOptions').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });

  // Tags input Enter key handler
  document.getElementById('tags').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      sendUrlAndClose();
    }
  });

  // Function to send URL and close popup
  function sendUrlAndClose() {
    // Trigger the existing send logic
    document.getElementById('sendUrl').click();
  }



  // Send URL button click handler
  document.getElementById('sendUrl').addEventListener('click', async function() {
    console.log('Send URL button clicked');
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Current tab:', tab);
      
      if (!tab) {
        showStatus('Could not get current tab', 'error');
        return;
      }

      try {
        if (!chrome.scripting) {
          console.error('chrome.scripting is not available');
          showStatus('Extension API not initialized properly', 'error');
          return;
        }

        // Get selected text from the tab
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => window.getSelection().toString()
        });

        if (!results || results.length === 0) {
          showStatus('Failed to get selected text', 'error');
          return;
        }

        const [{ result: selectedText }] = results;
        console.log('Selected text:', selectedText);

        // Get saved settings
        chrome.storage.sync.get(['serverUrl', 'headers', 'tags'], function(result) {
          console.log('Retrieved settings for sending:', result);
          
          if (!result.serverUrl) {
            showStatus('Please configure server URL first', 'error');
            return;
          }

          // Prepare headers
          const headers = {
            'Content-Type': 'application/json'
          };
          
          // Add custom headers
          if (result.headers) {
            result.headers.forEach(header => {
              headers[header.name] = header.value;
            });
          }

          const data = {
            url: tab.url,
            title: tab.title || ''  // Include the page title, fallback to empty string if not available
          };

          // Add selected text if any
          if (selectedText) {
            data.selected = selectedText;
          }

          // Add tags if they exist
          const tags = document.getElementById('tags').value;
          if (tags && tags.trim()) {
            data.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            
            // Save tags for future use
            chrome.storage.sync.set({ tags: tags });
          }

          console.log('Sending message to background script with:', {
            data,
            serverUrl: result.serverUrl,
            headers: headers
          });

          // Send message to background script
          chrome.runtime.sendMessage({
            action: 'sendUrl',
            data: data,
            serverUrl: result.serverUrl,
            headers: headers
          }, response => {
            console.log('Received response from background:', response);
            if (response && response.success) {
              console.log('Success:', response.data);
              // Reset the tags input field after successful submission
              document.getElementById('tags').value = '';
              // Also clear from storage to ensure it's reset for next popup open
              chrome.storage.sync.set({ tags: '' });
              showStatus('URL sent successfully!', 'success');
              // Close popup after successful send
              setTimeout(() => window.close(), 500);
            } else {
              console.error('Error:', response ? response.error : 'No response');
              showStatus(response ? response.error : 'Failed to send URL', 'error');
            }
          });
        });
      } catch (error) {
        console.error('Error executing script:', error);
        showStatus('Failed to execute script', 'error');
      }
    } catch (error) {
      console.error('Error in send URL handler:', error);
      showStatus('An error occurred', 'error');
    }
  });
});



function showStatus(message, type) {
  console.log('Showing status:', message, type);
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = type;
  status.style.display = 'block';
  
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}
