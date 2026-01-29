import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import LogoutModal from "./LogoutModal";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Summary card icons
const PendingIcon = new URL("../images/icons/pending (2).png", import.meta.url).href;
const ApprovedIcon = new URL("../images/icons/approved (2).png", import.meta.url).href;
const RejectIcon = new URL("../images/icons/reject.png", import.meta.url).href;

// Action icons
const ViewIcon = new URL("../images/icons/eye.png", import.meta.url).href;
// Using approved icon for approve action
const ApproveIcon = new URL("../images/icons/approved (2).png", import.meta.url).href;
const RejectActionIcon = new URL("../images/icons/reject.png", import.meta.url).href;
const WarningIcon = new URL("../images/icons/warnning (2).png", import.meta.url).href;
const UploadIcon = new URL("../images/icons/upload.png", import.meta.url).href;

// Employee Photos
const AmeerJamalPhoto = new URL("../images/Ameer Jamal.jpg", import.meta.url).href;
const AmalAhmedPhoto = new URL("../images/Amal Ahmed.png", import.meta.url).href;
const HasanJaberPhoto = new URL("../images/Hasan Jaber.jpg", import.meta.url).href;

const LeaveManagementPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("6-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeaveType, setSelectedLeaveType] = useState("All Leave Type");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isLeaveTypeDropdownOpen, setIsLeaveTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveAdminNotes, setApproveAdminNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [rejectAdminNotes, setRejectAdminNotes] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBulkActionsDropdownOpen, setIsBulkActionsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const leaveTypeDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const bulkActionsDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Sample leave requests data
  const leaveRequestsData = [
    {
      id: 1,
      employeeName: "Ameer Jamal",
      employeePhoto: AmeerJamalPhoto,
      position: "Data Entry",
      department: "Office",
      leaveType: "Annual Leave",
      dateRange: "12/24/2025 - 12/29/2025",
      startDate: "12/24/2025",
      endDate: "12/29/2025",
      totalDays: 6,
      reason: "Family vacation during holidays",
      adminNotes: "",
      submittedDate: "12/14/2025",
      status: "Pending"
    },
    {
      id: 2,
      employeeName: "Amal Ahmed",
      employeePhoto: AmalAhmedPhoto,
      position: "Data Entry",
      department: "Office",
      leaveType: "Sick Leave",
      dateRange: "12/19/2025 - 12/21/2025",
      startDate: "12/19/2025",
      endDate: "12/21/2025",
      totalDays: 3,
      reason: "Catch cold",
      adminNotes: "Denied - critical client meetings scheduled",
      submittedDate: "12/18/2025",
      status: "Rejected"
    },
    {
      id: 3,
      employeeName: "Hasan Jaber",
      employeePhoto: HasanJaberPhoto,
      position: "Data Entry",
      department: "Office",
      leaveType: "Annual Leave",
      dateRange: "12/17/2025 - 12/19/2025",
      startDate: "12/17/2025",
      endDate: "12/19/2025",
      totalDays: 3,
      reason: "Personal matters",
      adminNotes: "Approved - adequate coverage available",
      submittedDate: "12/18/2025",
      status: "Approved"
    }
  ];

  // Calculate summary stats
  const summaryStats = {
    pending: leaveRequestsData.filter(r => r.status === "Pending").length,
    approved: leaveRequestsData.filter(r => r.status === "Approved").length,
    rejected: leaveRequestsData.filter(r => r.status === "Rejected").length
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
  const leaveTypes = ["All Leave Type", "Annual Leave", "Sick Leave", "Emergency Leave", "Unpaid Leave", "Compensatory Time Off", "Maternity Leave", "Paternity Leave"];

  // Status options
  const statusOptions = ["All Status", "Pending", "Rejected", "Approved"];

  // Request Leave Modal State
  const [showRequestLeaveModal, setShowRequestLeaveModal] = useState(false);
  const [isRequestLeaveEmployeeDropdownOpen, setIsRequestLeaveEmployeeDropdownOpen] = useState(false);
  const [isRequestLeaveTypeDropdownOpen, setIsRequestLeaveTypeDropdownOpen] = useState(false);
  const requestLeaveEmployeeDropdownRef = useRef(null);
  const requestLeaveTypeDropdownRef = useRef(null);
  const [requestLeaveFormData, setRequestLeaveFormData] = useState({
    employee: "",
    leaveType: "",
    startDate: "",
    endDate: "",
    totalDays: "",
    reason: "",
    supportingDocument: null
  });

  // Calculate total days when start and end dates change
  useEffect(() => {
    if (requestLeaveFormData.startDate && requestLeaveFormData.endDate) {
      const start = new Date(requestLeaveFormData.startDate);
      const end = new Date(requestLeaveFormData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      setRequestLeaveFormData(prev => ({ ...prev, totalDays: diffDays.toString() }));
    } else {
      setRequestLeaveFormData(prev => ({ ...prev, totalDays: "" }));
    }
  }, [requestLeaveFormData.startDate, requestLeaveFormData.endDate]);

  const handleRequestLeaveSubmit = (e) => {
    e.preventDefault();
    console.log("Submit leave request:", requestLeaveFormData);
    setShowRequestLeaveModal(false);
    setRequestLeaveFormData({
      employee: "",
      leaveType: "",
      startDate: "",
      endDate: "",
      totalDays: "",
      reason: "",
      supportingDocument: null
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (leaveTypeDropdownRef.current && !leaveTypeDropdownRef.current.contains(event.target)) {
        setIsLeaveTypeDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (requestLeaveEmployeeDropdownRef.current && !requestLeaveEmployeeDropdownRef.current.contains(event.target)) {
        setIsRequestLeaveEmployeeDropdownOpen(false);
      }
      if (requestLeaveTypeDropdownRef.current && !requestLeaveTypeDropdownRef.current.contains(event.target)) {
        setIsRequestLeaveTypeDropdownOpen(false);
      }
      if (bulkActionsDropdownRef.current && !bulkActionsDropdownRef.current.contains(event.target)) {
        setIsBulkActionsDropdownOpen(false);
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

  // Filter data
  const filteredData = leaveRequestsData.filter(request => {
    const matchesSearch = request.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLeaveType = selectedLeaveType === "All Leave Type" || request.leaveType === selectedLeaveType;
    const matchesStatus = selectedStatus === "All Status" || request.status === selectedStatus;
    return matchesSearch && matchesLeaveType && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 10;
  const actualTotalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const totalPages = Math.max(3, actualTotalPages);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Handle checkbox selection
  const handleCheckboxChange = (requestId) => {
    setSelectedRequests(prev => {
      if (prev.includes(requestId)) {
        return prev.filter(id => id !== requestId);
      } else {
        return [...prev, requestId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRequests.length === paginatedData.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(paginatedData.map(r => r.id));
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          window.location.href = "/login";
        }}
      />
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen" style={{ overflowX: 'hidden' }}>
        <Sidebar
          userRole={userRole}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onLogoutClick={() => setIsLogoutModalOpen(true)}
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                        <p className="text-[16px] font-semibold text-[#333333]">Hi, Firas!</p>
                        <img
                          src={DropdownArrow}
                          alt=""
                          className={`w-[14px] h-[14px] object-contain transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <p className="text-[12px] font-normal text-[#6B7280]">{roleDisplayNames[userRole]}</p>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <>
                      <style>{`
                        .user-dropdown-desktop {
                          overflow: hidden !important;
                          overflow-y: hidden !important;
                          overflow-x: hidden !important;
                          max-height: none !important;
                        }
                        .user-dropdown-desktop * {
                          overflow: visible !important;
                        }
                      `}</style>
                      <div
                        className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50 user-dropdown-desktop"
                        style={{
                          overflow: 'hidden',
                          overflowY: 'hidden',
                          overflowX: 'hidden',
                          maxHeight: 'none',
                          height: 'auto'
                        }}
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
                            setIsLogoutModalOpen(true);
                          }}
                          className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#DC2626] hover:bg-[#F5F7FA] transition-colors"
                        >
                          Log Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            <div>
              <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: '#B0B0B0' }}>Leave Management</span>
                <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
                <span style={{ color: '#8E8C8C' }}>Leave Requests</span>
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
                  Review and manage employee leave requests
                </p>
              </div>
              <button
                onClick={() => setShowRequestLeaveModal(true)}
                className="px-[24px] py-[10px] rounded-[5px] hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: '#0C8DFE',
                  color: '#FFFFFF',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                + Request Leave
              </button>
            </div>

            {/* Summary Cards */}
            <div className="flex justify-center items-center gap-[16px] mt-[48px] mb-[48px] flex-wrap">
              {/* Pending Card */}
              <div
                className="rounded-[10px] p-[24px] flex flex-col items-center justify-center"
                style={{
                  backgroundColor: '#E9F6F8B2',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  width: '240px',
                  height: '136px'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#7AC1BB',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    flexShrink: 0
                  }}
                >
                  <img src={PendingIcon} alt="Pending" style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }} />
                </div>
                <div className="flex items-baseline justify-center gap-[4px]">
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: '24px',
                      lineHeight: '100%',
                      color: '#00675E'
                    }}
                  >
                    {summaryStats.pending}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
                      lineHeight: '100%',
                      color: '#3F817C'
                    }}
                  >
                    Pending
                  </p>
                </div>
              </div>

              {/* Approved Card */}
              <div
                className="rounded-[10px] p-[24px] flex flex-col items-center justify-center"
                style={{
                  backgroundColor: '#E9F6F8B2',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  width: '240px',
                  height: '136px'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#7AC1BB',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    flexShrink: 0
                  }}
                >
                  <img src={ApprovedIcon} alt="Approved" style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }} />
                </div>
                <div className="flex items-baseline justify-center gap-[4px]">
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: '24px',
                      lineHeight: '100%',
                      color: '#00675E'
                    }}
                  >
                    {summaryStats.approved}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
                      lineHeight: '100%',
                      color: '#3F817C'
                    }}
                  >
                    Approved
                  </p>
                </div>
              </div>

              {/* Rejected Card */}
              <div
                className="rounded-[10px] p-[24px] flex flex-col items-center justify-center"
                style={{
                  backgroundColor: '#E9F6F8B2',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
                  width: '240px',
                  height: '136px'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#7AC1BB',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px',
                    flexShrink: 0
                  }}
                >
                  <img src={RejectIcon} alt="Rejected" style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }} />
                </div>
                <div className="flex items-baseline justify-center gap-[4px]">
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      fontSize: '24px',
                      lineHeight: '100%',
                      color: '#00675E'
                    }}
                  >
                    {summaryStats.rejected}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
                      lineHeight: '100%',
                      color: '#3F817C'
                    }}
                  >
                    Rejected
                  </p>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex items-center gap-[16px] mb-[24px] flex-wrap">
              {/* Leave Type Dropdown */}
              <div className="relative" ref={leaveTypeDropdownRef}>
                <button
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
                  <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10 min-w-[180px] max-h-[200px] overflow-y-auto">
                    {leaveTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
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
              <div className="relative" ref={statusDropdownRef}>
                <button
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
                  <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10 min-w-[140px]">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
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

              {/* Search by Employee Name */}
              <div className="relative flex-1 min-w-[200px]">
                <svg className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by employee name"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full h-[40px] pl-[36px] pr-[16px] rounded-[5px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{ fontWeight: 400 }}
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedRequests.length > 0 && (
              <div className="mb-[20px] bg-white rounded-[10px] p-[16px] flex items-center gap-[16px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div className="text-[14px] text-[#333333]" style={{ fontWeight: 500 }}>
                  {selectedRequests.length} selected
                </div>
                <div className="relative" ref={bulkActionsDropdownRef}>
                  <button
                    onClick={() => setIsBulkActionsDropdownOpen(!isBulkActionsDropdownOpen)}
                    className="px-[16px] py-[8px] rounded-[8px] border border-[#E0E0E0] bg-white flex items-center gap-[8px] hover:bg-[#F5F7FA] transition-colors"
                    style={{ fontWeight: 500, fontSize: '14px' }}
                  >
                    <span>Bulk Actions</span>
                    <svg className="w-[12px] h-[12px] text-[#6B7280]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {isBulkActionsDropdownOpen && (
                    <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-50 min-w-[200px]">
                      <button
                        onClick={() => {
                          console.log('Delete selected:', selectedRequests);
                          setIsBulkActionsDropdownOpen(false);
                          setShowWarningModal(true);
                        }}
                        className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] flex items-center gap-[8px] first:rounded-t-[8px]"
                        style={{ fontWeight: 400 }}
                      >
                        <span style={{ fontSize: '16px' }}>✗</span>
                        Delete selected
                      </button>
                      <button
                        onClick={() => {
                          console.log('Mark as reviewed', selectedRequests);
                          setSelectedRequests([]);
                          setIsBulkActionsDropdownOpen(false);
                        }}
                        className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] flex items-center gap-[8px] last:rounded-b-[8px]"
                        style={{ fontWeight: 400 }}
                      >
                        <span style={{ fontSize: '16px' }}>✓</span>
                        Mark as reviewed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Leave Requests Table */}
            <div className="bg-white rounded-[10px] overflow-hidden" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRequests.length === paginatedData.length && paginatedData.length > 0}
                          onChange={handleSelectAll}
                          className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                        />
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Employee name
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Leave Type
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Date Range
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
                            <input
                              type="checkbox"
                              checked={selectedRequests.includes(request.id)}
                              onChange={() => handleCheckboxChange(request.id)}
                              className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                            />
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <div className="flex items-center justify-center gap-[12px]">
                              <img
                                src={request.employeePhoto}
                                alt={request.employeeName}
                                className="w-[32px] h-[32px] rounded-full object-cover"
                              />
                              <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                                {request.employeeName}
                              </span>
                            </div>
                          </td>
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
                                backgroundColor: request.status === "Pending" ? '#D2D2D2' :
                                  request.status === "Approved" ? '#68BFCCB2' : '#FFBDB6B2',
                                textAlign: 'center'
                              }}
                            >
                              {request.status}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <div className="flex items-center justify-center gap-[8px]">
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowDetailsModal(true);
                                }}
                                className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity"
                                title="View"
                              >
                                <img src={ViewIcon} alt="View" className="w-full h-full object-contain" />
                              </button>
                              <div className="w-[1px] h-[22px] bg-[#E0E0E0]"></div>
                              <button
                                onClick={() => {
                                  if (request.status !== "Approved" && request.status !== "Rejected") {
                                    setSelectedRequest(request);
                                    setShowApproveModal(true);
                                  }
                                }}
                                disabled={request.status === "Approved" || request.status === "Rejected"}
                                className={`w-[22px] h-[22px] flex items-center justify-center transition-opacity ${request.status === "Approved" || request.status === "Rejected"
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:opacity-70'
                                  }`}
                                title="Approve"
                              >
                                <img src={ApproveIcon} alt="Approve" className="w-full h-full object-contain" />
                              </button>
                              <div className="w-[1px] h-[22px] bg-[#E0E0E0]"></div>
                              <button
                                onClick={() => {
                                  if (request.status !== "Approved" && request.status !== "Rejected") {
                                    setSelectedRequest(request);
                                    setShowRejectModal(true);
                                  }
                                }}
                                disabled={request.status === "Approved" || request.status === "Rejected"}
                                className={`w-[22px] h-[22px] flex items-center justify-center transition-opacity ${request.status === "Approved" || request.status === "Rejected"
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'hover:opacity-70'
                                  }`}
                                title="Reject"
                              >
                                <img src={RejectActionIcon} alt="Reject" className="w-full h-full object-contain" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-[12px] py-[40px] text-center" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#6B7280' }}>
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
            userRole={userRole}
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
              <p className="text-[12px] text-[#6B7280]">Review and manage requests</p>
            </div>
            <button
              onClick={() => setShowRequestLeaveModal(true)}
              className="px-[16px] py-[8px] rounded-[5px] bg-[#0C8DFE] text-white text-[13px] font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              + Request
            </button>
          </div>

          {/* Summary Cards - Mobile Stack */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Pending */}
            <div className="bg-white p-4 rounded-[12px] shadow-sm border border-[#E0E0E0] flex items-center gap-4">
              <div className="w-[48px] h-[48px] bg-[#7AC1BB] rounded-full flex items-center justify-center flex-shrink-0">
                <img src={PendingIcon} alt="Pending" className="w-[24px] h-[24px] object-contain" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-[#00675E] leading-none mb-1">{summaryStats.pending}</p>
                <p className="text-[12px] font-medium text-[#3F817C]">Pending</p>
              </div>
            </div>

            {/* Approved */}
            <div className="bg-white p-4 rounded-[12px] shadow-sm border border-[#E0E0E0] flex items-center gap-4">
              <div className="w-[48px] h-[48px] bg-[#7AC1BB] rounded-full flex items-center justify-center flex-shrink-0">
                <img src={ApprovedIcon} alt="Approved" className="w-[24px] h-[24px] object-contain" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-[#00675E] leading-none mb-1">{summaryStats.approved}</p>
                <p className="text-[12px] font-medium text-[#3F817C]">Approved</p>
              </div>
            </div>

            {/* Rejected */}
            <div className="bg-white p-4 rounded-[12px] shadow-sm border border-[#E0E0E0] flex items-center gap-4">
              <div className="w-[48px] h-[48px] bg-[#7AC1BB] rounded-full flex items-center justify-center flex-shrink-0">
                <img src={RejectIcon} alt="Rejected" className="w-[24px] h-[24px] object-contain" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-[#00675E] leading-none mb-1">{summaryStats.rejected}</p>
                <p className="text-[12px] font-medium text-[#3F817C]">Rejected</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Leave Type Dropdown */}
            <div className="relative" ref={leaveTypeDropdownRef}>
              <button
                onClick={() => setIsLeaveTypeDropdownOpen(!isLeaveTypeDropdownOpen)}
                className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between text-[14px] font-semibold text-[#000000]"
              >
                <span>{selectedLeaveType}</span>
                <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isLeaveTypeDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10 max-h-[200px] overflow-y-auto">
                  {leaveTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
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
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between text-[14px] font-semibold text-[#000000]"
              >
                <span>{selectedStatus}</span>
                <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
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

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                placeholder="Search by employee name"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-[40px] pl-[36px] pr-[16px] rounded-[5px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]"
              />
            </div>
          </div>

          {/* Leave Request Cards */}
          <div className="space-y-4">
            {paginatedData.length > 0 ? (
              paginatedData.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-[12px] p-4 shadow-md border border-[#E0E0E0]"
                >
                  {/* Header with Employee Info */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#F0F0F0]">
                    <img
                      src={request.employeePhoto}
                      alt={request.employeeName}
                      className="w-[48px] h-[48px] rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold text-[#000000] truncate">{request.employeeName}</h3>
                      <p className="text-[12px] text-[#6B7280]">{request.position} • {request.department}</p>
                    </div>
                  </div>

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
                      <span className="text-[12px] text-[#6B7280]">Submitted:</span>
                      <span className="text-[13px] font-semibold text-[#000000]">{request.submittedDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Status:</span>
                      <span
                        className="inline-block px-[14px] py-[6px] rounded-[8px] text-[13px] font-bold shadow-sm"
                        style={{
                          color: request.status === 'Pending' ? '#4A4A4A' : request.status === 'Approved' ? '#00564F' : '#830000',
                          backgroundColor: request.status === 'Pending' ? '#D2D2D2' : request.status === 'Approved' ? '#68BFCCB2' : '#FFBDB6B2'
                        }}
                      >
                        {request.status}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-center gap-[8px]">
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailsModal(true);
                      }}
                      className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity"
                      title="View"
                    >
                      <img src={ViewIcon} alt="View" className="w-full h-full object-contain" />
                    </button>
                    <div className="w-[1px] h-[22px] bg-[#E0E0E0]"></div>
                    <button
                      onClick={() => {
                        if (request.status !== "Approved" && request.status !== "Rejected") {
                          setSelectedRequest(request);
                          setShowApproveModal(true);
                        }
                      }}
                      disabled={request.status === "Approved" || request.status === "Rejected"}
                      className={`w-[22px] h-[22px] flex items-center justify-center transition-opacity ${request.status === "Approved" || request.status === "Rejected"
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:opacity-70'
                        }`}
                      title="Approve"
                    >
                      <img src={ApproveIcon} alt="Approve" className="w-full h-full object-contain" />
                    </button>
                    <div className="w-[1px] h-[22px] bg-[#E0E0E0]"></div>
                    <button
                      onClick={() => {
                        if (request.status !== "Approved" && request.status !== "Rejected") {
                          setSelectedRequest(request);
                          setShowRejectModal(true);
                        }
                      }}
                      disabled={request.status === "Approved" || request.status === "Rejected"}
                      className={`w-[22px] h-[22px] flex items-center justify-center transition-opacity ${request.status === "Approved" || request.status === "Rejected"
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:opacity-70'
                        }`}
                      title="Reject"
                    >
                      <img src={RejectActionIcon} alt="Reject" className="w-full h-full object-contain" />
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
      {showDetailsModal && selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowDetailsModal(false);
            setSelectedRequest(null);
          }}
        >
          <div
            className="bg-white rounded-[10px] relative"
            style={{
              width: '600px',
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
                  setShowDetailsModal(false);
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
              {/* Employee Information */}
              <div
                className="rounded-[4px] p-[20px] mb-[24px]"
                style={{
                  backgroundColor: '#DEDEDE',
                  border: '0.52px solid #939393',
                  borderColor: '#939393'
                }}
              >
                {/* Title */}
                <h3
                  className="mb-[16px]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#000000'
                  }}
                >
                  Employee Information
                </h3>
                <div className="flex items-start gap-[16px]">
                  {/* Profile Picture */}
                  <img
                    src={selectedRequest.employeePhoto}
                    alt={selectedRequest.employeeName}
                    className="w-[64px] h-[64px] rounded-full object-cover flex-shrink-0"
                  />
                  {/* Name, Position, Department */}
                  <div className="flex flex-col md:flex-row items-start gap-[12px] md:gap-[24px]">
                    {/* Name */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-[8px] mb-[4px]">
                        <svg className="w-[16px] h-[16px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#7B7B7B'
                          }}
                        >
                          <strong>Name:</strong>
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                          color: '#323131',
                          whiteSpace: 'nowrap',
                          paddingLeft: '24px'
                        }}
                      >
                        {selectedRequest.employeeName}
                      </span>
                    </div>
                    {/* Position */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-[8px] mb-[4px]">
                        <svg className="w-[16px] h-[16px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#7B7B7B'
                          }}
                        >
                          <strong>Position:</strong>
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                          color: '#323131',
                          whiteSpace: 'nowrap',
                          paddingLeft: '24px'
                        }}
                      >
                        {selectedRequest.position}
                      </span>
                    </div>
                    {/* Department */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-[8px] mb-[4px]">
                        <svg className="w-[16px] h-[16px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#7B7B7B'
                          }}
                        >
                          <strong>Department:</strong>
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                          color: '#323131',
                          whiteSpace: 'nowrap',
                          paddingLeft: '24px'
                        }}
                      >
                        {selectedRequest.department}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Details */}
              <div className="space-y-[20px]">
                {/* Leave Type and Status */}
                <div className="grid grid-cols-2 gap-[16px]">
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
                    <div
                      className="flex items-center"
                      style={{
                        height: '40px'
                      }}
                    >
                      <span
                        className="inline-block px-[12px] py-[10px] rounded-[5px]"
                        style={{
                          fontWeight: 500,
                          fontSize: '13px',
                          lineHeight: '100%',
                          whiteSpace: 'nowrap',
                          color: selectedRequest.status === "Pending" ? '#4A4A4A' :
                            selectedRequest.status === "Approved" ? '#00564F' : '#830000',
                          backgroundColor: selectedRequest.status === "Pending" ? '#D2D2D2' :
                            selectedRequest.status === "Approved" ? '#68BFCCB2' : '#FFBDB6B2',
                          textAlign: 'center',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {selectedRequest.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Start Date and End Date */}
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
                  <input
                    type="text"
                    value={selectedRequest.reason}
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
                    {selectedRequest.submittedDate}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-[12px] mt-[32px]">
                {selectedRequest.status === "Pending" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        // Handle approve
                        console.log("Approve leave request:", selectedRequest.id);
                        setShowDetailsModal(false);
                        setSelectedRequest(null);
                      }}
                      className="px-[24px] py-[10px] rounded-[5px] hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: '#003934',
                        color: '#FFFFFF',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        minWidth: '150px'
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Handle reject
                        console.log("Reject leave request:", selectedRequest.id);
                        setShowDetailsModal(false);
                        setSelectedRequest(null);
                      }}
                      className="px-[24px] py-[10px] rounded-[5px] hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: '#730000',
                        color: '#FFFFFF',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        minWidth: '150px'
                      }}
                    >
                      Rejected
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        // Handle delete
                        console.log("Delete leave request:", selectedRequest.id);
                        setShowDetailsModal(false);
                        setSelectedRequest(null);
                      }}
                      className="px-[24px] py-[10px] rounded-[5px] hover:bg-[#FDF2F2] transition-colors"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #8C0808',
                        color: '#8C0808',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        minWidth: '150px'
                      }}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedRequest(null);
                      }}
                      className="px-[24px] py-[10px] rounded-[5px] hover:bg-[#F9FAFB] transition-colors"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #6B7280',
                        color: '#6B7280',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: 500,
                        minWidth: '150px'
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Leave Request Modal */}
      {showApproveModal && selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowApproveModal(false);
            setApproveAdminNotes("");
          }}
        >
          <div
            className="bg-white rounded-[10px] relative"
            style={{
              width: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid #003934'
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
                Approve Leave Request
              </h2>
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setApproveAdminNotes("");
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
              {/* Request Summary */}
              <div className="bg-white rounded-[8px] p-[20px] mb-[24px] border border-[#E0E0E0]">
                <h3
                  className="mb-[16px]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#181818'
                  }}
                >
                  Request Summery
                </h3>
                <div className="space-y-[12px]">
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#333333'
                    }}
                  >
                    <span style={{ color: '#686868' }}>Employee :</span> {selectedRequest.employeeName}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#333333'
                    }}
                  >
                    <span style={{ color: '#686868' }}>Leave Type :</span> {selectedRequest.leaveType}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#333333'
                    }}
                  >
                    <span style={{ color: '#686868' }}>Duration :</span> {selectedRequest.totalDays} days
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#333333'
                    }}
                  >
                    <span style={{ color: '#686868' }}>Date :</span> {selectedRequest.startDate} - {selectedRequest.endDate}
                  </p>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mb-[32px]">
                <label
                  className="block mb-[8px]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#000000'
                  }}
                >
                  Admin Notes <span style={{ color: '#686868' }}>(Optional)</span>
                </label>
                <textarea
                  value={approveAdminNotes}
                  onChange={(e) => setApproveAdminNotes(e.target.value)}
                  placeholder="Add any notes or comments about this approval..."
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

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-[12px]">
                <button
                  type="button"
                  onClick={() => {
                    setShowApproveModal(false);
                    setApproveAdminNotes("");
                  }}
                  className="px-[24px] py-[10px] rounded-[5px] hover:bg-[#F9FAFB] transition-colors"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #6B7280',
                    color: '#6B7280',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    minWidth: '120px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Handle approve
                    console.log("Approve leave request:", selectedRequest.id, "Notes:", approveAdminNotes);
                    setShowApproveModal(false);
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                    setApproveAdminNotes("");
                  }}
                  className="px-[24px] py-[10px] rounded-[5px] hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: '#003934',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    minWidth: '150px'
                  }}
                >
                  Confirm Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Leave Request Modal */}
      {showRejectModal && selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowRejectModal(false);
            setRejectAdminNotes("");
          }}
        >
          <div
            className="bg-white rounded-[10px] relative"
            style={{
              width: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid #003934'
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
                Reject Leave Request
              </h2>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectAdminNotes("");
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
              {/* Request Summary */}
              <div className="bg-white rounded-[8px] p-[20px] mb-[24px] border border-[#E0E0E0]">
                <h3
                  className="mb-[16px]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#181818'
                  }}
                >
                  Request Summery
                </h3>
                <div className="space-y-[12px]">
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#333333'
                    }}
                  >
                    <span style={{ color: '#686868' }}>Employee :</span> {selectedRequest.employeeName}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#333333'
                    }}
                  >
                    <span style={{ color: '#686868' }}>Leave Type :</span> {selectedRequest.leaveType}
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#333333'
                    }}
                  >
                    <span style={{ color: '#686868' }}>Duration :</span> {selectedRequest.totalDays} days
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: '#333333'
                    }}
                  >
                    <span style={{ color: '#686868' }}>Date :</span> {selectedRequest.startDate} - {selectedRequest.endDate}
                  </p>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="mb-[24px]">
                <label
                  className="block mb-[8px]"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    color: '#000000'
                  }}
                >
                  Admin Notes <span style={{ color: '#686868' }}>(Required)</span>
                </label>
                <textarea
                  value={rejectAdminNotes}
                  onChange={(e) => setRejectAdminNotes(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
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

              {/* Warning Message */}
              <div
                className="mb-[32px] p-[12px] rounded-[5px] flex items-start gap-[12px]"
                style={{
                  backgroundColor: '#FFDEDE',
                  border: '0.8px solid #EAE784'
                }}
              >
                <img
                  src={WarningIcon}
                  alt="Warning"
                  className="w-[20px] h-[20px] flex-shrink-0 mt-[2px]"
                />
                <div>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#803A04',
                      marginBottom: '4px'
                    }}
                  >
                    Important
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#803A04',
                      marginBottom: '4px'
                    }}
                  >
                    Please provide a clear reason for rejecting this leave request.
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#803A04'
                    }}
                  >
                    The employee will be notified with your comments.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-[12px]">
                <button
                  type="button"
                  onClick={() => {
                    // Handle reject
                    console.log("Reject leave request:", selectedRequest.id, "Notes:", rejectAdminNotes);
                    setShowRejectModal(false);
                    setShowDetailsModal(false);
                    setSelectedRequest(null);
                    setRejectAdminNotes("");
                  }}
                  className="px-[24px] py-[10px] rounded-[5px] hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: '#730000',
                    color: '#FFFFFF',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    minWidth: '150px'
                  }}
                >
                  Confirm Rejection
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectAdminNotes("");
                  }}
                  className="px-[24px] py-[10px] rounded-[5px] hover:bg-[#F9FAFB] transition-colors"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #6B7280',
                    color: '#6B7280',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    minWidth: '120px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Leave Modal */}
      {showRequestLeaveModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10"
          onClick={() => setShowRequestLeaveModal(false)}
        >
          <div
            className="bg-white rounded-[10px] relative w-[600px] my-auto"
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
                onClick={() => setShowRequestLeaveModal(false)}
                className="w-[32px] h-[32px] rounded-full bg-transparent hover:bg-[#F3F4F6] flex items-center justify-center transition-colors"
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
                    <div className="relative" ref={requestLeaveEmployeeDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsRequestLeaveEmployeeDropdownOpen(!isRequestLeaveEmployeeDropdownOpen)}
                        className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between hover:border-[#004D40] transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: requestLeaveFormData.employee ? '#000000' : '#9CA3AF' }}
                      >
                        <span>{requestLeaveFormData.employee || "Select an Employee"}</span>
                        <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isRequestLeaveEmployeeDropdownOpen && (
                        <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10 max-h-[200px] overflow-y-auto">
                          {employeesList.map((employee) => (
                            <button
                              key={employee}
                              type="button"
                              onClick={() => {
                                setRequestLeaveFormData(prev => ({ ...prev, employee }));
                                setIsRequestLeaveEmployeeDropdownOpen(false);
                              }}
                              className={`w-full px-[16px] py-[10px] text-left transition-colors ${requestLeaveFormData.employee === employee
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
                    <div className="relative" ref={requestLeaveTypeDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsRequestLeaveTypeDropdownOpen(!isRequestLeaveTypeDropdownOpen)}
                        className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between hover:border-[#004D40] transition-colors"
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: requestLeaveFormData.leaveType ? '#000000' : '#9CA3AF' }}
                      >
                        <span>{requestLeaveFormData.leaveType || "Select Leave Type"}</span>
                        <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isRequestLeaveTypeDropdownOpen && (
                        <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10 max-h-[200px] overflow-y-auto">
                          {leaveTypes.map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setRequestLeaveFormData(prev => ({ ...prev, leaveType: type }));
                                setIsRequestLeaveTypeDropdownOpen(false);
                              }}
                              className={`w-full px-[16px] py-[10px] text-left transition-colors ${requestLeaveFormData.leaveType === type
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
                  </div>

                  {/* Start Date and End Date */}
                  <div className="grid grid-cols-2 gap-[16px]">
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
                          value={requestLeaveFormData.startDate}
                          onChange={(e) => setRequestLeaveFormData(prev => ({ ...prev, startDate: e.target.value }))}
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
                          value={requestLeaveFormData.endDate}
                          onChange={(e) => setRequestLeaveFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          min={requestLeaveFormData.startDate || undefined}
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
                      value={requestLeaveFormData.totalDays || ""}
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
                      value={requestLeaveFormData.reason}
                      onChange={(e) => setRequestLeaveFormData(prev => ({ ...prev, reason: e.target.value }))}
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
                            setRequestLeaveFormData(prev => ({ ...prev, supportingDocument: file }));
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
                        {requestLeaveFormData.supportingDocument ? (
                          <p
                            className="text-center px-[16px]"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '14px',
                              fontWeight: 400,
                              color: '#6B7280'
                            }}
                          >
                            {requestLeaveFormData.supportingDocument.name}
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

                {/* Footer Buttons */}
                <div className="flex items-center justify-between gap-[16px] mt-[32px]">
                  <button
                    type="button"
                    onClick={() => setShowRequestLeaveModal(false)}
                    className="flex-1 py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white text-[#333333] hover:bg-[#F5F7FA] transition-colors"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-[10px] rounded-[5px] bg-[#004D40] text-white hover:opacity-90 transition-opacity"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: 500
                    }}
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {/* Warning Modal */}
      {showWarningModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
          onClick={() => setShowWarningModal(false)}
        >
          <div
            className="bg-white shadow-lg relative"
            style={{
              width: '469px',
              height: '290px',
              background: 'linear-gradient(180deg, #FFDBDB 0%, #FFFFFF 100%)',
              borderRadius: '0px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className="flex justify-center pt-[40px] pb-[20px]">
              <svg width="73" height="61" viewBox="0 0 73 61" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.5 0L72.3253 60H0.674683L36.5 0Z" fill="#B70B0B" />
                <text x="36.5" y="45" fontSize="40" fontWeight="bold" fill="white" textAnchor="middle">!</text>
              </svg>
            </div>

            {/* Warning Text */}
            <div className="text-center pb-[20px]">
              <p
                style={{
                  fontFamily: 'Libre Caslon Text, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#B70B0B',
                  textAlign: 'center'
                }}
              >
                Warning
              </p>
            </div>

            {/* Main Question */}
            <div className="text-center pb-[4px] px-[20px]">
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#000000',
                  textAlign: 'center'
                }}
              >
                Are you sure you want to delete {selectedRequests.length} selected leave request{selectedRequests.length > 1 ? 's' : ''}?
              </p>
            </div>

            {/* Sub-message */}
            <div className="text-center pb-[40px] px-[20px]">
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '10px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#4E4E4E',
                  textAlign: 'center'
                }}
              >
                This action can't be undone
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-[20px] px-[20px]">
              <button
                onClick={() => {
                  console.log('Deleting selected requests:', selectedRequests);
                  setSelectedRequests([]);
                  setShowWarningModal(false);
                }}
                className="text-white focus:outline-none"
                style={{
                  width: '144px',
                  height: '34px',
                  borderRadius: '0px',
                  backgroundColor: '#A20000',
                  border: '1px solid #B5B1B1',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  lineHeight: '100%',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                }}
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowWarningModal(false);
                }}
                className="text-white focus:outline-none"
                style={{
                  width: '144px',
                  height: '34px',
                  borderRadius: '0px',
                  backgroundColor: '#7A7A7A',
                  border: '1px solid #B5B1B1',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  fontSize: '16px',
                  lineHeight: '100%',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LeaveManagementPage;

