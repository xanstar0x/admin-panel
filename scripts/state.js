/**
 * State Management Module
 * Implements pub-sub pattern for centralized application state
 * Requirements: 7.3 (Theme persistence), 8.5 (Privacy mode persistence)
 */

/**
 * Global Application State
 * Manages theme, privacy mode, navigation, notifications, users, activities, and metrics
 */
const AppState = {
  // State properties
  theme: 'dark',                    // 'dark' | 'light' - Default dark theme (Req 7.3)
  privacyMode: false,               // boolean - Privacy mode state (Req 8.5)
  activeSection: 'dashboard',       // string - Current active view section
  notifications: [],                // Array of notification objects
  users: [],                        // Array of user data objects
  activities: [],                   // Array of activity event objects
  metrics: {},                      // Object containing dashboard metrics
  securityEvents: [],               // Array of security event objects
  sessions: [],                     // Array of active session objects
  analyticsData: null,              // Analytics view data
  chartData: null,                  // Dashboard chart data
  
  // Pub-sub implementation
  subscribers: new Set(),           // Set of callback functions
  
  /**
   * Subscribe to state changes
   * @param {Function} callback - Function to call when state changes
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }
    
    this.subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  },
  
  /**
   * Notify all subscribers of state change
   * @param {Object} updates - Object containing changed state properties
   */
  notify(updates) {
    // Call each subscriber with the updates
    this.subscribers.forEach(callback => {
      try {
        callback(updates, this);
      } catch (error) {
        console.error('Error in state subscriber:', error);
      }
    });
  },
  
  /**
   * Update state and notify subscribers
   * @param {Object} updates - Object containing state properties to update
   */
  setState(updates) {
    if (!updates || typeof updates !== 'object') {
      throw new TypeError('Updates must be an object');
    }
    
    // Track what actually changed
    const changes = {};
    
    // Update state properties and track changes
    Object.keys(updates).forEach(key => {
      if (this.hasOwnProperty(key) && key !== 'subscribers') {
        const oldValue = this[key];
        const newValue = updates[key];
        
        // Only track if value actually changed
        if (oldValue !== newValue) {
          this[key] = newValue;
          changes[key] = newValue;
        }
      }
    });
    
    // Only notify if something actually changed
    if (Object.keys(changes).length > 0) {
      this.notify(changes);
    }
  },
  
  /**
   * Get current state snapshot
   * @returns {Object} Copy of current state (excluding subscribers)
   */
  getState() {
    return {
      theme: this.theme,
      privacyMode: this.privacyMode,
      activeSection: this.activeSection,
      notifications: [...this.notifications],
      users: [...this.users],
      activities: [...this.activities],
      metrics: Array.isArray(this.metrics) ? [...this.metrics] : { ...this.metrics },
      securityEvents: [...(this.securityEvents || [])],
      sessions: [...(this.sessions || [])],
      analyticsData: this.analyticsData,
      chartData: this.chartData,
    };
  },
  
  /**
   * Reset state to initial values
   */
  reset() {
    this.setState({
      theme: 'dark',
      privacyMode: false,
      activeSection: 'dashboard',
      notifications: [],
      users: [],
      activities: [],
      metrics: {}
    });
  }
};

// Export for use in other modules (ES6 module)
export default AppState;
