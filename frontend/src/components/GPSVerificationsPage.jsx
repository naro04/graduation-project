import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// GPS Verification icons
const GPSLogIcon = new URL("../images/icons/gps1.png", import.meta.url).href;
const VerifiedIcon = new URL("../images/icons/Attendance1.png", import.meta.url).href;
const SuspiciousIcon = new URL("../images/icons/gps2.png", import.meta.url).href;

// Employee Photos
const AmalAhmedPhoto = new URL("../images/Amal Ahmed.png", import.meta.url).href;
const AmeerJamalPhoto = new URL("../images/Ameer Jamal.jpg", import.meta.url).href;
const HasanJaberPhoto = new URL("../images/Hasan Jaber.jpg", import.meta.url).href;
const RaniaAbedPhoto = new URL("../images/Rania Abed.jpg", import.meta.url).href;

// Action icons
const ViewIcon = new URL("../images/icons/eye.png", import.meta.url).href;
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;
const ExportIcon = new URL("../images/icons/export.png", import.meta.url).href;
const WarningIcon = new URL("../images/icons/warnning.png", import.meta.url).href;

const GPSVerificationsPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("3-2");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 11, 7)); // December 7, 2025
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isExportAllDropdownOpen, setIsExportAllDropdownOpen] = useState(false);
  const [isExportSelectedDropdownOpen, setIsExportSelectedDropdownOpen] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dateInputRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const exportAllDropdownRef = useRef(null);
  const exportSelectedDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const pageContentRef = useRef(null);
  const mobileContentRef = useRef(null);

  // Scroll to top on mount
  useEffect(() => {
    // Force scroll to top on component mount
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      if (pageContentRef.current) {
        pageContentRef.current.scrollTop = 0;
      }
      if (mobileContentRef.current) {
        mobileContentRef.current.scrollTop = 0;
      }
    };

    // Scroll immediately
    scrollToTop();

    // Also scroll after a small delay to ensure DOM is ready
    const timeoutId = setTimeout(scrollToTop, 100);

    return () => clearTimeout(timeoutId);
  }, []);


  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Sample GPS verification data
  const gpsData = [
    {
      id: 1,
      name: "Ameer Jamal",
      employeeId: "45678",
      checkIn: "08:00 Am",
      location: "Hattin School",
      distanceDifference: "51 m",
      status: "Verified",
      photo: AmeerJamalPhoto
    },
    {
      id: 2,
      name: "Amal Ahmed",
      employeeId: "25896",
      checkIn: "08:05 Am",
      location: "School A",
      distanceDifference: "150 m",
      status: "Suspicious",
      photo: AmalAhmedPhoto
    },
    {
      id: 3,
      name: "Hasan Jaber",
      employeeId: "36258",
      checkIn: "08:02 Am",
      location: "School B",
      distanceDifference: "-",
      status: "Not Verified",
      photo: HasanJaberPhoto
    },
    {
      id: 4,
      name: "Rania Abed",
      employeeId: "98745",
      checkIn: "10:02 Am",
      location: "School C",
      distanceDifference: "205 m",
      status: "Rejected",
      photo: RaniaAbedPhoto
    }
  ];

  // Summary statistics
  const summaryStats = {
    totalGPSLog: 27,
    verifiedLogs: 2,
    suspiciousLogs: 1
  };

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
  }, [isStatusDropdownOpen, isExportAllDropdownOpen, isExportSelectedDropdownOpen, isUserDropdownOpen]);

  // Filter data based on search and status
  const filteredData = gpsData.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId.includes(searchQuery);
    const matchesStatus = selectedStatus === "All Status" || employee.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        /* Hide scrollbar for user dropdown */
        .user-dropdown-menu {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .user-dropdown-menu::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar Component */}
        <Sidebar
          userRole={userRole}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-[#F5F7FA]" style={{ minWidth: 0, maxWidth: '100%' }}>
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
                    <div className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50">
                      <div className="px-[16px] py-[8px]">
                        <p className="text-[12px] text-[#6B7280]">elijlafiras@gmail.com</p>
                      </div>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors"
                      >
                        Edit Profile
                      </button>
                      <div className="h-[1px] bg-[#DC2626] my-[4px]"></div>
                      <button
                        onClick={() => {
                          console.log('Logging out...');
                          navigate('/login');
                          setIsUserDropdownOpen(false);
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
                <span style={{ color: '#8E8C8C' }}>GPS Verifications</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div ref={pageContentRef} className="flex-1 p-[36px] bg-[#F5F7FA] overflow-y-auto" style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
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
                    GPS Verifications
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
                    Review & verify GPS check-ins for all field employees
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
              {/* Total GPS Log Today Card */}
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
                  <img src={GPSLogIcon} alt="GPS Log" style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }} />
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
                    {summaryStats.totalGPSLog}
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
                    Total GPS Log Today
                  </p>
                </div>
              </div>

              {/* Verified Logs Card */}
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
                  <img src={VerifiedIcon} alt="Verified" style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }} />
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
                    {summaryStats.verifiedLogs}
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
                    Verified Logs
                  </p>
                </div>
              </div>

              {/* Suspicious Logs Card */}
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
                  <img src={SuspiciousIcon} alt="Suspicious" style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }} />
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
                    {summaryStats.suspiciousLogs}
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
                    Suspicious Logs
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
                    {["All Status", "Verified", "Suspicious", "Not Verified", "Rejected"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full px-[16px] py-[12px] text-left text-[14px] transition-colors cursor-pointer first:rounded-t-[10px] last:rounded-b-[10px] ${selectedStatus === status
                          ? 'bg-[#E5E7EB] text-[#000000]'
                          : 'bg-white text-[#374151] hover:bg-[#F5F7FA]'
                          }`}
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400
                        }}
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

            {/* Table */}
            <div className="bg-white rounded-[10px] overflow-hidden" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      <th className="px-[12px] py-[12px] text-center text-[12px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
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
                        Location
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>
                        Distance difference
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
                            {employee.location}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[14px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {employee.distanceDifference}
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
                                navigate('/attendance/gps-location', {
                                  state: {
                                    employee: employee,
                                    date: selectedDate
                                  }
                                });
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

            {/* User Avatar */}
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
                <svg
                  className={`w-[12px] h-[12px] text-[#6B7280] transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div
                  className="user-dropdown-menu absolute right-0 top-full mt-[8px] bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg min-w-[180px] z-50"
                  style={{
                    overflow: 'visible',
                    maxHeight: 'none',
                    height: 'auto'
                  }}
                >
                  <div className="px-[16px] py-[8px] border-b border-[#E0E0E0]">
                    <p className="text-[12px] font-medium text-[#333333]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      elijafiras@gmail.com
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full px-[16px] py-[12px] text-left text-[13px] text-[#333333] hover:bg-[#F5F7FA] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => {
                      console.log('Logging out...');
                      navigate('/login');
                      setIsUserDropdownOpen(false);
                    }}
                    className="w-full px-[16px] py-[12px] text-left text-[13px] text-[#DC2626] hover:bg-[#FEE2E2] transition-colors rounded-b-[10px]"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
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
          />
        </div>

        {/* Mobile Content */}
        <div ref={mobileContentRef} className="p-[16px] overflow-y-auto" style={{ height: 'calc(100vh - 70px)', overflowX: 'hidden' }}>
          {/* Page Header */}
          <div className="mb-[16px]">
            <h1 className="text-[20px] font-semibold text-[#000000] mb-[4px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              GPS Verifications
            </h1>
            <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              Review & verify GPS check-ins for all field employees
            </p>
          </div>

          {/* Summary Cards - Mobile */}
          <div className="flex flex-col gap-[12px] mb-[16px]">
            {/* Total GPS Log Card */}
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
                  <img src={GPSLogIcon} alt="GPS Log" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#00675E]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    {summaryStats.totalGPSLog}
                  </p>
                  <p className="text-[12px] text-[#3F817C]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    Total GPS Log Today
                  </p>
                </div>
              </div>
            </div>

            {/* Verified Logs Card */}
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
                  <img src={VerifiedIcon} alt="Verified" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#00675E]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    {summaryStats.verifiedLogs}
                  </p>
                  <p className="text-[12px] text-[#3F817C]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    Verified Logs
                  </p>
                </div>
              </div>
            </div>

            {/* Suspicious Logs Card */}
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
                  <img src={SuspiciousIcon} alt="Suspicious" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#00675E]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                    {summaryStats.suspiciousLogs}
                  </p>
                  <p className="text-[12px] text-[#3F817C]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    Suspicious Logs
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
                  {["All Status", "Verified", "Suspicious", "Not Verified", "Rejected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full px-[16px] py-[12px] text-left text-[14px] transition-colors cursor-pointer first:rounded-t-[10px] last:rounded-b-[10px] ${selectedStatus === status
                        ? 'bg-[#E5E7EB] text-[#000000]'
                        : 'bg-white text-[#374151] hover:bg-[#F5F7FA]'
                        }`}
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400
                      }}
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

          {/* GPS Verification Cards - Mobile */}
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
                        navigate('/attendance/gps-location', {
                          state: {
                            employee: employee,
                            date: selectedDate
                          }
                        });
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
                  <span className={`inline-block px-[12px] py-[4px] rounded-[6px] text-[12px] font-medium ${employee.status === 'Verified' ? 'bg-[#D1FAE5] text-[#065F46]' :
                    employee.status === 'Suspicious' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                      employee.status === 'Not Verified' ? 'bg-[#FEF3C7] text-[#92400E]' :
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
                    <span className="font-medium text-[#374151]">Location:</span> {employee.location}
                  </p>
                  <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    <span className="font-medium text-[#374151]">Distance:</span> {employee.distanceDifference}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State - Mobile */}
          {paginatedData.length === 0 && (
            <div className="py-[60px] text-center">
              <p className="text-[16px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                No GPS verifications found
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
                Are you Sure to delete this GPS Verification?
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
                  if (employeeToDelete) {
                    console.log('Deleting employee attendance:', employeeToDelete);
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

export default GPSVerificationsPage;

