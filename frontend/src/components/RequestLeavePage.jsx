import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4b2785c.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;
const UploadIcon = new URL("../images/icons/upload.png", import.meta.url).href;


const RequestLeavePage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState("6-1");
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [isLeaveTypeDropdownOpen, setIsLeaveTypeDropdownOpen] = useState(false);
  const leaveTypeDropdownRef = useRef(null);
  const employeeDropdownRef = useRef(null);

  // Check if viewing rejected request details
  const [viewingRejectedRequest, setViewingRejectedRequest] = useState(false);
  const [rejectedRequestData, setRejectedRequestData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    employee: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    totalDays: "",
    reason: "",
    supportingDocument: null
  });

  // Check URL params or location state for rejected request
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');
    const requestId = searchParams.get('id');
    
    if (status === 'rejected' || location.state?.status === 'rejected') {
      setViewingRejectedRequest(true);
      // Mock rejected request data - in real app, fetch from API
      setRejectedRequestData({
        id: requestId || 1,
        leaveType: location.state?.leaveType || "Sick Leave",
        status: "Rejected",
        startDate: location.state?.startDate || "12/24/2025",
        endDate: location.state?.endDate || "12/29/2025",
        totalDays: location.state?.totalDays || "6",
        reason: location.state?.reason || "Catch cold",
        adminNotes: location.state?.adminNotes || "Denied - critical client meetings scheduled",
        submittedDate: location.state?.submittedDate || "12/18/2025"
      });
    }
  }, [location]);

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Employees list
  const employeesList = [
    "Ameer Jamal",
    "Amal Ahmed",
    "Hasan Jaber",
    "Jana Hassan",
    "Mohamed Ali",
    "Rania Abed"
  ];

  // Leave types
  const leaveTypes = ["Annual Leave", "Sick Leave", "Emergency Leave", "Unpaid Leave", "Compensatory Time Off", "Maternity Leave", "Paternity Leave"];

  // Calculate total days when start and end dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      setFormData(prev => ({ ...prev, totalDays: diffDays.toString() }));
    } else {
      setFormData(prev => ({ ...prev, totalDays: "" }));
    }
  }, [formData.startDate, formData.endDate]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (leaveTypeDropdownRef.current && !leaveTypeDropdownRef.current.contains(event.target)) {
        setIsLeaveTypeDropdownOpen(false);
      }
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target)) {
        setIsEmployeeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Submit leave request:", formData);
    // Here you would typically send the data to your backend
    // Navigate back to leave management page
    navigate("/leave/requests");
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen" style={{ overflowX: 'hidden' }}>
        <Sidebar 
          userRole={userRole}
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
                      <p className="text-[16px] font-semibold text-[#333333]">Hi, Firas!</p>
                      <img src={DropdownArrow} alt="" className="w-[14px] h-[14px] object-contain" />
                    </div>
                    <p className="text-[12px] font-normal text-[#6B7280]">{roleDisplayNames[userRole]}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <div>
              <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: '#8E8C8C' }}>Request Leave</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            {/* Page Header */}
            <div className="mb-[32px]">
              <h1 
                className="text-[28px] font-semibold mb-[4px]"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  color: '#003934'
                }}
              >
                Request Leave
              </h1>
              <p 
                className="text-[14px]"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  color: '#6B7280'
                }}
              >
                Submit a new leave request
              </p>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded-[10px] p-[32px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <form onSubmit={handleSubmit}>
                <div className="space-y-[24px]">
                  {/* Employee Dropdown */}
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
                      Employee
                    </label>
                    <div className="relative" ref={employeeDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen)}
                        className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between hover:border-[#004D40] transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: formData.employee ? '#000000' : '#9CA3AF' }}
                      >
                        <span>{formData.employee || "Select an Employee"}</span>
                        <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isEmployeeDropdownOpen && (
                        <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10 max-h-[200px] overflow-y-auto">
                          {employeesList.map((employee) => (
                            <button
                              key={employee}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, employee }));
                                setIsEmployeeDropdownOpen(false);
                              }}
                              className={`w-full px-[16px] py-[10px] text-left transition-colors ${
                                formData.employee === employee
                                  ? 'bg-[#E5E7EB] text-[#333333]'
                                  : 'text-[#333333] hover:bg-[#F5F7FA]'
                              } first:rounded-t-[5px] last:rounded-b-[5px]`}
                              style={{ 
                                fontFamily: 'Inter, sans-serif', 
                                fontSize: '14px', 
                                fontWeight: 400
                              }}
                            >
                              {employee}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

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
                    <div className="relative" ref={leaveTypeDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsLeaveTypeDropdownOpen(!isLeaveTypeDropdownOpen)}
                        className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between hover:border-[#004D40] transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: formData.leaveType ? '#000000' : '#9CA3AF' }}
                      >
                        <span>{formData.leaveType || "Select Leave Type"}</span>
                        <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isLeaveTypeDropdownOpen && (
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
                          {leaveTypes.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, leaveType: type }));
                                setIsLeaveTypeDropdownOpen(false);
                              }}
                              className={`w-full px-[16px] py-[10px] text-left transition-colors flex items-center justify-start ${
                                formData.leaveType === type
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
                          value={formData.startDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
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
                          value={formData.endDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          min={formData.startDate || undefined}
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
                      value={formData.totalDays || ""}
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
                      value={formData.reason}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
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
                        id="supporting-document"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
                            setFormData(prev => ({ ...prev, supportingDocument: file }));
                          } else {
                            alert("File size must be less than 10MB");
                            e.target.value = "";
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="supporting-document"
                        className="w-full min-h-[120px] border-2 border-dashed border-[#E0E0E0] rounded-[5px] flex flex-col items-center justify-center cursor-pointer hover:border-[#004D40] transition-colors bg-[#FAFAFA]"
                      >
                        <img src={UploadIcon} alt="Upload" className="w-[32px] h-[32px] mb-[8px] object-contain" />
                        {formData.supportingDocument ? (
                          <p 
                            className="text-center px-[16px]"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '14px',
                              fontWeight: 400,
                              color: '#6B7280'
                            }}
                          >
                            {formData.supportingDocument.name}
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

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-[12px] mt-[32px]">
                  <button
                    type="button"
                    onClick={() => navigate("/leave/requests")}
                    className="px-[24px] py-[10px] rounded-[5px] hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: '#6B7280',
                      color: '#FFFFFF',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      minWidth: '150px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-[24px] py-[10px] rounded-[5px] hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: '#009084',
                      color: '#FFFFFF',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500,
                      minWidth: '150px'
                    }}
                  >
                    Submit Request
                  </button>
                </div>
              </form>
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

export default RequestLeavePage;

