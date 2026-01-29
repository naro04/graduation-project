import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getDashboardStats } from "../services/dashboard.js";
import { getCurrentUser, logout } from "../services/auth.js";

// Logo images
const LogoMobile = new URL("../images/LogoMobile.jpg", import.meta.url).href;
const LogoDesktop = new URL("../images/LogoDesktop.png", import.meta.url).href;

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Logout icon for mobile
const LogoutIcon = new URL("../images/icons/Log out.png", import.meta.url).href;

// Calendar dropdown icon
const CalendarDropdownIcon = new URL("../images/icons/dropdown.png", import.meta.url).href;

// User Metrics icons
const ProfileIcon = new URL("../images/icons/profile.png", import.meta.url).href;
const ProfileGreenIcon = new URL("../images/icons/profile green.png", import.meta.url).href;

// Quick Navigation icons
const EmployeesIcon = new URL("../images/icons/Employees.png", import.meta.url).href;
const LocationsIcon = new URL("../images/icons/Locations.png", import.meta.url).href;
const ActivitiesIcon = new URL("../images/icons/Activities1 (1).png", import.meta.url).href;

import LogoutModal from "./LogoutModal";

const DashboardPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 7)); // December 2025, day 7 selected
  const [selectedDate, setSelectedDate] = useState(7);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Get current user data
        const user = getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
        
        // Fetch dashboard stats
        const stats = await getDashboardStats();
        console.log('✅ Dashboard data loaded successfully:', stats);
        setDashboardData(stats);
      } catch (error) {
        console.error('❌ Failed to load dashboard data:', error);
        console.warn('⚠️ Using default data as fallback');
        // Keep default data if API fails
        // This allows the page to still display even if API is down
        setDashboardData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isMonthDropdownOpen) return;

    const handleClickOutside = (event) => {
      // Check if click is outside the dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMonthDropdownOpen(false);
      }
    };

    // Use mousedown instead of click to avoid conflicts
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMonthDropdownOpen]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    if (!isUserDropdownOpen) return;

    const handleClickOutside = (event) => {
      // Check if click is on Log Out button - don't close dropdown in that case
      const isLogoutButton = event.target.closest('button')?.textContent?.trim() === 'Log Out';
      if (isLogoutButton) {
        return;
      }

      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen]);

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "صباح الخير";
    } else if (hour >= 12 && hour < 18) {
      return "مساء الخير";
    } else {
      return "مساء الخير";
    }
  };

  // Get greeting in English for mobile
  const getGreetingEnglish = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    } else if (hour >= 12 && hour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  // Calendar helper functions
  const getMonthName = (date) => {
    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    return months[date.getMonth()];
  };

  const getYear = (date) => {
    return date.getFullYear();
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add days from previous month
    // To get the last day of the previous month, use: new Date(year, month, 0)
    // If currentDate is December (month 11), then new Date(2025, 11, 0) gives last day of November
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const daysInPrevMonth = prevMonth.getDate();
    // firstDay: 0=Sunday, 1=Monday, 2=Tuesday, etc.
    // If firstDay is 0 (Sunday), show 6 days from previous month
    // If firstDay is 1 (Monday), show 1 day (30) in Sunday
    // If firstDay is 2 (Tuesday), show 2 days (29, 30) in Sunday and Monday
    const daysToShowFromPrevMonth = firstDay === 0 ? 6 : firstDay;

    // Add days from previous month starting from the last day
    // Example: If daysInPrevMonth = 30 and daysToShowFromPrevMonth = 1
    // We want to show: 30
    // dayNumber = 30 - 1 + 0 + 1 = 30 ✓
    for (let i = 0; i < daysToShowFromPrevMonth; i++) {
      const dayNumber = daysInPrevMonth - daysToShowFromPrevMonth + i + 1;
      days.push({
        date: dayNumber,
        isCurrentMonth: false,
        isSelected: false
      });
    }

    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        isSelected: i === selectedDate
      });
    }

    // Add days from next month to fill the grid (5 rows = 35 days)
    const remainingDays = 35 - days.length; // 5 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        isSelected: false
      });
    }

    return days;
  };

  const handleDateClick = (day) => {
    if (day.isCurrentMonth) {
      setSelectedDate(day.date);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(1); // Reset to first day of new month
  };

  const handleMonthChange = (monthIndex, event) => {
    if (event) {
      event.stopPropagation();
    }
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    setCurrentDate(newDate);
    setSelectedDate(1);
    // Close dropdown after a small delay to ensure state updates
    setTimeout(() => {
      setIsMonthDropdownOpen(false);
    }, 0);
  };

  const handleYearChange = (year, event) => {
    if (event) {
      event.stopPropagation();
    }
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setSelectedDate(1);
    // Close dropdown after a small delay to ensure state updates
    setTimeout(() => {
      setIsMonthDropdownOpen(false);
    }, 0);
  };

  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  // Helper function to convert attendance chart data from API
  const getAttendanceChartData = () => {
    if (!dashboardData?.charts?.attendance || dashboardData.charts.attendance.length === 0) {
      // Default data: Sun=25%, Mon=100%, Tue=75%, Wed=50%, Thu=75%, Fri=100%
      return [
        { x: 0, y: 150 },
        { x: 100, y: 0 },
        { x: 200, y: 50 },
        { x: 300, y: 100 },
        { x: 400, y: 50 },
        { x: 500, y: 0 }
      ];
    }
    
    const attendanceData = dashboardData.charts.attendance;
    const points = [];
    const values = attendanceData.map(d => parseInt(d.present_count || 0));
    const maxValue = Math.max(...values, 1);
    
    attendanceData.forEach((day, index) => {
      const value = parseInt(day.present_count || 0);
      // Convert value to percentage (0-100%)
      const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
      // Convert percentage to SVG y coordinate (0% = 200px bottom, 100% = 0px top)
      const y = 200 - (percentage / 100) * 200;
      // Distribute x coordinates evenly across 500px width
      const x = attendanceData.length > 1 ? (index / (attendanceData.length - 1)) * 500 : 0;
      points.push({ x, y });
    });
    
    return points;
  };

  // Helper function to convert activity chart data from API
  const getActivityChartData = () => {
    if (!dashboardData?.charts?.activities) {
      // Default data
      return [
        [9, 12],  // Sun
        [6, 10],  // Mon
        [13, 9],  // Tue
        [1, 9],   // Wed
        [11, 8],  // Thu
        [0, 0],   // Fri
        [0, 0]    // Sat
      ];
    }
    
    const activitiesData = dashboardData.charts.activities;
    return activitiesData.map(day => [
      parseInt(day.implemented_count || 0),
      parseInt(day.planned_count || 0)
    ]);
  };

  // Dashboard stats data - use API data if available, otherwise use defaults
  const statsData = dashboardData ? [
    {
      id: 1,
      title: "Total Employees",
      value: (dashboardData.totalEmployees || dashboardData.employees || 0).toString(),
      subtitle: "Employees",
      message: dashboardData.employeesMessage || "You're part of a growing team!",
      bgColor: "bg-white"
    },
    {
      id: 2,
      title: "Attendance",
      value: (() => {
        // Calculate attendance percentage from present_count, late_count, on_leave_count
        const present = parseInt(dashboardData.attendance?.present_count || 0);
        const late = parseInt(dashboardData.attendance?.late_count || 0);
        const onLeave = parseInt(dashboardData.attendance?.on_leave_count || 0);
        const total = present + late + onLeave;
        if (total === 0) return "0";
        const percentage = Math.round((present / total) * 100);
        return percentage.toString();
      })(),
      subtitle: (() => {
        const present = parseInt(dashboardData.attendance?.present_count || 0);
        const late = parseInt(dashboardData.attendance?.late_count || 0);
        const onLeave = parseInt(dashboardData.attendance?.on_leave_count || 0);
        if (present > 0 || late > 0 || onLeave > 0) {
          return `Present - ${onLeave} Days off, ${late} Late Arrival`;
        }
        return dashboardData.attendance?.status || dashboardData.attendanceStatus || "Present";
      })(),
      message: dashboardData.attendanceMessage || "You're attendance this month is looking solid",
      bgColor: "bg-white"
    },
    {
      id: 3,
      title: "Leave Requests",
      value: (dashboardData.leaveRequests?.approved_count || dashboardData.leaveRequests?.approved || dashboardData.approvedLeaves || 0).toString(),
      subtitle: "Approved",
      value2: (dashboardData.leaveRequests?.pending_count || dashboardData.leaveRequests?.pending || dashboardData.pendingLeaves || 0).toString(),
      subtitle2: "pending",
      message: dashboardData.leaveMessage || "You're submitted leave requests this month",
      bgColor: "bg-white"
    },
    {
      id: 4,
      title: "Job Applicants",
      value: dashboardData.jobApplicants?.percentage || dashboardData.applicantsPercentage || "+0%",
      subtitle: dashboardData.jobApplicants?.subtitle || "compared to last month",
      message: dashboardData.applicantsMessage || "You're team has new applicants",
      bgColor: "bg-white"
    }
  ] : [
    {
      id: 1,
      title: "Total Employees",
      value: "128",
      subtitle: "Employees",
      message: "You're part of a growing team!",
      bgColor: "bg-white"
    },
    {
      id: 2,
      title: "Attendance",
      value: "92%",
      subtitle: "Present - 3 Days off, 1 Late Arrival",
      message: "You're attendance this month is looking solid",
      bgColor: "bg-white"
    },
    {
      id: 3,
      title: "Leave Requests",
      value: "1",
      subtitle: "Approved",
      value2: "1",
      subtitle2: "pending",
      message: "You're submitted 2 leave requests this month",
      bgColor: "bg-white"
    },
    {
      id: 4,
      title: "Job Applicants",
      value: "+12%",
      subtitle: "compared to last month",
      message: "You're team has 37 new applicants",
      bgColor: "bg-white"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar Component */}
        <Sidebar
          userRole={userRole}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onLogoutClick={() => setIsLogoutModalOpen(true)}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-[#F5F7FA]">
          {/* Header - White background */}
          <header className="bg-white px-[40px] py-[24px]">
            <div className="flex items-center justify-between mb-[16px]">
              {/* Search Bar */}
              <div className="relative">
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

              <div className="flex items-center gap-[16px]">
                {/* Message Icon */}
                <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={MessageIcon} alt="Messages" className="w-[20px] h-[20px] object-contain" />
                </button>

                {/* Notification Bell */}
                <button className="relative w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={NotificationIcon} alt="Notifications" className="w-[20px] h-[20px] object-contain" />
                  <span className="absolute top-[4px] right-[4px] w-[8px] h-[8px] bg-red-500 rounded-full"></span>
                </button>

                {/* User Profile with Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <div
                    className="flex items-center gap-[12px] cursor-pointer"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <img
                      src={UserAvatar}
                      alt="User"
                      className="w-[44px] h-[44px] rounded-full object-cover border-2 border-[#E5E7EB]"
                    />
                    <div>
                      <div className="flex items-center gap-[6px]">
                        <p className="text-[16px] font-semibold text-[#333333]">
                          Hi, {currentUser?.name || currentUser?.full_name || "User"}!
                        </p>
                        <img
                          src={DropdownArrow}
                          alt=""
                          className={`w-[14px] h-[14px] object-contain transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <p className="text-[12px] font-normal text-[#6B7280]">
                        {currentUser?.role || roleDisplayNames[userRole] || "User"}
                      </p>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50">
                      <div className="px-[16px] py-[8px]">
                        <p className="text-[12px] text-[#6B7280]">elijlafiras@gmail.com</p>
                      </div>
                      <button className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors">
                        Edit Profile
                      </button>
                      <div className="h-[1px] bg-[#DC2626] my-[4px]"></div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = "/login";
                        }}
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
                <span style={{ color: '#8E8C8C' }}>Dashboard</span>
              </p>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 p-[36px] overflow-x-hidden overflow-y-auto bg-[#F5F7FA]">
            {/* Page Title */}
            <div className="mb-[28px]">
              <h1 className="text-[28px] font-semibold text-[#00564F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {getGreetingEnglish()}
              </h1>
            </div>

            {/* Stats Cards Row */}
            <div className="flex gap-[16px] mb-[28px] flex-nowrap w-full">
              {statsData.map((stat) => (
                <div
                  key={stat.id}
                  className="bg-white rounded-[10px] overflow-hidden border border-[#E0E0E0] shadow-sm flex flex-col"
                  style={{ flex: stat.id === 1 ? '1 1 0' : stat.id === 3 ? '1.1 1 0' : stat.id === 4 ? '1 1 0' : '1.15 1 0', height: '136px', minWidth: 0, maxWidth: stat.id === 1 ? '240px' : stat.id === 3 ? '270px' : stat.id === 4 ? '250px' : '280px' }}
                >
                  <div className="p-[20px] flex-1 overflow-hidden">
                    <p className="text-[14px] font-medium text-[#939393] mb-[28px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                      {stat.title}
                    </p>
                    <div className={`flex items-baseline gap-[4px] ${stat.id === 3 ? 'justify-center' : ''}`}>
                      <p className="text-[24px] font-bold text-[#000000] flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, lineHeight: '100%' }}>
                        {stat.value}
                      </p>
                      {stat.subtitle && (
                        <>
                          <p className="text-[11px] font-medium text-[#939393] whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                            {stat.subtitle}
                          </p>
                          {stat.value2 && (
                            <>
                              <p className="text-[24px] font-bold text-[#000000] flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, lineHeight: '100%', marginLeft: '16px' }}>
                                {stat.value2}
                              </p>
                              {stat.subtitle2 && (
                                <p className="text-[11px] font-medium text-[#939393]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                                  {stat.subtitle2}
                                </p>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div
                    className="px-[20px] py-[8px] mt-auto overflow-hidden"
                    style={{
                      backgroundColor: '#02706680',
                      borderBottomLeftRadius: '10px',
                      borderBottomRightRadius: '10px'
                    }}
                  >
                    <p className="text-[10px] font-medium" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%', textAlign: stat.id === 1 || stat.id === 3 || stat.id === 4 ? 'left' : 'center' }}>
                      {stat.id === 1 ? (
                        <>
                          <span style={{ color: '#4F7875' }}>You're part of a </span>
                          <span style={{ color: '#00564F' }}>growing team!</span>
                        </>
                      ) : stat.id === 2 ? (
                        <>
                          <span style={{ color: '#4F7875' }}>You're attendance this month is looking </span>
                          <span style={{ color: '#00564F', fontWeight: 700 }}>solid</span>
                        </>
                      ) : stat.id === 3 ? (
                        <span style={{ whiteSpace: 'nowrap' }}>
                          <span style={{ color: '#4F7875' }}>You're submitted </span>
                          <span style={{ color: '#00564F', fontWeight: 700 }}>2 leave requests</span>
                          <span style={{ color: '#4F7875' }}> this month</span>
                        </span>
                      ) : stat.id === 4 ? (
                        <>
                          <span style={{ color: '#4F7875' }}>You're team has </span>
                          <span style={{ color: '#00564F', fontWeight: 700 }}>37 new applicants</span>
                        </>
                      ) : (
                        <span style={{ color: '#FFFFFF' }}>{stat.message}</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Content Cards */}
            <div className="grid grid-cols-2 gap-0">
              {/* Calendar Card */}
              <div className="bg-white rounded-[10px] shadow-sm border border-[#E0E0E0] overflow-hidden" style={{ width: '378px', height: '293px' }}>
                <div className="p-[20px] h-full flex flex-col box-border">
                  {/* Calendar Header */}
                  <div ref={dropdownRef} className="relative flex items-center gap-[8px] mb-[16px] flex-shrink-0">
                    <h3 className="text-[16px] font-semibold text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%' }}>
                      {getMonthName(currentDate)} {getYear(currentDate)}
                    </h3>
                    <button
                      onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                      className="w-[14px] h-[14px] flex items-center justify-center flex-shrink-0"
                    >
                      <img src={CalendarDropdownIcon} alt="Dropdown" className="w-[12px] h-[12px] object-contain" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMonthDropdownOpen && (
                      <div
                        className="absolute top-full left-0 mt-[8px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-50"
                        style={{ minWidth: '200px' }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        {/* Months */}
                        <div className="p-[8px]">
                          <div className="grid grid-cols-3 gap-[4px] mb-[8px]">
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, index) => (
                              <button
                                key={month}
                                onClick={(e) => handleMonthChange(index, e)}
                                onMouseDown={(e) => e.stopPropagation()}
                                className={`px-[8px] py-[4px] text-[12px] rounded-[4px] transition-colors ${currentDate.getMonth() === index
                                    ? 'bg-[#027066] text-white'
                                    : 'text-[#000000] hover:bg-[#F5F7FA]'
                                  }`}
                                style={{ fontFamily: 'Inter, sans-serif' }}
                              >
                                {month.substring(0, 3)}
                              </button>
                            ))}
                          </div>
                          {/* Years */}
                          <div className="border-t border-[#E0E0E0] pt-[8px]">
                            <div className="grid grid-cols-4 gap-[4px] max-h-[120px] overflow-y-auto">
                              {getAvailableYears().map((year) => (
                                <button
                                  key={year}
                                  onClick={(e) => handleYearChange(year, e)}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  className={`px-[8px] py-[4px] text-[12px] rounded-[4px] transition-colors ${currentDate.getFullYear() === year
                                      ? 'bg-[#027066] text-white'
                                      : 'text-[#000000] hover:bg-[#F5F7FA]'
                                    }`}
                                  style={{ fontFamily: 'Inter, sans-serif' }}
                                >
                                  {year}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Days of Week Header */}
                  <div className="grid grid-cols-7 mb-[12px] flex-shrink-0" style={{ gap: '8px' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <div
                        key={day}
                        className="text-center"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          fontWeight: 500,
                          lineHeight: '100%',
                          color: '#939393'
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 flex-1" style={{ gap: '8px', gridTemplateRows: 'repeat(5, minmax(32px, 1fr))' }}>
                    {getCalendarDays().map((day, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center"
                      >
                        <button
                          onClick={() => handleDateClick(day)}
                          className={`rounded-full flex items-center justify-center text-[14px] font-medium transition-colors ${day.isSelected
                              ? ''
                              : day.isCurrentMonth
                                ? 'text-[#000000] hover:bg-[#F5F7FA]'
                                : 'text-[#9CA3AF]'
                            }`}
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: day.isSelected ? 600 : 400,
                            lineHeight: '100%',
                            backgroundColor: day.isSelected ? '#02706680' : 'transparent',
                            border: 'none',
                            color: day.isSelected ? '#000000' : (day.isCurrentMonth ? '#000000' : '#9CA3AF'),
                            width: day.isSelected ? '24px' : '100%',
                            height: day.isSelected ? '24px' : '100%',
                            minWidth: day.isSelected ? '24px' : '32px',
                            minHeight: day.isSelected ? '24px' : '32px',
                            maxWidth: day.isSelected ? '24px' : '47px',
                            maxHeight: day.isSelected ? '24px' : '47px'
                          }}
                        >
                          {day.date}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Organization-wide Attendance Chart */}
              <div className="bg-white rounded-[10px] shadow-sm border border-[#E0E0E0] p-[20px] flex flex-col" style={{ width: '630px', height: '293px', marginLeft: '-120px' }}>
                {/* Chart Title */}
                <h3 className="text-[16px] font-semibold text-[#000000] mb-[20px] text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%' }}>
                  Organization-wide Attendance
                </h3>

                {/* Chart Container */}
                <div className="flex-1 relative" style={{ height: 'calc(293px - 60px)' }}>
                  {/* Y-axis Labels */}
                  <div className="absolute left-0 top-0 bottom-[30px] flex flex-col justify-between" style={{ width: '40px' }}>
                    {[100, 70, 50, 25, 0].map((value) => (
                      <div
                        key={value}
                        className="text-right pr-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 500,
                          lineHeight: '100%',
                          color: '#727272'
                        }}
                      >
                        {value}%
                      </div>
                    ))}
                  </div>

                  {/* Chart Area with Grid and Line */}
                  <div className="ml-[50px] relative" style={{ height: '100%', paddingBottom: '30px' }}>
                    {/* Grid Lines */}
                    <svg className="absolute inset-0" style={{ width: '100%', height: 'calc(100% - 30px)' }} preserveAspectRatio="none">
                      {[0, 25, 50, 70, 100].map((value) => {
                        const y = ((100 - value) / 100) * 100;
                        return (
                          <line
                            key={value}
                            x1="0"
                            y1={`${y}%`}
                            x2="100%"
                            y2={`${y}%`}
                            stroke="#E0E0E0"
                            strokeWidth="1"
                            style={value === 0 ? { opacity: 1 } : {}}
                          />
                        );
                      })}
                    </svg>

                    {/* Line Chart */}
                    <svg className="absolute inset-0" style={{ width: '100%', height: 'calc(100% - 30px)' }} viewBox="0 0 600 200" preserveAspectRatio="none">
                      {/* Arrow marker definition */}
                      <defs>
                        <marker
                          id="arrowhead"
                          markerWidth="8"
                          markerHeight="8"
                          refX="4"
                          refY="4"
                          orient="auto"
                        >
                          <polygon
                            points="0 0, 8 4, 0 8"
                            fill="#00564F"
                          />
                        </marker>
                      </defs>
                      {/* Dynamic data from API */}
                      {(() => {
                        const chartPoints = getAttendanceChartData();
                        const pointsString = chartPoints.map(p => `${p.x},${p.y}`).join(' ');
                        return (
                          <polyline
                            points={pointsString}
                            fill="none"
                            stroke="#00564F"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            markerEnd="url(#arrowhead)"
                          />
                        );
                      })()}
                    </svg>

                    {/* X-axis Labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ height: '30px' }}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div
                          key={day}
                          className="text-center flex items-center justify-center"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            lineHeight: '100%',
                            color: '#827F7F',
                            width: `${100 / 7}%`
                          }}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Activity Statistics, User Metrics, and Quick Navigation */}
            <div className="mt-[20px] flex gap-[16px]">
              {/* Activity Statistics Chart */}
              <div className="bg-white rounded-[10px] shadow-sm border border-[#E0E0E0] overflow-hidden" style={{ width: '378px', height: '293px', flexShrink: 0 }}>
                <div className="p-[20px] h-full flex flex-col box-border">
                  {/* Chart Title */}
                  <h3 className="text-[16px] font-semibold text-[#000000] mb-[20px] text-left flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%' }}>
                    Activity Statistics
                  </h3>

                  {/* Chart Container */}
                  <div className="flex-1 relative" style={{ height: 'calc(293px - 60px)' }}>
                    {/* Y-axis Labels */}
                    <div className="absolute left-0 top-0 bottom-[30px] flex flex-col justify-between" style={{ width: '30px' }}>
                      {[15, 12, 9, 6, 0].map((value) => (
                        <div
                          key={value}
                          className="text-right pr-[8px]"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            lineHeight: '100%',
                            color: '#727272'
                          }}
                        >
                          {value}
                        </div>
                      ))}
                    </div>

                    {/* Chart Area with Grid and Bars */}
                    <div className="ml-[40px] relative" style={{ height: '100%', paddingBottom: '30px' }}>
                      {/* Grid Lines */}
                      <svg className="absolute inset-0" style={{ width: '100%', height: 'calc(100% - 30px)' }} preserveAspectRatio="none">
                        {[15, 12, 9, 6, 0].map((value, index) => {
                          // Distribute evenly to match Y-axis labels (justify-between)
                          const y = (index / 4) * 100;
                          return (
                            <line
                              key={value}
                              x1="0"
                              y1={`${y}%`}
                              x2="100%"
                              y2={`${y}%`}
                              stroke="#E0E0E0"
                              strokeWidth="1"
                            />
                          );
                        })}
                      </svg>

                      {/* Bars */}
                      <div className="absolute inset-0 flex items-end justify-start" style={{ height: 'calc(100% - 30px)', paddingLeft: '8px', paddingRight: '8px', gap: '8px' }}>
                        {/* Bar data from API */}
                        {getActivityChartData().map((values, dayIndex) => {
                          const availableWidth = 'calc(100% - 16px)'; // subtract padding
                          const gapTotal = 8 * 6; // 6 gaps between 7 items
                          const dayWidth = `calc((${availableWidth} - ${gapTotal}px) / 7)`;

                          // Function to convert value (0-15) to percentage height based on evenly distributed grid lines
                          const valueToHeight = (value) => {
                            // Grid lines are evenly distributed: 15(0%), 12(25%), 9(50%), 6(75%), 0(100%)
                            // Calculate position from bottom (items-end means height is from bottom)
                            if (value === 0) return 100;
                            if (value === 6) return 75;
                            if (value === 9) return 50;
                            if (value === 12) return 25;
                            if (value === 15) return 0;

                            // Interpolate between grid lines
                            if (value > 12 && value < 15) {
                              // Between 12 and 15: 25% to 0%
                              return 25 - ((value - 12) / 3) * 25;
                            }
                            if (value > 9 && value < 12) {
                              // Between 9 and 12: 50% to 25%
                              return 50 - ((value - 9) / 3) * 25;
                            }
                            if (value > 6 && value < 9) {
                              // Between 6 and 9: 75% to 50%
                              return 75 - ((value - 6) / 3) * 25;
                            }
                            if (value > 0 && value < 6) {
                              // Between 0 and 6: 100% to 75%
                              return 100 - (value / 6) * 25;
                            }
                            if (value > 15) {
                              // Above 15
                              return 0;
                            }
                            return 100;
                          };

                          return (
                            <div key={dayIndex} className="flex items-end justify-center gap-[2px]" style={{ width: dayWidth, height: '100%', flexShrink: 0 }}>
                              {/* Dark teal bar */}
                              {values[0] > 0 && (
                                <div
                                  style={{
                                    width: 'calc(35% - 1px)',
                                    height: `${valueToHeight(values[0])}%`,
                                    backgroundColor: '#00564F',
                                    borderRadius: '2px 2px 0 0',
                                    minHeight: values[0] > 0 ? '2px' : '0'
                                  }}
                                />
                              )}
                              {/* Light teal bar */}
                              {values[1] > 0 && (
                                <div
                                  style={{
                                    width: 'calc(35% - 1px)',
                                    height: `${valueToHeight(values[1])}%`,
                                    backgroundColor: '#02706680',
                                    borderRadius: '2px 2px 0 0',
                                    minHeight: values[1] > 0 ? '2px' : '0'
                                  }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* X-axis Labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ height: '30px' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                          <div
                            key={day}
                            className="text-center flex items-center justify-center"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '14px',
                              fontWeight: 500,
                              lineHeight: '100%',
                              color: '#827F7F',
                              width: `${100 / 7}%`
                            }}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-col gap-[8px] mt-[12px] flex-shrink-0" style={{ marginLeft: '20px' }}>
                    <div className="flex items-center gap-[6px]">
                      <div
                        className="rounded-full flex-shrink-0"
                        style={{
                          width: '14px',
                          height: '14px',
                          backgroundColor: '#00564F'
                        }}
                      />
                      <p className="text-[14px] font-medium text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                        Implemented
                      </p>
                    </div>
                    <div className="flex items-center gap-[6px]">
                      <div
                        className="rounded-full flex-shrink-0"
                        style={{
                          width: '14px',
                          height: '14px',
                          backgroundColor: '#02706680'
                        }}
                      />
                      <p className="text-[14px] font-medium text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                        Planned
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Metrics Section */}
              <div className="bg-white rounded-[10px] shadow-sm border border-[#E0E0E0] overflow-hidden" style={{ width: '280px', height: '195px', flexShrink: 0 }}>
                <div className="p-[18px] h-full flex flex-col box-border">
                  {/* Section Title */}
                  <h3 className="text-[16px] font-semibold text-[#000000] mb-[18px] text-left flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%' }}>
                    User Metrics
                  </h3>

                  {/* Metrics Cards */}
                  <div className="flex gap-[12px] flex-1">
                    {/* Active User Card */}
                    <div
                      className="rounded-[5px] flex flex-col items-center flex-shrink-0"
                      style={{
                        width: '70px',
                        height: '107px',
                        backgroundColor: 'rgba(194, 222, 220, 0.5)', // #C2DEDC with 50% opacity
                        paddingTop: '20px'
                      }}
                    >
                      <img
                        src={ProfileGreenIcon}
                        alt="Active User"
                        className="w-[22px] h-[22px] object-contain mb-[8px]"
                      />
                      <p className="text-[16px] font-semibold text-[#000000] mb-[4px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%' }}>
                        {dashboardData?.userMetrics?.active_users || '25'}
                      </p>
                      <p className="text-[10px] font-medium text-[#3F3E3E] text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                        Active User
                      </p>
                    </div>

                    {/* Inactive User Card */}
                    <div
                      className="rounded-[5px] flex flex-col items-center flex-shrink-0"
                      style={{
                        width: '70px',
                        height: '107px',
                        backgroundColor: 'rgba(194, 222, 220, 0.5)', // #C2DEDC with 50% opacity
                        paddingTop: '20px'
                      }}
                    >
                      <img
                        src={ProfileIcon}
                        alt="Inactive User"
                        className="w-[22px] h-[22px] object-contain mb-[8px]"
                      />
                      <p className="text-[16px] font-semibold text-[#000000] mb-[4px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%' }}>
                        {dashboardData?.userMetrics?.inactive_users || '3'}
                      </p>
                      <p className="text-[10px] font-medium text-[#3F3E3E] text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                        Inactive User
                      </p>
                    </div>

                    {/* New User Card */}
                    <div
                      className="rounded-[5px] flex flex-col items-center flex-shrink-0"
                      style={{
                        width: '60px',
                        height: '107px',
                        backgroundColor: 'rgba(194, 222, 220, 0.5)', // #C2DEDC with 50% opacity
                        paddingTop: '20px'
                      }}
                    >
                      <div
                        className="w-[22px] h-[22px] rounded-full flex items-center justify-center mb-[8px]"
                        style={{ backgroundColor: '#43964D' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 2V10M2 6H10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </div>
                      <p className="text-[16px] font-semibold text-[#000000] mb-[4px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%' }}>
                        {dashboardData?.userMetrics?.new_users_30d || '2'}
                      </p>
                      <p className="text-[10px] font-medium text-[#3F3E3E] text-center mb-0" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                        New User
                      </p>
                      <p className="text-[10px] font-medium text-[#3F3E3E] text-center mt-[2px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '100%' }}>
                        30 Days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Section - Separate Cards */}
              <div className="flex flex-col gap-[12px]" style={{ width: '325px', flexShrink: 0 }}>
                {/* Employees Card */}
                <button
                  onClick={() => navigate("/user-management/employees")}
                  className="bg-white rounded-[10px] shadow-sm border border-[#E0E0E0] p-[16px] flex items-center gap-[12px] cursor-pointer"
                >
                  <img
                    src={EmployeesIcon}
                    alt="Employees"
                    className="w-[24px] h-[24px] object-contain"
                  />
                  <p className="text-[16px] font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%', color: '#00564F' }}>
                    Employees
                  </p>
                </button>

                {/* Locations Card */}
                <button
                  onClick={() => navigate("/locations/all")}
                  className="bg-white rounded-[10px] shadow-sm border border-[#E0E0E0] p-[16px] flex items-center gap-[12px] cursor-pointer"
                >
                  <img
                    src={LocationsIcon}
                    alt="Locations"
                    className="w-[24px] h-[24px] object-contain"
                  />
                  <p className="text-[16px] font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%', color: '#00564F' }}>
                    Locations
                  </p>
                </button>

                {/* Activities Card */}
                <button
                  onClick={() => navigate("/activities")}
                  className="bg-white rounded-[10px] shadow-sm border border-[#E0E0E0] p-[16px] flex items-center gap-[12px] cursor-pointer"
                >
                  <img
                    src={ActivitiesIcon}
                    alt="Activities"
                    className="w-[24px] h-[24px] object-contain"
                  />
                  <p className="text-[16px] font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%', color: '#00564F' }}>
                    Activities
                  </p>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen bg-[#F5F7FA]">
        {/* Mobile Header */}
        <header className="h-[70px] bg-white flex items-center justify-between px-[16px] sticky top-0 z-30 border-b border-[#E0E0E0]">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-[40px] h-[40px] rounded-[8px] bg-[#004D40] flex items-center justify-center hover:bg-[#003830] transition-colors"
          >
            <svg className="w-[24px] h-[24px] text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

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
                <div className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50">
                  <div className="px-[16px] py-[8px]">
                    <p className="text-[12px] text-[#6B7280]">elijlafiras@gmail.com</p>
                  </div>
                  <button className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors">
                    Edit Profile
                  </button>
                  <div className="h-[1px] bg-[#DC2626] my-[4px]"></div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.location.href = "/login";
                    }}
                    className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#DC2626] hover:bg-[#F5F7FA] transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

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
        <div className="p-[16px]">
          {/* Page Title - Mobile */}
          <div className="mb-[16px]">
            <h1 className="text-[20px] font-semibold text-[#00564F]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%', letterSpacing: '0%' }}>
              {getGreetingEnglish()}
            </h1>
          </div>

          {/* Stats Cards - Mobile */}
          <div className="flex flex-col gap-[12px] mb-[16px]">
            {statsData.map((stat) => (
              <div
                key={stat.id}
                className="bg-white rounded-[10px] overflow-hidden border border-[#E0E0E0] shadow-sm flex flex-col w-full"
                style={{ height: '136px' }}
              >
                <div className="p-[20px] flex-1 overflow-hidden">
                  <p className="text-[13px] font-medium text-[#939393] mb-[28px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                    {stat.title}
                  </p>
                  <div className={`flex items-baseline gap-[4px] ${stat.id === 3 ? 'justify-center' : ''}`}>
                    <p className="text-[24px] font-bold text-[#000000] flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, lineHeight: '100%' }}>
                      {stat.value}
                    </p>
                    {stat.subtitle && (
                      <>
                        <p className="text-[11px] font-medium text-[#939393] whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                          {stat.subtitle}
                        </p>
                        {stat.value2 && (
                          <>
                            <p className="text-[24px] font-bold text-[#000000] flex-shrink-0" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, lineHeight: '100%', marginLeft: '16px' }}>
                              {stat.value2}
                            </p>
                            {stat.subtitle2 && (
                              <p className="text-[11px] font-medium text-[#939393]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                                {stat.subtitle2}
                              </p>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div
                  className="px-[20px] py-[8px] mt-auto overflow-hidden"
                  style={{
                    backgroundColor: '#02706680',
                    borderBottomLeftRadius: '10px',
                    borderBottomRightRadius: '10px'
                  }}
                >
                  <p className="text-[10px] font-medium" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%', textAlign: 'left' }}>
                    {stat.id === 1 ? (
                      <>
                        <span style={{ color: '#4F7875' }}>You're part of a </span>
                        <span style={{ color: '#00564F' }}>growing team!</span>
                      </>
                    ) : stat.id === 2 ? (
                      <>
                        <span style={{ color: '#4F7875' }}>You're attendance this month is looking </span>
                        <span style={{ color: '#00564F', fontWeight: 700 }}>solid</span>
                      </>
                    ) : stat.id === 3 ? (
                      <span style={{ whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#4F7875' }}>You're submitted </span>
                        <span style={{ color: '#00564F', fontWeight: 700 }}>2 leave requests</span>
                        <span style={{ color: '#4F7875' }}> this month</span>
                      </span>
                    ) : stat.id === 4 ? (
                      <>
                        <span style={{ color: '#4F7875' }}>You're team has </span>
                        <span style={{ color: '#00564F', fontWeight: 700 }}>37 new applicants</span>
                      </>
                    ) : (
                      <span style={{ color: '#FFFFFF' }}>{stat.message}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Content Cards - Mobile */}
          <div className="flex flex-col gap-[12px]">
            {/* Calendar Card - Mobile */}
            <div className="bg-white rounded-[10px] shadow-sm border border-[#E0E0E0] p-[16px]">
              {/* Calendar Header */}
              <div ref={dropdownRef} className="relative flex items-center gap-[8px] mb-[16px]">
                <h3 className="text-[16px] font-semibold text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%' }}>
                  {getMonthName(currentDate)} {getYear(currentDate)}
                </h3>
                <button
                  onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                  className="w-[14px] h-[14px] flex items-center justify-center flex-shrink-0"
                >
                  <img src={CalendarDropdownIcon} alt="Dropdown" className="w-[12px] h-[12px] object-contain" />
                </button>

                {/* Dropdown Menu - Mobile */}
                {isMonthDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-[8px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-50"
                    style={{ minWidth: '200px' }}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {/* Months */}
                    <div className="p-[8px]">
                      <div className="grid grid-cols-3 gap-[4px] mb-[8px]">
                        {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month, index) => (
                          <button
                            key={month}
                            onClick={(e) => handleMonthChange(index, e)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`px-[8px] py-[4px] text-[12px] rounded-[4px] transition-colors ${currentDate.getMonth() === index
                                ? 'bg-[#027066] text-white'
                                : 'text-[#000000] hover:bg-[#F5F7FA]'
                              }`}
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {month.substring(0, 3)}
                          </button>
                        ))}
                      </div>
                      {/* Years */}
                      <div className="border-t border-[#E0E0E0] pt-[8px]">
                        <div className="grid grid-cols-4 gap-[4px] max-h-[120px] overflow-y-auto">
                          {getAvailableYears().map((year) => (
                            <button
                              key={year}
                              onClick={(e) => handleYearChange(year, e)}
                              onMouseDown={(e) => e.stopPropagation()}
                              className={`px-[8px] py-[4px] text-[12px] rounded-[4px] transition-colors ${currentDate.getFullYear() === year
                                  ? 'bg-[#027066] text-white'
                                  : 'text-[#000000] hover:bg-[#F5F7FA]'
                                }`}
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {year}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-[4px] mb-[8px]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div
                    key={day}
                    className="text-center"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 500,
                      lineHeight: '100%',
                      color: '#827F7F'
                    }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-[4px]">
                {getCalendarDays().map((day, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateClick(day)}
                    className={`w-full h-[32px] rounded-full flex items-center justify-center text-[12px] font-medium transition-colors ${day.isSelected
                        ? ''
                        : day.isCurrentMonth
                          ? 'text-[#000000] hover:bg-[#F5F7FA]'
                          : 'text-[#9CA3AF]'
                      }`}
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: day.isSelected ? 600 : 400,
                      lineHeight: '100%',
                      backgroundColor: day.isSelected ? '#02706680' : 'transparent',
                      border: 'none',
                      color: day.isSelected ? '#000000' : (day.isCurrentMonth ? '#000000' : '#9CA3AF')
                    }}
                  >
                    {day.date}
                  </button>
                ))}
              </div>
            </div>

            {/* Organization-wide Attendance Chart - Mobile */}
            <div className="bg-white rounded-[10px] shadow-sm border border-[#E0E0E0] p-[16px]">
              <h3 className="text-[16px] font-semibold text-[#000000] mb-[16px] text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%' }}>
                Organization-wide Attendance
              </h3>

              {/* Chart Container */}
              <div className="relative" style={{ height: '200px' }}>
                {/* Y-axis Labels */}
                <div className="absolute left-0 top-0 bottom-[30px] flex flex-col justify-between" style={{ width: '30px' }}>
                  {[100, 70, 50, 25, 0].map((value) => (
                    <div
                      key={value}
                      className="text-right pr-[4px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 500,
                        lineHeight: '100%',
                        color: '#727272'
                      }}
                    >
                      {value}%
                    </div>
                  ))}
                </div>

                {/* Chart Area with Grid and Line */}
                <div className="ml-[40px] relative" style={{ height: '100%', paddingBottom: '30px' }}>
                  {/* Grid Lines */}
                  <svg className="absolute inset-0" style={{ width: '100%', height: 'calc(100% - 30px)' }} preserveAspectRatio="none">
                    {[0, 25, 50, 70, 100].map((value) => {
                      const y = ((100 - value) / 100) * 100;
                      return (
                        <line
                          key={value}
                          x1="0"
                          y1={`${y}%`}
                          x2="100%"
                          y2={`${y}%`}
                          stroke="#E0E0E0"
                          strokeWidth="1"
                          style={value === 0 ? { opacity: 1 } : {}}
                        />
                      );
                    })}
                  </svg>

                  {/* Line Chart */}
                  <svg className="absolute inset-0" style={{ width: '100%', height: 'calc(100% - 30px)' }} viewBox="0 0 600 200" preserveAspectRatio="none">
                    <defs>
                      <marker
                        id="arrowhead-mobile"
                        markerWidth="8"
                        markerHeight="8"
                        refX="4"
                        refY="4"
                        orient="auto"
                      >
                        <polygon
                          points="0 0, 8 4, 0 8"
                          fill="#00564F"
                        />
                      </marker>
                    </defs>
                    {/* Dynamic data from API */}
                    {(() => {
                      const chartPoints = getAttendanceChartData();
                      const pointsString = chartPoints.map(p => `${p.x},${p.y}`).join(' ');
                      return (
                        <polyline
                          points={pointsString}
                          fill="none"
                          stroke="#00564F"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          markerEnd="url(#arrowhead-mobile)"
                        />
                      );
                    })()}
                  </svg>

                  {/* X-axis Labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ height: '30px' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div
                        key={day}
                        className="text-center flex items-center justify-center"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          fontWeight: 500,
                          lineHeight: '100%',
                          color: '#827F7F',
                          width: `${100 / 7}%`
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Statistics Chart - Mobile */}
            <div className="bg-white rounded-[10px] shadow-sm border border-[#E0E0E0] p-[16px]">
              <h3 className="text-[16px] font-semibold text-[#000000] mb-[16px] text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%' }}>
                Activity Statistics
              </h3>

              {/* Chart Container */}
              <div className="relative" style={{ height: '200px' }}>
                {/* Y-axis Labels */}
                <div className="absolute left-0 top-0 bottom-[30px] flex flex-col justify-between" style={{ width: '30px' }}>
                  {[15, 12, 9, 6, 0].map((value) => (
                    <div
                      key={value}
                      className="text-right pr-[4px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '12px',
                        fontWeight: 500,
                        lineHeight: '100%',
                        color: '#727272'
                      }}
                    >
                      {value}
                    </div>
                  ))}
                </div>

                {/* Chart Area with Grid and Bars */}
                <div className="ml-[40px] relative" style={{ height: '100%', paddingBottom: '30px' }}>
                  {/* Grid Lines */}
                  <svg className="absolute inset-0" style={{ width: '100%', height: 'calc(100% - 30px)' }} preserveAspectRatio="none">
                    {[15, 12, 9, 6, 0].map((value, index) => {
                      const y = (index / 4) * 100;
                      return (
                        <line
                          key={value}
                          x1="0"
                          y1={`${y}%`}
                          x2="100%"
                          y2={`${y}%`}
                          stroke="#E0E0E0"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>

                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end justify-start" style={{ height: 'calc(100% - 30px)', paddingLeft: '4px', paddingRight: '4px', gap: '4px' }}>
                    {/* Bar data from API */}
                    {getActivityChartData().map((values, dayIndex) => {
                      const valueToHeight = (value) => {
                        if (value === 0) return 100;
                        if (value === 6) return 75;
                        if (value === 9) return 50;
                        if (value === 12) return 25;
                        if (value === 15) return 0;

                        if (value > 12 && value < 15) {
                          return 25 - ((value - 12) / 3) * 25;
                        }
                        if (value > 9 && value < 12) {
                          return 50 - ((value - 9) / 3) * 25;
                        }
                        if (value > 6 && value < 9) {
                          return 75 - ((value - 6) / 3) * 25;
                        }
                        if (value > 0 && value < 6) {
                          return 100 - (value / 6) * 25;
                        }
                        if (value > 15) {
                          return 0;
                        }
                        return 100;
                      };

                      return (
                        <div key={dayIndex} className="flex items-end justify-center gap-[1px]" style={{ flex: 1, height: '100%' }}>
                          {values[0] > 0 && (
                            <div
                              style={{
                                width: 'calc(35% - 0.5px)',
                                height: `${valueToHeight(values[0])}%`,
                                backgroundColor: '#00564F',
                                borderRadius: '2px 2px 0 0',
                                minHeight: values[0] > 0 ? '2px' : '0'
                              }}
                            />
                          )}
                          {values[1] > 0 && (
                            <div
                              style={{
                                width: 'calc(35% - 0.5px)',
                                height: `${valueToHeight(values[1])}%`,
                                backgroundColor: '#02706680',
                                borderRadius: '2px 2px 0 0',
                                minHeight: values[1] > 0 ? '2px' : '0'
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* X-axis Labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ height: '30px' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div
                        key={day}
                        className="text-center flex items-center justify-center"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          fontWeight: 500,
                          lineHeight: '100%',
                          color: '#827F7F',
                          width: `${100 / 7}%`
                        }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend - Mobile */}
              <div className="flex flex-col gap-[8px] mt-[12px]" style={{ marginLeft: '20px' }}>
                <div className="flex items-center gap-[6px]">
                  <div
                    className="rounded-full flex-shrink-0"
                    style={{
                      width: '14px',
                      height: '14px',
                      backgroundColor: '#00564F'
                    }}
                  />
                  <p className="text-[14px] font-medium text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                    Implemented
                  </p>
                </div>
                <div className="flex items-center gap-[6px]">
                  <div
                    className="rounded-full flex-shrink-0"
                    style={{
                      width: '14px',
                      height: '14px',
                      backgroundColor: '#02706680'
                    }}
                  />
                  <p className="text-[14px] font-medium text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                    Planned
                  </p>
                </div>
              </div>
            </div>

            {/* User Metrics Section - Mobile */}
            <div className="bg-white rounded-[10px] shadow-sm border border-[#E0E0E0] p-[16px]">
              <h3 className="text-[16px] font-semibold text-[#000000] mb-[16px] text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%' }}>
                User Metrics
              </h3>

              {/* Metrics Cards */}
              <div className="flex gap-[12px] justify-center">
                {/* Active User Card */}
                <div
                  className="rounded-[5px] flex flex-col items-center flex-shrink-0"
                  style={{
                    width: '80px',
                    height: '107px',
                    backgroundColor: 'rgba(194, 222, 220, 0.5)',
                    paddingTop: '20px'
                  }}
                >
                  <img
                    src={ProfileGreenIcon}
                    alt="Active User"
                    className="w-[22px] h-[22px] object-contain mb-[8px]"
                  />
                  <p className="text-[16px] font-semibold text-[#000000] mb-[4px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%' }}>
                    {dashboardData?.userMetrics?.active_users || '25'}
                  </p>
                  <p className="text-[10px] font-medium text-[#3F3E3E] text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                    Active User
                  </p>
                </div>

                {/* Inactive User Card */}
                <div
                  className="rounded-[5px] flex flex-col items-center flex-shrink-0"
                  style={{
                    width: '80px',
                    height: '107px',
                    backgroundColor: 'rgba(194, 222, 220, 0.5)',
                    paddingTop: '20px'
                  }}
                >
                  <img
                    src={ProfileIcon}
                    alt="Inactive User"
                    className="w-[22px] h-[22px] object-contain mb-[8px]"
                  />
                  <p className="text-[16px] font-semibold text-[#000000] mb-[4px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%' }}>
                    {dashboardData?.userMetrics?.inactive_users || '3'}
                  </p>
                  <p className="text-[10px] font-medium text-[#3F3E3E] text-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                    Inactive User
                  </p>
                </div>

                {/* New User Card */}
                <div
                  className="rounded-[5px] flex flex-col items-center flex-shrink-0"
                  style={{
                    width: '70px',
                    height: '107px',
                    backgroundColor: 'rgba(194, 222, 220, 0.5)',
                    paddingTop: '20px'
                  }}
                >
                  <div
                    className="w-[22px] h-[22px] rounded-full flex items-center justify-center mb-[8px]"
                    style={{ backgroundColor: '#43964D' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 2V10M2 6H10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-[16px] font-semibold text-[#000000] mb-[4px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%' }}>
                    {dashboardData?.userMetrics?.new_users_30d || '2'}
                  </p>
                  <p className="text-[10px] font-medium text-[#3F3E3E] text-center mb-0" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, lineHeight: '100%' }}>
                    New User
                  </p>
                  <p className="text-[10px] font-medium text-[#3F3E3E] text-center mt-[2px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '100%' }}>
                    30 Days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          setIsLogoutModalOpen(false);
          try {
            await logout();
            navigate("/login");
          } catch (error) {
            console.error('Logout error:', error);
            // Navigate to login even if logout API fails
            navigate("/login");
          }
        }}
      />
    </div>
  );
};

export default DashboardPage;
