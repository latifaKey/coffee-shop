"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { notificationDropdownStyles } from "../notifications/notificationStyles";

// Member Notification Bell - Themed with brown colors
interface Notification {
  id: number;
  title: string;
  message: string;
  url?: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface MemberNotificationBellProps {
  userId: number;
}

export default function MemberNotificationBell({ userId }: MemberNotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?target=member&userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchNotifications();

      // Polling every 5 seconds
      const interval = setInterval(fetchNotifications, 5000);

      return () => clearInterval(interval);
    }
  }, [userId, fetchNotifications]);

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true, target: "member", userId }),
      });
      
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeClass = (type: string) => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "error";
      case "warning":
        return "warning";
      default:
        return "info";
    }
  };

  const badgeLabel = useMemo(() => {
    if (unreadCount > 99) return "99+";
    if (unreadCount > 9) return "9+";
    return String(unreadCount);
  }, [unreadCount]);

  const unreadNotifications = useMemo(
    () => notifications.filter((notif) => !notif.isRead),
    [notifications]
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <div className="notification-wrapper">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`notification-btn ${showDropdown ? "active" : ""}`}
        aria-label="Notifikasi"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && <span className="notification-badge">{badgeLabel}</span>}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifikasi</h4>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={loading}
                className="notification-mark-read"
              >
                {loading ? "Memproses..." : "Tandai semua dibaca"}
              </button>
            )}
          </div>

          <div className="notification-list">
            {unreadNotifications.length === 0 ? (
              <div className="notification-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.6}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                Tidak ada notifikasi baru
              </div>
            ) : (
              unreadNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.isRead ? "unread" : ""}`}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif.id);
                    if (notif.url) {
                      window.location.href = notif.url;
                    }
                    setShowDropdown(false);
                  }}
                >
                  <div className={`notification-icon ${getTypeClass(notif.type)}`}>
                    {notif.type === "success" ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : notif.type === "error" ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : notif.type === "warning" ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.166 10.6a.75.75 0 011.034-.267l1.94 1.12a3 3 0 001.5.4h5.72a1.5 1.5 0 001.5-1.5V9.9l-6.63-3.83a1.5 1.5 0 00-1.5 0l-3.94 2.27a.75.75 0 01-.74-1.3l3.94-2.27a3 3 0 013 0l6.63 3.83A1.5 1.5 0 0115.96 11a3 3 0 01-3 3h-5.72a4.5 4.5 0 01-2.25-.6l-1.94-1.12a.75.75 0 01-.27-1.04z" />
                      </svg>
                    )}
                  </div>
                  <div className="notification-content">
                    <p className="notification-title">{notif.title}</p>
                    <p className="notification-message">{notif.message}</p>
                    <p className="notification-time">{formatDate(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && <div className="notification-unread-dot" />}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <Link href="/member/notifications" onClick={() => setShowDropdown(false)}>
                Lihat semua notifikasi
              </Link>
            </div>
          )}
        </div>
      )}

      {showDropdown && <div className="notification-overlay" onClick={() => setShowDropdown(false)} />}

      <style jsx>{notificationDropdownStyles}</style>
    </div>
  );
}
