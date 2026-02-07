import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getEffectiveRole, getCurrentUser } from "../services/auth.js";
import { getLocations, getLocationEmployees } from "../services/locations";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4b2785c.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Employee Photos
const MohamedAliPhoto = new URL("../images/Mohamed Ali.jpg", import.meta.url).href;
const AmalAhmedPhoto = new URL("../images/Amal Ahmed.png", import.meta.url).href;
const AmjadSaeedPhoto = new URL("../images/Amjad Saeed.jpg", import.meta.url).href;
const JanaHassanPhoto = new URL("../images/Jana Hassan.jpg", import.meta.url).href;
const HasanJaberPhoto = new URL("../images/Hasan Jaber.jpg", import.meta.url).href;

const ViewLocationEmployeesPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const effectiveRole = getEffectiveRole(userRole);
  const { locationName } = useParams();
  const [activeMenu, setActiveMenu] = useState("5-3");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const decodedLocationName = locationName ? decodeURIComponent(locationName) : "";

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR Admin",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Resolve location by name and fetch employees from API
  useEffect(() => {
    if (!decodedLocationName) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLocations()
      .then((locations) => {
        if (cancelled) return;
        const loc = Array.isArray(locations)
          ? locations.find((l) => (l.name || "").trim() === decodedLocationName.trim())
          : null;
        if (!loc?.id) {
          setEmployees([]);
          setLoading(false);
          return;
        }
        return getLocationEmployees(loc.id).then((list) => {
          if (!cancelled) setEmployees(Array.isArray(list) ? list : []);
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || err?.message || "Failed to load employees");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [decodedLocationName]);

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
          <header className="bg-white px-[40px] py-[24px]" style={{ minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
            <div className="flex items-center justify-between mb-[16px]" style={{ minWidth: 0, maxWidth: '100%' }}>
              <div className="relative flex-shrink-0">
                <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                <div className="flex items-center gap-[12px] cursor-pointer">
                  <img 
                    src={UserAvatar}
                    alt="User"
                    className="w-[44px] h-[44px] rounded-full object-cover border-2 border-[#E5E7EB]"
                  />
                  <div>
                    <div className="flex items-center gap-[6px]">
                      <p className="text-[16px] font-semibold text-[#333333]">Hi, {currentUser?.name || currentUser?.full_name || currentUser?.firstName || "User"}!</p>
                      <img src={DropdownArrow} alt="" className="w-[14px] h-[14px] object-contain" />
                    </div>
                    <p className="text-[12px] font-normal text-[#6B7280]">{roleDisplayNames[effectiveRole]}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <div>
              <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: '#B0B0B0' }}>Locations Management</span>
                <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
                <span style={{ color: '#B0B0B0' }}>Location Assignment</span>
                <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
                <span style={{ color: '#8E8C8C' }}>Employees</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            {/* Page Header */}
            <div className="mb-[24px]">
              <h1 
                className="text-[28px] font-semibold mb-[4px]"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  color: '#003934'
                }}
              >
                Employees at {decodedLocationName}
              </h1>
              <p 
                className="text-[14px]"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  color: '#6B7280'
                }}
              >
                {employees.length} Employees
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Employees Table */}
            {loading ? (
              <div className="bg-white border border-[#E0E0E0] rounded-[10px] p-[40px] text-center">
                <p className="text-[14px] text-[#6B7280]">Loading employees...</p>
              </div>
            ) : employees.length > 0 ? (
              <div className="bg-white border border-[#E0E0E0] rounded-[4px] overflow-hidden">
                {/* Table Header */}
                <div 
                  className="grid grid-cols-[2fr_1fr_1fr] border-b border-[#E0E0E0]"
                  style={{
                    backgroundColor: '#ECEAEA'
                  }}
                >
                  <div 
                    className="text-[14px] font-medium text-left relative"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      color: '#000000',
                      padding: '12px 16px',
                      borderRight: '1px solid #E0E0E0'
                    }}
                  >
                    Employee Name
                  </div>
                  <div 
                    className="text-[14px] font-medium text-center relative"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      color: '#000000',
                      padding: '12px 16px',
                      borderRight: '1px solid #E0E0E0'
                    }}
                  >
                    Department
                  </div>
                  <div 
                    className="text-[14px] font-medium text-center"
                    style={{ 
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      color: '#000000',
                      padding: '12px 16px'
                    }}
                  >
                    Position
                  </div>
                </div>

                {/* Table Rows */}
                {employees.map((employee, index) => {
                  const name = employee.name ?? employee.full_name ?? employee.employee_name ?? "";
                  const department = employee.department ?? employee.department_name ?? "";
                  const position = employee.position ?? employee.position_name ?? "";
                  const photo = employee.photo ?? employee.avatar_url ?? employee.profile_image ?? MohamedAliPhoto;
                  return (
                  <div 
                    key={employee.id ?? index}
                    className={`grid grid-cols-[2fr_1fr_1fr] border-b border-[#E0E0E0] ${
                      index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'
                    }`}
                  >
                    <div 
                      className="flex items-center justify-start gap-[12px] relative"
                      style={{ 
                        padding: '12px 16px',
                        borderRight: '1px solid #E0E0E0'
                      }}
                    >
                      <img 
                        src={photo} 
                        alt={name}
                        className="w-[40px] h-[40px] rounded-full object-cover"
                        onError={(e) => { e.target.src = MohamedAliPhoto; }}
                      />
                      <span 
                        className="text-[14px] text-left"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400,
                          color: '#000000'
                        }}
                      >
                        {name}
                      </span>
                    </div>
                    <div 
                      className="flex items-center justify-center text-center relative"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#000000',
                        padding: '12px 16px',
                        borderRight: '1px solid #E0E0E0'
                      }}
                    >
                      {department}
                    </div>
                    <div 
                      className="flex items-center justify-center text-center"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#000000',
                        padding: '12px 16px'
                      }}
                    >
                      {position}
                    </div>
                  </div>
                );})}
              </div>
            ) : (
              <div className="bg-white border border-[#E0E0E0] rounded-[10px] p-[40px] text-center">
                <p 
                  className="text-[14px]"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: '#6B7280'
                  }}
                >
                  No employees found for this location
                </p>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-[32px] flex justify-end">
              <button
                onClick={() => navigate("/locations/assignment")}
                className="px-[24px] py-[8px] rounded-[5px] hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: '#7A7A7A',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  height: '34px',
                  width: '152px',
                  border: '1px solid #B5B1B1',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <p className="p-[24px] text-center text-[#6B7280]">Mobile view coming soon</p>
      </div>
    </div>
  );
};

export default ViewLocationEmployeesPage;







