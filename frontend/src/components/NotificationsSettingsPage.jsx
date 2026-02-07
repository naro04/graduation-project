import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getEffectiveRole, getCurrentUser } from "../services/auth.js";
import { getNotificationSettings, updateNotificationSettings } from "../services/notifications";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Notification icon
const NotificationsIcon = new URL("../images/icons/Notifications.png", import.meta.url).href;

import LogoutModal from "./LogoutModal";
// Logout icon for modal
// const LogoutIcon2 = new URL("../images/icons/logout2.png", import.meta.url).href;

const roleDisplayNames = {
  superAdmin: "Super Admin",
  hr: "HR Admin",
  manager: "Manager",
  fieldEmployee: "Field Employee",
  officer: "Officer"
};

const NotificationsSettingsPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [activeMenu, setActiveMenu] = useState("8-3");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const desktopDropdownRef = useRef(null);

  // API state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Attendance Notifications State
  const [attendanceNotifications, setAttendanceNotifications] = useState({
    checkInOut: { email: true, inApp: true },
    lateArrival: { email: true, inApp: true },
    earlyDeparture: { email: false, inApp: true }
  });

  // Leave Notifications State
  const [leaveNotifications, setLeaveNotifications] = useState({
    newLeaveRequest: { email: true, inApp: true },
    requestApproved: { email: true, inApp: true },
    requestRejected: { email: true, inApp: true }
  });

  // Activity Notifications State
  const [activityNotifications, setActivityNotifications] = useState({
    newActivityAssigned: { email: true, inApp: true },
    activityCompleted: { email: false, inApp: true },
    activityOverdue: { email: true, inApp: true }
  });

  const handleToggle = (category, notificationType, notificationMethod) => {
    if (category === 'attendance') {
      setAttendanceNotifications(prev => ({
        ...prev,
        [notificationType]: {
          ...prev[notificationType],
          [notificationMethod]: !prev[notificationType][notificationMethod]
        }
      }));
    } else if (category === 'leave') {
      setLeaveNotifications(prev => ({
        ...prev,
        [notificationType]: {
          ...prev[notificationType],
          [notificationMethod]: !prev[notificationType][notificationMethod]
        }
      }));
    } else if (category === 'activity') {
      setActivityNotifications(prev => ({
        ...prev,
        [notificationType]: {
          ...prev[notificationType],
          [notificationMethod]: !prev[notificationType][notificationMethod]
        }
      }));
    }
  };

  // Transform API data to component state (قراءة كل الإعدادات من الـ API بعد الـ reload)
  const transformApiToState = (apiSettings) => {
    const s = apiSettings || {};
    return {
      attendanceNotifications: {
        checkInOut: {
          email: s.attendance_check_in_out_email ?? true,
          inApp: s.attendance_check_in_out_in_app ?? true
        },
        lateArrival: {
          email: s.attendance_late_arrival_email ?? true,
          inApp: s.attendance_late_arrival_in_app ?? true
        },
        earlyDeparture: {
          email: s.attendance_early_departure_email ?? false,
          inApp: s.attendance_early_departure_in_app ?? true
        }
      },
      leaveNotifications: {
        newLeaveRequest: {
          email: s.leave_new_request_email ?? true,
          inApp: s.leave_new_request_in_app ?? true
        },
        requestApproved: {
          email: s.leave_request_approved_email ?? true,
          inApp: s.leave_request_approved_in_app ?? true
        },
        requestRejected: {
          email: s.leave_request_rejected_email ?? true,
          inApp: s.leave_request_rejected_in_app ?? true
        }
      },
      activityNotifications: {
        newActivityAssigned: {
          email: s.activity_new_assigned_email ?? true,
          inApp: s.activity_new_assigned_in_app ?? true
        },
        activityCompleted: {
          email: s.activity_completed_email ?? false,
          inApp: s.activity_completed_in_app ?? true
        },
        activityOverdue: {
          email: s.activity_overdue_email ?? true,
          inApp: s.activity_overdue_in_app ?? true
        }
      }
    };
  };

  // Transform component state to API format (إرسال كل الإعدادات حتى تُحفظ وتظهر بعد الـ reload)
  const transformStateToApi = (state) => {
    const a = state.attendanceNotifications || {};
    const l = state.leaveNotifications || {};
    const act = state.activityNotifications || {};
    return {
      attendance_check_in_out_email: a.checkInOut?.email ?? true,
      attendance_check_in_out_in_app: a.checkInOut?.inApp ?? true,
      attendance_late_arrival_email: a.lateArrival?.email ?? true,
      attendance_late_arrival_in_app: a.lateArrival?.inApp ?? true,
      attendance_early_departure_email: a.earlyDeparture?.email ?? false,
      attendance_early_departure_in_app: a.earlyDeparture?.inApp ?? true,
      leave_new_request_email: l.newLeaveRequest?.email ?? true,
      leave_new_request_in_app: l.newLeaveRequest?.inApp ?? true,
      leave_request_approved_email: l.requestApproved?.email ?? true,
      leave_request_approved_in_app: l.requestApproved?.inApp ?? true,
      leave_request_rejected_email: l.requestRejected?.email ?? true,
      leave_request_rejected_in_app: l.requestRejected?.inApp ?? true,
      activity_new_assigned_email: act.newActivityAssigned?.email ?? true,
      activity_new_assigned_in_app: act.newActivityAssigned?.inApp ?? true,
      activity_completed_email: act.activityCompleted?.email ?? false,
      activity_completed_in_app: act.activityCompleted?.inApp ?? true,
      activity_overdue_email: act.activityOverdue?.email ?? true,
      activity_overdue_in_app: act.activityOverdue?.inApp ?? true
    };
  };

  // Fetch notification settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getNotificationSettings();
        const transformedState = transformApiToState(response);
        setAttendanceNotifications(transformedState.attendanceNotifications);
        setLeaveNotifications(transformedState.leaveNotifications);
        setActivityNotifications(transformedState.activityNotifications);
      } catch (err) {
        console.error('Failed to fetch notification settings:', err);
        setError(err.response?.data?.message ?? err.message ?? 'Failed to load notification settings. Using defaults.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSaveSuccess(false);

      const apiPayload = transformStateToApi({
        attendanceNotifications,
        leaveNotifications,
        activityNotifications
      });

      await updateNotificationSettings(apiPayload);

      setSaveSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save notification settings:', err);
      setError(err.response?.data?.message ?? err.message ?? 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    // Reset to default values
    setAttendanceNotifications({
      checkInOut: { email: true, inApp: true },
      lateArrival: { email: true, inApp: true },
      earlyDeparture: { email: false, inApp: true }
    });
    setLeaveNotifications({
      newLeaveRequest: { email: true, inApp: true },
      requestApproved: { email: true, inApp: true },
      requestRejected: { email: true, inApp: true }
    });
    setActivityNotifications({
      newActivityAssigned: { email: true, inApp: true },
      activityCompleted: { email: false, inApp: true },
      activityOverdue: { email: true, inApp: true }
    });
  };

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

  const NotificationCard = ({ title, description, icon, notifications, category }) => {
    return (
      <div 
        className="bg-white rounded-[12px] p-[24px] mb-[24px] border" 
        style={{ 
          borderColor: '#B3B3B3',
          overflow: 'visible',
          overflowY: 'visible',
          overflowX: 'visible',
          maxHeight: 'none',
          height: 'auto'
        }}
      >
        {/* Card Header */}
        <div className="flex items-start gap-[12px] mb-[24px]">
          <div 
            className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#BCDEDC80' }}
          >
            <img src={icon} alt={title} className="w-[20px] h-[20px] object-contain" />
          </div>
          <div className="flex-1">
            <h3 
              style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: 600, 
                fontSize: '18px', 
                color: '#000000',
                marginBottom: '4px'
              }}
            >
              {title}
            </h3>
            <p 
              style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: 400, 
                fontSize: '14px', 
                color: '#666666'
              }}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Separator Line */}
        <div className="border-b border-[#E0E0E0] mb-[24px]"></div>

        {/* Notification Settings Grid */}
        <div className="grid grid-cols-2 gap-[32px]">
          {/* Email Notifications Column */}
          <div style={{ paddingLeft: '44px' }}>
            <h4 
              className="mb-[16px]"
              style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: 500, 
                fontSize: '14px', 
                color: '#5F6766'
              }}
            >
              Email Notifications
            </h4>
            <div className="space-y-[20px]">
              {notifications.map((notification) => (
                <div key={notification.key} className="flex items-start justify-between">
                  <div className="flex-1">
                    <label 
                      className="block mb-[4px]"
                      style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        fontWeight: 600, 
                        fontSize: '14px', 
                        color: '#333333'
                      }}
                    >
                      {notification.label}
                    </label>
                    <p 
                      style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        fontWeight: 400, 
                        fontSize: '12px', 
                        color: '#666666'
                      }}
                    >
                      {notification.emailDescription}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(category, notification.key, 'email')}
                    className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center flex-shrink-0 ml-[16px] ${notification.emailValue ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                    }`}
                  >
                    <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${notification.emailValue ? 'translate-x-[20px]' : 'translate-x-[2px]'
                    }`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* In-App Notifications Column */}
          <div style={{ paddingLeft: '44px' }}>
            <h4 
              className="mb-[16px]"
              style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: 500, 
                fontSize: '14px', 
                color: '#5F6766'
              }}
            >
              In-App Notifications
            </h4>
            <div className="space-y-[20px]">
              {notifications.map((notification) => (
                <div key={notification.key} className="flex items-start justify-between">
                  <div className="flex-1">
                    <label 
                      className="block mb-[4px]"
                      style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        fontWeight: 600, 
                        fontSize: '14px', 
                        color: '#333333'
                      }}
                    >
                      {notification.label}
                    </label>
                    <p 
                      style={{ 
                        fontFamily: 'Inter, sans-serif', 
                        fontWeight: 400, 
                        fontSize: '12px', 
                        color: '#666666'
                      }}
                    >
                      Show in-app notifications
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggle(category, notification.key, 'inApp')}
                    className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center flex-shrink-0 ml-[16px] ${notification.inAppValue ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                    }`}
                  >
                    <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${notification.inAppValue ? 'translate-x-[20px]' : 'translate-x-[2px]'
                    }`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Prepare notification data for each card
  const attendanceNotificationsData = [
    {
      key: 'checkInOut',
      label: 'Check-in/Check-out',
      emailDescription: 'Notify when employees check in or out',
      emailValue: attendanceNotifications.checkInOut.email,
      inAppValue: attendanceNotifications.checkInOut.inApp
    },
    {
      key: 'lateArrival',
      label: 'Late Arrival',
      emailDescription: 'Notify when employees arrive late',
      emailValue: attendanceNotifications.lateArrival.email,
      inAppValue: attendanceNotifications.lateArrival.inApp
    },
    {
      key: 'earlyDeparture',
      label: 'Early Departure',
      emailDescription: 'Notify when employees leave early',
      emailValue: attendanceNotifications.earlyDeparture.email,
      inAppValue: attendanceNotifications.earlyDeparture.inApp
    }
  ];

  const leaveNotificationsData = [
    {
      key: 'newLeaveRequest',
      label: 'New Leave Request',
      emailDescription: 'Notify when a new request is submitted',
      emailValue: leaveNotifications.newLeaveRequest.email,
      inAppValue: leaveNotifications.newLeaveRequest.inApp
    },
    {
      key: 'requestApproved',
      label: 'Request Approved',
      emailDescription: 'Notify when a request is approved',
      emailValue: leaveNotifications.requestApproved.email,
      inAppValue: leaveNotifications.requestApproved.inApp
    },
    {
      key: 'requestRejected',
      label: 'Request Rejected',
      emailDescription: 'Notify when a request is rejected',
      emailValue: leaveNotifications.requestRejected.email,
      inAppValue: leaveNotifications.requestRejected.inApp
    }
  ];

  const activityNotificationsData = [
    {
      key: 'newActivityAssigned',
      label: 'New Activity Assigned',
      emailDescription: 'Notify when a new activity is created',
      emailValue: activityNotifications.newActivityAssigned.email,
      inAppValue: activityNotifications.newActivityAssigned.inApp
    },
    {
      key: 'activityCompleted',
      label: 'Activity Completed',
      emailDescription: 'Notify when an activity is completed',
      emailValue: activityNotifications.activityCompleted.email,
      inAppValue: activityNotifications.activityCompleted.inApp
    },
    {
      key: 'activityOverdue',
      label: 'Activity Overdue',
      emailDescription: 'Notify when an activity is overdue',
      emailValue: activityNotifications.activityOverdue.email,
      inAppValue: activityNotifications.activityOverdue.inApp
    }
  ];

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
              <span style={{ color: '#8E8C8C' }}>Notifications Settings</span>
            </p>
          </div>
        </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>

            {/* Page Title */}
            <div className="mb-[32px]" style={{ minWidth: 0, maxWidth: '100%' }}>
            <h1 
              style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: 600, 
                fontSize: '32px', 
                color: '#000000',
                marginBottom: '8px'
              }}
            >
              Notifications Settings
            </h1>
            <p 
              style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: 400, 
                fontSize: '16px', 
                color: '#666666'
              }}
            >
              Manage how you receive notifications about system activities
            </p>
          </div>

          {isLoading && (
            <div className="mb-6 text-[14px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Loading notification settings...
            </div>
          )}

          {/* Notification Cards */}
          <NotificationCard
            title="Attendance Notifications"
            description="Get notified about employee attendance events"
            icon={NotificationsIcon}
            notifications={attendanceNotificationsData}
            category="attendance"
          />

          <NotificationCard
            title="Leave Notifications"
            description="Receive updates on leave requests and approvals"
            icon={NotificationsIcon}
            notifications={leaveNotificationsData}
            category="leave"
          />

          <NotificationCard
            title="Activity Notifications"
            description="Stay updated on field activities and reports"
            icon={NotificationsIcon}
            notifications={activityNotificationsData}
            category="activity"
          />

          {/* Success/Error Messages */}
          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-[8px] p-4 mb-6">
              <p className="text-green-800 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                Settings saved successfully!
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-[8px] p-4 mb-6">
              <p className="text-red-800 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                {error}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-[12px] mt-[32px]">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving || isLoading}
              className={`px-[24px] py-[12px] rounded-[8px] bg-[#00564F] text-white hover:bg-[#004D40] transition-colors ${
                isSaving || isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              onClick={handleResetToDefaults}
              className="px-[24px] py-[12px] rounded-[8px] border border-[#E0E0E0] bg-white hover:bg-[#F5F7FA] transition-colors"
              style={{ 
                fontFamily: 'Inter, sans-serif', 
                fontWeight: 500, 
                fontSize: '14px',
                color: '#333333'
              }}
            >
              Reset to Defaults
            </button>
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
            userRole={effectiveRole}
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
                color: '#000000'
              }}
            >
              Notifications Settings
            </h1>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '140%',
                color: '#666666'
              }}
            >
              Manage how you receive notifications about system activities
            </p>
          </div>

          {isLoading && (
            <div className="mb-6 text-[14px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Loading notification settings...
            </div>
          )}

          {/* Notification Cards - Mobile */}
          <div className="space-y-4 mb-6">
            {/* Attendance Notifications Card */}
            <div className="bg-white rounded-[12px] p-4 border" style={{ borderColor: '#B3B3B3' }}>
              {/* Card Header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#BCDEDC80' }}
                >
                  <img src={NotificationsIcon} alt="Attendance Notifications" className="w-[20px] h-[20px] object-contain" />
                </div>
                <div className="flex-1">
                  <h3
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#000000',
                      marginBottom: '4px'
                    }}
                  >
                    Attendance Notifications
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#666666'
                    }}
                  >
                    Get notified about employee attendance events
                  </p>
                </div>
              </div>

              {/* Separator Line */}
              <div className="border-b border-[#E0E0E0] mb-4"></div>

              {/* Notification Settings - Mobile */}
              <div className="space-y-4">
                {attendanceNotificationsData.map((notification) => (
                  <div key={notification.key} className="space-y-3">
                    {/* Notification Label */}
                    <div className="flex items-center justify-between">
                      <label
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#333333'
                        }}
                      >
                        {notification.label}
                      </label>
                    </div>

                    {/* Email Notification */}
                    <div className="flex items-start justify-between pl-4">
                      <div className="flex-1">
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '12px',
                            color: '#5F6766',
                            marginBottom: '4px'
                          }}
                        >
                          Email Notifications
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '11px',
                            color: '#666666'
                          }}
                        >
                          {notification.emailDescription}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle('attendance', notification.key, 'email')}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center flex-shrink-0 ml-3 ${notification.emailValue ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${notification.emailValue ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* In-App Notification */}
                    <div className="flex items-start justify-between pl-4">
                      <div className="flex-1">
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '12px',
                            color: '#5F6766',
                            marginBottom: '4px'
                          }}
                        >
                          In-App Notifications
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '11px',
                            color: '#666666'
                          }}
                        >
                          Show in-app notifications
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle('attendance', notification.key, 'inApp')}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center flex-shrink-0 ml-3 ${notification.inAppValue ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${notification.inAppValue ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* Divider between notifications */}
                    {notification.key !== attendanceNotificationsData[attendanceNotificationsData.length - 1].key && (
                      <div className="border-b border-[#E0E0E0] my-4"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Notifications Card */}
            <div className="bg-white rounded-[12px] p-4 border" style={{ borderColor: '#B3B3B3' }}>
              {/* Card Header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#BCDEDC80' }}
                >
                  <img src={NotificationsIcon} alt="Leave Notifications" className="w-[20px] h-[20px] object-contain" />
                </div>
                <div className="flex-1">
                  <h3
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#000000',
                      marginBottom: '4px'
                    }}
                  >
                    Leave Notifications
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#666666'
                    }}
                  >
                    Receive updates on leave requests and approvals
                  </p>
                </div>
              </div>

              {/* Separator Line */}
              <div className="border-b border-[#E0E0E0] mb-4"></div>

              {/* Notification Settings - Mobile */}
              <div className="space-y-4">
                {leaveNotificationsData.map((notification) => (
                  <div key={notification.key} className="space-y-3">
                    {/* Notification Label */}
                    <div className="flex items-center justify-between">
                      <label
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#333333'
                        }}
                      >
                        {notification.label}
                      </label>
                    </div>

                    {/* Email Notification */}
                    <div className="flex items-start justify-between pl-4">
                      <div className="flex-1">
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '12px',
                            color: '#5F6766',
                            marginBottom: '4px'
                          }}
                        >
                          Email Notifications
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '11px',
                            color: '#666666'
                          }}
                        >
                          {notification.emailDescription}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle('leave', notification.key, 'email')}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center flex-shrink-0 ml-3 ${notification.emailValue ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${notification.emailValue ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* In-App Notification */}
                    <div className="flex items-start justify-between pl-4">
                      <div className="flex-1">
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '12px',
                            color: '#5F6766',
                            marginBottom: '4px'
                          }}
                        >
                          In-App Notifications
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '11px',
                            color: '#666666'
                          }}
                        >
                          Show in-app notifications
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle('leave', notification.key, 'inApp')}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center flex-shrink-0 ml-3 ${notification.inAppValue ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${notification.inAppValue ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* Divider between notifications */}
                    {notification.key !== leaveNotificationsData[leaveNotificationsData.length - 1].key && (
                      <div className="border-b border-[#E0E0E0] my-4"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Notifications Card */}
            <div className="bg-white rounded-[12px] p-4 border" style={{ borderColor: '#B3B3B3' }}>
              {/* Card Header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#BCDEDC80' }}
                >
                  <img src={NotificationsIcon} alt="Activity Notifications" className="w-[20px] h-[20px] object-contain" />
                </div>
                <div className="flex-1">
                  <h3
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#000000',
                      marginBottom: '4px'
                    }}
                  >
                    Activity Notifications
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#666666'
                    }}
                  >
                    Stay updated on field activities and reports
                  </p>
                </div>
              </div>

              {/* Separator Line */}
              <div className="border-b border-[#E0E0E0] mb-4"></div>

              {/* Notification Settings - Mobile */}
              <div className="space-y-4">
                {activityNotificationsData.map((notification) => (
                  <div key={notification.key} className="space-y-3">
                    {/* Notification Label */}
                    <div className="flex items-center justify-between">
                      <label
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#333333'
                        }}
                      >
                        {notification.label}
                      </label>
                    </div>

                    {/* Email Notification */}
                    <div className="flex items-start justify-between pl-4">
                      <div className="flex-1">
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '12px',
                            color: '#5F6766',
                            marginBottom: '4px'
                          }}
                        >
                          Email Notifications
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '11px',
                            color: '#666666'
                          }}
                        >
                          {notification.emailDescription}
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle('activity', notification.key, 'email')}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center flex-shrink-0 ml-3 ${notification.emailValue ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${notification.emailValue ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* In-App Notification */}
                    <div className="flex items-start justify-between pl-4">
                      <div className="flex-1">
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 500,
                            fontSize: '12px',
                            color: '#5F6766',
                            marginBottom: '4px'
                          }}
                        >
                          In-App Notifications
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '11px',
                            color: '#666666'
                          }}
                        >
                          Show in-app notifications
                        </p>
                      </div>
                      <button
                        onClick={() => handleToggle('activity', notification.key, 'inApp')}
                        className={`w-[48px] h-[28px] rounded-full transition-colors flex items-center flex-shrink-0 ml-3 ${notification.inAppValue ? 'bg-[#00564F]' : 'bg-[#E0E0E0]'
                          }`}
                      >
                        <div className={`w-[24px] h-[24px] rounded-full bg-white transition-transform ${notification.inAppValue ? 'translate-x-[20px]' : 'translate-x-[2px]'
                          }`}></div>
                      </button>
                    </div>

                    {/* Divider between notifications */}
                    {notification.key !== activityNotificationsData[activityNotificationsData.length - 1].key && (
                      <div className="border-b border-[#E0E0E0] my-4"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Success/Error Messages - Mobile */}
          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-[8px] p-4 mb-4">
              <p className="text-green-800 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                Settings saved successfully!
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-[8px] p-4 mb-4">
              <p className="text-red-800 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                {error}
              </p>
            </div>
          )}

          {/* Action Buttons - Mobile */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving || isLoading}
              className={`w-full px-[24px] py-[12px] rounded-[8px] bg-[#00564F] text-white hover:bg-[#004D40] transition-colors ${
                isSaving || isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              onClick={handleResetToDefaults}
              className="w-full px-[24px] py-[12px] rounded-[8px] border border-[#E0E0E0] bg-white hover:bg-[#F5F7FA] transition-colors"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                color: '#333333'
              }}
            >
              Reset to Defaults
            </button>
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


export default NotificationsSettingsPage;

