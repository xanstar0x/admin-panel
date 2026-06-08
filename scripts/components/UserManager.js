/**
 * User Management component
 */
import { getRelativeTime, debounce } from '../utils/animations.js';
import { anonymizeUserData } from '../utils/privacy.js';

export class UserManager {
  constructor(state) {
    this.state = state;
    this.tableBody = document.getElementById('userTableBody');
    this.searchInput = document.getElementById('userSearch');
    this.detailPanel = document.getElementById('userDetailPanel');
    this._filter = 'all';
    this._query = '';
    this._unsubscribe = null;
    this.init();
  }

  init() {
    this._unsubscribe = this.state.subscribe((changes) => {
      if ('users' in changes || 'privacyMode' in changes) {
        this.renderUsers();
      }
    });

    // Search
    if (this.searchInput) {
      this.searchInput.addEventListener('input', debounce(() => {
        this._query = this.searchInput.value.trim().toLowerCase();
        this.renderUsers();
      }, 250));
    }

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._filter = btn.dataset.filter;
        this.renderUsers();
      });
    });
  }

  getFilteredUsers() {
    let users = this.state.users || [];
    const privacy = this.state.privacyMode;

    // Apply status filter
    if (this._filter !== 'all') {
      users = users.filter(u => u.status === this._filter);
    }

    // Apply search
    if (this._query) {
      users = users.filter(u => {
        const searchable = [u.email, u.id, u.role, u.name].join(' ').toLowerCase();
        return searchable.includes(this._query);
      });
    }

    // Apply privacy
    if (privacy) {
      users = users.map(u => anonymizeUserData(u, true));
    }

    return users;
  }

  renderUsers() {
    if (!this.tableBody) return;
    const users = this.getFilteredUsers();

    if (users.length === 0) {
      this.tableBody.innerHTML = `
        <tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--color-text-tertiary);">
          No users found
        </td></tr>`;
      return;
    }

    this.tableBody.innerHTML = users.map(u => this._rowHTML(u)).join('');

    // Row click — show detail panel
    this.tableBody.querySelectorAll('tr[data-user-id]').forEach(row => {
      row.addEventListener('click', () => {
        const userId = row.dataset.userId;
        const user = (this.state.users || []).find(u => u.id === userId);
        if (user) this.showUserDetail(user);
      });
    });

    // Action buttons (stop propagation)
    this.tableBody.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = btn.closest('tr');
        const userId = row?.dataset.userId;
        const action = btn.dataset.action;
        this._handleAction(userId, action);
      });
    });
  }

  _rowHTML(u) {
    const statusClass = {
      active: 'status-active',
      inactive: 'status-inactive',
      suspended: 'status-suspended',
    }[u.status] || 'status-inactive';

    const roleClass = {
      admin: 'role-admin',
      user: 'role-user',
      moderator: 'role-moderator',
    }[u.role] || 'role-user';

    const lastAct = u.lastActivity ? getRelativeTime(u.lastActivity) : 'Never';

    return `
      <tr data-user-id="${u.id}" tabindex="0" style="cursor:pointer">
        <td><span class="font-mono text-xs">${u.id}</span></td>
        <td data-privacy="blur">${u.email}</td>
        <td><span class="table-badge ${roleClass}">${u.role}</span></td>
        <td><span class="table-badge ${statusClass}">${u.status}</span></td>
        <td>${lastAct}</td>
        <td class="table-actions" style="white-space:nowrap">
          <button class="action-btn icon-btn-sm" data-action="view" title="View details" aria-label="View user">
            <svg aria-hidden="true" width="14" height="14"><use href="#icon-eye"/></svg>
          </button>
          <button class="action-btn icon-btn-sm" data-action="edit" title="Edit user" aria-label="Edit user">
            <svg aria-hidden="true" width="14" height="14"><use href="#icon-settings"/></svg>
          </button>
          ${u.status !== 'suspended' ? `
          <button class="action-btn icon-btn-sm danger" data-action="suspend" title="Suspend user" aria-label="Suspend user">
            <svg aria-hidden="true" width="14" height="14"><use href="#icon-alert-octagon"/></svg>
          </button>` : `
          <button class="action-btn icon-btn-sm success" data-action="activate" title="Activate user" aria-label="Activate user">
            <svg aria-hidden="true" width="14" height="14"><use href="#icon-shield-check"/></svg>
          </button>`}
        </td>
      </tr>`;
  }

  showUserDetail(user) {
    if (!this.detailPanel) return;
    const privacy = this.state.privacyMode;
    const u = anonymizeUserData(user, privacy);
    const created = new Date(u.createdAt).toLocaleDateString();
    const lastAct = u.lastActivity ? getRelativeTime(u.lastActivity) : 'Never';

    const statusClass = {
      active: 'status-active',
      inactive: 'status-inactive',
      suspended: 'status-suspended',
    }[u.status] || 'status-inactive';

    this.detailPanel.hidden = false;
    this.detailPanel.innerHTML = `
      <div class="detail-header">
        <div>
          <h3 style="margin:0;font-size:var(--text-xl);color:var(--color-text-primary)">${u.name || u.email}</h3>
          <p style="margin:var(--space-1) 0 0;color:var(--color-text-tertiary);font-size:var(--text-sm)">${u.id}</p>
        </div>
        <div style="display:flex;gap:var(--space-3);align-items:center">
          <span class="table-badge ${statusClass}">${u.status}</span>
          <button class="icon-button" id="closeDetailPanel" aria-label="Close detail panel">
            <svg aria-hidden="true"><use href="#icon-close"/></svg>
          </button>
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-field">
          <span class="detail-label">Email</span>
          <span class="detail-value" data-privacy="blur">${u.email}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">Role</span>
          <span class="detail-value">${u.role}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">IP Address</span>
          <span class="detail-value" data-privacy="blur">${u.ipAddress || 'N/A'}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">Active Sessions</span>
          <span class="detail-value">${u.sessionsCount}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">Last Activity</span>
          <span class="detail-value">${lastAct}</span>
        </div>
        <div class="detail-field">
          <span class="detail-label">Member Since</span>
          <span class="detail-value">${created}</span>
        </div>
      </div>
    `;

    document.getElementById('closeDetailPanel')?.addEventListener('click', () => {
      this.detailPanel.hidden = true;
    });

    if (privacy) {
      this.detailPanel.querySelectorAll('[data-privacy="blur"]').forEach(el => {
        el.style.filter = 'blur(5px)';
        el.style.userSelect = 'none';
      });
    }

    // Scroll into view
    this.detailPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  _handleAction(userId, action) {
    const users = this.state.users || [];
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return;

    if (action === 'suspend') {
      users[idx] = { ...users[idx], status: 'suspended' };
      this.state.setState({ users: [...users] });
    } else if (action === 'activate') {
      users[idx] = { ...users[idx], status: 'active' };
      this.state.setState({ users: [...users] });
    } else if (action === 'view') {
      this.showUserDetail(users[idx]);
    }
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
  }
}
