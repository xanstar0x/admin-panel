/**
 * Analytics view component
 */

export class Analytics {
  constructor(state) {
    this.state = state;
    this.container = document.getElementById('analytics-view');
    this._charts = [];
    this._unsubscribe = null;
    this.init();
  }

  init() {
    this._unsubscribe = this.state.subscribe((changes) => {
      if ('analyticsData' in changes || 'activeSection' in changes) {
        if (this.state.activeSection === 'analytics') this.render();
      }
    });
  }

  render() {
    if (!this.container) return;
    const data = this.state.analyticsData;
    if (!data) return;

    // Destroy old charts
    this._charts.forEach(c => c.destroy?.());
    this._charts = [];

    this.container.innerHTML = `
      <h2 id="analytics-title" class="view-title">Analytics
        <span class="view-subtitle" style="font-size:var(--text-base);font-weight:400;color:var(--color-text-tertiary);">Last 7 days</span>
      </h2>

      <div class="analytics-grid">
        <!-- KPI row -->
        <div class="analytics-card glass-effect">
          <p style="margin:0 0 var(--space-1);font-size:var(--text-sm);color:var(--color-text-tertiary)">Total Logins</p>
          <p style="margin:0;font-size:var(--text-3xl);font-weight:700;color:var(--color-text-primary)" data-privacy="blur">
            ${data.weeklyLogins.data.reduce((a,b)=>a+b,0).toLocaleString()}
          </p>
        </div>
        <div class="analytics-card glass-effect">
          <p style="margin:0 0 var(--space-1);font-size:var(--text-sm);color:var(--color-text-tertiary)">Page Views</p>
          <p style="margin:0;font-size:var(--text-3xl);font-weight:700;color:var(--color-text-primary)" data-privacy="blur">
            ${data.pageViews.data.reduce((a,b)=>a+b,0).toLocaleString()}
          </p>
        </div>
        <div class="analytics-card glass-effect">
          <p style="margin:0 0 var(--space-1);font-size:var(--text-sm);color:var(--color-text-tertiary)">Total Users</p>
          <p style="margin:0;font-size:var(--text-3xl);font-weight:700;color:var(--color-text-primary)">1,284</p>
        </div>

        <!-- Charts -->
        <div class="analytics-card glass-effect full-width">
          <h3 style="margin:0 0 var(--space-4);font-size:var(--text-lg);font-weight:600;color:var(--color-text-primary)">
            Weekly Logins
          </h3>
          <div style="height:220px"><canvas id="analyticsLoginChart"></canvas></div>
        </div>

        <div class="analytics-card glass-effect full-width">
          <h3 style="margin:0 0 var(--space-4);font-size:var(--text-lg);font-weight:600;color:var(--color-text-primary)">
            User Growth
          </h3>
          <div style="height:220px"><canvas id="analyticsGrowthChart"></canvas></div>
        </div>

        <!-- Top pages table -->
        <div class="analytics-card glass-effect full-width">
          <h3 style="margin:0 0 var(--space-4);font-size:var(--text-lg);font-weight:600;color:var(--color-text-primary)">
            Top Pages
          </h3>
          ${this._topPagesHTML(data.topPages)}
        </div>
      </div>
    `;

    if (window.Chart) {
      this._buildLoginChart(data);
      this._buildGrowthChart(data);
    }

    if (this.state.privacyMode) this._applyPrivacy();
  }

  _buildLoginChart(data) {
    const canvas = document.getElementById('analyticsLoginChart');
    if (!canvas) return;
    const isDark = !document.documentElement.classList.contains('theme-light');
    const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const chart = new window.Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.weeklyLogins.labels,
        datasets: [{
          label: 'Logins',
          data: data.weeklyLogins.data,
          backgroundColor: 'rgba(59,130,246,0.5)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleColor: '#f1f5f9', bodyColor: '#94a3b8' } },
        scales: { x: { grid: { color: gridColor }, ticks: { color: textColor } }, y: { grid: { color: gridColor }, ticks: { color: textColor } } },
      },
    });
    this._charts.push(chart);
  }

  _buildGrowthChart(data) {
    const canvas = document.getElementById('analyticsGrowthChart');
    if (!canvas) return;
    const isDark = !document.documentElement.classList.contains('theme-light');
    const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    const chart = new window.Chart(canvas, {
      type: 'line',
      data: {
        labels: data.userGrowth.labels,
        datasets: [{
          label: 'Users',
          data: data.userGrowth.data,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.1)',
          fill: true, tension: 0.4,
          pointBackgroundColor: '#10b981',
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15,23,42,0.9)', titleColor: '#f1f5f9', bodyColor: '#94a3b8' } },
        scales: { x: { grid: { color: gridColor }, ticks: { color: textColor } }, y: { grid: { color: gridColor }, ticks: { color: textColor } } },
      },
    });
    this._charts.push(chart);
  }

  _topPagesHTML(pages) {
    const rows = pages.map(p => `
      <tr>
        <td style="padding:var(--space-3) var(--space-4);color:var(--color-text-primary);font-family:var(--font-mono);font-size:var(--text-sm)">${p.page}</td>
        <td style="padding:var(--space-3) var(--space-4);color:var(--color-text-secondary)">${p.views.toLocaleString()}</td>
        <td style="padding:var(--space-3) var(--space-4)">
          <div style="display:flex;align-items:center;gap:var(--space-2)">
            <div style="flex:1;height:6px;background:var(--glass-border);border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${p.pct}%;background:var(--color-primary);border-radius:3px"></div>
            </div>
            <span style="font-size:var(--text-xs);color:var(--color-text-tertiary);width:28px">${p.pct}%</span>
          </div>
        </td>
      </tr>`).join('');

    return `<table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="border-bottom:1px solid var(--glass-border)">
          <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-xs);text-transform:uppercase;letter-spacing:.05em;color:var(--color-text-tertiary)">Page</th>
          <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-xs);text-transform:uppercase;letter-spacing:.05em;color:var(--color-text-tertiary)">Views</th>
          <th style="padding:var(--space-2) var(--space-4);text-align:left;font-size:var(--text-xs);text-transform:uppercase;letter-spacing:.05em;color:var(--color-text-tertiary)">Share</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  _applyPrivacy() {
    this.container.querySelectorAll('[data-privacy="blur"]').forEach(el => {
      el.style.filter = 'blur(8px)';
      el.style.userSelect = 'none';
    });
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
    this._charts.forEach(c => c.destroy?.());
  }
}
