/**
 * Theme toggle component
 */
import { SafeStorage } from '../utils/storage.js';

export class ThemeToggle {
  constructor(state) {
    this.state = state;
    this.btn = document.getElementById('themeToggle');
    this.init();
  }

  init() {
    if (this.btn) {
      this.btn.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    const current = this.state.theme;
    const next = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(next);
    this.state.setState({ theme: next });
  }

  applyTheme(theme) {
    const html = document.documentElement;
    html.classList.remove('theme-dark', 'theme-light');
    html.classList.add(`theme-${theme}`);

    // Update icon
    const useEl = this.btn?.querySelector('use');
    if (useEl) {
      useEl.setAttribute('href', theme === 'dark' ? '#icon-sun' : '#icon-moon');
    }

    // Animate button
    if (this.btn) {
      this.btn.classList.add('theme-switching');
      setTimeout(() => this.btn.classList.remove('theme-switching'), 350);
    }

    SafeStorage.set('admin-panel-theme', theme);
  }
}
