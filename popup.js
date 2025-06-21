document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup loaded');
  
  // Load saved settings when popup opens
  chrome.storage.sync.get(['tags', 'aiRemoteUrl'], function(result) {
    console.log('Loaded settings:', result);
    
    // Show Generate description button only if AI Remote URL is configured
    const generateDescriptionButton = document.getElementById('generateDescription');
    if (result.aiRemoteUrl) {
      generateDescriptionButton.style.display = 'block';
    } else {
      generateDescriptionButton.style.display = 'none';
    }
    
    // Populate tag suggestions from settings
    if (result.tags) {
      const tagsList = document.getElementById('tagSuggestions');
      // Clear existing options
      tagsList.innerHTML = '';
      
      // Split the comma-separated tags string and create options
      const tags = result.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // Add each tag as an option in the datalist
      tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        tagsList.appendChild(option);
      });
    }
  });

  // Open options page when settings button is clicked
  document.getElementById('openOptions').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
  });
  
  // Generate description button click handler
  document.getElementById('generateDescription').addEventListener('click', async function() {
    console.log('Generate description button clicked');
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('Current tab:', tab);
      
      if (!tab) {
        showStatus('Could not get current tab', 'error');
        return;
      }

      // Prevent sending chrome:// URLs to the API
      if (tab.url.startsWith('chrome')) {
        showStatus('Chrome internal pages cannot be sent to the API', 'error');
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
        chrome.storage.sync.get(['aiRemoteUrl', 'headers', 'tags'], function(result) {
          console.log('Retrieved settings for AI generation:', result);
          
          if (!result.aiRemoteUrl) {
            showStatus('Please configure AI Remote URL first', 'error');
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

          // Add description if it exists
          const description = document.getElementById('description').value;
          if (description && description.trim()) {
            data.description = description.trim();
          }

          // Add tags if they exist
          const tags = document.getElementById('tags').value;
          if (tags && tags.trim()) {
            data.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
          }

          // Mark that this is an AI description generation request
          data.generate_description = true;

          console.log('Sending message to background script for AI generation:', {
            data,
            aiRemoteUrl: result.aiRemoteUrl,
            headers: headers
          });

          // Send message to background script
          chrome.runtime.sendMessage({
            action: 'generateDescription',
            data: data,
            serverUrl: result.aiRemoteUrl,
            headers: headers
          }, response => {
            console.log('Received response from background:', response);
            if (response && response.success) {
              console.log('Success:', response.data);
              // If there's a generated description, populate the description field
              if (response.data && response.data.generated_description) {
                document.getElementById('description').value = response.data.generated_description;
              }
              showStatus('Description generated successfully!', 'success');
            } else {
              console.error('Error:', response ? response.error : 'No response');
              showStatus(response ? response.error : 'Failed to generate description', 'error');
            }
          });
        });
      } catch (error) {
        console.error('Error executing script:', error);
        showStatus('Failed to execute script', 'error');
      }
    } catch (error) {
      console.error('Error in generate description handler:', error);
      showStatus('An error occurred', 'error');
    }
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

      // Prevent sending chrome:// URLs to the API
      if (tab.url.startsWith('chrome')) {
        showStatus('Chrome internal pages cannot be sent to the API', 'error');
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

          // Add description if it exists
          const description = document.getElementById('description').value;
          if (description && description.trim()) {
            data.description = description.trim();
          }

          // Add tags if they exist
          const tags = document.getElementById('tags').value;
          if (tags && tags.trim()) {
            // Process and clean up tags
            const processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            data.tags = processedTags;
            
            // Don't save to storage on send - we use the settings page for managing saved tags
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
              // Reset the tags input field after successful submission without affecting saved tags in settings
              document.getElementById('tags').value = '';
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
