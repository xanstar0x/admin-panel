/**
 * Main application entry point
 * Initializes all components and wires up state management
 */

import AppState from './state.js';
import { SafeStorage } from './utils/storage.js';
import { applyPrivacyMode } from './utils/privacy.js';
import { debounce } from './utils/animations.js';
import {
  generateUsers,
  generateMetrics,
  generateChartData,
  generateInitialActivities,
  generateNotifications,
  generateSecurityEvents,
  generateSessions,
  generateAnalyticsData,
  generateActivity,
} from './utils/demo-data.js';

import { Navigation } from './components/Navigation.js';
import { Dashboard } from './components/Dashboard.js';
import { UserManager } from './components/UserManager.js';
import { SecurityCenter } from './components/SecurityCenter.js';
import { NotificationCenter } from './components/NotificationCenter.js';
import { ActivityMonitor } from './components/ActivityMonitor.js';
import { ThemeToggle } from './components/ThemeToggle.js';
import { Analytics } from './components/Analytics.js';
import { Settings } from './components/Settings.js';

// ─── Responsive manager ────────────────────────────────────────────────────────

class ResponsiveManager {
  constructor(navigation) {
    this.nav = navigation;
    this.current = null;
    this.init();
  }

  init() {
    this.check();
    window.addEventListener('resize', debounce(() => this.check(), 200));
  }

  check() {
    const w = window.innerWidth;
    const layout = w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';

    if (layout === this.current) return;
    this.current = layout;
    document.body.dataset.layout = layout;

    if (layout === 'mobile' || layout === 'tablet') {
      // Ensure sidebar is closed on small screens
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('collapsed');
    }
  }
}

// ─── Bootstrap ─────────────────────────────────────────────────────────────────

async function bootstrap() {
  // Prevent flash of unstyled content during theme init
  document.documentElement.classList.add('preload');

  // ── Load persisted preferences ──────────────────────────────────────────────
  const savedTheme = SafeStorage.get('admin-panel-theme', 'dark');
  const savedPrivacy = SafeStorage.get('admin-panel-privacy', false);

  // Apply theme immediately (before render)
  document.documentElement.classList.remove('theme-dark', 'theme-light');
  document.documentElement.classList.add(`theme-${savedTheme}`);

  // ── Seed app state ───────────────────────────────────────────────────────────
  AppState.setState({
    theme: savedTheme,
    privacyMode: savedPrivacy,
    users: generateUsers(45),
    metrics: generateMetrics(),
    activities: generateInitialActivities(8),
    notifications: generateNotifications(),
    securityEvents: generateSecurityEvents(),
    sessions: generateSessions(),
    analyticsData: generateAnalyticsData(),
    chartData: generateChartData(12),
  });

  // ── Initialize components ────────────────────────────────────────────────────
  const sidebar = document.getElementById('sidebar');
  const navigation = sidebar ? new Navigation(sidebar, AppState) : null;

  const themeToggle = new ThemeToggle(AppState);

  // Subscribe theme toggle to state changes (e.g. from settings)
  AppState.subscribe((changes) => {
    if ('theme' in changes) {
      themeToggle.applyTheme(changes.theme);
    }
  });

  const dashboard = new Dashboard(AppState);
  const userManager = new UserManager(AppState);
  const securityCenter = new SecurityCenter(AppState);
  const notifCenter = new NotificationCenter(AppState);
  const activityMonitor = new ActivityMonitor(AppState);
  const analytics = new Analytics(AppState);
  const settings = new Settings(AppState);

  // ── Initial renders ──────────────────────────────────────────────────────────
  navigation?.setActive('dashboard');
  dashboard.renderMetrics(AppState.metrics);
  dashboard.renderChart(AppState.chartData);
  userManager.renderUsers();
  securityCenter.renderEvents();
  securityCenter.renderSessions();
  notifCenter.updateBadge();
  notifCenter.renderList();

  // Determine security status
  const criticals = (AppState.securityEvents || []).filter(e => e.severity === 'high' && !e.resolved);
  if (criticals.length >= 3) securityCenter.updateStatus('critical');
  else if (criticals.length > 0) securityCenter.updateStatus('warning');
  else securityCenter.updateStatus('secure');

  // ── Privacy toggle ───────────────────────────────────────────────────────────
  const privacyBtn = document.getElementById('privacyToggle');
  if (privacyBtn) {
    // Restore state
    if (savedPrivacy) {
      privacyBtn.setAttribute('aria-pressed', 'true');
      applyPrivacyMode(true);
    }

    privacyBtn.addEventListener('click', () => {
      const next = !(AppState.privacyMode);
      AppState.setState({ privacyMode: next });
      privacyBtn.setAttribute('aria-pressed', String(next));
      applyPrivacyMode(next);
      SafeStorage.set('admin-panel-privacy', next);
      // Re-render user table with new privacy state
      userManager.renderUsers();
      securityCenter.renderEvents();
      securityCenter.renderSessions();
    });
  }

  // ── Mobile menu ──────────────────────────────────────────────────────────────
  const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      navigation?.openMobile();
    });
  }

  // ── Sidebar collapse ─────────────────────────────────────────────────────────
  // (handled inside Navigation component)

  // ── Responsive ───────────────────────────────────────────────────────────────
  new ResponsiveManager(navigation);

  // ── Activity simulation ───────────────────────────────────────────────────────
  activityMonitor.startSimulation({ generateActivity });

  // ── Analytics lazy render when section active ────────────────────────────────
  AppState.subscribe((changes) => {
    if ('activeSection' in changes) {
      if (changes.activeSection === 'analytics') {
        setTimeout(() => analytics.render(), 50);
      } else if (changes.activeSection === 'settings') {
        setTimeout(() => settings.render(), 50);
      }
    }
  });

  // ── Header title injection ───────────────────────────────────────────────────
  const topHeader = document.querySelector('.top-header');
  if (topHeader) {
    const titleEl = document.createElement('h1');
    titleEl.className = 'header-title';
    titleEl.textContent = 'Dashboard';
    titleEl.style.cssText = 'margin:0;font-size:var(--text-xl);font-weight:600;color:var(--color-text-primary)';
    topHeader.insertBefore(titleEl, topHeader.querySelector('.header-actions'));
  }

  // ── Remove preload class after first paint ───────────────────────────────────
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('preload');
    });
  });

  console.log('[AdminPanel] Initialized ✓');
}

// Start
document.addEventListener('DOMContentLoaded', bootstrap);
