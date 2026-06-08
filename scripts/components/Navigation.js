/**
 * Navigation sidebar component
 */
export class Navigation {
  constructor(containerEl, state) {
    this.container = containerEl;
    this.state = state;
    this._unsubscribe = null;
    this.init();
  }

  init() {
    this.attachEventListeners();
    this._unsubscribe = this.state.subscribe((changes) => {
      if ('activeSection' in changes) {
        this.setActive(changes.activeSection);
      }
    });
  }

  attachEventListeners() {
    // Nav item clicks
    this.container.querySelectorAll('.nav-item').forEach(item => {
      const btn = item.querySelector('.nav-link');
      btn.addEventListener('click', () => {
        const section = item.dataset.section;
        if (section) this.handleNavClick(section);
      });
    });

    // Collapse button
    const collapseBtn = this.container.querySelector('.sidebar-collapse-btn');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => this.toggleCollapse());
    }
  }

  handleNavClick(sectionId) {
    this.state.setState({ activeSection: sectionId });
    // On mobile: close sidebar
    if (window.innerWidth <= 1024) {
      this.closeMobile();
    }
  }

  setActive(sectionId) {
    this.container.querySelectorAll('.nav-item').forEach(item => {
      const isActive = item.dataset.section === sectionId;
      item.classList.toggle('active', isActive);
      const btn = item.querySelector('.nav-link');
      if (btn) {
        btn.setAttribute('aria-current', isActive ? 'page' : 'false');
      }
    });

    // Update page title in header
    const titleEl = document.querySelector('.header-title');
    if (titleEl) {
      const labels = {
        dashboard: 'Dashboard',
        users: 'User Management',
        analytics: 'Analytics',
        security: 'Security Center',
        settings: 'Settings',
      };
      titleEl.textContent = labels[sectionId] || sectionId;
    }

    // Show/hide sections
    document.querySelectorAll('.view-section').forEach(section => {
      const isActive = section.id === `${sectionId}-view`;
      section.classList.toggle('active', isActive);
    });
  }

  toggleCollapse() {
    const isCollapsed = this.container.classList.toggle('collapsed');
    document.body.dataset.sidebarCollapsed = isCollapsed;
    const btn = this.container.querySelector('.sidebar-collapse-btn');
    if (btn) btn.setAttribute('aria-expanded', String(!isCollapsed));
  }

  openMobile() {
    this.container.classList.add('mobile-open');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.classList.add('active');
      overlay.addEventListener('click', () => this.closeMobile(), { once: true });
    }
  }

  closeMobile() {
    this.container.classList.remove('mobile-open');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  destroy() {
    if (this._unsubscribe) this._unsubscribe();
  }
}
