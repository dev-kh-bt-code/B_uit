/* ═══════════════════════════════════════════════════
   script.js – UIT Countdown Web
   Phần: HEADER + MAIN
═══════════════════════════════════════════════════ */

/* ─── EVENT DATA ─── */
const EVENTS = [
  { name: "VACT-1",      time: "2026-04-05T07:30:00",
    img: "img/anh1.jpg" },
  { name: "Điểm VACT 1", time: "2026-04-17T09:00:00",
    img: "img/anh2.jpg" },
  { name: "VACT-2",      time: "2026-05-24T07:30:00",
    img: "img/anh3.jpg" },
  { name: "Điểm VACT 2", time: "2026-06-06T09:00:00",
    img: "img/anh4.jpg" },
  { name: "THPT Văn",    time: "2026-06-11T07:30:00",
    img: "img/anh5.jpg" },
  { name: "THPT Toán",   time: "2026-06-11T14:20:00",
    img: "img/anh6.jpg" },
  { name: "THPT Lý Hoá", time: "2026-06-12T07:30:00",
    img: "img/anh7.jpg" },
  { name: "Điểm THPT",  time: "2026-07-01T08:00:00",
    img: "img/anh8.jpg" },
  { name: "Điểm chuẩn", time: "2026-08-20T17:00:00",
    img: "img/anh9.jpg" },
];

/* Timeline progress range */
const TIMELINE_START = new Date("2026-03-22T00:00:00");
const TIMELINE_END   = new Date("2026-07-01T08:00:00");

