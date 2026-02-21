import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getEffectiveRole, getCurrentUser } from "../services/auth.js";
import { getMyLeaves, getMyLeaveStats, createLeave } from "../services/leaves";
import { getProfileMe } from "../services/profile";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Action icons
const ViewIcon = new URL("../images/icons/eye.png", import.meta.url).href;
const UploadIcon = new URL("../images/icons/upload.png", import.meta.url).href;

const MyLeavePage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const effectiveRole = getEffectiveRole(userRole);
  const [activeMenu, setActiveMenu] = useState("6-3");
  const [selectedLeaveType, setSelectedLeaveType] = useState("All Leave Type");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isLeaveTypeDropdownOpen, setIsLeaveTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showRequestLeaveModal, setShowRequestLeaveModal] = useState(false);
  const [isRequestLeaveTypeDropdownOpen, setIsRequestLeaveTypeDropdownOpen] = useState(false);
  const [showRejectedDetailsModal, setShowRejectedDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const leaveTypeDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const requestLeaveTypeDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserEmployeeId, setCurrentUserEmployeeId] = useState(null);

  const formatDateShort = (val) => {
    if (val == null || val === "") return "—";
    try {
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return "—";
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "—";
    }
  };

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const [list, stats] = await Promise.all([getMyLeaves(), getMyLeaveStats()]);
      const requests = Array.isArray(list) ? list : [];
      setLeaveRequests(
        requests.map((item) => ({
          id: item.id,
          leaveType: item.leave_type ?? item.leaveType ?? "—",
          dateRange: item.date_range ?? (item.start_date && item.end_date ? `${item.start_date} - ${item.end_date}` : "—"),
          startDate: item.start_date ?? item.startDate ?? "—",
          endDate: item.end_date ?? item.endDate ?? "—",
          days: item.total_days ?? item.totalDays ?? item.days ?? 0,
          totalDays: item.total_days ?? item.totalDays ?? 0,
          submittedDate: formatDateShort(item.submitted_date ?? item.created_at ?? item.submittedDate) || "—",
          status: (item.status && typeof item.status === "string") ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase() : "Pending",
          reason: item.reason ?? "—",
          adminNotes: item.admin_notes ?? item.adminNotes ?? "",
        }))
      );
      const balance = stats?.balance ?? stats?.leave_balance ?? stats;
      const balanceList = Array.isArray(balance) ? balance : balance && typeof balance === "object" ? Object.entries(balance).map(([type, v]) => ({ type, ...(typeof v === "object" ? v : { remaining: v, total: v, used: 0 }) })) : [];
      setLeaveBalance(balanceList.length ? balanceList : []);
    } catch (err) {
      console.error("Failed to fetch my leaves:", err);
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await getProfileMe();
        if (cancelled) return;
        setCurrentUserEmployeeId(profile?.employee?.id ?? profile?.employee_id ?? null);
      } catch (_) {
        if (!cancelled) setCurrentUserEmployeeId(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Form State for Request Leave Modal
  const [requestFormData, setRequestFormData] = useState({
    leaveType: "",
    startDate: "",
    endDate: "",
    totalDays: "",
    reason: "",
    supportingDocument: null
  });

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR Admin",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  const leaveRequestsData = leaveRequests;

  // Leave types
  const leaveTypes = ["All Leave Type", "Annual Leave", "Sick Leave", "Emergency Leave", "Unpaid Leave", "Compensatory Time Off", "Maternity Leave", "Paternity Leave"];

  // Leave types for request form (without "All Leave Type")
  const requestLeaveTypes = ["Annual Leave", "Sick Leave", "Emergency Leave", "Unpaid Leave", "Compensatory Time Off", "Maternity Leave", "Paternity Leave"];

  // Status options
  const statusOptions = ["All Status", "Pending", "Rejected", "Approved"];

  // Calculate total days when start and end dates change (end must be >= start)
  useEffect(() => {
    if (requestFormData.startDate && requestFormData.endDate) {
      const start = new Date(requestFormData.startDate);
      const end = new Date(requestFormData.endDate);
      if (end < start) {
        setRequestFormData(prev => ({ ...prev, totalDays: "" }));
        return;
      }
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      setRequestFormData(prev => ({ ...prev, totalDays: diffDays.toString() }));
    } else {
      setRequestFormData(prev => ({ ...prev, totalDays: "" }));
    }
  }, [requestFormData.startDate, requestFormData.endDate]);

  const [requestLeaveSubmitting, setRequestLeaveSubmitting] = useState(false);
  const [requestLeaveError, setRequestLeaveError] = useState(null);
  const [requestLeaveDocumentSkipped, setRequestLeaveDocumentSkipped] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (leaveTypeDropdownRef.current && !leaveTypeDropdownRef.current.contains(event.target)) {
        setIsLeaveTypeDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (requestLeaveTypeDropdownRef.current && !requestLeaveTypeDropdownRef.current.contains(event.target)) {
        setIsRequestLeaveTypeDropdownOpen(false);
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
  }, []);

  // Handle request leave form submission (calls backend)
  const handleRequestLeaveSubmit = async (e) => {
    e.preventDefault();
    setRequestLeaveError(null);
    const { leaveType, startDate, endDate, totalDays, reason, supportingDocument } = requestFormData;
    if (!leaveType || !startDate || !endDate) {
      setRequestLeaveError("Please select leave type and date range.");
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      setRequestLeaveError("End date must be on or after start date.");
      return;
    }
    if (!reason?.trim()) {
      setRequestLeaveError("Please provide a reason for the leave request.");
      return;
    }
    if (!currentUserEmployeeId) {
      setRequestLeaveError("Unable to identify your profile. Please try again or contact support.");
      return;
    }
    try {
      setRequestLeaveSubmitting(true);
      const hasFile = supportingDocument && supportingDocument instanceof File;
      if (hasFile) {
        const fd = new FormData();
        fd.append("employee_id", currentUserEmployeeId);
        fd.append("leave_type", leaveType);
        fd.append("start_date", startDate);
        fd.append("end_date", endDate);
        fd.append("total_days", String(totalDays || ""));
        fd.append("reason", reason);
        fd.append("supporting_document", supportingDocument);
        await createLeave(fd);
      } else {
        await createLeave({
          employee_id: currentUserEmployeeId,
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          total_days: Number(totalDays) || undefined,
          reason: reason || undefined,
        });
      }
      setRequestFormData({
        leaveType: "",
        startDate: "",
        endDate: "",
        totalDays: "",
        reason: "",
        supportingDocument: null
      });
      setShowRequestLeaveModal(false);
      await fetchMyLeaves();
    } catch (err) {
      const data = err.response?.data;
      const status = err.response?.status;
      // Log full response to find root cause (status, validation errors, etc.)
      console.error("Submit leave request failed:", { status, data, err });
      const message = data?.message ?? data?.error ?? err.message ?? "Failed to submit request.";
      const detail = data?.details || data?.errors;
      setRequestLeaveError(detail ? `${message} ${typeof detail === "string" ? detail : JSON.stringify(detail)}` : message);
    } finally {
      setRequestLeaveSubmitting(false);
    }
  };

  // Filter data (case-insensitive so API "pending" matches dropdown "Pending")
  const filteredData = leaveRequestsData.filter((request) => {
    const reqType = (request.leaveType || "").toString().trim().replace(/_/g, " ");
    const selType = (selectedLeaveType || "").trim().replace(/_/g, " ");
    const matchesLeaveType =
      selectedLeaveType === "All Leave Type" ||
      reqType === selType ||
      reqType.toLowerCase() === selType.toLowerCase();
    const reqStatus = (request.status || "").toString().trim().toLowerCase();
    const selStatus = (selectedStatus || "").trim().toLowerCase();
    const matchesStatus = selectedStatus === "All Status" || reqStatus === selStatus;
    return matchesLeaveType && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 10;
  const actualTotalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const totalPages = Math.max(3, actualTotalPages);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen" style={{ overflowX: 'hidden' }}>
        <Sidebar 
          userRole={effectiveRole}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
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
                <span style={{ color: '#B0B0B0' }}>Leave Management</span>
                <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
                <span style={{ color: '#8E8C8C' }}>My Leave</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-[24px]">
              <div>
                <h1 
                  className="text-[28px] font-semibold mb-[4px]"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    color: '#000000'
                  }}
                >
                  Leave Requests
                </h1>
                <p 
                  className="text-[14px]"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: '#6B7280'
                  }}
                >
                  View your leave balance and history
                </p>
              </div>
              <button
                onClick={() => setShowRequestLeaveModal(true)}
                className="px-[24px] py-[10px] rounded-[5px] hover:opacity-90 transition-opacity flex items-center gap-[8px]"
                style={{
                  backgroundColor: '#0C8DFE',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Request Leave
              </button>
            </div>

            {/* Leave Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[32px]">
              {leaveBalance.map((leave, index) => {
                const percentage = (leave.used / leave.total) * 100;
                return (
                  <div 
                    key={index}
                    className="bg-white rounded-[10px] p-[24px]"
                    style={{ 
                      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                      border: '1px solid #B5B1B1'
                    }}
                  >
                    <h3 
                      className="mb-[16px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '16px',
                        fontWeight: 600,
                        color: '#3F817C'
                      }}
                    >
                      {leave.type}
                    </h3>
                    <div className="flex items-baseline justify-between mb-[12px]">
                      <span 
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '32px',
                          fontWeight: 700,
                          color: '#00675E',
                          lineHeight: '100%'
                        }}
                      >
                        {leave.remaining}
                      </span>
                      <span 
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                          color: '#3F817C'
                        }}
                      >
                        / {leave.total} days
                      </span>
                    </div>
                    <div 
                      className="w-full h-[11px] rounded-[10px] mb-[12px]"
                      style={{
                        backgroundColor: '#EFEEEE'
                      }}
                    >
                      <div 
                        className="h-full rounded-[10px]"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: '#00564F'
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span 
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          color: '#3F817C'
                        }}
                      >
                        Used: {leave.used}
                      </span>
                      <span 
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          color: '#3F817C'
                        }}
                      >
                        Remaining: {leave.remaining}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-[16px] mb-[24px] flex-wrap">
              {/* Leave Type Dropdown */}
              <div className="relative z-[100]" ref={leaveTypeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsLeaveTypeDropdownOpen(!isLeaveTypeDropdownOpen)}
                  className="px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between min-w-[180px] hover:border-[#004D40] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#000000' }}
                >
                  <span>{selectedLeaveType}</span>
                  <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isLeaveTypeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-[100] min-w-[180px] max-h-[200px] overflow-y-auto">
                    {leaveTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedLeaveType(type);
                          setIsLeaveTypeDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full px-[16px] py-[10px] text-left transition-colors ${selectedLeaveType === type
                            ? 'bg-[#E5E7EB] text-[#333333]'
                            : 'text-[#333333] hover:bg-[#F5F7FA]'
                        } first:rounded-t-[5px] last:rounded-b-[5px]`}
                        style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          fontSize: '14px', 
                          fontWeight: 400
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative z-[100]" ref={statusDropdownRef}>
                <button
                  type="button"
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
                  <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-[100] min-w-[140px]">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
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
            </div>

            {/* Leave Requests Table */}
            <div className="bg-white rounded-[10px] overflow-hidden" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #B5B1B1' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Leave Type
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Date Range
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Days
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Submitted Date
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Status
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((request) => (
                        <tr key={request.id} className="border-b border-[#E0E0E0] hover:bg-[#F9FAFB]">
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                              {request.leaveType}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                              {request.dateRange}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                              {request.days}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                              {request.submittedDate}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span 
                              className="text-[13px] inline-block px-[12px] py-[4px] rounded-[5px]"
                              style={{ 
                                fontWeight: 500,
                                fontSize: '13px',
                                lineHeight: '100%',
                                whiteSpace: 'nowrap',
                                color: request.status === "Pending" ? '#4A4A4A' : 
                                       request.status === "Approved" ? '#00564F' : '#830000',
                                backgroundColor: request.status === "Pending" ? '#D2D2D2B2' : 
                                               request.status === "Approved" ? '#68BFCC' : '#FFBDB6B2',
                                textAlign: 'center'
                              }}
                            >
                              {request.status}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <div className="flex items-center justify-center">
                              <button 
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectedDetailsModal(true);
                                }}
                                className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity"
                                title="View"
                              >
                                <img src={ViewIcon} alt="View" className="w-full h-full object-contain" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-[12px] py-[40px] text-center" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#6B7280' }}>
                          No leave requests found
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
          />
        </div>

        {/* Mobile Content */}
        <div className="flex-1 p-4 pb-10">
          {/* Title and Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[20px] font-semibold text-[#000000] mb-0">Leave Requests</h1>
              <p className="text-[12px] text-[#6B7280]">View your leave balance and history</p>
            </div>
            <button
              onClick={() => setShowRequestLeaveModal(true)}
              className="px-[16px] py-[8px] rounded-[5px] bg-[#0C8DFE] text-white text-[13px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap flex items-center gap-[6px]"
            >
              <svg className="w-[14px] h-[14px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Request
            </button>
          </div>

          {/* Leave Balance Cards - Mobile */}
          <div className="flex flex-col gap-3 mb-6">
            {leaveBalance.map((leave, index) => {
              const percentage = (leave.used / leave.total) * 100;
              return (
                <div
                  key={index}
                  className="bg-white rounded-[12px] p-4 shadow-sm border border-[#B5B1B1]"
                >
                  <h3
                    className="mb-3"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#3F817C'
                    }}
                  >
                    {leave.type}
                  </h3>
                  <div className="flex items-baseline justify-between mb-3">
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '28px',
                        fontWeight: 700,
                        color: '#00675E',
                        lineHeight: '100%'
                      }}
                    >
                      {leave.remaining}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px',
                        fontWeight: 400,
                        color: '#3F817C'
                      }}
                    >
                      / {leave.total} days
                    </span>
                  </div>
                  <div
                    className="w-full h-[10px] rounded-[10px] mb-3"
                    style={{
                      backgroundColor: '#EFEEEE'
                    }}
                  >
                    <div
                      className="h-full rounded-[10px]"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: '#00564F'
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        color: '#3F817C'
                      }}
                    >
                      Used: {leave.used}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        color: '#3F817C'
                      }}
                    >
                      Remaining: {leave.remaining}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Filters - Mobile */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Leave Type Dropdown */}
            <div className="relative z-[100]" ref={leaveTypeDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLeaveTypeDropdownOpen(!isLeaveTypeDropdownOpen)}
                className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between text-[14px] font-semibold text-[#000000]"
              >
                <span>{selectedLeaveType}</span>
                <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isLeaveTypeDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-[100] max-h-[200px] overflow-y-auto">
                  {leaveTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedLeaveType(type);
                        setIsLeaveTypeDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full px-[16px] py-[10px] text-left text-[14px] transition-colors ${selectedLeaveType === type ? 'bg-[#E5E7EB] text-[#333333]' : 'text-[#333333] hover:bg-[#F5F7FA]'
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative z-[100]" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between text-[14px] font-semibold text-[#000000]"
              >
                <span>{selectedStatus}</span>
                <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-[100]">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
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
          </div>

          {/* Leave Request Cards - Mobile */}
          <div className="space-y-4">
            {paginatedData.length > 0 ? (
              paginatedData.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-[12px] p-4 shadow-md border border-[#E0E0E0]"
                >
                  {/* Leave Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Leave Type:</span>
                      <span className="text-[13px] font-semibold text-[#000000] bg-[#F3F4F6] px-3 py-1 rounded-[6px]">{request.leaveType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Date Range:</span>
                      <span className="text-[13px] font-semibold text-[#000000]">{request.dateRange}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Days:</span>
                      <span className="text-[13px] font-semibold text-[#000000]">{request.days}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Submitted:</span>
                      <span className="text-[13px] font-semibold text-[#000000]">{request.submittedDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Status:</span>
                      <span
                        className="inline-block px-[14px] py-[6px] rounded-[8px] text-[13px] font-bold shadow-sm"
                        style={{
                          color: request.status === 'Pending' ? '#4A4A4A' : request.status === 'Approved' ? '#00564F' : '#830000',
                          backgroundColor: request.status === 'Pending' ? '#D2D2D2B2' : request.status === 'Approved' ? '#68BFCC' : '#FFBDB6B2'
                        }}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRejectedDetailsModal(true);
                      }}
                      className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity"
                      title="View"
                    >
                      <img src={ViewIcon} alt="View" className="w-full h-full object-contain" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[12px] p-8 text-center text-[#6B7280]">
                No leave requests found
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

      {/* Leave Request Details Modal */}
      {
        showRejectedDetailsModal && selectedRequest && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowRejectedDetailsModal(false);
            setSelectedRequest(null);
          }}
        >
          <div 
            className="bg-white rounded-[10px] relative"
            style={{
              width: '700px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
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
                Leave Request Details
              </h2>
              <button
                onClick={() => {
                  setShowRejectedDetailsModal(false);
                  setSelectedRequest(null);
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
              <div className="space-y-[24px]">
                {/* Leave Details Section */}
                <div>
                  <h3 
                    className="mb-[16px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#181818'
                    }}
                  >
                    Leave Details
                  </h3>
                  
                  {/* Leave Type and Status in one row */}
                  <div className="grid grid-cols-2 gap-[16px] mb-[24px]">
                    {/* Leave Type */}
                    <div>
                      <label 
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#181818'
                        }}
                      >
                        Leave Type
                      </label>
                      <input
                        type="text"
                        value={selectedRequest.leaveType}
                        disabled
                        className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                          color: '#000000'
                        }}
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label 
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#181818'
                        }}
                      >
                        Status
                      </label>
                      <div>
                        <span 
                          className="inline-block px-[12px] py-[4px] rounded-[5px]"
                          style={{ 
                            fontWeight: 500,
                            fontSize: '13px',
                            lineHeight: '100%',
                            whiteSpace: 'nowrap',
                            color: selectedRequest.status === "Pending" ? '#4A4A4A' : 
                                   selectedRequest.status === "Approved" ? '#00564F' : '#830000',
                            backgroundColor: selectedRequest.status === "Pending" ? '#D2D2D2B2' : 
                                            selectedRequest.status === "Approved" ? '#68BFCC' : '#FFBDB6B2',
                            textAlign: 'center'
                          }}
                        >
                          {selectedRequest.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Start Date and End Date in one row */}
                  <div className="grid grid-cols-2 gap-[16px] mb-[24px]">
                    {/* Start Date */}
                    <div>
                      <label 
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#181818'
                        }}
                      >
                        Start Date
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={selectedRequest.startDate}
                          disabled
                          className="w-full px-[16px] py-[10px] pr-[40px] rounded-[5px] border border-[#E0E0E0] bg-white"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#000000'
                          }}
                        />
                        <div className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] flex items-center justify-center pointer-events-none">
                          <svg className="w-[16px] h-[16px] text-[#939393]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* End Date */}
                    <div>
                      <label 
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#181818'
                        }}
                      >
                        End Date
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={selectedRequest.endDate}
                          disabled
                          className="w-full px-[16px] py-[10px] pr-[40px] rounded-[5px] border border-[#E0E0E0] bg-white"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#000000'
                          }}
                        />
                        <div className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] flex items-center justify-center pointer-events-none">
                          <svg className="w-[16px] h-[16px] text-[#939393]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Days */}
                  <div className="mb-[24px]">
                    <label 
                      className="block mb-[8px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#181818'
                      }}
                    >
                      Total Days
                    </label>
                    <input
                      type="text"
                      value={`${selectedRequest.totalDays} days`}
                      disabled
                      className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#000000'
                      }}
                    />
                  </div>

                  {/* Reason */}
                  <div className="mb-[24px]">
                    <label 
                      className="block mb-[8px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#181818'
                      }}
                    >
                      Reason
                    </label>
                    <input
                      type="text"
                      value={selectedRequest.reason || ""}
                      disabled
                      className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#5D5D5D',
                        backgroundColor: '#DEDEDE'
                      }}
                    />
                  </div>

                  {/* Admin Notes - Only show if status is Rejected or Approved */}
                  {(selectedRequest.status === "Rejected" || selectedRequest.status === "Approved") && (
                    <div className="mb-[24px]">
                      <label 
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#181818'
                        }}
                      >
                        Admin Notes
                      </label>
                      <input
                        type="text"
                        value={selectedRequest.adminNotes || ""}
                        disabled
                        placeholder="No admin notes"
                        className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                          color: '#6B7280',
                          backgroundColor: '#DEDEDE'
                        }}
                      />
                    </div>
                  )}

                  {/* Submitted Date */}
                  <div>
                    <label 
                      className="block mb-[8px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#181818'
                      }}
                    >
                      Submitted Date
                    </label>
                    <p 
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#333333'
                      }}
                    >
                      {formatDateShort(selectedRequest.submittedDate) || selectedRequest.submittedDate || "—"}
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Request Leave Modal - z-[200] so it appears above page dropdowns (z-[100]) */}
      {
        showRequestLeaveModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]"
          onClick={() => {
            setShowRequestLeaveModal(false);
            setRequestLeaveError(null);
            setRequestFormData({
              leaveType: "",
              startDate: "",
              endDate: "",
              totalDays: "",
              reason: "",
              supportingDocument: null
            });
          }}
        >
          <div 
            className="bg-white rounded-[10px] relative z-[201]"
            style={{
              width: '700px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
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
                Request Leave
              </h2>
              <button
                onClick={() => {
                  setShowRequestLeaveModal(false);
                  setRequestLeaveError(null);
                  setRequestFormData({
                    leaveType: "",
                    startDate: "",
                    endDate: "",
                    totalDays: "",
                    reason: "",
                    supportingDocument: null
                  });
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
              <form onSubmit={handleRequestLeaveSubmit}>
                <div className="space-y-[24px]">
                  {/* Leave Type Dropdown */}
                  <div>
                    <label 
                      className="block mb-[8px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#181818'
                      }}
                    >
                      Leave Type
                    </label>
                    <div className="relative" ref={requestLeaveTypeDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsRequestLeaveTypeDropdownOpen(!isRequestLeaveTypeDropdownOpen)}
                        className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between hover:border-[#004D40] transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: requestFormData.leaveType ? '#000000' : '#9CA3AF' }}
                      >
                        <span>{requestFormData.leaveType || "Select Leave Type"}</span>
                        <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isRequestLeaveTypeDropdownOpen && (
                        <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg max-h-[200px] overflow-y-auto leave-type-dropdown" style={{ zIndex: 9999 }}>
                          <style>{`
                            .leave-type-dropdown {
                              z-index: 9999 !important;
                            }
                            .leave-type-dropdown button::before,
                            .leave-type-dropdown button::after {
                              display: none !important;
                              content: none !important;
                            }
                            .leave-type-dropdown button svg,
                            .leave-type-dropdown button img {
                              display: none !important;
                            }
                            .leave-type-dropdown button {
                              background-image: none !important;
                            }
                            .leave-type-dropdown * {
                              pointer-events: auto !important;
                            }
                          `}</style>
                          {requestLeaveTypes.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setRequestFormData(prev => ({ ...prev, leaveType: type }));
                                setIsRequestLeaveTypeDropdownOpen(false);
                              }}
                                className={`w-full px-[16px] py-[10px] text-left transition-colors flex items-center justify-start ${requestFormData.leaveType === type
                                  ? 'bg-[#E5E7EB] text-[#333333]'
                                  : 'text-[#333333] hover:bg-[#F5F7FA]'
                              } first:rounded-t-[5px] last:rounded-b-[5px]`}
                              style={{ 
                                fontFamily: 'Inter, sans-serif', 
                                fontSize: '14px', 
                                fontWeight: 400,
                                position: 'relative',
                                backgroundImage: 'none',
                                zIndex: 10000
                              }}
                            >
                              <span style={{ flex: 1 }}>{type}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Start Date and End Date in one row */}
                  <div className="grid grid-cols-2 gap-[16px]">
                    {/* Start Date */}
                    <div>
                      <label 
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#181818'
                        }}
                      >
                        Start Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={requestFormData.startDate}
                          onChange={(e) => setRequestFormData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-[16px] py-[10px] pr-[40px] rounded-[5px] border border-[#E0E0E0] bg-white focus:outline-none focus:border-[#004D40] transition-colors"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#000000'
                          }}
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
                          className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
                          style={{ zIndex: 1 }}
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
                    </div>

                    {/* End Date */}
                    <div>
                      <label 
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#181818'
                        }}
                      >
                        End Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={requestFormData.endDate}
                          onChange={(e) => setRequestFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          min={requestFormData.startDate || undefined}
                          className="w-full px-[16px] py-[10px] pr-[40px] rounded-[5px] border border-[#E0E0E0] bg-white focus:outline-none focus:border-[#004D40] transition-colors"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            color: '#000000'
                          }}
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
                          className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
                          style={{ zIndex: 1 }}
                        >
                          <svg className="w-[16px] h-[16px] text-[#939393]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Total Days */}
                  <div>
                    <label 
                      className="block mb-[8px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#181818'
                      }}
                    >
                      Total Days
                    </label>
                    <input
                      type="text"
                      value={requestFormData.totalDays || ""}
                      placeholder="Select dates to calculate"
                      disabled
                      className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-[#F3F4F6] cursor-not-allowed"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#6B7280'
                      }}
                    />
                  </div>

                  {/* Reason */}
                  <div>
                    <label 
                      className="block mb-[8px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#181818'
                      }}
                    >
                      Reason
                    </label>
                    <textarea
                      value={requestFormData.reason}
                      onChange={(e) => setRequestFormData(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Please provide a reason for leave request..."
                      rows={4}
                      className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white focus:outline-none focus:border-[#004D40] transition-colors resize-y"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#000000'
                      }}
                    />
                  </div>

                  {/* Supporting Document */}
                  <div>
                    <label 
                      className="block mb-[8px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        color: '#181818'
                      }}
                    >
                      Supporting Document <span style={{ color: '#6B6B6B' }}>(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="supporting-document-modal"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
                            setRequestFormData(prev => ({ ...prev, supportingDocument: file }));
                          } else {
                            alert("File size must be less than 10MB");
                            e.target.value = "";
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="supporting-document-modal"
                        className="w-full min-h-[120px] border-2 border-dashed border-[#E0E0E0] rounded-[5px] flex flex-col items-center justify-center cursor-pointer hover:border-[#004D40] transition-colors bg-[#FAFAFA]"
                      >
                        <img src={UploadIcon} alt="Upload" className="w-[32px] h-[32px] mb-[8px] object-contain" />
                        {requestFormData.supportingDocument ? (
                          <p 
                            className="text-center px-[16px]"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '14px',
                              fontWeight: 400,
                              color: '#6B7280'
                            }}
                          >
                            {requestFormData.supportingDocument.name}
                          </p>
                        ) : (
                          <div className="flex flex-col items-center gap-[4px]">
                            <p 
                              className="text-center px-[16px]"
                              style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                fontWeight: 400,
                                color: '#6B6B6B'
                              }}
                            >
                              Click to upload or drag and drop
                            </p>
                            <p 
                              className="text-center px-[16px]"
                              style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                fontWeight: 400,
                                color: '#949494'
                              }}
                            >
                              PDF, DOC, or Image (max 10MB)
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {requestLeaveError && (
                  <p className="mt-4 text-red-600 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {requestLeaveError}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-[12px] mt-[32px]">
                  <button
                    type="submit"
                    disabled={requestLeaveSubmitting}
                    className="px-[24px] py-[10px] rounded-[5px] hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{
                      backgroundColor: '#009084',
                      color: '#FFFFFF',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      minWidth: '150px'
                    }}
                  >
                    {requestLeaveSubmitting ? "Submitting…" : "Submit Request"}
                  </button>
                  <button
                    type="button"
                    disabled={requestLeaveSubmitting}
                    onClick={() => {
                      setShowRequestLeaveModal(false);
                      setRequestLeaveError(null);
                      setRequestFormData({
                        leaveType: "",
                        startDate: "",
                        endDate: "",
                        totalDays: "",
                        reason: "",
                        supportingDocument: null
                      });
                    }}
                    className="px-[24px] py-[10px] rounded-[5px] hover:bg-[#F5F7FA] transition-colors disabled:opacity-50"
                    style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E0E0E0',
                        color: '#9CA3AF',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                        fontWeight: 400,
                      minWidth: '150px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        )
      }
    </div >
  );
};

export default MyLeavePage;

