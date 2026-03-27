import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import LogoutModal from "./LogoutModal";
import { getTeamMembers, deleteEmployee, updateEmployee, createEmployee } from "../services/employees.js";
import { getDepartments } from "../services/departments.js";
import { getPositions } from "../services/positions.js";
import { getRoles } from "../services/rbac.js";
import { getCurrentUser, getEffectiveRole, logout, getMe } from "../services/auth.js";
import AddEditEmployeeModal from "./AddEditEmployeeModal.jsx";
import HeaderIcons from "./HeaderIcons.jsx";
import HeaderUserAvatar from "./HeaderUserAvatar.jsx";
import { toAbsoluteAvatarUrl } from "../utils/avatarUrl.js";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Team Members page icons (as provided)
const IconTotalMembers = new URL("../images/icons/3d87f948737dea3440aecb37fdcbcdb3e9f23dab.png", import.meta.url).href;
const IconActiveMembers = new URL("../images/icons/3da8b7c409ce43ff5ddfa27c211bbd28aada5f9d.png", import.meta.url).href;
const IconOnLeave = new URL("../images/icons/a9eb57da395b447737c7f11633900d8eba076365.png", import.meta.url).href;

// Table actions
const EditIcon = new URL("../images/icons/edit6.png", import.meta.url).href;
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;
const DefaultProfileImage = null; // we use AvatarBlock instead of img for placeholders
const WarningIcon = new URL("../images/icons/warnning.png", import.meta.url).href;

