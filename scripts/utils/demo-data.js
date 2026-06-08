/**
 * Demo data generator for all admin panel components
 */

const FIRST_NAMES = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Iris', 'James',
  'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Rachel', 'Sam', 'Tara'];
const LAST_NAMES = ['Johnson', 'Smith', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White',
  'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen'];
const DOMAINS = ['example.com', 'company.org', 'business.net', 'corp.io', 'enterprise.co', 'tech.dev'];
const ROLES = ['admin', 'user', 'moderator'];
const DEVICES = ['Chrome / Windows', 'Safari / macOS', 'Firefox / Linux', 'Chrome / Android', 'Safari / iOS'];
const LOCATIONS = ['New York, US', 'London, UK', 'Berlin, DE', 'Tokyo, JP', 'Sydney, AU', 'Paris, FR', 'Toronto, CA'];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedChoice(values, weights) {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < values.length; i++) {
    r -= weights[i];
    if (r <= 0) return values[i];
  }
  return values[values.length - 1];
}

function generateEmail(firstName, lastName) {
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()[0]}`,
    `${firstName.toLowerCase()[0]}${lastName.toLowerCase()}`,
  ];
  return `${randomChoice(formats)}@${randomChoice(DOMAINS)}`;
}

function randomIp() {
  return `${rInt(10, 220)}.${rInt(0, 255)}.${rInt(0, 255)}.${rInt(1, 254)}`;
}

function rInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let _userIdCounter = 1;

export function generateUsers(count = 40) {
  return Array.from({ length: count }, () => {
    const firstName = randomChoice(FIRST_NAMES);
    const lastName = randomChoice(LAST_NAMES);
    const id = `user_${String(_userIdCounter++).padStart(4, '0')}`;
    return {
      id,
      email: generateEmail(firstName, lastName),
      name: `${firstName} ${lastName}`,
      role: weightedChoice(ROLES, [0.1, 0.75, 0.15]),
      status: weightedChoice(['active', 'inactive', 'suspended'], [0.7, 0.2, 0.1]),
      lastActivity: Date.now() - rInt(0, 7 * 24 * 60 * 60 * 1000),
      createdAt: Date.now() - rInt(30, 730) * 24 * 60 * 60 * 1000,
      sessionsCount: rInt(0, 5),
      ipAddress: randomIp(),
    };
  });
}

export function generateMetrics() {
  return [
    {
      id: 'total-users',
      label: 'Total Users',
      value: 1284,
      change: +12.5,
      icon: 'users',
      color: '#3b82f6',
    },
    {
      id: 'active-sessions',
      label: 'Active Sessions',
      value: 847,
      change: -3.2,
      icon: 'activity',
      color: '#10b981',
    },
    {
      id: 'system-load',
      label: 'System Load',
      value: 68,
      change: +5.1,
      icon: 'cpu',
      color: '#f59e0b',
      suffix: '%',
    },
    {
      id: 'security-alerts',
      label: 'Security Alerts',
      value: 3,
      change: -50,
      icon: 'shield',
      color: '#ef4444',
    },
  ];
}

export function generateChartData(points = 12) {
  const labels = [];
  const values = [];
  const now = new Date();
  for (let i = points - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(d.getHours() - i * 2);
    labels.push(d.getHours().toString().padStart(2, '0') + ':00');
    values.push(rInt(300, 1200));
  }
  return { labels, values };
}

const ACTIVITY_TEMPLATES = [
  { type: 'user_login', message: 'User logged in', icon: 'user', severity: 'low' },
  { type: 'user_logout', message: 'User logged out', icon: 'user', severity: 'low' },
  { type: 'data_export', message: 'Data export requested', icon: 'download', severity: 'medium' },
  { type: 'settings_changed', message: 'Account settings updated', icon: 'settings', severity: 'low' },
  { type: 'security_alert', message: 'Failed login attempt detected', icon: 'alert-triangle', severity: 'high' },
  { type: 'user_login', message: 'New device sign-in', icon: 'user', severity: 'medium' },
  { type: 'data_export', message: 'Report generated', icon: 'download', severity: 'low' },
  { type: 'security_alert', message: 'Suspicious activity flagged', icon: 'alert-octagon', severity: 'high' },
];

export function generateActivity() {
  const tpl = randomChoice(ACTIVITY_TEMPLATES);
  return {
    id: `activity_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    ...tpl,
    timestamp: Date.now(),
  };
}

