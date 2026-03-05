import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import LogoutModal from "./LogoutModal";
import HeaderIcons from "./HeaderIcons";
import { getEffectiveRole, getCurrentUser, logout } from "../services/auth.js";
import { getTeamAttendance, getAttendanceLocations, deleteAttendance } from "../services/attendance";
import { getTeamMembers } from "../services/employees.js";
import { exportToExcel, exportToPdf } from "../utils/exportReport";
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
const AttendanceIcon = new URL("../images/icons/Attendance1.png", import.meta.url).href;
const NotWorkingIcon = new URL("../images/icons/notworking.png", import.meta.url).href;
const HurryIcon = new URL("../images/icons/hurry.png", import.meta.url).href;
const ViewIcon = new URL("../images/icons/eye.png", import.meta.url).href;
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;
const ExportIcon = new URL("../images/icons/export.png", import.meta.url).href;
const DefaultPhoto = new URL("../images/Mohamed Ali.jpg", import.meta.url).href;
const WarningIcon = new URL("../images/icons/warnning.png", import.meta.url).href;

const roleDisplayNames = {
  superAdmin: "Super Admin",
  hr: "HR Admin",
  manager: "Manager",
  fieldEmployee: "Field Employee",
  officer: "Officer",
};

const formatTimeForDisplay = (val) => {
  if (val == null || val === "") return "—";
  const d = typeof val === "string" ? new Date(val) : val;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const formatDate = (date) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const ATTENDANCE_EXPORT_COLUMNS = [
  { key: "name", label: "Employee" },
  { key: "employeeId", label: "Employee ID" },
  { key: "checkIn", label: "Check-in" },
  { key: "checkOut", label: "Check-out" },
  { key: "attendanceType", label: "Attendance Type" },
  { key: "location", label: "Location" },
  { key: "status", label: "Status" },
];

const TeamAttendancePage = ({ userRole = "manager" }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const effectiveRole = getEffectiveRole();
  const [activeMenu, setActiveMenu] = useState("2-2");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isExportAllDropdownOpen, setIsExportAllDropdownOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [attendanceFromApi, setAttendanceFromApi] = useState([]);
  const [attendanceLocations, setAttendanceLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] = useState(null);
  const userDropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const exportAllDropdownRef = useRef(null);
  const dateInputRef = useRef(null);

  const dateParam = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
    : "";

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getTeamMembers().catch(() => []),
      dateParam ? getTeamAttendance({ date: dateParam }).catch(() => []) : Promise.resolve([]),
      getAttendanceLocations().catch(() => []),
    ]).then(([team, list, locations]) => {
      if (cancelled) return;
      setTeamMembers(Array.isArray(team) ? team : []);
      setAttendanceFromApi(Array.isArray(list) ? list : []);
      setAttendanceLocations(Array.isArray(locations) ? locations : []);
    }).catch((err) => {
      if (!cancelled) setError(err?.message || "Failed to load data");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [dateParam]);

  const refreshAttendance = () => {
    if (!dateParam) return;
    getTeamAttendance({ date: dateParam }).then((list) => setAttendanceFromApi(Array.isArray(list) ? list : [])).catch(() => { });
  };

  const teamIds = useMemo(() => (teamMembers || []).map((m) => m.id), [teamMembers]);

  const attendanceData = useMemo(() => {
    const raw = (attendanceFromApi || []).filter(
      (r) => teamIds.length === 0 || teamIds.includes(r.employee_id || r.employeeId)
    );
    return raw.map((r) => ({
      id: r.id ?? r.attendance_id,
      name: r.employeeName ?? r.employee_name ?? r.name ?? "—",
      employeeId: r.employeeCode ?? r.employee_id ?? r.employeeId ?? "—",
      checkIn: formatTimeForDisplay(r.checkInAt ?? r.check_in ?? r.check_in_time ?? r.checkIn),
      checkOut: formatTimeForDisplay(r.checkOutAt ?? r.check_out ?? r.check_out_time ?? r.checkOut),
      attendanceType: r.attendanceType ?? r.attendance_type ?? r.type ?? "—",
      location: r.location ?? r.location_name ?? r.location_address ?? "—",
      status: r.status ?? "Present",
      photo: toAbsoluteAvatarUrl(r.avatar_url ?? r.avatarUrl) || r.photo || DefaultPhoto,
    }));
  }, [attendanceFromApi, teamIds]);

  const summaryStats = useMemo(() => {
    const present = attendanceData.length;
    const teamSize = teamIds.length;
    const absent = Math.max(0, teamSize - present);
    const lateArrivals = attendanceData.filter((e) => (e.status || "").toLowerCase() === "late").length;
    return { present, absent, lateArrivals };
  }, [attendanceData, teamIds.length]);

  const locationOptions = ["All Locations", ...(attendanceLocations || []).map((l) => l.name ?? l.location_name ?? "")].filter(Boolean);

  const filteredData = attendanceData.filter((emp) => {
    const matchSearch =
      (emp.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(emp.employeeId || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchLocation = selectedLocation === "All Locations" || emp.location === selectedLocation;
    const matchStatus = selectedStatus === "All Status" || emp.status === selectedStatus;
    return matchSearch && matchLocation && matchStatus;
  });

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCheckboxChange = (id) => {
    setSelectedEmployees((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const handleSelectAll = () => {
    if (selectedEmployees.length === paginatedData.length) setSelectedEmployees([]);
    else setSelectedEmployees(paginatedData.map((e) => e.id));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) setIsUserDropdownOpen(false);
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target)) setIsLocationDropdownOpen(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) setIsStatusDropdownOpen(false);
      if (exportAllDropdownRef.current && !exportAllDropdownRef.current.contains(e.target)) setIsExportAllDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      <div className="hidden lg:flex min-h-screen" style={{ overflowX: "hidden" }}>
        <Sidebar
          userRole={effectiveRole}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onLogoutClick={() => setIsLogoutModalOpen(true)}
        />
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
              <span style={{ color: "#8E8C8C" }}>Team Attendance</span>
            </p>
          </header>

          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: "hidden", maxWidth: "100%", width: "100%", boxSizing: "border-box" }}>
            <div className="mb-[20px] flex items-start justify-between">
              <div>
                <h1 className="text-[24px] mb-[8px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#000000" }}>Team Attendance</h1>
                <p className="text-[14px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, color: "#6B7280" }}>View & manage attendance for your team members</p>
              </div>
              <div className="relative" ref={exportAllDropdownRef}>
                <button onClick={() => setIsExportAllDropdownOpen(!isExportAllDropdownOpen)} className="flex items-center gap-[4px] text-[14px] text-[#505050]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}>
                  Export All <img src={ExportIcon} alt="Export" className="w-[16px] h-[16px]" />
                </button>
                {isExportAllDropdownOpen && (
                  <div className="absolute top-full right-0 mt-[8px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg min-w-[150px] z-50">
                    <button onClick={() => { exportToExcel(filteredData, ATTENDANCE_EXPORT_COLUMNS, "team-attendance.xlsx"); setIsExportAllDropdownOpen(false); }} className="w-full px-[16px] py-[12px] text-left text-[14px] hover:bg-[#F5F7FA]">xlsx</button>
                    <button onClick={() => { exportToPdf(filteredData, ATTENDANCE_EXPORT_COLUMNS, "team-attendance.pdf"); setIsExportAllDropdownOpen(false); }} className="w-full px-[16px] py-[12px] text-left text-[14px] hover:bg-[#F5F7FA] rounded-b-[8px]">pdf</button>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
            )}

            {/* Summary Cards */}
            <div className="flex justify-center items-center gap-[40px] mt-[48px] mb-[56px]">
              {[
                { value: summaryStats.present, label: "Present Today", icon: AttendanceIcon },
                { value: summaryStats.absent, label: "Absent Today", icon: NotWorkingIcon },
                { value: summaryStats.lateArrivals, label: "Late Arrivals", icon: HurryIcon },
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
            <div className="flex items-center gap-[8px] mb-[20px] flex-wrap">
              <div className="relative">
                <input type="date" ref={dateInputRef} className="absolute opacity-0 pointer-events-none w-0 h-0" value={dateParam} onChange={(e) => setSelectedDate(new Date(e.target.value))} />
                <div className="px-[16px] py-[12px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between cursor-pointer min-w-[200px]" onClick={() => dateInputRef.current?.click?.()}>
                  <span className="text-[14px] font-semibold text-[#000000]">{formatDate(selectedDate)}</span>
                  <svg className="w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" /></svg>
                </div>
              </div>
              <div className="relative" ref={locationDropdownRef}>
                <button onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)} className="px-[16px] py-[12px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between gap-2 min-w-[200px]">
                  <span className="text-[14px] font-semibold text-[#000000]">{selectedLocation}</span>
                  <svg className="w-4 h-4 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9L12 15L18 9" /></svg>
                </button>
                {isLocationDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-10">
                    {locationOptions.map((loc) => (
                      <button key={loc} onClick={() => { setSelectedLocation(loc); setIsLocationDropdownOpen(false); }} className="w-full px-4 py-3 text-left text-sm text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[10px] last:rounded-b-[10px]">{loc}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" ref={statusDropdownRef}>
                <button onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} className="px-[16px] py-[12px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between gap-2 min-w-[200px]">
                  <span className="text-[14px] font-semibold text-[#000000]">{selectedStatus}</span>
                  <svg className="w-4 h-4 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9L12 15L18 9" /></svg>
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-10">
                    {["All Status", "Present", "Absent", "Late", "In progress", "Missing Check-out"].map((st) => (
                      <button key={st} onClick={() => { setSelectedStatus(st); setIsStatusDropdownOpen(false); }} className="w-full px-4 py-3 text-left text-sm text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[10px] last:rounded-b-[10px]">{st}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex-1 min-w-[180px]">
                <input type="text" placeholder="Search by name or ID" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-[44px] pl-12 pr-4 rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]" />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="bg-white rounded-[10px] p-[40px] text-center" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.1)" }}>
                <p className="text-[14px] text-[#6B7280]">Loading team attendance...</p>
              </div>
            ) : (
              <div className="bg-white rounded-[10px] overflow-hidden min-w-0" style={{ boxShadow: "0px 1px 3px rgba(0,0,0,0.1)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-0" style={{ tableLayout: "fixed" }}>
                    <colgroup>
                      <col style={{ width: "44px" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "120px" }} />
                      <col style={{ width: "72px" }} />
                      <col style={{ width: "72px" }} />
                      <col style={{ width: "100px" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "90px" }} />
                      <col style={{ width: "80px" }} />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-[#E0E0E0]">
                        <th className="px-3 py-3 text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500 }}>
                          <input type="checkbox" checked={paginatedData.length > 0 && selectedEmployees.length === paginatedData.length} onChange={handleSelectAll} className="w-4 h-4 rounded border-[#E0E0E0]" />
                        </th>
                        <th className="px-3 py-2.5 text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500 }}>Employee</th>
                        <th className="px-3 py-2.5 text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500 }}>Employee ID</th>
                        <th className="px-3 py-2.5 text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500 }}>Check-in</th>
                        <th className="px-3 py-2.5 text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500 }}>Check-out</th>
                        <th className="px-3 py-2.5 text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500 }}>Attendance Type</th>
                        <th className="px-3 py-2.5 text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500 }}>Location</th>
                        <th className="px-3 py-2.5 text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500 }}>Status</th>
                        <th className="px-3 py-2.5 text-center text-[14px] text-[#6B7280]" style={{ fontWeight: 500 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length === 0 ? (
                        <tr><td colSpan={9} className="py-10 text-center text-[14px] text-[#6B7280]">No team attendance records for this date</td></tr>
                      ) : (
                        paginatedData.map((employee) => (
                          <tr key={employee.id} className="border-b border-[#E0E0E0] hover:bg-[#F9FAFB]">
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-center">
                              <input type="checkbox" checked={selectedEmployees.includes(employee.id)} onChange={() => handleCheckboxChange(employee.id)} className="w-4 h-4 rounded border-[#E0E0E0]" />
                            </td>
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-left">
                              <div className="flex items-center gap-2">
                                <img src={employee.photo} alt={employee.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = DefaultPhoto; }} />
                                <span className="text-[14px] font-semibold text-[#333333] truncate block">{employee.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-center text-[14px] font-semibold text-[#333333]">{employee.employeeId}</td>
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-center text-[14px] font-semibold text-[#333333]">{employee.checkIn}</td>
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-center text-[14px] font-semibold text-[#333333]">{employee.checkOut}</td>
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-center text-[14px] font-semibold text-[#333333]">{employee.attendanceType}</td>
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-center text-[14px] font-semibold text-[#333333] truncate block">{employee.location}</td>
                            <td className="px-3 py-3 border-r border-[#E0E0E0] text-center text-[14px] font-semibold text-[#333333]">{employee.status}</td>
                            <td className="px-3 py-3 text-center">
                              <div className="flex items-center justify-center gap-0">
                                <button type="button" onClick={() => { setSelectedEmployeeForDetails(employee); setShowDetailsModal(true); }} className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70" title="View"><img src={ViewIcon} alt="View" className="w-full h-full object-contain" /></button>
                                <div className="w-px h-[22px] bg-[#E0E0E0] mx-2" />
                                <button type="button" onClick={() => { setEmployeeToDelete(employee); setShowWarningModal(true); }} className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70" title="Delete"><img src={DeleteIcon} alt="Delete" className="w-full h-full object-contain" /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="border-t border-[#E0E0E0] px-5 py-4 flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center disabled:opacity-50">‹</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} type="button" onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] ${currentPage === p ? "bg-[#027066] text-white" : "bg-white border border-[#E0E0E0] text-[#374151]"}`}>{p}</button>
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
            <h1 className="text-[20px] font-semibold text-[#000000] mb-[4px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Team Attendance</h1>
            <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: "Inter, sans-serif" }}>View & manage attendance for your team members</p>
          </div>
          {/* Summary Cards - Mobile */}
          <div className="flex flex-col gap-[12px] mb-[16px]">
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] p-[16px] flex items-center gap-[12px]">
              <div className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#7AC1BB" }}><img src={AttendanceIcon} alt="Present" className="w-[24px] h-[24px] object-contain" /></div>
              <div><p className="text-[14px] font-semibold text-[#00675E]">{summaryStats.present}</p><p className="text-[12px] text-[#3F817C] font-medium">Present Today</p></div>
            </div>
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] p-[16px] flex items-center gap-[12px]">
              <div className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#7AC1BB" }}><img src={NotWorkingIcon} alt="Absent" className="w-[24px] h-[24px] object-contain" /></div>
              <div><p className="text-[14px] font-semibold text-[#00675E]">{summaryStats.absent}</p><p className="text-[12px] text-[#3F817C] font-medium">Absent Today</p></div>
            </div>
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] p-[16px] flex items-center gap-[12px]">
              <div className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#7AC1BB" }}><img src={HurryIcon} alt="Late" className="w-[24px] h-[24px] object-contain" /></div>
              <div><p className="text-[14px] font-semibold text-[#00675E]">{summaryStats.lateArrivals}</p><p className="text-[12px] text-[#3F817C] font-medium">Late Arrivals</p></div>
            </div>
          </div>
          {/* Filters - Mobile */}
          <div className="flex flex-col gap-[12px] mb-[16px]">
            <div className="relative">
              <input type="date" ref={dateInputRef} className="absolute opacity-0 pointer-events-none w-0 h-0" value={dateParam} onChange={(e) => setSelectedDate(new Date(e.target.value))} />
              <div className="w-full h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between cursor-pointer" onClick={() => dateInputRef.current?.click?.()}>
                <span className="text-[14px] font-semibold text-[#000000]">{formatDate(selectedDate)}</span>
                <svg className="w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" /></svg>
              </div>
            </div>
            <div className="relative" ref={locationDropdownRef}>
              <button onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)} className="w-full h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#000000]">{selectedLocation}</span>
                <svg className="w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9L12 15L18 9" /></svg>
              </button>
              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-10">
                  {locationOptions.map((loc) => (
                    <button key={loc} onClick={() => { setSelectedLocation(loc); setIsLocationDropdownOpen(false); }} className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[10px] last:rounded-b-[10px]">{loc}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" ref={statusDropdownRef}>
              <button onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)} className="w-full h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#000000]">{selectedStatus}</span>
                <svg className="w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9L12 15L18 9" /></svg>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-10">
                  {["All Status", "Present", "Absent", "Late", "In progress", "Missing Check-out"].map((st) => (
                    <button key={st} onClick={() => { setSelectedStatus(st); setIsStatusDropdownOpen(false); }} className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[10px] last:rounded-b-[10px]">{st}</button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <input type="text" placeholder="Search by name or ID" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]" />
            </div>
          </div>
          {error && <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          {loading && <div className="py-8 text-center text-[14px] text-[#6B7280]">Loading team attendance...</div>}
          {!loading && (
            <>
              <div className="flex flex-col gap-[12px]">
                {paginatedData.map((employee) => (
                  <div key={employee.id} className="bg-white rounded-[10px] border border-[#E0E0E0] shadow-sm p-[16px]">
                    <div className="flex items-start justify-between mb-[12px]">
                      <div className="flex items-center gap-[12px]">
                        <div className="w-[40px] h-[40px] rounded-full bg-[#E5E7EB] flex items-center justify-center flex-shrink-0 overflow-hidden"><img src={employee.photo} alt={employee.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = DefaultPhoto; }} /></div>
                        <div><p className="text-[14px] font-medium text-[#111827] mb-[2px]">{employee.name}</p><p className="text-[12px] text-[#6B7280]">#{employee.employeeId}</p></div>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <button type="button" onClick={() => { setSelectedEmployeeForDetails(employee); setShowDetailsModal(true); }} className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors" title="View"><img src={ViewIcon} alt="View" className="w-[16px] h-[16px] object-contain" /></button>
                        <button type="button" onClick={() => { setEmployeeToDelete(employee); setShowWarningModal(true); }} className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors" title="Delete"><img src={DeleteIcon} alt="Delete" className="w-[16px] h-[16px] object-contain" /></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-[8px] mb-[12px]">
                      <span className="inline-block px-[12px] py-[4px] rounded-[6px] bg-[#E0F2FE] text-[#0369A1] text-[12px] font-medium">{employee.attendanceType}</span>
                      <span className={`inline-block px-[12px] py-[4px] rounded-[6px] text-[12px] font-medium ${employee.status === "Present" ? "bg-[#D1FAE5] text-[#065F46]" : employee.status === "Absent" ? "bg-[#FEE2E2] text-[#991B1B]" : employee.status === "Late" ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#E0E7FF] text-[#3730A3]"}`}>{employee.status}</span>
                    </div>
                    <div className="space-y-[4px]">
                      <p className="text-[12px] text-[#6B7280]"><span className="font-medium text-[#374151]">Check-in:</span> {employee.checkIn}</p>
                      <p className="text-[12px] text-[#6B7280]"><span className="font-medium text-[#374151]">Check-out:</span> {employee.checkOut}</p>
                      <p className="text-[12px] text-[#6B7280]"><span className="font-medium text-[#374151]">Location:</span> {employee.location}</p>
                    </div>
                  </div>
                ))}
              </div>
              {paginatedData.length === 0 && <div className="py-[60px] text-center"><p className="text-[16px] text-[#6B7280]">No attendance records found</p></div>}
              {filteredData.length > 0 && totalPages > 1 && (
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

      {/* Attendance details modal */}
      {showDetailsModal && selectedEmployeeForDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowDetailsModal(false); setSelectedEmployeeForDetails(null); }}>
          <div className="bg-white rounded-[10px] shadow-lg w-full max-w-[400px] mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[18px] font-semibold text-[#003934] mb-4" style={{ fontFamily: "Inter, sans-serif" }}>Attendance Details</h3>
            <div className="flex items-center gap-3 mb-4">
              <img src={selectedEmployeeForDetails.photo} alt={selectedEmployeeForDetails.name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = DefaultPhoto; }} />
              <div>
                <p className="font-semibold text-[#333333]">{selectedEmployeeForDetails.name}</p>
                <p className="text-[12px] text-[#6B7280]">#{selectedEmployeeForDetails.employeeId}</p>
              </div>
            </div>
            <div className="space-y-2 text-[14px]">
              <p><span className="text-[#6B7280]">Check-in:</span> <span className="font-medium">{selectedEmployeeForDetails.checkIn}</span></p>
              <p><span className="text-[#6B7280]">Check-out:</span> <span className="font-medium">{selectedEmployeeForDetails.checkOut}</span></p>
              <p><span className="text-[#6B7280]">Type:</span> <span className="font-medium">{selectedEmployeeForDetails.attendanceType}</span></p>
              <p><span className="text-[#6B7280]">Location:</span> <span className="font-medium">{selectedEmployeeForDetails.location}</span></p>
              <p><span className="text-[#6B7280]">Status:</span> <span className="font-medium">{selectedEmployeeForDetails.status}</span></p>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => { setShowDetailsModal(false); setSelectedEmployeeForDetails(null); }} className="px-4 py-2 rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] font-medium text-[#333333] hover:bg-[#F5F7FA]">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete attendance warning modal */}
      {showWarningModal && employeeToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowWarningModal(false); setEmployeeToDelete(null); }}>
          <div className="bg-white shadow-lg relative rounded-[8px] w-full max-w-[469px] mx-4 overflow-hidden" style={{ background: "linear-gradient(180deg, #FFDBDB 0%, #FFFFFF 100%)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-10 pb-5"><img src={WarningIcon} alt="Warning" className="w-[73px] h-[61px] object-contain" /></div>
            <p className="text-center text-[#B70B0B] font-semibold text-[16px] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>Warning</p>
            <p className="text-center text-[#000000] text-[16px] px-5 mb-1" style={{ fontFamily: "Inter, sans-serif" }}>Are you sure you want to delete this attendance record?</p>
            <p className="text-center text-[#4E4E4E] text-[10px] px-5 pb-10" style={{ fontFamily: "Inter, sans-serif" }}>This action can&apos;t be undone</p>
            <div className="flex items-center justify-center gap-5 px-5 pb-6">
              <button type="button" onClick={async () => { try { await deleteAttendance(employeeToDelete.id); refreshAttendance(); } catch (_) { } setShowWarningModal(false); setEmployeeToDelete(null); }} className="px-6 py-2 text-white text-[16px] font-semibold rounded bg-[#A20000] hover:bg-[#8a0000]" style={{ fontFamily: "Inter, sans-serif" }}>Delete</button>
              <button type="button" onClick={() => { setShowWarningModal(false); setEmployeeToDelete(null); }} className="px-6 py-2 text-white text-[16px] font-semibold rounded bg-[#7A7A7A] hover:bg-[#666]" style={{ fontFamily: "Inter, sans-serif" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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

export default TeamAttendancePage;
