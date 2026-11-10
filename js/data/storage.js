/**
 * Smart Missing Items Finder AI - Data Storage Layer
 * Day 2: LocalStorage Model & Report Management
 * Day 4: In-App Notifications Persistence & Management
 */

(function (window) {
  'use strict';

  const STORAGE_KEY = 'smart_finder_reports';
  const NOTIFICATIONS_STORAGE_KEY = 'smart_finder_notifications';

  // =========================================================================
  // Report Storage
  // =========================================================================
  const ReportStore = {
    /**
     * Retrieve all reports from localStorage.
     * @returns {Array<Object>} List of report objects
     */
    getAll: function () {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(item => item && typeof item === 'object') : [];
      } catch (err) {
        console.error('Error reading reports from localStorage:', err);
        return [];
      }
    },

    /**
     * Save a new report to localStorage.
     * @param {Object} report Report data object
     * @returns {Object} The saved report object with generated id and timestamp
     */
    add: function (report) {
      const reports = this.getAll();
      const newReport = {
        id: 'report_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        createdAt: new Date().toISOString(),
        ...report
      };
      reports.unshift(newReport); // newest first
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
      } catch (err) {
        console.error('Error saving report to localStorage:', err);
        throw err;
      }
      return newReport;
    },

    /**
     * Delete a single report by ID.
     * @param {string} id
     * @returns {boolean} True if deleted
     */
    remove: function (id) {
      const reports = this.getAll();
      const filtered = reports.filter(item => item && item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        // Also remove any notifications associated with this deleted report
        if (window.NotificationStore && typeof window.NotificationStore.removeForReportId === 'function') {
          window.NotificationStore.removeForReportId(id);
        }
        return true;
      } catch (err) {
        console.error('Error removing report from localStorage:', err);
        return false;
      }
    },

    /**
     * Clear all reports from localStorage.
     */
    clearAll: function () {
      try {
        localStorage.removeItem(STORAGE_KEY);
        if (window.NotificationStore && typeof window.NotificationStore.clearAll === 'function') {
          window.NotificationStore.clearAll();
        }
        return true;
      } catch (err) {
        console.error('Error clearing reports:', err);
        return false;
      }
    },

    /**
     * Filter reports by type ('all', 'missing', 'found').
     * @param {string} type
     * @returns {Array<Object>}
     */
    getByType: function (type) {
      const all = this.getAll();
      if (!type || type === 'all') return all;
      return all.filter(item => item && item.type === type);
    }
  };

  // =========================================================================
  // Day 4: Notification Storage
  // =========================================================================
  const NotificationStore = {
    /**
     * Retrieve all notifications from localStorage safely.
     * @returns {Array<Object>}
     */
    getAll: function () {
      try {
        const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(item => item && typeof item === 'object') : [];
      } catch (err) {
        console.error('Error reading notifications from localStorage:', err);
        return [];
      }
    },

    /**
     * Safely write notification array to localStorage.
     * @param {Array<Object>} list
     * @returns {boolean}
     */
    saveAll: function (list) {
      try {
        const safeList = Array.isArray(list) ? list : [];
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(safeList));
        return true;
      } catch (err) {
        console.error('Error saving notifications to localStorage:', err);
        return false;
      }
    },

    /**
     * Checks if a notification already exists for the given pair of reports.
     * @param {string} pairKey e.g. "missingId_foundId"
     * @returns {boolean}
     */
    hasPair: function (pairKey) {
      if (!pairKey) return false;
      const all = this.getAll();
      return all.some(item => item && item.pairKey === pairKey);
    },

    /**
     * Add a new notification, preventing duplicates for identical report pairs.
     * @param {Object} notif
     * @returns {Object|null}
     */
    add: function (notif) {
      if (!notif || typeof notif !== 'object') return null;
      const all = this.getAll();
      if (notif.pairKey && all.some(item => item && item.pairKey === notif.pairKey)) {
        return null; // Prevent duplicate notification for identical report pair
      }
      const newNotif = {
        id: notif.id || ('notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
        createdAt: notif.createdAt || new Date().toISOString(),
        isRead: false,
        ...notif
      };
      all.unshift(newNotif); // newest first
      this.saveAll(all);
      return newNotif;
    },

    /**
     * Mark a single notification as read.
     * @param {string} id
     * @returns {boolean}
     */
    markAsRead: function (id) {
      if (!id) return false;
      const all = this.getAll();
      let found = false;
      const updated = all.map(item => {
        if (item && item.id === id) {
          found = true;
          return { ...item, isRead: true };
        }
        return item;
      });
      if (found) {
        this.saveAll(updated);
      }
      return found;
    },

    /**
     * Mark all notifications as read.
     * @returns {boolean}
     */
    markAllAsRead: function () {
      const all = this.getAll();
      const updated = all.map(item => ({ ...item, isRead: true }));
      this.saveAll(updated);
      return true;
    },

    /**
     * Delete a single notification.
     * @param {string} id
     * @returns {boolean}
     */
    remove: function (id) {
      if (!id) return false;
      const all = this.getAll();
      const filtered = all.filter(item => item && item.id !== id);
      this.saveAll(filtered);
      return true;
    },

    /**
     * Clean up notifications referencing a specific deleted report ID.
     * @param {string} reportId
     */
    removeForReportId: function (reportId) {
      if (!reportId) return;
      const all = this.getAll();
      const filtered = all.filter(item => item && item.missingId !== reportId && item.foundId !== reportId);
      this.saveAll(filtered);
    },

    /**
     * Cleans up stale notifications if either referenced report no longer exists.
     * @param {Array<string>} validReportIds
     */
    cleanOrphans: function (validReportIds) {
      if (!Array.isArray(validReportIds)) return;
      const idSet = new Set(validReportIds);
      const all = this.getAll();
      const filtered = all.filter(item => item && idSet.has(item.missingId) && idSet.has(item.foundId));
      if (filtered.length !== all.length) {
        this.saveAll(filtered);
      }
    },

    /**
     * Clear all notifications from storage.
     * @returns {boolean}
     */
    clearAll: function () {
      try {
        localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
        return true;
      } catch (err) {
        console.error('Error clearing notifications:', err);
        return false;
      }
    },

    /**
     * Count unread notifications.
     * @returns {number}
     */
    getUnreadCount: function () {
      const all = this.getAll();
      return all.filter(item => item && !item.isRead).length;
    }
  };

  window.ReportStore = ReportStore;
  window.NotificationStore = NotificationStore;
})(window);