/* ─── HELPERS ─── */
function formatCountdown(ms) {
  if (ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = n => String(n).padStart(2, '0');
  return `${d} ngày ${pad(h)} giờ ${pad(m)} phút ${pad(s)} giây`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const dd   = String(d.getDate()).padStart(2,'0');
  const mm   = String(d.getMonth()+1).padStart(2,'0');
  const yyyy = d.getFullYear();
  const hh   = String(d.getHours()).padStart(2,'0');
  const min  = String(d.getMinutes()).padStart(2,'0');
  return `${dd}/${mm}/${yyyy} – ${hh}:${min}`;
}

/* ─── STATE ─── */
let hoveredIndex = null;
let isMobile = false;

/* ─── DOM READY ─── */
document.addEventListener('DOMContentLoaded', () => {

  /* ── HEADER animations ── */
  (function initHeaderAnimations() {
    const logo    = document.getElementById('headerLogo');
    const divider = document.getElementById('headerDivider');
    const text    = document.getElementById('headerText');
    if (!logo || !divider || !text) return;
    const delay = (el, ms) => setTimeout(() => el.classList.add('is-visible'), ms);
    delay(logo,    80);
    delay(divider, 300);
    delay(text,    160);
  })();

  /* ── Init main ── */
  isMobile = window.innerWidth <= 768;
  window.addEventListener('resize', () => { isMobile = window.innerWidth <= 768; });

  buildTimeline();
  startCountdowns();
  initScrollProgress();
});

/* ════════════════════════════════════════
   BUILD TIMELINE
════════════════════════════════════════ */
function buildTimeline() {
  const container = document.getElementById('timelineEvents');
  if (!container) return;

  EVENTS.forEach((ev, i) => {
    const isLeft = i % 2 === 0;
    const row = document.createElement('div');
    row.className = `event-row ${isLeft ? 'img-left' : 'img-right'}`;
    row.dataset.index = i;

    /* Image wrap */
    const imgWrap = document.createElement('div');
    imgWrap.className = 'event-image-wrap';
    const img = document.createElement('img');
    img.src = ev.img;
    img.alt = ev.name;
    img.className = 'event-img';
    img.loading = 'lazy';
    imgWrap.appendChild(img);

    /* Node */
    const nodeWrap = document.createElement('div');
    nodeWrap.className = 'event-node';
    const dot = document.createElement('div');
    dot.className = 'node-dot';
    dot.id = `node-${i}`;
    nodeWrap.appendChild(dot);

    /* Card */
    const card = document.createElement('div');
    card.className = 'event-card';

    const tag = document.createElement('div');
    tag.className = 'event-title-tag';
    tag.textContent = `Mốc ${i+1}`;

    const title = document.createElement('div');
    title.className = 'event-title';
    title.textContent = ev.name;

    const timeLabel = document.createElement('div');
    timeLabel.className = 'event-time-label';
    timeLabel.textContent = 'Thời gian';

    const timeVal = document.createElement('div');
    timeVal.className = 'event-time-value';
    timeVal.textContent = formatDate(ev.time);

    const countdown = document.createElement('div');
    countdown.className = 'event-countdown';
    countdown.id = `cd-${i}`;

    const prefix = document.createElement('span');
    prefix.className = 'countdown-prefix';
    prefix.textContent = 'Còn lại';
    countdown.appendChild(prefix);

    const cdVal = document.createElement('span');
    cdVal.id = `cd-val-${i}`;
    cdVal.textContent = '...';
    countdown.appendChild(cdVal);

    card.append(tag, title, timeLabel, timeVal, countdown);

    if (isLeft) {
      row.append(imgWrap, nodeWrap, card);
    } else {
      row.append(card, nodeWrap, imgWrap);
    }

    /* Hover: desktop only */
    row.addEventListener('mouseenter', () => {
      if (!isMobile) {
        hoveredIndex = i;
        updateMainTimer(i);
      }
    });
    row.addEventListener('mouseleave', () => {
      if (!isMobile) {
        hoveredIndex = null;
        updateMainTimerToNext();
      }
    });

    container.appendChild(row);
  });
}

/* ════════════════════════════════════════
   MAIN TIMER
════════════════════════════════════════ */
function getNextEventIndex() {
  const now = Date.now();
  return EVENTS.findIndex(ev => new Date(ev.time).getTime() > now);
}

function setTimerDisplay(label, value) {
  const labelEl   = document.getElementById('timerLabel');
  const displayEl = document.getElementById('timerDisplay');
  if (!labelEl || !displayEl) return;

  displayEl.classList.add('is-fading');
  setTimeout(() => {
    labelEl.textContent   = label;
    displayEl.textContent = value;
    displayEl.classList.remove('is-fading');
  }, 280);
}

function updateMainTimer(index) {
  const ev  = EVENTS[index];
  const ms  = new Date(ev.time).getTime() - Date.now();
  const fmt = formatCountdown(ms);
  if (fmt) {
    setTimerDisplay(`⏱ ${ev.name}`, fmt);
  } else {
    setTimerDisplay(`✓ ${ev.name}`, 'Đã diễn ra');
  }
}

function updateMainTimerToNext() {
  const idx = getNextEventIndex();
  if (idx === -1) {
    setTimerDisplay('Tất cả đã kết thúc', '🎉');
    return;
  }
  updateMainTimer(idx);
}

/* ════════════════════════════════════════
   COUNTDOWN LOOP – 1 second
════════════════════════════════════════ */
function startCountdowns() {
  function tick() {
    const now = Date.now();

    EVENTS.forEach((ev, i) => {
      const ms    = new Date(ev.time).getTime() - now;
      const cdEl  = document.getElementById(`cd-val-${i}`);
      const boxEl = document.getElementById(`cd-${i}`);
      const node  = document.getElementById(`node-${i}`);
      if (!cdEl) return;

      if (ms <= 0) {
        cdEl.textContent = 'Đã diễn ra';
        if (boxEl) boxEl.classList.add('is-past');
        const prefix = boxEl?.querySelector('.countdown-prefix');
        if (prefix) prefix.style.display = 'none';
        if (node) { node.classList.add('is-past'); node.classList.remove('is-next'); }
      } else {
        cdEl.textContent = formatCountdown(ms);
      }
    });

    /* Highlight next event node */
    const nextIdx = getNextEventIndex();
    EVENTS.forEach((_, i) => {
      const node = document.getElementById(`node-${i}`);
      if (!node) return;
      if (i === nextIdx) node.classList.add('is-next');
      else node.classList.remove('is-next');
    });

    /* Update sticky timer */
    if (hoveredIndex === null) {
      updateMainTimerToNext();
    } else {
      updateMainTimer(hoveredIndex);
    }
  }

  tick();
  setInterval(tick, 1000);
}

/* ════════════════════════════════════════
   SCROLL – ANIMATE PROGRESS BAR
════════════════════════════════════════ */
function initScrollProgress() {
  const progressBar = document.getElementById('trackProgress');
  const currentDot  = document.getElementById('trackCurrentDot');
  const main        = document.getElementById('siteMain');
  if (!progressBar || !main) return;

  const now      = Date.now();
  const start    = TIMELINE_START.getTime();
  const end      = TIMELINE_END.getTime();
  const progress = Math.min(Math.max((now - start) / (end - start), 0), 1);

  let animated = false;

  function animateProgress() {
    if (animated) return;
    animated = true;
    setTimeout(() => {
      progressBar.style.height = `${progress * 100}%`;
      if (currentDot) currentDot.style.top = `${progress * 100}%`;
    }, 500);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) animateProgress();
    });
  }, { threshold: 0.05 });

  observer.observe(main);
}

