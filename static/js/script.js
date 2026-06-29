const uploadInput = document.getElementById('pdf-input');
const dropZone = document.getElementById('drop-zone');
const uploadMeta = document.getElementById('upload-meta');
const statusBox = document.getElementById('status');
const resultArea = document.getElementById('result-area');
const themeToggle = document.getElementById('theme-toggle');

let currentText = '';
let currentFilename = '';
let latestResult = '';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setStatus(message) {
  statusBox.textContent = message;
}

function setToolsEnabled(enabled) {
  document.querySelectorAll('.tool-btn').forEach((button) => {
    button.disabled = !enabled;
  });
}

function showLoadingSkeleton() {
  resultArea.innerHTML = `
    <div class="skeleton">
      <div class="skeleton-header"></div>
      <div class="skeleton-lines"></div>
    </div>
  `;
}

function renderRaw(title, content) {
  const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  latestResult = text;
  resultArea.innerHTML = `
    <div class="result-card">
      <h3>${escapeHtml(title)}</h3>
      <pre>${escapeHtml(text)}</pre>
    </div>
  `;
}

function uploadFile(file) {
  if (!file) return;

  if (file.type !== 'application/pdf') {
    setStatus('Please upload a PDF file.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  setStatus('Uploading and extracting content...');
  showLoadingSkeleton();

  fetch('/upload', { method: 'POST', body: formData })
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) {
        setStatus(data.message || 'Upload failed.');
        return;
      }

      currentText = data.text_preview || '';
      currentFilename = data.filename || file.name;
      latestResult = '';

      uploadMeta.innerHTML = `
        <p><strong>${escapeHtml(currentFilename)}</strong></p>
        <p>Pages: ${escapeHtml(data.page_count || 'N/A')} · Size: ${(data.file_size / 1024).toFixed(1)} KB</p>
      `;

      resultArea.innerHTML = '';
      setToolsEnabled(true);
      setStatus('PDF ready. Choose a study tool to generate content.');
    })
    .catch(() => setStatus('Upload failed. Please try again.'));
}

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('drag-over');
  uploadFile(event.dataTransfer.files[0]);
});

uploadInput.addEventListener('change', (event) => {
  uploadFile(event.target.files[0]);
});

