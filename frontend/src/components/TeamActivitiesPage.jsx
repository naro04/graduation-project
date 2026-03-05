import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import LogoutModal from "./LogoutModal";
import HeaderIcons from "./HeaderIcons";
import { getEffectiveRole, getCurrentUser, logout } from "../services/auth.js";
import { getLocationActivities, deleteLocationActivity } from "../services/locationActivities";
import { getTeamMembers } from "../services/employees.js";
import ManagerAssignActivityModal from "./ManagerAssignActivityModal";
import ManagerChooseActivityModal from "./ManagerChooseActivityModal";

const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;
const PlannedIcon = new URL("../images/icons/planned.png", import.meta.url).href;
const CalendarIcon = new URL("../images/icons/calender.png", import.meta.url).href;
const ApprovedIcon = new URL("../images/icons/approved.png", import.meta.url).href;
const PendingIcon = new URL("../images/icons/pending.png", import.meta.url).href;
const ViewIcon = new URL("../images/icons/eye.png", import.meta.url).href;
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;
const WarningIcon = new URL("../images/icons/warnning.png", import.meta.url).href;

const roleDisplayNames = {
  superAdmin: "Super Admin",
  hr: "HR Admin",
  manager: "Manager",
  fieldEmployee: "Field Employee",
  officer: "Officer",
};

