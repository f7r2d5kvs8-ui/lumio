import { lumioSupabase } from './modules/cloud.js';

const $ = selector => document.querySelector(selector);
const number = value => new Intl.NumberFormat().format(Number(value || 0));
const percent = value => `${Number(value || 0).toFixed(1)}%`;
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[character]));
const title = value => String(value || '').replaceAll('_', ' ').replace(/\b\w/g, character => character.toUpperCase());
let currentDashboard = null;

function showLogin(message = '') {
  $('#dashboard').hidden = true;
  $('#login-panel').hidden = false;
  $('#login-message').textContent = message;
}

function metric(label, value, note = '') {
  return `<article class="metric-card"><p class="eyebrow">${escapeHtml(label)}</p><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></article>`;
}

function renderPeriod(label, data) {
  return `<article class="period-card"><p class="eyebrow">Overview</p><h2>${escapeHtml(label)}</h2><div class="period-stats">
    <div><strong>${number(data.new_users)}</strong><small>New users</small></div><div><strong>${number(data.active_users)}</strong><small>Active users</small></div>
    <div><strong>${number(data.sessions)}</strong><small>Sessions</small></div><div><strong>${number(data.lessons_completed)}</strong><small>Lessons done</small></div>
    <div><strong>${percent(data.lesson_completion_rate)}</strong><small>Completion</small></div><div><strong>${number(data.support_clicks)}</strong><small>Support clicks</small></div>
  </div></article>`;
}

function renderBars(selector, rows, labelKey, valueKey) {
  const target = $(selector); const max = Math.max(1, ...rows.map(row => Number(row[valueKey] || 0)));
  target.innerHTML = rows.length ? rows.map(row => `<div class="bar-row"><div class="bar-top"><strong>${escapeHtml(title(row[labelKey]))}</strong><span>${number(row[valueKey])}</span></div><div class="track"><span style="width:${100 * Number(row[valueKey] || 0) / max}%"></span></div></div>`).join('') : '<p class="empty">No data yet.</p>';
}

function drawTrend(rows) {
  const canvas = $('#trend-chart'); const ratio = window.devicePixelRatio || 1; const width = canvas.clientWidth || 800; const height = 220;
  canvas.width = width * ratio; canvas.height = height * ratio; const context = canvas.getContext('2d'); context.scale(ratio, ratio); context.clearRect(0, 0, width, height);
  const padding = { top: 16, right: 10, bottom: 26, left: 30 }; const innerWidth = width - padding.left - padding.right; const innerHeight = height - padding.top - padding.bottom;
  const maximum = Math.max(1, ...rows.flatMap(row => [Number(row.active_users), Number(row.new_users)]));
  context.strokeStyle = '#e7e5f1'; context.lineWidth = 1;
  for (let line = 0; line <= 4; line += 1) { const y = padding.top + innerHeight * line / 4; context.beginPath(); context.moveTo(padding.left, y); context.lineTo(width - padding.right, y); context.stroke(); }
  const plot = (key, color) => { context.strokeStyle = color; context.lineWidth = 3; context.lineJoin = 'round'; context.beginPath(); rows.forEach((row, index) => { const x = padding.left + innerWidth * index / Math.max(1, rows.length - 1); const y = padding.top + innerHeight * (1 - Number(row[key] || 0) / maximum); index ? context.lineTo(x, y) : context.moveTo(x, y); }); context.stroke(); };
  plot('active_users', '#6759db'); plot('new_users', '#45c7a6'); context.fillStyle = '#74738b'; context.font = '11px Segoe UI'; context.fillText(rows[0]?.date?.slice(5) || '', padding.left, height - 6); context.textAlign = 'right'; context.fillText(rows.at(-1)?.date?.slice(5) || '', width - padding.right, height - 6); context.textAlign = 'start';
}

function renderDashboard(data) {
  currentDashboard = data;
  const periods = data.periods || {}; const month = periods.last_30_days || {};
  $('#hero-metrics').innerHTML = [
    metric('Total users', number(data.total_users), 'All-time discovered'), metric('Monthly active', number(month.active_users), 'Last 30 days'),
    metric('Sessions per user', Number(month.sessions_per_user || 0).toFixed(2), 'Last 30 days'), metric('Average progress', percent(data.average_curriculum_progress), 'Latest curriculum state')
  ].join('');
  $('#periods').innerHTML = renderPeriod('Today', periods.today || {}) + renderPeriod('Last 7 days', periods.last_7_days || {}) + renderPeriod('Last 30 days', month);
  $('#retention').innerHTML = [1, 7, 30].map(day => { const item = data.retention?.[`d${day}`] || {}; return `<div class="retention-row"><div class="retention-top"><strong>D${day}</strong><span>${percent(item.rate)} · ${number(item.retained)}/${number(item.eligible)}</span></div><div class="track"><span style="width:${Math.min(100, Number(item.rate || 0))}%"></span></div></div>`; }).join('');
  renderBars('#languages', data.languages || [], 'language', 'users'); renderBars('#platforms', data.platforms || [], 'platform', 'users');
  $('#activities').innerHTML = data.activities?.length ? data.activities.map((item, index) => `<div class="rank-row"><strong>${index + 1}. ${escapeHtml(title(item.activity))}</strong><small>${number(item.starts)} starts · ${number(item.users)} users</small></div>`).join('') : '<p class="empty">No activity starts yet.</p>';
  drawTrend(data.trend || []); $('#updated-at').textContent = `Updated ${new Date(data.generated_at).toLocaleString()}`;
}

async function loadDashboard() {
  $('#dashboard-message').textContent = 'Loading analytics…'; $('#refresh').disabled = true;
  const { data, error } = await lumioSupabase.rpc('get_lumio_analytics_dashboard'); $('#refresh').disabled = false;
  if (error) { showLogin(error.code === '42501' ? 'This account is not authorized for Lumio analytics.' : 'Analytics could not be loaded.'); return; }
  $('#login-panel').hidden = true; $('#dashboard').hidden = false; $('#dashboard-message').textContent = ''; renderDashboard(data);
}

$('#admin-login').addEventListener('submit', async event => {
  event.preventDefault(); const button = event.currentTarget.querySelector('button'); button.disabled = true; $('#login-message').textContent = 'Signing in…';
  const { error } = await lumioSupabase.auth.signInWithPassword({ email: $('#email').value.trim(), password: $('#password').value }); button.disabled = false;
  if (error) { $('#login-message').textContent = error.message; return; } await loadDashboard();
});
$('#refresh').addEventListener('click', loadDashboard);
$('#sign-out').addEventListener('click', async () => { await lumioSupabase.auth.signOut(); showLogin(); });
let resizeFrame = null;
window.addEventListener('resize', () => { if (!currentDashboard || $('#dashboard').hidden) return; cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(() => drawTrend(currentDashboard.trend || [])); });

const { data: { session } } = await lumioSupabase.auth.getSession();
if (session) await loadDashboard(); else showLogin();