export function generateInitialActivities(count = 8) {
  return Array.from({ length: count }, (_, i) => ({
    ...generateActivity(),
    timestamp: Date.now() - i * rInt(30000, 180000),
  })).sort((a, b) => b.timestamp - a.timestamp);
}

export function generateNotifications() {
  return [
    {
      id: 'notif_001',
      type: 'warning',
      message: 'High CPU usage detected (87%)',
      timestamp: Date.now() - 5 * 60 * 1000,
      read: false,
    },
    {
      id: 'notif_002',
      type: 'error',
      message: 'Failed login attempt from 192.168.x.x',
      timestamp: Date.now() - 22 * 60 * 1000,
      read: false,
    },
    {
      id: 'notif_003',
      type: 'success',
      message: 'Backup completed successfully',
      timestamp: Date.now() - 1.5 * 60 * 60 * 1000,
      read: false,
    },
    {
      id: 'notif_004',
      type: 'info',
      message: 'System update available: v2.4.1',
      timestamp: Date.now() - 3 * 60 * 60 * 1000,
      read: true,
    },
  ];
}

export function generateSecurityEvents() {
  return [
    {
      id: 'sec_001',
      type: 'login_attempt',
      description: 'Multiple failed login attempts from IP 45.33.32.156',
      severity: 'high',
      timestamp: Date.now() - 8 * 60 * 1000,
      resolved: false,
      ipAddress: '45.33.32.156',
    },
    {
      id: 'sec_002',
      type: 'permission_change',
      description: 'Admin privileges granted to user_0023',
      severity: 'medium',
      timestamp: Date.now() - 35 * 60 * 1000,
      resolved: true,
      ipAddress: '192.168.1.45',
    },
    {
      id: 'sec_003',
      type: 'data_access',
      description: 'Bulk data export from user_0089',
      severity: 'medium',
      timestamp: Date.now() - 2.5 * 60 * 60 * 1000,
      resolved: false,
      ipAddress: '10.0.0.23',
    },
    {
      id: 'sec_004',
      type: 'suspicious_activity',
      description: 'Unusual login location detected (new country)',
      severity: 'high',
      timestamp: Date.now() - 6 * 60 * 60 * 1000,
      resolved: false,
      ipAddress: '103.21.244.0',
    },
    {
      id: 'sec_005',
      type: 'login_attempt',
      description: 'Successful login after multiple failures',
      severity: 'low',
      timestamp: Date.now() - 12 * 60 * 60 * 1000,
      resolved: true,
      ipAddress: '8.8.8.8',
    },
  ];
}

export function generateSessions() {
  return [
    {
      id: 'sess_001',
      userId: 'user_0001',
      device: 'Chrome 120 / Windows 11',
      location: 'New York, US',
      ipAddress: '72.14.192.1',
      startedAt: Date.now() - 45 * 60 * 1000,
      lastActive: Date.now() - 2 * 60 * 1000,
      active: true,
      current: true,
    },
    {
      id: 'sess_002',
      userId: 'user_0001',
      device: 'Safari 17 / macOS',
      location: 'San Francisco, US',
      ipAddress: '17.253.144.10',
      startedAt: Date.now() - 2 * 60 * 60 * 1000,
      lastActive: Date.now() - 30 * 60 * 1000,
      active: true,
      current: false,
    },
    {
      id: 'sess_003',
      userId: 'user_0001',
      device: 'Chrome 119 / Android',
      location: 'Austin, US',
      ipAddress: '98.137.11.164',
      startedAt: Date.now() - 5 * 60 * 60 * 1000,
      lastActive: Date.now() - 4 * 60 * 60 * 1000,
      active: false,
      current: false,
    },
  ];
}

export function generateAnalyticsData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return {
    weeklyLogins: {
      labels: days,
      data: days.map(() => rInt(200, 900)),
    },
    pageViews: {
      labels: days,
      data: days.map(() => rInt(1000, 5000)),
    },
    userGrowth: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [800, 940, 1050, 1120, 1200, 1284],
    },
    topPages: [
      { page: '/dashboard', views: 8432, pct: 34 },
      { page: '/users', views: 5219, pct: 21 },
      { page: '/analytics', views: 3847, pct: 15 },
      { page: '/security', views: 2901, pct: 12 },
      { page: '/settings', views: 1654, pct: 7 },
    ],
  };
}