/** Always-visible avatar: shows image from URL or grey circle with person icon (no broken img) */
function AvatarBlock({ src, alt, className = "w-[40px] h-[40px]" }) {
  const [failed, setFailed] = React.useState(false);
  const hasValidSrc = src && (src.startsWith("data:") || src.startsWith("http"));
  const showImg = hasValidSrc && !failed;
  return (
    <div className={`${className} rounded-full bg-[#E5E7EB] flex items-center justify-center overflow-hidden flex-shrink-0`}>
      {showImg && (
        <img
          src={src}
          alt={alt || ""}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {(!showImg || failed) && (
        <svg className="w-1/2 h-1/2 text-[#9CA3AF]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      )}
    </div>
  );
}
const ITEMS_PER_PAGE = 10;

const normalizeRoleKey = (role) => {
  if (!role || typeof role !== "string") return "manager";
  const r = role.toLowerCase().trim();
  if (r === "super admin" || r === "superadmin") return "superAdmin";
  if (r === "hr") return "hr";
  if (r === "manager") return "manager";
  if (r === "field employee" || r === "fieldemployee" || r === "field worker") return "fieldEmployee";
  if (r === "officer" || r === "office staff") return "officer";
  return "manager";
};

const TeamMembersPage = ({ userRole = "manager" }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("2-1");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const userDropdownRef = useRef(null);

  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedMember, setSelectedMember] = useState(null);
  const [employeeModalMode, setEmployeeModalMode] = useState(null);
  const [myEmployeeId, setMyEmployeeId] = useState(null);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [positionsList, setPositionsList] = useState([]);
  const [rolesList, setRolesList] = useState([]);

  const departmentPositions = React.useMemo(() => {
    const map = {};
    departmentsList.forEach((d) => {
      const name = d.name || d.title;
      if (!name) return;
      const positions = positionsList
        .filter((p) => p.department_id === d.id || (p.department_name || p.department) === name)
        .map((p) => p.title || p.name)
        .filter(Boolean);
      map[name] = positions.length ? positions : positionsList.map((p) => p.title || p.name).filter(Boolean);
    });
    return map;
  }, [departmentsList, positionsList]);

  const effectiveUserRole = getEffectiveRole();

  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR Admin",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  useEffect(() => {
    getMe()
      .then((me) => {
        const user = me?.data?.user ?? me?.user ?? me;
        const id = user?.employee_id ?? user?.employee?.id ?? null;
        setMyEmployeeId(id);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const fetchTeam = async () => {
      setIsLoading(true);
      setError(null);
      // جلب أعضاء الفريق أولاً – لو فشل واحد من الباقي ما نمسح القائمة
      const [teamResult, deptsResult, positionsResult, rolesResult] = await Promise.allSettled([
        getTeamMembers(),
        getDepartments(),
        getPositions(),
        getRoles(),
      ]);
      const list = teamResult.status === "fulfilled" ? teamResult.value : [];
      const depts = deptsResult.status === "fulfilled" ? deptsResult.value : [];
      const positions = positionsResult.status === "fulfilled" ? positionsResult.value : [];
      const roles = rolesResult.status === "fulfilled" ? rolesResult.value : [];
      const departmentsList = Array.isArray(depts) ? depts : [];
      const positionsList = Array.isArray(positions) ? positions : [];
      const rolesList = Array.isArray(roles) ? roles : [];
      const arr = Array.isArray(list) ? list : list?.data ?? list?.items ?? list?.records ?? [];
      const getDeptName = (id) => {
        if (!id) return null;
        const d = departmentsList.find((x) => x.id === id);
        return d?.name ?? null;
      };
      const getPositionTitle = (id) => {
        if (!id) return null;
        const p = positionsList.find((x) => x.id === id);
        return p?.title ?? p?.name ?? null;
      };
      const getRoleName = (id) => {
        if (!id) return null;
        const sid = String(id);
        const r = rolesList.find((x) => x && (String(x.id) === sid || x.id === id));
        return r?.name ?? null;
      };
      const transformed = arr.map((emp) => ({
        id: emp.id,
        name: emp.full_name || [emp.first_name, emp.last_name].filter(Boolean).join(" ") || "—",
        employeeId: emp.employee_code || emp.employee_id || "—",
        department:
          emp.department_name ?? emp.departmentName ?? emp.department ?? getDeptName(emp.department_id) ?? "—",
        position:
          emp.position_title ?? emp.positionTitle ?? emp.position ?? getPositionTitle(emp.position_id) ?? "—",
        role: emp.role_name ?? emp.roleName ?? emp.role ?? getRoleName(emp.role_id) ?? "—",
        status: emp.status === "active" ? "Active" : emp.status === "under_review" ? "Under Review" : "Inactive",
        photo: toAbsoluteAvatarUrl(emp.avatar_url) || null,
        onLeaveToday: !!emp.on_leave_today,
        originalData: emp,
      }));
      setTeamMembers(transformed);
      setDepartmentsList(departmentsList);
      setPositionsList(positionsList);
      setRolesList(rolesList);
      if (teamResult.status === "rejected") {
        const err = teamResult.reason;
        const is403 = err?.response?.status === 403;
        const status = err?.response?.status;
        if (!is403) {
          const serverMsg = err?.response?.data?.message || err?.response?.data?.error;
          const fallback = status === 500
            ? "Server is temporarily unavailable. Please try again later."
            : "Could not load team members. Please try again.";
          setError(serverMsg || err?.message || fallback);
        }
      }
      setIsLoading(false);
    };
    fetchTeam();
  }, [refreshKey]);

  useEffect(() => {
    if (!isUserDropdownOpen) return;
    const handleClickOutside = (e) => {
      const isLogoutButton = e.target.closest("button")?.textContent?.trim() === "Log Out";
      if (isLogoutButton) return;
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) setIsUserDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserDropdownOpen]);

  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter((m) => m.status === "Active").length;
  const onLeaveToday = teamMembers.filter((m) => m.onLeaveToday).length;

  const filteredMembers = teamMembers.filter((m) => {
    const q = (searchQuery || "").toLowerCase().trim();
    if (!q) return true;
    return (m.name || "").toLowerCase().includes(q) || String(m.employeeId || "").toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = filteredMembers.slice(start, start + ITEMS_PER_PAGE);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(paginatedMembers.map((m) => m.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const summaryCards = [
    {
      id: 1,
      title: "Total Team Members",
      value: totalMembers.toString(),
      label: "Members",
      icon: IconTotalMembers,
    },
    {
      id: 2,
      title: "Active Members",
      value: activeMembers.toString(),
      label: "Members",
      icon: IconActiveMembers,
    },
    {
      id: 3,
      title: "On Leave Today",
      value: onLeaveToday.toString(),
      label: "Leave Approved",
      icon: IconOnLeave,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      <div className="hidden lg:flex min-h-screen" style={{ overflowX: "hidden" }}>
        <Sidebar
          userRole={effectiveUserRole}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onLogoutClick={() => setIsLogoutModalOpen(true)}
        />

        <main className="flex-1 flex flex-col bg-[#F5F7FA]" style={{ minWidth: 0, maxWidth: "100%", overflowX: "hidden" }}>
          {/* Header */}
          <header className="bg-white px-[40px] py-[24px]" style={{ minWidth: 0, maxWidth: "100%", boxSizing: "border-box" }}>
            <div className="flex items-center justify-between mb-[16px]" style={{ minWidth: 0, maxWidth: "100%" }}>
              <div className="relative flex-shrink-0">
                <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-[280px] h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{ fontWeight: 400 }}
                />
              </div>

              <div className="flex items-center gap-[16px] flex-shrink-0">
                <HeaderIcons />
                <div className="relative" ref={userDropdownRef}>
                  <div
                    className="flex items-center gap-[12px] cursor-pointer"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <HeaderUserAvatar alt="User" className="w-[44px] h-[44px] rounded-full object-cover border-2 border-[#E5E7EB]" />
                    <div>
                      <div className="flex items-center gap-[6px]">
                        <p className="text-[16px] font-semibold text-[#333333]">Hi, {currentUser?.name || currentUser?.full_name || currentUser?.firstName || "User"}!</p>
                        <img src={DropdownArrow} alt="" className={`w-[14px] h-[14px] object-contain transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`} />
                      </div>
                      <p className="text-[12px] font-normal text-[#6B7280]">{roleDisplayNames[effectiveUserRole]}</p>
                    </div>
                  </div>
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50">
                      <div className="px-[16px] py-[8px]">
                        <p className="text-[12px] text-[#6B7280]">{currentUser?.email || getCurrentUser()?.email || ""}</p>
                      </div>
                      <button type="button" className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors cursor-pointer" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsUserDropdownOpen(false); navigate("/profile"); }}>
                        Edit Profile
                      </button>
                      <div className="h-[1px] bg-[#DC2626] my-[4px]" />
                      <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsUserDropdownOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#DC2626] hover:bg-[#F5F7FA] transition-colors cursor-pointer"
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
              <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                <span style={{ color: "#B0B0B0" }}>My Team</span>
                <span className="mx-[8px]" style={{ color: "#B0B0B0" }}>&gt;</span>
                <span style={{ color: "#8E8C8C" }}>Team Members</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: "hidden", maxWidth: "100%", width: "100%", boxSizing: "border-box" }}>
            {/* Page Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-[24px]">
              <div>
                <h1
                  className="text-[28px] font-semibold mb-[4px]"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#003934" }}
                >
                  Team Members
                </h1>
                <p className="text-[14px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, color: "#6B7280" }}>
                  Overview of your assigned team members
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmployeeModalMode("add")}
                className="px-[20px] py-[12px] text-white rounded-[5px] hover:opacity-90 transition-opacity flex items-center justify-center gap-[8px] border border-[#B5B1B1]"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", backgroundColor: "#0C8DFE", height: "46px", width: "205px" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Add Employee
              </button>
            </div>

            {/* Summary Cards - Icon on right, number + label on left (match design) */}
            <div className="flex gap-[16px] mb-[28px] flex-wrap">
              {summaryCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-[10px] overflow-hidden border border-[#E0E0E0] shadow-sm flex flex-col"
                  style={{ flex: "1 1 0", minWidth: "200px", maxWidth: "320px", height: "136px" }}
                >
                  <div className="p-[20px] flex-1 flex items-start justify-between gap-[12px]">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-[#939393] mb-[26px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                        {card.title}
                      </p>
                      <div className="flex items-baseline gap-[6px] flex-wrap">
                        <span className="text-[24px] font-bold text-[#000000]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, lineHeight: "100%" }}>
                          {card.value}
                        </span>
                        <span className="text-[12px] font-medium text-[#939393]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                          {card.label}
                        </span>
                      </div>
                    </div>
                    <div className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#02706680" }}>
                      <img src={card.icon} alt="" className="w-[28px] h-[28px] object-contain" />
                    </div>
                  </div>
                  <div className="h-[18px] w-full" style={{ backgroundColor: "#02706680" }} />
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-[20px] p-[16px] rounded-[8px] bg-red-50 border border-red-200" role="alert">
                <p className="text-[14px] text-red-600">{error}</p>
              </div>
            )}

            {isLoading && (
              <div className="mb-[20px] flex items-center justify-center py-[40px]">
                <p className="text-[14px] text-[#6B7280]" style={{ fontFamily: "Inter, sans-serif" }}>
                  Loading team members...
                </p>
              </div>
            )}

            {/* Table */}
            {!isLoading && (
              <div className="bg-white border border-[#E0E0E0] rounded-[10px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse" style={{ borderSpacing: 0 }}>
                    <thead>
                      <tr>
                        <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, borderBottom: "1px solid #E0E0E0", borderRight: "1px solid #E0E0E0", color: "#6C6C6C" }}>
                          <input
                            type="checkbox"
                            checked={paginatedMembers.length > 0 && selectedIds.length === paginatedMembers.length}
                            onChange={handleSelectAll}
                            className="w-[16px] h-[16px] rounded border-[#E0E0E0] cursor-pointer"
                          />
                        </th>
                        <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, borderBottom: "1px solid #E0E0E0", borderRight: "1px solid #E0E0E0", color: "#6C6C6C" }}>
                          Employee
                        </th>
                        <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, borderBottom: "1px solid #E0E0E0", borderRight: "1px solid #E0E0E0", color: "#6C6C6C" }}>
                          Employee ID
                        </th>
                        <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, borderBottom: "1px solid #E0E0E0", borderRight: "1px solid #E0E0E0", color: "#6C6C6C" }}>
                          Department
                        </th>
                        <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, borderBottom: "1px solid #E0E0E0", borderRight: "1px solid #E0E0E0", color: "#6C6C6C" }}>
                          Position
                        </th>
                        <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, borderBottom: "1px solid #E0E0E0", borderRight: "1px solid #E0E0E0", color: "#6C6C6C" }}>
                          Role
                        </th>
                        <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, borderBottom: "1px solid #E0E0E0", borderRight: "1px solid #E0E0E0", color: "#6C6C6C" }}>
                          Status
                        </th>
                        <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, borderBottom: "1px solid #E0E0E0", color: "#6C6C6C" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMembers.length === 0 && (
                        <tr>
                          <td colSpan="9" className="py-[40px] text-center">
                            <p className="text-[14px] text-[#6B7280]" style={{ fontFamily: "Inter, sans-serif" }}>
                              No team members found
                            </p>
                          </td>
                        </tr>
                      )}
                      {paginatedMembers.map((member, index) => (
                        <tr
                          key={member.id}
                          style={{
                            borderBottom: index < paginatedMembers.length - 1 ? "1px solid #E0E0E0" : "none",
                            backgroundColor: index % 2 === 0 ? "#fff" : "#F9FAFB",
                          }}
                        >
                          <td className="py-[16px] px-[20px] text-center" style={{ borderRight: "1px solid #E0E0E0" }}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(member.id)}
                              onChange={() => handleSelectOne(member.id)}
                              className="w-[16px] h-[16px] rounded border-[#E0E0E0] cursor-pointer"
                            />
                          </td>
                          <td className="py-[16px] px-[20px] text-center" style={{ borderRight: "1px solid #E0E0E0" }}>
                            <div className="flex items-center justify-center gap-[12px]">
                              <AvatarBlock src={member.photo} alt={member.name} className="w-[40px] h-[40px]" />
                              <p className="text-[14px] font-medium" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, color: "#000000" }}>
                                {member.name}
                              </p>
                            </div>
                          </td>
                          <td className="py-[16px] px-[20px] text-center" style={{ borderRight: "1px solid #E0E0E0", fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 400, color: "#000000" }}>
                            {member.employeeId}
                          </td>
                          <td className="py-[16px] px-[20px] text-center" style={{ borderRight: "1px solid #E0E0E0", fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 400, color: "#000000" }}>
                            {member.department}
                          </td>
                          <td className="py-[16px] px-[20px] text-center" style={{ borderRight: "1px solid #E0E0E0", fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 400, color: "#000000" }}>
                            {member.position}
                          </td>
                          <td className="py-[16px] px-[20px] text-center" style={{ borderRight: "1px solid #E0E0E0", fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 400, color: "#000000" }}>
                            {member.role}
                          </td>
                          <td className="py-[16px] px-[20px] text-center" style={{ borderRight: "1px solid #E0E0E0" }}>
                            <span
                              className="inline-block px-[8px] py-[4px] rounded-[6px] text-[12px] font-semibold"
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 600,
                                backgroundColor: member.status === "Active" ? "#7BD9D9" : member.status === "Under Review" ? "#FCD34D" : "#DCDCDC",
                                color: member.status === "Active" ? "#056B6E" : member.status === "Under Review" ? "#92400E" : "#696969",
                              }}
                            >
                              {member.status}
                            </span>
                          </td>
                          <td className="py-[16px] px-[20px] text-center">
                            <div className="flex items-center justify-center gap-0">
                              <button type="button" onClick={() => { setSelectedMember(member); setEmployeeModalMode("edit"); }} className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity" title="Edit">
                                <img src={EditIcon} alt="Edit" className="w-full h-full object-contain" />
                              </button>
                              <div className="w-[1px] h-[22px] bg-[#E0E0E0] mx-[8px]" />
                              <button type="button" onClick={() => { setMemberToDelete(member); setShowDeleteModal(true); }} className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity" title="Delete">
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
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-[8px] py-[16px] border-t border-[#E0E0E0]">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-[32px] h-[32px] rounded flex items-center justify-center text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: "Inter, sans-serif", color: "#374151", border: "1px solid #E0E0E0" }}
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className="w-[32px] h-[32px] rounded flex items-center justify-center text-[14px] font-medium transition-colors"
                        style={{
                          fontFamily: "Inter, sans-serif",
                          backgroundColor: currentPage === p ? "#027066" : "transparent",
                          color: currentPage === p ? "#fff" : "#374151",
                          border: "1px solid #E0E0E0",
                        }}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-[32px] h-[32px] rounded flex items-center justify-center text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: "Inter, sans-serif", color: "#374151", border: "1px solid #E0E0E0" }}
                    >
                      &gt;
                    </button>
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
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-[40px] h-[40px] rounded-[8px] bg-[#004D40] flex items-center justify-center hover:bg-[#003830] transition-colors"
          >
            <svg className="w-[24px] h-[24px] text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-[12px]">
            <HeaderIcons iconSize="w-[18px] h-[18px]" />
            <div className="relative" ref={userDropdownRef}>
              <div className="flex items-center gap-[8px] cursor-pointer" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
                <HeaderUserAvatar alt="User" className="w-[36px] h-[36px] rounded-full object-cover border-2 border-[#E5E7EB]" />
                <img src={DropdownArrow} alt="" className={`w-[12px] h-[12px] object-contain transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""}`} />
              </div>
              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50">
                  <div className="px-[16px] py-[8px]"><p className="text-[12px] text-[#6B7280]">{currentUser?.email || getCurrentUser()?.email || ""}</p></div>
                  <button className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsUserDropdownOpen(false); navigate("/profile"); }}>Edit Profile</button>
                  <div className="h-[1px] bg-[#DC2626] my-[4px]" />
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsUserDropdownOpen(false); setIsLogoutModalOpen(true); }} className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#DC2626] hover:bg-[#F5F7FA] transition-colors">Log Out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />}
        <div className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar userRole={effectiveUserRole} activeMenu={activeMenu} setActiveMenu={setActiveMenu} isMobile={true} onClose={() => setIsMobileMenuOpen(false)} onLogoutClick={() => setIsLogoutModalOpen(true)} />
        </div>
        <div className="flex-1 p-[16px] pb-10">
          <div className="mb-[16px]">
            <h1 className="text-[20px] font-semibold text-[#000000] mb-[4px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Team Members</h1>
            <p className="text-[12px] text-[#6B7280] mb-3" style={{ fontFamily: "Inter, sans-serif" }}>Overview of your assigned team members</p>
            <button
              type="button"
              onClick={() => setEmployeeModalMode("add")}
              className="w-full mb-[16px] px-[20px] py-[12px] text-white rounded-[10px] hover:opacity-90 transition-opacity flex items-center justify-center gap-[8px]"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px", backgroundColor: "#0C8DFE" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Add Employee
            </button>
          </div>
          {/* Summary Cards - Mobile */}
          <div className="flex flex-col gap-[12px] mb-[16px]">
            {summaryCards.map((card) => (
              <div key={card.id} className="bg-white rounded-[10px] border border-[#E0E0E0] p-[16px] flex items-center justify-between">
                <div className="flex items-center gap-[12px]">
                  <div className="w-[48px] h-[48px] min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#02706680" }}>
                    <img src={card.icon} alt="" className="w-[24px] h-[24px] object-contain" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#00675E]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600 }}>{card.value}</p>
                    <p className="text-[12px] text-[#3F817C]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}>{card.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Search - Mobile */}
          <div className="relative mb-[16px]">
            <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or ID"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]"
              style={{ fontWeight: 400 }}
            />
          </div>
          {error && <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          {isLoading && <div className="py-8 text-center text-[14px] text-[#6B7280]">Loading team members...</div>}
          {!isLoading && (
            <>
              <div className="flex flex-col gap-[12px]">
                {paginatedMembers.map((member) => (
                  <div key={member.id} className="bg-white rounded-[10px] border border-[#E0E0E0] shadow-sm p-[16px]">
                    <div className="flex items-start justify-between mb-[12px]">
                      <div className="flex items-center gap-[12px]">
                        <AvatarBlock src={member.photo} alt={member.name} className="w-[40px] h-[40px]" />
                        <div>
                          <p className="text-[14px] font-medium text-[#111827] mb-[2px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}>{member.name}</p>
                          <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: "Inter, sans-serif" }}>#{member.employeeId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <button type="button" onClick={() => { setSelectedMember(member); setEmployeeModalMode("edit"); }} className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors" title="Edit">
                          <img src={EditIcon} alt="Edit" className="w-[16px] h-[16px] object-contain" />
                        </button>
                        <button type="button" onClick={() => { setMemberToDelete(member); setShowDeleteModal(true); }} className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors" title="Delete">
                          <img src={DeleteIcon} alt="Delete" className="w-[16px] h-[16px] object-contain" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-[4px]">
                      <p className="text-[12px] text-[#6B7280]"><span className="font-medium text-[#374151]">Department:</span> {member.department}</p>
                      <p className="text-[12px] text-[#6B7280]"><span className="font-medium text-[#374151]">Position:</span> {member.position}</p>
                      <p className="text-[12px] text-[#6B7280]"><span className="font-medium text-[#374151]">Role:</span> {member.role}</p>
                      <span className={`inline-block mt-2 px-[8px] py-[4px] rounded-[6px] text-[12px] font-semibold ${member.status === "Active" ? "bg-[#7BD9D9] text-[#056B6E]" : member.status === "Under Review" ? "bg-[#FCD34D] text-[#92400E]" : "bg-[#DCDCDC] text-[#696969]"}`}>{member.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              {paginatedMembers.length === 0 && <div className="py-[60px] text-center"><p className="text-[16px] text-[#6B7280]">No team members found</p></div>}
              {totalPages > 1 && (
                <div className="mt-[24px] flex items-center justify-center gap-[8px]">
                  <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center disabled:opacity-50">
                    <svg className="w-[16px] h-[16px] text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setCurrentPage(p)} className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-[14px] bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA] ${currentPage === p ? "font-semibold border-[#027066] text-[#027066]" : ""}`}>{p}</button>
                  ))}
                  <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center disabled:opacity-50">
                    <svg className="w-[16px] h-[16px] text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AddEditEmployeeModal
        isOpen={employeeModalMode === "add" || employeeModalMode === "edit"}
        onClose={() => { setEmployeeModalMode(null); setSelectedMember(null); }}
        mode={employeeModalMode === "edit" ? "edit" : "add"}
        initialData={employeeModalMode === "edit" ? selectedMember : null}
        departmentsList={departmentsList}
        positionsList={positionsList}
        rolesList={rolesList}
        departmentPositions={departmentPositions}
        supervisorId={employeeModalMode === "add" ? myEmployeeId : null}
        onSave={async (payload) => {
          if (employeeModalMode === "edit" && selectedMember?.id) {
            await updateEmployee(selectedMember.id, payload);
          } else {
            await createEmployee(payload);
          }
          setRefreshKey((k) => k + 1);
        }}
      />

      {/* Delete member warning modal */}
      {showDeleteModal && memberToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowDeleteModal(false); setMemberToDelete(null); }}>
          <div className="bg-white shadow-lg relative rounded-[8px] w-full max-w-[469px] mx-4 overflow-hidden" style={{ background: "linear-gradient(180deg, #FFDBDB 0%, #FFFFFF 100%)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center pt-10 pb-5">
              <img src={WarningIcon} alt="Warning" className="w-[73px] h-[61px] object-contain" />
            </div>
            <p className="text-center text-[#B70B0B] font-semibold text-[16px] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>Warning</p>
            <p className="text-center text-[#000000] text-[16px] px-5 mb-1" style={{ fontFamily: "Inter, sans-serif" }}>Are you sure you want to delete {memberToDelete.name} from the team?</p>
            <p className="text-center text-[#4E4E4E] text-[10px] px-5 pb-10" style={{ fontFamily: "Inter, sans-serif" }}>This action can&apos;t be undone</p>
            <div className="flex items-center justify-center gap-5 px-5 pb-6">
              <button type="button" onClick={async () => { try { await deleteEmployee(memberToDelete.id); setRefreshKey((k) => k + 1); } catch (_) { } setShowDeleteModal(false); setMemberToDelete(null); }} className="px-6 py-2 text-white text-[16px] font-semibold rounded bg-[#A20000] hover:bg-[#8a0000]" style={{ fontFamily: "Inter, sans-serif" }}>Delete</button>
              <button type="button" onClick={() => { setShowDeleteModal(false); setMemberToDelete(null); }} className="px-6 py-2 text-white text-[16px] font-semibold rounded bg-[#7A7A7A] hover:bg-[#666]" style={{ fontFamily: "Inter, sans-serif" }}>Cancel</button>
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

export default TeamMembersPage;
