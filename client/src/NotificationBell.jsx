import { useState, useEffect } from "react";
import api from "./api";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = () => {
    api.get("notifications/").then((res) => setNotifications(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      notifications.forEach((n) => {
        if (!n.is_read) api.patch(`notifications/${n.id}/`, { is_read: true });
      });
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    }
  };

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative p-2 bg-white rounded-full hover:bg-gray-100 shadow border border-gray-200 transition">
        {/* Professional 2D Bell Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border z-50 overflow-hidden">
          <div className="p-3 border-b bg-gray-50 font-bold text-gray-700">Notifications</div>
          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 && <p className="p-4 text-sm text-gray-500">No notifications yet.</p>}
            {notifications.map((n) => (
              <div key={n.id} className={`p-3 border-b text-sm hover:bg-gray-50 ${n.is_read ? 'bg-white' : 'bg-blue-50 font-medium'}`}>
                {n.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}