/* ════════════════════════════════════════
   FOOTER – SCORES DATA & RENDER
   ↓ Nhập điểm ở đây ↓
════════════════════════════════════════ */
const SCORES = {
  vact1: null,   // ví dụ: 980  (max 1200) – null = chưa có
  vact2: null,   // ví dụ: 1050 (max 1200)
  toan:  null,   // ví dụ: 8.4  (max 10)
  ly:    null,   // ví dụ: 7.0  (max 10)
  hoa:   null,   // ví dụ: 9.2  (max 10)
  tong:  null,   // ví dụ: 72   (max 100) – điểm tổng hợp
};

const SCORE_MAX = {
  vact1: 1200,
  vact2: 1200,
  toan:  10,
  ly:    10,
  hoa:   10,
  tong:  100,
};

function renderFooterScores() {
  Object.keys(SCORES).forEach(key => {
    const score    = SCORES[key];
    const max      = SCORE_MAX[key];
    const scoreEl  = document.getElementById(`score-${key}`);
    const barEl    = document.getElementById(`bar-${key}`);
    const pctEl    = document.getElementById(`pct-${key}`);
    if (!scoreEl || !barEl || !pctEl) return;

    if (score === null) {
      // Chưa có điểm
      scoreEl.innerHTML = `<span style="color:rgba(255,255,255,0.35);font-size:15px">Chưa có</span> <span>/ ${max}</span>`;
      barEl.style.width = '0%';
      pctEl.textContent = '–';
    } else {
      const pct = Math.min((score / max) * 100, 100);
      // Format score display
      const displayScore = Number.isInteger(score) ? score : score.toFixed(1);
      scoreEl.innerHTML = `${displayScore} <span>/ ${max}</span>`;
      // Animate bar on scroll via IntersectionObserver
      barEl.dataset.targetWidth = `${pct.toFixed(1)}%`;
      pctEl.textContent = `${Math.round(pct)}%`;
    }
  });
}

function initFooterScoreAnimation() {
  const footer = document.getElementById('siteFooter');
  if (!footer) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        // Stagger bar animations
        document.querySelectorAll('.stat-bar-fill').forEach((bar, i) => {
          const target = bar.dataset.targetWidth || '0%';
          setTimeout(() => {
            bar.style.width = target;
          }, i * 80);
        });
      }
    });
  }, { threshold: 0.15 });

  observer.observe(footer);
}

/* Call footer init after DOM ready (appended to DOMContentLoaded) */
document.addEventListener('DOMContentLoaded', () => {
  renderFooterScores();
  initFooterScoreAnimation();
});