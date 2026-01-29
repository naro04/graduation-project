import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import LogoutModal from "./LogoutModal";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Action icons
const ExportIcon = new URL("../images/icons/export.png", import.meta.url).href;

// Employee Photos
const MohamedAliPhoto = new URL("../images/Ameer Jamal.jpg", import.meta.url).href;
const AmalAhmedPhoto = new URL("../images/Amal Ahmed.png", import.meta.url).href;
const AmjadSaeedPhoto = new URL("../images/Hasan Jaber.jpg", import.meta.url).href;
const JanaHassanPhoto = new URL("../images/Ameer Jamal.jpg", import.meta.url).href;

const AttendanceReportPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("7-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [fromDate, setFromDate] = useState("2025-12-12");
  const [toDate, setToDate] = useState("2025-12-19");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [isExportAllDropdownOpen, setIsExportAllDropdownOpen] = useState(false);
  const [isExportSelectedDropdownOpen, setIsExportSelectedDropdownOpen] = useState(false);
  const [isBulkActionsDropdownOpen, setIsBulkActionsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const locationDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const exportAllDropdownRef = useRef(null);
  const exportSelectedDropdownRef = useRef(null);
  const bulkActionsDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Sample attendance data
  const attendanceData = [
    {
      id: 1,
      employeeName: "Mohamed Ali",
      employeePhoto: MohamedAliPhoto,
      employeeId: "15259",
      checkIn: "08:00 Am",
      checkOut: "04:10 Pm",
      attendanceType: "Office",
      location: "Head Office",
      status: "Present"
    },
    {
      id: 2,
      employeeName: "Amal Ahmed",
      employeePhoto: AmalAhmedPhoto,
      employeeId: "25896",
      checkIn: "08:05 Am",
      checkOut: "On Duty",
      attendanceType: "GPS",
      location: "Hattin School",
      status: "In progress"
    },
    {
      id: 3,
      employeeName: "Amjad Saeed",
      employeePhoto: AmjadSaeedPhoto,
      employeeId: "14736",
      checkIn: "08:02 Am",
      checkOut: "-",
      attendanceType: "Office",
      location: "Head Office",
      status: "Missing Check-out"
    },
    {
      id: 4,
      employeeName: "Jana Hassan",
      employeePhoto: JanaHassanPhoto,
      employeeId: "85236",
      checkIn: "10:02 Am",
      checkOut: "04:20 Pm",
      attendanceType: "Office",
      location: "Head Office",
      status: "Late"
    }
  ];

  // Daily attendance data for bar chart - matching the image
  const dailyAttendanceData = [
    { day: "Sun", present: 38, late: 6, absent: 3 },
    { day: "Mon", present: 39, late: 2, absent: 1 },
    { day: "Tue", present: 35, late: 8, absent: 2 },
    { day: "Wed", present: 39, late: 4, absent: 2 },
    { day: "Thu", present: 34, late: 9, absent: 1 },
    { day: "Fri", present: 0, late: 0, absent: 0 },
    { day: "Sat", present: 0, late: 0, absent: 0 }
  ];

  // Attendance status distribution for pie chart
  const attendanceDistribution = {
    present: 89,
    late: 6,
    absent: 4,
    missingCheckout: 1
  };

  // Locations
  const locations = ["All Locations", "Head Office", "Hattin School", "Branch Office"];

  // Status options
  const statusOptions = ["All Status", "Present", "Late", "Absent", "Missing Check-out", "In progress"];

  // Handle checkbox selection
  const handleCheckboxChange = (recordId) => {
    setSelectedRecords(prev => {
      if (prev.includes(recordId)) {
        return prev.filter(id => id !== recordId);
      } else {
        return [...prev, recordId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRecords.length === paginatedData.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(paginatedData.map(r => r.id));
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setIsLocationDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (isExportAllDropdownOpen && exportAllDropdownRef.current && !exportAllDropdownRef.current.contains(event.target)) {
        setIsExportAllDropdownOpen(false);
      }
      if (isExportSelectedDropdownOpen && exportSelectedDropdownRef.current && !exportSelectedDropdownRef.current.contains(event.target)) {
        setIsExportSelectedDropdownOpen(false);
      }
      if (bulkActionsDropdownRef.current && !bulkActionsDropdownRef.current.contains(event.target)) {
        setIsBulkActionsDropdownOpen(false);
      }
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
  }, [isExportAllDropdownOpen, isExportSelectedDropdownOpen]);

  // Filter data
  const filteredData = attendanceData.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.employeeId.includes(searchQuery);
    const matchesLocation = selectedLocation === "All Locations" || record.location === selectedLocation;
    const matchesStatus = selectedStatus === "All Status" || record.status === selectedStatus;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 10;
  const actualTotalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const totalPages = Math.max(3, actualTotalPages);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Calculate max value for bar chart
  const maxBarValue = Math.max(...dailyAttendanceData.map(d => d.present + d.late + d.absent), 40);

  // Calculate pie chart segments
  const totalDistribution = attendanceDistribution.present + attendanceDistribution.late +
    attendanceDistribution.absent + attendanceDistribution.missingCheckout;
  const presentAngle = (attendanceDistribution.present / totalDistribution) * 360;
  const lateAngle = (attendanceDistribution.late / totalDistribution) * 360;
  const absentAngle = (attendanceDistribution.absent / totalDistribution) * 360;
  const missingCheckoutAngle = (attendanceDistribution.missingCheckout / totalDistribution) * 360;

  // Calculate cumulative angles for pie chart
  // From the image: Present (89%) starts from left and fills most of the circle
  // Small segments (Late 6%, Absent 4%, Missing Check-out 1%) are clustered on the right side
  // We want small segments to appear from 3 o'clock (90°) to 12 o'clock (0°) going clockwise
  // But we only have 11% = 39.6 degrees total for small segments
  // So we'll place them starting from 90° going counter-clockwise to fit on the right:
  // Missing Check-out (1% = 3.6°): ends at 90, starts at 90 - 3.6 = 86.4
  // Absent (4% = 14.4°): ends at 86.4, starts at 86.4 - 14.4 = 72
  // Late (6% = 21.6°): ends at 72, starts at 72 - 21.6 = 50.4
  // Present (89% = 320.4°): starts at 50.4 - 320.4 = -270 = 90 (wraps around, but we want it to start from left)

  // Actually, let's work backwards from where we want Present to end
  // We want small segments on the right (from 90° to ~50°), so Present should end at 50.4
  // If Present is 320.4° and ends at 50.4, it starts at: 50.4 - 320.4 = -270 = 90
  // But we want Present to start from left (-180), so let's adjust:
  // If Present starts from -180 and is 320.4°, it ends at -180 + 320.4 = 140.4
  // To make it end at 50.4, we need to start from: 50.4 - 320.4 = -270 = 90
  // That doesn't work...

  // Position small segments on the right side (shifted down even more)
  // Small segments: 11% = 39.6° total
  // Missing Check-out (1% = 3.6°), Absent (4% = 14.4°), Late (6% = 21.6°)
  // Shift them down by starting from a lower angle (from ~-20° to ~20° instead of 50.4° to 90°)
  const smallSegmentsStartAngle = -20; // Shifted down even more from -10° to -20°
  const missingCheckoutStartAngle = smallSegmentsStartAngle;
  const absentStartAngle = missingCheckoutStartAngle + missingCheckoutAngle;
  const lateStartAngle = absentStartAngle + absentAngle;
  const presentStartAngle = lateStartAngle + lateAngle; // Present starts after small segments

  // Helper function to convert angle to coordinates
  const getCoordinates = (angle, radius) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: 100 + radius * Math.cos(rad),
      y: 100 + radius * Math.sin(rad)
    };
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          window.location.href = "/login";
        }}
      />
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
                        <p className="text-[16px] font-semibold text-[#333333]">Hi, Firas!</p>
                        <img
                          src={DropdownArrow}
                          alt=""
                          className={`w-[14px] h-[14px] object-contain transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <p className="text-[12px] font-normal text-[#6B7280]">{roleDisplayNames[userRole]}</p>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
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
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsLogoutModalOpen(true);
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
                <span style={{ color: '#B0B0B0' }}>Reports</span>
                <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
                <span style={{ color: '#8E8C8C' }}>Attendance Reports</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
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
                    Attendance Reports
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
                    Track daily attendance and check-in behavior
                  </p>
                </div>
                <div className="relative flex-shrink-0" style={{ marginTop: '48px' }} ref={exportAllDropdownRef}>
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
                      whiteSpace: 'nowrap'
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

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[32px]">
              {/* Daily Attendance Bar Chart */}
              <div className="bg-white rounded-[10px] p-[20px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #888888' }}>
                <h3
                  className="text-[16px] font-semibold mb-[20px] text-left"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    lineHeight: '100%',
                    color: '#000000'
                  }}
                >
                  Daily Attendance
                </h3>

                <div className="relative" style={{ height: '250px' }}>
                  {/* Y-axis Labels */}
                  <div className="absolute left-0 top-0 bottom-[30px] flex flex-col justify-between" style={{ width: '30px' }}>
                    {[40, 30, 20, 10, 0].map((value) => (
                      <div
                        key={value}
                        className="text-right pr-[8px]"
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

                  {/* Chart Area */}
                  <div className="ml-[40px] relative" style={{ height: '100%', paddingBottom: '30px' }}>
                    {/* Grid Lines */}
                    <svg className="absolute inset-0" style={{ width: '100%', height: 'calc(100% - 30px)' }} preserveAspectRatio="none">
                      {[40, 30, 20, 10, 0].map((value, index) => {
                        const y = (index / 4) * 100;
                        return (
                          <line
                            key={value}
                            x1="0"
                            y1={`${y}%`}
                            x2="100%"
                            y2={`${y}%`}
                            stroke="#A0A0A0"
                            strokeWidth="1"
                          />
                        );
                      })}
                    </svg>

                    {/* Bars - Grouped Bars */}
                    <div className="absolute inset-0 flex items-end justify-start" style={{ height: 'calc(100% - 30px)', paddingLeft: '8px', paddingRight: '8px', gap: '8px' }}>
                      {dailyAttendanceData.map((data, dayIndex) => {
                        const availableWidth = 'calc(100% - 16px)'; // subtract padding
                        const gapTotal = 8 * 6; // 6 gaps between 7 items
                        const dayWidth = `calc((${availableWidth} - ${gapTotal}px) / 7)`;

                        // Function to convert value (0-40) to percentage height
                        const valueToHeight = (value) => {
                          if (value === 0) return 0;
                          return (value / 40) * 100;
                        };

                        return (
                          <div key={dayIndex} className="flex items-end justify-center gap-[2px]" style={{ width: dayWidth, height: '100%', flexShrink: 0 }}>
                            {/* Present Bar */}
                            {data.present > 0 && (
                              <div
                                style={{
                                  width: 'calc(35% - 1px)',
                                  height: `${valueToHeight(data.present)}%`,
                                  backgroundColor: '#00564F',
                                  borderRadius: '2px 2px 0 0',
                                  minHeight: data.present > 0 ? '2px' : '0'
                                }}
                              />
                            )}
                            {/* Late Bar */}
                            {data.late > 0 && (
                              <div
                                style={{
                                  width: 'calc(35% - 1px)',
                                  height: `${valueToHeight(data.late)}%`,
                                  backgroundColor: '#8CCCC6',
                                  borderRadius: '2px 2px 0 0',
                                  minHeight: data.late > 0 ? '2px' : '0'
                                }}
                              />
                            )}
                            {/* Absent Bar */}
                            {data.absent > 0 && (
                              <div
                                style={{
                                  width: 'calc(35% - 1px)',
                                  height: `${valueToHeight(data.absent)}%`,
                                  backgroundColor: '#626262',
                                  borderRadius: '2px 2px 0 0',
                                  minHeight: data.absent > 0 ? '2px' : '0'
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* X-axis Labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ height: '30px' }}>
                      {dailyAttendanceData.map((data) => (
                        <div
                          key={data.day}
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
                          {data.day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-[32px] mt-[16px]">
                  <div className="flex items-center gap-[12px]">
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{ width: '14px', height: '14px', backgroundColor: '#00564F' }}
                    ></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#333333' }}>Present</span>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{ width: '14px', height: '14px', backgroundColor: '#8CCCC6' }}
                    ></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#333333' }}>Late</span>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{ width: '14px', height: '14px', backgroundColor: '#626262' }}
                    ></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#333333' }}>Absent</span>
                  </div>
                </div>
              </div>

              {/* Attendance Status Distribution Pie Chart */}
              <div className="bg-white rounded-[10px] p-[20px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #888888' }}>
                <h3
                  className="text-[16px] font-semibold mb-[20px] text-left"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    lineHeight: '100%',
                    color: '#000000'
                  }}
                >
                  Attendance Status Distribution
                </h3>

                <div className="flex items-center justify-center gap-[40px]" style={{ height: '250px' }}>
                  <div className="relative flex-shrink-0" style={{ width: '200px', height: '200px' }}>
                    <svg width="200" height="200" viewBox="0 0 200 200">
                      {/* Present Segment */}
                      {(() => {
                        const start = getCoordinates(presentStartAngle, 80);
                        const end = getCoordinates(presentStartAngle + presentAngle, 80);
                        return (
                          <path
                            d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${presentAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                            fill="#00564F"
                          />
                        );
                      })()}

                      {/* Late Segment */}
                      {(() => {
                        const start = getCoordinates(lateStartAngle, 80);
                        const end = getCoordinates(lateStartAngle + lateAngle, 80);
                        return (
                          <path
                            d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${lateAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                            fill="#8CCCC6"
                          />
                        );
                      })()}

                      {/* Absent Segment */}
                      {(() => {
                        const start = getCoordinates(absentStartAngle, 80);
                        const end = getCoordinates(absentStartAngle + absentAngle, 80);
                        return (
                          <path
                            d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${absentAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                            fill="#626262"
                          />
                        );
                      })()}

                      {/* Missing Check-out Segment */}
                      {(() => {
                        const start = getCoordinates(missingCheckoutStartAngle, 80);
                        const end = getCoordinates(missingCheckoutStartAngle + missingCheckoutAngle, 80);
                        return (
                          <path
                            d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${missingCheckoutAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                            fill="#670505"
                          />
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Labels - Ordered according to the pie chart colors */}
                  <div className="flex flex-col justify-center gap-[12px]">
                    {/* 1. Present (89%) - Dark Teal - starts from left */}
                    <div className="flex items-center gap-[8px]">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00564F' }}></div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#00564F' }}>
                        {attendanceDistribution.present}% Present
                      </span>
                    </div>
                    {/* 2. Missing Check-out (1%) - Dark Red - top right */}
                    <div className="flex items-center gap-[8px]">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#670505' }}></div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#670505' }}>
                        {attendanceDistribution.missingCheckout}% Missing Check-out
                      </span>
                    </div>
                    {/* 3. Absent (4%) - Dark Gray - middle right */}
                    <div className="flex items-center gap-[8px]">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#626262' }}></div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#626262' }}>
                        {attendanceDistribution.absent}% Absent
                      </span>
                    </div>
                    {/* 4. Late (6%) - Light Teal - bottom right */}
                    <div className="flex items-center gap-[8px]">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8CCCC6' }}></div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#8CCCC6' }}>
                        {attendanceDistribution.late}% Late
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-[16px] mb-[24px] flex-wrap">
              {/* From Date */}
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-[16px] py-[10px] pr-[16px] rounded-[5px] border border-[#E0E0E0] bg-white focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#000000',
                    minWidth: '160px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
              </div>

              {/* To Date */}
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate}
                  className="px-[16px] py-[10px] pr-[16px] rounded-[5px] border border-[#E0E0E0] bg-white focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#000000',
                    minWidth: '160px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
              </div>

              {/* Location Dropdown */}
              <div className="relative" ref={locationDropdownRef}>
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between min-w-[160px] hover:border-[#004D40] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#000000' }}
                >
                  <span>{selectedLocation}</span>
                  <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isLocationDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10 min-w-[160px]">
                    {locations.map((location) => (
                      <button
                        key={location}
                        onClick={() => {
                          setSelectedLocation(location);
                          setIsLocationDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full px-[16px] py-[10px] text-left transition-colors ${selectedLocation === location
                          ? 'bg-[#E5E7EB] text-[#333333]'
                          : 'text-[#333333] hover:bg-[#F5F7FA]'
                          } first:rounded-t-[5px] last:rounded-b-[5px]`}
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400
                        }}
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
                  className="px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between min-w-[140px] hover:border-[#004D40] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#000000' }}
                >
                  <span>{selectedStatus}</span>
                  <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10 min-w-[140px]">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setIsStatusDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full px-[16px] py-[10px] text-left transition-colors ${selectedStatus === status
                          ? 'bg-[#E5E7EB] text-[#333333]'
                          : 'text-[#333333] hover:bg-[#F5F7FA]'
                          } first:rounded-t-[5px] last:rounded-b-[5px]`}
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search by name or ID */}
              <div className="relative flex-1 min-w-[200px]">
                <svg className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or ID"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-[40px] pl-[36px] pr-[16px] rounded-[5px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{ fontWeight: 400 }}
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedRecords.length > 0 && (
              <div className="mb-[20px] bg-white rounded-[10px] p-[16px] flex items-center gap-[16px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #B5B1B1' }}>
                <div className="text-[14px] text-[#333333]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                  {selectedRecords.length} selected
                </div>
                <div className="flex items-center gap-[12px]">
                  {/* Export Selected Dropdown */}
                  <div className="relative" ref={exportSelectedDropdownRef}>
                    <button
                      onClick={() => setIsExportSelectedDropdownOpen(!isExportSelectedDropdownOpen)}
                      className="px-[16px] py-[8px] rounded-[8px] border border-[#E0E0E0] bg-white flex items-center gap-[8px] hover:bg-[#F5F7FA] transition-colors"
                      style={{ fontWeight: 500, fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                    >
                      <span>Export selected</span>
                      <svg className="w-[12px] h-[12px] text-[#6B7280]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {isExportSelectedDropdownOpen && (
                      <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-20 min-w-[150px]">
                        <div className="px-[16px] py-[8px] border-b border-[#E0E0E0]">
                          <p className="text-[12px] text-[#6B7280]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>Export As:</p>
                        </div>
                        <button
                          onClick={() => {
                            console.log('Export selected as Excel', selectedRecords);
                            setIsExportSelectedDropdownOpen(false);
                          }}
                          className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[8px] last:rounded-b-[8px]"
                          style={{ fontWeight: 400, fontFamily: 'Inter, sans-serif' }}
                        >
                          Excel (xlsx)
                        </button>
                        <button
                          onClick={() => {
                            console.log('Export selected as PDF', selectedRecords);
                            setIsExportSelectedDropdownOpen(false);
                          }}
                          className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[8px] last:rounded-b-[8px]"
                          style={{ fontWeight: 400, fontFamily: 'Inter, sans-serif' }}
                        >
                          PDF
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mark as reviewed */}
                  <button
                    onClick={() => {
                      console.log('Mark as reviewed', selectedRecords);
                      setSelectedRecords([]);
                    }}
                    className="px-[16px] py-[8px] rounded-[8px] border border-[#E0E0E0] bg-white hover:bg-[#F5F7FA] transition-colors"
                    style={{ fontWeight: 500, fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                  >
                    Mark as reviewed
                  </button>
                </div>
              </div>
            )}

            {/* Attendance Table */}
            <div className="bg-white rounded-[10px] overflow-hidden" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #B5B1B1' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRecords.length === paginatedData.length && paginatedData.length > 0}
                          onChange={handleSelectAll}
                          className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                        />
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Employee
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Employee ID
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Check-in
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Check-out
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Attendance Type
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Location
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((record) => (
                        <tr key={record.id} className="border-b border-[#E0E0E0] hover:bg-[#F9FAFB]">
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <input
                              type="checkbox"
                              checked={selectedRecords.includes(record.id)}
                              onChange={() => handleCheckboxChange(record.id)}
                              className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                            />
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <div className="flex items-center justify-center gap-[12px]">
                              <img
                                src={record.employeePhoto}
                                alt={record.employeeName}
                                className="w-[32px] h-[32px] rounded-full object-cover"
                              />
                              <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                                {record.employeeName}
                              </span>
                            </div>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                              {record.employeeId}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                              {record.checkIn}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                              {record.checkOut}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                              {record.attendanceType}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                              {record.location}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span
                              className="text-[13px] inline-block px-[12px] py-[4px] rounded-[5px]"
                              style={{
                                fontWeight: 500,
                                fontSize: '13px',
                                lineHeight: '100%',
                                whiteSpace: 'nowrap',
                                color: record.status === "Present" ? '#00564F' :
                                  record.status === "Late" ? '#53A7A0' :
                                    record.status === "Missing Check-out" ? '#670505' :
                                      record.status === "In progress" ? '#4A4A4A' : '#626262',
                                backgroundColor: record.status === "Present" ? '#E9F6F8B2' :
                                  record.status === "Late" ? '#E9F6F8B2' :
                                    record.status === "Missing Check-out" ? '#FFDEDE' :
                                      record.status === "In progress" ? '#D2D2D2' : '#E5E7EB',
                                textAlign: 'center'
                              }}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-[12px] py-[40px] text-center" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#6B7280' }}>
                          No attendance records found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="flex items-center justify-center gap-[8px] mt-[24px]">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-colors bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA]"
                  style={{
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                  disabled={currentPage === 1}
                >
                  <svg className="w-[16px] h-[16px] text-[#6B7280]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      if (page <= actualTotalPages) {
                        setCurrentPage(page);
                      }
                    }}
                    className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-colors bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: currentPage === page ? 600 : 400,
                      color: currentPage === page ? '#474747' : page > actualTotalPages ? '#9CA3AF' : '#827F7F',
                      fontSize: '14px',
                      cursor: page > actualTotalPages ? 'not-allowed' : 'pointer',
                      opacity: page > actualTotalPages ? 0.5 : 1
                    }}
                    disabled={page > actualTotalPages}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(actualTotalPages, prev + 1))}
                  className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-colors bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA]"
                  style={{
                    opacity: currentPage >= actualTotalPages ? 0.5 : 1,
                    cursor: currentPage >= actualTotalPages ? 'not-allowed' : 'pointer'
                  }}
                  disabled={currentPage >= actualTotalPages}
                >
                  <svg className="w-[16px] h-[16px] text-[#6B7280]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
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
          />
        </div>

        {/* Mobile Content */}
        <div className="flex-1 p-4 pb-10">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold text-[#000000] mb-1">Attendance Reports</h1>
            <p className="text-[12px] text-[#6B7280]">Track daily attendance and check-in behavior</p>
          </div>

          {/* Charts Section - Mobile */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Daily Attendance Chart - Mobile */}
            <div className="bg-white rounded-[12px] p-4 shadow-sm border border-[#888888]">
              <h3 className="text-[14px] font-semibold mb-4 text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#000000' }}>
                Daily Attendance
              </h3>

              <div className="relative" style={{ height: '200px' }}>
                {/* Y-axis Labels */}
                <div className="absolute left-0 top-0 bottom-[30px] flex flex-col justify-between" style={{ width: '25px' }}>
                  {[40, 30, 20, 10, 0].map((value) => (
                    <div
                      key={value}
                      className="text-right pr-[4px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#727272'
                      }}
                    >
                      {value}
                    </div>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="ml-[30px] relative" style={{ height: '100%', paddingBottom: '30px' }}>
                  {/* Grid Lines */}
                  <svg className="absolute inset-0" style={{ width: '100%', height: 'calc(100% - 30px)' }} preserveAspectRatio="none">
                    {[40, 30, 20, 10, 0].map((value, index) => {
                      const y = (index / 4) * 100;
                      return (
                        <line
                          key={value}
                          x1="0"
                          y1={`${y}%`}
                          x2="100%"
                          y2={`${y}%`}
                          stroke="#A0A0A0"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>

                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end justify-start" style={{ height: 'calc(100% - 30px)', paddingLeft: '4px', paddingRight: '4px', gap: '4px' }}>
                    {dailyAttendanceData.map((data, dayIndex) => {
                      const valueToHeight = (value) => {
                        if (value === 0) return 0;
                        return (value / 40) * 100;
                      };

                      return (
                        <div key={dayIndex} className="flex items-end justify-center gap-[1px]" style={{ flex: 1, height: '100%' }}>
                          {data.present > 0 && (
                            <div
                              style={{
                                width: 'calc(35% - 0.5px)',
                                height: `${valueToHeight(data.present)}%`,
                                backgroundColor: '#00564F',
                                borderRadius: '2px 2px 0 0',
                                minHeight: data.present > 0 ? '2px' : '0'
                              }}
                            />
                          )}
                          {data.late > 0 && (
                            <div
                              style={{
                                width: 'calc(35% - 0.5px)',
                                height: `${valueToHeight(data.late)}%`,
                                backgroundColor: '#8CCCC6',
                                borderRadius: '2px 2px 0 0',
                                minHeight: data.late > 0 ? '2px' : '0'
                              }}
                            />
                          )}
                          {data.absent > 0 && (
                            <div
                              style={{
                                width: 'calc(35% - 0.5px)',
                                height: `${valueToHeight(data.absent)}%`,
                                backgroundColor: '#626262',
                                borderRadius: '2px 2px 0 0',
                                minHeight: data.absent > 0 ? '2px' : '0'
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* X-axis Labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ height: '30px' }}>
                    {dailyAttendanceData.map((data) => (
                      <div
                        key={data.day}
                        className="text-center flex items-center justify-center"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '11px',
                          fontWeight: 500,
                          color: '#827F7F',
                          width: `${100 / 7}%`
                        }}
                      >
                        {data.day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-[20px] mt-4 flex-wrap">
                <div className="flex items-center gap-[8px]">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00564F' }}></div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 400, color: '#333333' }}>Present</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8CCCC6' }}></div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 400, color: '#333333' }}>Late</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#626262' }}></div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 400, color: '#333333' }}>Absent</span>
                </div>
              </div>
            </div>

            {/* Attendance Status Distribution - Mobile */}
            <div className="bg-white rounded-[12px] p-4 shadow-sm border border-[#888888]">
              <h3 className="text-[14px] font-semibold mb-4 text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#000000' }}>
                Attendance Status Distribution
              </h3>

              <div className="flex flex-col items-center gap-4">
                <div className="relative flex-shrink-0" style={{ width: '150px', height: '150px' }}>
                  <svg width="150" height="150" viewBox="0 0 200 200">
                    {/* Present Segment */}
                    {(() => {
                      const start = getCoordinates(presentStartAngle, 80);
                      const end = getCoordinates(presentStartAngle + presentAngle, 80);
                      return (
                        <path
                          d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${presentAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                          fill="#00564F"
                        />
                      );
                    })()}

                    {/* Late Segment */}
                    {(() => {
                      const start = getCoordinates(lateStartAngle, 80);
                      const end = getCoordinates(lateStartAngle + lateAngle, 80);
                      return (
                        <path
                          d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${lateAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                          fill="#8CCCC6"
                        />
                      );
                    })()}

                    {/* Absent Segment */}
                    {(() => {
                      const start = getCoordinates(absentStartAngle, 80);
                      const end = getCoordinates(absentStartAngle + absentAngle, 80);
                      return (
                        <path
                          d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${absentAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                          fill="#626262"
                        />
                      );
                    })()}

                    {/* Missing Check-out Segment */}
                    {(() => {
                      const start = getCoordinates(missingCheckoutStartAngle, 80);
                      const end = getCoordinates(missingCheckoutStartAngle + missingCheckoutAngle, 80);
                      return (
                        <path
                          d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${missingCheckoutAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                          fill="#670505"
                        />
                      );
                    })()}
                  </svg>
                </div>

                {/* Labels */}
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-[8px]">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00564F' }}></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#00564F' }}>
                      {attendanceDistribution.present}% Present
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#670505' }}></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#670505' }}>
                      {attendanceDistribution.missingCheckout}% Missing Check-out
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#626262' }}></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#626262' }}>
                      {attendanceDistribution.absent}% Absent
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8CCCC6' }}></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#8CCCC6' }}>
                      {attendanceDistribution.late}% Late
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters - Mobile */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Date Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-[5px] border border-[#E0E0E0] bg-white text-[13px]"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#000000' }}
                />
              </div>
              <div>
                <label className="block mb-1 text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate}
                  className="w-full px-3 py-2 rounded-[5px] border border-[#E0E0E0] bg-white text-[13px]"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#000000' }}
                />
              </div>
            </div>

            {/* Location Dropdown */}
            <div className="relative" ref={locationDropdownRef}>
              <button
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between text-[14px] font-semibold text-[#000000]"
              >
                <span>{selectedLocation}</span>
                <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10">
                  {locations.map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        setSelectedLocation(location);
                        setIsLocationDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full px-[16px] py-[10px] text-left text-[14px] transition-colors ${selectedLocation === location ? 'bg-[#E5E7EB] text-[#333333]' : 'text-[#333333] hover:bg-[#F5F7FA]'
                        }`}
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
                className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between text-[14px] font-semibold text-[#000000]"
              >
                <span>{selectedStatus}</span>
                <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setIsStatusDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full px-[16px] py-[10px] text-left text-[14px] transition-colors ${selectedStatus === status ? 'bg-[#E5E7EB] text-[#333333]' : 'text-[#333333] hover:bg-[#F5F7FA]'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or ID"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-[40px] pl-[36px] pr-[16px] rounded-[5px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]"
              />
            </div>
          </div>

          {/* Attendance Cards - Mobile */}
          <div className="space-y-4">
            {paginatedData.length > 0 ? (
              paginatedData.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-[12px] p-4 shadow-md border border-[#E0E0E0]"
                >
                  {/* Header with Employee Info */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#F0F0F0]">
                    <img
                      src={record.employeePhoto}
                      alt={record.employeeName}
                      className="w-[48px] h-[48px] rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold text-[#000000] truncate">{record.employeeName}</h3>
                      <p className="text-[12px] text-[#6B7280]">ID: {record.employeeId}</p>
                    </div>
                  </div>

                  {/* Attendance Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Check-in:</span>
                      <span className="text-[13px] font-semibold text-[#000000]">{record.checkIn}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Check-out:</span>
                      <span className="text-[13px] font-semibold text-[#000000]">{record.checkOut}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Type:</span>
                      <span className="text-[13px] font-semibold text-[#000000] bg-[#F3F4F6] px-3 py-1 rounded-[6px]">{record.attendanceType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Location:</span>
                      <span className="text-[13px] font-semibold text-[#000000]">{record.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Status:</span>
                      <span
                        className="inline-block px-[14px] py-[6px] rounded-[8px] text-[13px] font-bold shadow-sm"
                        style={{
                          color: record.status === "Present" ? '#00564F' :
                            record.status === "Late" ? '#53A7A0' :
                              record.status === "Missing Check-out" ? '#670505' :
                                record.status === "In progress" ? '#4A4A4A' : '#626262',
                          backgroundColor: record.status === "Present" ? '#E9F6F8B2' :
                            record.status === "Late" ? '#E9F6F8B2' :
                              record.status === "Missing Check-out" ? '#FFDEDE' :
                                record.status === "In progress" ? '#D2D2D2' : '#E5E7EB'
                        }}
                      >
                        {record.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[12px] p-8 text-center text-[#6B7280]">
                No attendance records found
              </div>
            )}
          </div>

          {/* Mobile Pagination */}
          {filteredData.length > 0 && (
            <div className="flex items-center justify-center gap-[8px] mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
                disabled={currentPage === 1}
                style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                <svg className="w-[16px] h-[16px] text-[#000000]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18L9 12L15 6" /></svg>
              </button>
              {Array.from({ length: Math.min(totalPages, actualTotalPages) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-[14px] transition-colors bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA] ${currentPage === page ? 'font-semibold' : ''}`}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: currentPage === page ? 600 : 400,
                    color: currentPage === page ? '#474747' : '#827F7F'
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(actualTotalPages, prev + 1))}
                className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
                disabled={currentPage >= actualTotalPages}
                style={{ opacity: currentPage >= actualTotalPages ? 0.5 : 1 }}
              >
                <svg className="w-[16px] h-[16px] text-[#000000]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18L15 12L9 6" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default AttendanceReportPage;

