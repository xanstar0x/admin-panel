/**
 * Animation utilities
 */

/**
 * Easing: ease-out cubic
 */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Animate a numeric value with smooth easing
 * @param {HTMLElement} element
 * @param {number} from
 * @param {number} to
 * @param {number} duration ms
 * @param {Function} formatter
 */
export function animateValue(element, from, to, duration = 1000, formatter = null) {
  const startTime = performance.now();
  const range = to - from;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);
    const current = from + range * eased;

    if (formatter) {
      element.textContent = formatter(current);
    } else {
      element.textContent = Math.round(current).toLocaleString();
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

/**
 * Human-readable relative time
 * @param {number} timestamp Unix ms
 * @returns {string}
 */
export function getRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < 10 * 1000) return 'just now';
  if (diff < minute) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

/**
 * Debounce a function
 */
export function debounce(fn, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Throttle a function
 */
export function throttle(fn, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Animate element entrance (slide-in + fade)
 */
export function animateIn(element, direction = 'up') {
  const transforms = {
    up: 'translateY(16px)',
    down: 'translateY(-16px)',
    left: 'translateX(-16px)',
    right: 'translateX(16px)',
  };

  element.style.opacity = '0';
  element.style.transform = transforms[direction] || transforms.up;
  element.style.transition = 'none';

  // Trigger reflow
  void element.offsetHeight;

  element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  element.style.opacity = '1';
  element.style.transform = 'translate(0)';
}

/**
 * Animate element exit
 */
export function animateOut(element, onComplete) {
  element.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  element.style.opacity = '0';
  element.style.transform = 'translateY(-8px)';
  setTimeout(() => {
    element.remove();
    if (onComplete) onComplete();
  }, 260);
}
