import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getEffectiveRole, getCurrentUser } from "../services/auth.js";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Category icons
const BookIcon = new URL("../images/icons/book.png", import.meta.url).href;
const TimeIcon = new URL("../images/icons/time.png", import.meta.url).href;
const PulseIcon = new URL("../images/icons/pulse.png", import.meta.url).href;
const LeaveIcon = new URL("../images/icons/leave.png", import.meta.url).href;
const EmployeesIcon = new URL("../images/icons/employees2.png", import.meta.url).href;
const SettingIcon = new URL("../images/icons/setteing.png", import.meta.url).href;

// Resource icons
const VideoIcon = new URL("../images/icons/video.png", import.meta.url).href;
const LeftArrowIcon = new URL("../images/icons/left.png", import.meta.url).href;

import LogoutModal from "./LogoutModal";
import { getHelpContent } from "../services/helpCenter";

const roleDisplayNames = {
  superAdmin: "Super Admin",
  hr: "HR Admin",
  manager: "Manager",
  fieldEmployee: "Field Employee",
  officer: "Officer"
};

const CATEGORY_ICONS = [BookIcon, TimeIcon, PulseIcon, LeaveIcon, EmployeesIcon, SettingIcon];

const DEFAULT_CATEGORIES = [
    {
      id: 1,
      title: "Getting Started",
      icon: BookIcon,
      description: "Learn the basics of the HR & Field Activity Management System",
      links: [
        "Introduction to the Platform",
        "Settings up your Account",
        "Dashboard Overview",
        "User Roles and Permissions"
      ]
    },
    {
      id: 2,
      title: "Attendance & GPS",
      icon: TimeIcon,
      description: "Track employee attendance and manage GPS-based check-ins",
      links: [
        "How to Mark Attendance",
        "GPS Location Tracking",
        "Setting Up Geofencing",
        "Attendance Reports"
      ]
    },
    {
      id: 3,
      title: "Activities & Reports",
      icon: PulseIcon,
      description: "Manage field activities and generate comprehensive reports",
      links: [
        "Creating Field Activities",
        "Activity Status Tracking",
        "Generating Reports",
        "Export Data"
      ]
    },
    {
      id: 4,
      title: "Leave Management",
      icon: LeaveIcon,
      description: "Handle leave requests, approvals, and leave policies",
      links: [
        "Submitting Leave Requests",
        "Leave Approval Workflow",
        "Leave Balance Overview",
        "Leave Policies"
      ]
    },
    {
      id: 5,
      title: "Employee Management",
      icon: EmployeesIcon,
      description: "Add, edit, and manage employee information",
      links: [
        "Adding New Employees",
        "Managing Employee Profiles",
        "Department Setup",
        "Employee Onboarding"
      ]
    },
    {
      id: 6,
      title: "System Configuration",
      icon: SettingIcon,
      description: "Configure system settings and customize workflows",
      links: [
        "System Settings Overview",
        "Notifications Configuration",
        "API Integration",
        "Security Settings"
      ]
    }
  ];

const DEFAULT_POPULAR_ARTICLES = [
  { id: 1, title: "How to reset your password?", views: "2.5k" },
  { id: 2, title: "Setting up GPS-based attendance", views: "1.8k" },
  { id: 3, title: "Understanding leave approval workflows", views: "1.6k" },
  { id: 4, title: "Generating monthly attendance reports", views: "1.4k" },
  { id: 5, title: "Configuring notification settings", views: "1.2k" }
];

const HelpCenterPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const effectiveRole = getEffectiveRole(userRole);
  const [activeMenu, setActiveMenu] = useState("8-5");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const desktopDropdownRef = useRef(null);

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [popularArticles, setPopularArticles] = useState(DEFAULT_POPULAR_ARTICLES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toText = (val) => (val != null && typeof val === "object" ? "" : String(val ?? ""));
  const normalizeLinks = (links) => {
    if (!Array.isArray(links)) return [];
    return links.map((link) => {
      if (typeof link === "object" && link !== null) {
        return { title: toText(link.title), path: toText(link.path) || "#" };
      }
      return { title: toText(link), path: "#" };
    });
  };
  const normalizeCategory = (cat, index) => ({
    id: cat.id ?? index,
    title: toText(cat.title),
    description: toText(cat.description),
    icon: CATEGORY_ICONS[index % CATEGORY_ICONS.length],
    links: normalizeLinks(cat.links)
  });
  const normalizeArticle = (item, index) => ({
    id: item.id ?? index,
    title: toText(item.title),
    views: toText(item.views ?? item.view_count ?? "0")
  });

  useEffect(() => {
    let cancelled = false;
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getHelpContent();
        if (cancelled) return;
        const cats = Array.isArray(data) ? data : data.categories || [];
        const articles = data.popular_articles || [];
        setCategories(cats.length ? cats.map((cat, i) => normalizeCategory(cat, i)) : DEFAULT_CATEGORIES);
        setPopularArticles(articles.length ? articles.map((item, i) => normalizeArticle(item, i)) : DEFAULT_POPULAR_ARTICLES);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load help content");
          setCategories(DEFAULT_CATEGORIES);
          setPopularArticles(DEFAULT_POPULAR_ARTICLES);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchContent();
    return () => { cancelled = true; };
  }, []);

  const filteredCategories = searchQuery.trim()
    ? categories.filter(
        (c) =>
          toText(c.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
          toText(c.description).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : categories;
  const filteredArticles = searchQuery.trim()
    ? popularArticles.filter((a) => toText(a.title).toLowerCase().includes(searchQuery.toLowerCase()))
    : popularArticles;

  const resourceCards = [
    {
      id: 1,
      title: "Documentation",
      icon: BookIcon,
      description: "Comprehensive guides and API references",
      buttonText: "View Documentation →"
    },
    {
      id: 2,
      title: "Video Tutorials",
      icon: VideoIcon,
      description: "Step-by-step video guides for all features",
      buttonText: "Watch Tutorials →"
    },
    {
      id: 3,
      title: "Community Forum",
      icon: EmployeesIcon,
      description: "Connect with other users and share tips",
      buttonText: "Join Community →"
    }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target)) {
        setIsDesktopDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen || isDesktopDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserDropdownOpen, isDesktopDropdownOpen]);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen" style={{ overflowX: 'hidden' }}>
        <Sidebar userRole={effectiveRole} activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogoutClick={() => setIsLogoutModalOpen(true)} />

        <main className="flex-1 flex flex-col bg-[#F5F7FA]" style={{ minWidth: 0, maxWidth: '100%', overflowX: 'hidden' }}>
          {/* Header */}
          <header className="bg-white px-[40px] py-[24px]" style={{ minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}>
            <div className="flex items-center justify-between mb-[16px]" style={{ minWidth: 0, maxWidth: '100%' }}>
              <div className="relative flex-shrink-0">
                <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  className="w-[280px] h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{ fontWeight: 400 }}
                />
              </div>

              <div className="flex items-center gap-[16px] flex-shrink-0">
                {/* Message Icon */}
                <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={MessageIcon} alt="Messages" className="w-[20px] h-[20px] object-contain" />
                </button>

                {/* Notification Bell */}
                <button className="relative w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={NotificationIcon} alt="Notifications" className="w-[20px] h-[20px] object-contain" />
                  <span className="absolute top-[4px] right-[4px] w-[8px] h-[8px] bg-red-500 rounded-full"></span>
                </button>

                {/* User Profile */}
                <div className="relative" ref={desktopDropdownRef}>
                  <div
                    className="flex items-center gap-[12px] cursor-pointer"
                    onClick={() => setIsDesktopDropdownOpen(!isDesktopDropdownOpen)}
                  >
                    <img
                      src={UserAvatar}
                      alt="User"
                      className="w-[44px] h-[44px] rounded-full object-cover border-2 border-[#E5E7EB]"
                    />
                    <div>
                      <div className="flex items-center gap-[6px]">
                        <p className="text-[16px] font-semibold text-[#333333]">Hi, {currentUser?.name || currentUser?.full_name || currentUser?.firstName || "User"}!</p>
                        <img
                          src={DropdownArrow}
                          alt=""
                          className={`w-[14px] h-[14px] object-contain transition-transform duration-200 mt-[2px] ${isDesktopDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <p className="text-[12px] font-normal text-[#6B7280]">{roleDisplayNames[effectiveRole]}</p>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {isDesktopDropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50"
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="px-[16px] py-[8px]">
                        <p className="text-[12px] text-[#6B7280]">elijlafiras@gmail.com</p>
                      </div>
                      <button className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors">
                        Edit Profile
                      </button>
                      <div className="h-[1px] bg-[#DC2626] my-[4px]"></div>
                      <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#DC2626] hover:bg-[#F5F7FA] transition-colors"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            <div>
              <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: '#B0B0B0' }}>More</span>
                <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
                <span style={{ color: '#8E8C8C' }}>Help Center</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
            {/* Page Header */}
            <div className="mb-[32px]" style={{ minWidth: 0, maxWidth: '100%' }}>
              <h1
                className="mb-[8px]"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '24px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#000000',
                  textAlign: 'left'
                }}
              >
                Help Center
              </h1>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#505050'
                }}
              >
                Find answers and learn how to use the platform
              </p>
            </div>

            {/* Browse by Category Section */}
            <div className="mb-[48px]">
              <div className="flex items-center justify-between mb-[24px]">
                <h2
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '20px',
                    color: '#000000',
                    lineHeight: '100%'
                  }}
                >
                  Browse by Category
                </h2>
                <div className="relative">
                  <svg className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for help..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[300px] h-[40px] pl-[40px] pr-[16px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#00564F] transition-colors"
                    style={{ fontWeight: 400 }}
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              {loading && (
                <div className="mb-6 flex items-center justify-center py-8">
                  <p className="text-sm text-[#6B7280]">Loading help content...</p>
                </div>
              )}

              {/* Category Cards Grid */}
              <div className="grid grid-cols-3 gap-[24px]">
                {!loading && filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-[12px] border border-[#E0E0E0] p-[24px] hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-[16px] mb-[16px]">
                      <div
                        className="w-[48px] h-[48px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#BCDEDC80' }}
                      >
                        <img src={category.icon} alt={String(category.title ?? '')} className="w-[24px] h-[24px] object-contain" />
                      </div>
                      <div className="flex-1">
                        <h3
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            fontSize: '16px',
                            lineHeight: '100%',
                            letterSpacing: '0%',
                            color: '#000000',
                            marginBottom: '8px'
                          }}
                        >
                          {String(category.title ?? '')}
                        </h3>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            lineHeight: '140%',
                            letterSpacing: '0%',
                            color: '#505050'
                          }}
                        >
                          {String(category.description ?? '')}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-[8px]" style={{ paddingLeft: '64px' }}>
                      {(Array.isArray(category.links) ? category.links : []).map((link, index) => {
                        const href = typeof link === 'object' && link !== null && link.path != null ? String(link.path) : '#';
                        const label = typeof link === 'object' && link !== null && link.title != null ? String(link.title) : (typeof link === 'string' ? link : '');
                        return (
                          <a
                            key={index}
                            href={href}
                            className="flex items-center text-[#00564F] hover:text-[#004D40] transition-colors"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 400,
                              fontSize: '14px',
                              lineHeight: '100%',
                              letterSpacing: '0%'
                            }}
                          >
                            <img
                              src={LeftArrowIcon}
                              alt="arrow"
                              className="w-[12px] h-[12px] object-contain flex-shrink-0"
                              style={{ transform: 'rotate(135deg)', marginRight: '8px', marginLeft: '-20px' }}
                            />
                            {label}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Articles Section */}
            <div className="mb-[48px]">
              <div className="bg-white rounded-[12px] border border-[#E0E0E0] p-[24px]">
                <h2
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '20px',
                    color: '#000000',
                    marginBottom: '16px',
                    lineHeight: '100%',
                    paddingBottom: '16px',
                    borderBottom: '1px solid #E0E0E0',
                    paddingLeft: '12px'
                  }}
                >
                  Popular Articles
                </h2>
                <div className="space-y-[16px]">
                  {!loading && filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between py-[12px] border-b border-[#F0F0F0] last:border-b-0 hover:bg-[#F9FAFB] rounded-[8px] px-[12px] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-[16px]">
                        <div
                          className="w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: '#BCDEDC80',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#00564FB2'
                          }}
                        >
                          {String(article.id ?? '')}
                        </div>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '14px',
                            lineHeight: '100%',
                            letterSpacing: '0%',
                            color: '#626262'
                          }}
                        >
                          {String(article.title ?? '')}
                        </p>
                      </div>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '100%',
                          letterSpacing: '0%',
                          color: '#626262'
                        }}
                      >
                        {String(article.views ?? '')} views
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resource Cards */}
            <div className="grid grid-cols-3 gap-[24px]">
              {resourceCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-[12px] border border-[#E0E0E0] p-[24px] hover:shadow-md transition-shadow flex flex-col items-center text-center"
                >
                  <div
                    className="w-[48px] h-[48px] rounded-[10px] flex items-center justify-center mb-[16px]"
                    style={{ backgroundColor: '#BCDEDC80' }}
                  >
                    <img src={card.icon} alt={card.title} className="w-[24px] h-[24px] object-contain" />
                  </div>
                  <h3
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      color: '#000000',
                      marginBottom: '8px'
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '12px',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      color: '#505050',
                      marginBottom: '16px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {card.description}
                  </p>
                  <button
                    className="text-[14px] text-[#00564F] font-medium hover:text-[#004D40] transition-colors flex items-center gap-[4px] justify-center"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '100%',
                      letterSpacing: '0%'
                    }}
                  >
                    {card.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen bg-[#F5F7FA]">
        {/* Mobile Header */}
        <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-[40px] h-[40px] flex items-center justify-center rounded-[8px] bg-[#004D40] hover:bg-[#003830] transition-colors"
            >
              <svg className="text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Message Icon */}
            <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center">
              <img src={MessageIcon} alt="Messages" className="w-[20px] h-[20px] object-contain" />
            </button>

            {/* Notification Bell */}
            <button className="relative w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center">
              <img src={NotificationIcon} alt="Notifications" className="w-[20px] h-[20px] object-contain" />
              <span className="absolute top-[4px] right-[4px] w-[8px] h-[8px] bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2"
              >
                <img
                  src={UserAvatar}
                  alt="User"
                  className="w-[36px] h-[36px] rounded-full object-cover border-2 border-[#E5E7EB]"
                />
                <img
                  src={DropdownArrow}
                  alt=""
                  className={`w-[12px] h-[12px] object-contain transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-[180px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-2 z-50">
                  <div className="px-4 py-2">
                    <p className="text-[12px] text-[#6B7280]">elijlafiras@gmail.com</p>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors">
                    Edit Profile
                  </button>
                  <div className="h-[1px] bg-[#DC2626] my-1"></div>
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="w-full px-4 py-2 text-left text-[14px] text-[#DC2626] hover:bg-[#F5F7FA] transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <Sidebar
            userRole={effectiveRole}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isMobile={true}
            onClose={() => setIsMobileMenuOpen(false)}
            onLogoutClick={() => setIsLogoutModalOpen(true)}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* Mobile Content */}
        <div className="flex-1 p-4 pb-10">
          {/* Page Header */}
          <div className="mb-6">
            <h1
              className="mb-2"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '100%',
                color: '#000000'
              }}
            >
              Help Center
            </h1>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '140%',
                color: '#505050'
              }}
            >
              Find answers and learn how to use the platform
            </p>
          </div>

          {/* Browse by Category Section */}
          <div className="mb-6">
            <div className="mb-4">
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '18px',
                  color: '#000000',
                  lineHeight: '100%',
                  marginBottom: '12px'
                }}
              >
                Browse by Category
              </h2>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[40px] pl-[40px] pr-4 rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#00564F] transition-colors"
                  style={{ fontWeight: 400 }}
                />
              </div>
            </div>

            {/* Category Cards - Mobile */}
            <div className="space-y-4">
              {!loading && filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-[12px] border border-[#E0E0E0] p-4"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#BCDEDC80' }}
                    >
                      <img src={category.icon} alt={String(category.title ?? '')} className="w-[20px] h-[20px] object-contain" />
                    </div>
                    <div className="flex-1">
                      <h3
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          lineHeight: '100%',
                          letterSpacing: '0%',
                          color: '#000000',
                          marginBottom: '6px'
                        }}
                      >
                        {String(category.title ?? '')}
                      </h3>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '11px',
                          lineHeight: '140%',
                          letterSpacing: '0%',
                          color: '#505050'
                        }}
                      >
                        {String(category.description ?? '')}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 pl-[52px]">
                    {(Array.isArray(category.links) ? category.links : []).map((link, index) => {
                      const href = typeof link === 'object' && link !== null && link.path != null ? String(link.path) : '#';
                      const label = typeof link === 'object' && link !== null && link.title != null ? String(link.title) : (typeof link === 'string' ? link : '');
                      return (
                        <a
                          key={index}
                          href={href}
                          className="flex items-center text-[#00564F] hover:text-[#004D40] transition-colors"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            lineHeight: '100%',
                            letterSpacing: '0%'
                          }}
                        >
                          <img
                            src={LeftArrowIcon}
                            alt="arrow"
                            className="w-[10px] h-[10px] object-contain flex-shrink-0 mr-2"
                            style={{ transform: 'rotate(135deg)' }}
                          />
                          {label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Articles Section - Mobile */}
          <div className="mb-6">
            <div className="bg-white rounded-[12px] border border-[#E0E0E0] p-4">
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '18px',
                  color: '#000000',
                  marginBottom: '12px',
                  lineHeight: '100%',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #E0E0E0'
                }}
              >
                Popular Articles
              </h2>
              <div className="space-y-3">
                {!loading && filteredArticles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between py-2 border-b border-[#F0F0F0] last:border-b-0"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-[28px] h-[28px] rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: '#BCDEDC80',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          fontSize: '12px',
                          color: '#00564FB2'
                        }}
                      >
                        {String(article.id ?? '')}
                      </div>
                      <p
                        className="flex-1"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          lineHeight: '140%',
                          letterSpacing: '0%',
                          color: '#626262'
                        }}
                      >
                        {String(article.title ?? '')}
                      </p>
                    </div>
                    <span
                      className="ml-2 flex-shrink-0"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '11px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        color: '#626262'
                      }}
                    >
                      {String(article.views ?? '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resource Cards - Mobile */}
          <div className="space-y-4">
            {resourceCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-[12px] border border-[#E0E0E0] p-4 flex flex-col items-center text-center"
              >
                <div
                  className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center mb-3"
                  style={{ backgroundColor: '#BCDEDC80' }}
                >
                  <img src={card.icon} alt={card.title} className="w-[20px] h-[20px] object-contain" />
                </div>
                <h3
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '100%',
                    letterSpacing: '0%',
                    color: '#000000',
                    marginBottom: '6px'
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '11px',
                    lineHeight: '140%',
                    letterSpacing: '0%',
                    color: '#505050',
                    marginBottom: '12px'
                  }}
                >
                  {card.description}
                </p>
                <button
                  className="text-[12px] text-[#00564F] font-medium hover:text-[#004D40] transition-colors flex items-center gap-1 justify-center"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '12px',
                    lineHeight: '100%',
                    letterSpacing: '0%'
                  }}
                >
                  {card.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          window.location.href = "/login";
        }}
      />
    </div>
  );
};


export default HelpCenterPage;

