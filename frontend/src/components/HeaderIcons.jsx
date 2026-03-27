import React, { useState, useRef, useEffect } from "react";
import NotificationBell from "./NotificationBell";

const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;

/**
 * أيقونة الرسائل – تفتح dropdown (جاهز لربط API لاحقاً)
 */
const MessagesIcon = ({ iconSize = "w-[20px] h-[20px]", buttonSize = "w-[36px] h-[36px]" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`relative ${buttonSize} rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors`}
        aria-label="Messages"
      >
        <img src={MessageIcon} alt="Messages" className={`${iconSize} object-contain`} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[260px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] z-50 p-4">
          <p className="text-[14px] font-semibold text-[#333333]">Messages</p>
          <p className="text-[13px] text-[#6B7280] mt-1">Coming soon</p>
        </div>
      )}
    </div>
  );
};

/**
 * مجموعة أيقونات الهيدر: الرسائل + الإشعارات – تستخدم في كل الصفحات وكل الأدوار
 */
const HeaderIcons = ({ iconSize = "w-[20px] h-[20px]", buttonSize = "w-[36px] h-[36px]" }) => (
  <>
    <MessagesIcon iconSize={iconSize} buttonSize={buttonSize} />
    <NotificationBell iconSize={iconSize} buttonSize={buttonSize} />
  </>
);

export default HeaderIcons;
export { MessagesIcon };
