/* =============================================
   FINANCIAL NEWS SUMMARIZER — APP LOGIC
   ============================================= */

// ── NAVBAR SCROLL ──────────────────────────────
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

// ── HAMBURGER MENU ─────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

// ── SCROLL REVEAL ─────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── CHARACTER COUNTER ─────────────────────────
const articleInput = document.getElementById('articleInput');
const charCount = document.getElementById('charCount');

articleInput.addEventListener('input', () => {
  const len = articleInput.value.length;
  const words = articleInput.value.trim() ? articleInput.value.trim().split(/\s+/).length : 0;
  charCount.textContent = `${len.toLocaleString()} characters · ${words.toLocaleString()} words`;
});

// ── CLEAR INPUT ───────────────────────────────
function clearInput() {
  articleInput.value = '';
  charCount.textContent = '0 characters';
  document.getElementById('resultCard').style.display = 'none';
  document.getElementById('loadingCard').style.display = 'none';
  articleInput.focus();
}

// ── SUMMARIZE ─────────────────────────────────
function summarize() {
  const text = articleInput.value.trim();

  if (!text || text.length < 80) {
    shakeError(articleInput);
    showToast('Please paste a financial article with at least 80 characters.');
    return;
  }

  const resultCard = document.getElementById('resultCard');
  const loadingCard = document.getElementById('loadingCard');
  const summaryOutput = document.getElementById('summaryOutput');
  const rougeBadges = document.getElementById('rougeBadges');

  resultCard.style.display = 'none';
  loadingCard.style.display = 'block';

  // Simulate AI summarization (replace with real API call as needed)
  const delay = 2400 + Math.random() * 1200;

  setTimeout(() => {
    const summary = generateMockSummary(text);
    const rouge = generateRougeScores();

    loadingCard.style.display = 'none';

    summaryOutput.textContent = summary;
    rougeBadges.innerHTML = renderRougeBadges(rouge);

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, delay);
}

// ── MOCK SUMMARIZATION ENGINE ─────────────────
function generateMockSummary(text) {
  const sentences = text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 30);

  if (sentences.length === 0) return "Unable to generate summary. Please provide a longer article.";

  // Score sentences by keyword relevance
  const financialKeywords = [
    'percent', '%', 'rate', 'revenue', 'profit', 'loss', 'market', 'stock',
    'shares', 'billion', 'million', 'trillion', 'growth', 'decline', 'rise',
    'fall', 'quarter', 'annual', 'fiscal', 'earnings', 'dividend', 'fed',
    'federal', 'inflation', 'gdp', 'index', 'dow', 'nasdaq', 'bank',
    'interest', 'yield', 'bond', 'debt', 'acquisition', 'merger'
  ];

  const scored = sentences.map(s => {
    const lower = s.toLowerCase();
    const score = financialKeywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0);
    return { s, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const topSentences = scored.slice(0, Math.min(3, scored.length)).map(x => x.s);
  return topSentences.join(' ');
}

// ── ROUGE SIMULATION ──────────────────────────
function generateRougeScores() {
  const r1 = (0.38 + Math.random() * 0.18).toFixed(3);
  const r2 = (0.16 + Math.random() * 0.14).toFixed(3);
  const rl = (0.34 + Math.random() * 0.16).toFixed(3);
  return { 'ROUGE-1': r1, 'ROUGE-2': r2, 'ROUGE-L': rl };
}

function renderRougeBadges(rouge) {
  return Object.entries(rouge).map(([label, value]) => `
    <div class="rouge-badge">
      <span class="rouge-badge-label">${label}</span>
      <span class="rouge-badge-value">${value}</span>
    </div>
  `).join('');
}

// ── COPY SUMMARY ──────────────────────────────
function copySummary() {
  const text = document.getElementById('summaryOutput').textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Summary copied to clipboard!');
  }).catch(() => {
    showToast('Copy failed. Please select and copy manually.');
  });
}

// ── RESET ─────────────────────────────────────
function resetSummarizer() {
  clearInput();
  document.getElementById('summarizer').scrollIntoView({ behavior: 'smooth' });
}

// ── SHAKE ERROR ANIMATION ─────────────────────
function shakeError(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.transition = 'border-color 0.3s';
  el.style.borderColor = '#ef4444';
  el.style.animation = 'shake 0.5s cubic-bezier(.36,.07,.19,.97)';

  const style = document.createElement('style');
  style.textContent = `@keyframes shake {
    10%, 90% { transform: translateX(-2px); }
    20%, 80% { transform: translateX(4px); }
    30%, 50%, 70% { transform: translateX(-6px); }
    40%, 60% { transform: translateX(6px); }
  }`;
  document.head.appendChild(style);

  setTimeout(() => {
    el.style.borderColor = '';
    el.style.animation = '';
  }, 900);
}

// ── TOAST NOTIFICATION ────────────────────────
let toastTimer;
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed; bottom: 84px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: #1c324d; border: 1px solid rgba(255,255,255,0.15);
      color: #ffffffcc; font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
      padding: 12px 20px; border-radius: 10px; z-index: 999;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      opacity: 0; transition: opacity 0.3s, transform 0.3s;
      max-width: 360px; text-align: center; pointer-events: none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
  }, 3000);
}

// ── STAGGERED REVEAL FOR GRIDS ────────────────
function staggerChildren(containerSelector, childSelector, delayMs = 120) {
  const containers = document.querySelectorAll(containerSelector);
  containers.forEach(container => {
    const children = container.querySelectorAll(childSelector);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          children.forEach((child, i) => {
            setTimeout(() => {
              child.classList.add('visible');
            }, i * delayMs);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(container);
  });
}

staggerChildren('.features-grid', '.feature-card', 130);
staggerChildren('.stack-grid', '.stack-badge', 100);
staggerChildren('.samples-grid', '.sample-card', 150);
