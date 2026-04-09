/**
 * Notification Manager
 * Handles notification display, storage, and header icon updates
 * Real-time sync with WebSocket
 */

class NotificationManager {
  constructor() {
    this.notifications = [];
    this.maxNotifications = 50;
    this.unreadCount = 0;
    this.notificationIcon = null;
    this.notificationBadge = null;
    this.listeners = new Map();
    this.storageKey = 'notifications_data';
    this.settingsKey = 'notification_settings';
    
    // Backend integration (Phase 2)
    this.webSocketClient = null;
    
    // Default settings
    this.settings = {
      soundEnabled: true,
      desktopEnabled: true,
      autoMarkAsRead: false,
      retentionDays: 30
    };

    this.init();
  }

  /**
   * Initialize notification manager
   */
  init() {
    this.loadNotifications();
    this.loadSettings();
    this.setupUI();
    this.setupNotificationPermission();
    this.setupWebSocketIntegration(); // Backend sync (Phase 2)
  }

  /**
   * WebSocket integration for real-time notifications
   */
  setupWebSocketIntegration() {
    // Wait for webSocketClient to be available (defensive)
    const checkWebSocket = () => {
      if (typeof window !== 'undefined' && 
          typeof window.webSocketClient !== 'undefined' && 
          window.webSocketClient && 
          window.webSocketClient.isReady) {
        this.webSocketClient = window.webSocketClient;
        this.bindWebSocketEvents();
      } else {
        setTimeout(checkWebSocket, 500);
      }
    };
    checkWebSocket();
  }

  /**
   * Bind WebSocket events for notifications
   */
  bindWebSocketEvents() {
    if (!this.webSocketClient) return;

    this.webSocketClient.on('notification', (data) => {
      console.log('[NotificationManager] Backend notification:', data);
      this.addNotification({
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        data: data.data || {},
        id: data.id,
        timestamp: data.timestamp || Date.now()
      });
    });

    this.webSocketClient.on('websocket:connected', () => {
      // Sync notifications on reconnect
      this.syncFromBackend();
    });
  }

  /**
   * Sync notifications from backend
   */
  syncFromBackend() {
    if (!this.webSocketClient) return;

    this.webSocketClient.send({
      type: 'websocket_get_updates',
      lastSync: Date.now() - 3600000 // 1 hour ago
    });
  }

  /**
   * Setup notification UI elements
   */
  setupUI() {
    // Try to find notification button (if dashboard is loaded)
    this.notificationIcon = document.getElementById('notif-btn');
    
    if (this.notificationIcon) {
      this.notificationIcon.addEventListener('click', () => this.showNotificationPanel());
      this.updateBadge();
    }

    // Create notification panel (will be in DOM)
    this.createNotificationPanel();
  }

