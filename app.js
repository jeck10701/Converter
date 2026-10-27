/* =============================================
   ConvertX – Application Logic
   ============================================= */

// ============ Data ============
const FORMATS = {
  image: {
    label: 'Images',
    color: '#378add',
    icon: `<path fill-rule="evenodd" d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM5 5v11l4-4.5 3 3.5 3.5-4.5L19 15.5V5zm4 1.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"/>`,
    formats: ['JPG','JPEG','PNG','WEBP','AVIF','HEIC','HEIF','TIFF','BMP','GIF','ICO','PSD','TGA','SVG','SVGZ']
  },
  doc: {
    label: 'Documents',
    color: '#4a84d4',
    icon: `<path fill-rule="evenodd" d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm7 1.5V9h5.5zM7 12h10v1.8H7zm0 3.4h10v1.8H7zm0 3.4h6.5v1.8H7z"/>`,
    formats: ['PDF','DOCX','DOC','ODT','RTF','TXT','XLSX','XLS','CSV','PPTX','PPT','ODP','HTML','MHTML','Markdown','EPUB']
  },
  video: {
    label: 'Video',
    color: '#E06C75',
    icon: `<path d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"/>`,
    formats: ['MP4','MOV','MKV','WEBM','AVI','M4V','WMV','FLV','MPEG','TS','3GP','GIF']
  },
  audio: {
    label: 'Audio',
    color: '#1D9E75',
    icon: `<path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>`,
    formats: ['MP3','M4A','AAC','WAV','FLAC','OGG','OPUS','WMA','AIFF','AC3']
  },
  ebook: {
    label: 'E-books',
    color: '#E5C07B',
    icon: `<path d="M19 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1zM6 4h12v12H6zM6 20v-2h12v2z"/>`,
    formats: ['EPUB','MOBI','AZW','AZW3','FB2','CBZ','CBR','PDF']
  },
  archive: {
    label: 'Archives',
    color: '#C678DD',
    icon: `<path d="M20 6h-2.18c.07-.31.18-.62.18-1a3 3 0 0 0-3-3c-1 0-1.87.5-2.44 1.25L12 4 11.44 3.25C10.87 2.5 10 2 9 2a3 3 0 0 0-3 3c0 .38.11.69.18 1H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z"/>`,
    formats: ['ZIP','7Z','TAR','GZ','BZ2','RAR','TAR.GZ','TAR.XZ']
  },
  vector: {
    label: 'Vector',
    color: '#56B6C2',
    icon: `<path fill-rule="evenodd" d="M3 15h6v6H3zM15 3h6v6h-6zM5 15c0-5.5 4.5-10 10-10v2c-4.4 0-8 3.6-8 8z"/>`,
    formats: ['SVG','SVGZ','EMF','WMF','AI','EPS','PS','CDR','DXF']
  },
  '3d': {
    label: '3D Models',
    color: '#7F77DD',
    icon: `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>`,
    formats: ['GLB','glTF','STL','OBJ','3MF','PLY','FBX']
  }
};

const FILE_EXT_MAP = {
  // images
  jpg:'image', jpeg:'image', png:'image', webp:'image', avif:'image',
  heic:'image', heif:'image', tiff:'image', bmp:'image', gif:'image',
  ico:'image', psd:'image', tga:'image', svg:'vector', svgz:'vector',
  // docs
  pdf:'doc', docx:'doc', doc:'doc', odt:'doc', rtf:'doc', txt:'doc',
  xlsx:'doc', xls:'doc', csv:'doc', pptx:'doc', ppt:'doc', odp:'doc',
  html:'doc', mhtml:'doc', md:'doc', epub:'ebook', mobi:'ebook',
  azw:'ebook', azw3:'ebook', fb2:'ebook', cbz:'ebook', cbr:'ebook',
  // video
  mp4:'video', mov:'video', mkv:'video', webm:'video', avi:'video',
  m4v:'video', wmv:'video', flv:'video', mpeg:'video', ts:'video', '3gp':'video',
  // audio
  mp3:'audio', m4a:'audio', aac:'audio', wav:'audio', flac:'audio',
  ogg:'audio', opus:'audio', wma:'audio', aiff:'audio', ac3:'audio',
  // archive
  zip:'archive', '7z':'archive', tar:'archive', gz:'archive',
  bz2:'archive', rar:'archive',
  // 3d
  glb:'3d', gltf:'3d', stl:'3d', obj:'3d', '3mf':'3d', ply:'3d', fbx:'3d',
  // vector
  emf:'vector', wmf:'vector', ai:'vector', eps:'vector', cdr:'vector',
};

