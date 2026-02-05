import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import { getEffectiveRole, getCurrentUser } from "../services/auth.js";

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

const ViewEmployeesPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const effectiveRole = getEffectiveRole(userRole);
  const { locationName, activityName } = useParams();
  const [activeMenu, setActiveMenu] = useState("5-3");

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR Admin",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Sample employees data
  const employeesData = [
    { id: 1, name: "Mohamed Ali", department: "Office", position: "Data Entry", photo: MohamedAliPhoto },
    { id: 2, name: "Amal Ahmed", department: "Field Operation", position: "Trainer", photo: AmalAhmedPhoto },
    { id: 3, name: "Amjad Saeed", department: "HR", position: "HR Manager", photo: AmjadSaeedPhoto },
    { id: 4, name: "Jana Hassan", department: "IT", position: "System Administration", photo: JanaHassanPhoto },
    { id: 5, name: "Hasan Jaber", department: "Project Management", position: "Project Manager", photo: HasanJaberPhoto }
  ];

  const decodedLocationName = locationName ? decodeURIComponent(locationName) : "";
  const decodedActivityName = activityName ? decodeURIComponent(activityName) : "";

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
                <span style={{ color: '#B0B0B0' }}>Activities</span>
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
                Employees in {decodedActivityName}
              </h1>
              <p 
                className="text-[14px]"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  color: '#6B7280'
                }}
              >
                {employeesData.length} Employees
              </p>
            </div>

            {/* Employees Table */}
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
              {employeesData.map((employee, index) => (
                <div 
                  key={employee.id}
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
                       src={employee.photo} 
                       alt={employee.name}
                       className="w-[40px] h-[40px] rounded-full object-cover"
                     />
                     <span 
                       className="text-[14px] text-left"
                       style={{ 
                         fontFamily: 'Inter, sans-serif',
                         fontWeight: 400,
                         color: '#000000'
                       }}
                     >
                       {employee.name}
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
                    {employee.department}
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
                    {employee.position}
                  </div>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <div className="mt-[32px] flex justify-end">
              <button
                onClick={() => navigate(`/locations/assignment/activities/${encodeURIComponent(decodedLocationName)}`)}
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

export default ViewEmployeesPage;

