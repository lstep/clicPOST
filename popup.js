document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup loaded');
  const headersContainer = document.getElementById('headers-container');
  
  // Load saved settings when popup opens
  chrome.storage.sync.get(['serverUrl', 'headers', 'tags'], function(result) {
    console.log('Loaded settings:', result);
    if (result.serverUrl) {
      document.getElementById('serverUrl').value = result.serverUrl;
    }
    
    if (result.tags) {
      document.getElementById('tags').value = result.tags;
    }
    
    if (result.headers) {
      result.headers.forEach(header => addHeaderRow(header.name, header.value));
    }
  });

  // Add header button click handler
  document.getElementById('addHeader').addEventListener('click', function() {
    addHeaderRow();
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

  // Save settings button click handler
  document.getElementById('save').addEventListener('click', function() {
    const serverUrl = document.getElementById('serverUrl').value;
    
    if (!serverUrl) {
      showStatus('Please enter a valid URL', 'error');
      return;
    }

    // Collect all headers
    const headers = [];
    const headerRows = document.querySelectorAll('.header-row');
    headerRows.forEach(row => {
      const nameInput = row.querySelector('.header-name');
      const valueInput = row.querySelector('.header-value');
      if (nameInput.value && valueInput.value) {
        headers.push({
          name: nameInput.value,
          value: valueInput.value
        });
      }
    });

    // Save settings
    chrome.storage.sync.set({
      serverUrl: serverUrl,
      headers: headers,
      tags: document.getElementById('tags').value
    }, function() {
      showStatus('Settings saved successfully!', 'success');
    });
  });

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

function addHeaderRow(name = '', value = '') {
  const headersContainer = document.getElementById('headers-container');
  const headerRow = document.createElement('div');
  headerRow.className = 'header-row';
  
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'header-name';
  nameInput.placeholder = 'Header Name';
  nameInput.value = name;
  
  const valueInput = document.createElement('input');
  valueInput.type = 'text';
  valueInput.className = 'header-value';
  valueInput.placeholder = 'Header Value';
  valueInput.value = value;
  
  const removeButton = document.createElement('button');
  removeButton.textContent = '×';
  removeButton.className = 'remove';
  removeButton.onclick = function() {
    headerRow.remove();
  };
  
  headerRow.appendChild(nameInput);
  headerRow.appendChild(valueInput);
  headerRow.appendChild(removeButton);
  headersContainer.appendChild(headerRow);
}

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