const FAQS = [
  {
    q: 'Is ConvertX really free?',
    a: 'Yes. ConvertX is completely free with no ads, no watermarks, no account, no trial, and no file-count or file-size limits of its own.'
  },
  {
    q: 'Are my files uploaded anywhere?',
    a: 'No. Every conversion runs right in your browser using WebAssembly and the File API. Your files never leave your device.'
  },
  {
    q: 'Which formats does ConvertX support?',
    a: 'ConvertX supports 255+ formats across 8 categories: images, documents, video, audio, e-books, archives, vector graphics, and 3D models.'
  },
  {
    q: 'Can I convert multiple files at once?',
    a: 'Yes! Drop as many files as you like. ConvertX queues them and converts in parallel. A failed file never stops the others.'
  },
  {
    q: 'Does it work offline?',
    a: 'Once the page is loaded, most conversions work without internet. Some heavy engines may need a one-time download.'
  },
  {
    q: 'How do I use the donut format picker?',
    a: 'Drag a file into the drop zone. A donut of compatible formats appears. Hover over a format and release to convert.'
  }
];

// ============ State ============
let queue = [];
let history = [];
let results = [];
let activeCat = 'all';
let convertCount = 0;
const MAX_CONVERT = 20;

// ============ Init ============
document.addEventListener('DOMContentLoaded', () => {
  buildMarquees();
  buildFormatCatsGrid();
  buildFAQ();
  buildModalCats();
  buildModalFormats('all', '');
  restoreTheme();
});

// ============ Theme ============
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const icon = document.getElementById('themeIcon');
  const isLight = document.body.classList.contains('light-theme');
  icon.innerHTML = isLight
    ? '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2v-2H2v2zm18 0h2v-2h-2v2zM11 2v2h2V2h-2zm0 18v2h2v-2h-2zM5.99 4.58 4.57 6l1.42 1.42L7.4 6 5.99 4.58zm12.02 12.02-1.42 1.42 1.41 1.41 1.42-1.41-1.41-1.42zM5.99 19.44l1.42-1.42-1.41-1.42-1.42 1.42 1.41 1.42zM18.01 4.58l-1.41 1.42 1.41 1.42 1.42-1.42-1.42-1.42z"/>'
    : '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>';
  localStorage.setItem('cx-theme', isLight ? 'light' : 'dark');
}
function restoreTheme() {
  if (localStorage.getItem('cx-theme') === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('themeIcon').innerHTML = '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2v-2H2v2zm18 0h2v-2h-2v2zM11 2v2h2V2h-2zm0 18v2h2v-2h-2zM5.99 4.58 4.57 6l1.42 1.42L7.4 6 5.99 4.58zm12.02 12.02-1.42 1.42 1.41 1.41 1.42-1.41-1.41-1.42zM5.99 19.44l1.42-1.42-1.41-1.42-1.42 1.42 1.41 1.42zM18.01 4.58l-1.41 1.42 1.41 1.42 1.42-1.42-1.42-1.42z"/>';
  }
}

// ============ Sidebar ============
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

function filterCat(cat) {
  activeCat = cat;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`[data-cat="${cat}"]`).classList.add('active');
}

// ============ Drag & Drop ============
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('dropzone').classList.add('drag-over');
}

function handleDragLeave(e) {
  if (!document.getElementById('dropzone').contains(e.relatedTarget)) {
    document.getElementById('dropzone').classList.remove('drag-over');
  }
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById('dropzone').classList.remove('drag-over');
  const files = Array.from(e.dataTransfer.files);
  if (files.length > 0) {
    addFilesToQueue(files);
    showDonut(files[0]);
  }
}

