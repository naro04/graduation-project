import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getEffectiveRole, getCurrentUser } from "../services/auth.js";
import { getDailyAttendance, getAttendanceLocations, deleteAttendance } from "../services/attendance";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Attendance icons
const AttendanceIcon = new URL("../images/icons/Attendance1.png", import.meta.url).href;
const NotWorkingIcon = new URL("../images/icons/notworking.png", import.meta.url).href;
const HurryIcon = new URL("../images/icons/hurry.png", import.meta.url).href;

// Employee Photos
const MohamedAliPhoto = new URL("../images/Mohamed Ali.jpg", import.meta.url).href;
const AmalAhmedPhoto = new URL("../images/Amal Ahmed.png", import.meta.url).href;
const AmjadSaeedPhoto = new URL("../images/Amjad Saeed.jpg", import.meta.url).href;
const JanaHassanPhoto = new URL("../images/Jana Hassan.jpg", import.meta.url).href;

// Action icons
const ViewIcon = new URL("../images/icons/eye.png", import.meta.url).href;
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;
const ExportIcon = new URL("../images/icons/export.png", import.meta.url).href;
const WarningIcon = new URL("../images/icons/warnning.png", import.meta.url).href;

// Calendar icon
const CalendarIcon = new URL("../images/icons/calendar.png", import.meta.url).href;

// Attendance Details icons
const ProfileIcon = new URL("../images/icons/profile (2).png", import.meta.url).href;
const LocationIcon = new URL("../images/icons/location3.png", import.meta.url).href;
const CheckmarkIcon = new URL("../images/icons/chekmark.png", import.meta.url).href;
const DateIcon = new URL("../images/icons/date.png", import.meta.url).href;
const IdIcon = new URL("../images/icons/id.png", import.meta.url).href;

