import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import LocationErrorModal from "./LocationErrorModal";

// User Avatar
const UserAvatar = new URL(
  "../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg",
  import.meta.url
).href;

// Header icons
const MessageIcon = new URL(
  "../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png",
  import.meta.url
).href;
const NotificationIcon = new URL(
  "../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png",
  import.meta.url
).href;
const DropdownArrow = new URL(
  "../images/f770524281fcd53758f9485b3556316915e91e7b.png",
  import.meta.url
).href;

const MyAttendancePage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("3-3");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState("");
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkOutTime, setCheckOutTime] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [showLocationModal, setShowLocationModal] = useState(false);


  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const statusDropdownRef = useRef(null);
  const userDropdownDesktopRef = useRef(null);
  const userDropdownMobileRef = useRef(null);

  // ثابت مؤقت لمكان الـ Check-in (عدّليه حسب الداتا عندك)
  const checkInLocationLabel = "Gaza Office (GPS)";

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Sample attendance data
  const attendanceData = [
    {
      id: 1,
      date: new Date(2025, 11, 7), // Dec 7, 2025
      checkIn: "08:00 Am",
      checkOut: "04:02 Pm",
      workHours: "8 hr, 2 m",
      location: "Head Office",
      type: "Office",
      status: "Present",
    },
    {
      id: 2,
      date: new Date(2025, 11, 8), // Dec 8, 2025
      checkIn: "10:05 Am",
      checkOut: "04:20 Pm",
      workHours: "6 hr, 15 m",
      location: "Head Office",
      type: "Office",
      status: "Late",
    },
    {
      id: 3,
      date: new Date(2025, 11, 10), // Dec 10, 2025
      checkIn: "08:02 Am",
      checkOut: "-",
      workHours: "-",
      location: "Head Office",
      type: "Office",
      status: "Missing Check-out",
    },
    {
      id: 4,
      date: new Date(2025, 11, 11), // Dec 11, 2025
      checkIn: "-",
      checkOut: "-",
      workHours: "-",
      location: "-",
      type: "-",
      status: "Absent",
    },
  ];

  // Format date
  const formatDate = (date) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Status options
  const statusOptions = [
    "All Status",
    "Present",
    "In progress",
    "Late",
    "Absent",
    "Missing Check-out",
  ];

  // Filter data based on status
  const filteredData = attendanceData.filter((item) => {
    if (selectedStatus === "All Status") return true;
    return item.status === selectedStatus;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.max(3, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setIsStatusDropdownOpen(false);
      }

      if (
        (!userDropdownDesktopRef.current || !userDropdownDesktopRef.current.contains(event.target)) &&
        (!userDropdownMobileRef.current || !userDropdownMobileRef.current.contains(event.target))
      ) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle Check-in
  // Handle Check-in
  const handleCheckIn = () => {
    // For now, simulate location failure and show modal
    setShowLocationModal(true);
  };

  const confirmCheckIn = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "Pm" : "Am";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    const timeString = `${displayHours}:${displayMinutes} ${ampm}`;

    setCheckInTime(timeString);
    setIsCheckedIn(true);
    setIsCheckedOut(false);
    setCheckOutTime("");
    setTotalHours("");
    setShowLocationModal(false);
  };

  // Handle Check-out
  const handleCheckOut = () => {
    if (!isCheckedIn || isCheckedOut) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "Pm" : "Am";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    const timeString = `${displayHours}:${displayMinutes} ${ampm}`;

    setCheckOutTime(timeString);
    setIsCheckedOut(true);

    // Calculate total hours
    if (checkInTime) {
      const checkInMatch = checkInTime.match(/(\d+):(\d+)\s*(Am|Pm)/i);
      if (checkInMatch) {
        let checkInHours = parseInt(checkInMatch[1], 10);
        const checkInMinutes = parseInt(checkInMatch[2], 10);
        const checkInAmPm = checkInMatch[3].toLowerCase();

        if (checkInAmPm === "pm" && checkInHours !== 12) checkInHours += 12;
        if (checkInAmPm === "am" && checkInHours === 12) checkInHours = 0;

        // now.getHours() already 0-23 (24h)
        const totalMinutes =
          (hours * 60 + minutes) - (checkInHours * 60 + checkInMinutes);

        const safeTotal = Math.max(0, totalMinutes);
        const workHours = Math.floor(safeTotal / 60);
        const workMinutes = safeTotal % 60;

        setTotalHours(`${workHours} hr, ${workMinutes} m`);
      }
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#F5F7FA]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="hidden lg:flex min-h-screen">
        {/* Sidebar Component */}
        <Sidebar
          userRole={userRole}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
        />

        {/* Main Content */}
        <main
          className="flex-1 flex flex-col bg-[#F5F7FA]"
          style={{ minWidth: 0, maxWidth: "100%" }}
        >
          {/* Header */}
          <header
            className="bg-white px-[40px] py-[24px]"
            style={{
              minWidth: 0,
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              className="flex items-center justify-between mb-[16px]"
              style={{ minWidth: 0, maxWidth: "100%" }}
            >
              <div className="relative flex-shrink-0">
                <svg
                  className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
                  <img
                    src={MessageIcon}
                    alt="Messages"
                    className="w-[20px] h-[20px] object-contain"
                  />
                </button>
                <button className="relative w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img
                    src={NotificationIcon}
                    alt="Notifications"
                    className="w-[20px] h-[20px] object-contain"
                  />
                  <span className="absolute top-[4px] right-[4px] w-[8px] h-[8px] bg-red-500 rounded-full"></span>
                </button>
                {/* User Profile with Dropdown */}
                <div className="relative" ref={userDropdownDesktopRef}>
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
            </div>

            {/* Breadcrumb */}
            <div>
              <p
                className="text-[12px]"
                style={{ fontWeight: 500, fontFamily: "Inter, sans-serif" }}
              >
                <span style={{ color: "#B0B0B0" }}>Attendance</span>
                <span className="mx-[8px]" style={{ color: "#B0B0B0" }}>
                  &gt;
                </span>
                <span style={{ color: "#8E8C8C" }}>My Attendance</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div
            className="flex-1 p-[36px] bg-[#F5F7FA]"
            style={{
              overflowX: "hidden",
              maxWidth: "100%",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Title and Subtitle */}
            <div className="mb-[32px]">
              <h1
                className="text-[24px] mb-[4px]"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  color: "#000000",
                }}
              >
                My Attendance
              </h1>
              <p
                className="text-[14px]"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 400,
                  color: "#6B7280",
                }}
              >
                Track your daily attendance, check-ins and work hours
              </p>
            </div>

            {/* Check-in and Check-out Section */}
            <div className="flex flex-col gap-[20px] mb-[48px]">

              {/* Row 1: Check-in */}
              <div className="flex items-center gap-[16px]">
                <button
                  onClick={handleCheckIn}
                  disabled={isCheckedIn}
                  className="w-[240px] h-[52px] rounded-[5px] text-white flex items-center justify-center transition-opacity hover:opacity-90 flex-shrink-0"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "16px",
                    backgroundColor: "#56A39C",
                    border: "1px solid #027066",
                    opacity: isCheckedIn ? 0.85 : 1,
                    cursor: isCheckedIn ? "not-allowed" : "pointer",
                  }}
                >
                  Check-in
                </button>

                {isCheckedIn && (
                  <div
                    className="rounded-[5px] bg-white px-[16px] py-[8px]"
                    style={{
                      height: "52px",
                      minWidth: "274px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: "2px",
                      border: "1.5px solid rgba(2, 112, 102, 0.4)",
                    }}
                  >
                    <div className="text-[14px] leading-[1.2] whitespace-nowrap">
                      <span style={{ color: "#027066", fontWeight: 600 }}>
                        Checked-in :{" "}
                      </span>
                      <span style={{ color: "#6B7280", fontWeight: 400 }}>
                        {checkInTime}
                      </span>
                    </div>

                    <div className="text-[14px] leading-[1.2] whitespace-nowrap">
                      <span style={{ color: "#027066", fontWeight: 600 }}>
                        Location:{" "}
                      </span>
                      <span style={{ color: "#6B7280", fontWeight: 400 }}>
                        {checkInLocationLabel}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Row 2: Check-out */}
              <div className="flex items-center gap-[16px]">
                <button
                  onClick={handleCheckOut}
                  disabled={!isCheckedIn || isCheckedOut}
                  className="w-[240px] h-[52px] rounded-[5px] flex items-center justify-center transition-opacity hover:opacity-90 flex-shrink-0"
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: "16px",
                    backgroundColor: "#D9D9D9",
                    border: "1px solid #B5B1B1",
                    color: "#6C6C6C",
                    opacity: !isCheckedIn || isCheckedOut ? 0.7 : 1,
                    cursor: !isCheckedIn || isCheckedOut ? "not-allowed" : "pointer",
                  }}
                >
                  Check-out
                </button>

                {isCheckedOut && (
                  <>
                    {/* Check-out Info Box */}
                    <div
                      className="rounded-[5px] bg-white px-[16px] py-[8px]"
                      style={{
                        height: "52px",
                        minWidth: "274px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: "2px",
                        border: "1.5px solid rgba(2, 112, 102, 0.4)",
                      }}
                    >
                      <div className="text-[14px] leading-[1.2] whitespace-nowrap">
                        <span style={{ color: "#027066", fontWeight: 600 }}>
                          Checked-out :{" "}
                        </span>
                        <span style={{ color: "#6B7280", fontWeight: 400 }}>
                          {checkOutTime}
                        </span>
                      </div>

                      <div className="text-[14px] leading-[1.2] whitespace-nowrap">
                        <span style={{ color: "#027066", fontWeight: 600 }}>
                          Location:{" "}
                        </span>
                        <span style={{ color: "#6B7280", fontWeight: 400 }}>
                          {checkInLocationLabel}
                        </span>
                      </div>
                    </div>

                    {/* Total Box */}
                    <div
                      className="rounded-[5px] bg-white px-[16px] py-[8px]"
                      style={{
                        height: "52px",
                        maxHeight: "52px",
                        minWidth: "200px",
                        display: "flex", // Keep flex to align visually
                        alignItems: "center", // Center vertically 
                        justifyContent: "flex-start",
                        border: "1.5px solid rgba(2, 112, 102, 0.4)",
                      }}
                    >
                      <div className="text-[14px] leading-[1.2] whitespace-nowrap">
                        <span style={{ color: "#027066", fontWeight: 600 }}>
                          Total :{" "}
                        </span>
                        <span style={{ color: "#6B7280", fontWeight: 400 }}>
                          {totalHours}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-[8px] mb-[24px] flex-wrap">
              {/* Status Dropdown */}
              <div className="relative flex-shrink-0" ref={statusDropdownRef}>
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between"
                  style={{ minWidth: "200px" }}
                >
                  <span
                    className="text-[14px] text-[#000000]"
                    style={{ fontWeight: 600, fontFamily: "Inter, sans-serif" }}
                  >
                    {selectedStatus}
                  </span>
                  <svg
                    className={`w-[16px] h-[16px] text-[#6B7280] transition-transform ${isStatusDropdownOpen ? "rotate-180" : ""
                      }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
                          ? "bg-[#E5E7EB] text-[#333333]"
                          : "text-[#333333] hover:bg-[#F5F7FA]"
                          } first:rounded-t-[10px] last:rounded-b-[10px]`}
                        style={{ fontWeight: 400 }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div
              className="bg-white rounded-[10px] overflow-hidden"
              style={{ boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      <th
                        className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]"
                        style={{ fontWeight: 500, whiteSpace: "nowrap" }}
                      >
                        Date
                      </th>
                      <th
                        className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]"
                        style={{ fontWeight: 500, whiteSpace: "nowrap" }}
                      >
                        Check-in
                      </th>
                      <th
                        className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]"
                        style={{ fontWeight: 500, whiteSpace: "nowrap" }}
                      >
                        Check-out
                      </th>
                      <th
                        className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]"
                        style={{ fontWeight: 500, whiteSpace: "nowrap" }}
                      >
                        Work hours
                      </th>
                      <th
                        className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]"
                        style={{ fontWeight: 500, whiteSpace: "nowrap" }}
                      >
                        Location
                      </th>
                      <th
                        className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280] border-r border-[#E0E0E0]"
                        style={{ fontWeight: 500, whiteSpace: "nowrap" }}
                      >
                        Type
                      </th>
                      <th
                        className="px-[12px] py-[12px] text-center text-[14px] text-[#6B7280]"
                        style={{ fontWeight: 500, whiteSpace: "nowrap" }}
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#E0E0E0] hover:bg-[#F9FAFB]"
                      >
                        <td
                          className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <span
                            className="text-[14px] text-[#333333]"
                            style={{ fontWeight: 600 }}
                          >
                            {formatDate(item.date)}
                          </span>
                        </td>
                        <td
                          className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <span
                            className="text-[14px] text-[#333333]"
                            style={{ fontWeight: 600 }}
                          >
                            {item.checkIn}
                          </span>
                        </td>
                        <td
                          className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <span
                            className="text-[14px] text-[#333333]"
                            style={{ fontWeight: 600 }}
                          >
                            {item.checkOut}
                          </span>
                        </td>
                        <td
                          className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <span
                            className="text-[14px] text-[#333333]"
                            style={{ fontWeight: 600 }}
                          >
                            {item.workHours}
                          </span>
                        </td>
                        <td
                          className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <span
                            className="text-[14px] text-[#333333]"
                            style={{ fontWeight: 600 }}
                          >
                            {item.location}
                          </span>
                        </td>
                        <td
                          className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <span
                            className="text-[14px] text-[#333333]"
                            style={{ fontWeight: 600 }}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td
                          className="px-[12px] py-[12px] text-center"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          <span
                            className="text-[14px] inline-block"
                            style={{
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              color: "#333333",
                            }}
                          >
                            {item.status}
                          </span>
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
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: currentPage === 1 ? "#E5E7EB" : "#FFFFFF",
                    border: "1px solid #E0E0E0",
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                  disabled={currentPage === 1}
                >
                  <svg
                    className="w-[16px] h-[16px] text-[#6B7280]"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-colors bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA]"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: currentPage === page ? 600 : 400,
                        color: currentPage === page ? "#474747" : "#827F7F",
                        fontSize: "14px",
                        cursor: "pointer",
                      }}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className="w-[32px] h-[32px] rounded-full flex items-center justify-center transition-all"
                  style={{
                    backgroundColor:
                      currentPage === totalPages ? "#E5E7EB" : "#FFFFFF",
                    border: "1px solid #E0E0E0",
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                  disabled={currentPage === totalPages}
                >
                  <svg
                    className="w-[16px] h-[16px] text-[#6B7280]"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="relative z-10 h-full">
              <Sidebar
                userRole={userRole}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                isMobile={true}
                onClose={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Mobile Content */}
        <div className="flex-1 p-4 pb-20 overflow-y-auto">
          {/* Mobile Check-in/Check-out Section */}
          <div className="flex flex-col gap-6 mb-6">

            {/* Check-in Card (Mobile) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold text-gray-800">Check-in</h3>
                <div className={`px-2 py-1 rounded text-xs font-medium ${isCheckedIn ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
                  {isCheckedIn ? 'Active' : 'Pending'}
                </div>
              </div>

              <button
                onClick={handleCheckIn}
                disabled={isCheckedIn}
                className="w-full h-[48px] rounded-lg text-white font-medium flex items-center justify-center transition-opacity"
                style={{
                  backgroundColor: "#56A39C",
                  opacity: isCheckedIn ? 0.7 : 1,
                }}
              >
                {isCheckedIn ? 'Checked In' : 'Tap to Check-in'}
              </button>

              {isCheckedIn && (
                <div className="bg-teal-50 rounded-lg p-3 border border-teal-100/50 mt-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-teal-700 font-semibold">Time</span>
                    <span className="text-xs text-gray-600">{checkInTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-teal-700 font-semibold">Location</span>
                    <span className="text-xs text-gray-600">{checkInLocationLabel}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Check-out Card (Mobile) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-semibold text-gray-800">Check-out</h3>
                <div className={`px-2 py-1 rounded text-xs font-medium ${isCheckedOut ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'}`}>
                  {isCheckedOut ? 'Completed' : 'Pending'}
                </div>
              </div>

              <button
                onClick={handleCheckOut}
                disabled={!isCheckedIn || isCheckedOut}
                className="w-full h-[48px] rounded-lg text-white font-medium flex items-center justify-center transition-opacity"
                style={{
                  backgroundColor: !isCheckedIn || isCheckedOut ? "#D1D5DB" : "#00564F",
                  color: !isCheckedIn || isCheckedOut ? "#6B7280" : "#FFFFFF",
                }}
              >
                {isCheckedOut ? 'Checked Out' : 'Tap to Check-out'}
              </button>

              {isCheckedOut && (
                <div className="flex flex-col gap-2">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mt-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-teal-800 font-semibold">Time</span>
                      <span className="text-xs text-gray-600">{checkOutTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-teal-800 font-semibold">Location</span>
                      <span className="text-xs text-gray-600">{checkInLocationLabel}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex justify-between items-center">
                    <span className="text-sm text-teal-800 font-bold">Total Work Hours</span>
                    <span className="text-sm text-gray-600 font-bold">{totalHours}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Filter Status</label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-[44px] px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 appearance-none focus:outline-none focus:border-teal-500"
              >
                {statusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
              </div>
            </div>
          </div>

          {/* Mobile List (Cards) */}
          <div className="flex flex-col gap-[12px]">
            {paginatedData.map((item) => (
              <div key={item.id} className="bg-white rounded-[10px] border border-[#E0E0E0] shadow-sm p-[16px]">
                {/* Header: Date & Status */}
                <div className="flex justify-between items-start mb-[12px]">
                  <div>
                    <p className="text-[14px] font-medium text-[#111827] mb-[2px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                      {formatDate(item.date)}
                    </p>
                    <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                      {item.location}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-[12px] py-[4px] rounded-[6px] text-[12px] font-medium ${item.status === 'Present' ? 'bg-[#D1FAE5] text-[#065F46]' :
                      item.status === 'Absent' ? 'bg-[#FEE2E2] text-[#991B1B]' :
                        item.status === 'Late' ? 'bg-[#FEF3C7] text-[#92400E]' :
                          'bg-[#E0E7FF] text-[#3730A3]'
                      }`}
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                  >
                    {item.status}
                  </span>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-3 gap-2 py-[12px] border-t border-b border-[#F3F4F6] mb-[12px]">
                  <div className="text-center border-r border-[#F3F4F6] last:border-0">
                    <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>In</p>
                    <p className="text-[13px] font-semibold text-[#374151]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.checkIn}</p>
                  </div>
                  <div className="text-center border-r border-[#F3F4F6] last:border-0">
                    <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Out</p>
                    <p className="text-[13px] font-semibold text-[#374151]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.checkOut}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-1" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>Hrs</p>
                    <p className="text-[13px] font-semibold text-[#374151]" style={{ fontFamily: 'Inter, sans-serif' }}>{item.workHours}</p>
                  </div>
                </div>

                {/* Footer: Type */}
                <div className="flex justify-start">
                  <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    <span className="font-medium text-[#374151]">Type:</span> {item.type}
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

      <LocationErrorModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSelectLocation={confirmCheckIn}
      />
    </div>
  );
};

export default MyAttendancePage;
