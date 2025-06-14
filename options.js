document.addEventListener('DOMContentLoaded', function() {
  console.log('Options page loaded');
  const headersContainer = document.getElementById('headers-container');
  
  // Load saved settings when options page opens
  chrome.storage.sync.get(['serverUrl', 'aiRemoteUrl', 'headers'], function(result) {
    console.log('Loaded settings:', result);
    if (result.serverUrl) {
      document.getElementById('serverUrl').value = result.serverUrl;
    }
    
    if (result.aiRemoteUrl) {
      document.getElementById('aiRemoteUrl').value = result.aiRemoteUrl;
    }
    
    if (result.headers) {
      result.headers.forEach(header => addHeaderRow(header.name, header.value));
    }
  });

  // Add header button click handler
  document.getElementById('addHeader').addEventListener('click', function() {
    addHeaderRow();
  });

  // Save settings button click handler
  document.getElementById('save').addEventListener('click', function() {
    const serverUrl = document.getElementById('serverUrl').value;
    const aiRemoteUrl = document.getElementById('aiRemoteUrl').value;
    
    if (!serverUrl) {
      showStatus('Please enter a valid Remote Server URL', 'error');
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
      aiRemoteUrl: aiRemoteUrl,
      headers: headers
    }, function() {
      showStatus('Settings saved successfully!', 'success');
    });
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
