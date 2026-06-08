/**
 * Security Center component
 */
import { getRelativeTime } from '../utils/animations.js';
import { anonymizeIp } from '../utils/privacy.js';

export class SecurityCenter {
  constructor(state) {
    this.state = state;
    this.statusEl = document.getElementById('securityStatus');
    this.eventList = document.getElementById('securityEventList');
    this.sessionList = document.getElementById('sessionList');
    this._unsubscribe = null;
    this.init();
  }

  init() {
    this._unsubscribe = this.state.subscribe((changes) => {
      if ('securityEvents' in changes) this.renderEvents();
      if ('sessions' in changes) this.renderSessions();
      if ('privacyMode' in changes) this.renderEvents(), this.renderSessions();
    });

    // Security control toggles
    document.querySelectorAll('.security-toggle-input').forEach(input => {
      input.addEventListener('change', (e) => {
        console.log(`Security setting "${e.target.id}" changed to: ${e.target.checked}`);
      });
    });
  }

  updateStatus(status) {
    if (!this.statusEl) return;
    const configs = {
      secure: {
        icon: 'shield-check',
        text: 'Secure',
        desc: 'All systems operational — no active threats detected',
        color: 'var(--color-success)',
      },
      warning: {
        icon: 'alert-triangle',
        text: 'Warning',
        desc: 'Potential security issues require attention',
        color: 'var(--color-warning)',
      },
      critical: {
        icon: 'alert-octagon',
        text: 'Critical',
        desc: 'Critical security threat detected — immediate action required',
        color: 'var(--color-error)',
      },
    };

    const cfg = configs[status] || configs.secure;
    this.statusEl.dataset.status = status;

    const iconEl = this.statusEl.querySelector('.status-icon');
    const textEl = this.statusEl.querySelector('.status-text');
    const descEl = this.statusEl.querySelector('.status-description');

    if (iconEl) { iconEl.innerHTML = `<use href="#icon-${cfg.icon}"/>`; iconEl.style.fill = cfg.color; }
    if (textEl) { textEl.textContent = cfg.text; textEl.style.color = cfg.color; }
    if (descEl) { descEl.textContent = cfg.desc; }
  }

  renderEvents() {
    if (!this.eventList) return;
    const events = this.state.securityEvents || [];
    const privacy = this.state.privacyMode;

    if (!events.length) {
      this.eventList.innerHTML = '<li style="padding:var(--space-4);color:var(--color-text-tertiary)">No security events</li>';
      return;
    }

    this.eventList.innerHTML = events.map(ev => this._eventHTML(ev, privacy)).join('');
  }

  _eventHTML(ev, privacy) {
    const severityColors = {
      low: 'var(--color-info)',
      medium: 'var(--color-warning)',
      high: 'var(--color-error)',
      critical: 'var(--color-error)',
    };
    const iconMap = {
      login_attempt: 'user',
      permission_change: 'shield',
      data_access: 'download',
      suspicious_activity: 'alert-triangle',
    };
    const icon = iconMap[ev.type] || 'alert-triangle';
    const color = severityColors[ev.severity] || severityColors.low;
    const ip = privacy ? anonymizeIp(ev.ipAddress) : (ev.ipAddress || 'N/A');
    const time = getRelativeTime(ev.timestamp);

    return `
      <li class="security-event-item ${ev.resolved ? 'resolved' : ''}" data-severity="${ev.severity}">
        <div class="event-icon-wrap" style="background:${color}15;border-radius:var(--radius-lg);padding:var(--space-2);">
          <svg width="16" height="16" style="fill:${color}" aria-hidden="true"><use href="#icon-${icon}"/></svg>
        </div>
        <div class="event-content" style="flex:1;min-width:0">
          <p class="event-desc" style="margin:0;font-size:var(--text-sm);color:var(--color-text-primary)">${ev.description}</p>
          <div style="display:flex;gap:var(--space-3);margin-top:var(--space-1);font-size:var(--text-xs);color:var(--color-text-tertiary)">
            <span>${time}</span>
            <span data-privacy="blur">IP: ${ip}</span>
            ${ev.resolved ? '<span style="color:var(--color-success)">✓ Resolved</span>' : `<span style="color:${color}">● ${ev.severity}</span>`}
          </div>
        </div>
      </li>`;
  }

  renderSessions() {
    if (!this.sessionList) return;
    const sessions = this.state.sessions || [];
    const privacy = this.state.privacyMode;

    if (!sessions.length) {
      this.sessionList.innerHTML = '<li style="padding:var(--space-4);color:var(--color-text-tertiary)">No active sessions</li>';
      return;
    }

    this.sessionList.innerHTML = sessions.map(s => this._sessionHTML(s, privacy)).join('');

    this.sessionList.querySelectorAll('.terminate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.sessionId;
        this.terminateSession(id);
      });
    });
  }

  _sessionHTML(session, privacy) {
    const ip = privacy ? anonymizeIp(session.ipAddress) : session.ipAddress;
    const lastActive = getRelativeTime(session.lastActive);

    return `
      <li class="session-item ${session.current ? 'current' : ''}">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-1)">
            <span style="font-weight:var(--font-medium);color:var(--color-text-primary);font-size:var(--text-sm)">${session.device}</span>
            ${session.current ? '<span class="table-badge status-active" style="font-size:10px">Current</span>' : ''}
            ${session.active ? '<span style="width:8px;height:8px;border-radius:50%;background:var(--color-success);display:inline-block"></span>' : ''}
          </div>
          <div style="font-size:var(--text-xs);color:var(--color-text-tertiary);display:flex;gap:var(--space-3)">
            <span>${session.location}</span>
            <span data-privacy="blur">${ip}</span>
            <span>Last active ${lastActive}</span>
          </div>
        </div>
        ${!session.current ? `
        <button class="terminate-btn filter-btn" data-session-id="${session.id}"
          style="font-size:var(--text-xs);padding:var(--space-1) var(--space-3);min-height:32px;color:var(--color-error);border-color:var(--color-error-bg)">
          Terminate
        </button>` : ''}
      </li>`;
  }

  terminateSession(sessionId) {
    const sessions = (this.state.sessions || []).filter(s => s.id !== sessionId);
    this.state.setState({ sessions });
    this.renderSessions();
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
  }
}
