"use client";

import { useState, useEffect, useCallback } from "react";
import "./notif-simple.css";

interface Notification {
  id: number;
  userId?: number;
  target: string;
  title: string;
  message: string;
  url?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const url = filter === "unread" 
        ? "/api/notifications?target=admin&filter=unread"
        : "/api/notifications?target=admin";
        
      const res = await fetch(url);
      const data = res.ok ? await res.json() : [];

      setNotifications(data);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map(n => n.id));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const markSelectedAsRead = async () => {
    if (selectedIds.length === 0) return;
    
    setProcessing(true);
    try {
      for (const id of selectedIds) {
        await fetch("/api/notifications/mark-read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: id }),
        });
      }
      
      // Update UI
      setNotifications(prev =>
        prev.map(n => selectedIds.includes(n.id) ? { ...n, isRead: true } : n)
      );
      setSelectedIds([]);
    } catch (error) {
      console.error("Error marking as read:", error);
    } finally {
      setProcessing(false);
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Hapus ${selectedIds.length} notifikasi?`)) return;
    
    setProcessing(true);
    try {
      // Call delete API with bulk IDs
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete notifications");
      }

      // Remove from UI after successful deletion
      setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error("Error deleting notifications:", error);
      alert("Gagal menghapus notifikasi. Silakan coba lagi.");
    } finally {
      setProcessing(false);
    }
  };

  // Mark single notification as read
  const markAsRead = async (id: number) => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Delete single notification
  const deleteNotification = async (id: number) => {
    if (!confirm("Hapus notifikasi ini?")) return;
    
    try {
      const response = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const filteredNotifications = notifications;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return "ℹ️";
      case "registration":
        return "👤";
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "📢";
    }
  };

  return (
    <div className="notifications-page">
      <div className="page-header">
        <div className="header-left">
          <h1>Notifikasi Admin</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} belum dibaca</span>
          )}
        </div>
        <div className="header-actions">
          <label className="filter-label">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "unread")}
            className="filter-select"
            aria-label="Filter notifikasi"
          >
            <option value="all">Semua Notifikasi</option>
            <option value="unread">Belum Dibaca</option>
          </select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">{selectedIds.length} dipilih</span>
          <button 
            className="btn-bulk-read" 
            onClick={markSelectedAsRead}
            disabled={processing}
          >
            ✓ Tandai Dibaca
          </button>
          <button 
            className="btn-bulk-delete" 
            onClick={deleteSelected}
            disabled={processing}
          >
            🗑️ Hapus
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Memuat...</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔔</span>
          <h3>Tidak ada notifikasi</h3>
          <p>Semua notifikasi sudah dibaca atau tidak ada notifikasi baru.</p>
        </div>
      ) : (
        <div className="notifications-container">
          <div className="table-header">
            <input
              type="checkbox"
              checked={selectedIds.length === notifications.length && notifications.length > 0}
              onChange={handleSelectAll}
              className="checkbox-select"
            />
            <span className="header-title">Pilih Semua</span>
          </div>
          
          <div className="notifications-list">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.isRead ? 'unread' : ''} ${selectedIds.includes(notification.id) ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(notification.id)}
                  onChange={() => handleSelectOne(notification.id)}
                  className="checkbox-select"
                />
                
                <div className="notification-icon">
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{formatDate(notification.createdAt)}</div>
                </div>
                
                {!notification.isRead && (
                  <div className="notification-new-badge">Baru</div>
                )}

                <div className="notification-actions">
                  {!notification.isRead && (
                    <button
                      className="btn-read"
                      onClick={() => markAsRead(notification.id)}
                      title="Tandai sudah dibaca"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    className="btn-delete"
                    onClick={() => deleteNotification(notification.id)}
                    title="Hapus notifikasi"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