function handleFileSelect(fileList) {
  const files = Array.from(fileList);
  if (files.length > 0) {
    addFilesToQueue(files);
    showFormatPicker();
  }
}

// ============ Queue ============
function addFilesToQueue(files) {
  files.forEach(file => {
    if (!queue.find(f => f.name === file.name && f.size === file.size)) {
      queue.push(file);
    }
  });
  renderQueue();
}

function renderQueue() {
  const qEl = document.getElementById('fileQueue');
  const listEl = document.getElementById('queueList');
  const titleEl = document.getElementById('queueTitle');

  if (queue.length === 0) {
    qEl.style.display = 'none';
    return;
  }

  qEl.style.display = 'block';
  titleEl.textContent = `${queue.length} file${queue.length !== 1 ? 's' : ''} ready to convert`;
  listEl.innerHTML = queue.map((f, i) => {
    const ext = getExt(f.name);
    const cat = FILE_EXT_MAP[ext] || 'other';
    return `
      <li class="queue-item">
        <div class="queue-icon type-${cat}">${ext.toUpperCase()}</div>
        <div class="queue-info">
          <div class="queue-name">${f.name}</div>
          <div class="queue-size">${formatSize(f.size)}</div>
        </div>
        <button class="queue-remove" onclick="removeFromQueue(${i})" title="Remove">
          <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </li>`;
  }).join('');
}

function removeFromQueue(i) {
  queue.splice(i, 1);
  renderQueue();
}

function clearQueue() {
  queue = [];
  renderQueue();
  document.getElementById('donutOverlay').classList.remove('active');
  toast('Queue cleared', 'info');
}

// ============ Donut ============
function showDonut(file) {
  const ext = getExt(file.name);
  const cat = FILE_EXT_MAP[ext] || null;
  const overlay = document.getElementById('donutOverlay');
  const ring = document.getElementById('donutRing');
  const fn = document.getElementById('donutFileName');

  fn.textContent = file.name.length > 14 ? file.name.slice(0, 12) + '…' : file.name;

  // Pick compatible formats
  let segments = [];
  if (cat && FORMATS[cat]) {
    segments = FORMATS[cat].formats.filter(f => f.toLowerCase() !== ext);
  }
  // Supplement with other categories
  const allFmts = Object.entries(FORMATS).flatMap(([k, v]) => v.formats.map(f => ({ f, cat: k, color: v.color })));
  if (segments.length < 8) {
    const extras = allFmts.filter(x => !segments.includes(x.f) && x.f.toLowerCase() !== ext).slice(0, 8 - segments.length);
    extras.forEach(x => segments.push(x.f));
  }
  segments = segments.slice(0, 12);

  ring.innerHTML = buildDonutSVG(segments, cat);
  overlay.classList.add('active');
}

