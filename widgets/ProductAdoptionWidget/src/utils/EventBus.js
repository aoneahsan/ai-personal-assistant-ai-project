/**
 * Simple event bus for internal communication
 */

export default class EventBus {
  constructor() {
    this.events = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(handler);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  off(event, handler) {
    if (!this.events.has(event)) return;
    
    const handlers = this.events.get(event);
    const index = handlers.indexOf(handler);
    
    if (index > -1) {
      handlers.splice(index, 1);
    }
    
    if (handlers.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (!this.events.has(event)) return;
    
    const handlers = this.events.get(event);
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[EventBus] Error in handler for ${event}:`, error);
      }
    });
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name
   */
  removeAllListeners(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}