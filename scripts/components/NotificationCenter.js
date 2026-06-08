/**
 * Notification Center component
 */
import { getRelativeTime } from '../utils/animations.js';

export class NotificationCenter {
  constructor(state) {
    this.state = state;
    this.btn = document.getElementById('notificationBtn');
    this.badge = document.getElementById('notificationBadge');
    this.dropdown = document.getElementById('notificationDropdown');
    this.list = document.getElementById('notificationList');
    this._unsubscribe = null;
    this._open = false;
    this.init();
  }

  init() {
    this._unsubscribe = this.state.subscribe((changes) => {
      if ('notifications' in changes) {
        this.renderList();
        this.updateBadge();
      }
    });

    if (this.btn) {
      this.btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggle();
      });
    }

    // Mark all read
    document.getElementById('markAllRead')?.addEventListener('click', () => this.markAllRead());

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (this._open && !this.dropdown?.contains(e.target) && e.target !== this.btn) {
        this.close();
      }
    });
  }

  toggle() {
    this._open ? this.close() : this.open();
  }

  open() {
    if (!this.dropdown) return;
    this._open = true;
    this.dropdown.hidden = false;
    this.btn?.setAttribute('aria-expanded', 'true');
    this.renderList();
  }

  close() {
    if (!this.dropdown) return;
    this._open = false;
    this.dropdown.hidden = true;
    this.btn?.setAttribute('aria-expanded', 'false');
  }

  renderList() {
    if (!this.list) return;
    const notifications = this.state.notifications || [];

    if (!notifications.length) {
      this.list.innerHTML = `<li style="padding:var(--space-6);text-align:center;color:var(--color-text-tertiary)">
        <svg width="32" height="32" style="fill:currentColor;margin:0 auto var(--space-2);display:block" aria-hidden="true">
          <use href="#icon-bell"/>
        </svg>
        <p style="margin:0;font-size:var(--text-sm)">No notifications</p>
      </li>`;
      return;
    }

    this.list.innerHTML = notifications.map(n => this._notifHTML(n)).join('');

    // Click to mark as read
    this.list.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        this.markAsRead(item.dataset.notifId);
      });
    });
  }

  _notifHTML(n) {
    const icons = {
      info: 'bell',
      success: 'shield-check',
      warning: 'alert-triangle',
      error: 'alert-octagon',
    };
    const icon = icons[n.type] || 'bell';
    const time = getRelativeTime(n.timestamp);

    return `
      <li class="notification-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}" data-type="${n.type}">
        <div class="notification-icon">
          <svg aria-hidden="true"><use href="#icon-${icon}"/></svg>
        </div>
        <div class="notification-content">
          <p class="notification-message">${n.message}</p>
          <span class="notification-time">${time}</span>
        </div>
        ${!n.read ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--color-primary);flex-shrink:0;margin-top:4px"></div>' : ''}
      </li>`;
  }

  markAsRead(id) {
    const notifications = (this.state.notifications || []).map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.state.setState({ notifications });
  }

  markAllRead() {
    const notifications = (this.state.notifications || []).map(n => ({ ...n, read: true }));
    this.state.setState({ notifications });
  }

  updateBadge() {
    if (!this.badge) return;
    const unread = (this.state.notifications || []).filter(n => !n.read).length;
    if (unread > 0) {
      this.badge.textContent = unread > 9 ? '9+' : String(unread);
      this.badge.style.display = 'flex';
      this.badge.setAttribute('aria-label', `${unread} unread notifications`);
    } else {
      this.badge.style.display = 'none';
      this.badge.setAttribute('aria-label', 'No unread notifications');
    }
  }

  addNotification(notif) {
    const notifications = [notif, ...(this.state.notifications || [])];
    this.state.setState({ notifications });
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
  }
}
