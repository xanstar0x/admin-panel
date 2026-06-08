/**
 * Settings view component
 */
import { SafeStorage } from '../utils/storage.js';

export class Settings {
  constructor(state) {
    this.state = state;
    this.container = document.getElementById('settings-view');
    this._activeTab = 'general';
    this._unsubscribe = null;
    this.init();
  }

  init() {
    this._unsubscribe = this.state.subscribe((changes) => {
      if ('activeSection' in changes && changes.activeSection === 'settings') {
        this.render();
      }
    });
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <h2 id="settings-title" class="view-title">Settings</h2>
      <div class="settings-grid">
        <nav class="settings-nav glass-effect" style="padding:var(--space-3);height:fit-content">
          ${this._navItems()}
        </nav>
        <div id="settingsPanel" class="settings-panel glass-effect"></div>
      </div>
    `;

    this.container.querySelectorAll('.settings-nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.settings-nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._activeTab = btn.dataset.tab;
        this._renderPanel(this._activeTab);
      });
    });

    this._renderPanel(this._activeTab);
  }

  _navItems() {
    const tabs = [
      { id: 'general', label: 'General', icon: 'settings' },
      { id: 'privacy', label: 'Privacy', icon: 'shield' },
      { id: 'notifications', label: 'Notifications', icon: 'bell' },
      { id: 'appearance', label: 'Appearance', icon: 'sun' },
    ];
    return tabs.map(t => `
      <button class="settings-nav-item ${this._activeTab === t.id ? 'active' : ''}" data-tab="${t.id}">
        <svg width="18" height="18" aria-hidden="true"><use href="#icon-${t.icon}"/></svg>
        ${t.label}
      </button>`).join('');
  }

  _renderPanel(tab) {
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;

    const templates = {
      general: this._generalPanel(),
      privacy: this._privacyPanel(),
      notifications: this._notifPanel(),
      appearance: this._appearancePanel(),
    };

    panel.innerHTML = templates[tab] || '<p>Coming soon</p>';
    this._bindPanelEvents(tab, panel);
  }

  _sectionTitle(title) {
    return `<h3 class="settings-section-title">${title}</h3>`;
  }

  _toggle(id, label, desc, checked = false) {
    return `
      <div class="control-item" style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-4) 0;border-bottom:1px solid var(--glass-border)">
        <div>
          <p style="margin:0;font-weight:var(--font-medium);color:var(--color-text-primary)">${label}</p>
          ${desc ? `<p style="margin:var(--space-1) 0 0;font-size:var(--text-sm);color:var(--color-text-tertiary)">${desc}</p>` : ''}
        </div>
        <label class="switch" style="flex-shrink:0">
          <input type="checkbox" id="${id}" class="security-toggle-input" ${checked ? 'checked' : ''}>
          <span class="slider round"></span>
        </label>
      </div>`;
  }

  _generalPanel() {
    return `
      <div class="settings-section">
        ${this._sectionTitle('Profile')}
        <div style="display:grid;gap:var(--space-4)">
          ${this._field('Display Name', 'text', 'Admin User')}
          ${this._field('Email', 'email', 'admin@example.com')}
          ${this._field('Role', 'text', 'Administrator', true)}
        </div>
      </div>
      <div class="settings-section">
        ${this._sectionTitle('Preferences')}
        ${this._toggle('emailNotif', 'Email Notifications', 'Receive alerts via email', true)}
        ${this._toggle('autoLogout', 'Auto Logout', 'Logout after 30 min of inactivity', false)}
      </div>
    `;
  }

  _privacyPanel() {
    return `
      <div class="settings-section">
        ${this._sectionTitle('Privacy Settings')}
        ${this._toggle('twoFactor', 'Two-Factor Authentication', 'Add an extra layer of security to your account', true)}
        ${this._toggle('privacyModeAuto', 'Auto Privacy Mode', 'Enable privacy mode when inactive', false)}
        ${this._toggle('auditLog', 'Audit Logging', 'Keep detailed logs of all admin actions', true)}
        ${this._toggle('dataAnon', 'Data Anonymization', 'Anonymize user data in exports', true)}
      </div>
      <div class="settings-section">
        ${this._sectionTitle('Data Management')}
        <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;margin-top:var(--space-4)">
          <button class="btn-primary" style="background:transparent;border:1px solid var(--color-warning);color:var(--color-warning)">Export Data</button>
          <button class="btn-primary" style="background:transparent;border:1px solid var(--color-error);color:var(--color-error)">Delete Account</button>
        </div>
      </div>
    `;
  }

  _notifPanel() {
    return `
      <div class="settings-section">
        ${this._sectionTitle('Notification Channels')}
        ${this._toggle('emailAlerts', 'Email Alerts', 'Receive security alerts via email', true)}
        ${this._toggle('pushNotif', 'Push Notifications', 'Browser push notifications', false)}
        ${this._toggle('slackNotif', 'Slack Integration', 'Send alerts to Slack', false)}
      </div>
      <div class="settings-section">
        ${this._sectionTitle('Alert Triggers')}
        ${this._toggle('loginAlerts', 'Failed Login Alerts', 'Alert on multiple failed logins', true)}
        ${this._toggle('newDeviceAlerts', 'New Device Alerts', 'Alert when a new device logs in', true)}
        ${this._toggle('dataExportAlerts', 'Data Export Alerts', 'Alert on bulk data exports', true)}
        ${this._toggle('cpuAlerts', 'System Load Alerts', 'Alert when CPU/memory is high', false)}
      </div>
    `;
  }

  _appearancePanel() {
    const current = this.state.theme;
    return `
      <div class="settings-section">
        ${this._sectionTitle('Theme')}
        <div style="display:flex;gap:var(--space-4);margin-top:var(--space-4)">
          <button class="theme-choice-btn ${current === 'dark' ? 'active' : ''}" data-theme="dark"
            style="flex:1;padding:var(--space-4);border:2px solid ${current==='dark'?'var(--color-primary)':'var(--glass-border)'};border-radius:var(--radius-xl);background:var(--glass-bg);cursor:pointer;color:var(--color-text-primary)">
            <svg width="24" height="24" style="fill:currentColor;margin:0 auto var(--space-2);display:block" aria-hidden="true"><use href="#icon-moon"/></svg>
            Dark
          </button>
          <button class="theme-choice-btn ${current === 'light' ? 'active' : ''}" data-theme="light"
            style="flex:1;padding:var(--space-4);border:2px solid ${current==='light'?'var(--color-primary)':'var(--glass-border)'};border-radius:var(--radius-xl);background:var(--glass-bg);cursor:pointer;color:var(--color-text-primary)">
            <svg width="24" height="24" style="fill:currentColor;margin:0 auto var(--space-2);display:block" aria-hidden="true"><use href="#icon-sun"/></svg>
            Light
          </button>
        </div>
      </div>
      <div class="settings-section">
        ${this._sectionTitle('Display')}
        ${this._toggle('compactMode', 'Compact Mode', 'Reduce spacing for more content', false)}
        ${this._toggle('animationsOff', 'Reduce Animations', 'Minimize motion for accessibility', false)}
      </div>
    `;
  }

  _field(label, type, placeholder, disabled = false) {
    return `
      <div>
        <label style="display:block;font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--color-text-secondary);margin-bottom:var(--space-2)">${label}</label>
        <input type="${type}" value="${placeholder}" ${disabled ? 'disabled' : ''}
          style="width:100%;height:44px;padding:0 var(--space-4);border:1px solid var(--glass-border);border-radius:var(--radius-lg);background:var(--glass-bg);color:var(--color-text-primary);font-size:var(--text-base);${disabled?'opacity:0.5;cursor:not-allowed;':''}"
        >
      </div>`;
  }

  _bindPanelEvents(tab, panel) {
    if (tab === 'appearance') {
      panel.querySelectorAll('.theme-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const theme = btn.dataset.theme;
          this.state.setState({ theme });
          // Re-render panel to update active state
          this._renderPanel(tab);
        });
      });
    }
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
  }
}