function buildDonutSVG(segments, sourceCat) {
  const n = segments.length;
  const cx = 160, cy = 160, r_outer = 150, r_inner = 65;
  const angleStep = (2 * Math.PI) / n;
  const gap = 0.04; // radians gap between segments

  let svg = `<svg class="donut-svg" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">`;

  segments.forEach((fmt, i) => {
    const startAngle = i * angleStep - Math.PI / 2 + gap / 2;
    const endAngle   = (i + 1) * angleStep - Math.PI / 2 - gap / 2;

    const x1o = cx + r_outer * Math.cos(startAngle);
    const y1o = cy + r_outer * Math.sin(startAngle);
    const x2o = cx + r_outer * Math.cos(endAngle);
    const y2o = cy + r_outer * Math.sin(endAngle);
    const x1i = cx + r_inner * Math.cos(endAngle);
    const y1i = cy + r_inner * Math.sin(endAngle);
    const x2i = cx + r_inner * Math.cos(startAngle);
    const y2i = cy + r_inner * Math.sin(startAngle);
    const largeArc = (angleStep - gap) > Math.PI ? 1 : 0;

    const d = `M ${x1o} ${y1o} A ${r_outer} ${r_outer} 0 ${largeArc} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${r_inner} ${r_inner} 0 ${largeArc} 0 ${x2i} ${y2i} Z`;

    // pick color
    const fmtCat = Object.entries(FILE_EXT_MAP).find(([k,v]) => k === fmt.toLowerCase())?.[1]
      || (sourceCat || 'other');
    const color = FORMATS[fmtCat]?.color || '#7F77DD';

    // label position
    const midAngle = (startAngle + endAngle) / 2;
    const r_mid = (r_outer + r_inner) / 2;
    const lx = cx + r_mid * Math.cos(midAngle);
    const ly = cy + r_mid * Math.sin(midAngle);

    const label = fmt.length > 5 ? fmt.slice(0, 5) : fmt;

    svg += `
      <g class="donut-segment" onclick="convertSelected('${fmt}')" style="cursor:pointer">
        <path class="donut-path" d="${d}" fill="${color}" opacity="0.82">
          <animate attributeName="opacity" from="0" to="0.82" dur="0.3s" begin="${i * 0.04}s" fill="freeze"/>
        </path>
        <path d="${d}" fill="transparent" stroke="none" class="donut-hover-hit"/>
        <text class="donut-label" x="${lx}" y="${ly}" font-size="11" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle">${label}</text>
      </g>`;
  });

  svg += `
    <style>
      .donut-segment:hover path.donut-path { opacity: 1 !important; filter: brightness(1.2); }
      .donut-segment { transition: all 0.15s; }
    </style>
  </svg>`;

  return svg;
}

function closeDonut() {
  document.getElementById('donutOverlay').classList.remove('active');
}

// ============ Format Picker Modal ============
function showFormatPicker() {
  if (queue.length === 0) {
    toast('Add files first!', 'error');
    return;
  }
  document.getElementById('formatModal').style.display = 'flex';
  document.getElementById('modalSearchInput').value = '';
  buildModalFormats('all', '');
}

function closeFormatModal(e) {
  if (!e || e.target === document.getElementById('formatModal')) {
    document.getElementById('formatModal').style.display = 'none';
  }
}

function buildModalCats() {
  const el = document.getElementById('modalCats');
  el.innerHTML = `<button class="cat-chip active" onclick="switchModalCat('all', this)">All</button>`;
  Object.entries(FORMATS).forEach(([k, v]) => {
    el.innerHTML += `<button class="cat-chip" onclick="switchModalCat('${k}', this)">${v.label}</button>`;
  });
}

function switchModalCat(cat, btn) {
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  buildModalFormats(cat, document.getElementById('modalSearchInput').value);
}

function filterModalFormats(q) {
  const active = document.querySelector('.cat-chip.active');
  const cat = active?.textContent === 'All' ? 'all' : Object.keys(FORMATS).find(k => FORMATS[k].label === active?.textContent) || 'all';
  buildModalFormats(cat, q);
}

function buildModalFormats(cat, query) {
  const el = document.getElementById('modalFormats');
  el.innerHTML = '';
  const q = query.trim().toLowerCase();

  const cats = cat === 'all' ? Object.entries(FORMATS) : [[cat, FORMATS[cat]]];
  cats.forEach(([k, v]) => {
    const filtered = v.formats.filter(f => !q || f.toLowerCase().includes(q));
    if (filtered.length === 0) return;
    const group = document.createElement('div');
    group.className = 'format-group';
    group.innerHTML = `<div class="format-group-title">${v.label}</div>
      <div class="format-chips">${filtered.map(f => `<button class="format-chip" onclick="convertSelected('${f}')">${f}</button>`).join('')}</div>`;
    el.appendChild(group);
  });
}

