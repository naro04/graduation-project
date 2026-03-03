import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import LogoutModal from "./LogoutModal";
import { getEffectiveRole, getCurrentUser, logout } from "../services/auth.js";
import { getLeaves, updateLeaveStatus } from "../services/leaves";
import { getTeamMembers } from "../services/employees.js";
import { BASE_URL } from "../services/api.js";

const API_ORIGIN = BASE_URL.replace(/\/api\/v1\/?$/, "");

function toAbsoluteAvatarUrl(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== "string") return null;
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) return avatarUrl;
  const path = avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`;
  return `${API_ORIGIN}${path}`;
}

const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;
const PendingIcon = new URL("../images/icons/pending (2).png", import.meta.url).href;
const ApprovedIcon = new URL("../images/icons/approved (2).png", import.meta.url).href;
const RejectIcon = new URL("../images/icons/reject.png", import.meta.url).href;
const ViewIcon = new URL("../images/icons/eye.png", import.meta.url).href;
const ApproveIcon = new URL("../images/icons/approved (2).png", import.meta.url).href;
const RejectActionIcon = new URL("../images/icons/reject.png", import.meta.url).href;
const DefaultPhoto = new URL("../images/Ameer Jamal.jpg", import.meta.url).href;

const roleDisplayNames = {
  superAdmin: "Super Admin",
  hr: "HR Admin",
  manager: "Manager",
  fieldEmployee: "Field Employee",
  officer: "Officer",
};

const formatDateShort = (val) => {
  if (!val || typeof val !== "string") return "—";
  try {
    const d = new Date(val.trim());
    if (Number.isNaN(d.getTime())) return val;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return val;
  }
};

const TeamLeaveRequestsPage = ({ userRole = "manager" }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const effectiveRole = getEffectiveRole();
  const [activeMenu, setActiveMenu] = useState("2-4");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeaveType, setSelectedLeaveType] = useState("All Leave Type");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isLeaveTypeDropdownOpen, setIsLeaveTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [leaveRequestsRaw, setLeaveRequestsRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const userDropdownRef = useRef(null);
  const leaveTypeDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      getTeamMembers().catch(() => []),
      getLeaves().catch(() => []),
    ]).then(([team, data]) => {
      setTeamMembers(Array.isArray(team) ? team : []);
      const list = Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
      setLeaveRequestsRaw(Array.isArray(list) ? list : []);
    }).catch((err) => {
      setError(err?.message || "Failed to load data");
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const teamIds = useMemo(() => (teamMembers || []).map((m) => m.id), [teamMembers]);
  const teamNamesSet = useMemo(() => {
    const set = new Set();
    (teamMembers || []).forEach((m) => {
      const name = (m.full_name || [m.first_name, m.last_name].filter(Boolean).join(" ")).trim().toLowerCase();
      if (name) set.add(name);
    });
    return set;
  }, [teamMembers]);

  const leaveRequests = useMemo(() => {
    const raw = (leaveRequestsRaw || []).filter((item) => {
      const empId = item.employee_id ?? item.employeeId;
      const name = (item.employee_name ?? item.employeeName ?? "").toString().trim().toLowerCase();
      return (empId && teamIds.includes(empId)) || (name && teamNamesSet.has(name));
    });
    return raw.map((item) => {
      const start = item.start_date ?? item.startDate;
      const end = item.end_date ?? item.endDate;
      const dateRangeStr = start && end ? `${formatDateShort(start)} - ${formatDateShort(end)}` : (item.date_range || "—");
      const submitted = item.submitted_date ?? item.created_at ?? item.submittedDate;
      return {
        id: item.id,
        employeeName: item.employee_name ?? item.employeeName ?? "—",
        employeePhoto: toAbsoluteAvatarUrl(item.avatar_url ?? item.employee_avatar) || item.employeePhoto || DefaultPhoto,
        leaveType: item.leave_type ?? item.leaveType ?? "—",
        dateRange: dateRangeStr,
        submittedDate: formatDateShort(submitted) || "—",
        status: (item.status && typeof item.status === "string") ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase() : "Pending",
      };
    });
  }, [leaveRequestsRaw, teamIds, teamNamesSet]);

  const summaryStats = useMemo(() => ({
    pending: leaveRequests.filter((r) => r.status === "Pending").length,
    approved: leaveRequests.filter((r) => r.status === "Approved").length,
    rejected: leaveRequests.filter((r) => r.status === "Rejected").length,
  }), [leaveRequests]);

  const leaveTypes = ["All Leave Type", "Annual Leave", "Sick Leave", "Emergency Leave", "Unpaid Leave", "Compensatory Time Off", "Maternity Leave", "Paternity Leave"];
  const statusOptions = ["All Status", "Pending", "Rejected", "Approved"];

  const filteredData = leaveRequests.filter((request) => {
    const matchSearch = (request.employeeName || "").toString().toLowerCase().includes((searchQuery || "").toString().trim().toLowerCase());
    const reqType = (request.leaveType || "").toString().trim().replace(/_/g, " ");
    const selType = (selectedLeaveType || "").trim().replace(/_/g, " ");
    const matchLeaveType = selectedLeaveType === "All Leave Type" || reqType === selType || reqType.toLowerCase() === selType.toLowerCase();
    const reqStatus = (request.status || "").toString().trim().toLowerCase();
    const selStatus = (selectedStatus || "").trim().toLowerCase();
    const matchStatus = selectedStatus === "All Status" || reqStatus === selStatus;
    return matchSearch && matchLeaveType && matchStatus;
  });

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCheckboxChange = (id) => {
    setSelectedRequests((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const handleSelectAll = () => {
    if (selectedRequests.length === paginatedData.length) setSelectedRequests([]);
    else setSelectedRequests(paginatedData.map((r) => r.id));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) setIsUserDropdownOpen(false);
      if (leaveTypeDropdownRef.current && !leaveTypeDropdownRef.current.contains(e.target)) setIsLeaveTypeDropdownOpen(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) setIsStatusDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      <div className="hidden lg:flex min-h-screen" style={{ overflowX: "hidden" }}>
        <Sidebar userRole={effectiveRole} activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogoutClick={() => setIsLogoutModalOpen(true)} />
        <main className="flex-1 flex flex-col bg-[#F5F7FA]" style={{ minWidth: 0, maxWidth: "100%", overflowX: "hidden" }}>
          <header className="bg-white px-[40px] py-[24px]" style={{ minWidth: 0, maxWidth: "100%", boxSizing: "border-box" }}>
            <div className="flex items-center justify-between mb-[16px]">
              <div className="relative flex-shrink-0">
                <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[280px] h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]"
                  style={{ fontWeight: 400 }}
                />
              </div>
              <div className="flex items-center gap-[16px] flex-shrink-0">
                <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={MessageIcon} alt="Messages" className="w-[20px] h-[20px] object-contain" />
                </button>
                <button className="relative w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={NotificationIcon} alt="Notifications" className="w-[20px] h-[20px] object-contain" />
                  <span className="absolute top-[4px] right-[4px] w-[8px] h-[8px] bg-red-500 rounded-full" />
                </button>
                <div className="relative" ref={userDropdownRef}>
                  <div className="flex items-center gap-[12px] cursor-pointer" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
                    <img src={UserAvatar} alt="User" className="w-[44px] h-[44px] rounded-full object-cover border-2 border-[#E5E7EB]" />
                    <div>
                      <div className="flex items-center gap-[6px]">
                        <p className="text-[16px] font-semibold text-[#333333]">Hi, {currentUser?.name || currentUser?.full_name || currentUser?.firstName || "User"}!</p>
                        <img src={DropdownArrow} alt="" className={`w-[14px] h-[14px] object-contain transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`} />
                      </div>
                      <p className="text-[12px] font-normal text-[#6B7280]">{roleDisplayNames[effectiveRole]}</p>
                    </div>
                  </div>
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50">
                      <div className="px-[16px] py-[8px]"><p className="text-[12px] text-[#6B7280]">{currentUser?.email || ""}</p></div>
                      <button className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA]" onClick={() => navigate("/profile")}>Edit Profile</button>
                      <div className="h-[1px] bg-[#DC2626] my-[4px]" />
                      <button type="button" onClick={() => { setIsUserDropdownOpen(false); setIsLogoutModalOpen(true); }} className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#DC2626] hover:bg-[#F5F7FA]">Log Out</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
              <span style={{ color: "#B0B0B0" }}>My Team</span>
              <span className="mx-[8px]" style={{ color: "#B0B0B0" }}>&gt;</span>
              <span style={{ color: "#8E8C8C" }}>Team Leave Requests</span>
            </p>
          </header>

          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: "hidden", maxWidth: "100%", width: "100%", boxSizing: "border-box" }}>
            <div className="mb-[24px]">
              <h1 className="text-[28px] font-semibold mb-[4px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#000000" }}>Team Leave Requests</h1>
              <p className="text-[14px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, color: "#6B7280" }}>Review and manage leave requests for your team members</p>
            </div>

            {error && <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

            {/* Summary Cards */}
            <div className="flex justify-center items-center gap-[16px] mt-[48px] mb-[48px] flex-wrap">
              {[
                { value: summaryStats.pending, label: "Pending", icon: PendingIcon },
                { value: summaryStats.approved, label: "Approved", icon: ApprovedIcon },
                { value: summaryStats.rejected, label: "Rejected", icon: RejectIcon },
              ].map(({ value, label, icon }) => (
                <div key={label} className="rounded-[10px] p-[24px] flex flex-col items-center justify-center" style={{ backgroundColor: "#E9F6F8B2", boxShadow: "0px 4px 4px rgba(0,0,0,0.25)", width: "240px", height: "136px" }}>
                  <div className="flex-shrink-0 flex items-center justify-center mb-3" style={{ width: 48, height: 48, minWidth: 48, minHeight: 48, borderRadius: '50%', backgroundColor: '#7AC1BB' }}>
                    <img src={icon} alt="" className="w-8 h-8 object-contain" />
                  </div>
                  <p className="text-[24px] font-bold text-[#00675E]" style={{ fontFamily: "Inter, sans-serif" }}>{value}</p>
                  <p className="text-[12px] font-medium text-[#3F817C]" style={{ fontFamily: "Inter, sans-serif" }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-[16px] mb-[24px] flex-wrap relative z-[10]">
              <div className="relative z-[50]" ref={leaveTypeDropdownRef}>
                <button type="button" onClick={(e) => { e.stopPropagation(); setIsLeaveTypeDropdownOpen(!isLeaveTypeDropdownOpen); }} onMouseDown={(e) => e.stopPropagation()} className="px-4 py-2.5 rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between min-w-[180px] hover:border-[#004D40]">
                  <span className="text-[14px] font-semibold text-[#000000]">{selectedLeaveType}</span>
                  <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isLeaveTypeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-50 min-w-[180px] max-h-[200px] overflow-y-auto">
                    {leaveTypes.map((type) => (
                      <button key={type} type="button" onClick={() => { setSelectedLeaveType(type); setIsLeaveTypeDropdownOpen(false); setCurrentPage(1); }} className={`w-full px-4 py-2.5 text-left text-[14px] first:rounded-t-[5px] last:rounded-b-[5px] ${selectedLeaveType === type ? "bg-[#E5E7EB] text-[#333333]" : "text-[#333333] hover:bg-[#F5F7FA]"}`}>{type}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative z-[50]" ref={statusDropdownRef}>
                <button type="button" onClick={(e) => { e.stopPropagation(); setIsStatusDropdownOpen(!isStatusDropdownOpen); }} onMouseDown={(e) => e.stopPropagation()} className="px-4 py-2.5 rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between min-w-[140px] hover:border-[#004D40]">
                  <span className="text-[14px] font-semibold text-[#000000]">{selectedStatus}</span>
                  <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-50 min-w-[140px]">
                    {statusOptions.map((status) => (
                      <button key={status} type="button" onClick={() => { setSelectedStatus(status); setIsStatusDropdownOpen(false); setCurrentPage(1); }} className={`w-full px-4 py-2.5 text-left text-[14px] first:rounded-t-[5px] last:rounded-b-[5px] ${selectedStatus === status ? "bg-[#E5E7EB] text-[#333333]" : "text-[#333333] hover:bg-[#F5F7FA]"}`}>{status}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex-1 min-w-[200px]">
                <input type="text" placeholder="Search by employee name" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full h-[40px] pl-9 pr-4 rounded-[5px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]" />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="bg-white rounded-[10px] p-[40px] text-center" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.1)" }}>
                <p className="text-[14px] text-[#6B7280]">Loading team leave requests...</p>
              </div>
            ) : (
              <div
                className="bg-white rounded-[10px] overflow-hidden w-full max-w-full focus:outline-none focus-within:ring-2 focus-within:ring-[#004D40]/20"
                style={{ boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="w-full max-w-full overflow-x-auto" style={{ overflowX: "auto" }}>
                  <table className="w-full" style={{ tableLayout: "auto", width: "100%", minWidth: "960px" }}>
                    <thead>
                      <tr className="border-b border-[#E0E0E0]">
                        <th className="px-[8px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: "nowrap", fontSize: "14px", width: "40px" }}>
                          <input type="checkbox" checked={paginatedData.length > 0 && selectedRequests.length === paginatedData.length} onChange={handleSelectAll} className="w-[16px] h-[16px] rounded border-[#E0E0E0]" />
                        </th>
                        <th className="px-[12px] py-[12px] text-left text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: "nowrap", fontSize: "14px", minWidth: "140px" }}>Employee name</th>
                        <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: "nowrap", fontSize: "14px", minWidth: "140px" }}>Leave Type</th>
                        <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: "nowrap", fontSize: "14px", minWidth: "160px" }}>Date Range</th>
                        <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: "nowrap", fontSize: "14px", minWidth: "120px" }}>Submitted Date</th>
                        <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: "nowrap", fontSize: "14px", minWidth: "90px" }}>Status</th>
                        <th className="px-[8px] py-[12px] text-center text-[#6B7280]" style={{ fontWeight: 500, whiteSpace: "nowrap", fontSize: "14px", width: "120px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length === 0 ? (
                        <tr><td colSpan={7} className="px-[12px] py-[40px] text-center" style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 400, color: "#6B7280" }}>No team leave requests found</td></tr>
                      ) : (
                        paginatedData.map((request) => (
                          <tr key={request.id} className="border-b border-[#E0E0E0] hover:bg-[#F9FAFB]">
                            <td className="px-[8px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: "nowrap" }}>
                              <input type="checkbox" checked={selectedRequests.includes(request.id)} onChange={() => handleCheckboxChange(request.id)} className="w-[16px] h-[16px] rounded border-[#E0E0E0]" />
                            </td>
                            <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-left min-w-0" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                              <div className="flex items-center gap-[12px] min-w-0">
                                <img src={request.employeePhoto} alt={request.employeeName} className="w-[32px] h-[32px] rounded-full object-cover flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = DefaultPhoto; }} />
                                <span className="text-[13px] text-[#333333] truncate" style={{ fontWeight: 600 }} title={request.employeeName}>{request.employeeName}</span>
                              </div>
                            </td>
                            <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center min-w-0" style={{ overflow: "hidden", textOverflow: "ellipsis" }} title={request.leaveType}>
                              <span className="text-[13px] text-[#333333] block truncate" style={{ fontWeight: 600 }}>{request.leaveType}</span>
                            </td>
                            <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center min-w-0" style={{ overflow: "hidden", textOverflow: "ellipsis" }} title={request.dateRange}>
                              <span className="text-[13px] text-[#333333] block truncate" style={{ fontWeight: 600 }}>{request.dateRange}</span>
                            </td>
                            <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: "nowrap" }}>
                              <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>{request.submittedDate}</span>
                            </td>
                            <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: "nowrap" }}>
                              <span className="text-[13px] inline-block px-[12px] py-[4px] rounded-[5px]" style={{ fontWeight: 500, fontSize: "13px", lineHeight: "100%", whiteSpace: "nowrap", color: request.status === "Pending" ? "#4A4A4A" : request.status === "Approved" ? "#00564F" : "#830000", backgroundColor: request.status === "Pending" ? "#D2D2D2B2" : request.status === "Approved" ? "#68BFCC" : "#FFBDB6B2", textAlign: "center" }}>{request.status}</span>
                            </td>
                            <td className="px-[8px] py-[12px] text-center" style={{ whiteSpace: "nowrap", position: "relative", zIndex: 1 }}>
                              <div className="flex items-center justify-center gap-[8px]">
                                <button type="button" className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer" title="View" onClick={() => { setSelectedRequest(request); setShowDetailsModal(true); }}>
                                  <img src={ViewIcon} alt="View" className="w-full h-full object-contain pointer-events-none" />
                                </button>
                                <div className="w-[1px] h-[22px] bg-[#E0E0E0]" />
                                <button type="button" disabled={request.status === "Approved" || request.status === "Rejected"} className={`w-[22px] h-[22px] flex items-center justify-center transition-opacity ${request.status === "Approved" || request.status === "Rejected" ? "opacity-50 cursor-not-allowed" : "hover:opacity-70 cursor-pointer"}`} title="Approve" onClick={async (e) => { e.stopPropagation(); if (request.status !== "Approved" && request.status !== "Rejected") try { await updateLeaveStatus(request.id, "approved"); fetchData(); } catch (_) {} }}>
                                  <img src={ApproveIcon} alt="Approve" className="w-full h-full object-contain pointer-events-none" />
                                </button>
                                <div className="w-[1px] h-[22px] bg-[#E0E0E0]" />
                                <button type="button" disabled={request.status === "Rejected"} className={`w-[22px] h-[22px] flex items-center justify-center transition-opacity ${request.status === "Rejected" ? "opacity-50 cursor-not-allowed" : "hover:opacity-70 cursor-pointer"}`} title="Reject" onClick={async (e) => { e.stopPropagation(); if (request.status !== "Rejected") try { await updateLeaveStatus(request.id, "rejected", "Rejected by manager"); fetchData(); } catch (_) {} }}>
                                  <img src={RejectActionIcon} alt="Reject" className="w-full h-full object-contain pointer-events-none" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 py-4 border-t border-[#E0E0E0]">
                    <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center disabled:opacity-50">‹</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} type="button" onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] ${currentPage === p ? "bg-[#027066] text-white" : "bg-white border border-[#E0E0E0]"}`}>{p}</button>
                    ))}
                    <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center disabled:opacity-50">›</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen bg-[#F5F7FA]">
        <header className="h-[70px] bg-white flex items-center justify-between px-[16px] sticky top-0 z-30 border-b border-[#E0E0E0]">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-[40px] h-[40px] rounded-[8px] bg-[#004D40] flex items-center justify-center hover:bg-[#003830] transition-colors">
            <svg className="w-[24px] h-[24px] text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div className="flex items-center gap-[12px]">
            <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
              <img src={MessageIcon} alt="Messages" className="w-[18px] h-[18px] object-contain" />
            </button>
            <button className="relative w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
              <img src={NotificationIcon} alt="Notifications" className="w-[18px] h-[18px] object-contain" />
              <span className="absolute top-[4px] right-[4px] w-[6px] h-[6px] bg-red-500 rounded-full" />
            </button>
            <div className="relative" ref={userDropdownRef}>
              <div className="flex items-center gap-[8px] cursor-pointer" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
                <img src={UserAvatar} alt="User" className="w-[36px] h-[36px] rounded-full object-cover border-2 border-[#E5E7EB]" />
                <img src={DropdownArrow} alt="" className={`w-[12px] h-[12px] object-contain transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""}`} />
              </div>
              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50">
                  <div className="px-[16px] py-[8px]"><p className="text-[12px] text-[#6B7280]">{currentUser?.email || ""}</p></div>
                  <button className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA]" onClick={() => { setIsUserDropdownOpen(false); navigate("/profile"); }}>Edit Profile</button>
                  <div className="h-[1px] bg-[#DC2626] my-[4px]" />
                  <button type="button" onClick={() => { setIsUserDropdownOpen(false); setIsLogoutModalOpen(true); }} className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#DC2626] hover:bg-[#F5F7FA]">Log Out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />}
        <div className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar userRole={effectiveRole} activeMenu={activeMenu} setActiveMenu={setActiveMenu} isMobile={true} onClose={() => setIsMobileMenuOpen(false)} onLogoutClick={() => setIsLogoutModalOpen(true)} />
        </div>
        <div className="flex-1 p-[16px] pb-10">
          <div className="mb-[16px]">
            <h1 className="text-[20px] font-semibold text-[#000000] mb-[4px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Team Leave Requests</h1>
            <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: "Inter, sans-serif" }}>Review and manage leave requests for your team members</p>
          </div>
          {/* Summary Cards - Mobile */}
          <div className="flex flex-col gap-[12px] mb-[16px]">
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] p-[16px] flex items-center gap-[12px]">
              <div className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#7AC1BB" }}><img src={PendingIcon} alt="Pending" className="w-[24px] h-[24px] object-contain" /></div>
              <div><p className="text-[14px] font-semibold text-[#00675E]">{summaryStats.pending}</p><p className="text-[12px] text-[#3F817C] font-medium">Pending</p></div>
            </div>
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] p-[16px] flex items-center gap-[12px]">
              <div className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#7AC1BB" }}><img src={ApprovedIcon} alt="Approved" className="w-[24px] h-[24px] object-contain" /></div>
              <div><p className="text-[14px] font-semibold text-[#00675E]">{summaryStats.approved}</p><p className="text-[12px] text-[#3F817C] font-medium">Approved</p></div>
            </div>
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] p-[16px] flex items-center gap-[12px]">
              <div className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#7AC1BB" }}><img src={RejectIcon} alt="Rejected" className="w-[24px] h-[24px] object-contain" /></div>
              <div><p className="text-[14px] font-semibold text-[#00675E]">{summaryStats.rejected}</p><p className="text-[12px] text-[#3F817C] font-medium">Rejected</p></div>
            </div>
          </div>
          {/* Filters - Mobile */}
          <div className="flex flex-col gap-[12px] mb-[16px]">
            <div className="relative" ref={leaveTypeDropdownRef}>
              <button type="button" onClick={() => setIsLeaveTypeDropdownOpen(!isLeaveTypeDropdownOpen)} className="w-full h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#000000]">{selectedLeaveType}</span>
                <svg className="w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isLeaveTypeDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-10 max-h-[200px] overflow-y-auto">
                  {leaveTypes.map((type) => (
                    <button key={type} type="button" onClick={() => { setSelectedLeaveType(type); setIsLeaveTypeDropdownOpen(false); setCurrentPage(1); }} className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[10px] last:rounded-b-[10px]">{type}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" ref={statusDropdownRef}>
              <button type="button" onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} className="w-full h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#000000]">{selectedStatus}</span>
                <svg className="w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-10">
                  {statusOptions.map((status) => (
                    <button key={status} type="button" onClick={() => { setSelectedStatus(status); setIsStatusDropdownOpen(false); setCurrentPage(1); }} className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[10px] last:rounded-b-[10px]">{status}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <input type="text" placeholder="Search by employee name" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]" />
            </div>
          </div>
          {error && <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          {loading && <div className="py-8 text-center text-[14px] text-[#6B7280]">Loading team leave requests...</div>}
          {!loading && (
            <>
              <div className="flex flex-col gap-[12px]">
                {paginatedData.map((request) => (
                  <div key={request.id} className="bg-white rounded-[12px] border border-[#E0E0E0] shadow-sm p-[16px]">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#F0F0F0]">
                      <img src={request.employeePhoto} alt={request.employeeName} className="w-[48px] h-[48px] rounded-full object-cover flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = DefaultPhoto; }} />
                      <div className="flex-1 min-w-0"><h3 className="text-[15px] font-semibold text-[#000000] truncate">{request.employeeName}</h3><p className="text-[12px] text-[#6B7280]">{request.leaveType}</p></div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between"><span className="text-[12px] text-[#6B7280]">Date Range:</span><span className="text-[13px] font-semibold text-[#000000]">{request.dateRange}</span></div>
                      <div className="flex items-center justify-between"><span className="text-[12px] text-[#6B7280]">Submitted:</span><span className="text-[13px] font-semibold text-[#000000]">{request.submittedDate}</span></div>
                      <div className="flex items-center justify-between"><span className="text-[12px] text-[#6B7280]">Status:</span><span className="inline-block px-[14px] py-[6px] rounded-[8px] text-[13px] font-bold" style={{ color: request.status === "Pending" ? "#4A4A4A" : request.status === "Approved" ? "#00564F" : "#830000", backgroundColor: request.status === "Pending" ? "#D2D2D2B2" : request.status === "Approved" ? "#68BFCC" : "#FFBDB6B2" }}>{request.status}</span></div>
                    </div>
                    <div className="flex items-center justify-center gap-[8px]">
                      <button type="button" onClick={() => { setSelectedRequest(request); setShowDetailsModal(true); }} className="w-[32px] h-[32px] flex items-center justify-center hover:opacity-70 transition-opacity" title="View"><img src={ViewIcon} alt="View" className="w-[22px] h-[22px] object-contain" /></button>
                      <div className="w-[1px] h-[22px] bg-[#E0E0E0]" />
                      <button type="button" disabled={request.status === "Approved" || request.status === "Rejected"} onClick={async () => { if (request.status !== "Approved" && request.status !== "Rejected") try { await updateLeaveStatus(request.id, "approved"); fetchData(); } catch (_) {} }} className={`w-[32px] h-[32px] flex items-center justify-center transition-opacity ${request.status === "Approved" || request.status === "Rejected" ? "opacity-50 cursor-not-allowed" : "hover:opacity-70"}`} title="Approve"><img src={ApproveIcon} alt="Approve" className="w-[22px] h-[22px] object-contain" /></button>
                      <div className="w-[1px] h-[22px] bg-[#E0E0E0]" />
                      <button type="button" disabled={request.status === "Rejected"} onClick={async () => { if (request.status !== "Rejected") try { await updateLeaveStatus(request.id, "rejected", "Rejected by manager"); fetchData(); } catch (_) {} }} className={`w-[32px] h-[32px] flex items-center justify-center transition-opacity ${request.status === "Rejected" ? "opacity-50 cursor-not-allowed" : "hover:opacity-70"}`} title="Reject"><img src={RejectActionIcon} alt="Reject" className="w-[22px] h-[22px] object-contain" /></button>
                    </div>
                  </div>
                ))}
              </div>
              {paginatedData.length === 0 && <div className="py-[60px] text-center"><p className="text-[16px] text-[#6B7280]">No team leave requests found</p></div>}
              {totalPages > 1 && (
                <div className="mt-[24px] flex items-center justify-center gap-[8px]">
                  <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center disabled:opacity-50"><svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setCurrentPage(p)} className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-[14px] bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA] ${currentPage === p ? "font-semibold border-[#027066] text-[#027066]" : ""}`}>{p}</button>
                  ))}
                  <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center disabled:opacity-50"><svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Leave request details modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center" style={{ zIndex: 9998 }} onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-[10px] shadow-lg w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[18px] font-semibold text-[#333333] mb-4" style={{ fontFamily: "Inter, sans-serif" }}>Leave Request Details</h3>
            <div className="space-y-3 text-[14px]">
              <div className="flex items-center gap-3">
                <img src={selectedRequest.employeePhoto} alt={selectedRequest.employeeName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = DefaultPhoto; }} />
                <div>
                  <p className="font-semibold text-[#333333]">{selectedRequest.employeeName}</p>
                  <p className="text-[#6B7280]">{selectedRequest.leaveType}</p>
                </div>
              </div>
              <p><span className="text-[#6B7280]">Date Range:</span> <span className="font-medium">{selectedRequest.dateRange}</span></p>
              <p><span className="text-[#6B7280]">Submitted:</span> <span className="font-medium">{selectedRequest.submittedDate}</span></p>
              <p><span className="text-[#6B7280]">Status:</span> <span className="font-medium">{selectedRequest.status}</span></p>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => { setShowDetailsModal(false); setSelectedRequest(null); }} className="px-4 py-2 rounded-[5px] border border-[#E0E0E0] bg-white text-[14px] font-medium text-[#333333] hover:bg-[#F5F7FA]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
          window.location.href = "/login";
        }}
      />
    </div>
  );
};

export default TeamLeaveRequestsPage;
