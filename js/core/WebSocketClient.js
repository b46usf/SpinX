/**
 * WebSocket Client Manager
 * Handles real-time connections for notifications, session updates, and data changes
 * Features: Auto-reconnect, event broadcasting, connection pool
 */

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.pingInterval = null;
    this.listeners = new Map();
    this.messageQueue = [];
    this.userId = null;
    this.sessionId = null;
    this.heartbeatTimeout = null;
    
    // Configuration
    this.config = {
      debug: true,
      pingInterval: 30000, // 30 seconds
      heartbeatTimeout: 60000, // 60 seconds
    };

    this.init();
  }

  /**
   * Initialize WebSocket connection
   */
  init() {
    const user = this.getCurrentUser();
    if (!user || !user.id) {
      this.log('User not authenticated, WebSocket not initialized');
      return;
    }

    this.userId = user.id;
    this.sessionId = this.generateSessionId();
    this.connect();
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    try {
      const authData = localStorage.getItem('auth_data');
      if (!authData) return null;
      return JSON.parse(authData);
    } catch (e) {
      return null;
    }
  }

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `${this.userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Establish WebSocket connection
   */
  connect() {
    if (this.isConnecting || this.isConnected) {
      this.log('Connection already in progress or established');
      return;
    }

    this.isConnecting = true;
    const wsUrl = this.getWebSocketUrl();

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => this.handleOpen();
      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onerror = (error) => this.handleError(error);
      this.ws.onclose = () => this.handleClose();
    } catch (error) {
      this.log('Connection error:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  /**
   * Get WebSocket URL from current app URL
   */
  getWebSocketUrl() {
    // Convert HTTPS to WSS, HTTP to WS
    const currentUrl = window.location.href;
    
    // If running on Google Apps Script
    if (currentUrl.includes('script.google.com')) {
      // Google Apps Script deployments use standard HTTPS
      // We'll use fetch instead for real-time updates
      this.log('Using polling mode for Google Apps Script');
      return null;
    }

    let wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws?userId=${this.userId}&sessionId=${this.sessionId}`;
    
    return wsUrl;
  }

  /**
   * Handle WebSocket open
   */
  handleOpen() {
    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    
    this.log('WebSocket connected');
    this.broadcast('connected', { userId: this.userId, sessionId: this.sessionId });

    // Send initial sync message
    this.send({
      type: 'sync',
      userId: this.userId,
      timestamp: Date.now()
    });

    // Start ping interval
    this.startPingInterval();

    // Process queued messages
    this.processQueue();

    // Emit connected event
    this.emit('websocket:connected', { userId: this.userId });
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      // Clear heartbeat timeout on any message
      this.resetHeartbeatTimeout();

      this.log('Message received:', data.type);

      switch (data.type) {
        case 'notification':
          this.handleNotification(data);
          break;
        
        case 'session_update':
          this.handleSessionUpdate(data);
          break;
        
        case 'data_update':
          this.handleDataUpdate(data);
          break;
        
        case 'pong':
          this.log('Pong received');
          break;
        
        case 'sync_response':
          this.handleSyncResponse(data);
          break;
        
        default:
          this.emit('message', data);
      }
    } catch (error) {
      this.log('Error processing message:', error);
    }
  }

  /**
   * Handle notification message
   */
  handleNotification(data) {
    this.emit('notification', {
      id: data.id || Date.now(),
      type: data.notificationType || 'info',
      title: data.title,
      message: data.message,
      data: data.data,
      timestamp: data.timestamp || Date.now(),
      read: false
    });

    this.broadcast('notification', data);
  }

  /**
   * Handle session update
   */
  handleSessionUpdate(data) {
    this.emit('session:update', data);
    this.broadcast('session:update', data);
  }

  /**
   * Handle data update
   */
  handleDataUpdate(data) {
    this.emit('data:update', {
      type: data.dataType,
      action: data.action,
      data: data.data,
      timestamp: data.timestamp || Date.now()
    });

    this.broadcast('data:update', data);
  }

  /**
   * Handle sync response from server
   */
  handleSyncResponse(data) {
    this.log('Sync response received');
    this.emit('sync:response', data);
  }

  /**
   * Handle WebSocket error
   */
  handleError(error) {
    this.log('WebSocket error:', error);
    this.emit('websocket:error', error);
  }

  /**
   * Handle WebSocket close
   */
  handleClose() {
    this.isConnected = false;
    this.isConnecting = false;
    this.stopPingInterval();
    this.clearHeartbeatTimeout();
    
    this.log('WebSocket disconnected');
    this.emit('websocket:disconnected', {});

    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    } else {
      this.log('Max reconnect attempts reached');
      this.emit('websocket:failed', { message: 'Unable to establish connection' });
    }
  }

  /**
   * Send message through WebSocket
   */
  send(message) {
    if (!this.isConnected) {
      this.log('WebSocket not connected, queuing message');
      this.messageQueue.push(message);
      
      // Try to reconnect if not already attempting
      if (!this.isConnecting) {
        this.connect();
      }
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      this.log('Message sent:', message.type);
      return true;
    } catch (error) {
      this.log('Error sending message:', error);
      this.messageQueue.push(message);
      return false;
    }
  }

  /**
   * Send ping to server
   */
  ping() {
    this.send({ type: 'ping', timestamp: Date.now() });
  }

  /**
   * Process queued messages
   */
  processQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  /**
   * Start ping interval
   */
  startPingInterval() {
    this.stopPingInterval();
    
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        this.ping();
      }
    }, this.config.pingInterval);
  }

  /**
   * Stop ping interval
   */
  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Reset heartbeat timeout
   */
  resetHeartbeatTimeout() {
    this.clearHeartbeatTimeout();
    
    this.heartbeatTimeout = setTimeout(() => {
      this.log('Heartbeat timeout, attempting reconnect');
      this.disconnect();
      this.connect();
    }, this.config.heartbeatTimeout);
  }

  /**
   * Clear heartbeat timeout
   */
  clearHeartbeatTimeout() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  scheduleReconnect() {
    const delay = this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts);
    this.reconnectAttempts++;
    
    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    this.stopPingInterval();
    this.clearHeartbeatTimeout();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.isConnecting = false;
  }

  /**
   * Subscribe to event
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          this.log(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Broadcast event to all subscribers
   * (Can be used for cross-tab communication via localStorage)
   */
  broadcast(event, data) {
    try {
      const broadcastData = {
        event,
        data,
        timestamp: Date.now(),
        source: 'websocket'
      };
      
      // Store in sessionStorage for cross-tab communication
      sessionStorage.setItem(
        `websocket_event_${Date.now()}`,
        JSON.stringify(broadcastData)
      );
    } catch (error) {
      this.log('Broadcast error:', error);
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isReady() {
    return this.isConnected;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected,
      connecting: this.isConnecting,
      sessionId: this.sessionId,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts,
      messageQueueLength: this.messageQueue.length
    };
  }

  /**
   * Logging utility
   */
  log(...args) {
    if (this.config.debug) {
      console.log('[WebSocket]', ...args);
    }
  }
}

// Export singleton instance
export const webSocketClient = new WebSocketClient();