  /**
   * Create notification panel structure
   */
  createNotificationPanel() {
    // Check if panel already exists
    if (document.getElementById('notification-panel')) {
      return;
    }

    const panel = document.createElement('div');
    panel.id = 'notification-panel';
    panel.className = 'notification-panel hidden';
    panel.innerHTML = `
      <div class="notification-panel-header">
        <h3>Notifikasi</h3>
        <button id="notifications-clear-all" class="text-xs text-gray-400 hover:text-white">
          Clear All
        </button>
      </div>
      <div id="notification-list" class="notification-list">
        <div class="notification-empty">
          <i class="fas fa-bell"></i>
          <p>Tidak ada notifikasi</p>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Add event listener for clear all
    document.getElementById('notifications-clear-all')?.addEventListener('click', () => {
      this.clearAllNotifications();
    });
  }

  /**
   * Request notification permission
   */
  setupNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      // Only request if user hasn't made a decision
      Notification.requestPermission();
    }
  }

  /**
   * Add new notification
   */
  addNotification(notification) {
    const notif = {
      id: notification.id || Date.now(),
      type: notification.type || 'info', // 'info', 'success', 'warning', 'error'
      title: notification.title,
      message: notification.message,
      data: notification.data || {},
      timestamp: notification.timestamp || Date.now(),
      read: notification.read || false,
      action: notification.action || null // Optional action button
    };

    // Add to array (newest first)
    this.notifications.unshift(notif);

    // Limit notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    // Update unread count
    if (!notif.read) {
      this.unreadCount++;
    }

    // Save to storage
    this.saveNotifications();
    this.updateBadge();
    this.updateNotificationPanel();

    // Play sound if enabled
    if (this.settings.soundEnabled) {
      this.playNotificationSound();
    }

    // Show desktop notification if enabled
    if (this.settings.desktopEnabled && 'Notification' in window && Notification.permission === 'granted') {
      this.showDesktopNotification(notif);
    }

    // Emit event
    this.emit('notification:added', notif);

    // Toast notification
    this.showToastNotification(notif);

    return notif;
  }

  /**
   * Show toast notification
   */
  showToastNotification(notification) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `notification-toast notification-toast-${notification.type}`;
    toast.innerHTML = `
      <div class="notification-toast-icon">
        <i class="fas fa-${this.getIconForType(notification.type)}"></i>
      </div>
      <div class="notification-toast-content">
        <div class="notification-toast-title">${notification.title}</div>
        <div class="notification-toast-message">${notification.message}</div>
      </div>
      <button class="notification-toast-close">
        <i class="fas fa-times"></i>
      </button>
    `;

    toastContainer.appendChild(toast);

    const closeBtn = toast.querySelector('.notification-toast-close');
    closeBtn.addEventListener('click', () => {
      toast.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }

  /**
   * Get icon for notification type
   */
  getIconForType(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };
    return icons[type] || 'bell';
  }

  /**
   * Play notification sound
   */
  playNotificationSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
      audio.play().catch(e => console.log('Sound play failed:', e));
    } catch (e) {
      console.log('Notification sound error:', e);
    }
  }

  /**
   * Show desktop notification
   */
  showDesktopNotification(notification) {
    try {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon.png',
        tag: `notif-${notification.id}`,
        requireInteraction: notification.type === 'error'
      });
    } catch (e) {
      console.log('Desktop notification error:', e);
    }
  }

  /**
   * Update notification badge
   */
  updateBadge() {
    if (!this.notificationIcon) return;

    // Remove existing badge
    const existingBadge = this.notificationIcon.querySelector('.notification-badge');
    if (existingBadge) {
      existingBadge.remove();
    }

    // Add new badge if there are unread notifications
    if (this.unreadCount > 0) {
      const badge = document.createElement('span');
      badge.className = 'notification-badge';
      badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
      this.notificationIcon.appendChild(badge);
      this.notificationIcon.classList.add('has-unread');
    } else {
      this.notificationIcon.classList.remove('has-unread');
    }
  }

  /**
   * Show notification panel
   */
  showNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    if (!panel) return;

    panel.classList.toggle('hidden');

    // Mark all as read when opening
    if (!panel.classList.contains('hidden') && !this.settings.autoMarkAsRead) {
      this.markAllAsRead();
    }

    // Close panel when clicking outside
    if (!panel.classList.contains('hidden')) {
      const handleClickOutside = (e) => {
        if (!panel.contains(e.target) && !this.notificationIcon.contains(e.target)) {
          panel.classList.add('hidden');
          document.removeEventListener('click', handleClickOutside);
        }
      };
      document.addEventListener('click', handleClickOutside);
    }
  }

  /**
   * Update notification panel list
   */
  updateNotificationPanel() {
    const list = document.getElementById('notification-list');
    if (!list) return;

    if (this.notifications.length === 0) {
      list.innerHTML = `
        <div class="notification-empty">
          <i class="fas fa-bell"></i>
          <p>Tidak ada notifikasi</p>
        </div>
      `;
      return;
    }

    list.innerHTML = this.notifications.map(notif => `
      <div class="notification-item notification-item-${notif.type} ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}">
        <div class="notification-item-icon">
          <i class="fas fa-${this.getIconForType(notif.type)}"></i>
        </div>
        <div class="notification-item-content">
          <div class="notification-item-title">${notif.title}</div>
          <div class="notification-item-message">${notif.message}</div>
          <div class="notification-item-time">${this.formatTimeAgo(notif.timestamp)}</div>
        </div>
        <div class="notification-item-actions">
          <button class="notification-item-delete" data-id="${notif.id}">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `).join('');

    // Add event listeners
    list.querySelectorAll('.notification-item-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        this.deleteNotification(id);
      });
    });

    // Mark as read when clicking notification
    list.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-item-delete')) {
          const id = parseInt(item.getAttribute('data-id'));
          this.markAsRead(id);
        }
      });
    });
  }

  /**
   * Mark notification as read
   */
  markAsRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif && !notif.read) {
      notif.read = true;
      this.unreadCount--;
      this.saveNotifications();
      this.updateBadge();
      this.updateNotificationPanel();
      this.emit('notification:read', notif);
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    let changed = false;
    this.notifications.forEach(notif => {
      if (!notif.read) {
        notif.read = true;
        changed = true;
      }
    });

    if (changed) {
      this.unreadCount = 0;
      this.saveNotifications();
      this.updateBadge();
      this.updateNotificationPanel();
      this.emit('notification:allread', {});
    }
  }

  /**
   * Delete notification
   */
  deleteNotification(id) {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      const notif = this.notifications[index];
      if (!notif.read) {
        this.unreadCount--;
      }
      this.notifications.splice(index, 1);
      this.saveNotifications();
      this.updateBadge();
      this.updateNotificationPanel();
      this.emit('notification:deleted', notif);
    }
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications() {
    if (confirm('Hapus semua notifikasi?')) {
      this.notifications = [];
      this.unreadCount = 0;
      this.saveNotifications();
      this.updateBadge();
      this.updateNotificationPanel();
      this.emit('notification:clearedall', {});
    }
  }

  /**
   * Save notifications to storage
   */
  saveNotifications() {
    try {
      const data = {
        notifications: this.notifications,
        unreadCount: this.unreadCount,
        timestamp: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving notifications:', e);
    }
  }

  /**
   * Load notifications from storage
   */
  loadNotifications() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.notifications = parsed.notifications || [];
        this.unreadCount = parsed.unreadCount || 0;

        // Clean old notifications (older than retention days)
        const now = Date.now();
        const retentionMs = this.settings.retentionDays * 24 * 60 * 60 * 1000;
        this.notifications = this.notifications.filter(n => (now - n.timestamp) < retentionMs);
      }
    } catch (e) {
      console.error('Error loading notifications:', e);
    }
  }

  /**
   * Save notification settings
   */
  saveSettings() {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(this.settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }

  /**
   * Load notification settings
   */
  loadSettings() {
    try {
      const data = localStorage.getItem(this.settingsKey);
      if (data) {
        this.settings = { ...this.settings, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
  }

  /**
   * Format time ago
   */
  formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Baru';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m lalu`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h lalu`;
    
    const days = Math.floor(hours / 24);
    return `${days}d lalu`;
  }

  /**
   * Get unread count
   */
  getUnreadCount() {
    return this.unreadCount;
  }

  /**
   * Get all notifications
   */
  getAllNotifications() {
    return [...this.notifications];
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.read);
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
   * Emit event
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }
}

export const notificationManager = new NotificationManager();

// Export the class for backward compatibility
export { NotificationManager };
