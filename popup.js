document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup loaded');
  
  // Store available tags from settings
  let availableTags = [];
  // Array to track currently selected tags
  let selectedTags = [];
  
  // DOM elements
  const tagInput = document.getElementById('tag-input');
  const tagChipsContainer = document.getElementById('tag-chips-container');
  const tagSuggestions = document.getElementById('tag-suggestions');
  const hiddenTagsInput = document.getElementById('tags');
  
  // Load saved settings when popup opens
  chrome.storage.local.get(['tags', 'aiRemoteUrl'], function(result) {
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
      // Split the comma-separated tags string
      availableTags = result.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      console.log('Available tags:', availableTags);
      
      // Make sure suggestions are ready after a short delay
      setTimeout(() => {
        // This helps ensure the suggestions are ready when needed
        if (tagSuggestions) {
          console.log('Preparing suggestions element');
          tagSuggestions.style.display = 'none';
        }
      }, 100);
    }
  });
  
  // Function to update the hidden input with all selected tags
  function updateHiddenInput() {
    hiddenTagsInput.value = selectedTags.join(',');
    console.log('Updated hidden input with tags:', hiddenTagsInput.value);
  }
  
  // Function to add a tag to the selected tags
  function addTag(tag) {
    tag = tag.trim();
    if (tag && !selectedTags.includes(tag)) {
      selectedTags.push(tag);
      
      // Create the tag chip
      const tagChip = document.createElement('div');
      tagChip.className = 'tag-chip';
      // Create tag text element
      const tagText = document.createElement('span');
      tagText.textContent = tag;
      tagChip.appendChild(tagText);
      
      // Create remove button
      const removeButton = document.createElement('span');
      removeButton.className = 'remove-tag';
      removeButton.setAttribute('data-tag', tag);
      removeButton.textContent = '×';
      tagChip.appendChild(removeButton);
      tagChipsContainer.appendChild(tagChip);
      
      // Add click handler for remove button
      tagChip.querySelector('.remove-tag').addEventListener('click', function() {
        const tagToRemove = this.dataset.tag;
        selectedTags = selectedTags.filter(t => t !== tagToRemove);
        tagChip.remove();
        updateHiddenInput();
      });
      
      // Update the hidden input
      updateHiddenInput();
      
      // Clear the input field
      tagInput.value = '';
    }
  }
  
  // Function to show suggestions based on input (or show all if no query)
  function showSuggestions(query = '') {
    console.log('Showing suggestions for query:', query);
    console.log('Available tags:', availableTags);
    console.log('Selected tags:', selectedTags);
    
    // Clear suggestions
    tagSuggestions.innerHTML = '';
    
    // Filter available tags based on query or show all if no query
    const filteredTags = query
      ? availableTags.filter(tag => 
          tag.toLowerCase().includes(query.toLowerCase()) && 
          !selectedTags.includes(tag)
        )
      : availableTags.filter(tag => !selectedTags.includes(tag));
    
    console.log('Filtered tags to show:', filteredTags);
    
    // If no suggestions (all tags are selected or no tags available)
    if (filteredTags.length === 0) {
      // If no tags are available at all
      if (availableTags.length === 0) {
        const noTagsElement = document.createElement('div');
        noTagsElement.className = 'tag-suggestion';
        noTagsElement.textContent = 'No tags available. Add some in settings.';
        noTagsElement.style.fontStyle = 'italic';
        noTagsElement.style.color = '#777';
        tagSuggestions.appendChild(noTagsElement);
      } else {
        // All available tags are already selected
        const allSelectedElement = document.createElement('div');
        allSelectedElement.className = 'tag-suggestion';
        allSelectedElement.textContent = 'All available tags are selected';
        allSelectedElement.style.fontStyle = 'italic';
        allSelectedElement.style.color = '#777';
        tagSuggestions.appendChild(allSelectedElement);
      }
    } else {
      // Add suggestions to the dropdown
      filteredTags.forEach(tag => {
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'tag-suggestion';
        suggestionElement.textContent = tag;
        suggestionElement.addEventListener('click', function() {
          addTag(tag);
          // Keep suggestions open after selecting
          setTimeout(() => showSuggestions(), 10);
        });
        tagSuggestions.appendChild(suggestionElement);
      });
    }
    
    // Always show suggestions
    tagSuggestions.style.display = 'block';
    console.log('Set suggestions display to:', tagSuggestions.style.display);
  }
  
  // Input event handlers
  tagInput.addEventListener('input', function() {
    const query = this.value.trim();
    showSuggestions(query);
  });
  
  // Show all tags when input is focused
  tagInput.addEventListener('focus', function() {
    console.log('Input focused');
    showSuggestions();
    // Force display visibility
    setTimeout(() => {
      tagSuggestions.style.display = 'block';
      console.log('Forced suggestions visibility on focus');
    }, 50);
  });
  
  // Also show all tags when clicked
  tagInput.addEventListener('click', function() {
    console.log('Input clicked');
    showSuggestions();
    // Force display visibility
    setTimeout(() => {
      tagSuggestions.style.display = 'block';
      console.log('Forced suggestions visibility on click');
    }, 50);
  });
  
  // Direct click handler on the container to ensure it works
  document.querySelector('.tag-input-container').addEventListener('click', function() {
    console.log('Container clicked');
    // Focus the input
    tagInput.focus();
    // Show suggestions with slight delay
    setTimeout(() => {
      showSuggestions();
      tagSuggestions.style.display = 'block';
      console.log('Forced suggestions visibility on container click');
    }, 50);
  });
  
  // Handle keyboard events for tag input
  tagInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = this.value.trim();
      if (value) {
        addTag(value);
        tagSuggestions.style.display = 'none';
      }
    } else if (e.key === 'Escape') {
      tagSuggestions.style.display = 'none';
    }
  });
  
  // Handle click outside to close suggestions
  document.addEventListener('click', function(e) {
    if (!tagInput.contains(e.target) && !tagSuggestions.contains(e.target)) {
      tagSuggestions.style.display = 'none';
    }
  });
  
  // Focus input when clicking on the container
  document.querySelector('.tag-input-container').addEventListener('click', function(e) {
    // Only focus if clicking the container itself, not a chip or button within it
    if (e.target === this) {
      tagInput.focus();
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

        // Get selected text (works in Chrome and Firefox)
        let selectedText = '';
        if (chrome.scripting && chrome.scripting.executeScript) {
          const res = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => window.getSelection().toString()
          });
          selectedText = res?.[0]?.result || '';
        }
        console.log('Using scripting API for text selection');
        console.log('Selected text:', selectedText);
        if (selectedText === undefined) {
          showStatus('Failed to get selected text', 'error');
          return;
        }

        // Get saved settings
        chrome.storage.local.get(['aiRemoteUrl', 'headers', 'tags'], function(result) {
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

        // Get selected text (works in Chrome and Firefox)
        let selectedText = '';
        if (chrome.scripting && chrome.scripting.executeScript) {
          const res = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => window.getSelection().toString()
          });
          selectedText = res?.[0]?.result || '';
        }
        console.log('Using scripting API for text selection');
        console.log('Selected text:', selectedText);
        if (selectedText === undefined) {
          showStatus('Failed to get selected text', 'error');
          return;
        }

        // Get saved settings
        chrome.storage.local.get(['serverUrl', 'headers', 'tags'], function(result) {
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
              // Reset the tags input field and clear tag chips after successful submission
              document.getElementById('tags').value = '';
              // Clear the tag chips container
              tagChipsContainer.innerHTML = '';
              // Clear selected tags array
              selectedTags = [];
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
