import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Activity icons
const PlannedIcon = new URL("../images/icons/planned.png", import.meta.url).href;
const CalendarIcon = new URL("../images/icons/calender.png", import.meta.url).href;
const ApprovedIcon = new URL("../images/icons/approved.png", import.meta.url).href;
const PendingIcon = new URL("../images/icons/pending.png", import.meta.url).href;

// Employee Photos
const AmeerJamalPhoto = new URL("../images/Ameer Jamal.jpg", import.meta.url).href;
const AmalAhmedPhoto = new URL("../images/Amal Ahmed.png", import.meta.url).href;

// Action icons
const ViewIcon = new URL("../images/icons/eye.png", import.meta.url).href;
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;
const WarningIcon = new URL("../images/icons/warnning.png", import.meta.url).href;

import ActivityDetailsModal from "./ActivityDetailsModal";

const ActivitiesPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("4");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("All Approval Status");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isApprovalStatusDropdownOpen, setIsApprovalStatusDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 11, 7)); // December 7, 2025
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState(null);
  const [isBulkActionsDropdownOpen, setIsBulkActionsDropdownOpen] = useState(false);
  const dateInputRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const approvalStatusDropdownRef = useRef(null);
  const userDropdownMobileRef = useRef(null);
  const userDropdownRef = useRef(null);
  const bulkActionsDropdownRef = useRef(null);

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Sample activities data
  const activitiesData = [
    {
      id: 1,
      activity: "Workshop A",
      type: "Workshop",
      project: "Project X",
      responsibleEmployee: "Ameer Jamal",
      employeePhoto: AmeerJamalPhoto,
      status: "Implemented",
      approval: "Approved",
      location: "Hattin School",
      coordinates: { lat: "31.50090", lng: "34.46710" },
      date: new Date(2025, 11, 7),
      duration: "2 hr",
      team: "Hasan Jaber, Rania Abed",
      description: "A planned workshop was implemented at Hattin School, targeting students through interactive and participatory methods. The activity was conducted as scheduled and achieved its intended objectives, with active engagement from participants."
    },
    {
      id: 2,
      activity: "Group Session A",
      type: "Group Session",
      project: "Project Y",
      responsibleEmployee: "Ameer Jamal",
      employeePhoto: AmeerJamalPhoto,
      status: "Planned",
      approval: "Rejected",
      location: "Hattin School",
      coordinates: { lat: "31.50090", lng: "34.46710" },
      date: new Date(2025, 11, 8),
      duration: "1.5 hr",
      team: "Hasan Jaber",
      description: "A planned group session for students."
    },
    {
      id: 3,
      activity: "Workshop B",
      type: "Workshop",
      project: "Project Z",
      responsibleEmployee: "Amal Ahmed",
      employeePhoto: AmalAhmedPhoto,
      status: "Planned",
      approval: "Pending",
      location: "Hattin School",
      coordinates: { lat: "31.50090", lng: "34.46710" },
      date: new Date(2025, 11, 10),
      duration: "2 hr",
      team: "Rania Abed",
      description: "A planned workshop for students."
    },
    {
      id: 4,
      activity: "Group Session B",
      type: "Group Session",
      project: "Project E",
      responsibleEmployee: "Amal Ahmed",
      employeePhoto: AmalAhmedPhoto,
      status: "Planned",
      approval: "Approved",
      location: "Hattin School",
      coordinates: { lat: "31.50090", lng: "34.46710" },
      date: new Date(2025, 11, 11),
      duration: "1.5 hr",
      team: "Hasan Jaber, Rania Abed",
      description: "A planned group session for students."
    }
  ];

  // Summary statistics
  const summaryStats = {
    planned: 6,
    implemented: 3,
    approved: 1,
    pending: 1
  };

  // Format date
  const formatDate = (date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Handle checkbox selection
  const handleCheckboxChange = (activityId) => {
    setSelectedActivities(prev => {
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
      } else {
        return [...prev, activityId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedActivities.length === paginatedData.length) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(paginatedData.map(act => act.id));
    }
  };

  // Status options
  const statusOptions = ["All Status", "Planned", "Implemented"];
  const approvalStatusOptions = ["All Approval Status", "Approved", "Rejected", "Pending"];

  // Filter data
  const filteredData = activitiesData.filter(activity => {
    const matchesSearch = activity.activity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "All Status" || activity.status === selectedStatus;
    const matchesApproval = selectedApprovalStatus === "All Approval Status" || activity.approval === selectedApprovalStatus;
    return matchesSearch && matchesStatus && matchesApproval;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.max(3, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (approvalStatusDropdownRef.current && !approvalStatusDropdownRef.current.contains(event.target)) {
        setIsApprovalStatusDropdownOpen(false);
      }

      // Handle shared user dropdown state
      const clickedInsideMobile = userDropdownMobileRef.current && userDropdownMobileRef.current.contains(event.target);
      const clickedInsideDesktop = userDropdownRef.current && userDropdownRef.current.contains(event.target);

      if (!clickedInsideMobile && !clickedInsideDesktop) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar Component */}
        <Sidebar
          userRole={userRole}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-[#F5F7FA]" style={{ minWidth: 0, maxWidth: '100%' }}>
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
                    <div className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50">
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
                          navigate("/login");
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
              <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: '#B0B0B0' }}>Activities</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            {/* Title and Subtitle */}
            <div className="mb-[32px]">
              <h1
                className="text-[24px] mb-[4px]"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  color: '#000000'
                }}
              >
                Activities
              </h1>
              <p
                className="text-[14px]"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  color: '#6B7280'
                }}
              >
                View all planned & implemented activities across the organization
              </p>
            </div>

            {/* Summary Cards */}
            <div className="flex justify-center items-center gap-[16px] mt-[48px] mb-[48px] flex-wrap">
              {/* Planned Activities Card */}
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
                  <img src={PlannedIcon} alt="Planned" style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }} />
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
                    {summaryStats.planned}
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
                    Planned Activities
                  </p>
                </div>
              </div>

              {/* Implemented Activities Card */}
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
                  <img src={CalendarIcon} alt="Implemented" style={{ width: '32px', height: '32px', objectFit: 'contain', display: 'block' }} />
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
                    {summaryStats.implemented}
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
                    Implemented Activities
                  </p>
                </div>
              </div>

              {/* Approved Activities Card */}
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
                    Approved Activities
                  </p>
                </div>
              </div>

              {/* Pending Activities Card */}
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
                    Pending Activities
                  </p>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-[8px] mb-[24px] flex-wrap">
              {/* Date Picker */}
              <div className="relative flex-shrink-0">
                <div
                  ref={dateInputRef}
                  onClick={() => dateInputRef.current?.querySelector('input')?.showPicker?.() || dateInputRef.current?.querySelector('input')?.click()}
                  className="h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between cursor-pointer"
                  style={{ minWidth: '200px' }}
                >
                  <span
                    className="text-[14px] text-[#000000]"
                    style={{ fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                  >
                    {formatDate(selectedDate)}
                  </span>
                  <svg
                    className="w-[16px] h-[16px] text-[#6B7280] cursor-pointer"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={(e) => {
                      e.stopPropagation();
                      dateInputRef.current?.querySelector('input')?.showPicker?.() || dateInputRef.current?.querySelector('input')?.click();
                    }}
                  >
                    <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="date"
                    ref={(el) => {
                      if (el && dateInputRef.current) {
                        dateInputRef.current.input = el;
                      }
                    }}
                    value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
                    onChange={(e) => {
                      const newDate = new Date(e.target.value);
                      setSelectedDate(newDate);
                    }}
                    className="absolute opacity-0 pointer-events-none"
                    style={{ width: 0, height: 0 }}
                  />
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="relative flex-shrink-0" ref={statusDropdownRef}>
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between"
                  style={{ minWidth: '200px' }}
                >
                  <span
                    className="text-[14px] text-[#000000]"
                    style={{ fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                  >
                    {selectedStatus}
                  </span>
                  <svg
                    className={`w-[16px] h-[16px] text-[#6B7280] transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[8px] bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg min-w-[200px] z-50">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full px-[16px] py-[12px] text-left text-[14px] transition-colors ${selectedStatus === status
                          ? 'bg-[#E5E7EB] text-[#333333]'
                          : 'text-[#333333] hover:bg-[#F5F7FA]'
                          } first:rounded-t-[10px] last:rounded-b-[10px]`}
                        style={{ fontWeight: 400 }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Approval Status Dropdown */}
              <div className="relative flex-shrink-0" ref={approvalStatusDropdownRef}>
                <button
                  onClick={() => setIsApprovalStatusDropdownOpen(!isApprovalStatusDropdownOpen)}
                  className="h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between"
                  style={{ minWidth: '200px' }}
                >
                  <span
                    className="text-[14px] text-[#000000]"
                    style={{ fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                  >
                    {selectedApprovalStatus}
                  </span>
                  <svg
                    className={`w-[16px] h-[16px] text-[#6B7280] transition-transform ${isApprovalStatusDropdownOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isApprovalStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[8px] bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg min-w-[200px] z-50">
                    {approvalStatusOptions.map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedApprovalStatus(status);
                          setIsApprovalStatusDropdownOpen(false);
                        }}
                        className={`w-full px-[16px] py-[12px] text-left text-[14px] transition-colors ${selectedApprovalStatus === status
                          ? 'bg-[#E5E7EB] text-[#333333]'
                          : 'text-[#333333] hover:bg-[#F5F7FA]'
                          } first:rounded-t-[10px] last:rounded-b-[10px]`}
                        style={{ fontWeight: 400 }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input */}
              <div className="relative flex-1" style={{ minWidth: '180px' }}>
                <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by activity name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{ fontWeight: 400 }}
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedActivities.length > 0 && (
              <div className="mb-[20px] bg-white rounded-[10px] p-[16px] flex items-center gap-[16px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div className="text-[14px] text-[#333333]" style={{ fontWeight: 500 }}>
                  {selectedActivities.length} selected
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
                    <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-20 min-w-[200px]">
                      <button
                        onClick={() => {
                          setShowWarningModal(true);
                          setIsBulkActionsDropdownOpen(false);
                        }}
                        className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] flex items-center gap-[8px] first:rounded-t-[8px]"
                        style={{ fontWeight: 400 }}
                      >
                        <span style={{ fontSize: '16px' }}>✗</span>
                        Delete selected
                      </button>
                      <button
                        onClick={() => {
                          console.log('Mark as reviewed', selectedActivities);
                          setSelectedActivities([]);
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

            {/* Table */}
            <div className="bg-white rounded-[10px] overflow-hidden" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={selectedActivities.length === paginatedData.length && paginatedData.length > 0}
                          onChange={handleSelectAll}
                          className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                        />
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Activity
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Type
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Project
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Responsible Employee
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Status
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Approval
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((activity) => (
                      <tr key={activity.id} className="border-b border-[#E0E0E0] hover:bg-[#F9FAFB]">
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <input
                            type="checkbox"
                            checked={selectedActivities.includes(activity.id)}
                            onChange={() => handleCheckboxChange(activity.id)}
                            className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                          />
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {activity.activity}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {activity.type}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {activity.project}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {activity.responsibleEmployee}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {activity.status}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          {(() => {
                            let style = { fontWeight: 600, whiteSpace: 'nowrap' };
                            if (activity.approval === "Pending") {
                              style = { ...style, color: '#6B6B6B', backgroundColor: '#E5E7EB' };
                            } else if (activity.approval === "Approved") {
                              style = { ...style, color: '#00564F', backgroundColor: '#68BFCC' };
                            } else if (activity.approval === "Rejected") {
                              style = { ...style, color: '#830000', backgroundColor: '#FFBDB6B2' };
                            } else {
                              style = { ...style, color: '#333333' }; // Fallback
                            }

                            return (
                              <span
                                className={`text-[13px] inline-block ${activity.approval !== "Pending" && activity.approval !== "Approved" && activity.approval !== "Rejected" ? '' : 'w-[90px] py-[4px] rounded-[4px] text-center'}`}
                                style={style}
                              >
                                {activity.approval}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-[12px] py-[12px] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <div className="flex items-center justify-center gap-0">
                            <button
                              onClick={() => setSelectedActivityForDetails(activity)}
                              className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity"
                              title="View"
                            >
                              <img src={ViewIcon} alt="View" className="w-full h-full object-contain" />
                            </button>
                            <div className="w-[1px] h-[22px] bg-[#E0E0E0] mx-[8px]"></div>
                            <button
                              onClick={() => {
                                setActivityToDelete(activity);
                                setShowWarningModal(true);
                              }}
                              className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity"
                              title="Delete"
                            >
                              <img src={DeleteIcon} alt="Delete" className="w-full h-full object-contain" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                    onClick={() => setCurrentPage(page)}
                    className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-colors bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: currentPage === page ? 600 : 400,
                      color: currentPage === page ? '#474747' : '#827F7F',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-colors bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA]"
                  style={{
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                  disabled={currentPage === totalPages}
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
            <div className="relative" ref={userDropdownMobileRef}>
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
                <div className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50">
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
                      navigate("/login");
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

        <div className="flex-1 p-4 pb-10">
          {/* Title and Subtitle */}
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold text-[#000000] mb-1">Activities</h1>
            <p className="text-[12px] text-[#6B7280]">View all planned & implemented activities</p>
          </div>

          {/* Summary Cards Mobile Stack */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Planned */}
            <div className="bg-white p-4 rounded-[12px] shadow-sm border border-[#E0E0E0] flex items-center gap-4">
              <div className="w-[48px] h-[48px] bg-[#7AC1BB] rounded-full flex items-center justify-center flex-shrink-0">
                <img src={PlannedIcon} alt="Planned" className="w-[24px] h-[24px] object-contain" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-[#00675E] leading-none mb-1">{summaryStats.planned}</p>
                <p className="text-[12px] font-medium text-[#3F817C]">Planned Activities</p>
              </div>
            </div>

            {/* Implemented */}
            <div className="bg-white p-4 rounded-[12px] shadow-sm border border-[#E0E0E0] flex items-center gap-4">
              <div className="w-[48px] h-[48px] bg-[#7AC1BB] rounded-full flex items-center justify-center flex-shrink-0">
                <img src={CalendarIcon} alt="Implemented" className="w-[24px] h-[24px] object-contain" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-[#00675E] leading-none mb-1">{summaryStats.implemented}</p>
                <p className="text-[12px] font-medium text-[#3F817C]">Implemented Activities</p>
              </div>
            </div>

            {/* Approved */}
            <div className="bg-white p-4 rounded-[12px] shadow-sm border border-[#E0E0E0] flex items-center gap-4">
              <div className="w-[48px] h-[48px] bg-[#7AC1BB] rounded-full flex items-center justify-center flex-shrink-0">
                <img src={ApprovedIcon} alt="Approved" className="w-[24px] h-[24px] object-contain" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-[#00675E] leading-none mb-1">{summaryStats.approved}</p>
                <p className="text-[12px] font-medium text-[#3F817C]">Approved Activities</p>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white p-4 rounded-[12px] shadow-sm border border-[#E0E0E0] flex items-center gap-4">
              <div className="w-[48px] h-[48px] bg-[#7AC1BB] rounded-full flex items-center justify-center flex-shrink-0">
                <img src={PendingIcon} alt="Pending" className="w-[24px] h-[24px] object-contain" />
              </div>
              <div>
                <p className="text-[24px] font-bold text-[#00675E] leading-none mb-1">{summaryStats.pending}</p>
                <p className="text-[12px] font-medium text-[#3F817C]">Pending Activities</p>
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Date Picker */}
            <div
              onClick={() => dateInputRef.current?.querySelector('input')?.showPicker?.() || dateInputRef.current?.querySelector('input')?.click()}
              className="h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between cursor-pointer"
            >
              <span className="text-[14px] font-semibold">{formatDate(selectedDate)}</span>
              <svg className="w-[16px] h-[16px] text-[#6B7280]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" /></svg>
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between"
              >
                <span className="text-[14px] font-semibold">{selectedStatus}</span>
                <svg className={`w-[16px] h-[16px] text-[#6B7280] transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9L12 15L18 9" /></svg>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-20">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => { setSelectedStatus(status); setIsStatusDropdownOpen(false); }}
                      className={`w-full px-[16px] py-[12px] text-left text-[14px] ${selectedStatus === status ? 'bg-[#E5E7EB] font-semibold' : 'hover:bg-[#F5F7FA]'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Approval Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsApprovalStatusDropdownOpen(!isApprovalStatusDropdownOpen)}
                className="w-full h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between"
              >
                <span className="text-[14px] font-semibold">{selectedApprovalStatus}</span>
                <svg className={`w-[16px] h-[16px] text-[#6B7280] transition-transform ${isApprovalStatusDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9L12 15L18 9" /></svg>
              </button>
              {isApprovalStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-20">
                  {approvalStatusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => { setSelectedApprovalStatus(status); setIsApprovalStatusDropdownOpen(false); }}
                      className={`w-full px-[16px] py-[12px] text-left text-[14px] ${selectedApprovalStatus === status ? 'bg-[#E5E7EB] font-semibold' : 'hover:bg-[#F5F7FA]'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text"
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]"
              />
            </div>
          </div>

          {/* Activities Cards - Mobile */}
          <div className="flex flex-col gap-[12px]">
            {paginatedData.map((activity) => (
              <div key={activity.id} className="bg-white rounded-[10px] border border-[#E0E0E0] shadow-sm p-[16px]">
                <div className="flex items-start justify-between mb-[12px]">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[40px] h-[40px] rounded-full bg-[#E5E7EB] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img src={activity.employeePhoto} alt={activity.responsibleEmployee} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#111827] mb-[2px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                        {activity.responsibleEmployee}
                      </p>
                      <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                        {activity.project}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <button
                      onClick={() => setSelectedActivityForDetails(activity)}
                      className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
                    >
                      <img src={ViewIcon} alt="View" className="w-[16px] h-[16px] object-contain" />
                    </button>
                    <button
                      onClick={() => {
                        setActivityToDelete(activity);
                        setShowWarningModal(true);
                      }}
                      className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
                    >
                      <img src={DeleteIcon} alt="Delete" className="w-[16px] h-[16px] object-contain" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-[8px] mb-[12px]">
                  <span className="inline-block px-[12px] py-[4px] rounded-[6px] bg-[#E0F2FE] text-[#0369A1] text-[12px] font-medium" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {activity.type}
                  </span>
                  <span className={`inline-block px-[12px] py-[4px] rounded-[6px] text-[12px] font-medium ${activity.status === 'Implemented' ? 'bg-[#D1FAE5] text-[#065F46]' :
                    activity.status === 'Planned' ? 'bg-[#FEF3C7] text-[#92400E]' :
                      'bg-[#E0E7FF] text-[#3730A3]'
                    }`} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {activity.status}
                  </span>
                  <span className={`inline-block px-[12px] py-[4px] rounded-[6px] text-[12px] font-medium ${activity.approval === 'Approved' ? 'bg-[#D1FAE5] text-[#065F46]' :
                    activity.approval === 'Rejected' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                      'bg-[#FEF3C7] text-[#92400E]'
                    }`} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                    {activity.approval}
                  </span>
                </div>

                <div className="space-y-[4px]">
                  <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    <span className="font-medium text-[#374151]">Activity:</span> {activity.activity}
                  </p>
                  <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    <span className="font-medium text-[#374151]">Date:</span> {formatDate(activity.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - Mobile */}
          {filteredData.length > 0 && (
            <div className="mt-[24px] flex items-center justify-center gap-[8px]">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
                style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <svg className="w-[16px] h-[16px] text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page Numbers */}
              {Array.from({ length: Math.max(3, totalPages) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => {
                    if (page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-[14px] transition-colors bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA] ${currentPage === page
                    ? 'font-semibold'
                    : ''
                    }`}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: currentPage === page ? 600 : 400,
                    color: currentPage === page ? '#474747' : '#827F7F',
                    cursor: 'pointer'
                  }}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => {
                  const maxPages = Math.max(3, totalPages);
                  setCurrentPage(prev => Math.min(maxPages, prev + 1));
                }}
                className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
                style={{ opacity: currentPage >= Math.max(3, totalPages) ? 0.5 : 1, cursor: currentPage >= Math.max(3, totalPages) ? 'not-allowed' : 'pointer' }}
              >
                <svg className="w-[16px] h-[16px] text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Warning Modal */}
      {/* Warning Modal */}
      {showWarningModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowWarningModal(false);
            setActivityToDelete(null);
          }}
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
                Are you sure you want to delete {activityToDelete ? 'this activity' : `${selectedActivities.length} selected activit${selectedActivities.length > 1 ? 'ies' : 'y'}`}?
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
                  if (activityToDelete) {
                    console.log('Deleting activity:', activityToDelete);
                  } else {
                    console.log('Deleting selected activities:', selectedActivities);
                    setSelectedActivities([]);
                  }
                  setShowWarningModal(false);
                  setActivityToDelete(null);
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
                  setActivityToDelete(null);
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
      {/* Activity Details Modal */}
      {selectedActivityForDetails && (
        <ActivityDetailsModal
          activity={selectedActivityForDetails}
          onClose={() => setSelectedActivityForDetails(null)}
          onDelete={(activity) => {
            setActivityToDelete(activity);
            setShowWarningModal(true);
          }}
        />
      )}
    </div>
  );
};

export default ActivitiesPage;

