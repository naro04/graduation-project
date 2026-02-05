import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import LogoutModal from "./LogoutModal";
import { getTeamMembers } from "../services/employees.js";
import { getCurrentUser, logout } from "../services/auth.js";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").replace(/\/api\/v1\/?$/, "");

function toAbsoluteAvatarUrl(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== "string") return null;
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) return avatarUrl;
  const path = avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`;
  return `${API_ORIGIN}${path}`;
}

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Team Members page icons (as provided)
const IconTotalMembers = new URL("../images/icons/3d87f948737dea3440aecb37fdcbcdb3e9f23dab.png", import.meta.url).href;
const IconActiveMembers = new URL("../images/icons/3da8b7c409ce43ff5ddfa27c211bbd28aada5f9d.png", import.meta.url).href;
const IconOnLeave = new URL("../images/icons/a9eb57da395b447737c7f11633900d8eba076365.png", import.meta.url).href;

// Table actions
const EditIcon = new URL("../images/icons/edit6.png", import.meta.url).href;
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;
const DefaultProfileImage = new URL("../images/icons/ece298d0ec2c16f10310d45724b276a6035cb503.png", import.meta.url).href;

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
  const userDropdownRef = useRef(null);

  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const effectiveUserRole = currentUser ? normalizeRoleKey(currentUser.role ?? currentUser.roles?.[0]) : userRole;

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
    const fetchTeam = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const list = await getTeamMembers();
        const arr = Array.isArray(list) ? list : [];
        const transformed = arr.map((emp) => ({
          id: emp.id,
          name: emp.full_name || [emp.first_name, emp.last_name].filter(Boolean).join(" ") || "—",
          employeeId: emp.employee_code || emp.employee_id || "—",
          department: emp.department_name || "—",
          position: emp.position_title || "—",
          role: emp.role_name || "—",
          status: emp.status === "active" ? "Active" : emp.status === "under_review" ? "Under Review" : "Inactive",
          photo: toAbsoluteAvatarUrl(emp.avatar_url) || DefaultProfileImage,
          onLeaveToday: !!emp.on_leave_today,
        }));
        setTeamMembers(transformed);
      } catch (err) {
        console.error("Failed to load team members:", err);
        setError(err.message || "Failed to load team members");
        setTeamMembers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeam();
  }, []);

  useEffect(() => {
    if (!isUserDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) setIsUserDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserDropdownOpen]);

  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter((m) => m.status === "Active").length;
  const onLeaveToday = teamMembers.filter((m) => m.onLeaveToday).length;

  const totalPages = Math.max(1, Math.ceil(teamMembers.length / ITEMS_PER_PAGE));
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = teamMembers.slice(start, start + ITEMS_PER_PAGE);

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
          <header className="bg-white px-[40px] py-[24px]" style={{ minWidth: 0, maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden" }}>
            <div className="flex items-center justify-between mb-[16px]" style={{ minWidth: 0, maxWidth: "100%" }}>
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
                  <span className="absolute top-[4px] right-[4px] w-[8px] h-[8px] bg-red-500 rounded-full" />
                </button>
                <div className="relative" ref={userDropdownRef}>
                  <div
                    className="flex items-center gap-[12px] cursor-pointer"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <img src={UserAvatar} alt="User" className="w-[44px] h-[44px] rounded-full object-cover border-2 border-[#E5E7EB]" />
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
                        <p className="text-[12px] text-[#6B7280]">elijlafiras@gmail.com</p>
                      </div>
                      <button className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors" onClick={() => navigate("/profile")}>
                        Edit Profile
                      </button>
                      <div className="h-[1px] bg-[#DC2626] my-[4px]" />
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserDropdownOpen(false);
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
            <div className="mb-[24px]">
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
                    <div className="w-[48px] h-[48px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#02706680" }}>
                      <img src={card.icon} alt="" className="w-[28px] h-[28px] object-contain" />
                    </div>
                  </div>
                  <div className="h-[18px] w-full" style={{ backgroundColor: "#02706680" }} />
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-[20px] p-[16px] rounded-[8px] bg-red-50 border border-red-200">
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
                              <img
                                src={member.photo || DefaultProfileImage}
                                alt={member.name}
                                className="w-[40px] h-[40px] rounded-full object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = DefaultProfileImage;
                                }}
                              />
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
                              className="inline-block px-[8px] py-[4px] rounded-full text-[12px] font-semibold text-white"
                              style={{
                                fontFamily: "Inter, sans-serif",
                                fontWeight: 600,
                                backgroundColor: member.status === "Active" ? "#00564F" : member.status === "Under Review" ? "#92400E" : "#4A4A4A",
                              }}
                            >
                              {member.status}
                            </span>
                          </td>
                          <td className="py-[16px] px-[20px] text-center">
                            <div className="flex items-center justify-center gap-0">
                              <button className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity" title="Edit">
                                <img src={EditIcon} alt="Edit" className="w-full h-full object-contain" />
                              </button>
                              <div className="w-[1px] h-[22px] bg-[#E0E0E0] mx-[8px]" />
                              <button className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity" title="Delete">
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

      {/* Mobile */}
      <div className="lg:hidden">
        <p className="p-[24px] text-center text-[#6B7280]" style={{ fontFamily: "Inter, sans-serif" }}>
          Mobile view coming soon
        </p>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          setIsLogoutModalOpen(false);
          try {
            await logout();
            navigate("/login", { replace: true });
          } catch (e) {
            navigate("/login", { replace: true });
          }
        }}
      />
    </div>
  );
};

export default TeamMembersPage;