// ============ Conversion ============
function convertSelected(toFmt) {
  closeFormatModal();
  closeDonut();

  if (queue.length === 0) {
    toast('No files in queue!', 'error');
    return;
  }

  const filesToConvert = [...queue];
  queue = [];
  renderQueue();

  const resultsSection = document.getElementById('resultsSection');
  resultsSection.style.display = 'block';
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  filesToConvert.forEach((file, idx) => {
    const resultId = `result-${Date.now()}-${idx}`;
    addResultItem(file, toFmt, resultId);
    simulateConversion(file, toFmt, resultId);
  });

  // Update history
  filesToConvert.forEach(f => {
    const ext = getExt(f.name);
    history.unshift({ from: ext.toUpperCase(), to: toFmt, time: new Date().toLocaleTimeString() });
    convertCount++;
  });
  renderHistory();
  updateStorageBar();
  document.getElementById('convertCount').textContent = `${convertCount} file${convertCount !== 1 ? 's' : ''} converted`;
}

function addResultItem(file, toFmt, id) {
  const list = document.getElementById('resultsList');
  const ext = getExt(file.name);
  const cat = FILE_EXT_MAP[ext] || 'other';
  const toCat = Object.entries(FILE_EXT_MAP).find(([k,v]) => k === toFmt.toLowerCase())?.[1] || 'other';
  const circumference = 2 * Math.PI * 18;

  const li = document.createElement('li');
  li.id = id;
  li.className = 'result-item';
  li.innerHTML = `
    <div class="result-progress" id="prog-${id}">
      <svg><circle class="result-progress-track" cx="22" cy="22" r="18"/><circle class="result-progress-fill" cx="22" cy="22" r="18" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}" id="fill-${id}"/></svg>
      <span class="result-percent" id="pct-${id}">0%</span>
    </div>
    <div class="result-info">
      <div class="result-name">${file.name}</div>
      <div class="result-meta result-arrow" id="meta-${id}">
        <span class="queue-icon type-${cat}" style="display:inline;padding:2px 5px;border-radius:4px;font-size:10px">${ext.toUpperCase()}</span>
        →
        <span style="color:var(--accent);font-weight:700">${toFmt}</span>
        · Converting…
      </div>
    </div>
    <div class="result-actions" id="actions-${id}"></div>`;
  list.prepend(li);
}

function simulateConversion(file, toFmt, id) {
  const duration = 800 + Math.random() * 1400;
  const start = Date.now();
  const circumference = 2 * Math.PI * 18;

  function update() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const pct = Math.round(progress * 100);
    const offset = circumference - (circumference * progress);

    const fillEl = document.getElementById(`fill-${id}`);
    const pctEl = document.getElementById(`pct-${id}`);
    if (fillEl) fillEl.style.strokeDashoffset = offset;
    if (pctEl) pctEl.textContent = pct + '%';

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      onConversionDone(file, toFmt, id);
    }
  }
  requestAnimationFrame(update);
}

function onConversionDone(file, toFmt, id) {
  const ext = getExt(file.name);
  const newName = file.name.replace(/\.[^.]+$/, '') + '.' + toFmt.toLowerCase();
  const cat = FILE_EXT_MAP[ext] || 'other';

  const progEl = document.getElementById(`prog-${id}`);
  if (progEl) {
    progEl.innerHTML = `<div class="result-icon type-${cat}">${toFmt}</div>`;
  }
  const metaEl = document.getElementById(`meta-${id}`);
  if (metaEl) {
    metaEl.innerHTML = `Converted from <strong>${ext.toUpperCase()}</strong> → <strong style="color:var(--accent)">${toFmt}</strong> · ${formatSize(file.size)} · Done ✓`;
    metaEl.style.color = 'var(--green)';
  }
  const actEl = document.getElementById(`actions-${id}`);
  if (actEl) {
    actEl.innerHTML = `<button class="result-btn download" onclick="downloadResult('${newName}', '${toFmt}')">
      <svg viewBox="0 0 24 24"><path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/></svg>
      Download
    </button>`;
  }

  toast(`✓ ${file.name} → ${toFmt}`, 'success');
}

