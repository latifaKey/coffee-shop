"use client";

import { useState, useEffect, useCallback } from "react";
import "./notifications.css";

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

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch admin notifications from new API
      const url = filter === "unread" 
        ? "/api/notifications?target=admin&filter=unread"
        : "/api/notifications?target=admin";
        
      const res = await fetch(url);
      const data = res.ok ? await res.json() : [];

      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    // Update local state immediately for better UX
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    // Update local state immediately
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      await fetch("/api/notifications/mark-read", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true, target: "admin" }),
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: number) => {
    // For now, just mark as read (we don't have delete endpoint)
    markAsRead(id);
    
    // Remove from UI
    setNotifications((prev) => prev.filter((n) => n.id !== id));
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
          <h1>Notifikasi</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} belum dibaca</span>
          )}
        </div>
        <div className="header-actions">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "unread")}
            className="filter-select"
          >
            <option value="all">Semua</option>
            <option value="unread">Belum Dibaca</option>
          </select>
          {unreadCount > 0 && (
            <button className="btn-mark-all" onClick={markAllAsRead}>
              Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {loading ? null : filteredNotifications.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🔔</span>
          <h3>Tidak ada notifikasi</h3>
          <p>Semua notifikasi sudah dibaca atau tidak ada notifikasi baru.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.isRead ? "read" : "unread"} type-${notification.type}`}
            >
              <div className="notification-icon">
                {getTypeIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <span className="notification-time">
                  {formatDate(notification.createdAt)}
                </span>
              </div>
              <div className="notification-actions">
                {!notification.isRead && (
                  <button
                    className="btn-read"
                    onClick={() => markAsRead(notification.id)}
                    title="Tandai dibaca"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="btn-delete"
                  onClick={() => deleteNotification(notification.id)}
                  title="Hapus"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
