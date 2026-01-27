export const notificationDropdownStyles = `
.notification-wrapper {
  position: relative;
  display: inline-flex;
}

.notification-btn {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(134, 86, 52, 0.6);
  background: radial-gradient(circle at 35% 25%, rgba(176, 122, 82, 0.42), rgba(38, 22, 15, 0.95));
  color: #e8caa6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: inset 0 0 0 1px rgba(18, 10, 6, 0.65), 0 12px 24px rgba(0, 0, 0, 0.35);
}

.notification-btn:hover,
.notification-btn:focus-visible,
.notification-btn.active {
  border-color: rgba(226, 188, 140, 0.75);
  color: #f7e8d1;
  box-shadow: inset 0 0 0 1px rgba(28, 17, 11, 0.9), 0 16px 28px rgba(0, 0, 0, 0.45);
  outline: none;
  transform: translateY(-1px);
}

.notification-btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 1.8px;
}

.notification-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: linear-gradient(145deg, #ce8441, #8f521f);
  border: 1px solid rgba(23, 13, 9, 0.75);
  color: #fff7ed;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.02em;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.45);
}

.notification-dropdown {
  position: absolute;
  top: calc(100% + 18px);
  right: 0;
  width: 380px;
  background: linear-gradient(155deg, rgba(28, 18, 14, 0.96), rgba(16, 10, 7, 0.94));
  border: 1px solid rgba(82, 52, 35, 0.65);
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.55);
  color: #f4dfc8;
  overflow: hidden;
  z-index: 1500;
  backdrop-filter: blur(6px);
  animation: notification-fade-in 0.2s ease forwards;
}

.notification-dropdown::before {
  content: "";
  position: absolute;
  top: -10px;
  right: 18px;
  width: 18px;
  height: 18px;
  background: inherit;
  border-radius: 4px;
  transform: rotate(45deg);
  border-left: 1px solid rgba(82, 52, 35, 0.65);
  border-top: 1px solid rgba(82, 52, 35, 0.65);
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.4);
}

.notification-header {
  padding: 1.1rem 1.35rem 1rem;
  background: rgba(16, 10, 7, 0.85);
  border-bottom: 1px solid rgba(94, 60, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.notification-header h4 {
  margin: 0;
  font-size: 1.02rem;
  font-weight: 600;
  color: #e8cba2;
}

.notification-mark-read {
  border: none;
  background: linear-gradient(135deg, rgba(137, 86, 49, 0.32), rgba(90, 56, 33, 0.62));
  color: #f5d9b6;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.notification-mark-read:hover,
.notification-mark-read:focus-visible {
  background: linear-gradient(135deg, rgba(165, 108, 64, 0.5), rgba(109, 64, 36, 0.7));
  color: #fff2e2;
  outline: none;
}

.notification-mark-read:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.notification-list {
  max-height: 380px;
  overflow-y: auto;
  padding-right: 0.3rem;
  scroll-behavior: smooth;
}

.notification-list::-webkit-scrollbar {
  width: 8px;
}

.notification-list::-webkit-scrollbar-track {
  background: rgba(21, 13, 9, 0.6);
}

.notification-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #a16433, #d9a16c);
  border-radius: 6px;
}

.notification-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #d9a16c, #f0cfa0);
}

.notification-item {
  display: flex;
  gap: 0.9rem;
  padding: 1rem 1.35rem;
  border-bottom: 1px solid rgba(84, 52, 35, 0.35);
  transition: background 0.2s ease, transform 0.2s ease;
  cursor: pointer;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: rgba(99, 61, 40, 0.36);
}

.notification-item.unread {
  background: rgba(149, 90, 53, 0.22);
  border-left: 3px solid rgba(220, 167, 120, 0.8);
}

.notification-icon {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f6ede0;
  flex-shrink: 0;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.45);
}

.notification-icon.success {
  background: linear-gradient(135deg, rgba(58, 112, 81, 0.92), rgba(32, 65, 47, 0.9));
  color: #bee9c9;
}

.notification-icon.warning {
  background: linear-gradient(135deg, rgba(168, 109, 44, 0.92), rgba(110, 65, 24, 0.92));
  color: #fbe2b9;
}

.notification-icon.error {
  background: linear-gradient(135deg, rgba(144, 52, 42, 0.92), rgba(92, 32, 26, 0.92));
  color: #f3b2ab;
}

.notification-icon.info {
  background: linear-gradient(135deg, rgba(105, 73, 52, 0.92), rgba(68, 41, 28, 0.92));
  color: #f4dfc8;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  color: #f4dfc8;
  font-weight: 600;
  font-size: 0.95rem;
  margin: 0 0 0.3rem 0;
}

.notification-message {
  color: #c9aa8b;
  font-size: 0.88rem;
  line-height: 1.45;
  margin: 0 0 0.45rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  color: #8f7763;
  font-size: 0.76rem;
  letter-spacing: 0.01em;
}

.notification-unread-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: linear-gradient(145deg, #f0c18b, #d38a47);
  box-shadow: 0 0 6px rgba(255, 196, 130, 0.6);
  flex-shrink: 0;
  margin-top: 0.4rem;
}

.notification-empty {
  padding: 2.25rem 1.5rem;
  text-align: center;
  color: #b18f71;
  font-size: 0.9rem;
}

.notification-empty svg {
  width: 54px;
  height: 54px;
  margin-bottom: 1rem;
  color: rgba(102, 70, 47, 0.45);
}

.notification-footer {
  padding: 0.95rem 1.35rem;
  background: rgba(19, 11, 8, 0.92);
  border-top: 1px solid rgba(84, 52, 35, 0.45);
  text-align: center;
}

.notification-footer a {
  color: #f0cfa0;
  font-weight: 600;
  font-size: 0.88rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.notification-footer a:hover,
.notification-footer a:focus-visible {
  color: #ffe7c4;
  outline: none;
}

.notification-overlay {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 1200;
}

@media (max-width: 540px) {
  .notification-dropdown {
    width: calc(100vw - 2.5rem);
    right: -1.25rem;
  }

  .notification-dropdown::before {
    right: 32px;
  }
}

@keyframes notification-fade-in {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
