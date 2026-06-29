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

function showLoadingSkeleton(action) {
  resultArea.innerHTML = `
    <div class="skeleton">
      <div class="skeleton-header"></div>
      <div class="skeleton-lines"></div>
    </div>
  `;
}

function renderRaw(title, content) {
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
          // Dispatch to renderers based on action
          if (action === 'summary') {
            renderSummary(data);
          } else if (action === 'notes') {
            renderNotes(data);
          } else if (action === 'flashcards') {
            renderFlashcards(data);
          } else if (action === 'quiz') {
            renderQuiz(data);
          } else if (action === 'interview') {
            renderInterview(data);
          } else if (action === 'plan') {
            renderPlan(data);
          } else if (action === 'translate') {
            renderTranslate(data);
          } else if (action === 'export') {
            renderRaw('Export', JSON.stringify(data, null, 2));
          } else {
            renderRaw('Result', JSON.stringify(data, null, 2));
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

// ---------- Renderers ----------
function safeTextField(obj, ...keys) {
  for (const k of keys) if (obj[k]) return obj[k];
  return null;
}

function renderSummary(data) {
  const title = safeTextField(data, 'title', 'summary_title') || 'Summary';
  const body = safeTextField(data, 'summary', 'content', 'text') || JSON.stringify(data, null, 2);
  // Try to split into points
  const points = Array.isArray(body) ? body : String(body).split(/\n\n|\n- |\n\* |\n/).filter(Boolean);
  const highlight = (data.highlights && data.highlights.slice(0,3)) || [];

  resultArea.innerHTML = `
    <div class="summary-card">
      <div class="summary-header"><h3>${title}</h3><div class="summary-meta">Key takeaways</div></div>
      <ul class="summary-points">${points.map(p=>`<li>${p}</li>`).join('')}</ul>
      ${highlight.length? `<div class="summary-highlights"><strong>Highlights:</strong> ${highlight.map(h=>`<span class="pill">${h}</span>`).join(' ')}</div>`: ''}
    </div>
  `;
}

function renderNotes(data) {
  const sections = data.sections || data.notes || null;
  if (!sections) {
    // try to parse from text
    const raw = safeTextField(data, 'content', 'notes', 'text') || JSON.stringify(data, null, 2);
    const parts = String(raw).split(/\n\n+/).filter(Boolean);
    resultArea.innerHTML = `<div class="notes-grid">${parts.map((p,i)=>`<div class="note-card"><h4>Note ${i+1}</h4><p>${p}</p></div>`).join('')}</div>`;
    return;
  }
  resultArea.innerHTML = `<div class="notes-grid">${sections.map(s=>`<div class="note-card"><h4>${s.title||'Section'}</h4><div class="note-body">${(s.points||[]).map(pt=>`<div class="note-line">• ${pt}</div>`).join('')}</div></div>`).join('')}</div>`;
}

// Flashcards
function renderFlashcards(data) {
  const cards = data.cards || data.flashcards || [];
  let parsed = [];
  if (Array.isArray(cards) && cards.length) parsed = cards;
  else {
    // try to parse from text
    try { const body = safeTextField(data,'content','text') || JSON.stringify(data); parsed = JSON.parse(body); } catch(e) {
      const raw = safeTextField(data,'content','text') || '';
      const blocks = String(raw).split(/\n\n+/).filter(Boolean);
      parsed = blocks.map(b=>{ const [q,a] = b.split(/\n+/); return {front:q||b, back: a||''};});
    }
  }

  if (!parsed.length) { renderRaw('Flashcards', JSON.stringify(data, null, 2)); return; }

  resultArea.innerHTML = `
    <div class="flashcards">
      <div class="card-stage">
        ${parsed.map((c,i)=>`<div class="flashcard" data-index="${i}"><div class="front">${c.front||c.q||c.question||''}</div><div class="back">${c.back||c.a||c.answer||''}</div></div>`).join('')}
      </div>
      <div class="card-controls"><button id="prev-card">◀ Prev</button><div id="card-counter">1 / ${parsed.length}</div><button id="next-card">Next ▶</button></div>
    </div>
  `;

  const cardsEl = Array.from(resultArea.querySelectorAll('.flashcard'));
  let idx = 0;
  function show(i) {
    cardsEl.forEach((el,j)=> el.classList.toggle('active', j===i));
    resultArea.querySelector('#card-counter').textContent = `${i+1} / ${cardsEl.length}`;
  }
  show(0);
  resultArea.querySelectorAll('.flashcard').forEach(el=> el.addEventListener('click', ()=> el.classList.toggle('flipped')));
  resultArea.querySelector('#prev-card').addEventListener('click', ()=>{ idx = (idx-1+cardsEl.length)%cardsEl.length; show(idx); });
  resultArea.querySelector('#next-card').addEventListener('click', ()=>{ idx = (idx+1)%cardsEl.length; show(idx); });
}

// Quiz
function renderQuiz(data) {
  const qs = data.questions || data.quiz || [];
  let parsed = [];
  if (Array.isArray(qs) && qs.length) parsed = qs;
  else {
    try { parsed = JSON.parse(safeTextField(data,'content','text')||'[]'); } catch(e) { parsed = []; }
  }
  if (!parsed.length) { renderRaw('Quiz', JSON.stringify(data, null, 2)); return; }

  let current = 0; let score = 0;
  resultArea.innerHTML = `<div class="quiz-card"><div id="quiz-progress" class="quiz-progress">1 / ${parsed.length}</div><div id="quiz-body"></div><div class="quiz-controls"><button id="quiz-prev">◀</button><button id="quiz-submit">Submit</button><button id="quiz-next">▶</button></div></div>`;

  function showQuestion(i) {
    const q = parsed[i];
    const options = q.options || q.choices || [];
    document.getElementById('quiz-progress').textContent = `${i+1} / ${parsed.length}`;
    const optsHtml = options.map((o,idx)=>`<button class="quiz-option" data-idx="${idx}">${o}</button>`).join('');
    document.getElementById('quiz-body').innerHTML = `<h4>${q.question||q.q}</h4><div class="quiz-options">${optsHtml}</div><div id="quiz-feedback" class="quiz-feedback"></div>`;
    Array.from(document.querySelectorAll('.quiz-option')).forEach(btn=> btn.addEventListener('click', ()=> {
      document.querySelectorAll('.quiz-option').forEach(b=> b.classList.remove('selected'));
      btn.classList.add('selected');
    }));
  }

  showQuestion(0);
  document.getElementById('quiz-prev').addEventListener('click', ()=>{ current = Math.max(0, current-1); showQuestion(current); });
  document.getElementById('quiz-next').addEventListener('click', ()=>{ current = Math.min(parsed.length-1, current+1); showQuestion(current); });
  document.getElementById('quiz-submit').addEventListener('click', ()=>{
    const sel = document.querySelector('.quiz-option.selected');
    const feedback = document.getElementById('quiz-feedback');
    if (!sel) { feedback.textContent = 'Select an answer.'; return; }
    const chosen = Number(sel.dataset.idx);
    const correct = parsed[current].answer_index != null ? parsed[current].answer_index : parsed[current].correct;
    const isCorrect = chosen === Number(correct);
    if (isCorrect) { score++; feedback.innerHTML = '<span class="correct">Correct ✓</span>'; sel.classList.add('correct'); }
    else { feedback.innerHTML = `<span class="wrong">Wrong ✖ — Answer: ${optionsLabel(parsed[current], correct)}</span>`; sel.classList.add('wrong'); }
  });

  function optionsLabel(q, idx) { if (!q) return ''; const opts=q.options||q.choices||[]; return opts[idx]||idx; }
}

// Interview chat
function renderInterview(data) {
  const items = data.dialogue || data.chat || data.messages || [];
  let parsed = Array.isArray(items) && items.length ? items : [];
  if (!parsed.length) {
    const raw = safeTextField(data,'content','text') || JSON.stringify(data, null, 2);
    parsed = String(raw).split(/\n\n+/).map((t,i)=> ({role: i%2? 'user':'ai', text: t}));
  }

  resultArea.innerHTML = `<div class="chat-panel"><div id="chat-window" class="chat-window"></div><div class="chat-input"><input id="user-reply" placeholder="Type your answer..."/><button id="send-reply">Send</button></div></div>`;
  const win = document.getElementById('chat-window');
  parsed.forEach(m=> { const cls = m.role==='user'? 'bubble user':'bubble ai'; win.insertAdjacentHTML('beforeend', `<div class="${cls}">${m.text}</div>`); });

  const userInput = document.getElementById('user-reply');
  document.getElementById('send-reply').addEventListener('click', ()=>{
    const txt = userInput.value.trim(); if(!txt) return; win.insertAdjacentHTML('beforeend', `<div class="bubble user">${txt}</div>`); userInput.value=''; // simulate AI typing
    const loader = document.createElement('div'); loader.className='bubble ai typing'; loader.textContent='AI is typing...'; loader.dataset.typing='true'; win.appendChild(loader);
    setTimeout(()=>{ loader.remove(); win.insertAdjacentHTML('beforeend', `<div class="bubble ai">Thanks — here's a follow-up question based on your answer.</div>`); }, 900);
  });
}

// Planner
function renderPlan(data) {
  const tasks = data.tasks || data.plan || [];
  let parsed = Array.isArray(tasks) && tasks.length ? tasks : [];
  if (!parsed.length) {
    try { parsed = JSON.parse(safeTextField(data,'content','text')||'[]'); } catch(e){ parsed = []; }
  }
  if (!parsed.length) { renderRaw('Planner', JSON.stringify(data, null, 2)); return; }

  resultArea.innerHTML = `<div class="planner">${parsed.map(t=>`<div class="plan-card"><div class="plan-left"><h4>${t.title||t.task}</h4><div class="muted">${t.days||t.duration||''}</div></div><div class="plan-right"><div class="progress"><div class="progress-bar" style="width:${(t.progress||t.done_percent||0)}%"></div></div></div></div>`).join('')}</div>`;
}

// Translate
function renderTranslate(data) {
  const orig = safeTextField(data,'original','source_text','text') || safeTextField(data,'content') || JSON.stringify(data);
  const trans = safeTextField(data,'translated','target_text','translation') || safeTextField(data,'translation') || '';
  const from = data.from_lang || data.source_lang || 'Source';
  const to = data.to_lang || data.target_lang || 'Target';

  resultArea.innerHTML = `
    <div class="translate-grid">
      <div class="translate-card"><div class="lang">${from}</div><pre class="translate-text">${orig}</pre><button class="copy-btn" data-copy>${'Copy'}</button></div>
      <div class="translate-card"><div class="lang">${to}</div><pre class="translate-text">${trans}</pre><button class="copy-btn" data-copy>${'Copy'}</button></div>
    </div>
  `;
  resultArea.querySelectorAll('.copy-btn').forEach(btn=> btn.addEventListener('click', ()=>{ const txt = btn.previousElementSibling.textContent; navigator.clipboard?.writeText(txt); btn.textContent='Copied'; setTimeout(()=>btn.textContent='Copy',1000); }));
}
