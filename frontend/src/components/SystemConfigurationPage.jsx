import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Configuration icons
const TimeIcon = new URL("../images/icons/time.png", import.meta.url).href;
const SettingIcon = new URL("../images/icons/setteing.png", import.meta.url).href;
const PulseIcon = new URL("../images/icons/pulse.png", import.meta.url).href;
const LocationIcon = new URL("../images/icons/location (3).png", import.meta.url).href;
const DocumentIcon = new URL("../images/icons/document.png", import.meta.url).href;

import LogoutModal from "./LogoutModal";
// Logout icon for modal
// Logout icon for modal
// const LogoutIcon2 = new URL("../images/icons/logout2.png", import.meta.url).href;

const SystemConfigurationPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("8-2");
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceSettings, setAttendanceSettings] = useState({
    workStartTime: "08:00 AM",
    workEndTime: "04:00 PM",
    maxWorkingHours: "8",
    lateTolerance: "15",
    allowOvertime: true,
    autoSignOut: true,
    autoSignOutAfter: "10"
  });
  const [isLeaveRulesModalOpen, setIsLeaveRulesModalOpen] = useState(false);
  const [leaveRulesSettings, setLeaveRulesSettings] = useState({
    approvalFlow: "Manager - HR",
    annualLeaveLimit: "20",
    carryOverAllowed: true,
    autoSignOut: false,
    emergencyLeaveInstantApproval: false,
    documentRequiredAfter: "3"
  });
  const [isApprovalFlowDropdownOpen, setIsApprovalFlowDropdownOpen] = useState(false);
  const approvalFlowDropdownRef = useRef(null);
  const [isLocationGPSModalOpen, setIsLocationGPSModalOpen] = useState(false);
  const [locationGPSSettings, setLocationGPSSettings] = useState({
    geofenceRadius: "100",
    gpsAccuracyThreshold: "50",
    allowManualCheckIn: true,
    requireReasonForManualCheckIn: true
  });
  const [isActivityRulesModalOpen, setIsActivityRulesModalOpen] = useState(false);
  const [activityRulesSettings, setActivityRulesSettings] = useState({
    allowedActivityTypes: {
      fieldVisit: true,
      clientMeeting: true,
      siteInspection: true,
      delivery: true,
      installation: false,
      maintenance: false
    },
    requireApproval: true,
    requirePhotos: true,
    enableActivityReports: true
  });
  const [isGeneralSettingsModalOpen, setIsGeneralSettingsModalOpen] = useState(false);
  const [generalSettings, setGeneralSettings] = useState({
    timeZone: "Eastern Time (ET)",
    dateFormat: "mm/dd/yy",
    firstDayOfWeek: "Sunday",
    timeFormat: false, // false = 12-hour, true = 24-hour
    defaultLanguage: "English",
    currency: "USD - US Dollar $",
    numberFormat: "1,234.56 (US)",
    sessionTimeout: "30",
    autoLogout: true,
    rememberTrustedDevices: true,
    enforcePasswordPolicy: true,
    enableTwoFactor: false,
    maxLoginAttempts: "5",
    defaultDashboard: "Overview Dashboard",
    themeSelection: false // false = light, true = dark
  });
  const [isTimeZoneDropdownOpen, setIsTimeZoneDropdownOpen] = useState(false);
  const [isFirstDayDropdownOpen, setIsFirstDayDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isNumberFormatDropdownOpen, setIsNumberFormatDropdownOpen] = useState(false);
  const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const timeZoneDropdownRef = useRef(null);
  const firstDayDropdownRef = useRef(null);
  const languageDropdownRef = useRef(null);
  const currencyDropdownRef = useRef(null);
  const numberFormatDropdownRef = useRef(null);
  const dashboardDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const desktopDropdownRef = useRef(null);

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Configuration cards data
  const configurationCards = [
    {
      id: 1,
      icon: TimeIcon,
      title: "Attendance Settings",
      description: "Configure work hours, maximum hours per day, and overtime rules for employee",
      route: "/system/attendance-settings"
    },
    {
      id: 2,
      icon: DocumentIcon,
      title: "Leave Rules",
      description: "Set up leave approval workflows, annual leave limits, and leave type configurations",
      route: "/system/leave-rules"
    },
    {
      id: 3,
      icon: LocationIcon,
      title: "Location & GPS Settings",
      description: "Define geofencing boundaries, GPS tracking accuracy, and location-based check-in rules",
      route: "/system/location-gps-settings"
    },
    {
      id: 4,
      icon: PulseIcon,
      title: "Activity Management Rules",
      description: "Configure field activity types, reporting requirements, and activity approval workflows",
      route: "/system/activity-rules"
    },
    {
      id: 5,
      icon: SettingIcon,
      title: "General System Settings",
      description: "Manage time zones, date formats, currency settings, and system-wide preferences",
      route: "/system/general-settings"
    }
  ];

  // Recent configuration changes data
  const recentChanges = [
    {
      id: 1,
      title: "Work Hours Updated",
      author: "Hassan Ahmed",
      date: "Dec 20, 2024",
      time: "2:30 PM"
    },
    {
      id: 2,
      title: "Leave Approval Flow Modified",
      author: "Lama Jaber",
      date: "Dec 18, 2024",
      time: "11:15 AM"
    },
    {
      id: 3,
      title: "GPS Accuracy Changed",
      author: "Rami Khaled",
      date: "Dec 15, 2024",
      time: "4:45 PM"
    },
    {
      id: 4,
      title: "Activity Types Updated",
      author: "Sara Ali",
      date: "Dec 12, 2024",
      time: "9:20 AM"
    },
    {
      id: 5,
      title: "Time Zone Modified",
      author: "Omar Hassan",
      date: "Dec 10, 2024",
      time: "3:15 PM"
    }
  ];

  const handleConfigure = (route, cardId) => {
    if (cardId === 1) {
      // Open Attendance Settings modal
      setIsAttendanceModalOpen(true);
    } else if (cardId === 2) {
      // Open Leave Rules modal
      setIsLeaveRulesModalOpen(true);
    } else if (cardId === 3) {
      // Open Location & GPS Settings modal
      setIsLocationGPSModalOpen(true);
    } else if (cardId === 4) {
      // Open Activity Management Rules modal
      setIsActivityRulesModalOpen(true);
    } else if (cardId === 5) {
      // Open General System Settings modal
      setIsGeneralSettingsModalOpen(true);
    } else {
      // Navigate to other configuration pages
      console.log('Navigate to:', route);
      // navigate(route);
    }
  };

  const handleSaveAttendanceSettings = () => {
    // Save settings logic here
    console.log('Saving attendance settings:', attendanceSettings);
    setIsAttendanceModalOpen(false);
  };

  const handleSaveLeaveRulesSettings = () => {
    // Save settings logic here
    console.log('Saving leave rules settings:', leaveRulesSettings);
    setIsLeaveRulesModalOpen(false);
  };

  const handleSaveLocationGPSSettings = () => {
    // Save settings logic here
    console.log('Saving location GPS settings:', locationGPSSettings);
    setIsLocationGPSModalOpen(false);
  };

  const handleSaveActivityRulesSettings = () => {
    // Save settings logic here
    console.log('Saving activity rules settings:', activityRulesSettings);
    setIsActivityRulesModalOpen(false);
  };

  const handleSaveGeneralSettings = () => {
    // Save settings logic here
    console.log('Saving general settings:', generalSettings);
    setIsGeneralSettingsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsAttendanceModalOpen(false);
    setIsLeaveRulesModalOpen(false);
    setIsLocationGPSModalOpen(false);
    setIsActivityRulesModalOpen(false);
    setIsGeneralSettingsModalOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeZoneDropdownRef.current && !timeZoneDropdownRef.current.contains(event.target)) {
        setIsTimeZoneDropdownOpen(false);
      }
      if (firstDayDropdownRef.current && !firstDayDropdownRef.current.contains(event.target)) {
        setIsFirstDayDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setIsCurrencyDropdownOpen(false);
      }
      if (numberFormatDropdownRef.current && !numberFormatDropdownRef.current.contains(event.target)) {
        setIsNumberFormatDropdownOpen(false);
      }
      if (dashboardDropdownRef.current && !dashboardDropdownRef.current.contains(event.target)) {
        setIsDashboardDropdownOpen(false);
      }
    };

    if (isTimeZoneDropdownOpen || isFirstDayDropdownOpen || isLanguageDropdownOpen ||
      isCurrencyDropdownOpen || isNumberFormatDropdownOpen || isDashboardDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTimeZoneDropdownOpen, isFirstDayDropdownOpen, isLanguageDropdownOpen,
    isCurrencyDropdownOpen, isNumberFormatDropdownOpen, isDashboardDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (approvalFlowDropdownRef.current && !approvalFlowDropdownRef.current.contains(event.target)) {
        setIsApprovalFlowDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target)) {
        setIsDesktopDropdownOpen(false);
      }
    };

    if (isApprovalFlowDropdownOpen || isUserDropdownOpen || isDesktopDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isApprovalFlowDropdownOpen, isUserDropdownOpen, isDesktopDropdownOpen]);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen" style={{ overflowX: 'hidden' }}>
        <Sidebar
          userRole={userRole}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onLogoutClick={() => setIsLogoutModalOpen(true)}
        />

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
                <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={MessageIcon} alt="Messages" className="w-[20px] h-[20px] object-contain" />
                </button>
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
                        <p className="text-[16px] font-semibold text-[#333333]">Hi, Firas!</p>
                        <img
                          src={DropdownArrow}
                          alt=""
                          className={`w-[14px] h-[14px] object-contain transition-transform duration-200 mt-[2px] ${isDesktopDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <p className="text-[12px] font-normal text-[#6B7280]">{roleDisplayNames[userRole]}</p>
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
                <span style={{ color: '#8E8C8C' }}>System Configuration</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
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
                System Configuration
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
                Configure system-wide settings and rules for your organization
              </p>
            </div>

            {/* Configuration Cards Grid */}
            <div className="flex flex-wrap gap-[20px] mb-[32px]">
              {configurationCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-[10px] p-[20px] flex flex-col flex-shrink-0"
                  style={{
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #B5B1B1',
                    width: '323px',
                    height: '167px'
                  }}
                >
                  <div className="mb-[16px]">
                    <div className="flex items-center gap-[12px] mb-[8px]">
                      <div
                        className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#BCDEDC80' }}
                      >
                        <img
                          src={card.icon}
                          alt={card.title}
                          className="w-[24px] h-[24px] object-contain"
                        />
                      </div>
                      <h3
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '16px',
                          lineHeight: '100%',
                          color: '#000000'
                        }}
                      >
                        {card.title}
                      </h3>
                    </div>
                    <p
                      className="ml-[44px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '100%',
                        color: '#505050'
                      }}
                    >
                      {card.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleConfigure(card.route, card.id)}
                    className="mt-auto ml-[44px] px-[16px] py-[6px] rounded-[5px] border border-[#E0E0E0] bg-white hover:bg-[#F5F7FA] transition-colors"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      color: '#000000',
                      width: 'fit-content',
                      alignSelf: 'flex-start'
                    }}
                  >
                    Configure
                  </button>
                </div>
              ))}
            </div>

            {/* Recent Configuration Changes */}
            <div
              className="bg-white rounded-[5px] p-[20px]"
              style={{
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #B5B1B1',
                maxHeight: '369px',
                overflowY: 'auto'
              }}
            >
              <h2
                className="mb-[20px] pb-[12px] border-b border-[#E0E0E0]"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '20px',
                  lineHeight: '100%',
                  color: '#000000'
                }}
              >
                Recent Configuration Changes
              </h2>

              <div className="space-y-0">
                {recentChanges.map((change, index) => (
                  <div
                    key={change.id}
                    className={`py-[16px] ${index !== recentChanges.length - 1 ? 'border-b border-[#E0E0E0]' : ''}`}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-[4px]">
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '16px',
                            lineHeight: '100%',
                            color: '#000000'
                          }}
                        >
                          {change.title}
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '14px',
                            lineHeight: '100%',
                            color: '#000000'
                          }}
                        >
                          {change.date}
                        </p>
                      </div>
                      <div className="flex items-start justify-between">
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '14px',
                            lineHeight: '100%',
                            color: '#505050'
                          }}
                        >
                          by {change.author}
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '14px',
                            lineHeight: '100%',
                            color: '#5F5F5F'
                          }}
                        >
                          {change.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-[12px]">
            <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
              <img src={MessageIcon} alt="Messages" className="w-[18px] h-[18px] object-contain" />
            </button>

            <button className="relative w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
              <img src={NotificationIcon} alt="Notifications" className="w-[18px] h-[18px] object-contain" />
              <span className="absolute top-[4px] right-[4px] w-[6px] h-[6px] bg-red-500 rounded-full"></span>
            </button>

            {/* User Avatar with Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <div
                className="flex items-center gap-[6px] cursor-pointer"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
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
              </div>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50 overflow-hidden"
                  style={{ overflow: 'hidden', overflowY: 'hidden', overflowX: 'hidden', maxHeight: 'none' }}
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
        </header>

        {/* Mobile Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <Sidebar
            userRole={userRole}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isMobile={true}
            onClose={() => setIsMobileMenuOpen(false)}
            onLogoutClick={() => setIsLogoutModalOpen(true)}
          />
        </div>

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
                letterSpacing: '0%',
                color: '#000000',
                textAlign: 'left'
              }}
            >
              System Configuration
            </h1>
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
              Configure system-wide settings and rules for your organization
            </p>
          </div>

          {/* Configuration Cards Grid - Mobile */}
          <div className="flex flex-col gap-4 mb-6">
            {configurationCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-[10px] p-4 flex flex-col"
                style={{
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #B5B1B1'
                }}
              >
                <div className="mb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#BCDEDC80' }}
                    >
                      <img
                        src={card.icon}
                        alt={card.title}
                        className="w-[24px] h-[24px] object-contain"
                      />
                    </div>
                    <h3
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#000000'
                      }}
                    >
                      {card.title}
                    </h3>
                  </div>
                  <p
                    className="ml-[44px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '12px',
                      lineHeight: '140%',
                      color: '#505050'
                    }}
                  >
                    {card.description}
                  </p>
                </div>
                <button
                  onClick={() => handleConfigure(card.route, card.id)}
                  className="mt-auto ml-[44px] px-[16px] py-[6px] rounded-[5px] border border-[#E0E0E0] bg-white hover:bg-[#F5F7FA] transition-colors"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#000000',
                    width: 'fit-content',
                    alignSelf: 'flex-start'
                  }}
                >
                  Configure
                </button>
              </div>
            ))}
          </div>

          {/* Recent Configuration Changes - Mobile */}
          <div
            className="bg-white rounded-[5px] p-4"
            style={{
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #B5B1B1'
            }}
          >
            <h2
              className="mb-4 pb-3 border-b border-[#E0E0E0]"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '18px',
                lineHeight: '100%',
                color: '#000000'
              }}
            >
              Recent Configuration Changes
            </h2>

            <div className="space-y-0">
              {recentChanges.map((change, index) => (
                <div
                  key={change.id}
                  className={`py-3 ${index !== recentChanges.length - 1 ? 'border-b border-[#E0E0E0]' : ''}`}
                >
                  <div>
                    <div className="flex items-start justify-between mb-1">
                      <p
                        className="flex-1 pr-2"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '14px',
                          lineHeight: '140%',
                          color: '#000000'
                        }}
                      >
                        {change.title}
                      </p>
                      <p
                        className="text-right flex-shrink-0"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          lineHeight: '140%',
                          color: '#000000'
                        }}
                      >
                        {change.date}
                      </p>
                    </div>
                    <div className="flex items-start justify-between">
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          lineHeight: '140%',
                          color: '#505050'
                        }}
                      >
                        by {change.author}
                      </p>
                      <p
                        className="text-right flex-shrink-0 ml-2"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          lineHeight: '140%',
                          color: '#5F5F5F'
                        }}
                      >
                        {change.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Settings Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div
            className="bg-white rounded-[12px] w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-[24px] border-b border-[#E0E0E0]">
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '20px',
                  color: '#00564F'
                }}
              >
                Configure Attendance Settings
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-[32px] h-[32px] flex items-center justify-center hover:bg-[#F5F7FA] rounded-[8px] transition-colors"
              >
                <svg className="w-[20px] h-[20px] text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-[24px] space-y-[32px]">
              {/* Working Hours Section */}
              <div>
                <h3
                  className="mb-[20px]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '18px',
                    color: '#000000'
                  }}
                >
                  Working Hours
                </h3>
                <div className="space-y-[20px]">
                  {/* Work start time and Work End time - Side by side */}
                  <div className="grid grid-cols-2 gap-[16px]">
                    {/* Work start time */}
                    <div>
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#333333'
                        }}
                      >
                        Work start time
                      </label>
                      <input
                        type="text"
                        value={attendanceSettings.workStartTime}
                        onChange={(e) => setAttendanceSettings({ ...attendanceSettings, workStartTime: e.target.value })}
                        className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] focus:outline-none focus:border-[#00564F] transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                      />
                      <p
                        className="mt-[4px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#666666'
                        }}
                      >
                        Default start time for work shifts
                      </p>
                    </div>

                    {/* Work End time */}
                    <div>
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#333333'
                        }}
                      >
                        Work End time
                      </label>
                      <input
                        type="text"
                        value={attendanceSettings.workEndTime}
                        onChange={(e) => setAttendanceSettings({ ...attendanceSettings, workEndTime: e.target.value })}
                        className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] focus:outline-none focus:border-[#00564F] transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                      />
                      <p
                        className="mt-[4px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#666666'
                        }}
                      >
                        Default end time for work shifts
                      </p>
                    </div>
                  </div>

                  {/* Max Working Hours per Day */}
                  <div>
                    <label
                      className="block mb-[8px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#333333'
                      }}
                    >
                      Max Working Hours per Day
                    </label>
                    <input
                      type="number"
                      value={attendanceSettings.maxWorkingHours}
                      onChange={(e) => setAttendanceSettings({ ...attendanceSettings, maxWorkingHours: e.target.value })}
                      className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] focus:outline-none focus:border-[#00564F] transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                    />
                    <p
                      className="mt-[4px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#666666'
                      }}
                    >
                      Maximum allowed working hours in a single day
                    </p>
                  </div>
                </div>
              </div>

              {/* Attendance Rules Section */}
              <div>
                <div className="border-t border-[#E0E0E0] pt-[32px]">
                  <h3
                    className="mb-[20px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#000000'
                    }}
                  >
                    Attendance Rules
                  </h3>
                  <div className="space-y-[20px]">
                    {/* Late Tolerance */}
                    <div>
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#454545'
                        }}
                      >
                        Late Tolerance (minutes)
                      </label>
                      <input
                        type="number"
                        value={attendanceSettings.lateTolerance}
                        onChange={(e) => setAttendanceSettings({ ...attendanceSettings, lateTolerance: e.target.value })}
                        className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] focus:outline-none focus:border-[#00564F] transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                      />
                      <p
                        className="mt-[4px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#666666'
                        }}
                      >
                        Grace period before marking as late arrival
                      </p>
                    </div>

                    {/* Allow Overtime */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Allow Overtime
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Enable employees to log overtime hours
                        </p>
                      </div>
                      <button
                        onClick={() => setAttendanceSettings({ ...attendanceSettings, allowOvertime: !attendanceSettings.allowOvertime })}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${attendanceSettings.allowOvertime ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${attendanceSettings.allowOvertime ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* Auto Sign-Out */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Auto Sign-Out
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Automatically sign out employees after specified hours
                        </p>
                      </div>
                      <button
                        onClick={() => setAttendanceSettings({ ...attendanceSettings, autoSignOut: !attendanceSettings.autoSignOut })}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${attendanceSettings.autoSignOut ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${attendanceSettings.autoSignOut ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* Auto Sign-Out After */}
                    {attendanceSettings.autoSignOut && (
                      <div>
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#454545'
                          }}
                        >
                          Auto Sign-Out After (hours)
                        </label>
                        <input
                          type="number"
                          value={attendanceSettings.autoSignOutAfter}
                          onChange={(e) => setAttendanceSettings({ ...attendanceSettings, autoSignOutAfter: e.target.value })}
                          className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] focus:outline-none focus:border-[#00564F] transition-colors"
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                        />
                        <p
                          className="mt-[4px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Automatically sign out after this many hours
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center gap-[12px] p-[24px]">
              <button
                onClick={handleCloseModal}
                className="px-[40px] py-[8px] rounded-[8px] border border-[#E0E0E0] bg-white hover:bg-[#F5F7FA] transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#333333'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAttendanceSettings}
                className="px-[40px] py-[8px] rounded-[8px] bg-[#00564F] text-white hover:bg-[#004D40] transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Rules Modal */}
      {isLeaveRulesModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div
            className="bg-white rounded-[12px] w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-[24px] border-b border-[#E0E0E0]">
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '20px',
                  color: '#00564F'
                }}
              >
                Configure Leave Rules
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-[32px] h-[32px] flex items-center justify-center hover:bg-[#F5F7FA] rounded-[8px] transition-colors"
              >
                <svg className="w-[20px] h-[20px] text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-[24px] space-y-[32px]">
              {/* Approval Workflow Section */}
              <div>
                <h3
                  className="mb-[20px]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '18px',
                    color: '#000000'
                  }}
                >
                  Approval Workflow
                </h3>
                <div>
                  <label
                    className="block mb-[8px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#333333'
                    }}
                  >
                    Approval Flow
                  </label>
                  <div className="relative" ref={approvalFlowDropdownRef}>
                    <button
                      onClick={() => setIsApprovalFlowDropdownOpen(!isApprovalFlowDropdownOpen)}
                      className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] bg-white flex items-center justify-between hover:border-[#00564F] transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#333333' }}
                    >
                      <span>{leaveRulesSettings.approvalFlow}</span>
                      <svg className={`w-[16px] h-[16px] text-[#666666] transition-transform ${isApprovalFlowDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isApprovalFlowDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-10">
                        {["Manager - HR", "HR only", "Manager only", "Auto Approve (up to limit)"].map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setLeaveRulesSettings({ ...leaveRulesSettings, approvalFlow: option });
                              setIsApprovalFlowDropdownOpen(false);
                            }}
                            className="w-full px-[12px] py-[10px] text-left hover:bg-[#F5F7FA] transition-colors first:rounded-t-[8px] last:rounded-b-[8px]"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '14px',
                              color: '#333333'
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p
                    className="mt-[4px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#666666'
                    }}
                  >
                    Select the approval hierarchy for leave requests
                  </p>
                </div>
              </div>

              {/* Leave Limits Section */}
              <div>
                <div className="border-t border-[#E0E0E0] pt-[32px]">
                  <h3
                    className="mb-[20px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#000000'
                    }}
                  >
                    Leave Limits
                  </h3>
                  <div className="space-y-[20px]">
                    {/* Annual Leave Limit */}
                    <div>
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#333333'
                        }}
                      >
                        Annual Leave Limit (days)
                      </label>
                      <input
                        type="number"
                        value={leaveRulesSettings.annualLeaveLimit}
                        onChange={(e) => setLeaveRulesSettings({ ...leaveRulesSettings, annualLeaveLimit: e.target.value })}
                        className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] focus:outline-none focus:border-[#00564F] transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                      />
                      <p
                        className="mt-[4px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#666666'
                        }}
                      >
                        Maximum annual leave days per employee per year
                      </p>
                    </div>

                    {/* Carry-Over Allowed */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Carry-Over Allowed
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Allow unused leave days to carry over to next year
                        </p>
                      </div>
                      <button
                        onClick={() => setLeaveRulesSettings({ ...leaveRulesSettings, carryOverAllowed: !leaveRulesSettings.carryOverAllowed })}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${leaveRulesSettings.carryOverAllowed ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${leaveRulesSettings.carryOverAllowed ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* Auto Sign-Out */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Auto Sign-Out
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Automatically sign out employees after specified hours
                        </p>
                      </div>
                      <button
                        onClick={() => setLeaveRulesSettings({ ...leaveRulesSettings, autoSignOut: !leaveRulesSettings.autoSignOut })}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${leaveRulesSettings.autoSignOut ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${leaveRulesSettings.autoSignOut ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Leave Section */}
              <div>
                <div className="border-t border-[#E0E0E0] pt-[32px]">
                  <h3
                    className="mb-[20px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#000000'
                    }}
                  >
                    Emergency Leave
                  </h3>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#333333'
                        }}
                      >
                        Emergency Leave Instant Approval
                      </label>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#666666'
                        }}
                      >
                        Auto-approve emergency leave requests without workflow
                      </p>
                    </div>
                    <button
                      onClick={() => setLeaveRulesSettings({ ...leaveRulesSettings, emergencyLeaveInstantApproval: !leaveRulesSettings.emergencyLeaveInstantApproval })}
                      className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${leaveRulesSettings.emergencyLeaveInstantApproval ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                        }`}
                    >
                      <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${leaveRulesSettings.emergencyLeaveInstantApproval ? 'translate-x-[20px]' : 'translate-x-[2px]'
                        }`}></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Documentation Requirements Section */}
              <div>
                <div className="border-t border-[#E0E0E0] pt-[32px]">
                  <h3
                    className="mb-[20px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#000000'
                    }}
                  >
                    Documentation Requirements
                  </h3>
                  <div>
                    <label
                      className="block mb-[8px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#333333'
                      }}
                    >
                      Document Required After (days)
                    </label>
                    <input
                      type="number"
                      value={leaveRulesSettings.documentRequiredAfter}
                      onChange={(e) => setLeaveRulesSettings({ ...leaveRulesSettings, documentRequiredAfter: e.target.value })}
                      className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] focus:outline-none focus:border-[#00564F] transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                    />
                    <p
                      className="mt-[4px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#666666'
                      }}
                    >
                      Require supporting documents for leaves longer than this period
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center gap-[12px] p-[24px]">
              <button
                onClick={handleCloseModal}
                className="px-[40px] py-[8px] rounded-[8px] border border-[#E0E0E0] bg-white hover:bg-[#F5F7FA] transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#333333'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLeaveRulesSettings}
                className="px-[40px] py-[8px] rounded-[8px] bg-[#00564F] text-white hover:bg-[#004D40] transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location & GPS Settings Modal */}
      {isLocationGPSModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div
            className="bg-white rounded-[12px] w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-[24px] border-b border-[#E0E0E0]">
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '20px',
                  color: '#00564F'
                }}
              >
                Configure Location & GPS Settings
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-[32px] h-[32px] flex items-center justify-center hover:bg-[#F5F7FA] rounded-[8px] transition-colors"
              >
                <svg className="w-[20px] h-[20px] text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-[24px] space-y-[32px]">
              {/* Geofencing Section */}
              <div>
                <h3
                  className="mb-[20px]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '18px',
                    color: '#000000'
                  }}
                >
                  Geofencing
                </h3>
                <div>
                  <label
                    className="block mb-[8px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      color: '#333333'
                    }}
                  >
                    Geofence Radius (meters)
                  </label>
                  <input
                    type="number"
                    value={locationGPSSettings.geofenceRadius}
                    onChange={(e) => setLocationGPSSettings({ ...locationGPSSettings, geofenceRadius: e.target.value })}
                    className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] focus:outline-none focus:border-[#00564F] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                  />
                  <p
                    className="mt-[4px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#666666'
                    }}
                  >
                    Allowed distance from office location for check-in
                  </p>
                </div>
              </div>

              {/* GPS Accuracy Section */}
              <div>
                <div className="border-t border-[#E0E0E0] pt-[32px]">
                  <h3
                    className="mb-[20px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#000000'
                    }}
                  >
                    GPS Accuracy
                  </h3>
                  <div>
                    <label
                      className="block mb-[8px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#333333'
                      }}
                    >
                      GPS Accuracy Threshold (meters)
                    </label>
                    <input
                      type="number"
                      value={locationGPSSettings.gpsAccuracyThreshold}
                      onChange={(e) => setLocationGPSSettings({ ...locationGPSSettings, gpsAccuracyThreshold: e.target.value })}
                      className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] focus:outline-none focus:border-[#00564F] transition-colors"
                      style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                    />
                    <p
                      className="mt-[4px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#666666'
                      }}
                    >
                      Maximum acceptable GPS accuracy deviation
                    </p>
                  </div>
                </div>
              </div>

              {/* Manual Check-In Options Section */}
              <div>
                <div className="border-t border-[#E0E0E0] pt-[32px]">
                  <h3
                    className="mb-[20px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#000000'
                    }}
                  >
                    Manual Check-In Options
                  </h3>
                  <div className="space-y-[20px]">
                    {/* Allow Manual Check-In */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Allow Manual Check-In
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Enable employees to check in manually if GPS is unavailable
                        </p>
                      </div>
                      <button
                        onClick={() => setLocationGPSSettings({ ...locationGPSSettings, allowManualCheckIn: !locationGPSSettings.allowManualCheckIn })}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${locationGPSSettings.allowManualCheckIn ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${locationGPSSettings.allowManualCheckIn ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* Require Reason for Manual Check-In */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Require Reason for Manual Check-In
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Ask employees to provide a reason when checking in manually
                        </p>
                      </div>
                      <button
                        onClick={() => setLocationGPSSettings({ ...locationGPSSettings, requireReasonForManualCheckIn: !locationGPSSettings.requireReasonForManualCheckIn })}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${locationGPSSettings.requireReasonForManualCheckIn ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${locationGPSSettings.requireReasonForManualCheckIn ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Note */}
              <div
                className="p-[16px] rounded-[4px] border border-[#BDDDDB]"
                style={{
                  backgroundColor: '#BDDDDB'
                }}
              >
                <div className="flex items-start gap-[12px]">
                  <svg className="w-[20px] h-[20px] flex-shrink-0 mt-[2px]" viewBox="0 0 24 24" fill="none" style={{ color: '#00564F' }}>
                    <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <p
                      className="mb-[8px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#00564F'
                      }}
                    >
                      Security Note
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#08756C',
                        lineHeight: '140%'
                      }}
                    >
                      Location data is encrypted and used only for attendance verification. Employees are notified when location tracking is active.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center gap-[12px] p-[24px]">
              <button
                onClick={handleCloseModal}
                className="px-[40px] py-[8px] rounded-[8px] border border-[#E0E0E0] bg-white hover:bg-[#F5F7FA] transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#333333'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLocationGPSSettings}
                className="px-[40px] py-[8px] rounded-[8px] bg-[#00564F] text-white hover:bg-[#004D40] transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Management Rules Modal */}
      {isActivityRulesModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div
            className="bg-white rounded-[12px] w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-[24px] border-b border-[#E0E0E0]">
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '20px',
                  color: '#00564F'
                }}
              >
                Configure Activity Management Rules
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-[32px] h-[32px] flex items-center justify-center hover:bg-[#F5F7FA] rounded-[8px] transition-colors"
              >
                <svg className="w-[20px] h-[20px] text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-[24px] space-y-[32px]">
              {/* Allowed Activity Types Section */}
              <div>
                <h3
                  className="mb-[8px]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '18px',
                    color: '#000000'
                  }}
                >
                  Allowed Activity Types
                </h3>
                <p
                  className="mb-[20px]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#666666'
                  }}
                >
                  Select which activity types are available for employees to log.
                </p>
                <div className="space-y-[16px]">
                  {[
                    { key: 'fieldVisit', label: 'Field Visit', description: 'General field visits to locations.' },
                    { key: 'clientMeeting', label: 'Client Meeting', description: 'In-person client meetings.' },
                    { key: 'siteInspection', label: 'Site Inspection', description: 'Property or site inspections.' },
                    { key: 'delivery', label: 'Delivery', description: 'Product or document deliveries.' },
                    { key: 'installation', label: 'Installation', description: 'Equipment or system installations.' },
                    { key: 'maintenance', label: 'Maintenance', description: 'Routine maintenance activities.' }
                  ].map((activity) => (
                    <div
                      key={activity.key}
                      className="flex items-start gap-[12px] p-[12px] rounded-[8px]"
                      style={{ backgroundColor: '#F9F9F9' }}
                    >
                      <button
                        onClick={() => {
                          setActivityRulesSettings({
                            ...activityRulesSettings,
                            allowedActivityTypes: {
                              ...activityRulesSettings.allowedActivityTypes,
                              [activity.key]: !activityRulesSettings.allowedActivityTypes[activity.key]
                            }
                          });
                        }}
                        className="mt-[2px] w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors"
                        style={{
                          borderColor: activityRulesSettings.allowedActivityTypes[activity.key] ? '#4A4A4A' : '#E0E0E0',
                          backgroundColor: activityRulesSettings.allowedActivityTypes[activity.key] ? '#4A4A4A' : 'transparent'
                        }}
                      >
                        {activityRulesSettings.allowedActivityTypes[activity.key] && (
                          <svg className="w-[12px] h-[12px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1">
                        <label
                          className="block mb-[4px] cursor-pointer"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          {activity.label}
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Rules Section */}
              <div>
                <div className="border-t border-[#E0E0E0] pt-[32px]">
                  <h3
                    className="mb-[20px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#000000'
                    }}
                  >
                    Activity Rules
                  </h3>
                  <div className="space-y-[20px]">
                    {/* Require Approval Before Activity */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Require Approval Before Activity
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Activities must be approved by manager before employee can start
                        </p>
                      </div>
                      <button
                        onClick={() => setActivityRulesSettings({ ...activityRulesSettings, requireApproval: !activityRulesSettings.requireApproval })}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${activityRulesSettings.requireApproval ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${activityRulesSettings.requireApproval ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* Require Photos on Completion */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Require Photos on Completion
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Employees must upload photos when marking activity as complete
                        </p>
                      </div>
                      <button
                        onClick={() => setActivityRulesSettings({ ...activityRulesSettings, requirePhotos: !activityRulesSettings.requirePhotos })}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${activityRulesSettings.requirePhotos ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${activityRulesSettings.requirePhotos ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* Enable Activity Reports */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Enable Activity Reports
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Allow employees to generate detailed activity reports
                        </p>
                      </div>
                      <button
                        onClick={() => setActivityRulesSettings({ ...activityRulesSettings, enableActivityReports: !activityRulesSettings.enableActivityReports })}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${activityRulesSettings.enableActivityReports ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${activityRulesSettings.enableActivityReports ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div
                className="p-[16px] rounded-[4px]"
                style={{
                  backgroundColor: '#BDDDDB',
                  border: '1px solid #BDDDDB'
                }}
              >
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '12px',
                    color: '#08756C',
                    lineHeight: '140%'
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Note:</span> Changes to activity rules will apply to all new activities. Existing activities will retain their original configuration.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center gap-[12px] p-[24px]">
              <button
                onClick={handleCloseModal}
                className="px-[40px] py-[8px] rounded-[8px] border border-[#E0E0E0] bg-white hover:bg-[#F5F7FA] transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#333333'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveActivityRulesSettings}
                className="px-[40px] py-[8px] rounded-[8px] bg-[#00564F] text-white hover:bg-[#004D40] transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General System Settings Modal */}
      {isGeneralSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={handleCloseModal}>
          <div
            className="bg-white rounded-[12px] w-[90%] max-w-[600px] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-[24px] border-b border-[#E0E0E0]">
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '20px',
                  color: '#00564F'
                }}
              >
                Configure General System Settings
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-[32px] h-[32px] flex items-center justify-center hover:bg-[#F5F7FA] rounded-[8px] transition-colors"
              >
                <svg className="w-[20px] h-[20px] text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-[24px] space-y-[32px]">
              {/* Localization & Time Section */}
              <div>
                <h3
                  className="mb-[20px]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '18px',
                    color: '#000000'
                  }}
                >
                  Localization & Time
                </h3>
                <div className="space-y-[20px]">
                  {/* Time Zone */}
                  <div>
                    <label
                      className="block mb-[8px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#333333'
                      }}
                    >
                      Time Zone
                    </label>
                    <div className="relative" ref={timeZoneDropdownRef}>
                      <button
                        onClick={() => setIsTimeZoneDropdownOpen(!isTimeZoneDropdownOpen)}
                        className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] bg-white flex items-center justify-between hover:border-[#00564F] transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#333333' }}
                      >
                        <span>{generalSettings.timeZone}</span>
                        <svg className={`w-[16px] h-[16px] text-[#666666] transition-transform ${isTimeZoneDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isTimeZoneDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-10">
                          {["Eastern Time (ET)", "Central Time (CT)", "Mountain Time (MT)", "Pacific Time (PT)", "UTC"].map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                setGeneralSettings({ ...generalSettings, timeZone: option });
                                setIsTimeZoneDropdownOpen(false);
                              }}
                              className="w-full px-[12px] py-[10px] text-left hover:bg-[#F5F7FA] transition-colors first:rounded-t-[8px] last:rounded-b-[8px]"
                              style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                color: '#333333'
                              }}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p
                      className="mt-[4px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#666666'
                      }}
                    >
                      Default time zone for all system timestamps
                    </p>
                  </div>

                  {/* Date Format and First Day of Week - Side by side */}
                  <div className="grid grid-cols-2 gap-[16px]">
                    {/* Date Format */}
                    <div>
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#333333'
                        }}
                      >
                        Date Format
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={generalSettings.dateFormat}
                          onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                          className="w-full h-[40px] px-[12px] pr-[36px] rounded-[8px] border border-[#E0E0E0] focus:outline-none focus:border-[#00564F] transition-colors"
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            const input = e.target.closest('.relative').querySelector('input[type="date"]');
                            if (input && input.showPicker) {
                              input.showPicker();
                            } else {
                              input.click();
                            }
                          }}
                          className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity z-10"
                        >
                          <svg className="w-[16px] h-[16px] text-[#939393]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <style>{`
                          input[type="date"]::-webkit-calendar-picker-indicator {
                            display: none;
                            -webkit-appearance: none;
                          }
                          input[type="date"]::-webkit-inner-spin-button,
                          input[type="date"]::-webkit-clear-button {
                            display: none;
                            -webkit-appearance: none;
                          }
                        `}</style>
                      </div>
                      <p
                        className="mt-[4px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#666666'
                        }}
                      >
                        Example: 12/31/2024
                      </p>
                    </div>

                    {/* First Day of Week */}
                    <div>
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#333333'
                        }}
                      >
                        First Day of Week
                      </label>
                      <div className="relative" ref={firstDayDropdownRef}>
                        <button
                          onClick={() => setIsFirstDayDropdownOpen(!isFirstDayDropdownOpen)}
                          className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] bg-white flex items-center justify-between hover:border-[#00564F] transition-colors"
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#333333' }}
                        >
                          <span>{generalSettings.firstDayOfWeek}</span>
                          <svg className={`w-[16px] h-[16px] text-[#666666] transition-transform ${isFirstDayDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isFirstDayDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-10">
                            {["Sunday", "Monday", "Saturday"].map((option) => (
                              <button
                                key={option}
                                onClick={() => {
                                  setGeneralSettings({ ...generalSettings, firstDayOfWeek: option });
                                  setIsFirstDayDropdownOpen(false);
                                }}
                                className="w-full px-[12px] py-[10px] text-left hover:bg-[#F5F7FA] transition-colors first:rounded-t-[8px] last:rounded-b-[8px]"
                                style={{
                                  fontFamily: 'Inter, sans-serif',
                                  fontSize: '14px',
                                  color: '#333333'
                                }}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p
                        className="mt-[4px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#666666'
                        }}
                      >
                        Used in calendars and reports
                      </p>
                    </div>
                  </div>

                  {/* Time Format */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#333333'
                        }}
                      >
                        Time Format
                      </label>
                      <p
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#666666'
                        }}
                      >
                        12-hour format (e.g., 2:30 PM)
                      </p>
                    </div>
                    <button
                      onClick={() => setGeneralSettings({ ...generalSettings, timeFormat: !generalSettings.timeFormat })}
                      className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${!generalSettings.timeFormat ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                        }`}
                    >
                      <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${!generalSettings.timeFormat ? 'translate-x-[20px]' : 'translate-x-[2px]'
                        }`}></div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Language & Region Section */}
              <div>
                <div className="border-t border-[#E0E0E0] pt-[32px]">
                  <h3
                    className="mb-[20px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#000000'
                    }}
                  >
                    Language & Region
                  </h3>
                  <div className="space-y-[20px]">
                    {/* Default System Language and Currency - Side by side */}
                    <div className="grid grid-cols-2 gap-[16px]">
                      {/* Default System Language */}
                      <div>
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Default System Language
                        </label>
                        <div className="relative" ref={languageDropdownRef}>
                          <button
                            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                            className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] bg-white flex items-center justify-between hover:border-[#00564F] transition-colors"
                            style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#333333' }}
                          >
                            <span>{generalSettings.defaultLanguage}</span>
                            <svg className={`w-[16px] h-[16px] text-[#666666] transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {isLanguageDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-10">
                              {["English", "Arabic", "French", "Spanish"].map((option) => (
                                <button
                                  key={option}
                                  onClick={() => {
                                    setGeneralSettings({ ...generalSettings, defaultLanguage: option });
                                    setIsLanguageDropdownOpen(false);
                                  }}
                                  className="w-full px-[12px] py-[10px] text-left hover:bg-[#F5F7FA] transition-colors first:rounded-t-[8px] last:rounded-b-[8px]"
                                  style={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '14px',
                                    color: '#333333'
                                  }}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <p
                          className="mt-[4px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Primary language for system interface
                        </p>
                      </div>

                      {/* Currency */}
                      <div>
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Currency
                        </label>
                        <div className="relative" ref={currencyDropdownRef}>
                          <button
                            onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                            className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] bg-white flex items-center justify-between hover:border-[#00564F] transition-colors"
                            style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#333333' }}
                          >
                            <span>{generalSettings.currency}</span>
                            <svg className={`w-[16px] h-[16px] text-[#666666] transition-transform ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {isCurrencyDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-10">
                              {["USD - US Dollar $", "EUR - Euro €", "GBP - British Pound £", "JPY - Japanese Yen ¥"].map((option) => (
                                <button
                                  key={option}
                                  onClick={() => {
                                    setGeneralSettings({ ...generalSettings, currency: option });
                                    setIsCurrencyDropdownOpen(false);
                                  }}
                                  className="w-full px-[12px] py-[10px] text-left hover:bg-[#F5F7FA] transition-colors first:rounded-t-[8px] last:rounded-b-[8px]"
                                  style={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '14px',
                                    color: '#333333'
                                  }}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <p
                          className="mt-[4px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Default currency for financial data
                        </p>
                      </div>
                    </div>

                    {/* Number Format */}
                    <div>
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#333333'
                        }}
                      >
                        Number Format
                      </label>
                      <div className="relative" ref={numberFormatDropdownRef}>
                        <button
                          onClick={() => setIsNumberFormatDropdownOpen(!isNumberFormatDropdownOpen)}
                          className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] bg-white flex items-center justify-between hover:border-[#00564F] transition-colors"
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#333333' }}
                        >
                          <span>{generalSettings.numberFormat}</span>
                          <svg className={`w-[16px] h-[16px] text-[#666666] transition-transform ${isNumberFormatDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isNumberFormatDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-10">
                            {["1,234.56 (US)", "1,234.56 (Europe)", "1,234.56 (French)"].map((option) => (
                              <button
                                key={option}
                                onClick={() => {
                                  setGeneralSettings({ ...generalSettings, numberFormat: option });
                                  setIsNumberFormatDropdownOpen(false);
                                }}
                                className="w-full px-[12px] py-[10px] text-left hover:bg-[#F5F7FA] transition-colors first:rounded-t-[8px] last:rounded-b-[8px]"
                                style={{
                                  fontFamily: 'Inter, sans-serif',
                                  fontSize: '14px',
                                  color: '#333333'
                                }}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p
                        className="mt-[4px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#666666'
                        }}
                      >
                        Format for displaying numbers and decimals
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Behavior Section */}
              <div>
                <div className="border-t border-[#E0E0E0] pt-[32px]">
                  <h3
                    className="mb-[20px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#000000'
                    }}
                  >
                    System Behavior
                  </h3>
                  <div className="space-y-[20px]">
                    {/* Session Timeout Duration */}
                    <div>
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#333333'
                        }}
                      >
                        Session Timeout Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={generalSettings.sessionTimeout}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, sessionTimeout: e.target.value })}
                        className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] focus:outline-none focus:border-[#00564F] transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                      />
                      <p
                        className="mt-[4px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#666666'
                        }}
                      >
                        User sessions will expire after this period (5-480 minutes)
                      </p>
                    </div>

                    {/* Auto Logout on Inactivity */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Auto Logout on Inactivity
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Automatically log out users after session timeout period
                        </p>
                      </div>
                      <button
                        onClick={() => setGeneralSettings({ ...generalSettings, autoLogout: !generalSettings.autoLogout })}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${generalSettings.autoLogout ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${generalSettings.autoLogout ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* Remember Trusted Devices */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Remember Trusted Devices
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Allow users to mark devices as trusted for faster login
                        </p>
                      </div>
                      <button
                        onClick={() => setGeneralSettings({ ...generalSettings, rememberTrustedDevices: !generalSettings.rememberTrustedDevices })}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${generalSettings.rememberTrustedDevices ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${generalSettings.rememberTrustedDevices ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div>
                <div className="border-t border-[#E0E0E0] pt-[32px]">
                  <h3
                    className="mb-[20px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#000000'
                    }}
                  >
                    Security
                  </h3>
                  <div className="space-y-[20px]">
                    {/* Enforce Password Policy */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Enforce Password Policy
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Require strong passwords with minimum length and complexity
                        </p>
                      </div>
                      <button
                        onClick={() => setGeneralSettings({ ...generalSettings, enforcePasswordPolicy: !generalSettings.enforcePasswordPolicy })}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${generalSettings.enforcePasswordPolicy ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${generalSettings.enforcePasswordPolicy ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* Enable Two-Factor Authentication */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Enable Two-Factor Authentication
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Require 2FA for all user accounts for enhanced security
                        </p>
                      </div>
                      <button
                        onClick={() => setGeneralSettings({ ...generalSettings, enableTwoFactor: !generalSettings.enableTwoFactor })}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${generalSettings.enableTwoFactor ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${generalSettings.enableTwoFactor ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* Maximum Login Attempts */}
                    <div>
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#333333'
                        }}
                      >
                        Maximum Login Attempts
                      </label>
                      <input
                        type="number"
                        value={generalSettings.maxLoginAttempts}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, maxLoginAttempts: e.target.value })}
                        className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] focus:outline-none focus:border-[#00564F] transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px' }}
                      />
                      <p
                        className="mt-[4px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#666666'
                        }}
                      >
                        Account will be locked after this many failed login attempts (3-10)
                      </p>
                    </div>

                    {/* Password Requirements Note */}
                    {generalSettings.enforcePasswordPolicy && (
                      <div
                        className="p-[16px] rounded-[4px]"
                        style={{
                          backgroundColor: '#BDDDDB',
                          border: '1px solid #BDDDDB'
                        }}
                      >
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#08756C',
                            lineHeight: '140%'
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>Password Requirements:</span> Minimum 8 characters, at least one uppercase, one lowercase, one number, and one special character.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* UI Preferences Section */}
              <div>
                <div className="border-t border-[#E0E0E0] pt-[32px]">
                  <h3
                    className="mb-[20px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#000000'
                    }}
                  >
                    UI Preferences
                  </h3>
                  <div className="space-y-[20px]">
                    {/* Default Dashboard */}
                    <div>
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#333333'
                        }}
                      >
                        Default Dashboard
                      </label>
                      <div className="relative" ref={dashboardDropdownRef}>
                        <button
                          onClick={() => setIsDashboardDropdownOpen(!isDashboardDropdownOpen)}
                          className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#E0E0E0] bg-white flex items-center justify-between hover:border-[#00564F] transition-colors"
                          style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#333333' }}
                        >
                          <span>{generalSettings.defaultDashboard}</span>
                          <svg className={`w-[16px] h-[16px] text-[#666666] transition-transform ${isDashboardDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isDashboardDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-10">
                            {["Overview Dashboard", "Attendance Dashboard", "Activities Dashboard", "Reports Dashboard"].map((option) => (
                              <button
                                key={option}
                                onClick={() => {
                                  setGeneralSettings({ ...generalSettings, defaultDashboard: option });
                                  setIsDashboardDropdownOpen(false);
                                }}
                                className="w-full px-[12px] py-[10px] text-left hover:bg-[#F5F7FA] transition-colors first:rounded-t-[8px] last:rounded-b-[8px]"
                                style={{
                                  fontFamily: 'Inter, sans-serif',
                                  fontSize: '14px',
                                  color: '#333333'
                                }}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p
                        className="mt-[4px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          fontSize: '12px',
                          color: '#666666'
                        }}
                      >
                        Landing page after login for all users
                      </p>
                    </div>

                    {/* Theme Selection */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <label
                          className="block mb-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            color: '#333333'
                          }}
                        >
                          Theme Selection
                        </label>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666'
                          }}
                        >
                          Light theme enabled
                        </p>
                      </div>
                      <button
                        onClick={() => setGeneralSettings({ ...generalSettings, themeSelection: !generalSettings.themeSelection })}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center ${!generalSettings.themeSelection ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${!generalSettings.themeSelection ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center gap-[12px] p-[24px]">
              <button
                onClick={handleCloseModal}
                className="px-[40px] py-[8px] rounded-[8px] border border-[#E0E0E0] bg-white hover:bg-[#F5F7FA] transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#333333'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGeneralSettings}
                className="px-[40px] py-[8px] rounded-[8px] bg-[#00564F] text-white hover:bg-[#004D40] transition-colors"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

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


export default SystemConfigurationPage;

