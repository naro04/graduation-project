import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import HeaderUserAvatar from "./HeaderUserAvatar.jsx";
import { AvatarOrPlaceholder } from "./HeaderUserAvatar.jsx";
import { toAbsoluteAvatarUrl } from "../utils/avatarUrl.js";
import { getEffectiveRole, getCurrentUser } from "../services/auth.js";
import LogoutModal from "./LogoutModal";
import { getAttendanceReports, getAttendanceLocations, getTeamAttendance } from "../services/attendance";
import { getTeamMembers } from "../services/employees";
import { getLocationActivities, getLocationActivityReports } from "../services/locationActivities";
import { getTeamReports } from "../services/reports";
import { exportToExcel, exportToPdf } from "../utils/exportReport";
import HeaderIcons from "./HeaderIcons";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Action icons
const ExportIcon = new URL("../images/icons/export.png", import.meta.url).href;

// Team report summary card icons (same style as TeamMembersPage)
const IconTeamMembers = new URL("../images/icons/3d87f948737dea3440aecb37fdcbcdb3e9f23dab.png", import.meta.url).href;
const IconActiveEmployees = new URL("../images/icons/3da8b7c409ce43ff5ddfa27c211bbd28aada5f9d.png", import.meta.url).href;
const IconCompletedTasks = new URL("../images/icons/approved.png", import.meta.url).href;
const IconOverdueTasks = new URL("../images/icons/warnning.png", import.meta.url).href;
const IconAttendanceCommitment = new URL("../images/icons/Attendance1.png", import.meta.url).href;

const AttendanceReportPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTeamReportPage = location.pathname === "/reports/team";
  const pageTitle = isTeamReportPage ? "Team Reports" : "Attendance Reports";
  const pageSubtitle = isTeamReportPage ? "Attendance and check-in for your team members" : "Track daily attendance and check-in behavior";
  const currentUser = getCurrentUser();
  const effectiveRole = getEffectiveRole();
  const [activeMenu, setActiveMenu] = useState("7-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [isExportAllDropdownOpen, setIsExportAllDropdownOpen] = useState(false);
  const [isExportSelectedDropdownOpen, setIsExportSelectedDropdownOpen] = useState(false);
  const [isBulkActionsDropdownOpen, setIsBulkActionsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [reportsFromApi, setReportsFromApi] = useState([]);
  const [reportLocations, setReportLocations] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamActivities, setTeamActivities] = useState([]);
  const [teamReportApi, setTeamReportApi] = useState(null);
  const [teamMetricsLoading, setTeamMetricsLoading] = useState(false);
  const [teamAttendanceFromApi, setTeamAttendanceFromApi] = useState([]);
  const [teamSelectedTypes, setTeamSelectedTypes] = useState([]); // multi-select for Type (checkboxes)
  const [teamSelectedStatus, setTeamSelectedStatus] = useState("All Status");
  const [isTeamTypeDropdownOpen, setIsTeamTypeDropdownOpen] = useState(false);
  const [isTeamStatusDropdownOpen, setIsTeamStatusDropdownOpen] = useState(false);
  const [teamActivityReports, setTeamActivityReports] = useState({ records: [], stats: { completionTrend: [], participantsByType: [] } });
  const locationDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const locationDropdownRefMobile = useRef(null);
  const statusDropdownRefMobile = useRef(null);
  const teamTypeDropdownRef = useRef(null);
  const teamStatusDropdownRef = useRef(null);
  const exportAllDropdownRef = useRef(null);
  const exportSelectedDropdownRef = useRef(null);
  const bulkActionsDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR Admin",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  useEffect(() => {
    let cancelled = false;
    setReportsLoading(true);
    setReportsError(null);
    const reportParams = {
      from: fromDate,
      to: toDate,
    };
    if (selectedLocation && selectedLocation !== "All Locations") reportParams.location = selectedLocation;
    if (selectedStatus && selectedStatus !== "All Status") reportParams.status = selectedStatus;
    if (searchQuery && searchQuery.trim()) reportParams.search = searchQuery.trim();
    Promise.all([
      getAttendanceReports(reportParams).catch((err) => {
        if (!cancelled) setReportsError(err?.response?.data?.message || err?.message || "Failed to load reports");
        return [];
      }),
      getAttendanceLocations().catch(() => []),
    ]).then(([list, locs]) => {
      if (cancelled) return;
      setReportsFromApi(Array.isArray(list) ? list : []);
      setReportLocations(Array.isArray(locs) ? locs : []);
    }).finally(() => {
      if (!cancelled) setReportsLoading(false);
    });
    return () => { cancelled = true; };
  }, [fromDate, toDate, selectedLocation, selectedStatus, searchQuery]);

  useEffect(() => {
    if (!isTeamReportPage) return;
    let cancelled = false;
    setTeamMetricsLoading(true);
    setTeamReportApi(null);
    setTeamAttendanceFromApi([]);
    Promise.all([
      getTeamReports({ from: fromDate, to: toDate }).catch(() => null),
      getTeamMembers().catch(() => []),
      getLocationActivities({}).catch(() => []),
      getTeamAttendance({ from: fromDate, to: toDate }).catch(() => []),
      getLocationActivityReports({ from: fromDate, to: toDate }).catch(() => ({ records: [], stats: { completionTrend: [], participantsByType: [] } })),
    ]).then(([report, members, activities, teamAtt, activityReports]) => {
      if (cancelled) return;
      setTeamReportApi(report && typeof report === "object" ? report : null);
      setTeamMembers(Array.isArray(members) ? members : []);
      setTeamActivities(Array.isArray(activities) ? activities : []);
      setTeamAttendanceFromApi(Array.isArray(teamAtt) ? teamAtt : []);
      setTeamActivityReports(activityReports && activityReports.records ? activityReports : { records: [], stats: { completionTrend: [], participantsByType: [] } });
    }).finally(() => {
      if (!cancelled) setTeamMetricsLoading(false);
    });
    return () => { cancelled = true; };
  }, [isTeamReportPage, fromDate, toDate]);

  // Format date-time to single line for table (no scroll: compact)
  const formatDateTimeShort = (val) => {
    if (val == null || val === "" || val === "—") return "—";
    const str = String(val);
    try {
      const d = new Date(str);
      if (Number.isNaN(d.getTime())) return str;
      return d.toLocaleString(undefined, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
    } catch {
      return str;
    }
  };

  const normalizeAttendanceRow = (r) => ({
    id: r.id ?? r.attendance_id,
    employeeName: r.employee_name ?? r.employeeName ?? "—",
    employeePhoto: toAbsoluteAvatarUrl(r.avatar_url) || (r.photo ?? r.avatar_url ?? null),
    employeeId: String(r.employee_id ?? r.employeeId ?? "—"),
    checkIn: r.check_in ?? r.check_in_time ?? r.checkIn ?? "—",
    checkOut: r.check_out ?? r.check_out_time ?? r.checkOut ?? "—",
    attendanceType: r.attendance_type ?? r.check_method ?? r.type ?? "—",
    location: r.location_name ?? r.location ?? "—",
    status: r.status ?? "—",
  });

  const attendanceData = React.useMemo(() => {
    const raw = isTeamReportPage
      ? (teamAttendanceFromApi.length > 0 ? teamAttendanceFromApi : (Array.isArray(teamReportApi?.attendance) && teamReportApi.attendance.length > 0 ? teamReportApi.attendance : reportsFromApi || []))
      : (reportsFromApi || []);
    return raw.map(normalizeAttendanceRow);
  }, [isTeamReportPage, teamAttendanceFromApi, teamReportApi, reportsFromApi]);

  const dailyAttendanceData = React.useMemo(() => {
    const raw = isTeamReportPage
      ? (teamAttendanceFromApi.length > 0 ? teamAttendanceFromApi : (Array.isArray(teamReportApi?.attendance) && teamReportApi.attendance.length > 0 ? teamReportApi.attendance : reportsFromApi || []))
      : (reportsFromApi || []);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const byDay = raw.reduce((acc, r) => {
      const d = r.date ?? r.check_in_date ?? r.checkInDate;
      if (!d) return acc;
      const day = new Date(d).getDay();
      const key = dayNames[day];
      if (!acc[key]) acc[key] = { present: 0, late: 0, absent: 0 };
      const st = (r.status || "").toLowerCase();
      if (st === "present") acc[key].present++;
      else if (st === "late") acc[key].late++;
      else if (st === "absent") acc[key].absent++;
      return acc;
    }, {});
    return dayNames.map((day) => ({
      day,
      present: byDay[day]?.present ?? 0,
      late: byDay[day]?.late ?? 0,
      absent: byDay[day]?.absent ?? 0,
    }));
  }, [isTeamReportPage, teamAttendanceFromApi, teamReportApi, reportsFromApi]);

  const attendanceDistribution = React.useMemo(() => {
    const list = attendanceData;
    const present = list.filter((r) => (r.status || "").toLowerCase() === "present").length;
    const late = list.filter((r) => (r.status || "").toLowerCase() === "late").length;
    const absent = list.filter((r) => (r.status || "").toLowerCase() === "absent").length;
    const missingCheckout = list.filter((r) => (String(r.status || "").toLowerCase()).includes("missing") || (r.status || "").toLowerCase() === "missing check-out").length;
    return { present, late, absent, missingCheckout: missingCheckout || 0 };
  }, [attendanceData]);

  const teamReportMetrics = React.useMemo(() => {
    if (!isTeamReportPage) return null;
    const api = teamReportApi;
    if (api && typeof api.teamMembersCount === "number" && typeof api.activeEmployeesCount === "number") {
      return {
        teamMembersCount: api.teamMembersCount,
        activeEmployeesCount: api.activeEmployeesCount,
        completedTasks: typeof api.completedTasks === "number" ? api.completedTasks : 0,
        overdueTasks: typeof api.overdueTasks === "number" ? api.overdueTasks : 0,
        attendanceCommitmentRate: typeof api.attendanceCommitmentRate === "number" ? api.attendanceCommitmentRate : 0,
      };
    }
    const members = teamMembers || [];
    const teamMembersCount = members.length;
    const activeEmployeesCount = members.filter((m) => (String(m.status || "").toLowerCase()) === "active").length;
    const activities = teamActivities || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedTasks = activities.filter((a) => (String(a.implementation_status || "").toLowerCase()) === "implemented").length;
    const overdueTasks = activities.filter((a) => {
      const end = a.end_date ? new Date(a.end_date) : null;
      if (!end) return false;
      end.setHours(0, 0, 0, 0);
      const notCompleted = (String(a.implementation_status || "").toLowerCase()) !== "implemented";
      return end < today && notCompleted;
    }).length;
    const teamRaw = teamAttendanceFromApi.length > 0 ? teamAttendanceFromApi : (teamReportApi?.attendance || reportsFromApi || []);
    const totalRecords = Array.isArray(teamRaw) ? teamRaw.length : 0;
    const committedRecords = (teamRaw || []).filter(
      (r) => ((r.status || "").toLowerCase() === "present" || (r.status || "").toLowerCase() === "late")
    ).length;
    const attendanceCommitmentRate = totalRecords > 0 ? Math.round((committedRecords / totalRecords) * 100) : 0;
    return {
      teamMembersCount,
      activeEmployeesCount,
      completedTasks,
      overdueTasks,
      attendanceCommitmentRate,
    };
  }, [isTeamReportPage, teamReportApi, teamMembers, teamActivities, teamAttendanceFromApi, reportsFromApi]);

  // Team Reports: Field Activity–style data (same shape as FieldActivityReportsPage)
  const MONTH_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const teamActivityTableData = React.useMemo(() => {
    const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "");
    const records = teamActivityReports?.records ?? [];
    return records.map((r) => ({
      id: r.id ?? r.report_id,
      activity: r.name ?? r.activity ?? r.activity_name ?? "",
      type: r.type ?? r.activity_type ?? "",
      location: r.location ?? r.location_name ?? "",
      responsibleEmployee: r.responsible_employee ?? r.responsibleEmployee ?? r.employee_name ?? "",
      plannedDate: r.start_date ? (r.end_date ? `${fmt(r.start_date)} - ${fmt(r.end_date)}` : fmt(r.start_date)) : (r.planned_date ?? r.plannedDate ?? ""),
      actualDate: r.actual_date ? fmt(r.actual_date) : (r.actual_date ?? "-"),
      attendees: r.attendees ?? r.attendees_count ?? r.attendee_count ?? "",
      status: r.status ?? r.implementation_status ?? "",
    }));
  }, [teamActivityReports]);
  const teamMonthlyTrendData = React.useMemo(() => {
    const byMonth = {};
    (teamActivityReports?.stats?.completionTrend || []).forEach((r) => {
      const m = (r.month || "").trim().slice(0, 3);
      if (m) byMonth[m] = { month: m, implemented: Number(r.implemented) || 0, planned: Number(r.planned) || 0 };
    });
    return MONTH_ORDER.map((m) => byMonth[m] || { month: m, implemented: 0, planned: 0 });
  }, [teamActivityReports?.stats?.completionTrend]);
  const teamMonthlyParticipantsData = React.useMemo(() => {
    const byMonth = {};
    MONTH_ORDER.forEach((m) => { byMonth[m] = { month: m, workshop: 0, groupSession: 0 }; });
    (teamActivityReports?.records || []).forEach((r) => {
      const d = r.start_date ? new Date(r.start_date) : null;
      const monthKey = d ? MONTH_ORDER[d.getMonth()] : null;
      if (!monthKey || !byMonth[monthKey]) return;
      const type = (r.type || "").toLowerCase().replace(/\s+/g, "");
      const attendees = Number(r.attendees ?? r.attendees_count ?? r.attendee_count) || 0;
      if (type.includes("workshop")) byMonth[monthKey].workshop += attendees;
      else if (type.includes("group") || type.includes("session")) byMonth[monthKey].groupSession += attendees;
    });
    return MONTH_ORDER.map((m) => byMonth[m] || { month: m, workshop: 0, groupSession: 0 });
  }, [teamActivityReports?.records]);
  const teamActivityTypes = ["All Type", "Workshop", "Group Session"];
  const teamActivityTypeOptions = ["Workshop", "Group Session"]; // options for Type checkboxes (multi-select)
  const teamActivityStatusOptions = ["All Status", "Completed", "In Progress", "Pending"];
  const teamFilteredData = React.useMemo(() => {
    return teamActivityTableData.filter((row) => {
      const matchesType = teamSelectedTypes.length === 0 || (row.type && teamSelectedTypes.includes(row.type));
      const matchesStatus = teamSelectedStatus === "All Status" || (row.status || "").toLowerCase() === (teamSelectedStatus || "").toLowerCase().replace(/\s+/g, "");
      const matchesSearch = !searchQuery.trim() || (row.activity || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [teamActivityTableData, teamSelectedTypes, teamSelectedStatus, searchQuery]);
  const teamItemsPerPage = 10;
  const teamTotalPages = Math.max(1, Math.ceil(teamFilteredData.length / teamItemsPerPage));
  const teamPaginatedData = teamFilteredData.slice((currentPage - 1) * teamItemsPerPage, currentPage * teamItemsPerPage);

  const locations = ["All Locations", ...(reportLocations || []).map((l) => l.name ?? l.location_name ?? "").filter(Boolean)];

  // Status options
  const statusOptions = ["All Status", "Present", "Late", "Absent", "Missing Check-out", "In progress"];

  // Handle checkbox selection
  const handleCheckboxChange = (recordId) => {
    setSelectedRecords(prev => {
      if (prev.includes(recordId)) {
        return prev.filter(id => id !== recordId);
      } else {
        return [...prev, recordId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedRecords.length === paginatedData.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(paginatedData.map(r => r.id));
    }
  };

  // Close dropdowns when clicking outside (check both desktop and mobile refs)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const insideLocation = (locationDropdownRef.current && locationDropdownRef.current.contains(event.target)) ||
        (locationDropdownRefMobile.current && locationDropdownRefMobile.current.contains(event.target));
      if (!insideLocation) setIsLocationDropdownOpen(false);
      const insideStatus = (statusDropdownRef.current && statusDropdownRef.current.contains(event.target)) ||
        (statusDropdownRefMobile.current && statusDropdownRefMobile.current.contains(event.target));
      if (!insideStatus) setIsStatusDropdownOpen(false);
      if (teamTypeDropdownRef.current && !teamTypeDropdownRef.current.contains(event.target)) {
        setIsTeamTypeDropdownOpen(false);
      }
      if (teamStatusDropdownRef.current && !teamStatusDropdownRef.current.contains(event.target)) {
        setIsTeamStatusDropdownOpen(false);
      }
      if (isExportAllDropdownOpen && exportAllDropdownRef.current && !exportAllDropdownRef.current.contains(event.target)) {
        setIsExportAllDropdownOpen(false);
      }
      if (isExportSelectedDropdownOpen && exportSelectedDropdownRef.current && !exportSelectedDropdownRef.current.contains(event.target)) {
        setIsExportSelectedDropdownOpen(false);
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
  }, [isExportAllDropdownOpen, isExportSelectedDropdownOpen]);

  const ATTENDANCE_REPORT_EXPORT_COLUMNS = [
    { key: "employeeName", label: "Employee" },
    { key: "employeeId", label: "Employee ID" },
    { key: "checkIn", label: "Check-in" },
    { key: "checkOut", label: "Check-out" },
    { key: "attendanceType", label: "Type" },
    { key: "location", label: "Location" },
    { key: "status", label: "Status" },
  ];

  const FIELD_ACTIVITY_EXPORT_COLUMNS = [
    { key: "activity", label: "Activity" },
    { key: "type", label: "Type" },
    { key: "location", label: "Location" },
    { key: "responsibleEmployee", label: "Responsible Employee" },
    { key: "plannedDate", label: "Planned Date" },
    { key: "actualDate", label: "Actual Date" },
    { key: "attendees", label: "Attendees" },
  ];

  const valueToY = (value, maxValue = 80, chartHeight = 200) =>
    chartHeight - (value / maxValue) * chartHeight;
  const valueToHeightBar = (value, maxValue = 80) =>
    value === 0 ? 0 : 100 - (value / maxValue) * 100;

  const filteredData = attendanceData.filter((record) => {
    const name = (record.employeeName || "").toLowerCase();
    const id = String(record.employeeId || "");
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || id.includes(searchQuery);
    const locA = (record.location || "").trim().toLowerCase();
    const locB = (selectedLocation || "").trim().toLowerCase();
    const matchesLocation = selectedLocation === "All Locations" || !locB ||
      locA === locB ||
      (locA && locA.includes(locB)) ||
      (locB && locA.includes(locB));
    const matchesStatus = selectedStatus === "All Status" || record.status === selectedStatus;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 10;
  const actualTotalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const totalPages = Math.max(3, actualTotalPages);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Calculate max value for bar chart
  const maxBarValue = Math.max(...dailyAttendanceData.map(d => d.present + d.late + d.absent), 40);

  // Calculate pie chart segments
  const totalDistribution = attendanceDistribution.present + attendanceDistribution.late +
    attendanceDistribution.absent + attendanceDistribution.missingCheckout || 1;
  const presentAngle = (attendanceDistribution.present / totalDistribution) * 360;
  const lateAngle = (attendanceDistribution.late / totalDistribution) * 360;
  const absentAngle = (attendanceDistribution.absent / totalDistribution) * 360;
  const missingCheckoutAngle = (attendanceDistribution.missingCheckout / totalDistribution) * 360;

  // Calculate cumulative angles for pie chart
  // From the image: Present (89%) starts from left and fills most of the circle
  // Small segments (Late 6%, Absent 4%, Missing Check-out 1%) are clustered on the right side
  // We want small segments to appear from 3 o'clock (90°) to 12 o'clock (0°) going clockwise
  // But we only have 11% = 39.6 degrees total for small segments
  // So we'll place them starting from 90° going counter-clockwise to fit on the right:
  // Missing Check-out (1% = 3.6°): ends at 90, starts at 90 - 3.6 = 86.4
  // Absent (4% = 14.4°): ends at 86.4, starts at 86.4 - 14.4 = 72
  // Late (6% = 21.6°): ends at 72, starts at 72 - 21.6 = 50.4
  // Present (89% = 320.4°): starts at 50.4 - 320.4 = -270 = 90 (wraps around, but we want it to start from left)

  // Actually, let's work backwards from where we want Present to end
  // We want small segments on the right (from 90° to ~50°), so Present should end at 50.4
  // If Present is 320.4° and ends at 50.4, it starts at: 50.4 - 320.4 = -270 = 90
  // But we want Present to start from left (-180), so let's adjust:
  // If Present starts from -180 and is 320.4°, it ends at -180 + 320.4 = 140.4
  // To make it end at 50.4, we need to start from: 50.4 - 320.4 = -270 = 90
  // That doesn't work...

  // Position small segments on the right side (shifted down even more)
  // Small segments: 11% = 39.6° total
  // Missing Check-out (1% = 3.6°), Absent (4% = 14.4°), Late (6% = 21.6°)
  // Shift them down by starting from a lower angle (from ~-20° to ~20° instead of 50.4° to 90°)
  const smallSegmentsStartAngle = -20; // Shifted down even more from -10° to -20°
  const missingCheckoutStartAngle = smallSegmentsStartAngle;
  const absentStartAngle = missingCheckoutStartAngle + missingCheckoutAngle;
  const lateStartAngle = absentStartAngle + absentAngle;
  const presentStartAngle = lateStartAngle + lateAngle; // Present starts after small segments

  // Helper function to convert angle to coordinates
  const getCoordinates = (angle, radius) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: 100 + radius * Math.cos(rad),
      y: 100 + radius * Math.sin(rad)
    };
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
          userRole={effectiveRole}
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
                  className="w-[280px] h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{ fontWeight: 400 }}
                />
              </div>

              <div className="flex items-center gap-[16px] flex-shrink-0">
                <HeaderIcons />

                {/* User Profile with Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <div
                    className="flex items-center gap-[12px] cursor-pointer"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  >
                    <HeaderUserAvatar
                      alt="User"
                      className="w-[44px] h-[44px] rounded-full object-cover border-2 border-[#E5E7EB]"
                    />
                    <div>
                      <div className="flex items-center gap-[6px]">
                        <p className="text-[16px] font-semibold text-[#333333]">Hi, {currentUser?.name || currentUser?.full_name || currentUser?.firstName || "User"}!</p>
                        <img
                          src={DropdownArrow}
                          alt=""
                          className={`w-[14px] h-[14px] object-contain transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <p className="text-[12px] font-normal text-[#6B7280]">{roleDisplayNames[effectiveRole]}</p>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50"
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="px-[16px] py-[8px]">
                        <p className="text-[12px] text-[#6B7280]">{currentUser?.email || ""}</p>
                      </div>
                      <button type="button" className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsUserDropdownOpen(false); navigate("/profile"); }}>
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

                  )}
                </div>
              </div>
            </div>

            {/* Breadcrumb */}
            <div>
              <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: '#B0B0B0' }}>Reports</span>
                <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
                <span style={{ color: '#8E8C8C' }}>{pageTitle}</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            {/* Page Header */}
            <div className="mb-[20px]" style={{ minWidth: 0, maxWidth: '100%' }}>
              <div className="flex items-start justify-between" style={{ minWidth: 0, maxWidth: '100%' }}>
                <div style={{ minWidth: 0, maxWidth: '100%', flex: '1 1 auto' }}>
                  <h1
                    className="mb-[8px]"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '24px',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      color: '#000000',
                      textAlign: 'left'
                    }}
                  >
                    {pageTitle}
                  </h1>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                      color: '#6B7280'
                    }}
                  >
                    {pageSubtitle}
                  </p>
                </div>
                <div className="relative flex-shrink-0" style={{ marginTop: '48px' }} ref={exportAllDropdownRef}>
                  <button
                    onClick={() => setIsExportAllDropdownOpen(!isExportAllDropdownOpen)}
                    className="flex items-center gap-[4px]"
                    style={{
                      backgroundColor: 'transparent',
                      fontWeight: 400,
                      fontSize: '14px',
                      fontFamily: 'Inter, sans-serif',
                      color: '#505050',
                      padding: 0,
                      borderRadius: 0,
                      border: 'none',
                      cursor: 'pointer',
                      lineHeight: '100%',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <span style={{ color: '#505050', fontWeight: 400 }}>Export All</span>
                    <img src={ExportIcon} alt="Export" style={{ width: '16px', height: '16px', objectFit: 'contain', flexShrink: 0 }} />
                  </button>
                  {isExportAllDropdownOpen && (
                    <div className="absolute top-full right-0 mt-[8px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg min-w-[150px]" style={{ zIndex: 1000 }}>
                      <div className="px-[16px] py-[8px] border-b border-[#E0E0E0]">
                        <div className="flex items-center gap-[8px]">
                          <svg className="w-[12px] h-[12px] text-[#000000]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="text-[14px] text-[#000000]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                            Export As:
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (isTeamReportPage) {
                            exportToExcel(teamFilteredData, FIELD_ACTIVITY_EXPORT_COLUMNS, "team-reports.xlsx");
                          } else {
                            exportToExcel(filteredData, ATTENDANCE_REPORT_EXPORT_COLUMNS, "attendance-reports.xlsx");
                          }
                          setIsExportAllDropdownOpen(false);
                        }}
                        className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#000000] hover:bg-[#F5F7FA]"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                      >
                        xlsx
                      </button>
                      <button
                        onClick={() => {
                          if (isTeamReportPage) {
                            exportToPdf(teamFilteredData, FIELD_ACTIVITY_EXPORT_COLUMNS, "team-reports.pdf");
                          } else {
                            exportToPdf(filteredData, ATTENDANCE_REPORT_EXPORT_COLUMNS, "attendance-reports.pdf");
                          }
                          setIsExportAllDropdownOpen(false);
                        }}
                        className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#000000] hover:bg-[#F5F7FA] rounded-b-[8px]"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                      >
                        pdf
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isTeamReportPage && (() => {
              const cardColor = "#02706680";
              const cardConfig = [
                { title: "Team Members", value: teamMetricsLoading ? "—" : (teamReportMetrics?.teamMembersCount ?? 0), icon: IconTeamMembers, color: cardColor },
                { title: "Active Employees", value: teamMetricsLoading ? "—" : (teamReportMetrics?.activeEmployeesCount ?? 0), icon: IconActiveEmployees, color: cardColor },
                { title: "Completed Tasks", value: teamMetricsLoading ? "—" : (teamReportMetrics?.completedTasks ?? 0), icon: IconCompletedTasks, color: cardColor },
                { title: "Overdue Tasks", value: teamMetricsLoading ? "—" : (teamReportMetrics?.overdueTasks ?? 0), icon: IconOverdueTasks, color: cardColor },
                { title: "Attendance Commitment", value: teamMetricsLoading ? "—" : `${teamReportMetrics?.attendanceCommitmentRate ?? 0}%`, icon: IconAttendanceCommitment, color: cardColor },
              ];
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[16px] mb-[24px]">
                  {cardConfig.map((card, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-[10px] overflow-hidden border border-[#E0E0E0] shadow-sm flex flex-col"
                      style={{ minHeight: "120px" }}
                    >
                      <div className="p-[16px] flex-1 flex items-start justify-between gap-[10px]">
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-medium text-[#6B7280] mb-[8px]" style={{ fontFamily: "Inter, sans-serif" }}>{card.title}</p>
                          <p className="text-[20px] font-bold text-[#111827]" style={{ fontFamily: "Inter, sans-serif", lineHeight: "100%" }}>{card.value}</p>
                        </div>
                        <div className="w-[44px] h-[44px] min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: card.color }}>
                          <img src={card.icon} alt="" className="w-[24px] h-[24px] object-contain" />
                        </div>
                      </div>
                      <div className="h-[14px] w-full" style={{ backgroundColor: card.color }} />
                    </div>
                  ))}
                </div>
              );
            })()}

            {reportsError && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {reportsError}
              </div>
            )}

            {(reportsLoading ? (
              <div className="bg-white rounded-[10px] p-[40px] text-center" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <p className="text-[14px] text-[#6B7280]">{isTeamReportPage ? "Loading team reports..." : "Loading attendance reports..."}</p>
              </div>
            ) : (
            <>
            {isTeamReportPage ? (
            <>
            {/* Team Reports: Activity Completion Trend + Participants by Activity Type */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[32px]">
              {/* Activity Completion Trend */}
              <div className="bg-white rounded-[10px] p-[20px] flex-1" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #888888' }}>
                <h3 className="text-[16px] font-semibold mb-[20px] text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%', color: '#000000' }}>Activity Completion Trend</h3>
                <div className="relative" style={{ height: '250px' }}>
                  <div className="absolute left-0 top-0 bottom-[30px] flex flex-col justify-between" style={{ width: '30px' }}>
                    {[80, 60, 40, 20, 0].map((v) => <div key={v} className="text-right pr-[8px]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#727272' }}>{v}</div>)}
                  </div>
                  <div className="ml-[40px] relative" style={{ height: '100%', paddingBottom: '30px' }}>
                    <svg className="absolute inset-0" style={{ width: '100%', height: 'calc(100% - 30px)' }} preserveAspectRatio="none">
                      {[0, 25, 50, 75, 100].map((_, i) => <line key={i} x1="0" y1={`${i * 25}%`} x2="100%" y2={`${i * 25}%`} stroke="#E0E0E0" strokeWidth="1" />)}
                    </svg>
                    <svg className="absolute inset-0" style={{ width: '100%', height: 'calc(100% - 30px)' }} viewBox="0 0 1000 200" preserveAspectRatio="none">
                      <defs>
                        <marker id="team-arrow-implemented" markerWidth="16" markerHeight="16" refX="14" refY="8" orient="auto"><path d="M 0 0 L 16 8 L 0 16 Z" fill="#00564F" /></marker>
                        <marker id="team-arrow-planned" markerWidth="16" markerHeight="16" refX="14" refY="8" orient="auto"><path d="M 0 0 L 16 8 L 0 16 Z" fill="#9CA3AF" /></marker>
                      </defs>
                      <polyline points={teamMonthlyTrendData.map((d, i) => `${(i / 11) * 1000},${valueToY(d.implemented, 80, 200)}`).join(' ')} fill="none" stroke="#00564F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#team-arrow-implemented)" />
                      <polyline points={teamMonthlyTrendData.map((d, i) => `${(i / 11) * 1000},${valueToY(d.planned, 80, 200)}`).join(' ')} fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#team-arrow-planned)" />
                    </svg>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ height: '30px' }}>
                      {teamMonthlyTrendData.map((d) => <div key={d.month} className="text-center" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#827F7F', width: `${100/12}%` }}>{d.month}</div>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-[32px] mt-[16px]">
                  <div className="flex items-center gap-[12px]"><div className="rounded-full w-[14px] h-[14px] bg-[#00564F]" /><span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#333333' }}>Implemented</span></div>
                  <div className="flex items-center gap-[12px]"><div className="rounded-full w-[14px] h-[14px] bg-[#9CA3AF]" /><span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#333333' }}>Planned</span></div>
                </div>
              </div>
              {/* Participants by Activity Type */}
              <div className="bg-white rounded-[10px] p-[20px] flex-1" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #888888' }}>
                <h3 className="text-[16px] font-semibold mb-[20px] text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, lineHeight: '100%', color: '#000000' }}>Participants by Activity Type</h3>
                <div className="relative" style={{ height: '250px' }}>
                  <div className="absolute left-0 top-0 bottom-[30px] flex flex-col justify-between" style={{ width: '30px' }}>
                    {[80, 60, 40, 20, 0].map((v) => <div key={v} className="text-right pr-[8px]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#727272' }}>{v}</div>)}
                  </div>
                  <div className="ml-[40px] relative" style={{ height: '100%', paddingBottom: '30px' }}>
                    <svg className="absolute inset-0" style={{ width: '100%', height: 'calc(100% - 30px)' }} preserveAspectRatio="none">
                      {[0, 25, 50, 75, 100].map((_, i) => <line key={i} x1="0" y1={`${i * 25}%`} x2="100%" y2={`${i * 25}%`} stroke="#E0E0E0" strokeWidth="1" />)}
                    </svg>
                    <div className="absolute inset-0 flex items-end justify-start" style={{ height: 'calc(100% - 30px)', paddingLeft: '4px', paddingRight: '4px', gap: '4px' }}>
                      {teamMonthlyParticipantsData.map((data, mi) => (
                        <div key={mi} className="flex items-end justify-center gap-[2px]" style={{ width: `calc((100% - 44px) / 12)`, height: '100%', flexShrink: 0 }}>
                          {data.workshop > 0 && <div style={{ width: 'calc(45% - 1px)', height: `${valueToHeightBar(data.workshop, 80)}%`, backgroundColor: '#00564F', borderRadius: '2px 2px 0 0', minHeight: '2px' }} />}
                          {data.groupSession > 0 && <div style={{ width: 'calc(45% - 1px)', height: `${valueToHeightBar(data.groupSession, 80)}%`, backgroundColor: '#53A7A0', borderRadius: '2px 2px 0 0', minHeight: '2px' }} />}
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ height: '30px' }}>
                      {teamMonthlyParticipantsData.map((d) => <div key={d.month} className="text-center" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500, color: '#827F7F', width: `${100/12}%` }}>{d.month}</div>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-[32px] mt-[16px]">
                  <div className="flex items-center gap-[12px]"><div className="rounded-full w-[14px] h-[14px] bg-[#00564F]" /><span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#333333' }}>Workshop</span></div>
                  <div className="flex items-center gap-[12px]"><div className="rounded-full w-[14px] h-[14px] bg-[#53A7A0]" /><span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#333333' }}>Group Session</span></div>
                </div>
              </div>
            </div>
            {/* Filters - Team: From, To, All Type, All Status, Search by activity name */}
            <div className="flex items-center gap-[16px] mb-[24px] flex-wrap">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white focus:outline-none focus:border-[#004D40]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', minWidth: '160px' }} />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} min={fromDate} className="px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white focus:outline-none focus:border-[#004D40]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', minWidth: '160px' }} />
              <div className="relative" ref={teamTypeDropdownRef}>
                <button onClick={() => setIsTeamTypeDropdownOpen(!isTeamTypeDropdownOpen)} className="px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between min-w-[140px] hover:border-[#004D40]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#000000' }}>
                  <span>{teamSelectedTypes.length === 0 ? "All Type" : teamSelectedTypes.join(", ")}</span>
                  <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isTeamTypeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10 min-w-[180px] py-[8px]">
                    {teamActivityTypeOptions.map((type) => (
                      <label key={type} className="flex items-center gap-[10px] px-[16px] py-[10px] hover:bg-[#F5F7FA] cursor-pointer" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#000000' }}>
                        <input
                          type="checkbox"
                          checked={teamSelectedTypes.includes(type)}
                          onChange={() => {
                            setTeamSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
                            setCurrentPage(1);
                          }}
                          className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" ref={teamStatusDropdownRef}>
                <button onClick={() => setIsTeamStatusDropdownOpen(!isTeamStatusDropdownOpen)} className="px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between min-w-[140px] hover:border-[#004D40]" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#000000' }}>
                  <span>{teamSelectedStatus}</span>
                  <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isTeamStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10 min-w-[140px]">
                    {teamActivityStatusOptions.map((status) => (
                      <button key={status} onClick={() => { setTeamSelectedStatus(status); setIsTeamStatusDropdownOpen(false); setCurrentPage(1); }} className={`w-full px-[16px] py-[10px] text-left text-[14px] ${teamSelectedStatus === status ? 'bg-[#E5E7EB]' : 'hover:bg-[#F5F7FA]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>{status}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative flex-1 min-w-[200px]">
                <svg className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none"><path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <input type="text" placeholder="Search by activity name" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full h-[40px] pl-[36px] pr-[16px] rounded-[5px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]" style={{ fontWeight: 400 }} />
              </div>
            </div>
            {/* Table - Team: Activity, Type, Location, Responsible Employee, Planned Date, Actual Date, Attendees */}
            <div className="bg-white rounded-[10px] overflow-hidden mb-[24px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #B5B1B1' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>Activity</th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>Type</th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>Location</th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>Responsible Employee</th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>Planned Date</th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>Actual Date</th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>Attendees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamPaginatedData.length > 0 ? teamPaginatedData.map((row) => (
                      <tr key={row.id} className="border-b border-[#E0E0E0] hover:bg-[#F9FAFB]">
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>{row.activity || "—"}</td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>{row.type || "—"}</td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>{row.location || "—"}</td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>{row.responsibleEmployee || "—"}</td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>{row.plannedDate || "—"}</td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>{row.actualDate || "—"}</td>
                        <td className="px-[12px] py-[12px] text-center text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>{row.attendees ?? "—"}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="7" className="px-[12px] py-[40px] text-center text-[14px] text-[#6B7280]">No activity records found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {teamFilteredData.length > 0 && (
              <div className="flex items-center justify-center gap-[8px] mt-[24px]">
                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="w-[32px] h-[32px] rounded-full flex items-center justify-center bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA] disabled:opacity-50" disabled={currentPage === 1}>
                  <svg className="w-[16px] h-[16px] text-[#6B7280]" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                {Array.from({ length: teamTotalPages }, (_, i) => i + 1).slice(0, 5).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)} className="w-[32px] h-[32px] rounded-full flex items-center justify-center bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: currentPage === page ? 600 : 400, color: currentPage === page ? '#474747' : '#827F7F', fontSize: '14px' }}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage(prev => Math.min(teamTotalPages, prev + 1))} className="w-[32px] h-[32px] rounded-full flex items-center justify-center bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA] disabled:opacity-50" disabled={currentPage >= teamTotalPages}>
                  <svg className="w-[16px] h-[16px] text-[#6B7280]" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            )}
            </>
            ) : (
            <>
            {/* Attendance Reports: Daily Attendance + Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mb-[32px]">
              {/* Daily Attendance Bar Chart */}
              <div className="bg-white rounded-[10px] p-[20px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #888888' }}>
                <h3
                  className="text-[16px] font-semibold mb-[20px] text-left"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    lineHeight: '100%',
                    color: '#000000'
                  }}
                >
                  Daily Attendance
                </h3>

                <div className="relative" style={{ height: '250px' }}>
                  {/* Y-axis Labels */}
                  <div className="absolute left-0 top-0 bottom-[30px] flex flex-col justify-between" style={{ width: '30px' }}>
                    {[40, 30, 20, 10, 0].map((value) => (
                      <div
                        key={value}
                        className="text-right pr-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          fontWeight: 500,
                          lineHeight: '100%',
                          color: '#727272'
                        }}
                      >
                        {value}
                      </div>
                    ))}
                  </div>

                  {/* Chart Area */}
                  <div className="ml-[40px] relative" style={{ height: '100%', paddingBottom: '30px' }}>
                    {/* Grid Lines */}
                    <svg className="absolute inset-0" style={{ width: '100%', height: 'calc(100% - 30px)' }} preserveAspectRatio="none">
                      {[40, 30, 20, 10, 0].map((value, index) => {
                        const y = (index / 4) * 100;
                        return (
                          <line
                            key={value}
                            x1="0"
                            y1={`${y}%`}
                            x2="100%"
                            y2={`${y}%`}
                            stroke="#A0A0A0"
                            strokeWidth="1"
                          />
                        );
                      })}
                    </svg>

                    {/* Bars - Grouped Bars */}
                    <div className="absolute inset-0 flex items-end justify-start" style={{ height: 'calc(100% - 30px)', paddingLeft: '8px', paddingRight: '8px', gap: '8px' }}>
                      {dailyAttendanceData.map((data, dayIndex) => {
                        const availableWidth = 'calc(100% - 16px)'; // subtract padding
                        const gapTotal = 8 * 6; // 6 gaps between 7 items
                        const dayWidth = `calc((${availableWidth} - ${gapTotal}px) / 7)`;

                        // Function to convert value (0-40) to percentage height
                        const valueToHeight = (value) => {
                          if (value === 0) return 0;
                          return (value / 40) * 100;
                        };

                        return (
                          <div key={dayIndex} className="flex items-end justify-center gap-[2px]" style={{ width: dayWidth, height: '100%', flexShrink: 0 }}>
                            {/* Present Bar */}
                            {data.present > 0 && (
                              <div
                                style={{
                                  width: 'calc(35% - 1px)',
                                  height: `${valueToHeight(data.present)}%`,
                                  backgroundColor: '#00564F',
                                  borderRadius: '2px 2px 0 0',
                                  minHeight: data.present > 0 ? '2px' : '0'
                                }}
                              />
                            )}
                            {/* Late Bar */}
                            {data.late > 0 && (
                              <div
                                style={{
                                  width: 'calc(35% - 1px)',
                                  height: `${valueToHeight(data.late)}%`,
                                  backgroundColor: '#8CCCC6',
                                  borderRadius: '2px 2px 0 0',
                                  minHeight: data.late > 0 ? '2px' : '0'
                                }}
                              />
                            )}
                            {/* Absent Bar */}
                            {data.absent > 0 && (
                              <div
                                style={{
                                  width: 'calc(35% - 1px)',
                                  height: `${valueToHeight(data.absent)}%`,
                                  backgroundColor: '#626262',
                                  borderRadius: '2px 2px 0 0',
                                  minHeight: data.absent > 0 ? '2px' : '0'
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* X-axis Labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ height: '30px' }}>
                      {dailyAttendanceData.map((data) => (
                        <div
                          key={data.day}
                          className="text-center flex items-center justify-center"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            lineHeight: '100%',
                            color: '#827F7F',
                            width: `${100 / 7}%`
                          }}
                        >
                          {data.day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-[32px] mt-[16px]">
                  <div className="flex items-center gap-[12px]">
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{ width: '14px', height: '14px', backgroundColor: '#00564F' }}
                    ></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#333333' }}>Present</span>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{ width: '14px', height: '14px', backgroundColor: '#8CCCC6' }}
                    ></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#333333' }}>Late</span>
                  </div>
                  <div className="flex items-center gap-[12px]">
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{ width: '14px', height: '14px', backgroundColor: '#626262' }}
                    ></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 400, color: '#333333' }}>Absent</span>
                  </div>
                </div>
              </div>

              {/* Attendance Status Distribution Pie Chart */}
              <div className="bg-white rounded-[10px] p-[20px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #888888' }}>
                <h3
                  className="text-[16px] font-semibold mb-[20px] text-left"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    lineHeight: '100%',
                    color: '#000000'
                  }}
                >
                  Attendance Status Distribution
                </h3>

                <div className="flex items-center justify-center gap-[40px]" style={{ height: '250px' }}>
                  <div className="relative flex-shrink-0" style={{ width: '200px', height: '200px' }}>
                    <svg width="200" height="200" viewBox="0 0 200 200">
                      {/* Present Segment */}
                      {(() => {
                        const start = getCoordinates(presentStartAngle, 80);
                        const end = getCoordinates(presentStartAngle + presentAngle, 80);
                        return (
                          <path
                            d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${presentAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                            fill="#00564F"
                          />
                        );
                      })()}

                      {/* Late Segment */}
                      {(() => {
                        const start = getCoordinates(lateStartAngle, 80);
                        const end = getCoordinates(lateStartAngle + lateAngle, 80);
                        return (
                          <path
                            d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${lateAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                            fill="#8CCCC6"
                          />
                        );
                      })()}

                      {/* Absent Segment */}
                      {(() => {
                        const start = getCoordinates(absentStartAngle, 80);
                        const end = getCoordinates(absentStartAngle + absentAngle, 80);
                        return (
                          <path
                            d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${absentAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                            fill="#626262"
                          />
                        );
                      })()}

                      {/* Missing Check-out Segment */}
                      {(() => {
                        const start = getCoordinates(missingCheckoutStartAngle, 80);
                        const end = getCoordinates(missingCheckoutStartAngle + missingCheckoutAngle, 80);
                        return (
                          <path
                            d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${missingCheckoutAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                            fill="#670505"
                          />
                        );
                      })()}
                    </svg>
                  </div>

                  {/* Labels - Ordered according to the pie chart colors */}
                  <div className="flex flex-col justify-center gap-[12px]">
                    {/* 1. Present (89%) - Dark Teal - starts from left */}
                    <div className="flex items-center gap-[8px]">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00564F' }}></div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#00564F' }}>
                        {attendanceDistribution.present}% Present
                      </span>
                    </div>
                    {/* 2. Missing Check-out (1%) - Dark Red - top right */}
                    <div className="flex items-center gap-[8px]">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#670505' }}></div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#670505' }}>
                        {attendanceDistribution.missingCheckout}% Missing Check-out
                      </span>
                    </div>
                    {/* 3. Absent (4%) - Dark Gray - middle right */}
                    <div className="flex items-center gap-[8px]">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#626262' }}></div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#626262' }}>
                        {attendanceDistribution.absent}% Absent
                      </span>
                    </div>
                    {/* 4. Late (6%) - Light Teal - bottom right */}
                    <div className="flex items-center gap-[8px]">
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8CCCC6' }}></div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#8CCCC6' }}>
                        {attendanceDistribution.late}% Late
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-[16px] mb-[24px] flex-wrap">
              {/* From Date */}
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-[16px] py-[10px] pr-[16px] rounded-[5px] border border-[#E0E0E0] bg-white focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#000000',
                    minWidth: '160px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
              </div>

              {/* To Date */}
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate}
                  className="px-[16px] py-[10px] pr-[16px] rounded-[5px] border border-[#E0E0E0] bg-white focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: '#000000',
                    minWidth: '160px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
              </div>

              {/* Location Dropdown */}
              <div className="relative z-[100]" ref={locationDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between min-w-[160px] hover:border-[#004D40] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600, color: '#000000' }}
                >
                  <span>{selectedLocation}</span>
                  <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isLocationDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-[200] min-w-[160px]">
                    {locations.map((location) => (
                      <button
                        key={location}
                        type="button"
                        onClick={() => {
                          setSelectedLocation(location);
                          setIsLocationDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className={`w-full px-[16px] py-[10px] text-left transition-colors ${selectedLocation === location
                          ? 'bg-[#E5E7EB] text-[#333333]'
                          : 'text-[#333333] hover:bg-[#F5F7FA]'
                          } first:rounded-t-[5px] last:rounded-b-[5px]`}
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400
                        }}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative z-[100]" ref={statusDropdownRef}>
                <button
                  type="button"
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
                  <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-[200] min-w-[140px]">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        type="button"
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

              {/* Search by name or ID */}
              <div className="relative flex-1 min-w-[200px]">
                <svg className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name or ID"
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
            {selectedRecords.length > 0 && (
              <div className="mb-[20px] bg-white rounded-[10px] p-[16px] flex items-center gap-[16px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #B5B1B1' }}>
                <div className="text-[14px] text-[#333333]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                  {selectedRecords.length} selected
                </div>
                <div className="flex items-center gap-[12px]">
                  {/* Export Selected Dropdown */}
                  <div className="relative" ref={exportSelectedDropdownRef}>
                    <button
                      onClick={() => setIsExportSelectedDropdownOpen(!isExportSelectedDropdownOpen)}
                      className="px-[16px] py-[8px] rounded-[8px] border border-[#E0E0E0] bg-white flex items-center gap-[8px] hover:bg-[#F5F7FA] transition-colors"
                      style={{ fontWeight: 500, fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                    >
                      <span>Export selected</span>
                      <svg className="w-[12px] h-[12px] text-[#6B7280]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {isExportSelectedDropdownOpen && (
                      <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-20 min-w-[150px]">
                        <div className="px-[16px] py-[8px] border-b border-[#E0E0E0]">
                          <p className="text-[12px] text-[#6B7280]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>Export As:</p>
                        </div>
                        <button
                          onClick={() => {
                            const rows = filteredData.filter((r) => selectedRecords.includes(r.id));
                            exportToExcel(rows, ATTENDANCE_REPORT_EXPORT_COLUMNS, "attendance-reports-selected.xlsx");
                            setIsExportSelectedDropdownOpen(false);
                          }}
                          className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[8px] last:rounded-b-[8px]"
                          style={{ fontWeight: 400, fontFamily: 'Inter, sans-serif' }}
                        >
                          Excel (xlsx)
                        </button>
                        <button
                          onClick={() => {
                            const rows = filteredData.filter((r) => selectedRecords.includes(r.id));
                            exportToPdf(rows, ATTENDANCE_REPORT_EXPORT_COLUMNS, "attendance-reports-selected.pdf");
                            setIsExportSelectedDropdownOpen(false);
                          }}
                          className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] first:rounded-t-[8px] last:rounded-b-[8px]"
                          style={{ fontWeight: 400, fontFamily: 'Inter, sans-serif' }}
                        >
                          PDF
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mark as reviewed */}
                  <button
                    onClick={() => {
                      console.log('Mark as reviewed', selectedRecords);
                      setSelectedRecords([]);
                    }}
                    className="px-[16px] py-[8px] rounded-[8px] border border-[#E0E0E0] bg-white hover:bg-[#F5F7FA] transition-colors"
                    style={{ fontWeight: 500, fontSize: '14px', fontFamily: 'Inter, sans-serif' }}
                  >
                    Mark as reviewed
                  </button>
                </div>
              </div>
            )}

            {/* Attendance Table - horizontal scroll inside box, full content visible */}
            <div className="bg-white rounded-[10px] overflow-hidden" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #B5B1B1' }}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[#E0E0E0]">
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRecords.length === paginatedData.length && paginatedData.length > 0}
                          onChange={handleSelectAll}
                          className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                        />
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>Employee</th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>Employee ID</th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>Check-in</th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>Check-out</th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>Attendance Type</th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>Location</th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((record) => (
                        <tr key={record.id} className="border-b border-[#E0E0E0] hover:bg-[#F9FAFB]">
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <input
                              type="checkbox"
                              checked={selectedRecords.includes(record.id)}
                              onChange={() => handleCheckboxChange(record.id)}
                              className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                            />
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <div className="flex items-center justify-center gap-[12px]">
                              <AvatarOrPlaceholder
                                src={record.employeePhoto}
                                alt={record.employeeName}
                                className="w-[32px] h-[32px] rounded-full object-cover flex-shrink-0"
                              />
                              <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>{record.employeeName}</span>
                            </div>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>{record.employeeId}</span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>{formatDateTimeShort(record.checkIn)}</span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>{record.checkOut === "—" ? "—" : formatDateTimeShort(record.checkOut)}</span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>{record.attendanceType}</span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>{record.location}</span>
                          </td>
                          <td className="px-[12px] py-[12px] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span
                              className="text-[13px] inline-block px-[12px] py-[4px] rounded-[5px]"
                              style={{
                                fontWeight: 500,
                                fontSize: '13px',
                                lineHeight: '100%',
                                whiteSpace: 'nowrap',
                                color: record.status === "Present" ? '#00564F' :
                                  record.status === "Late" ? '#53A7A0' :
                                    record.status === "Missing Check-out" ? '#670505' :
                                      record.status === "In progress" ? '#4A4A4A' : '#626262',
                                backgroundColor: record.status === "Present" ? '#E9F6F8B2' :
                                  record.status === "Late" ? '#E9F6F8B2' :
                                    record.status === "Missing Check-out" ? '#FFDEDE' :
                                      record.status === "In progress" ? '#D2D2D2' : '#E5E7EB',
                                textAlign: 'center'
                              }}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-[12px] py-[40px] text-center" style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 400, color: '#6B7280' }}>
                          No attendance records found
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
            </>
            )}
            </>
            ))}
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
            <HeaderIcons iconSize="w-[18px] h-[18px]" />

            {/* User Avatar with Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <div
                className="flex items-center gap-[6px] cursor-pointer"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <HeaderUserAvatar
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
                    <p className="text-[12px] text-[#6B7280]">{currentUser?.email || ""}</p>
                  </div>
                  <button type="button" className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsUserDropdownOpen(false); navigate("/profile"); }}>
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
            userRole={effectiveRole}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isMobile={true}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </div>

        {/* Mobile Content */}
        <div className="flex-1 p-4 pb-10">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-[20px] font-semibold text-[#000000] mb-1">{pageTitle}</h1>
            <p className="text-[12px] text-[#6B7280]">{pageSubtitle}</p>
          </div>

          {isTeamReportPage && (() => {
            const mobileCardColor = "#02706680";
            const mobileCards = [
              { title: "Team Members", value: teamMetricsLoading ? "—" : (teamReportMetrics?.teamMembersCount ?? 0), icon: IconTeamMembers, color: mobileCardColor },
              { title: "Active Employees", value: teamMetricsLoading ? "—" : (teamReportMetrics?.activeEmployeesCount ?? 0), icon: IconActiveEmployees, color: mobileCardColor },
              { title: "Completed Tasks", value: teamMetricsLoading ? "—" : (teamReportMetrics?.completedTasks ?? 0), icon: IconCompletedTasks, color: mobileCardColor },
              { title: "Overdue Tasks", value: teamMetricsLoading ? "—" : (teamReportMetrics?.overdueTasks ?? 0), icon: IconOverdueTasks, color: mobileCardColor },
              { title: "Attendance Commitment", value: teamMetricsLoading ? "—" : `${teamReportMetrics?.attendanceCommitmentRate ?? 0}%`, icon: IconAttendanceCommitment, color: mobileCardColor, fullWidth: true },
            ];
            return (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {mobileCards.map((card, idx) => (
                  <div key={idx} className={`bg-white rounded-[10px] overflow-hidden border border-[#E0E0E0] shadow-sm flex flex-col ${card.fullWidth ? "col-span-2" : ""}`}>
                    <div className="p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-[#6B7280] mb-0.5">{card.title}</p>
                        <p className="text-[16px] font-bold text-[#111827]">{card.value}</p>
                      </div>
                      <div className="w-[40px] h-[40px] min-w-[40px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: card.color }}>
                        <img src={card.icon} alt="" className="w-[20px] h-[20px] object-contain" />
                      </div>
                    </div>
                    <div className="h-[10px] w-full" style={{ backgroundColor: card.color }} />
                  </div>
                ))}
              </div>
            );
          })()}

          {(reportsLoading ? (
            <div className="bg-white rounded-[10px] p-8 text-center">
              <p className="text-[14px] text-[#6B7280]">{isTeamReportPage ? "Loading team reports..." : "Loading attendance reports..."}</p>
            </div>
          ) : (
          <>
          {isTeamReportPage ? (
          <>
          {/* Team Reports Mobile: Activity Completion Trend + Participants by Activity Type */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="bg-white rounded-[12px] p-4 shadow-sm border border-[#888888]">
              <h3 className="text-[14px] font-semibold mb-4 text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#000000' }}>Activity Completion Trend</h3>
              <div className="relative" style={{ height: '180px' }}>
                <div className="ml-[30px] relative" style={{ height: '100%', paddingBottom: '28px' }}>
                  <svg className="absolute inset-0" style={{ width: '100%', height: 'calc(100% - 28px)' }} viewBox="0 0 1000 150" preserveAspectRatio="none">
                    <polyline points={teamMonthlyTrendData.map((d, i) => `${(i / 11) * 1000},${valueToY(d.implemented, 80, 150)}`).join(' ')} fill="none" stroke="#00564F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points={teamMonthlyTrendData.map((d, i) => `${(i / 11) * 1000},${valueToY(d.planned, 80, 150)}`).join(' ')} fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ height: '28px' }}>
                    {teamMonthlyTrendData.map((d) => <div key={d.month} className="text-center text-[10px] text-[#827F7F]" style={{ width: `${100/12}%` }}>{d.month}</div>)}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-[20px] mt-3">
                <div className="flex items-center gap-[8px]"><div className="rounded-full w-[10px] h-[10px] bg-[#00564F]" /><span className="text-[11px] text-[#333333]">Implemented</span></div>
                <div className="flex items-center gap-[8px]"><div className="rounded-full w-[10px] h-[10px] bg-[#9CA3AF]" /><span className="text-[11px] text-[#333333]">Planned</span></div>
              </div>
            </div>
            <div className="bg-white rounded-[12px] p-4 shadow-sm border border-[#888888]">
              <h3 className="text-[14px] font-semibold mb-4 text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#000000' }}>Participants by Activity Type</h3>
              <div className="relative" style={{ height: '160px' }}>
                <div className="ml-[30px] flex items-end justify-start gap-[2px]" style={{ height: '100%', paddingBottom: '28px' }}>
                  {teamMonthlyParticipantsData.map((data, mi) => (
                    <div key={mi} className="flex items-end justify-center gap-[1px] flex-1" style={{ height: '100%' }}>
                      {data.workshop > 0 && <div style={{ width: '45%', height: `${valueToHeightBar(data.workshop, 80)}%`, backgroundColor: '#00564F', borderRadius: '2px 2px 0 0', minHeight: '2px' }} />}
                      {data.groupSession > 0 && <div style={{ width: '45%', height: `${valueToHeightBar(data.groupSession, 80)}%`, backgroundColor: '#53A7A0', borderRadius: '2px 2px 0 0', minHeight: '2px' }} />}
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ height: '28px' }}>
                  {teamMonthlyParticipantsData.map((d) => <div key={d.month} className="text-center text-[10px] text-[#827F7F]" style={{ width: `${100/12}%` }}>{d.month}</div>)}
                </div>
              </div>
              <div className="flex items-center justify-center gap-[20px] mt-3">
                <div className="flex items-center gap-[8px]"><div className="rounded-full w-[10px] h-[10px] bg-[#00564F]" /><span className="text-[11px] text-[#333333]">Workshop</span></div>
                <div className="flex items-center gap-[8px]"><div className="rounded-full w-[10px] h-[10px] bg-[#53A7A0]" /><span className="text-[11px] text-[#333333]">Group Session</span></div>
              </div>
            </div>
          </div>
          {/* Team Filters - Mobile */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block mb-1 text-[12px] text-[#6B7280]">From</label><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-3 py-2 rounded-[5px] border border-[#E0E0E0] bg-white text-[13px]" /></div>
              <div><label className="block mb-1 text-[12px] text-[#6B7280]">To</label><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} min={fromDate} className="w-full px-3 py-2 rounded-[5px] border border-[#E0E0E0] bg-white text-[13px]" /></div>
            </div>
            <div className="relative" ref={teamTypeDropdownRef}>
              <button onClick={() => setIsTeamTypeDropdownOpen(!isTeamTypeDropdownOpen)} className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between text-[14px] font-semibold text-[#000000]"><span>{teamSelectedTypes.length === 0 ? "All Type" : teamSelectedTypes.join(", ")}</span><svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
              {isTeamTypeDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10 py-[8px]">
                  {teamActivityTypeOptions.map((type) => (
                    <label key={type} className="flex items-center gap-[10px] px-[16px] py-[10px] hover:bg-[#F5F7FA] cursor-pointer text-[14px] text-[#000000]">
                      <input type="checkbox" checked={teamSelectedTypes.includes(type)} onChange={() => { setTeamSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]); setCurrentPage(1); }} className="w-[16px] h-[16px] rounded border-[#E0E0E0]" />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="relative" ref={teamStatusDropdownRef}>
              <button onClick={() => setIsTeamStatusDropdownOpen(!isTeamStatusDropdownOpen)} className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between text-[14px] font-semibold text-[#000000]"><span>{teamSelectedStatus}</span><svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
              {isTeamStatusDropdownOpen && <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-10">{teamActivityStatusOptions.map((status) => <button key={status} onClick={() => { setTeamSelectedStatus(status); setIsTeamStatusDropdownOpen(false); setCurrentPage(1); }} className={`w-full px-[16px] py-[10px] text-left text-[14px] ${teamSelectedStatus === status ? 'bg-[#E5E7EB]' : 'hover:bg-[#F5F7FA]'}`}>{status}</button>)}</div>}
            </div>
            <div className="relative">
              <svg className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none"><path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <input type="text" placeholder="Search by activity name" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full h-[40px] pl-[36px] pr-[16px] rounded-[5px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]" />
            </div>
          </div>
          {/* Team Activity Cards - Mobile */}
          <div className="space-y-4">
            {teamPaginatedData.length > 0 ? teamPaginatedData.map((row) => (
              <div key={row.id} className="bg-white rounded-[12px] p-4 shadow-md border border-[#E0E0E0]">
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-[12px] text-[#6B7280]">Activity</span><span className="text-[13px] font-semibold text-[#000000]">{row.activity || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[12px] text-[#6B7280]">Type</span><span className="text-[13px] font-semibold text-[#000000]">{row.type || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[12px] text-[#6B7280]">Location</span><span className="text-[13px] font-semibold text-[#000000]">{row.location || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[12px] text-[#6B7280]">Responsible</span><span className="text-[13px] font-semibold text-[#000000]">{row.responsibleEmployee || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[12px] text-[#6B7280]">Planned</span><span className="text-[13px] font-semibold text-[#000000]">{row.plannedDate || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[12px] text-[#6B7280]">Actual</span><span className="text-[13px] font-semibold text-[#000000]">{row.actualDate || "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[12px] text-[#6B7280]">Attendees</span><span className="text-[13px] font-semibold text-[#000000]">{row.attendees ?? "—"}</span></div>
                </div>
              </div>
            )) : (
              <div className="bg-white rounded-[12px] p-8 text-center text-[#6B7280]">No activity records found</div>
            )}
          </div>
          {teamFilteredData.length > 0 && (
            <div className="flex items-center justify-center gap-[8px] mt-8">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] disabled:opacity-50" disabled={currentPage === 1}><svg className="w-[16px] h-[16px] text-[#000000]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18L9 12L15 6" /></svg></button>
              {Array.from({ length: teamTotalPages }, (_, i) => i + 1).slice(0, 5).map((page) => <button key={page} onClick={() => setCurrentPage(page)} className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-[14px] bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA] ${currentPage === page ? 'font-semibold' : ''}`} style={{ color: currentPage === page ? '#474747' : '#827F7F' }}>{page}</button>)}
              <button onClick={() => setCurrentPage(prev => Math.min(teamTotalPages, prev + 1))} className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] disabled:opacity-50" disabled={currentPage >= teamTotalPages}><svg className="w-[16px] h-[16px] text-[#000000]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18L15 12L9 6" /></svg></button>
            </div>
          )}
          </>
          ) : (
          <>
          {/* Attendance Reports - Mobile: Daily Attendance + Status Distribution */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Daily Attendance Chart - Mobile */}
            <div className="bg-white rounded-[12px] p-4 shadow-sm border border-[#888888]">
              <h3 className="text-[14px] font-semibold mb-4 text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#000000' }}>
                Daily Attendance
              </h3>

              <div className="relative" style={{ height: '200px' }}>
                {/* Y-axis Labels */}
                <div className="absolute left-0 top-0 bottom-[30px] flex flex-col justify-between" style={{ width: '25px' }}>
                  {[40, 30, 20, 10, 0].map((value) => (
                    <div
                      key={value}
                      className="text-right pr-[4px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: '#727272'
                      }}
                    >
                      {value}
                    </div>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="ml-[30px] relative" style={{ height: '100%', paddingBottom: '30px' }}>
                  {/* Grid Lines */}
                  <svg className="absolute inset-0" style={{ width: '100%', height: 'calc(100% - 30px)' }} preserveAspectRatio="none">
                    {[40, 30, 20, 10, 0].map((value, index) => {
                      const y = (index / 4) * 100;
                      return (
                        <line
                          key={value}
                          x1="0"
                          y1={`${y}%`}
                          x2="100%"
                          y2={`${y}%`}
                          stroke="#A0A0A0"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>

                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end justify-start" style={{ height: 'calc(100% - 30px)', paddingLeft: '4px', paddingRight: '4px', gap: '4px' }}>
                    {dailyAttendanceData.map((data, dayIndex) => {
                      const valueToHeight = (value) => {
                        if (value === 0) return 0;
                        return (value / 40) * 100;
                      };

                      return (
                        <div key={dayIndex} className="flex items-end justify-center gap-[1px]" style={{ flex: 1, height: '100%' }}>
                          {data.present > 0 && (
                            <div
                              style={{
                                width: 'calc(35% - 0.5px)',
                                height: `${valueToHeight(data.present)}%`,
                                backgroundColor: '#00564F',
                                borderRadius: '2px 2px 0 0',
                                minHeight: data.present > 0 ? '2px' : '0'
                              }}
                            />
                          )}
                          {data.late > 0 && (
                            <div
                              style={{
                                width: 'calc(35% - 0.5px)',
                                height: `${valueToHeight(data.late)}%`,
                                backgroundColor: '#8CCCC6',
                                borderRadius: '2px 2px 0 0',
                                minHeight: data.late > 0 ? '2px' : '0'
                              }}
                            />
                          )}
                          {data.absent > 0 && (
                            <div
                              style={{
                                width: 'calc(35% - 0.5px)',
                                height: `${valueToHeight(data.absent)}%`,
                                backgroundColor: '#626262',
                                borderRadius: '2px 2px 0 0',
                                minHeight: data.absent > 0 ? '2px' : '0'
                              }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* X-axis Labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ height: '30px' }}>
                    {dailyAttendanceData.map((data) => (
                      <div
                        key={data.day}
                        className="text-center flex items-center justify-center"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '11px',
                          fontWeight: 500,
                          color: '#827F7F',
                          width: `${100 / 7}%`
                        }}
                      >
                        {data.day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-[20px] mt-4 flex-wrap">
                <div className="flex items-center gap-[8px]">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00564F' }}></div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 400, color: '#333333' }}>Present</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8CCCC6' }}></div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 400, color: '#333333' }}>Late</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#626262' }}></div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', fontWeight: 400, color: '#333333' }}>Absent</span>
                </div>
              </div>
            </div>

            {/* Attendance Status Distribution - Mobile */}
            <div className="bg-white rounded-[12px] p-4 shadow-sm border border-[#888888]">
              <h3 className="text-[14px] font-semibold mb-4 text-left" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#000000' }}>
                Attendance Status Distribution
              </h3>

              <div className="flex flex-col items-center gap-4">
                <div className="relative flex-shrink-0" style={{ width: '150px', height: '150px' }}>
                  <svg width="150" height="150" viewBox="0 0 200 200">
                    {/* Present Segment */}
                    {(() => {
                      const start = getCoordinates(presentStartAngle, 80);
                      const end = getCoordinates(presentStartAngle + presentAngle, 80);
                      return (
                        <path
                          d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${presentAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                          fill="#00564F"
                        />
                      );
                    })()}

                    {/* Late Segment */}
                    {(() => {
                      const start = getCoordinates(lateStartAngle, 80);
                      const end = getCoordinates(lateStartAngle + lateAngle, 80);
                      return (
                        <path
                          d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${lateAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                          fill="#8CCCC6"
                        />
                      );
                    })()}

                    {/* Absent Segment */}
                    {(() => {
                      const start = getCoordinates(absentStartAngle, 80);
                      const end = getCoordinates(absentStartAngle + absentAngle, 80);
                      return (
                        <path
                          d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${absentAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                          fill="#626262"
                        />
                      );
                    })()}

                    {/* Missing Check-out Segment */}
                    {(() => {
                      const start = getCoordinates(missingCheckoutStartAngle, 80);
                      const end = getCoordinates(missingCheckoutStartAngle + missingCheckoutAngle, 80);
                      return (
                        <path
                          d={`M 100 100 L ${start.x} ${start.y} A 80 80 0 ${missingCheckoutAngle > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`}
                          fill="#670505"
                        />
                      );
                    })()}
                  </svg>
                </div>

                {/* Labels */}
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-[8px]">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00564F' }}></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#00564F' }}>
                      {attendanceDistribution.present}% Present
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#670505' }}></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#670505' }}>
                      {attendanceDistribution.missingCheckout}% Missing Check-out
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#626262' }}></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#626262' }}>
                      {attendanceDistribution.absent}% Absent
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8CCCC6' }}></div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 500, color: '#8CCCC6' }}>
                      {attendanceDistribution.late}% Late
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters - Mobile */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Date Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1 text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-[5px] border border-[#E0E0E0] bg-white text-[13px]"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#000000' }}
                />
              </div>
              <div>
                <label className="block mb-1 text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate}
                  className="w-full px-3 py-2 rounded-[5px] border border-[#E0E0E0] bg-white text-[13px]"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#000000' }}
                />
              </div>
            </div>

            {/* Location Dropdown */}
            <div className="relative z-[100]" ref={locationDropdownRefMobile}>
              <button
                type="button"
                onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between text-[14px] font-semibold text-[#000000]"
              >
                <span>{selectedLocation}</span>
                <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isLocationDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-[200]">
                  {locations.map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => {
                        setSelectedLocation(location);
                        setIsLocationDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className={`w-full px-[16px] py-[10px] text-left text-[14px] transition-colors ${selectedLocation === location ? 'bg-[#E5E7EB] text-[#333333]' : 'text-[#333333] hover:bg-[#F5F7FA]'
                        }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative z-[100]" ref={statusDropdownRefMobile}>
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full px-[16px] py-[10px] rounded-[5px] border border-[#E0E0E0] bg-white flex items-center justify-between text-[14px] font-semibold text-[#000000]"
              >
                <span>{selectedStatus}</span>
                <svg className="w-[14px] h-[14px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] w-full bg-white border border-[#E0E0E0] rounded-[5px] shadow-lg z-[200]">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
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
                placeholder="Search by name or ID"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full h-[40px] pl-[36px] pr-[16px] rounded-[5px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40]"
              />
            </div>
          </div>

          {/* Attendance Cards - Mobile */}
          <div className="space-y-4">
            {paginatedData.length > 0 ? (
              paginatedData.map((record) => (
                <div
                  key={record.id}
                  className="bg-white rounded-[12px] p-4 shadow-md border border-[#E0E0E0]"
                >
                  {/* Header with Employee Info */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#F0F0F0]">
                    <AvatarOrPlaceholder
                      src={record.employeePhoto}
                      alt={record.employeeName}
                      className="w-[48px] h-[48px] rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[15px] font-semibold text-[#000000] truncate">{record.employeeName}</h3>
                      <p className="text-[12px] text-[#6B7280]">ID: {record.employeeId}</p>
                    </div>
                  </div>

                  {/* Attendance Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Check-in:</span>
                      <span className="text-[13px] font-semibold text-[#000000]">{record.checkIn}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Check-out:</span>
                      <span className="text-[13px] font-semibold text-[#000000]">{record.checkOut}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Type:</span>
                      <span className="text-[13px] font-semibold text-[#000000] bg-[#F3F4F6] px-3 py-1 rounded-[6px]">{record.attendanceType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Location:</span>
                      <span className="text-[13px] font-semibold text-[#000000]">{record.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#6B7280]">Status:</span>
                      <span
                        className="inline-block px-[14px] py-[6px] rounded-[8px] text-[13px] font-bold shadow-sm"
                        style={{
                          color: record.status === "Present" ? '#00564F' :
                            record.status === "Late" ? '#53A7A0' :
                              record.status === "Missing Check-out" ? '#670505' :
                                record.status === "In progress" ? '#4A4A4A' : '#626262',
                          backgroundColor: record.status === "Present" ? '#E9F6F8B2' :
                            record.status === "Late" ? '#E9F6F8B2' :
                              record.status === "Missing Check-out" ? '#FFDEDE' :
                                record.status === "In progress" ? '#D2D2D2' : '#E5E7EB'
                        }}
                      >
                        {record.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[12px] p-8 text-center text-[#6B7280]">
                No attendance records found
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
          </>
          )}
          </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceReportPage;

