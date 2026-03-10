import { createContext, useState, useCallback } from "react";

const PROMO_NOTIFICATIONS = [
  {
    id: "promo-1",
    type: "promo",
    title: "Weekend Flash Sale",
    body: "Up to 40% off on select timepieces. Today only.",
    time: "1h ago",
    read: false,
  },
  {
    id: "promo-2",
    type: "promo",
    title: "New Arrivals — Maison Collection",
    body: "The Maison VIII series has just landed. Explore the new drop.",
    time: "3d ago",
    read: true,
  },
  {
    id: "promo-3",
    type: "promo",
    title: "Members-Only Offer",
    body: "Complimentary engraving on all orders above ₹50,000 this month.",
    time: "5d ago",
    read: true,
  },
];

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(PROMO_NOTIFICATIONS);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      { id: `notif-${Date.now()}`, read: false, time: "Just now", ...notification },
      ...prev,
    ]);
  }, []);

  const markRead = useCallback((id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // ── Delete single notification ──
  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // ── Clear all notifications ──
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markRead, markAllRead, deleteNotification, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};