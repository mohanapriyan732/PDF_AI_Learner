const uploadInput = document.getElementById('pdf-input');
const dropZone = document.getElementById('drop-zone');
const uploadMeta = document.getElementById('upload-meta');
const statusBox = document.getElementById('status');
const resultArea = document.getElementById('result-area');
const themeToggle = document.getElementById('theme-toggle');

let currentText = '';
let currentFilename = '';

function setStatus(message) {
  statusBox.textContent = message;
}

function renderResult(title, content) {
  resultArea.innerHTML = `<div class="result-card"><h3>${title}</h3><pre>${content}</pre></div>`;
}

function uploadFile(file) {
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  setStatus('Uploading and extracting content...');
  fetch('/upload', { method: 'POST', body: formData })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        setStatus(data.message || 'Upload failed.');
        return;
      }
      currentText = data.text_preview || '';
      currentFilename = data.filename || file.name;
      uploadMeta.innerHTML = `<p><strong>${data.filename}</strong></p><p>Pages: ${data.page_count || 'N/A'} · Size: ${(data.file_size / 1024).toFixed(1)} KB</p>`;
      setStatus('PDF ready. Choose a study tool to generate content.');
    })
    .catch(() => setStatus('Upload failed. Please try again.'));
}

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.style.borderColor = '#6ef0d2';
});

dropZone.addEventListener('dragleave', () => {
  dropZone.style.borderColor = '#7c9cff';
});

dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.style.borderColor = '#7c9cff';
  const file = event.dataTransfer.files[0];
  uploadFile(file);
});

uploadInput.addEventListener('change', (event) => uploadFile(event.target.files[0]));

document.querySelectorAll('.tool-btn').forEach((button) => {
  button.addEventListener('click', () => {
    if (!currentText) {
      setStatus('Upload a PDF first.');
      return;
    }
    const action = button.dataset.action;
    setStatus(`Generating ${action}...`);

    const payload = { text: currentText };
    let endpoint = '/generate-summary';

    if (action === 'notes') endpoint = '/generate-notes';
    if (action === 'flashcards') endpoint = '/generate-flashcards';
    if (action === 'quiz') endpoint = '/generate-quiz';
    if (action === 'interview') endpoint = '/generate-interview';
    if (action === 'plan') endpoint = '/generate-plan';
    if (action === 'translate') endpoint = '/translate';
    if (action === 'export') endpoint = '/export';

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setStatus(data.message || 'Generation failed.');
          return;
        }
        if (action === 'summary') {
          const content = JSON.stringify(data, null, 2);
          renderResult('Summary', content);
        } else if (action === 'notes') {
          renderResult('Study Notes', JSON.stringify(data, null, 2));
        } else if (action === 'flashcards') {
          renderResult('Flashcards', JSON.stringify(data, null, 2));
        } else if (action === 'quiz') {
          renderResult('Quiz', JSON.stringify(data, null, 2));
        } else if (action === 'interview') {
          renderResult('Interview Questions', JSON.stringify(data, null, 2));
        } else if (action === 'plan') {
          renderResult('Study Plan', JSON.stringify(data, null, 2));
        } else if (action === 'translate') {
          renderResult('Translation', JSON.stringify(data, null, 2));
        } else if (action === 'export') {
          renderResult('Export', JSON.stringify(data, null, 2));
        }
        setStatus(`${action.charAt(0).toUpperCase() + action.slice(1)} generated.`);
      })
      .catch(() => setStatus('Generation failed. Please try again.'));
  });
});

themeToggle.addEventListener('click', () => {
  const root = document.documentElement;
  const currentTheme = root.getAttribute('data-theme');
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', nextTheme);
  themeToggle.textContent = nextTheme === 'dark' ? '🌙 Theme' : '☀️ Theme';
});
