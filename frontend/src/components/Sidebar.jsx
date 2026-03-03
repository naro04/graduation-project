import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getMenuByRole } from "../config/menuConfig";
import { getEffectiveRole } from "../services/auth.js";

// Logo
const LogoDesktop = new URL("../images/LogoDesktop.png", import.meta.url).href;

// Menu icons - dynamic import helper
const getIconUrl = (iconName) => {
  try {
    return new URL(`../images/icons/${iconName}`, import.meta.url).href;
  } catch {
    return '';
  }
};

// Logout icon
const LogoutIcon = new URL("../images/icons/Log out.png", import.meta.url).href;

// تخزين المنيوهات المفتوحة خارج الكومبوننت حتى لا تُفقد عند الانتقال لصفحة أخرى (السايدبار يُعاد تركيبه)
const persistedExpandedIds = { current: [] };

const Sidebar = ({ userRole, activeMenu, setActiveMenu, isMobile = false, onClose, onLogoutClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // دور المستخدم المسجّل من الـ auth (مش من الـ route) عشان المنجر وغيره يشوفوا سايدبارهم
  const effectiveRole = getEffectiveRole();
  const menu = getMenuByRole(effectiveRole);

  const getParentIdFromActiveMenu = () => {
    if (activeMenu == null) return null;
    const str = String(activeMenu);
    if (str.includes("-")) {
      const id = parseInt(str.split("-")[0], 10);
      return Number.isNaN(id) ? null : id;
    }
    const id = parseInt(str, 10);
    if (Number.isNaN(id)) return null;
    const hasAsParent = menu.items.some((it) => it.id === id && it.hasSubmenu);
    return hasAsParent ? id : null;
  };

  // عند التركيب: نستخدم المنيوهات المفتوحة المحفوظة + قسم الصفحة الحالية (حتى لا يُغلق منيو آخر)
  const [expandedMenus, setExpandedMenus] = useState(() => {
    const parentId = getParentIdFromActiveMenu();
    const next = new Set(persistedExpandedIds.current);
    if (parentId != null) next.add(parentId);
    return Array.from(next);
  });

  // حفظ المنيوهات المفتوحة عند أي تغيير
  useEffect(() => {
    persistedExpandedIds.current = expandedMenus;
  }, [expandedMenus]);

  // إغلاق كل القوائم فقط في صفحة البروفايل
  useEffect(() => {
    if (activeMenu === null || location.pathname === "/profile") {
      setExpandedMenus([]);
      persistedExpandedIds.current = [];
    }
  }, [activeMenu, location.pathname]);

  // عند تغيير الصفحة: إبقاء قسم الصفحة الحالية مفتوحاً (بدون إغلاق الأقسام الأخرى)
  useEffect(() => {
    const parentId = getParentIdFromActiveMenu();
    if (parentId != null) {
      setExpandedMenus((prev) => (prev.includes(parentId) ? prev : [...prev, parentId]));
    }
  }, [activeMenu]);

  // Toggle submenu expansion
  const toggleSubmenu = (itemId) => {
    if (expandedMenus.includes(itemId)) {
      setExpandedMenus(expandedMenus.filter(id => id !== itemId));
    } else {
      setExpandedMenus([...expandedMenus, itemId]);
    }
  };

  // Handle menu item click: مع سهم = فتح/إغلاق المنيو فقط، بدون انتقال لأول صفحة
  const handleMenuClick = (item) => {
    if (item.hasSubmenu) {
      toggleSubmenu(item.id);
      if (isMobile && onClose) onClose();
    } else {
      setActiveMenu(item.id);
      if (item.path) navigate(item.path);
      if (isMobile && onClose) onClose();
    }
  };

  // Handle submenu item click
  const handleSubMenuClick = (subItem, parentId) => {
    setActiveMenu(`${parentId}-${subItem.id}`);
    // Navigate to the path if it exists
    if (subItem.path) {
      // Map "/more/profile" to "/profile"
      if (subItem.path === "/more/profile") {
        navigate("/profile");
      } else {
        navigate(subItem.path);
      }
    }
    if (isMobile && onClose) onClose();
  };

  return (
    <aside
      className={`w-[265px] flex flex-col flex-shrink-0 ${isMobile ? "h-full overflow-y-auto" : "min-h-screen"}`}
      style={{ backgroundColor: "#004D40", contain: "layout" }}
    >
      {/* Close Button - Mobile Only */}
      {isMobile && onClose && (
        <button
          onClick={onClose}
          className="absolute top-[16px] right-[12px] w-[32px] h-[32px] rounded-full bg-white/20 flex items-center justify-center z-10"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Logo Area */}
      <div className={`${isMobile ? 'pt-[12px] pb-[12px]' : 'pt-[16px] pb-[16px]'} flex justify-center items-center`}>
        <img
          src={LogoDesktop}
          alt="Mind-Body Medicine Logo"
          style={{ width: "160px", height: "auto", objectFit: "contain" }}
        />
      </div>

      {/* MENU Section Header */}
      <div className="px-[12px] mb-[12px]">
        <span className="text-[11px] font-medium text-white/60 tracking-wider uppercase">
          Menu
        </span>
      </div>

      {/* Menu Items */}
      <nav className="px-[12px]">
        <ul className="flex flex-col gap-[8px]">
          {menu.items.map((item) => {
            const isActiveSection = activeMenu === item.id && !item.hasSubmenu;
            const isParentOfActive = item.hasSubmenu && activeMenu != null && (String(activeMenu).startsWith(String(item.id) + "-") || activeMenu === item.id);
            const hasContainer = isActiveSection || isParentOfActive;
            return (
            <li key={item.id}>
              {/* Main Menu Item - كونتينر عند الاختيار (صفحة مباشرة أو فرعية) */}
              <button
                onClick={() => handleMenuClick(item)}
                type="button"
                className={`w-full h-[41px] flex items-center gap-[10px] px-[12px] rounded-[8px] transition-colors duration-150 ${
                  hasContainer ? "" : "hover:bg-white/10"
                }`}
                style={hasContainer ? { backgroundColor: "#003830" } : {}}
              >
                <img
                  src={getIconUrl(item.icon)}
                  alt={item.name}
                  className="w-[20px] h-[20px] object-contain flex-shrink-0"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
                <span
                  className={`text-white whitespace-nowrap flex-1 text-left ${
                    item.hasSubmenu && expandedMenus.includes(item.id) ? "text-[16px]" : "text-[14px]"
                  }`}
                  style={{
                    fontWeight: hasContainer || (item.hasSubmenu && expandedMenus.includes(item.id)) ? 600 : 400
                  }}
                >
                  {item.name}
                </span>
                {item.hasSubmenu && (
                  <svg
                    className={`w-[14px] h-[14px] flex-shrink-0 transition-transform duration-150 ease-out ${
                      expandedMenus.includes(item.id) ? "rotate-90" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Sub-Menu Items - ظهور سريع وخفيف */}
              {item.hasSubmenu && expandedMenus.includes(item.id) && (
                <ul className="flex flex-col mt-[2px] mb-[4px]">
                  {item.subItems?.map((subItem) => (
                    <li key={subItem.id}>
                      <button
                        type="button"
                        onClick={() => handleSubMenuClick(subItem, item.id)}
                        className={`w-full h-[36px] flex items-center px-[12px] rounded-[8px] transition-colors duration-150 ${
                          activeMenu === `${item.id}-${subItem.id}` ? "" : "hover:bg-white/10"
                        }`}
                        style={{
                          paddingLeft: "42px",
                          backgroundColor: activeMenu === `${item.id}-${subItem.id}` ? "#003830" : "transparent"
                        }}
                      >
                        <span
                          className={`whitespace-nowrap ${
                            activeMenu === `${item.id}-${subItem.id}` ? "text-[14px] text-white" : "text-[13px] text-white/80"
                          }`}
                          style={{
                            fontWeight: activeMenu === `${item.id}-${subItem.id}` ? 500 : 400
                          }}
                        >
                          • {subItem.name}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
          })}
        </ul>
      </nav>

      {/* Divider Line */}
      <div className="px-[12px] mt-[8px] mb-[8px]">
        <div className="h-[1px] bg-white/20"></div>
      </div>

      {/* Logout Button */}
      <div className="px-[12px] pb-[16px]">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onLogoutClick) {
              onLogoutClick();
            } else {
              navigate("/login");
            }
          }}
          className="w-full h-[41px] flex items-center gap-[10px] px-[12px] rounded-[8px] hover:bg-white/10 transition-colors duration-150"
        >
          <img
            src={LogoutIcon}
            alt="Log out"
            className="w-[20px] h-[20px] object-contain flex-shrink-0"
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <span className="text-[14px] font-normal text-white whitespace-nowrap">Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
