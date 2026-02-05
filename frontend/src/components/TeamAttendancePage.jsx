import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import LogoutModal from "./LogoutModal";
import { getEffectiveRole, getCurrentUser, logout } from "../services/auth.js";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

const roleDisplayNames = {
  superAdmin: "Super Admin",
  hr: "HR Admin",
  manager: "Manager",
  fieldEmployee: "Field Employee",
  officer: "Officer",
};

const TeamAttendancePage = ({ userRole = "manager" }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [activeMenu, setActiveMenu] = useState("3-1");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const effectiveRole = getEffectiveRole(userRole);

  useEffect(() => {
    if (!isUserDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) setIsUserDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserDropdownOpen]);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: "Inter, sans-serif", overflowX: "hidden" }}>
      <div className="hidden lg:flex min-h-screen" style={{ overflowX: "hidden" }}>
        <Sidebar userRole={effectiveRole} activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogoutClick={() => setIsLogoutModalOpen(true)} />

        <main className="flex-1 flex flex-col bg-[#F5F7FA]" style={{ minWidth: 0, maxWidth: "100%", overflowX: "hidden" }}>
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
            <div>
              <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                <span style={{ color: "#B0B0B0" }}>My Team</span>
                <span className="mx-[8px]" style={{ color: "#B0B0B0" }}>&gt;</span>
                <span style={{ color: "#8E8C8C" }}>Team Attendance</span>
              </p>
            </div>
          </header>

          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: "hidden", maxWidth: "100%", width: "100%", boxSizing: "border-box" }}>
            <div className="mb-[24px]">
              <h1 className="text-[28px] font-semibold mb-[4px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, color: "#003934" }}>
                Team Attendance
              </h1>
              <p className="text-[14px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, color: "#6B7280" }}>
                View and manage attendance for your team members
              </p>
            </div>
            <div className="bg-white border border-[#E0E0E0] rounded-[10px] shadow-sm p-[40px] flex items-center justify-center min-h-[200px]">
              <p className="text-[14px] text-[#6B7280]" style={{ fontFamily: "Inter, sans-serif" }}>
                Team attendance content will be displayed here.
              </p>
            </div>
          </div>
        </main>
      </div>

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

export default TeamAttendancePage;