const DailyAttendancePage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const effectiveRole = getEffectiveRole(userRole);
  const [activeMenu, setActiveMenu] = useState("3-1");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 11, 7)); // December 7, 2025
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isExportAllDropdownOpen, setIsExportAllDropdownOpen] = useState(false);
  const [isExportSelectedDropdownOpen, setIsExportSelectedDropdownOpen] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showAttendanceDetailsModal, setShowAttendanceDetailsModal] = useState(false);
  const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [attendanceFromApi, setAttendanceFromApi] = useState([]);
  const [attendanceLocations, setAttendanceLocations] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState(null);
  const dateInputRef = useRef(null);
  const locationDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const exportAllDropdownRef = useRef(null);
  const exportSelectedDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR Admin",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  const dateParam = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}` : "";

  useEffect(() => {
    let cancelled = false;
    setAttendanceLoading(true);
    setAttendanceError(null);
    Promise.all([
      dateParam ? getDailyAttendance({ date: dateParam }).catch((err) => {
        if (!cancelled) setAttendanceError(err?.response?.data?.message || err?.message || "Failed to load daily attendance");
        return [];
      }) : Promise.resolve([]),
      getAttendanceLocations().catch(() => []),
    ]).then(([list, locations]) => {
      if (cancelled) return;
      setAttendanceFromApi(Array.isArray(list) ? list : []);
      setAttendanceLocations(Array.isArray(locations) ? locations : []);
    }).finally(() => {
      if (!cancelled) setAttendanceLoading(false);
    });
    return () => { cancelled = true; };
  }, [dateParam]);

  const refreshDailyAttendance = () => {
    if (!dateParam) return;
    getDailyAttendance({ date: dateParam })
      .then((list) => setAttendanceFromApi(Array.isArray(list) ? list : []))
      .catch(() => {});
  };

  const locationOptions = ["All Locations", ...(attendanceLocations || []).map((l) => l.name ?? l.location_name ?? "")].filter(Boolean);

  const attendanceData = React.useMemo(() => {
    return (attendanceFromApi || []).map((r) => ({
      id: r.id ?? r.attendance_id,
      name: r.employee_name ?? r.name ?? "—",
      employeeId: r.employee_id ?? r.employeeId ?? "—",
      checkIn: r.check_in ?? r.check_in_time ?? r.checkIn ?? "—",
      checkOut: r.check_out ?? r.check_out_time ?? r.checkOut ?? "—",
      attendanceType: r.attendance_type ?? r.check_method ?? r.type ?? "—",
      location: r.location_name ?? r.location ?? "—",
      status: r.status ?? "Present",
      photo: r.photo ?? r.avatar_url ?? MohamedAliPhoto,
    }));
  }, [attendanceFromApi]);

  const summaryStats = React.useMemo(() => {
    const list = attendanceData;
    return {
      present: list.filter((e) => (e.status || "").toLowerCase() === "present").length,
      absent: list.filter((e) => (e.status || "").toLowerCase() === "absent").length,
      lateArrivals: list.filter((e) => (e.status || "").toLowerCase() === "late").length,
    };
  }, [attendanceData]);

  // Format date
  const formatDate = (date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Handle checkbox selection
  const handleCheckboxChange = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedEmployees.length === paginatedData.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(paginatedData.map(emp => emp.id));
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on Log Out button - don't close dropdown in that case
      const isLogoutButton = event.target.closest('button')?.textContent?.trim() === 'Log Out';
      if (isLogoutButton) {
        return;
      }

      if (isLocationDropdownOpen && locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setIsLocationDropdownOpen(false);
      }
      if (isStatusDropdownOpen && statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (isExportAllDropdownOpen && exportAllDropdownRef.current && !exportAllDropdownRef.current.contains(event.target)) {
        setIsExportAllDropdownOpen(false);
      }
      if (isExportSelectedDropdownOpen && exportSelectedDropdownRef.current && !exportSelectedDropdownRef.current.contains(event.target)) {
        setIsExportSelectedDropdownOpen(false);
      }
      if (isUserDropdownOpen && userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLocationDropdownOpen, isStatusDropdownOpen, isExportAllDropdownOpen, isExportSelectedDropdownOpen, isUserDropdownOpen]);

  // Filter data based on search, location, and status
  const filteredData = attendanceData.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId.includes(searchQuery);
    const matchesLocation = selectedLocation === "All Locations" || employee.location === selectedLocation;
    const matchesStatus = selectedStatus === "All Status" || employee.status === selectedStatus;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        .user-dropdown-no-scroll {
          overflow: visible !important;
          overflow-y: visible !important;
          overflow-x: visible !important;
          max-height: none !important;
          height: auto !important;
        }
        .user-dropdown-no-scroll * {
          overflow: visible !important;
        }
        .user-dropdown-no-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .user-dropdown-no-scroll {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        div.user-dropdown-no-scroll,
        div.user-dropdown-no-scroll * {
          overflow: visible !important;
          overflow-y: visible !important;
          overflow-x: visible !important;
          max-height: none !important;
          height: auto !important;
        }
        div.user-dropdown-no-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar Component */}
        <Sidebar
          userRole={effectiveRole}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-[#F5F7FA]">
          {/* Header */}
          <header className="bg-white px-[40px] py-[24px]">
            <div className="flex items-center justify-between mb-[16px]">
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
                <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={MessageIcon} alt="Messages" className="w-[20px] h-[20px] object-contain" />
                </button>
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
                        <p className="text-[16px] font-semibold text-[#333333]">Hi, {currentUser?.name || currentUser?.full_name || currentUser?.firstName || "User"}!</p>
                        <img
                          src={DropdownArrow}
                          alt=""
                          className={`w-[14px] h-[14px] object-contain transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <p className="text-[12px] font-normal text-[#6B7280]">{roleDisplayNames[effectiveRole]}</p>
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
                <span style={{ color: '#B0B0B0' }}>Attendance</span>
                <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
                <span style={{ color: '#8E8C8C' }}>Daily Attendance</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: 'hidden', overflowY: 'hidden', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            {/* Page Header */}
            <div className="mb-[20px]" style={{ minWidth: 0, maxWidth: '100%' }}>
              <div className="flex items-start justify-between" style={{ minWidth: 0, maxWidth: '100%' }}>
                <div style={{ minWidth: 0, maxWidth: '100%', flex: '1 1 auto' }}>
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
                    Daily Attendance
                  </h1>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      color: '#6B7280'
                    }}
                  >
                    View & manage today's attendance across all employee
                  </p>
                </div>
                <div className="relative flex-shrink-0" ref={exportAllDropdownRef}>
                  <button
                    onClick={() => setIsExportAllDropdownOpen(!isExportAllDropdownOpen)}
                    className="flex items-center gap-[4px]"
                    style={{
                      backgroundColor: 'transparent',
                      fontWeight: 400,
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                      color: '#505050',
                      padding: 0,
                      borderRadius: 0,
                      border: 'none',
                      cursor: 'pointer',
                      lineHeight: '100%',
                      whiteSpace: 'nowrap',
                      marginTop: '40px'
                    }}
                  >
                    <span style={{ color: '#505050', fontWeight: 400 }}>Export All</span>
                    <img src={ExportIcon} alt="Export" style={{ width: '16px', height: '16px', objectFit: 'contain', flexShrink: 0 }} />
                  </button>
                  {isExportAllDropdownOpen && (
                    <div className="absolute top-full right-0 mt-[8px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg min-w-[150px]" style={{ zIndex: 1000 }}>
                      <div className="px-[16px] py-[8px] border-b border-[#E0E0E0]">
                        <div className="flex items-center gap-[8px]">
                          <svg className="w-[12px] h-[12px] text-[#000000]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                            Export As:
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          console.log('Export All as Excel');
                          setIsExportAllDropdownOpen(false);
                        }}
                        className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#000000] hover:bg-[#F5F7FA]"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                      >
                        xlsx
                      </button>
                      <button
                        onClick={() => {
                          console.log('Export All as PDF');
                          setIsExportAllDropdownOpen(false);
                        }}
                        className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#000000] hover:bg-[#F5F7FA] rounded-b-[8px]"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                      >
                        pdf
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="flex justify-center items-center gap-[40px] mt-[48px] mb-[56px]">
              {/* Present Today Card */}
              <div
                className="rounded-[10px] p-[24px] flex flex-col items-center justify-center"
                style={{
                  backgroundColor: '#E9F6F8B2',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  width: '240px',
                  height: '136px'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#7AC1BB',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    flexShrink: 0
                  }}
                >
                  <img src={AttendanceIcon} alt="Present" style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }} />
                </div>
                <div className="flex items-baseline justify-center gap-[4px]">
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: '24px',
                      lineHeight: '100%',
                      color: '#00675E'
                    }}
                  >
                    {summaryStats.present}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
                      lineHeight: '100%',
                      color: '#3F817C'
                    }}
                  >
                    Present Today
                  </p>
                </div>
              </div>

              {/* Absent Today Card */}
              <div
                className="rounded-[10px] p-[24px] flex flex-col items-center justify-center"
                style={{
                  backgroundColor: '#E9F6F8B2',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  width: '240px',
                  height: '136px'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#7AC1BB',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    flexShrink: 0
                  }}
                >
                  <img src={NotWorkingIcon} alt="Absent" style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }} />
                </div>
                <div className="flex items-baseline justify-center gap-[4px]">
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: '24px',
                      lineHeight: '100%',
                      color: '#00675E'
                    }}
                  >
                    {summaryStats.absent}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
                      lineHeight: '100%',
                      color: '#3F817C'
                    }}
                  >
                    Absent Today
                  </p>
                </div>
              </div>

              {/* Late Arrivals Card */}
              <div
                className="rounded-[10px] p-[24px] flex flex-col items-center justify-center"
                style={{
                  backgroundColor: '#E9F6F8B2',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  width: '240px',
                  height: '136px'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#7AC1BB',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    flexShrink: 0
                  }}
                >
                  <img src={HurryIcon} alt="Late" style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }} />
                </div>
                <div className="flex items-baseline justify-center gap-[4px]">
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: '24px',
                      lineHeight: '100%',
                      color: '#00675E'
                    }}
                  >
                    {summaryStats.lateArrivals}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
                      lineHeight: '100%',
                      color: '#3F817C'
                    }}
                  >
                    Late Arrivals
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-[8px] mb-[20px] flex-wrap">
              {/* Date Picker */}
              <div className="relative">
                <input
                  type="date"
                  ref={dateInputRef}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                  value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    setSelectedDate(newDate);
                  }}
                />
                <div
                  className="px-[16px] py-[12px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between cursor-pointer"
                  style={{ minWidth: '200px' }}
                  onClick={() => {
                    if (dateInputRef.current && dateInputRef.current.showPicker) {
                      dateInputRef.current.showPicker();
                    } else if (dateInputRef.current) {
                      dateInputRef.current.click();
                    }
                  }}
                >
                  <span className="text-[14px] text-[#000000]" style={{ fontWeight: 600 }}>
                    {formatDate(selectedDate)}
                  </span>
                  <svg
                    className="w-[20px] h-[20px] text-[#9CA3AF] cursor-pointer"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (dateInputRef.current && dateInputRef.current.showPicker) {
                        dateInputRef.current.showPicker();
                      } else if (dateInputRef.current) {
                        dateInputRef.current.click();
                      }
                    }}
                  >
                    <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Locations Dropdown */}
              <div className="relative" ref={locationDropdownRef}>
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="px-[16px] py-[12px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between gap-[8px] cursor-pointer"
                  style={{ minWidth: '200px' }}
                >
                  <span className="text-[14px] text-[#000000]" style={{ fontWeight: 600 }}>
                    {selectedLocation}
                  </span>
                  <svg className="w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isLocationDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-10">
                    {locationOptions.map((location) => (
                      <button
                        key={location}
                        onClick={() => {
                          setSelectedLocation(location);
                          setIsLocationDropdownOpen(false);
                        }}
                        className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[10px] last:rounded-b-[10px]"
                        style={{ fontWeight: 400 }}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="px-[16px] py-[12px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between gap-[8px] cursor-pointer"
                  style={{ minWidth: '200px' }}
                >
                  <span className="text-[14px] text-[#000000]" style={{ fontWeight: 600 }}>
                    {selectedStatus}
                  </span>
                  <svg className="w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-10">
                    {["All Status", "Present", "Absent", "Late", "In progress", "Missing Check-out"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setIsStatusDropdownOpen(false);
                        }}
                        className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[10px] last:rounded-b-[10px]"
                        style={{ fontWeight: 400 }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input */}
              <div className="relative flex-1" style={{ minWidth: '180px' }}>
                <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{ fontWeight: 400 }}
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedEmployees.length > 0 && (
              <div className="mb-[20px] bg-white rounded-[10px] p-[16px] flex items-center gap-[16px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div className="text-[14px] text-[#333333]" style={{ fontWeight: 500 }}>
                  {selectedEmployees.length} selected
                </div>
                <div className="flex items-center gap-[12px]">
                  {/* Export Selected Dropdown */}
                  <div className="relative" ref={exportSelectedDropdownRef}>
                    <button
                      onClick={() => setIsExportSelectedDropdownOpen(!isExportSelectedDropdownOpen)}
                      className="px-[16px] py-[8px] rounded-[8px] border border-[#E0E0E0] bg-white flex items-center gap-[8px] hover:bg-[#F5F7FA] transition-colors"
                      style={{ fontWeight: 500, fontSize: '14px' }}
                    >
                      <span>Export selected</span>
                      <svg className="w-[12px] h-[12px] text-[#6B7280]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {isExportSelectedDropdownOpen && (
                      <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-20 min-w-[150px]">
                        <div className="px-[16px] py-[8px] border-b border-[#E0E0E0]">
                          <p className="text-[12px] text-[#6B7280]" style={{ fontWeight: 500 }}>Export As:</p>
                        </div>
                        <button
                          onClick={() => {
                            console.log('Export selected as Excel', selectedEmployees);
                            setIsExportSelectedDropdownOpen(false);
                          }}
                          className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[8px] last:rounded-b-[8px]"
                          style={{ fontWeight: 400 }}
                        >
                          Excel (xlsx)
                        </button>
                        <button
                          onClick={() => {
                            console.log('Export selected as PDF', selectedEmployees);
                            setIsExportSelectedDropdownOpen(false);
                          }}
                          className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[8px] last:rounded-b-[8px]"
                          style={{ fontWeight: 400 }}
                        >
                          PDF
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mark as reviewed */}
                  <button
                    onClick={() => {
                      console.log('Mark as reviewed', selectedEmployees);
                      setSelectedEmployees([]);
                    }}
                    className="px-[16px] py-[8px] rounded-[8px] border border-[#E0E0E0] bg-white hover:bg-[#F5F7FA] transition-colors"
                    style={{ fontWeight: 500, fontSize: '14px' }}
                  >
                    Mark as reviewed
                  </button>

                  {/* Reject selected */}
                  <button
                    onClick={() => {
                      console.log('Reject selected', selectedEmployees);
                      setSelectedEmployees([]);
                    }}
                    className="px-[16px] py-[8px] rounded-[8px] border border-[#E0E0E0] bg-white hover:bg-[#F5F7FA] transition-colors"
                    style={{ fontWeight: 500, fontSize: '14px' }}
                  >
                    Reject selected
                  </button>
                </div>
              </div>
            )}

            {attendanceError && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {attendanceError}
              </div>
            )}

            {/* Table */}
            {attendanceLoading ? (
              <div className="bg-white rounded-[10px] p-[40px] text-center" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <p className="text-[14px] text-[#6B7280]">Loading daily attendance...</p>
              </div>
            ) : (
            <div className="bg-white rounded-[10px] overflow-hidden" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      <th className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        <input
                          type="checkbox"
                          checked={selectedEmployees.length === paginatedData.length && paginatedData.length > 0}
                          onChange={handleSelectAll}
                          className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                        />
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        Employee
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        Employee ID
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        Check-in
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        Check-out
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        Attendance Type
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        Location
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        Status
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280]" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((employee) => (
                      <tr key={employee.id} className="border-b border-[#E0E0E0] hover:bg-[#F9FAFB]">
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={() => handleCheckboxChange(employee.id)}
                            className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                          />
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-left" style={{ whiteSpace: 'nowrap' }}>
                          <div className="flex items-center gap-[8px]">
                            <img
                              src={employee.photo}
                              alt={employee.name}
                              className="w-[28px] h-[28px] rounded-full object-cover flex-shrink-0"
                            />
                            <span className="text-[14px] text-[#333333]" style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                              {employee.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[14px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {employee.employeeId}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[14px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {employee.checkIn}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[14px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {employee.checkOut}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[14px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {employee.attendanceType}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[14px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {employee.location}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span
                            className="text-[14px] inline-block"
                            style={{
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              color: '#333333'
                            }}
                          >
                            {employee.status}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <div className="flex items-center justify-center gap-0">
                            <button
                              onClick={() => {
                                setSelectedEmployeeForDetails(employee);
                                setShowAttendanceDetailsModal(true);
                              }}
                              className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity"
                              title="View"
                            >
                              <img src={ViewIcon} alt="View" className="w-full h-full object-contain" />
                            </button>
                            <div className="w-[1px] h-[22px] bg-[#E0E0E0] mx-[8px]"></div>
                            <button
                              onClick={() => {
                                setEmployeeToDelete(employee);
                                setShowWarningModal(true);
                              }}
                              className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity"
                              title="Delete"
                            >
                              <img src={DeleteIcon} alt="Delete" className="w-full h-full object-contain" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredData.length > 0 && (
                <div className="border-t border-[#E0E0E0] px-[20px] py-[16px] flex items-center justify-center gap-[8px]">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
                    style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    <svg className="w-[16px] h-[16px] text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.max(3, totalPages) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        if (page <= totalPages) {
                          setCurrentPage(page);
                        }
                      }}
                      className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-[14px] transition-colors bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA] ${currentPage === page
                          ? 'font-semibold'
                          : ''
                        }`}
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: currentPage === page ? 600 : 400,
                        color: currentPage === page ? '#474747' : '#827F7F',
                        cursor: 'pointer'
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => {
                      const maxPages = Math.max(3, totalPages);
                      setCurrentPage(prev => Math.min(maxPages, prev + 1));
                    }}
                    className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
                    style={{ opacity: currentPage >= Math.max(3, totalPages) ? 0.5 : 1, cursor: currentPage >= Math.max(3, totalPages) ? 'not-allowed' : 'pointer' }}
                  >
                    <svg className="w-[16px] h-[16px] text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            )}
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
                className="flex items-center gap-[8px] cursor-pointer"
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
            userRole={effectiveRole}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isMobile={true}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </div>

        {/* Mobile Content */}
        <div className="p-[16px]">
          {/* Page Header */}
          <div className="mb-[16px]">
            <h1 className="text-[20px] font-semibold text-[#000000] mb-[4px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Daily Attendance
            </h1>
            <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              View & manage today's attendance across all employee
            </p>
          </div>

          {/* Summary Cards - Mobile */}
          <div className="flex flex-col gap-[12px] mb-[16px]">
            {/* Present Today Card */}
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] p-[16px] flex items-center justify-between">
              <div className="flex items-center gap-[12px]">
                <div
                  style={{
                    backgroundColor: '#7AC1BB',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <img src={AttendanceIcon} alt="Present" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#00675E]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    {summaryStats.present}
                  </p>
                  <p className="text-[12px] text-[#3F817C]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    Present Today
                  </p>
                </div>
              </div>
            </div>

            {/* Absent Today Card */}
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] p-[16px] flex items-center justify-between">
              <div className="flex items-center gap-[12px]">
                <div
                  style={{
                    backgroundColor: '#7AC1BB',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <img src={NotWorkingIcon} alt="Absent" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#00675E]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    {summaryStats.absent}
                  </p>
                  <p className="text-[12px] text-[#3F817C]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    Absent Today
                  </p>
                </div>
              </div>
            </div>

            {/* Late Arrivals Card */}
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] p-[16px] flex items-center justify-between">
              <div className="flex items-center gap-[12px]">
                <div
                  style={{
                    backgroundColor: '#7AC1BB',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <img src={HurryIcon} alt="Late" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#00675E]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    {summaryStats.lateArrivals}
                  </p>
                  <p className="text-[12px] text-[#3F817C]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    Late Arrivals
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters - Mobile */}
          <div className="flex flex-col gap-[12px] mb-[16px]">
            {/* Date Picker */}
            <div className="relative">
              <input
                type="date"
                ref={dateInputRef}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setSelectedDate(newDate);
                }}
              />
              <div
                className="w-full h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between cursor-pointer"
                onClick={() => {
                  if (dateInputRef.current && dateInputRef.current.showPicker) {
                    dateInputRef.current.showPicker();
                  } else if (dateInputRef.current) {
                    dateInputRef.current.click();
                  }
                }}
              >
                <span className="text-[14px] text-[#000000]" style={{ fontWeight: 600 }}>
                  {formatDate(selectedDate)}
                </span>
                <svg
                  className="w-[20px] h-[20px] text-[#9CA3AF]"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            {/* Locations Dropdown */}
            <div className="relative" ref={locationDropdownRef}>
              <button
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className="w-full h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between gap-[8px] cursor-pointer"
              >
                <span className="text-[14px] text-[#000000]" style={{ fontWeight: 600 }}>
                  {selectedLocation}
                </span>
                <svg className="w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-10">
                  {locationOptions.map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        setSelectedLocation(location);
                        setIsLocationDropdownOpen(false);
                      }}
                      className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[10px] last:rounded-b-[10px]"
                      style={{ fontWeight: 400 }}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between gap-[8px] cursor-pointer"
              >
                <span className="text-[14px] text-[#000000]" style={{ fontWeight: 600 }}>
                  {selectedStatus}
                </span>
                <svg className="w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-10">
                  {["All Status", "Present", "Absent", "Late", "In progress", "Missing Check-out"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setIsStatusDropdownOpen(false);
                      }}
                      className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[10px] last:rounded-b-[10px]"
                      style={{ fontWeight: 400 }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or ID"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
                style={{ fontWeight: 400 }}
              />
            </div>
          </div>

          {/* Attendance Cards - Mobile */}
          <div className="flex flex-col gap-[12px]">
            {paginatedData.map((employee) => (
              <div key={employee.id} className="bg-white rounded-[10px] border border-[#E0E0E0] shadow-sm p-[16px]">
                <div className="flex items-start justify-between mb-[12px]">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[40px] h-[40px] rounded-full bg-[#E5E7EB] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#111827] mb-[2px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                        {employee.name}
                      </p>
                      <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                        #{employee.employeeId}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <button
                      onClick={() => {
                        setSelectedEmployeeForDetails(employee);
                        setShowAttendanceDetailsModal(true);
                      }}
                      className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
                    >
                      <img src={ViewIcon} alt="View" className="w-[16px] h-[16px] object-contain" />
                    </button>
                    <button
                      onClick={() => {
                        setEmployeeToDelete(employee);
                        setShowWarningModal(true);
                      }}
                      className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
                    >
                      <img src={DeleteIcon} alt="Delete" className="w-[16px] h-[16px] object-contain" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-[8px] mb-[12px]">
                  <span className="inline-block px-[12px] py-[4px] rounded-[6px] bg-[#E0F2FE] text-[#0369A1] text-[12px] font-medium" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {employee.attendanceType}
                  </span>
                  <span className={`inline-block px-[12px] py-[4px] rounded-[6px] text-[12px] font-medium ${employee.status === 'Present' ? 'bg-[#D1FAE5] text-[#065F46]' :
                      employee.status === 'Absent' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                        employee.status === 'Late' ? 'bg-[#FEF3C7] text-[#92400E]' :
                          'bg-[#E0E7FF] text-[#3730A3]'
                    }`} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {employee.status}
                  </span>
                </div>
                <div className="space-y-[4px]">
                  <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    <span className="font-medium text-[#374151]">Check-in:</span> {employee.checkIn}
                  </p>
                  <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    <span className="font-medium text-[#374151]">Check-out:</span> {employee.checkOut}
                  </p>
                  <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    <span className="font-medium text-[#374151]">Location:</span> {employee.location}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State - Mobile */}
          {paginatedData.length === 0 && (
            <div className="py-[60px] text-center">
              <p className="text-[16px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                No attendance records found
              </p>
            </div>
          )}

          {/* Pagination - Mobile */}
          {filteredData.length > 0 && (
            <div className="mt-[24px] flex items-center justify-center gap-[8px]">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
                style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <svg className="w-[16px] h-[16px] text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page Numbers */}
              {Array.from({ length: Math.max(3, totalPages) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    if (page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-[14px] transition-colors bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA] ${currentPage === page
                      ? 'font-semibold'
                      : ''
                    }`}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: currentPage === page ? 600 : 400,
                    color: currentPage === page ? '#474747' : '#827F7F',
                    cursor: 'pointer'
                  }}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => {
                  const maxPages = Math.max(3, totalPages);
                  setCurrentPage(prev => Math.min(maxPages, prev + 1));
                }}
                className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
                style={{ opacity: currentPage >= Math.max(3, totalPages) ? 0.5 : 1, cursor: currentPage >= Math.max(3, totalPages) ? 'not-allowed' : 'pointer' }}
              >
                <svg className="w-[16px] h-[16px] text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Details Modal */}
      {showAttendanceDetailsModal && selectedEmployeeForDetails && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowAttendanceDetailsModal(false);
            setSelectedEmployeeForDetails(null);
          }}
        >
          <div
            className="bg-white rounded-[10px] relative mx-[16px] w-full max-w-[500px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-[32px] py-[24px] flex items-center justify-between border-b border-[#E0E0E0]">
              <h2
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '24px',
                  color: '#003934'
                }}
              >
                Attendance Details
              </h2>
              <button
                onClick={() => {
                  setShowAttendanceDetailsModal(false);
                  setSelectedEmployeeForDetails(null);
                }}
                className="w-[32px] h-[32px] rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] flex items-center justify-center transition-colors"
              >
                <svg className="w-[16px] h-[16px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-[32px]">
              {/* Profile Picture */}
              <div className="flex justify-center mb-[24px]">
                <img
                  src={selectedEmployeeForDetails.photo}
                  alt={selectedEmployeeForDetails.name}
                  className="w-[120px] h-[120px] rounded-full object-cover"
                />
              </div>

              {/* Employee Information */}
              <div className="space-y-[16px]">
                {/* Name */}
                <div className="flex items-center gap-[12px]">
                  <img src={ProfileIcon} alt="Profile" className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                  <p className="text-[14px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    <span style={{ color: '#4E4E4E', fontWeight: 400 }}>Name : </span>
                    <span style={{ color: '#898989', fontWeight: 600 }}>{selectedEmployeeForDetails.name}</span>
                  </p>
                </div>

                {/* Employee ID */}
                <div className="flex items-center gap-[12px]">
                  <img src={IdIcon} alt="ID" className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                  <p className="text-[14px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    <span style={{ color: '#4E4E4E', fontWeight: 400 }}>Emp ID : </span>
                    <span style={{ color: '#898989', fontWeight: 600 }}>#{selectedEmployeeForDetails.employeeId}</span>
                  </p>
                </div>

                {/* Date */}
                <div className="flex items-center gap-[12px]">
                  <img src={DateIcon} alt="Date" className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                  <p className="text-[14px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    <span style={{ color: '#4E4E4E', fontWeight: 400 }}>Date : </span>
                    <span style={{ color: '#898989', fontWeight: 600 }}>{formatDate(selectedDate)}</span>
                  </p>
                </div>

                {/* Check-in / Check-out */}
                <div className="flex items-center gap-[12px]">
                  <img src={CheckmarkIcon} alt="Check" className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                  <p className="text-[14px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    <span style={{ color: '#4E4E4E', fontWeight: 400 }}>Check-in / Check-out : </span>
                    <span style={{ color: '#898989', fontWeight: 600 }}>{selectedEmployeeForDetails.checkIn} - {selectedEmployeeForDetails.checkOut}</span>
                  </p>
                </div>

                {/* Location */}
                <div className="flex items-center gap-[12px]">
                  <img src={LocationIcon} alt="Location" className="w-[20px] h-[20px] object-contain flex-shrink-0" />
                  <p className="text-[14px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    <span style={{ color: '#4E4E4E', fontWeight: 400 }}>Location : </span>
                    <span style={{ color: '#898989', fontWeight: 600 }}>{selectedEmployeeForDetails.location}</span>
                  </p>
                </div>

                {/* GPS Verified */}
                {selectedEmployeeForDetails.attendanceType === "GPS" && (
                  <div className="flex items-center gap-[12px]">
                    <svg className="w-[20px] h-[20px] text-[#DC2626] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-[14px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      <span style={{ color: '#4E4E4E', fontWeight: 400 }}>GPS Verified</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-[32px]">
                <button
                  type="button"
                  onClick={() => {
                    setEmployeeToDelete(selectedEmployeeForDetails);
                    setShowAttendanceDetailsModal(false);
                    setSelectedEmployeeForDetails(null);
                    setShowWarningModal(true);
                  }}
                  className="focus:outline-none"
                  style={{
                    width: '100px',
                    height: '34px',
                    borderRadius: '5px',
                    backgroundColor: 'white',
                    color: '#DC2626',
                    border: '1px solid #DC2626',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '100%',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                  }}
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAttendanceDetailsModal(false);
                    setSelectedEmployeeForDetails(null);
                  }}
                  className="focus:outline-none"
                  style={{
                    width: '100px',
                    height: '34px',
                    borderRadius: '5px',
                    backgroundColor: 'white',
                    color: '#737373',
                    border: '1px solid #E0E0E0',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '16px',
                    lineHeight: '100%',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarningModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowWarningModal(false);
            setEmployeeToDelete(null);
          }}
        >
          <div
            className="bg-white shadow-lg relative"
            style={{
              width: '469px',
              height: '290px',
              background: 'linear-gradient(180deg, #FFDBDB 0%, #FFFFFF 100%)',
              borderRadius: '0px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="flex justify-center pt-[40px] pb-[20px]">
              <img src={WarningIcon} alt="Warning" className="w-[73px] h-[61px] object-contain" />
            </div>

            {/* Warning Text */}
            <div className="text-center pb-[20px]">
              <p
                style={{
                  fontFamily: 'Libre Caslon Text, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#B70B0B',
                  textAlign: 'center'
                }}
              >
                Warning
              </p>
            </div>

            {/* Main Question */}
            <div className="text-center pb-[4px] px-[20px]">
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#000000',
                  textAlign: 'center'
                }}
              >
                Are you Sure to delete this Employee Attendance ?
              </p>
            </div>

            {/* Sub-message */}
            <div className="text-center pb-[40px] px-[20px]">
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '10px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#4E4E4E',
                  textAlign: 'center'
                }}
              >
                This action can't be undone
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-[20px] px-[20px]">
              <button
                onClick={() => {
                  if (employeeToDelete?.id) {
                    deleteAttendance(employeeToDelete.id)
                      .then(() => refreshDailyAttendance())
                      .catch(() => {});
                  }
                  setShowWarningModal(false);
                  setEmployeeToDelete(null);
                }}
                className="text-white focus:outline-none"
                style={{
                  width: '144px',
                  height: '34px',
                  borderRadius: '0px',
                  backgroundColor: '#A20000',
                  border: '1px solid #B5B1B1',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  lineHeight: '100%',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                }}
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  setEmployeeToDelete(null);
                }}
                className="text-white focus:outline-none"
                style={{
                  width: '144px',
                  height: '34px',
                  borderRadius: '0px',
                  backgroundColor: '#7A7A7A',
                  border: '1px solid #B5B1B1',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  lineHeight: '100%',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyAttendancePage;

