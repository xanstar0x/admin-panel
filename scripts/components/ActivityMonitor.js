/**
 * Activity Monitor — live activity feed
 */
import { getRelativeTime } from '../utils/animations.js';

export class ActivityMonitor {
  constructor(state) {
    this.state = state;
    this.feed = document.getElementById('activityFeed');
    this._simInterval = null;
    this._tickInterval = null;
    this._unsubscribe = null;
    this.MAX_ITEMS = 10;
    this.init();
  }

  init() {
    this._unsubscribe = this.state.subscribe((changes) => {
      if ('activities' in changes) {
        this.renderFeed(this.state.activities);
      }
    });

    // Periodic timestamp refresh
    this._tickInterval = setInterval(() => this._refreshTimestamps(), 30000);
  }

  renderFeed(activities) {
    if (!this.feed || !activities) return;
    this.feed.innerHTML = '';
    activities.slice(0, this.MAX_ITEMS).forEach(act => {
      this.feed.appendChild(this._createItem(act));
    });
  }

  _createItem(activity) {
    const severityColor = {
      low: 'var(--color-info)',
      medium: 'var(--color-warning)',
      high: 'var(--color-error)',
    }[activity.severity] || 'var(--color-text-tertiary)';

    const li = document.createElement('li');
    li.className = 'activity-item';
    li.dataset.activityId = activity.id;
    li.dataset.timestamp = activity.timestamp;
    li.innerHTML = `
      <div style="width:32px;height:32px;border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;background:${severityColor}18;flex-shrink:0">
        <svg width="15" height="15" style="fill:${severityColor}" aria-hidden="true">
          <use href="#icon-${activity.icon || 'activity'}"/>
        </svg>
      </div>
      <div class="activity-content" style="flex:1;min-width:0">
        <span style="font-size:var(--text-sm);color:var(--color-text-primary);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${activity.message}</span>
        <span class="activity-time" style="font-size:var(--text-xs);color:var(--color-text-tertiary)">${getRelativeTime(activity.timestamp)}</span>
      </div>
      <div style="width:6px;height:6px;border-radius:50%;background:${severityColor};flex-shrink:0;margin-top:var(--space-1)"></div>
    `;
    return li;
  }

  addActivity(activity) {
    const current = this.state.activities || [];
    const updated = [activity, ...current].slice(0, this.MAX_ITEMS);
    this.state.setState({ activities: updated });

    // Animate new item
    if (this.feed && this.feed.firstChild) {
      const item = this.feed.firstChild;
      item.style.opacity = '0';
      item.style.transform = 'translateX(-16px)';
      void item.offsetHeight;
      item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      item.style.opacity = '1';
      item.style.transform = 'translate(0)';
    }
  }

  startSimulation(generator) {
    if (this._simInterval) return;
    const schedule = () => {
      this._simInterval = setTimeout(() => {
        const activity = generator.generateActivity ? generator.generateActivity() : null;
        if (activity) this.addActivity(activity);
        schedule();
      }, 4000 + Math.random() * 6000);
    };
    schedule();
  }

  stopSimulation() {
    if (this._simInterval) {
      clearTimeout(this._simInterval);
      this._simInterval = null;
    }
  }

  _refreshTimestamps() {
    if (!this.feed) return;
    this.feed.querySelectorAll('.activity-item').forEach(item => {
      const ts = parseInt(item.dataset.timestamp, 10);
      if (!isNaN(ts)) {
        const timeEl = item.querySelector('.activity-time');
        if (timeEl) timeEl.textContent = getRelativeTime(ts);
      }
    });
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
    this.stopSimulation();
    if (this._tickInterval) clearInterval(this._tickInterval);
  }
}
