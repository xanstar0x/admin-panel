/**
 * Dashboard component — metrics grid + chart + activity
 */
import { animateValue, getRelativeTime } from '../utils/animations.js';

export class Dashboard {
  constructor(state) {
    this.state = state;
    this.metricsGrid = document.getElementById('metricsGrid');
    this.analyticsWidget = document.getElementById('analyticsWidget');
    this._unsubscribe = null;
    this._chart = null;
    this.init();
  }

  init() {
    this._unsubscribe = this.state.subscribe((changes) => {
      if ('metrics' in changes) this.renderMetrics(this.state.metrics);
      if ('privacyMode' in changes) this.handlePrivacy(this.state.privacyMode);
    });
  }

  renderMetrics(metrics) {
    if (!this.metricsGrid || !metrics || !metrics.length) return;

    this.metricsGrid.innerHTML = '';
    metrics.forEach((m, i) => {
      const card = this._createMetricCard(m, i);
      this.metricsGrid.appendChild(card);
    });

    // Animate values
    metrics.forEach(m => {
      const el = document.getElementById(`metric-val-${m.id}`);
      if (el) {
        animateValue(el, 0, m.value, 1200, (v) => {
          const val = Math.round(v);
          return (m.suffix ? val.toLocaleString() + m.suffix : val.toLocaleString());
        });
      }
    });
  }

  _createMetricCard(m, index) {
    const isPositive = m.change > 0;
    const isNeutral = m.change === 0;
    const changeClass = isNeutral ? 'neutral' : isPositive ? 'positive' : 'negative';
    const changeSign = isPositive ? '+' : '';
    const changeArrow = isPositive ? '↑' : isNeutral ? '→' : '↓';

    const card = document.createElement('div');
    card.className = 'metric-card glass-effect';
    card.style.animationDelay = `${0.1 * (index + 1)}s`;
    card.innerHTML = `
      <div class="metric-icon-wrapper" style="background: ${m.color}20;">
        <svg aria-hidden="true" style="fill:${m.color}">
          <use href="#icon-${m.icon}"/>
        </svg>
      </div>
      <div class="metric-content">
        <span class="metric-label">${m.label}</span>
        <span class="metric-value" id="metric-val-${m.id}" data-privacy="blur">0</span>
        <span class="metric-change ${changeClass}">${changeArrow} ${changeSign}${m.change}%</span>
      </div>
    `;
    return card;
  }

  renderChart(chartData) {
    if (!this.analyticsWidget || !chartData) return;

    const { labels, values } = chartData;
    const max = Math.max(...values);
    const widget = this.analyticsWidget;

    widget.innerHTML = `
      <div class="widget-header">
        <h3>Activity Trends</h3>
        <div class="period-selector">
          <button class="period-btn active" data-period="24h">24h</button>
          <button class="period-btn" data-period="7d">7d</button>
          <button class="period-btn" data-period="30d">30d</button>
        </div>
      </div>
      <div class="chart-container" id="activityChartContainer">
        ${this._buildBarChart(labels, values, max)}
      </div>
    `;

    // Period selector
    widget.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        widget.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Try Chart.js if available
    if (window.Chart) {
      this._renderChartJs(labels, values);
    }
  }

  _buildBarChart(labels, values, max) {
    const bars = labels.map((label, i) => {
      const pct = max ? Math.round((values[i] / max) * 100) : 0;
      return `<div class="chart-bar" style="height:${pct}%" data-value="${values[i].toLocaleString()}"></div>`;
    }).join('');
    const lbls = labels.map(l => `<span class="chart-label">${l}</span>`).join('');
    return `<div class="chart-bars">${bars}</div><div class="chart-labels">${lbls}</div>`;
  }

  _renderChartJs(labels, values) {
    const container = document.getElementById('activityChartContainer');
    if (!container) return;
    container.innerHTML = '<canvas id="activityChart"></canvas>';
    const canvas = document.getElementById('activityChart');

    const isDark = document.documentElement.classList.contains('theme-dark') ||
      !document.documentElement.classList.contains('theme-light');

    const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    this._chart = new window.Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Active Users',
          data: values,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.12)',
          borderWidth: 2,
          pointBackgroundColor: '#3b82f6',
          pointRadius: 3,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.9)',
            borderColor: 'rgba(59,130,246,0.3)',
            borderWidth: 1,
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            padding: 12,
          },
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { size: 11 } },
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { size: 11 } },
          },
        },
        animation: { duration: 800, easing: 'easeOutCubic' },
      },
    });
  }

  handlePrivacy(enabled) {
    // Blur all metric values
    document.querySelectorAll('[data-privacy="blur"]').forEach(el => {
      el.style.filter = enabled ? 'blur(8px)' : '';
      el.style.userSelect = enabled ? 'none' : '';
    });
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
    if (this._chart) { this._chart.destroy(); this._chart = null; }
  }
}
