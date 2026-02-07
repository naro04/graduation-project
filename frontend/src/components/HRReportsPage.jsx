import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getEffectiveRole, getCurrentUser } from "../services/auth.js";
import { getHRReports } from "../services/employees";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Action icons
const ExportIcon = new URL("../images/icons/export.png", import.meta.url).href;

import LogoutModal from "./LogoutModal";
// Logout icon for modal
// const LogoutIcon2 = new URL("../images/icons/logout2.png", import.meta.url).href;

// Employee Photos
const AmeerJamalPhoto = new URL("../images/Ameer Jamal.jpg", import.meta.url).href;
const AmalAhmedPhoto = new URL("../images/Amal Ahmed.png", import.meta.url).href;
const HasanJaberPhoto = new URL("../images/Hasan Jaber.jpg", import.meta.url).href;

const HRReportsPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const effectiveRole = getEffectiveRole(userRole);
  const [activeMenu, setActiveMenu] = useState("7-4");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [fromDate, setFromDate] = useState("2025-12-12");
  const [toDate, setToDate] = useState("2025-12-19");
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [isExportAllDropdownOpen, setIsExportAllDropdownOpen] = useState(false);
  const [isExportSelectedDropdownOpen, setIsExportSelectedDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const departmentDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const exportAllDropdownRef = useRef(null);
  const exportSelectedDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const [hrReportsData, setHrReportsData] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState(null);

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      setReportsError(null);
      const data = await getHRReports({ from_date: fromDate, to_date: toDate });
      const list = Array.isArray(data) ? data : [];
      setHrReportsData(
        list.map((item) => ({
          id: item.id ?? item.employee_id,
          employeeName: item.employee_name ?? item.employeeName ?? "—",
          employeePhoto: item.avatar_url ?? item.employeePhoto ?? item.profile_image ?? AmeerJamalPhoto,
          department: item.department ?? item.department_name ?? "—",
          position: item.position ?? item.position_title ?? item.job_title ?? "—",
          attendanceRate: Number(item.attendance_rate ?? item.attendanceRate ?? 0) || 0,
          leaveDaysTaken: Number(item.leave_days_taken ?? item.leaveDaysTaken ?? item.leave_days ?? 0) || 0,
          status: item.status ?? "Active",
        }))
      );
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Failed to load HR reports";
      const isUnauth = err?.response?.status === 401;
      setReportsError(isUnauth ? "يرجى تسجيل الدخول للوصول إلى تقارير HR." : msg);
      setHrReportsData([]);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [fromDate, toDate]);

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR Admin",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Normalize department name from API to chart key
  const normalizeDeptKey = (dept) => {
    if (!dept || typeof dept !== "string") return null;
    const d = dept.toLowerCase().trim();
    if (d.includes("office")) return "office";
    if (d.includes("field")) return "fieldOperations";
    if (d.includes("finance")) return "finance";
    if (d.includes("it")) return "it";
    if (d.includes("hr") || d === "human resources") return "hr";
    if (d.includes("project")) return "projectManager";
    return null;
  };

  const deptKeyToLabel = {
    office: "Office",
    fieldOperations: "Field Operations",
    finance: "Finance",
    it: "IT",
    hr: "HR",
    projectManager: "Project Manager",
  };

  // Employee distribution by department from API (pie chart)
  const departmentDistribution = React.useMemo(() => {
    const counts = { office: 0, fieldOperations: 0, finance: 0, it: 0, hr: 0, projectManager: 0 };
    (hrReportsData || []).forEach((r) => {
      const key = normalizeDeptKey(r.department);
      if (key && counts[key] !== undefined) counts[key]++;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return { office: 0, fieldOperations: 0, finance: 0, it: 0, hr: 0, projectManager: 0 };
    return {
      office: Math.round((counts.office / total) * 100),
      fieldOperations: Math.round((counts.fieldOperations / total) * 100),
      finance: Math.round((counts.finance / total) * 100),
      it: Math.round((counts.it / total) * 100),
      hr: Math.round((counts.hr / total) * 100),
      projectManager: Math.round((counts.projectManager / total) * 100),
    };
  }, [hrReportsData]);

  // Attendance vs Leave per department from API (bar chart)
  const attendanceLeaveData = React.useMemo(() => {
    const byDept = {};
    const order = ["hr", "it", "office", "finance", "fieldOperations", "projectManager"];
    order.forEach((k) => { byDept[k] = { department: deptKeyToLabel[k], attendance: 0, leaveDays: 0, count: 0 }; });
    (hrReportsData || []).forEach((r) => {
      const key = normalizeDeptKey(r.department);
      if (key && byDept[key]) {
        byDept[key].attendance += r.attendanceRate ?? 0;
        byDept[key].leaveDays += r.leaveDaysTaken ?? 0;
        byDept[key].count++;
      }
    });
    return order.map((k) => {
      const d = byDept[k];
      const avgAtt = d.count ? Math.round(d.attendance / d.count) : 0;
      const avgLeave = d.count ? Math.round(d.leaveDays / d.count) : 0;
      return { department: d.department, attendance: avgAtt, leaveDays: Math.min(100, avgLeave * 5) };
    });
  }, [hrReportsData]);

  // Departments
  const departments = ["All Departments", "Office", "Field Operations", "Finance", "IT", "HR", "Project Manager"];

  // Status options
  const statusOptions = ["All Status", "Active", "Inactive"];

  // Calculate pie chart segments
  const totalDistribution = departmentDistribution.office + departmentDistribution.fieldOperations +
    departmentDistribution.finance + departmentDistribution.it +
    departmentDistribution.hr + departmentDistribution.projectManager;
  const safeTotal = totalDistribution || 1;
  const officeAngle = (departmentDistribution.office / safeTotal) * 360;
  const fieldOpsAngle = (departmentDistribution.fieldOperations / safeTotal) * 360;
  const financeAngle = (departmentDistribution.finance / safeTotal) * 360;
  const itAngle = (departmentDistribution.it / safeTotal) * 360;
  const hrAngle = (departmentDistribution.hr / safeTotal) * 360;
  const projectManagerAngle = (departmentDistribution.projectManager / safeTotal) * 360;

  // Calculate cumulative angles for pie chart
  const officeStartAngle = -90;
  const fieldOpsStartAngle = officeStartAngle + officeAngle;
  const financeStartAngle = fieldOpsStartAngle + fieldOpsAngle;
  const itStartAngle = financeStartAngle + financeAngle;
  const hrStartAngle = itStartAngle + itAngle;
  const projectManagerStartAngle = hrStartAngle + hrAngle;

  // Helper function to convert angle to coordinates
  const getCoordinates = (angle, radius) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: 100 + radius * Math.cos(rad),
      y: 100 + radius * Math.sin(rad)
    };
  };

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
      if (departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setIsDepartmentDropdownOpen(false);
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
  const filteredData = hrReportsData.filter(record => {
    const matchesSearch = record.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === "All Departments" || record.department === selectedDepartment;
    const matchesStatus = selectedStatus === "All Status" || record.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 10;
  const actualTotalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const totalPages = Math.max(3, actualTotalPages);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Function to convert value to height for bar chart
  const valueToHeight = (value, maxValue = 100) => {
    if (value === 0) return 0;
    return (value / maxValue) * 100;
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen" style={{ overflowX: 'hidden' }}>
        <Sidebar
          userRole={effectiveRole}
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
                <span style={{ color: '#8E8C8C' }}>HR Reports</span>
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
                    HR Reports
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
                    Analyze employee performance, attendance, and availability
                  </p>
                </div>
                <div className="relative flex-shrink-0" style={{ marginTop: '56px' }} ref={exportAllDropdownRef}>
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

            {reportsError && (
              <div className="mb-4 p-4 rounded-lg border text-sm bg-[#FEE2E2] border-[#EF4444] text-[#B91C1C]">
                {reportsError}
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[32px]">
              {/* Employee Distribution by Department (Pie Chart) */}
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
                  Employee Distribution by Department
                </h3>

                <div className="flex items-center justify-center gap-[40px]" style={{ height: '250px' }}>
                  <div className="relative flex-shrink-0" style={{ width: '200px', height: '200px' }}>
                    <svg width="200" height="200" viewBox="0 0 200 200">
                      {totalDistribution === 0 ? (
                        <>
                          <circle cx="100" cy="100" r="80" fill="#E5E7EB" />
                          <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fill: '#6B7280' }}>No data</text>
                        </>
                      ) : (
                        <>
                          {officeAngle > 0 && (
                            <path d={`M 100 100 L ${getCoordinates(officeStartAngle, 80).x} ${getCoordinates(officeStartAngle, 80).y} A 80 80 0 ${officeAngle > 180 ? 1 : 0} 1 ${getCoordinates(officeStartAngle + officeAngle, 80).x} ${getCoordinates(officeStartAngle + officeAngle, 80).y} Z`} fill="#00564F" />
                          )}
                          {fieldOpsAngle > 0 && (
                            <path d={`M 100 100 L ${getCoordinates(fieldOpsStartAngle, 80).x} ${getCoordinates(fieldOpsStartAngle, 80).y} A 80 80 0 ${fieldOpsAngle > 180 ? 1 : 0} 1 ${getCoordinates(fieldOpsStartAngle + fieldOpsAngle, 80).x} ${getCoordinates(fieldOpsStartAngle + fieldOpsAngle, 80).y} Z`} fill="#8CCCC6" />
                          )}
                          {financeAngle > 0 && (
                            <path d={`M 100 100 L ${getCoordinates(financeStartAngle, 80).x} ${getCoordinates(financeStartAngle, 80).y} A 80 80 0 ${financeAngle > 180 ? 1 : 0} 1 ${getCoordinates(financeStartAngle + financeAngle, 80).x} ${getCoordinates(financeStartAngle + financeAngle, 80).y} Z`} fill="#1B223F" />
                          )}
                          {itAngle > 0 && (
                            <path d={`M 100 100 L ${getCoordinates(itStartAngle, 80).x} ${getCoordinates(itStartAngle, 80).y} A 80 80 0 ${itAngle > 180 ? 1 : 0} 1 ${getCoordinates(itStartAngle + itAngle, 80).x} ${getCoordinates(itStartAngle + itAngle, 80).y} Z`} fill="#B1B1B1" />
                          )}
                          {hrAngle > 0 && (
                            <path d={`M 100 100 L ${getCoordinates(hrStartAngle, 80).x} ${getCoordinates(hrStartAngle, 80).y} A 80 80 0 ${hrAngle > 180 ? 1 : 0} 1 ${getCoordinates(hrStartAngle + hrAngle, 80).x} ${getCoordinates(hrStartAngle + hrAngle, 80).y} Z`} fill="#670505" />
                          )}
                          {projectManagerAngle > 0 && (
                            <path d={`M 100 100 L ${getCoordinates(projectManagerStartAngle, 80).x} ${getCoordinates(projectManagerStartAngle, 80).y} A 80 80 0 ${projectManagerAngle > 180 ? 1 : 0} 1 ${getCoordinates(projectManagerStartAngle + projectManagerAngle, 80).x} ${getCoordinates(projectManagerStartAngle + projectManagerAngle, 80).y} Z`} fill="#626262" />
                          )}
                        </>
                      )}
                    </svg>
                  </div>

                  {/* Labels */}
                  <div className="flex flex-col justify-center gap-[12px]">
                    <div className="flex items-center gap-[8px]">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00564F' }}></div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#00564F' }}>
                        {departmentDistribution.office} Office
                      </span>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8CCCC6' }}></div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#8CCCC6' }}>
                        {departmentDistribution.fieldOperations} Field Operations
                      </span>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#1B223F' }}></div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#1B223F' }}>
                        {departmentDistribution.finance} Finance
                      </span>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#B1B1B1' }}></div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#B1B1B1' }}>
                        {departmentDistribution.it} IT
                      </span>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#670505' }}></div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#670505' }}>
                        {departmentDistribution.hr} HR
                      </span>
                    </div>
                    <div className="flex items-center gap-[8px]">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#626262' }}></div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#626262' }}>
                        {departmentDistribution.projectManager} Project Manager
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance vs Leave Correlation (Bar Chart) */}
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
                  Attendance vs Leave Correlation
                </h3>

                <div className="relative" style={{ height: '250px' }}>
                  {/* Y-axis Labels */}
                  <div className="absolute left-0 top-0 bottom-[30px] flex flex-col justify-between" style={{ width: '30px' }}>
                    {[100, 75, 50, 25, 0].map((value) => (
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
                      {[100, 75, 50, 25, 0].map((value, index) => {
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
                      {attendanceLeaveData.map((data, index) => {
                        const availableWidth = 'calc(100% - 16px)';
                        const gapTotal = 8 * 5;
                        const deptWidth = `calc((${availableWidth} - ${gapTotal}px) / 6)`;

                        return (
                          <div key={index} className="flex items-end justify-center gap-[2px]" style={{ width: deptWidth, height: '100%', flexShrink: 0 }}>
                            {/* Attendance Bar */}
                            <div
                              style={{
                                width: 'calc(25% - 1px)',
                                height: `${valueToHeight(data.attendance, 100)}%`,
                                backgroundColor: '#00564F',
                                borderRadius: '2px 2px 0 0',
                                minHeight: data.attendance > 0 ? '2px' : '0'
                              }}
                            />
                            {/* Leave Days Bar */}
                            <div
                              style={{
                                width: 'calc(25% - 1px)',
                                height: `${valueToHeight(data.leaveDays, 100)}%`,
                                backgroundColor: '#8CCCC6',
                                borderRadius: '2px 2px 0 0',
                                minHeight: data.leaveDays > 0 ? '2px' : '0'
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* X-axis Labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ height: '30px' }}>
                      {attendanceLeaveData.map((data) => (
                        <div
                          key={data.department}
                          className="text-center flex items-center justify-center"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            fontWeight: 500,
                            lineHeight: '100%',
                            color: '#827F7F',
                            width: `${100 / 6}%`
                          }}
                        >
                          {data.department}
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
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#333333' }}>Attendance %</span>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{ width: '14px', height: '14px', backgroundColor: '#8CCCC6' }}
                    ></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#333333' }}>Leave Days %</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-end gap-[16px] mb-[24px] flex-wrap">
              {/* From Date */}
              <div className="relative flex flex-col">
                <label
                  className="mb-[4px]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#535353'
                  }}
                >
                  From
                </label>
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
              <div className="relative flex flex-col">
                <label
                  className="mb-[4px]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#535353'
                  }}
                >
                  To
                </label>
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

              {/* Department Dropdown */}
              <div className="relative" ref={departmentDropdownRef}>
                <button
                  onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                  className="px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between min-w-[160px] hover:border-[#004D40] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#000000' }}
                >
                  <span>{selectedDepartment}</span>
                  <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDepartmentDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10 min-w-[160px]">
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setIsDepartmentDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full px-[16px] py-[10px] text-left transition-colors ${selectedDepartment === dept
                          ? 'bg-[#E5E7EB] text-[#333333]'
                          : 'text-[#333333] hover:bg-[#F5F7FA]'
                          } first:rounded-t-[5px] last:rounded-b-[5px]`}
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400
                        }}
                      >
                        {dept}
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

              {/* Search by name */}
              <div className="relative flex-1 min-w-[200px]">
                <svg className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name"
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

            {/* HR Reports Table */}
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
                        Employee name
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Department
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Position
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Attendance Rate
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Leave Days Taken
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
                              {record.department}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                              {record.position}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <div className="flex items-center justify-center gap-[8px]">
                              <div className="relative w-[60px] h-[8px] bg-[#E5E7EB] rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${record.attendanceRate}%`,
                                    backgroundColor: '#00564F'
                                  }}
                                ></div>
                              </div>
                              <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                                {record.attendanceRate}%
                              </span>
                            </div>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                              {record.leaveDaysTaken}
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
                                color: record.status === "Active" ? '#00564F' : '#626262',
                                backgroundColor: record.status === "Active" ? '#68BFCC' : '#E5E7EB',
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
                        <td colSpan="7" className="px-[12px] py-[40px] text-center" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#6B7280' }}>
                          {reportsLoading ? "Loading..." : "No HR reports found"}
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
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold text-[#000000] mb-1">HR Reports</h1>
            <p className="text-[12px] text-[#6B7280]">Analyze employee performance, attendance, and availability</p>
          </div>

          {reportsError && (
            <div className="mb-4 p-4 rounded-lg border text-sm bg-[#FEE2E2] border-[#EF4444] text-[#B91C1C]">
              {reportsError}
            </div>
          )}

          {/* Charts Section - Mobile */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Employee Distribution by Department Chart - Mobile */}
            <div className="bg-white rounded-[12px] p-4 shadow-sm border border-[#888888]">
              <h3 className="text-[14px] font-semibold mb-4 text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#000000' }}>
                Employee Distribution by Department
              </h3>

              <div className="flex flex-col items-center gap-4">
                <div className="relative flex-shrink-0" style={{ width: '150px', height: '150px' }}>
                  <svg width="150" height="150" viewBox="0 0 200 200">
                    {totalDistribution === 0 ? (
                      <>
                        <circle cx="100" cy="100" r="80" fill="#E5E7EB" />
                        <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fill: '#6B7280' }}>No data</text>
                      </>
                    ) : (
                      <>
                        {officeAngle > 0 && <path d={`M 100 100 L ${getCoordinates(officeStartAngle, 80).x} ${getCoordinates(officeStartAngle, 80).y} A 80 80 0 ${officeAngle > 180 ? 1 : 0} 1 ${getCoordinates(officeStartAngle + officeAngle, 80).x} ${getCoordinates(officeStartAngle + officeAngle, 80).y} Z`} fill="#00564F" />}
                        {fieldOpsAngle > 0 && <path d={`M 100 100 L ${getCoordinates(fieldOpsStartAngle, 80).x} ${getCoordinates(fieldOpsStartAngle, 80).y} A 80 80 0 ${fieldOpsAngle > 180 ? 1 : 0} 1 ${getCoordinates(fieldOpsStartAngle + fieldOpsAngle, 80).x} ${getCoordinates(fieldOpsStartAngle + fieldOpsAngle, 80).y} Z`} fill="#8CCCC6" />}
                        {financeAngle > 0 && <path d={`M 100 100 L ${getCoordinates(financeStartAngle, 80).x} ${getCoordinates(financeStartAngle, 80).y} A 80 80 0 ${financeAngle > 180 ? 1 : 0} 1 ${getCoordinates(financeStartAngle + financeAngle, 80).x} ${getCoordinates(financeStartAngle + financeAngle, 80).y} Z`} fill="#1B223F" />}
                        {itAngle > 0 && <path d={`M 100 100 L ${getCoordinates(itStartAngle, 80).x} ${getCoordinates(itStartAngle, 80).y} A 80 80 0 ${itAngle > 180 ? 1 : 0} 1 ${getCoordinates(itStartAngle + itAngle, 80).x} ${getCoordinates(itStartAngle + itAngle, 80).y} Z`} fill="#B1B1B1" />}
                        {hrAngle > 0 && <path d={`M 100 100 L ${getCoordinates(hrStartAngle, 80).x} ${getCoordinates(hrStartAngle, 80).y} A 80 80 0 ${hrAngle > 180 ? 1 : 0} 1 ${getCoordinates(hrStartAngle + hrAngle, 80).x} ${getCoordinates(hrStartAngle + hrAngle, 80).y} Z`} fill="#670505" />}
                        {projectManagerAngle > 0 && <path d={`M 100 100 L ${getCoordinates(projectManagerStartAngle, 80).x} ${getCoordinates(projectManagerStartAngle, 80).y} A 80 80 0 ${projectManagerAngle > 180 ? 1 : 0} 1 ${getCoordinates(projectManagerStartAngle + projectManagerAngle, 80).x} ${getCoordinates(projectManagerStartAngle + projectManagerAngle, 80).y} Z`} fill="#626262" />}
                      </>
                    )}
                  </svg>
                </div>

                {/* Labels */}
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-[8px]">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00564F' }}></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#00564F' }}>
                      {departmentDistribution.office} Office
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8CCCC6' }}></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#8CCCC6' }}>
                      {departmentDistribution.fieldOperations} Field Operations
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#1B223F' }}></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#1B223F' }}>
                      {departmentDistribution.finance} Finance
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#B1B1B1' }}></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#B1B1B1' }}>
                      {departmentDistribution.it} IT
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#670505' }}></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#670505' }}>
                      {departmentDistribution.hr} HR
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#626262' }}></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#626262' }}>
                      {departmentDistribution.projectManager} Project Manager
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance vs Leave Correlation Chart - Mobile */}
            <div className="bg-white rounded-[12px] p-4 shadow-sm border border-[#888888]">
              <h3 className="text-[14px] font-semibold mb-4 text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#000000' }}>
                Attendance vs Leave Correlation
              </h3>

              <div className="relative" style={{ height: '200px' }}>
                {/* Y-axis Labels */}
                <div className="absolute left-0 top-0 bottom-[30px] flex flex-col justify-between" style={{ width: '25px' }}>
                  {[100, 75, 50, 25, 0].map((value) => (
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
                    {[100, 75, 50, 25, 0].map((value, index) => {
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
                    {attendanceLeaveData.map((data, index) => {
                      return (
                        <div key={index} className="flex items-end justify-center gap-[1px]" style={{ flex: 1, height: '100%' }}>
                          {/* Attendance Bar */}
                          <div
                            style={{
                              width: 'calc(25% - 0.5px)',
                              height: `${valueToHeight(data.attendance, 100)}%`,
                              backgroundColor: '#00564F',
                              borderRadius: '2px 2px 0 0',
                              minHeight: data.attendance > 0 ? '2px' : '0'
                            }}
                          />
                          {/* Leave Days Bar */}
                          <div
                            style={{
                              width: 'calc(25% - 0.5px)',
                              height: `${valueToHeight(data.leaveDays, 100)}%`,
                              backgroundColor: '#8CCCC6',
                              borderRadius: '2px 2px 0 0',
                              minHeight: data.leaveDays > 0 ? '2px' : '0'
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* X-axis Labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ height: '30px' }}>
                    {attendanceLeaveData.map((data) => (
                      <div
                        key={data.department}
                        className="text-center flex items-center justify-center"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '10px',
                          fontWeight: 500,
                          color: '#827F7F',
                          width: `${100 / 6}%`
                        }}
                      >
                        {data.department}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-[20px] mt-4 flex-wrap">
                <div className="flex items-center gap-[8px]">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00564F' }}></div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 400, color: '#333333' }}>Attendance %</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8CCCC6' }}></div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 400, color: '#333333' }}>Leave Days %</span>
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

            {/* Department Dropdown */}
            <div className="relative" ref={departmentDropdownRef}>
              <button
                onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between text-[14px] font-semibold text-[#000000]"
              >
                <span>{selectedDepartment}</span>
                <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDepartmentDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        setSelectedDepartment(dept);
                        setIsDepartmentDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full px-[16px] py-[10px] text-left text-[14px] transition-colors ${selectedDepartment === dept ? 'bg-[#E5E7EB] text-[#333333]' : 'text-[#333333] hover:bg-[#F5F7FA]'
                        }`}
                    >
                      {dept}
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
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-[40px] pl-[36px] pr-[16px] rounded-[5px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]"
              />
            </div>
          </div>

          {/* HR Cards - Mobile */}
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
                      <p className="text-[12px] text-[#6B7280]">{record.position}</p>
                    </div>
                  </div>

                  {/* Employee Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Department:</span>
                      <span className="text-[13px] font-semibold text-[#000000] bg-[#F3F4F6] px-3 py-1 rounded-[6px]">{record.department}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Attendance Rate:</span>
                      <div className="flex items-center gap-2">
                        <div className="relative w-[60px] h-[8px] bg-[#E5E7EB] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${record.attendanceRate}%`,
                              backgroundColor: '#00564F'
                            }}
                          ></div>
                        </div>
                        <span className="text-[13px] font-semibold text-[#000000]">{record.attendanceRate}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Leave Days Taken:</span>
                      <span className="text-[13px] font-semibold text-[#000000]">{record.leaveDaysTaken}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Status:</span>
                      <span
                        className="inline-block px-[14px] py-[6px] rounded-[8px] text-[13px] font-bold shadow-sm"
                        style={{
                          color: record.status === "Active" ? '#00564F' : '#626262',
                          backgroundColor: record.status === "Active" ? '#68BFCC' : '#E5E7EB'
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
                {reportsLoading ? "Loading..." : "No HR reports found"}
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

export default HRReportsPage;

