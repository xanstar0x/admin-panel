/**
 * Privacy / anonymization utilities
 */

export function hashCode(str) {
  return str.split('').reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0);
  }, 0) >>> 0;
}

export function anonymizeEmail(email) {
  if (!email || !email.includes('@')) return '***@***.***';
  const [local, domain] = email.split('@');
  const [domainName, ...tldParts] = domain.split('.');
  const tld = tldParts.join('.');
  const maskedLocal = local[0] + '*'.repeat(Math.max(1, local.length - 1));
  const maskedDomain = domainName[0] + '*'.repeat(Math.max(1, domainName.length - 1));
  return `${maskedLocal}@${maskedDomain}.${tld}`;
}

export function anonymizeIp(ip) {
  if (!ip) return '***.***.***.***';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return '***.***.***';
}

export function anonymizeUserId(id) {
  const hash = hashCode(id).toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
  return `USR-${hash}`;
}

export function anonymizeUserData(user, privacyEnabled) {
  if (!privacyEnabled) return user;
  return {
    ...user,
    email: anonymizeEmail(user.email),
    id: anonymizeUserId(user.id),
    ipAddress: anonymizeIp(user.ipAddress),
  };
}

/**
 * Apply privacy mode to the entire page
 * @param {boolean} enabled
 */
export function applyPrivacyMode(enabled) {
  const sensitiveEls = document.querySelectorAll('[data-privacy]');

  sensitiveEls.forEach(el => {
    const level = el.getAttribute('data-privacy');

    if (level === 'blur') {
      el.style.filter = enabled ? 'blur(5px)' : '';
      el.style.userSelect = enabled ? 'none' : '';
    } else if (level === 'mask') {
      const orig = el.dataset.originalValue;
      if (!orig) {
        // First time: store original value
        el.dataset.originalValue = el.textContent;
      }
      if (enabled) {
        el.textContent = anonymizeEmail(el.dataset.originalValue || el.textContent);
      } else {
        el.textContent = el.dataset.originalValue || el.textContent;
      }
    } else if (level === 'hide') {
      el.style.visibility = enabled ? 'hidden' : '';
    }
  });

  // Toggle CSS class for CSS-based blur
  document.body.classList.toggle('privacy-mode', enabled);
}