const formatDate = (date) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const TeamActivitiesPage = ({ userRole = "manager" }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const effectiveRole = getEffectiveRole();
  const [activeMenu, setActiveMenu] = useState("2-3");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("All Approval Status");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isApprovalStatusDropdownOpen, setIsApprovalStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [activitiesFromApi, setActivitiesFromApi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showChooseActivityModal, setShowChooseActivityModal] = useState(false);
  const [preselectedActivityId, setPreselectedActivityId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const userDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const approvalStatusDropdownRef = useRef(null);
  const dateInputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getTeamMembers().catch(() => []),
      getLocationActivities().catch(() => []),
    ]).then(([team, list]) => {
      if (cancelled) return;
      setTeamMembers(Array.isArray(team) ? team : []);
      setActivitiesFromApi(Array.isArray(list) ? list : list?.activities ?? []);
    }).catch((err) => {
      if (!cancelled) setError(err?.message || "Failed to load data");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [refreshKey]);

  const teamIds = useMemo(() => (teamMembers || []).map((m) => m.id), [teamMembers]);
  const teamNamesSet = useMemo(() => {
    const set = new Set();
    (teamMembers || []).forEach((m) => {
      const name = (m.full_name || [m.first_name, m.last_name].filter(Boolean).join(" ")).trim().toLowerCase();
      if (name) set.add(name);
    });
    return set;
  }, [teamMembers]);

  const activitiesData = useMemo(() => {
    const raw = (activitiesFromApi || []).filter((a) => {
      const empId = a.employee_id ?? a.employeeId;
      const name = (a.responsible_employee ?? a.responsibleEmployee ?? "").toString().trim().toLowerCase();
      return (empId && teamIds.includes(empId)) || (name && teamNamesSet.has(name));
    });
    return raw.map((a) => {
      const approvalRaw = (a.approval_status ?? a.approvalStatus ?? "").toString();
      const approval = approvalRaw ? approvalRaw.charAt(0).toUpperCase() + approvalRaw.slice(1).toLowerCase() : "";
      const statusRaw = (a.status ?? a.implementation_status ?? "").toString();
      const status = statusRaw === "Implemented" || statusRaw === "Planned" ? statusRaw : (statusRaw || "Planned");
      return {
        id: a.id,
        activity: a.name ?? a.activity_name ?? "",
        type: a.type ?? a.activity_type ?? "—",
        project: a.project ?? "—",
        responsibleEmployee: a.responsible_employee ?? a.responsibleEmployee ?? "—",
        status,
        approval: approval === "Approved" || approval === "Rejected" || approval === "Pending" ? approval : (approval || "—"),
      };
    });
  }, [activitiesFromApi, teamIds, teamNamesSet]);

  const summaryStats = useMemo(() => ({
    planned: activitiesData.filter((a) => a.status === "Planned").length,
    implemented: activitiesData.filter((a) => a.status === "Implemented").length,
    approved: activitiesData.filter((a) => a.approval === "Approved").length,
    pending: activitiesData.filter((a) => a.approval === "Pending").length,
  }), [activitiesData]);

  const statusOptions = ["All Status", "Planned", "Implemented"];
  const approvalStatusOptions = ["All Approval Status", "Approved", "Rejected", "Pending"];

  const filteredData = activitiesData.filter((activity) => {
    const matchSearch = (activity.activity || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = selectedStatus === "All Status" || activity.status === selectedStatus;
    const matchApproval = selectedApprovalStatus === "All Approval Status" || activity.approval === selectedApprovalStatus;
    return matchSearch && matchStatus && matchApproval;
  });

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCheckboxChange = (id) => {
    setSelectedActivities((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const handleSelectAll = () => {
    if (selectedActivities.length === paginatedData.length) setSelectedActivities([]);
    else setSelectedActivities(paginatedData.map((a) => a.id));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) setIsUserDropdownOpen(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) setIsStatusDropdownOpen(false);
      if (approvalStatusDropdownRef.current && !approvalStatusDropdownRef.current.contains(e.target)) setIsApprovalStatusDropdownOpen(false);
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
                <HeaderIcons />
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
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsUserDropdownOpen(false); setIsLogoutModalOpen(true); }} className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#DC2626] hover:bg-[#F5F7FA] transition-colors">Log Out</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
              <span style={{ color: "#B0B0B0" }}>My Team</span>
              <span className="mx-[8px]" style={{ color: "#B0B0B0" }}>&gt;</span>
              <span style={{ color: "#8E8C8C" }}>Team Activities</span>
            </p>
          </header>

          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: "hidden", maxWidth: "100%", width: "100%", boxSizing: "border-box" }}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-[32px]">
              <div>
                <h1 className="text-[24px] mb-[4px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#000000" }}>Team Activities</h1>
                <p className="text-[14px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, color: "#6B7280" }}>View activities for your team members</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowChooseActivityModal(true)}
                  className="px-[20px] py-[12px] rounded-[5px] border border-[#E0E0E0] bg-white text-[14px] font-medium text-[#374151] hover:bg-[#F5F7FA] transition-opacity flex items-center justify-center gap-[8px]"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, height: "46px", minWidth: "160px" }}
                >
                  Choose activity
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(true)}
                  className="px-[20px] py-[12px] text-white rounded-[5px] hover:opacity-90 transition-opacity flex items-center justify-center gap-[8px] border border-[#B5B1B1] whitespace-nowrap"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", backgroundColor: "#0C8DFE", height: "46px", minWidth: "205px" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Assign team to activity
                </button>
              </div>
            </div>

            {error && <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

            {/* Summary Cards */}
            <div className="flex justify-center items-center gap-[16px] mt-[48px] mb-[48px] flex-wrap">
              {[
                { value: summaryStats.planned, label: "Planned Activities", icon: PlannedIcon },
                { value: summaryStats.implemented, label: "Implemented Activities", icon: CalendarIcon },
                { value: summaryStats.approved, label: "Approved Activities", icon: ApprovedIcon },
                { value: summaryStats.pending, label: "Pending Activities", icon: PendingIcon },
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
            <div className="flex items-center gap-[8px] mb-[24px] flex-wrap">
              <div className="relative flex-shrink-0" ref={statusDropdownRef}>
                <button onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} className="h-[44px] px-4 rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between min-w-[200px]">
                  <span className="text-[14px] font-semibold text-[#000000]">{selectedStatus}</span>
                  <svg className="w-4 h-4 text-[#6B7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9L12 15L18 9" /></svg>
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg min-w-[200px] z-50">
                    {statusOptions.map((st) => (
                      <button key={st} onClick={() => { setSelectedStatus(st); setIsStatusDropdownOpen(false); }} className="w-full px-4 py-3 text-left text-[14px] hover:bg-[#F5F7FA] first:rounded-t-[10px] last:rounded-b-[10px]">{st}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex-shrink-0" ref={approvalStatusDropdownRef}>
                <button onClick={() => setIsApprovalStatusDropdownOpen(!isApprovalStatusDropdownOpen)} className="h-[44px] px-4 rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between min-w-[200px]">
                  <span className="text-[14px] font-semibold text-[#000000]">{selectedApprovalStatus}</span>
                  <svg className="w-4 h-4 text-[#6B7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9L12 15L18 9" /></svg>
                </button>
                {isApprovalStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg min-w-[200px] z-50">
                    {approvalStatusOptions.map((st) => (
                      <button key={st} onClick={() => { setSelectedApprovalStatus(st); setIsApprovalStatusDropdownOpen(false); }} className="w-full px-4 py-3 text-left text-[14px] hover:bg-[#F5F7FA] first:rounded-t-[10px] last:rounded-b-[10px]">{st}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex-1 min-w-[180px]">
                <input type="text" placeholder="Search by activity name" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-[44px] pl-12 pr-4 rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]" />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="bg-white rounded-[10px] p-[40px] text-center" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.1)" }}>
                <p className="text-[14px] text-[#6B7280]">Loading team activities...</p>
              </div>
            ) : (
              <div className="bg-white rounded-[10px] overflow-hidden" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.1)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E0E0E0]">
                        <th className="px-3 py-3 text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, fontSize: "14px" }}>
                          <input type="checkbox" checked={paginatedData.length > 0 && selectedActivities.length === paginatedData.length} onChange={handleSelectAll} className="w-4 h-4 rounded border-[#E0E0E0]" />
                        </th>
                        <th className="px-3 py-3 text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, fontSize: "14px" }}>Activity</th>
                        <th className="px-3 py-3 text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, fontSize: "14px" }}>Type</th>
                        <th className="px-3 py-3 text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, fontSize: "14px" }}>Project</th>
                        <th className="px-3 py-3 text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, fontSize: "14px" }}>Responsible Employee</th>
                        <th className="px-3 py-3 text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, fontSize: "14px" }}>Status</th>
                        <th className="px-3 py-3 text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, fontSize: "14px" }}>Approval</th>
                        <th className="px-3 py-3 text-center text-[#6B7280]" style={{ fontWeight: 500, fontSize: "14px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length === 0 ? (
                        <tr><td colSpan={8} className="py-10 text-center text-[14px] text-[#6B7280]">No team activities found</td></tr>
                      ) : (
                        paginatedData.map((activity) => (
                          <tr key={activity.id} className="border-b border-[#E0E0E0] hover:bg-[#F9FAFB]">
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-center">
                              <input type="checkbox" checked={selectedActivities.includes(activity.id)} onChange={() => handleCheckboxChange(activity.id)} className="w-4 h-4 rounded border-[#E0E0E0]" />
                            </td>
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-center text-[13px] font-semibold text-[#333333]">{activity.activity}</td>
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-center text-[13px] font-semibold text-[#333333]">{activity.type}</td>
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-center text-[13px] font-semibold text-[#333333]">{activity.project}</td>
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-center text-[13px] font-semibold text-[#333333]">{activity.responsibleEmployee}</td>
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-center text-[13px] font-semibold text-[#333333]">{activity.status}</td>
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-center">
                              <span className={`text-[13px] font-semibold inline-block py-1 px-2 rounded ${activity.approval === "Pending" ? "bg-[#E5E7EB] text-[#6B6B6B]" : activity.approval === "Approved" ? "bg-[#68BFCC] text-[#00564F]" : activity.approval === "Rejected" ? "bg-[#FFBDB6B2] text-[#830000]" : ""}`}>
                                {activity.approval}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <div className="flex items-center justify-center gap-0">
                                <button type="button" onClick={() => { setSelectedActivityForDetails(activity); setShowDetailsModal(true); }} className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70" title="View"><img src={ViewIcon} alt="View" className="w-full h-full object-contain" /></button>
                                <div className="w-px h-[22px] bg-[#E0E0E0] mx-2" />
                                <button type="button" onClick={() => { setActivityToDelete(activity); setShowWarningModal(true); }} className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70" title="Delete"><img src={DeleteIcon} alt="Delete" className="w-full h-full object-contain" /></button>
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
            <HeaderIcons iconSize="w-[18px] h-[18px]" />
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
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsUserDropdownOpen(false); setIsLogoutModalOpen(true); }} className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#DC2626] hover:bg-[#F5F7FA] transition-colors">Log Out</button>
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
            <h1 className="text-[20px] font-semibold text-[#000000] mb-[4px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Team Activities</h1>
            <p className="text-[12px] text-[#6B7280] mb-3" style={{ fontFamily: "Inter, sans-serif" }}>View activities for your team members</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowChooseActivityModal(true)}
                className="w-full h-[46px] rounded-[5px] border border-[#E0E0E0] bg-white text-[14px] font-medium text-[#374151] hover:bg-[#F5F7FA] flex items-center justify-center gap-[8px]"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}
              >
                Choose activity
              </button>
              <button
                type="button"
                onClick={() => setShowAssignModal(true)}
                className="w-full h-[46px] rounded-[5px] text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-[8px] border border-[#B5B1B1] whitespace-nowrap"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", backgroundColor: "#0C8DFE" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Assign team to activity
              </button>
            </div>
          </div>
          {/* Summary Cards - Mobile */}
          <div className="flex flex-col gap-[12px] mb-[16px]">
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] p-[16px] flex items-center gap-[12px]">
              <div className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#7AC1BB" }}><img src={PlannedIcon} alt="Planned" className="w-[24px] h-[24px] object-contain" /></div>
              <div><p className="text-[14px] font-semibold text-[#00675E]">{summaryStats.planned}</p><p className="text-[12px] text-[#3F817C] font-medium">Planned Activities</p></div>
            </div>
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] p-[16px] flex items-center gap-[12px]">
              <div className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#7AC1BB" }}><img src={CalendarIcon} alt="Implemented" className="w-[24px] h-[24px] object-contain" /></div>
              <div><p className="text-[14px] font-semibold text-[#00675E]">{summaryStats.implemented}</p><p className="text-[12px] text-[#3F817C] font-medium">Implemented Activities</p></div>
            </div>
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] p-[16px] flex items-center gap-[12px]">
              <div className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#7AC1BB" }}><img src={ApprovedIcon} alt="Approved" className="w-[24px] h-[24px] object-contain" /></div>
              <div><p className="text-[14px] font-semibold text-[#00675E]">{summaryStats.approved}</p><p className="text-[12px] text-[#3F817C] font-medium">Approved Activities</p></div>
            </div>
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] p-[16px] flex items-center gap-[12px]">
              <div className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#7AC1BB" }}><img src={PendingIcon} alt="Pending" className="w-[24px] h-[24px] object-contain" /></div>
              <div><p className="text-[14px] font-semibold text-[#00675E]">{summaryStats.pending}</p><p className="text-[12px] text-[#3F817C] font-medium">Pending Activities</p></div>
            </div>
          </div>
          {/* Filters - Mobile */}
          <div className="flex flex-col gap-[12px] mb-[16px]">
            <div className="relative" ref={statusDropdownRef}>
              <button onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} className="w-full h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#000000]">{selectedStatus}</span>
                <svg className="w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9L12 15L18 9" /></svg>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-10">
                  {statusOptions.map((st) => (
                    <button key={st} onClick={() => { setSelectedStatus(st); setIsStatusDropdownOpen(false); }} className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[10px] last:rounded-b-[10px]">{st}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" ref={approvalStatusDropdownRef}>
              <button onClick={() => setIsApprovalStatusDropdownOpen(!isApprovalStatusDropdownOpen)} className="w-full h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#000000]">{selectedApprovalStatus}</span>
                <svg className="w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9L12 15L18 9" /></svg>
              </button>
              {isApprovalStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-10">
                  {approvalStatusOptions.map((st) => (
                    <button key={st} onClick={() => { setSelectedApprovalStatus(st); setIsApprovalStatusDropdownOpen(false); }} className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[10px] last:rounded-b-[10px]">{st}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <input type="text" placeholder="Search by activity name" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]" />
            </div>
          </div>
          {error && <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          {loading && <div className="py-8 text-center text-[14px] text-[#6B7280]">Loading team activities...</div>}
          {!loading && (
            <>
              <div className="flex flex-col gap-[12px]">
                {paginatedData.map((activity) => (
                  <div key={activity.id} className="bg-white rounded-[10px] border border-[#E0E0E0] shadow-sm p-[16px]">
                    <div className="flex items-start justify-between mb-[12px]">
                      <div className="flex items-center gap-[12px]">
                        <div className="w-[40px] h-[40px] rounded-full bg-[#E5E7EB] flex items-center justify-center flex-shrink-0 text-[16px] font-semibold text-[#6B7280]">{(activity.responsibleEmployee || "?")[0]}</div>
                        <div><p className="text-[14px] font-medium text-[#111827] mb-[2px]">{activity.activity}</p><p className="text-[12px] text-[#6B7280]">{activity.project}</p></div>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <button type="button" onClick={() => { setSelectedActivityForDetails(activity); setShowDetailsModal(true); }} className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors" title="View"><img src={ViewIcon} alt="View" className="w-[16px] h-[16px] object-contain" /></button>
                        <button type="button" onClick={() => { setActivityToDelete(activity); setShowWarningModal(true); }} className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors" title="Delete"><img src={DeleteIcon} alt="Delete" className="w-[16px] h-[16px] object-contain" /></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-[8px] mb-[12px]">
                      <span className="inline-block px-[12px] py-[4px] rounded-[6px] bg-[#E0F2FE] text-[#0369A1] text-[12px] font-medium">{activity.type}</span>
                      <span className="inline-block px-[12px] py-[4px] rounded-[6px] text-[12px] font-medium bg-[#F3F4F6] text-[#374151]">{activity.status}</span>
                      <span className={`inline-block px-[12px] py-[4px] rounded-[6px] text-[12px] font-medium ${activity.approval === "Pending" ? "bg-[#E5E7EB] text-[#6B6B6B]" : activity.approval === "Approved" ? "bg-[#68BFCC] text-[#00564F]" : activity.approval === "Rejected" ? "bg-[#FFBDB6B2] text-[#830000]" : "bg-[#F3F4F6] text-[#374151]"}`}>{activity.approval}</span>
                    </div>
                    <p className="text-[12px] text-[#6B7280]"><span className="font-medium text-[#374151]">Responsible:</span> {activity.responsibleEmployee}</p>
                  </div>
                ))}
              </div>
              {paginatedData.length === 0 && <div className="py-[60px] text-center"><p className="text-[16px] text-[#6B7280]">No team activities found</p></div>}
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

      {/* Activity details modal */}
      {showDetailsModal && selectedActivityForDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowDetailsModal(false); setSelectedActivityForDetails(null); }}>
          <div className="bg-white rounded-[10px] shadow-lg w-full max-w-[400px] mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[18px] font-semibold text-[#003934] mb-4" style={{ fontFamily: "Inter, sans-serif" }}>Activity Details</h3>
            <div className="space-y-2 text-[14px]">
              <p><span className="text-[#6B7280]">Activity:</span> <span className="font-medium">{selectedActivityForDetails.activity}</span></p>
              <p><span className="text-[#6B7280]">Type:</span> <span className="font-medium">{selectedActivityForDetails.type}</span></p>
              <p><span className="text-[#6B7280]">Project:</span> <span className="font-medium">{selectedActivityForDetails.project}</span></p>
              <p><span className="text-[#6B7280]">Responsible:</span> <span className="font-medium">{selectedActivityForDetails.responsibleEmployee}</span></p>
              <p><span className="text-[#6B7280]">Status:</span> <span className="font-medium">{selectedActivityForDetails.status}</span></p>
              <p><span className="text-[#6B7280]">Approval:</span> <span className="font-medium">{selectedActivityForDetails.approval}</span></p>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => { setShowDetailsModal(false); setSelectedActivityForDetails(null); }} className="px-4 py-2 rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] font-medium text-[#333333] hover:bg-[#F5F7FA]">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete activity warning modal */}
      {showWarningModal && activityToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowWarningModal(false); setActivityToDelete(null); }}>
          <div className="bg-white shadow-lg relative rounded-[8px] w-full max-w-[469px] mx-4 overflow-hidden" style={{ background: "linear-gradient(180deg, #FFDBDB 0%, #FFFFFF 100%)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-10 pb-5"><img src={WarningIcon} alt="Warning" className="w-[73px] h-[61px] object-contain" /></div>
            <p className="text-center text-[#B70B0B] font-semibold text-[16px] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>Warning</p>
            <p className="text-center text-[#000000] text-[16px] px-5 mb-1" style={{ fontFamily: "Inter, sans-serif" }}>Are you sure you want to delete this activity?</p>
            <p className="text-center text-[#4E4E4E] text-[10px] px-5 pb-10" style={{ fontFamily: "Inter, sans-serif" }}>This action can&apos;t be undone</p>
            <div className="flex items-center justify-center gap-5 px-5 pb-6">
              <button type="button" onClick={async () => { try { await deleteLocationActivity(activityToDelete.id); setRefreshKey((k) => k + 1); } catch (_) { } setShowWarningModal(false); setActivityToDelete(null); }} className="px-6 py-2 text-white text-[16px] font-semibold rounded bg-[#A20000] hover:bg-[#8a0000]" style={{ fontFamily: "Inter, sans-serif" }}>Delete</button>
              <button type="button" onClick={() => { setShowWarningModal(false); setActivityToDelete(null); }} className="px-6 py-2 text-white text-[16px] font-semibold rounded bg-[#7A7A7A] hover:bg-[#666]" style={{ fontFamily: "Inter, sans-serif" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ManagerChooseActivityModal
        isOpen={showChooseActivityModal}
        onClose={() => setShowChooseActivityModal(false)}
        onSelectActivity={(activityId) => {
          setPreselectedActivityId(activityId);
          setShowChooseActivityModal(false);
          setShowAssignModal(true);
        }}
      />
      <ManagerAssignActivityModal
        isOpen={showAssignModal}
        onClose={() => { setShowAssignModal(false); setPreselectedActivityId(null); }}
        teamMembers={teamMembers}
        onSuccess={() => setRefreshKey((k) => k + 1)}
        preselectedActivityId={preselectedActivityId}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          setIsLogoutModalOpen(false);
          await logout();
          window.location.href = "/login";
        }}
      />
    </div>
  );
};

export default TeamActivitiesPage;