function downloadResult(fileName, fmt) {
  // In a real app this would trigger actual download
  // Here we simulate it with a dummy text blob
  const dummy = `ConvertX Demo: This is a simulated ${fmt} file.\nFilename: ${fileName}\nGenerated by ConvertX.`;
  const blob = new Blob([dummy], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  toast(`Downloading ${fileName}`, 'success');
}

function clearResults() {
  results = [];
  document.getElementById('resultsList').innerHTML = '';
  document.getElementById('resultsSection').style.display = 'none';
}

// ============ Search ============
function searchFormats(q) {
  if (q.trim().length < 2) return;
  showFormatPicker();
  document.getElementById('modalSearchInput').value = q;
  filterModalFormats(q);
}

// ============ History Panel ============
function toggleHistory() {
  document.getElementById('historyPanel').classList.toggle('open');
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (history.length === 0) {
    list.innerHTML = '<li class="history-empty">No conversions yet.</li>';
    return;
  }
  list.innerHTML = history.slice(0, 30).map(h =>
    `<li class="history-item">
      <span class="history-from">${h.from}</span>
      <span class="history-arrow">→</span>
      <span class="history-to">${h.to}</span>
      <span class="history-time">${h.time}</span>
    </li>`
  ).join('');
}

function updateStorageBar() {
  const pct = Math.min((convertCount / MAX_CONVERT) * 100, 100);
  document.getElementById('storageFill').style.width = pct + '%';
}

// ============ Marquees ============
function buildMarquees() {
  const row1 = ['JPG','PNG','HEIC','WEBP','AVIF','PSD','SVG','PDF','DOCX','XLSX','PPTX','MP4','MOV','MKV','MP3','FLAC','EPUB','ZIP','7Z'];
  const row2 = ['WEBM','AVI','WAV','M4A','MOBI','RAR','GIF','ICO','DOC','ODP','CSV','TXT','HTML','BMP','TGA','AI','EPS','GLB','STL'];

  function chips(arr) { return arr.map(f => `<span class="chip">${f}</span>`).join(''); }
  ['marquee1','marquee1b'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = chips(row1); });
  ['marquee2','marquee2b'].forEach(id => { const el = document.getElementById(id); if (el) el.innerHTML = chips(row2); });
}

// ============ Format Cats Grid ============
function buildFormatCatsGrid() {
  const el = document.getElementById('formatCatsGrid');
  if (!el) return;
  el.innerHTML = Object.entries(FORMATS).map(([k, v]) => `
    <div class="fcat-card" onclick="filterCat('${k}'); showFormatPicker()">
      <div class="fcat-icon type-${k}" style="background:${v.color}22; color:${v.color}">
        <svg viewBox="0 0 24 24">${v.icon}</svg>
      </div>
      <div class="fcat-name">${v.label}</div>
      <div class="fcat-count">${v.formats.length} formats</div>
      <div class="fcat-sample">${v.formats.slice(0, 4).join(' · ')}</div>
    </div>`
  ).join('');
}

// ============ FAQ ============
function buildFAQ() {
  const el = document.getElementById('faqList');
  if (!el) return;
  el.innerHTML = FAQS.map((f, i) => `
    <div class="faq-item" id="faq-${i}">
      <button class="faq-q" onclick="toggleFaq(${i})">
        <span>${f.q}</span>
        <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
      </button>
      <div class="faq-a" id="faq-a-${i}">${f.a}</div>
    </div>`
  ).join('');
}

function toggleFaq(i) {
  const item = document.getElementById(`faq-${i}`);
  const ans = document.getElementById(`faq-a-${i}`);
  const isOpen = item.classList.contains('open');

  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
    el.querySelector('.faq-a').classList.remove('open');
  });

  if (!isOpen) {
    item.classList.add('open');
    ans.classList.add('open');
  }
}

// ============ Helpers ============
function getExt(name) {
  return (name.split('.').pop() || '').toLowerCase();
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function toast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<div class="toast-dot"></div><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'all 0.3s';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// Keyboard: Escape closes modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDonut();
    document.getElementById('formatModal').style.display = 'none';
    document.getElementById('historyPanel').classList.remove('open');
  }
});

// Click outside sidebar to close on mobile
document.addEventListener('click', e => {
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  if (window.innerWidth <= 900 && sidebar.classList.contains('open')) {
    if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  }
});