document.querySelectorAll('.tool-btn').forEach((button) => {
  button.addEventListener('click', () => {
    if (!currentText) {
      setStatus('Upload a PDF first.');
      return;
    }

    const action = button.dataset.action;
    let endpoint = '/generate-summary';

    if (action === 'notes') endpoint = '/generate-notes';
    if (action === 'flashcards') endpoint = '/generate-flashcards';
    if (action === 'quiz') endpoint = '/generate-quiz';
    if (action === 'interview') endpoint = '/generate-interview';
    if (action === 'plan') endpoint = '/generate-plan';
    if (action === 'translate') endpoint = '/translate';
    if (action === 'export') endpoint = '/export';

    const payload = action === 'export'
      ? { content: latestResult || currentText, type: 'summary' }
      : { text: currentText };

    setStatus(`Generating ${action}...`);
    showLoadingSkeleton();

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

        latestResult = JSON.stringify(data, null, 2);

        if (action === 'summary') renderSummary(data);
        else if (action === 'notes') renderNotes(data);
        else if (action === 'flashcards') renderFlashcards(data);
        else if (action === 'quiz') renderQuiz(data);
        else if (action === 'interview') renderInterview(data);
        else if (action === 'plan') renderPlan(data);
        else if (action === 'translate') renderTranslate(data);
        else renderRaw('Export', data);

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

function safeTextField(obj, ...keys) {
  for (const key of keys) {
    if (obj[key]) return obj[key];
  }
  return null;
}

function renderSummary(data) {
  const title = safeTextField(data, 'title', 'summary_title') || 'Summary';
  const body = safeTextField(data, 'summary', 'content', 'text') || JSON.stringify(data, null, 2);
  const points = Array.isArray(body)
    ? body
    : String(body).split(/\n\n|\n- |\n\* |\n/).filter(Boolean);
  const highlights = Array.isArray(data.highlights) ? data.highlights.slice(0, 3) : [];

  latestResult = String(body);

  resultArea.innerHTML = `
    <div class="summary-card">
      <div class="summary-header">
        <h3>${escapeHtml(title)}</h3>
        <div class="summary-meta">Key takeaways</div>
      </div>
      <ul class="summary-points">
        ${points.map((point) => `<li>${escapeHtml(point)}</li>`).join('')}
      </ul>
      ${
        highlights.length
          ? `<div class="summary-highlights"><strong>Highlights:</strong> ${highlights.map((item) => `<span class="pill">${escapeHtml(item)}</span>`).join(' ')}</div>`
          : ''
      }
    </div>
  `;
}

function renderNotes(data) {
  const sections = data.sections || data.notes || null;

  if (!sections) {
    const raw = safeTextField(data, 'content', 'notes', 'text') || JSON.stringify(data, null, 2);
    const parts = String(raw).split(/\n\n+/).filter(Boolean);
    latestResult = raw;

    resultArea.innerHTML = `
      <div class="notes-grid">
        ${parts.map((part, index) => `
          <div class="note-card">
            <h4>Note ${index + 1}</h4>
            <p>${escapeHtml(part)}</p>
          </div>
        `).join('')}
      </div>
    `;
    return;
  }

  latestResult = JSON.stringify(sections, null, 2);

  resultArea.innerHTML = `
    <div class="notes-grid">
      ${sections.map((section) => `
        <div class="note-card">
          <h4>${escapeHtml(section.title || 'Section')}</h4>
          <div class="note-body">
            ${(section.points || []).map((point) => `<div class="note-line">• ${escapeHtml(point)}</div>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderFlashcards(data) {
  const cards = data.cards || data.flashcards || [];
  let parsed = [];

  if (Array.isArray(cards) && cards.length) {
    parsed = cards;
  } else {
    try {
      const body = safeTextField(data, 'content', 'text') || JSON.stringify(data);
      parsed = JSON.parse(body);
    } catch {
      const raw = safeTextField(data, 'content', 'text') || '';
      parsed = String(raw).split(/\n\n+/).filter(Boolean).map((block) => {
        const [question, answer] = block.split(/\n+/);
        return { front: question || block, back: answer || '' };
      });
    }
  }

  if (!parsed.length) {
    renderRaw('Flashcards', data);
    return;
  }

  latestResult = JSON.stringify(parsed, null, 2);

  resultArea.innerHTML = `
    <div class="flashcards">
      <div class="card-stage">
        ${parsed.map((card, index) => `
          <div class="flashcard" data-index="${index}">
            <div class="front">${escapeHtml(card.front || card.q || card.question || '')}</div>
            <div class="back">${escapeHtml(card.back || card.a || card.answer || '')}</div>
          </div>
        `).join('')}
      </div>
      <div class="card-controls">
        <button id="prev-card" type="button">◀ Prev</button>
        <div id="card-counter">1 / ${parsed.length}</div>
        <button id="next-card" type="button">Next ▶</button>
      </div>
    </div>
  `;

  const cardsEl = Array.from(resultArea.querySelectorAll('.flashcard'));
  let index = 0;

  function showCard(nextIndex) {
    cardsEl.forEach((element, currentIndex) => {
      element.classList.toggle('active', currentIndex === nextIndex);
    });
    resultArea.querySelector('#card-counter').textContent = `${nextIndex + 1} / ${cardsEl.length}`;
  }

  showCard(0);

  cardsEl.forEach((element) => {
    element.addEventListener('click', () => element.classList.toggle('flipped'));
  });

  resultArea.querySelector('#prev-card').addEventListener('click', () => {
    index = (index - 1 + cardsEl.length) % cardsEl.length;
    showCard(index);
  });

  resultArea.querySelector('#next-card').addEventListener('click', () => {
    index = (index + 1) % cardsEl.length;
    showCard(index);
  });
}

function renderQuiz(data) {
  const questions = data.questions || data.quiz || [];
  let parsed = [];

  if (Array.isArray(questions) && questions.length) {
    parsed = questions;
  } else {
    try {
      parsed = JSON.parse(safeTextField(data, 'content', 'text') || '[]');
    } catch {
      parsed = [];
    }
  }

  if (!parsed.length) {
    renderRaw('Quiz', data);
    return;
  }

  latestResult = JSON.stringify(parsed, null, 2);

  let current = 0;

  resultArea.innerHTML = `
    <div class="quiz-card">
      <div id="quiz-progress" class="quiz-progress">1 / ${parsed.length}</div>
      <div id="quiz-body"></div>
      <div class="quiz-controls">
        <button id="quiz-prev" type="button">◀</button>
        <button id="quiz-submit" type="button">Submit</button>
        <button id="quiz-next" type="button">▶</button>
      </div>
    </div>
  `;

  function optionsLabel(question, index) {
    const options = question.options || question.choices || [];
    return options[index] || index;
  }

  function showQuestion(index) {
    const question = parsed[index];
    const options = question.options || question.choices || [];

    document.getElementById('quiz-progress').textContent = `${index + 1} / ${parsed.length}`;
    document.getElementById('quiz-body').innerHTML = `
      <h4>${escapeHtml(question.question || question.q || '')}</h4>
      <div class="quiz-options">
        ${options.map((option, optionIndex) => `
          <button type="button" class="quiz-option" data-idx="${optionIndex}">
            ${escapeHtml(option)}
          </button>
        `).join('')}
      </div>
      <div id="quiz-feedback" class="quiz-feedback"></div>
    `;

    document.querySelectorAll('.quiz-option').forEach((optionButton) => {
      optionButton.addEventListener('click', () => {
        document.querySelectorAll('.quiz-option').forEach((item) => item.classList.remove('selected'));
        optionButton.classList.add('selected');
      });
    });
  }

  showQuestion(0);

  document.getElementById('quiz-prev').addEventListener('click', () => {
    current = Math.max(0, current - 1);
    showQuestion(current);
  });

  document.getElementById('quiz-next').addEventListener('click', () => {
    current = Math.min(parsed.length - 1, current + 1);
    showQuestion(current);
  });

  document.getElementById('quiz-submit').addEventListener('click', () => {
    const selected = document.querySelector('.quiz-option.selected');
    const feedback = document.getElementById('quiz-feedback');

    if (!selected) {
      feedback.textContent = 'Select an answer.';
      return;
    }

    const chosen = Number(selected.dataset.idx);
    const correct = parsed[current].answer_index != null
      ? parsed[current].answer_index
      : parsed[current].correct;

    if (chosen === Number(correct)) {
      feedback.innerHTML = '<span class="correct">Correct ✓</span>';
      selected.classList.add('correct');
    } else {
      feedback.innerHTML = `<span class="wrong">Wrong ✕ — Answer: ${escapeHtml(optionsLabel(parsed[current], correct))}</span>`;
      selected.classList.add('wrong');
    }
  });
}

function renderInterview(data) {
  const items = data.dialogue || data.chat || data.messages || [];
  let parsed = Array.isArray(items) && items.length ? items : [];

  if (!parsed.length) {
    const raw = safeTextField(data, 'content', 'text') || JSON.stringify(data, null, 2);
    parsed = String(raw).split(/\n\n+/).map((text, index) => ({
      role: index % 2 ? 'user' : 'ai',
      text,
    }));
  }

  latestResult = JSON.stringify(parsed, null, 2);

  resultArea.innerHTML = `
    <div class="chat-panel">
      <div id="chat-window" class="chat-window"></div>
      <div class="chat-input">
        <input id="user-reply" placeholder="Type your answer..." />
        <button id="send-reply" type="button">Send</button>
      </div>
    </div>
  `;

  const chatWindow = document.getElementById('chat-window');

  parsed.forEach((message) => {
    const className = message.role === 'user' ? 'bubble user' : 'bubble ai';
    chatWindow.insertAdjacentHTML('beforeend', `<div class="${className}">${escapeHtml(message.text)}</div>`);
  });

  const userInput = document.getElementById('user-reply');

  document.getElementById('send-reply').addEventListener('click', () => {
    const text = userInput.value.trim();
    if (!text) return;

    chatWindow.insertAdjacentHTML('beforeend', `<div class="bubble user">${escapeHtml(text)}</div>`);
    userInput.value = '';

    const loader = document.createElement('div');
    loader.className = 'bubble ai typing';
    loader.textContent = 'AI is typing...';
    chatWindow.appendChild(loader);

    setTimeout(() => {
      loader.remove();
      chatWindow.insertAdjacentHTML(
        'beforeend',
        '<div class="bubble ai">Thanks — here is a follow-up question based on your answer.</div>'
      );
    }, 900);
  });
}

function renderPlan(data) {
  const tasks = data.tasks || data.plan || [];
  let parsed = Array.isArray(tasks) && tasks.length ? tasks : [];

  if (!parsed.length) {
    try {
      parsed = JSON.parse(safeTextField(data, 'content', 'text') || '[]');
    } catch {
      parsed = [];
    }
  }

  if (!parsed.length) {
    renderRaw('Planner', data);
    return;
  }

  latestResult = JSON.stringify(parsed, null, 2);

  resultArea.innerHTML = `
    <div class="planner">
      ${parsed.map((task) => `
        <div class="plan-card">
          <div class="plan-left">
            <h4>${escapeHtml(task.title || task.task || '')}</h4>
            <div class="muted">${escapeHtml(task.days || task.duration || '')}</div>
          </div>
          <div class="plan-right">
            <div class="progress">
              <div class="progress-bar" style="width:${Number(task.progress || task.done_percent || 0)}%"></div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderTranslate(data) {
  const original = safeTextField(data, 'original', 'source_text', 'text') || safeTextField(data, 'content') || JSON.stringify(data);
  const translated = safeTextField(data, 'translated', 'target_text', 'translation') || '';
  const from = data.from_lang || data.source_lang || 'Source';
  const to = data.to_lang || data.target_lang || 'Target';

  latestResult = translated || original;

  resultArea.innerHTML = `
    <div class="translate-grid">
      <div class="translate-card">
        <div class="lang">${escapeHtml(from)}</div>
        <pre class="translate-text">${escapeHtml(original)}</pre>
        <button class="copy-btn" type="button" data-copy>Copy</button>
      </div>
      <div class="translate-card">
        <div class="lang">${escapeHtml(to)}</div>
        <pre class="translate-text">${escapeHtml(translated)}</pre>
        <button class="copy-btn" type="button" data-copy>Copy</button>
      </div>
    </div>
  `;

  resultArea.querySelectorAll('.copy-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const text = button.previousElementSibling.textContent;
      navigator.clipboard?.writeText(text);
      button.textContent = 'Copied';
      setTimeout(() => {
        button.textContent = 'Copy';
      }, 1000);
    });
  });
}