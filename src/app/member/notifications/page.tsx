"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FilterSelect } from '@/components/ui';
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
  const router = useRouter();
  const [user, setUser] = useState<{ id: number } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // Get user session
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/auth/login");
      }
    };
    getUser();
  }, [router]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);

      // Fetch member notifications from new API
      const url = filter === "unread"
        ? `/api/notifications?target=member&userId=${user.id}&filter=unread`
        : `/api/notifications?target=member&userId=${user.id}`;

      const res = await fetch(url);
      const data = res.ok ? await res.json() : [];

      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, filter]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

  const markAsRead = async (id: number) => {
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
    if (!user?.id) return;
    
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true, target: "member", userId: user.id }),
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id: number) => {
    markAsRead(id);
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
      case "success": return "✅";
      case "error": return "❌";
      case "warning": return "⚠️";
      default: return "ℹ️";
    }
  };

  return (
    <div className="notifications-page">
      <style jsx>{`
        .notifications-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .page-header h1 {
          color: #ffd7a8;
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
        }

        .unread-badge {
          background: linear-gradient(135deg, #d4a574, #e6c39a);
          color: #2c1810;
          padding: 0.35rem 0.85rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(212, 165, 116, 0.3);
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .filter-select {
          padding: 0.6rem 1rem;
          border: 1px solid rgba(255, 215, 168, 0.15);
          border-radius: 10px;
          background: rgba(42, 24, 16, 0.6);
          color: #ffd7a8;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .filter-select:focus {
          outline: none;
          border-color: rgba(212, 165, 116, 0.5);
        }

        .btn-mark-all {
          padding: 0.6rem 1.25rem;
          background: linear-gradient(145deg, rgba(62, 39, 35, 0.8), rgba(46, 29, 24, 0.9));
          border: 1px solid rgba(255, 215, 168, 0.15);
          border-radius: 10px;
          color: #d4a574;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .btn-mark-all:hover {
          background: rgba(212, 165, 116, 0.15);
          color: #ffd7a8;
          transform: translateY(-2px);
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          text-align: center;
          color: #e6d5c3;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(212, 165, 116, 0.2);
          border-top-color: #d4a574;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          background: linear-gradient(145deg, rgba(62, 39, 35, 0.4), rgba(46, 29, 24, 0.5));
          border-radius: 16px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          opacity: 0.6;
        }

        .empty-state h3 {
          color: #ffd7a8;
          margin-bottom: 0.75rem;
          font-weight: 700;
          font-size: 1.4rem;
        }

        .empty-state p {
          color: rgba(212, 165, 116, 0.8);
          font-size: 1.1rem;
          margin: 0;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: linear-gradient(145deg, rgba(62, 39, 35, 0.6), rgba(46, 29, 24, 0.7));
          border: 1px solid rgba(255, 215, 168, 0.12);
          border-radius: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .notification-item:hover {
          background: linear-gradient(145deg, rgba(70, 45, 40, 0.7), rgba(50, 32, 26, 0.8));
          border-color: rgba(212, 165, 116, 0.25);
          transform: translateY(-2px);
        }

        .notification-item.unread {
          background: linear-gradient(145deg, rgba(212, 165, 116, 0.1), rgba(212, 165, 116, 0.05));
          border-left: 4px solid #d4a574;
        }

        .notification-icon {
          font-size: 1.75rem;
          min-width: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.3), rgba(212, 165, 116, 0.2));
          border-radius: 12px;
        }

        .notification-content {
          flex: 1;
        }

        .notification-content h3 {
          color: #ffd7a8;
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
        }

        .notification-content p {
          color: #e6d5c3;
          margin: 0 0 0.5rem;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .notification-time {
          color: rgba(212, 165, 116, 0.7);
          font-size: 0.8rem;
        }

        .notification-actions {
          display: flex;
          gap: 0.5rem;
        }

        .notification-actions button {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 215, 168, 0.15);
          cursor: pointer;
          padding: 0.55rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          font-size: 1rem;
        }

        .notification-actions button:hover {
          background: rgba(212, 165, 116, 0.15);
          transform: translateY(-2px);
        }

        .btn-read {
          color: #4caf50;
        }

        .btn-read:hover {
          border-color: rgba(76, 175, 80, 0.4);
        }

        .btn-delete {
          color: #ef5350;
        }

        .btn-delete:hover {
          border-color: rgba(244, 67, 54, 0.4);
        }

        @media (max-width: 768px) {
          .notifications-page {
            padding: 1rem;
          }
          
          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .notification-item {
            flex-wrap: wrap;
            padding: 1.25rem;
          }
          
          .notification-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 0.75rem;
          }
        }
      `}</style>

      <div className="page-header">
        <div className="header-left">
          <h1>Notifikasi</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} belum dibaca</span>
          )}
        </div>
        <div className="header-actions">
          <FilterSelect
            value={filter}
            onChange={(value) => setFilter(value as "all" | "unread")}
            placeholder="Filter"
            options={[
              { value: 'all', label: 'Semua' },
              { value: 'unread', label: 'Belum Dibaca' }
            ]}
          />
          {unreadCount > 0 && (
            <button className="btn-mark-all" onClick={markAllAsRead}>
              Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
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
              className={`notification-item ${!notification.isRead ? "unread" : ""}`}
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
