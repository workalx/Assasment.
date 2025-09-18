// Date in header and footer
const dateEl = document.getElementById('reportDate');
const yearEl = document.getElementById('year');
if (dateEl) {
  const now = new Date();
  const fmt = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  dateEl.textContent = `Updated: ${fmt}`;
}
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// KPI counters
function animateCounter(el) {
  const targetRaw = el.getAttribute('data-target');
  const prefix = el.getAttribute('data-prefix') || '';
  const suffix = el.getAttribute('data-suffix') || '';
  const isFloat = targetRaw.includes('.') || suffix.includes('%');
  const target = parseFloat(targetRaw);
  const duration = 1400;
  const start = performance.now();
  function step(ts) {
    const p = Math.min(1, (ts - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = isFloat ? (target * eased) : Math.round(target * eased);
    el.textContent = `${prefix}${isFloat ? val.toFixed(1) : val.toLocaleString('en-US')}${suffix}`;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
document.querySelectorAll('.kpi-value').forEach(animateCounter);

// Simple SVG line chart
function renderChart() {
  const svg = document.getElementById('trendChart');
  if (!svg) return;
  const width = 600, height = 240, left = 40, bottom = 210, top = 10, right = 580;
  // Data: last 12 weeks
  const data = [320, 410, 390, 450, 470, 520, 490, 550, 610, 590, 640, 700];
  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.05;
  const len = data.length;
  const x = i => left + (i * (right - left) / (len - 1));
  const y = v => bottom - ((v - min) / (max - min)) * (bottom - top);

  const lineD = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const areaD = `${lineD} L ${right} ${bottom} L ${left} ${bottom} Z`;
  const linePath = document.getElementById('linePath');
  const areaPath = document.getElementById('areaPath');
  if (linePath && areaPath) {
    areaPath.setAttribute('d', areaD);
    linePath.setAttribute('d', lineD);
  }

  // Points
  const pointsG = document.getElementById('points');
  if (pointsG) {
    pointsG.innerHTML = '';
    data.forEach((v, i) => {
      const cx = x(i);
      const cy = y(v);
      const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
      c.setAttribute('cx', cx);
      c.setAttribute('cy', cy);
      c.setAttribute('r', '4');
      c.style.opacity = '0';
      pointsG.appendChild(c);
      // delayed appearance
      setTimeout(() => {
        c.animate([{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 400, fill: 'forwards', easing: 'ease-out' });
      }, 120 + i * 60);
    });
  }

  // Line animation (dash)
  if (linePath) {
    const length = linePath.getTotalLength();
    linePath.style.strokeDasharray = String(length);
    linePath.style.strokeDashoffset = String(length);
    linePath.getBoundingClientRect();
    linePath.style.transition = 'stroke-dashoffset 1200ms ease-out';
    requestAnimationFrame(() => { linePath.style.strokeDashoffset = '0'; });
  }
}
renderChart();

// Photo chart removed

// Buttons: share and PDF
const toast = document.getElementById('toast');
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

document.getElementById('shareBtn')?.addEventListener('click', async () => {
  const data = { title: 'Analytic letter', text: 'Check our analytic report', url: location.href };
  try {
    if (navigator.share) {
      await navigator.share(data);
      showToast('Link sent');
    } else {
      await navigator.clipboard.writeText(location.href);
      showToast('Link copied');
    }
  } catch (e) {
    showToast('Share failed');
  }
});

document.getElementById('downloadBtn')?.addEventListener('click', async () => {
  // No external libs: hint to save as PDF via print
  showToast('Tip: Ctrl/Cmd+P → Save as PDF');
  // Small highlight effect
  const btn = document.getElementById('downloadBtn');
  if (btn) {
    btn.animate([{ boxShadow: '0 0 0 rgba(0,0,0,0)' }, { boxShadow: '0 0 0 6px rgba(109,214,255,0.25)' }, { boxShadow: '0 0 0 rgba(0,0,0,0)' }], { duration: 900, easing: 'ease-out' });
  }
});

// CTA
document.getElementById('ctaBtn')?.addEventListener('click', () => {
  showToast('Recommendations: job, kids insurance, cut Starbucks, consider moving');
});

