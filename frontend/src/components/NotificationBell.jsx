import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../services/notifications";

const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;

/**
 * 🔔 Notification Bell – يعرض عدد غير المقروءة وdropdown بالإشعارات.
 * مرتبط بـ: GET /notifications, PATCH /notifications/:id/read, PATCH /notifications/read-all
 */
const NotificationBell = ({ className = "", iconSize = "w-[20px] h-[20px]", buttonSize = "w-[36px] h-[36px]" }) => {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { list: nextList, unreadCount: nextUnread } = await getNotifications();
      setList(Array.isArray(nextList) ? nextList : []);
      setUnreadCount(typeof nextUnread === "number" ? nextUnread : 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setList([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // تجيبي الإشعارات أول ما الصفحة تفتح (للعرض على الجرس)
  useEffect(() => {
    fetchNotifications();
  }, []);

  // عند فتح الـ dropdown نحدّث القائمة
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleItemClick = async (item) => {
    if (item.id && !item.is_read) {
      try {
        await markNotificationRead(item.id);
        setList((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (_) {}
    }
    if (item.link) navigate(item.link);
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setList((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (_) {}
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`relative ${buttonSize} rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors`}
        aria-label="Notifications"
      >
        <img src={NotificationIcon} alt="Notifications" className={`${iconSize} object-contain`} />
        {unreadCount > 0 && (
          <span className="absolute top-[4px] right-[4px] min-w-[8px] h-[8px] px-1 flex items-center justify-center bg-red-500 rounded-full text-[10px] text-white font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[320px] max-h-[400px] overflow-hidden bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] z-50 flex flex-col">
          <div className="p-3 border-b border-[#E0E0E0] flex items-center justify-between">
            <span className="text-[14px] font-semibold text-[#333333]">Notifications</span>
            {list.some((n) => !n.is_read) && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[12px] text-[#0C8DFE] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="overflow-y-auto max-h-[320px]">
            {loading ? (
              <div className="p-4 text-center text-[14px] text-[#6B7280]">Loading...</div>
            ) : list.length === 0 ? (
              <div className="p-4 text-center text-[14px] text-[#6B7280]">No notifications</div>
            ) : (
              list.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`w-full text-left px-3 py-3 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors ${!item.is_read ? "bg-[#F0F9FF]" : ""}`}
                >
                  <p className="text-[13px] font-medium text-[#111827]">{item.title || "Notification"}</p>
                  <p className="text-[12px] text-[#6B7280] mt-0.5 line-clamp-2">{item.message}</p>
                  {item.created_at && (
                    <p className="text-[11px] text-[#9CA3AF] mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
