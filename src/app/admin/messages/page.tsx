"use client";

import { useState, useEffect, useCallback } from "react";
import ActionButton, { ActionButtonGroup } from "@/components/admin/ActionButton";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { SearchBar, FilterSelect, Alert } from '@/components/ui';
import "./messages.css";

interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  reply?: string | null;
  replyDate?: string | null;
}

export default function PesanMasuk() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch messages from API
  const fetchMessages = useCallback(async () => {

    try {
      setLoading(true);
      const url = filterStatus === "all" 
        ? "/api/messages" 
        : `/api/messages?status=${filterStatus}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch messages");
      
      const result = await response.json();
      // Handle both array and paginated response
      const data = Array.isArray(result) ? result : (result.data || []);
      setMessages(data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching messages:", error);
      setErrorMessage("Gagal memuat pesan. Silakan refresh halaman.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Filtered messages
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  const handleOpenDetail = async (message: Message) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
    
    // Mark as read when opened
    if (!message.isRead) {
      try {
        const response = await fetch(`/api/messages/${message.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ isRead: true }),
        });

        if (response.ok) {
          const updatedMessage = await response.json();
          setMessages(messages.map(m => 
            m.id === message.id ? updatedMessage : m
          ));
        }
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    }
  };

  const handleOpenReply = (message: Message) => {
    setSelectedMessage(message);
    setReplyText(message.reply || "");
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) {
      setErrorMessage("Balasan tidak boleh kosong");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`/api/messages/${selectedMessage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          reply: replyText.trim(),
          replyDate: new Date().toISOString(),
          isRead: true 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send reply");
      }

      const updatedMessage = await response.json();
      
      setMessages(messages.map(m => 
        m.id === selectedMessage.id ? { ...m, reply: updatedMessage.reply, replyDate: updatedMessage.replyDate, isRead: true } : m
      ));
      
      setShowReplyModal(false);
      setReplyText("");
      setSelectedMessage(null);
      
      // Show success message based on email status
      if (updatedMessage.emailSent) {
        setSuccessMessage(`✅ Balasan berhasil dikirim ke ${selectedMessage.email}!`);
      } else {
        setSuccessMessage(`📝 Balasan tersimpan. ${updatedMessage.emailError || 'Email tidak dikirim (konfigurasi email belum diatur).'}`);
      }
      setTimeout(() => setSuccessMessage(""), 8000);
    } catch (error) {
      console.error("Error sending reply:", error);
      setErrorMessage(error instanceof Error ? error.message : "Gagal mengirim balasan");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setSending(false);
    }
  };

  const handleToggleRead = async (id: number) => {
    const message = messages.find(m => m.id === id);
    if (!message) return;

    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isRead: !message.isRead }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update message");
      }

      const updatedMessage = await response.json();
      setMessages(messages.map(m => m.id === id ? updatedMessage : m));
      setSuccessMessage(updatedMessage.isRead ? "Pesan ditandai sudah dibaca" : "Pesan ditandai belum dibaca");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error toggling read status:", error);
      setErrorMessage(error instanceof Error ? error.message : "Gagal mengubah status baca");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleDeleteClick = (message: Message) => {
    setDeletingMessage(message);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMessage) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/messages/${deletingMessage.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete message");

      setMessages(messages.filter(m => m.id !== deletingMessage.id));
      setSuccessMessage("Pesan berhasil dihapus");
      setDeletingMessage(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting message:", error);
      setErrorMessage("Gagal menghapus pesan");
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="pesan-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Pesan Masuk</h1>
          <p>Lihat dan balas pesan dari customer</p>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} pesan belum dibaca</span>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}

      {/* Filters */}
      <div className="filter-section">
        <SearchBar
          value={searchTerm}
          onChange={(value) => setSearchTerm(value)}
          placeholder="Cari nama, email, atau subjek..."
        />
        <FilterSelect
          label="Filter:"
          value={filterStatus}
          onChange={(value) => setFilterStatus(value)}
          options={[
            { value: 'all', label: 'Semua Pesan' },
            { value: 'unread', label: 'Belum Dibaca' },
            { value: 'read', label: 'Sudah Dibaca' },
            { value: 'replied', label: 'Sudah Dibalas' }
          ]}
        />
      </div>

      {/* Loading State */}
      {loading ? null : (
        /* Messages List */
        <div className="messages-list">
          {filteredMessages.length > 0 ? (
            filteredMessages.map((message) => (
              <div 
                key={message.id} 
                className={`message-item ${!message.isRead ? 'unread' : ''} ${message.reply ? 'replied' : ''}`}
              >
                <div className="message-header">
                  <div className="sender-info">
                    <div className="avatar">
                      {message.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="sender-details">
                      <h3>{message.name}</h3>
                      <p className="email">{message.email}</p>
                    </div>
                  </div>
                  <div className="message-meta">
                    <span className="date">{formatDate(message.createdAt)}</span>
                    {!message.isRead && <span className="badge-unread">Baru</span>}
                    {message.reply && <span className="badge-replied">Dibalas</span>}
                  </div>
                </div>
                
                <div className="message-content">
                  <h4>{message.subject}</h4>
                  <p>{message.message.substring(0, 150)}{message.message.length > 150 ? '...' : ''}</p>
                </div>

                <div className="message-actions">
                  <ActionButtonGroup>
                    <ActionButton 
                      type="detail" 
                      onClick={() => handleOpenDetail(message)}
                      title="Lihat Detail"
                    />
                    <ActionButton 
                      type="delete" 
                      onClick={() => handleDeleteClick(message)}
                    />
                  </ActionButtonGroup>
                  <button 
                    className="btn-reply" 
                    onClick={() => handleOpenReply(message)}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(76, 175, 80, 0.15)',
                      color: '#4CAF50',
                      border: '1px solid #4CAF50',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {message.reply ? '💬 Edit Balasan' : '💬 Balas'}
                  </button>
                  <button 
                    className="btn-mark-read" 
                    onClick={() => handleToggleRead(message.id)}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(156, 39, 176, 0.15)',
                      color: '#AB47BC',
                      border: '1px solid #9C27B0',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {message.isRead ? '📩 Belum Dibaca' : '📧 Tandai Dibaca'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>Tidak ada pesan yang ditemukan</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedMessage && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detail Pesan</h2>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <label>Dari:</label>
                <p><strong>{selectedMessage.name}</strong> ({selectedMessage.email})</p>
              </div>
              <div className="detail-section">
                <label>Subjek:</label>
                <p><strong>{selectedMessage.subject}</strong></p>
              </div>
              <div className="detail-section">
                <label>Tanggal:</label>
                <p>{formatDate(selectedMessage.createdAt)}</p>
              </div>
              <div className="detail-section">
                <label>Pesan:</label>
                <div className="message-box">
                  {selectedMessage.message}
                </div>
              </div>
              {selectedMessage.reply && (
                <div className="detail-section reply-section">
                  <label>Balasan Anda:</label>
                  <div className="reply-box">
                    <p><small>Dibalas pada: {formatDate(selectedMessage.replyDate || "")}</small></p>
                    <p>{selectedMessage.reply}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="btn-barizta" 
                onClick={() => {
                  setShowDetailModal(false);
                  handleOpenReply(selectedMessage);
                }}
              >
                Balas Pesan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Balas Pesan</h2>
              <button className="modal-close" onClick={() => setShowReplyModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="reply-info">
                <p><strong>Kepada:</strong> {selectedMessage.name} ({selectedMessage.email})</p>
                <p><strong>Subjek:</strong> Re: {selectedMessage.subject}</p>
              </div>
              <div className="form-group">
                <label>Pesan Asli:</label>
                <div className="original-message">
                  {selectedMessage.message}
                </div>
              </div>
              <div className="form-group">
                <label>Balasan Anda: *</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={8}
                  placeholder="Tulis balasan Anda di sini..."
                  required
                  disabled={sending}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary-barizta" onClick={() => setShowReplyModal(false)} disabled={sending}>
                Batal
              </button>
              <button className="btn-barizta" onClick={handleSendReply} disabled={sending}>
                {sending ? "Mengirim..." : "Kirim Balasan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingMessage}
        onClose={() => setDeletingMessage(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deletingMessage ? `pesan dari ${deletingMessage.name}` : ""}
        itemType=""
        isLoading={isDeleting}
      />
    </div>
  );
}
