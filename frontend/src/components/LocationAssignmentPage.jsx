import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import HeaderUserAvatar from "./HeaderUserAvatar.jsx";
import HeaderIcons from "./HeaderIcons";
import { getEffectiveRole, getCurrentUser, logout } from "../services/auth.js";
import AddAssignLocationModal from "./AddAssignLocationModal";
import ViewActivitiesModal from "./ViewActivitiesModal";
import EditActivityModal from "./EditActivityModal";
import ViewEmployeesModal from "./ViewEmployeesModal";
import ViewLocationEmployeesModal from "./ViewLocationEmployeesModal";
import { getLocationAssignments, createLocationAssignment, deleteLocationAssignment } from "../services/locationAssignments";
import { getLocationActivityById, createLocationActivity, getActivityEmployees, updateLocationActivity } from "../services/locationActivities";
import { getLocations, getLocationEmployees, getLocationActivities as getActivitiesByLocationId } from "../services/locations";
import { getLocationTypes } from "../services/locationTypes";
import { getEmployees, getTeamMembers } from "../services/employees";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Action icons
const ViewIcon = new URL("../images/icons/eye.png", import.meta.url).href;
const AssignIcon = new URL("../images/icons/employee2.png", import.meta.url).href;


const LocationAssignmentPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const effectiveRole = getEffectiveRole();
  const [activeMenu, setActiveMenu] = useState("5-3");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Type");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [isBulkActionsDropdownOpen, setIsBulkActionsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [showAddAssignmentPage, setShowAddAssignmentPage] = useState(false);
  const [showViewActivitiesModal, setShowViewActivitiesModal] = useState(false);
  const [selectedLocationForView, setSelectedLocationForView] = useState(null);
  const [activitiesForView, setActivitiesForView] = useState([]);
  const [activitiesForViewLoading, setActivitiesForViewLoading] = useState(false);
  const [showEditActivityModal, setShowEditActivityModal] = useState(false);
  const [selectedActivityForEdit, setSelectedActivityForEdit] = useState(null);
  const [showViewEmployeesModal, setShowViewEmployeesModal] = useState(false);
  const [selectedActivityForViewEmployees, setSelectedActivityForViewEmployees] = useState(null);
  const [showViewLocationEmployeesModal, setShowViewLocationEmployeesModal] = useState(false);
  const [selectedLocationForEmployees, setSelectedLocationForEmployees] = useState(null);
  const [selectedLocationIdForEmployees, setSelectedLocationIdForEmployees] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [assignmentsRaw, setAssignmentsRaw] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [locationTypesList, setLocationTypesList] = useState([]);
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeesAtLocation, setEmployeesAtLocation] = useState([]);
  const [employeesAtLocationLoading, setEmployeesAtLocationLoading] = useState(false);
  const [activityEmployeesForModal, setActivityEmployeesForModal] = useState([]);
  const [activityEmployeesLoading, setActivityEmployeesLoading] = useState(false);
  const [selectedResponsibleManagerId, setSelectedResponsibleManagerId] = useState("");
  const [assignableTeamFromApi, setAssignableTeamFromApi] = useState([]);
  const [assignableTeamLoading, setAssignableTeamLoading] = useState(false);
  const typeDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);
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

  // Fetch assignments, locations, employees
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getLocationAssignments().catch(() => []),
      getLocations().catch(() => []),
      getLocationTypes().catch(() => []),
      getEmployees()
        .then((r) => {
          const d = r?.data;
          return Array.isArray(d) ? d : (d?.items ?? d?.employees ?? d?.records ?? []);
        })
        .catch(() => [])
    ])
      .then(([assignments, locations, types, employees]) => {
        if (cancelled) return;
        setAssignmentsRaw(Array.isArray(assignments) ? assignments : []);
        setLocationsList(Array.isArray(locations) ? locations : []);
        setLocationTypesList(Array.isArray(types) ? types : []);
        setEmployeesList(Array.isArray(employees) ? employees : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || err?.message || "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Build table rows: group assignments by location, merge with location info
  const locationAssignmentsData = React.useMemo(() => {
    const locs = Array.isArray(locationsList) ? locationsList : [];
    const raw = Array.isArray(assignmentsRaw) ? assignmentsRaw : [];
    const byLocation = {};
    raw.forEach((a) => {
      const locId = a.location_id ?? a.locationId ?? a.location?.id;
      const locName = a.location_name ?? a.locationName ?? a.location?.name ?? "";
      if (locId == null && !locName) return;
      const key = locId ?? locName;
      if (!byLocation[key]) {
        const loc = locs.find((l) => (l.id ?? l.location_id) === locId || (l.name ?? "") === locName);
        byLocation[key] = {
          id: locId ?? key,
          location_id: locId,
          locationName: locName || (loc?.name ?? ""),
          employeeCount: 0,
          type: (loc?.type ?? loc?.type_name ?? a.type) ?? "—",
          status: (loc?.status ?? a.status) ?? "Active"
        };
      }
      byLocation[key].employeeCount += 1;
    });
    // Include locations that have no assignments (0 employees)
    locs.forEach((loc) => {
      const id = loc.id ?? loc.location_id;
      const name = loc.name ?? loc.location_name ?? "";
      const key = id ?? name;
      if (key != null && !byLocation[key]) {
        byLocation[key] = {
          id,
          location_id: id,
          locationName: name,
          employeeCount: 0,
          type: loc.type ?? loc.type_name ?? "—",
          status: loc.status ?? "Active"
        };
      }
    });
    return Object.values(byLocation).sort((a, b) => (a.locationName || "").localeCompare(b.locationName || ""));
  }, [assignmentsRaw, locationsList]);

  const refreshAssignments = () => {
    return getLocationAssignments()
      .then((list) => setAssignmentsRaw(Array.isArray(list) ? list : []))
      .catch(() => setAssignmentsRaw([]));
  };

  // Employees for modal (id, name, role display, systemRole for filtering)
  const employeesData = React.useMemo(() => {
    return (employeesList || []).map((e) => {
      const systemRole = (e.role ?? e.role_name ?? e.user_role ?? "").toString().trim().toLowerCase();
      return {
        id: e.id ?? e.employee_id,
        name: e.name ?? e.employee_name ?? e.full_name ?? "",
        role: [e.department, e.position].filter(Boolean).join(" • ") || (e.role ?? ""),
        systemRole
      };
    });
  }, [employeesList]);

  // For "Add Assign Location": only show employees with Manager role (backend requires responsible = Manager)
  const employeesDataManagersOnly = React.useMemo(() => {
    return (employeesData || []).filter((e) => (e.systemRole ?? "") === "manager");
  }, [employeesData]);

  // Fallback: assignable from employeesList by supervisor_id (when API doesn't return team by manager_id)
  const assignableBySupervisorFilter = React.useMemo(() => {
    if (!selectedResponsibleManagerId) return [];
    const id = selectedResponsibleManagerId;
    return (employeesList || [])
      .filter((e) => {
        const sup = e.supervisor_id ?? e.manager_id ?? e.reports_to ?? e.supervisor;
        const supId = sup && typeof sup === "object" ? sup.id ?? sup.value : sup;
        return String(supId || "") === String(id);
      })
      .map((e) => ({
        id: e.id ?? e.employee_id,
        name: e.name ?? e.employee_name ?? e.full_name ?? "",
        role: [e.department, e.position].filter(Boolean).join(" • ") || (e.role ?? ""),
      }));
  }, [employeesList, selectedResponsibleManagerId]);

  // Prefer team from API (same source as Team Members page); fallback to supervisor filter
  const assignableEmployeesForModal = assignableTeamFromApi.length > 0 ? assignableTeamFromApi : assignableBySupervisorFilter;

  // Locations for dropdown (id, name)
  const locationsForDropdown = React.useMemo(() => {
    return (locationsList || []).map((l) => ({ id: l.id ?? l.location_id, name: l.name ?? l.location_name ?? "" }));
  }, [locationsList]);

  // Handle checkbox selection
  const handleCheckboxChange = (assignmentId) => {
    setSelectedAssignments(prev => {
      if (prev.includes(assignmentId)) {
        return prev.filter(id => id !== assignmentId);
      } else {
        return [...prev, assignmentId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedAssignments.length === paginatedData.length) {
      setSelectedAssignments([]);
    } else {
      setSelectedAssignments(paginatedData.map(assignment => assignment.id));
    }
  };

  const handleViewActivities = (locationName, locationId) => {
    const id = locationId ?? locationsForDropdown.find((l) => (l.name || "") === (locationName || ""))?.id;
    setSelectedLocationForView(locationName);
    setShowViewActivitiesModal(true);
    setActivitiesForView([]);
    if (id) {
      setActivitiesForViewLoading(true);
      getActivitiesByLocationId(id)
        .then((list) => {
          const arr = Array.isArray(list) ? list : [];
          if (arr.length === 0) {
            setActivitiesForView([]);
            return Promise.resolve();
          }
          return Promise.all(arr.map((a) => (a.id ? getLocationActivityById(a.id).catch(() => null) : Promise.resolve(null))))
            .then((details) => {
              const enriched = arr.map((a, i) => {
                const d = details[i];
                const listCount = Number(a.employee_count) || Number(a.employeeCount) || 0;
                const countFromDetail = d != null ? (() => {
                  const n = d.employee_count ?? d.employeeCount ?? d.employees_count ?? d.assignee_count ?? d.participant_count;
                  if (typeof n === "number" && !Number.isNaN(n)) return n;
                  if (typeof n === "string" && n !== "") { const parsed = parseInt(n, 10); if (!Number.isNaN(parsed)) return parsed; }
                  if (Array.isArray(d.employees)) return d.employees.length;
                  if (Array.isArray(d.employee_ids)) return d.employee_ids.length;
                  if (Array.isArray(d.employeeIds)) return d.employeeIds.length;
                  if (Array.isArray(d.team_members)) return d.team_members.length;
                  if (Array.isArray(d.assignments)) return d.assignments.length;
                  if (Array.isArray(d.assignees)) return d.assignees.length;
                  if (Array.isArray(d.participants)) return d.participants.length;
                  if (Array.isArray(d.participant_ids)) return d.participant_ids.length;
                  return 0;
                })() : 0;
                const count = Math.max(listCount, countFromDetail);
                const endDate = a.end_date ?? d?.end_date;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const end = endDate ? new Date(endDate) : null;
                if (end) end.setHours(0, 0, 0, 0);
                const canEdit = !end || end >= today;
                return { ...a, ...(d || {}), employee_count: count, employeeCount: count, canEdit: !!canEdit };
              });
              setActivitiesForView(enriched);
            });
        })
        .catch(() => setActivitiesForView([]))
        .finally(() => setActivitiesForViewLoading(false));
    }
  };

  const handleEditActivity = (activity) => {
    setShowViewActivitiesModal(false);
    const activityWithLocation = { ...activity, locationName: activity.locationName ?? activity.location_name ?? selectedLocationForView };
    setSelectedActivityForEdit(activityWithLocation);
    setShowEditActivityModal(true);
    if (activity?.id) {
      getActivityEmployees(activity.id)
        .then((list) => {
          const ids = (Array.isArray(list) ? list : []).map((e) => e.id ?? e.employee_id).filter(Boolean);
          setSelectedActivityForEdit((prev) => (prev ? { ...prev, employee_ids: ids } : prev));
        })
        .catch(() => {});
    }
  };

  const handleSaveActivity = async (payload) => {
    if (!selectedActivityForEdit?.id) return;
    await updateLocationActivity(selectedActivityForEdit.id, payload);
    setShowEditActivityModal(false);
    setSelectedActivityForEdit(null);
  };

  const handleViewEmployees = (activity) => {
    setShowViewActivitiesModal(false);
    setSelectedActivityForViewEmployees(activity);
    setShowViewEmployeesModal(true);
    setActivityEmployeesForModal([]);
    if (activity?.id) {
      setActivityEmployeesLoading(true);
      getActivityEmployees(activity.id)
        .then((list) => {
          const arr = Array.isArray(list) ? list : [];
          setActivityEmployeesForModal(
            arr.map((e) => ({
              id: e?.id ?? e?.employee_id ?? e,
              name: e?.full_name ?? e?.employee_name ?? e?.name ?? ([e?.first_name, e?.last_name].filter(Boolean).join(" ") || "—"),
              department: e?.department ?? e?.department_name ?? "",
              position: e?.position ?? e?.position_title ?? e?.role ?? "",
              avatar_url: e?.avatar_url ?? e?.profile_image ?? null
            }))
          );
        })
        .catch(() => setActivityEmployeesForModal([]))
        .finally(() => setActivityEmployeesLoading(false));
    }
  };

  const handleViewLocationEmployees = (locationName, locationId) => {
    const id = locationId ?? locationsForDropdown.find((l) => (l.name || "") === (locationName || ""))?.id;
    setSelectedLocationForEmployees(locationName);
    setSelectedLocationIdForEmployees(id);
    setShowViewLocationEmployeesModal(true);
    if (id) {
      setEmployeesAtLocationLoading(true);
      getLocationEmployees(id)
        .then((list) => setEmployeesAtLocation(Array.isArray(list) ? list : []))
        .catch(() => setEmployeesAtLocation([]))
        .finally(() => setEmployeesAtLocationLoading(false));
    } else {
      setEmployeesAtLocation([]);
    }
  };

  const handleRemoveEmployeeFromLocation = (employeeId) => {
    const locationId = selectedLocationIdForEmployees;
    if (!employeeId || !locationId) return;
    // Optimistic update: remove from list immediately so UI updates
    setEmployeesAtLocation((prev) =>
      prev.filter((e) => (e.employee_id ?? e.id) !== employeeId)
    );
    deleteLocationAssignment(employeeId, locationId)
      .then(() => getLocationEmployees(locationId))
      .then((list) => setEmployeesAtLocation(Array.isArray(list) ? list : []))
      .then(() => refreshAssignments())
      .catch(() => {
        // On error, refetch to restore correct list
        getLocationEmployees(locationId)
          .then((list) => setEmployeesAtLocation(Array.isArray(list) ? list : []));
        refreshAssignments();
      });
  };

  const handleAddAssignmentSave = (locationId, employeeIds, extra = {}) => {
    if (!locationId || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return Promise.reject(new Error("Please select a location and at least one employee."));
    }
    const assignmentsPromise = Promise.all(
      employeeIds.map((empId) => createLocationAssignment({ employee_id: String(empId), location_id: String(locationId) }))
    );
    const activityName = extra.activityName?.trim();
    const dates = Array.isArray(extra.activityDates) ? extra.activityDates.filter(Boolean) : [];
    const hasActivity = activityName && dates.length > 0;
    const activityPromise = hasActivity
      ? createLocationActivity({
        name: activityName,
        activity_type: extra.activityType || "Workshop",
        location_id: String(locationId),
        employee_ids: employeeIds.map(String),
        activity_days: extra.numberOfDays || dates.length,
        dates,
        responsible_employee_id: extra.responsibleEmployeeId || null,
        description: [extra.projectName?.trim(), ...(extra.activityImageUrls || [])].filter(Boolean).join("\n"),
      })
      : Promise.resolve();

    return Promise.all([assignmentsPromise, activityPromise])
      .then(() => refreshAssignments())
      .then(() => {
        setCurrentPage(1);
        setShowAddAssignmentPage(false);
        setError(null);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.message || "Failed to assign";
        setError(msg);
        refreshAssignments().then(() => setCurrentPage(1));
        throw err;
      });
  };


  // Type options from API
  const typeOptions = ["All Type", ...locationTypesList.map((t) => (t.name ?? t.type ?? t.title)).filter(Boolean)];

  // Status options
  const statusOptions = ["All Status", "Active", "Inactive"];

  // Location options for filter
  const locationOptions = ["All Locations", ...locationsForDropdown.map((l) => l.name).filter(Boolean)];

  // Filter data
  const filteredData = locationAssignmentsData.filter(assignment => {
    const matchesSearch = assignment.locationName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All Type" || assignment.type === selectedType;
    const statusA = (assignment.status || "").toString().trim().toLowerCase();
    const statusB = (selectedStatus || "").toString().trim().toLowerCase();
    const matchesStatus = selectedStatus === "All Status" || statusA === statusB;
    const matchesLocation = selectedLocation === "All Locations" || assignment.locationName === selectedLocation;
    return matchesSearch && matchesType && matchesStatus && matchesLocation;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.max(3, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Reset selected responsible manager and team list when Add Assign modal opens
  useEffect(() => {
    if (showAddAssignmentPage) {
      setSelectedResponsibleManagerId("");
      setAssignableTeamFromApi([]);
    }
  }, [showAddAssignmentPage]);

  // Fetch team members for selected manager: try team/members?manager_id= then fallback to employees?supervisor_id=
  const mapToAssignable = (list) =>
    (Array.isArray(list) ? list : []).map((e) => ({
      id: e.id ?? e.employee_id,
      name: e.name ?? e.employee_name ?? e.full_name ?? "",
      role: [e.department, e.position].filter(Boolean).join(" • ") || (e.role ?? e.role_name ?? ""),
    }));

  useEffect(() => {
    if (!selectedResponsibleManagerId) {
      setAssignableTeamFromApi([]);
      return;
    }
    let cancelled = false;
    setAssignableTeamLoading(true);
    setAssignableTeamFromApi([]);
    const id = selectedResponsibleManagerId;
    const applyFallback = () =>
      getEmployees({ supervisor_id: id })
        .then((r) => {
          if (cancelled) return;
          const raw = r?.data;
          const data = Array.isArray(raw) ? raw : raw?.items ?? raw?.employees ?? raw?.records ?? [];
          setAssignableTeamFromApi(mapToAssignable(data));
        })
        .catch(() => { if (!cancelled) setAssignableTeamFromApi([]); });

    getTeamMembers({ manager_id: id })
      .then((list) => {
        if (cancelled) return;
        const arr = mapToAssignable(list);
        if (arr.length > 0) setAssignableTeamFromApi(arr);
        else return applyFallback();
      })
      .catch(() => applyFallback())
      .finally(() => { if (!cancelled) setAssignableTeamLoading(false); });
    return () => { cancelled = true; };
  }, [selectedResponsibleManagerId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isLogoutButton = event.target.closest("button")?.textContent?.trim() === "Log Out";
      if (isLogoutButton) return;
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
        setIsLocationDropdownOpen(false);
      }
      if (bulkActionsDropdownRef.current && !bulkActionsDropdownRef.current.contains(event.target)) {
        setIsBulkActionsDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
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
          userRole={effectiveRole}
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
                <HeaderIcons />
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
                    <div className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50" style={{ overflow: 'hidden' }}>
                      <div className="px-[16px] py-[8px]">
                        <p className="text-[12px] text-[#6B7280]">{currentUser?.email || ""}</p>
                      </div>
                      <button type="button" className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsUserDropdownOpen(false); navigate("/profile"); }}>
                        Edit Profile
                      </button>
                      <div className="h-[1px] bg-[#DC2626] my-[4px]"></div>
                      <button
                        type="button"
                        onMouseDown={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          await logout();
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
                <span style={{ color: '#B0B0B0' }}>Locations Management</span>
                <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
                <span style={{ color: '#8E8C8C' }}>Location Assignment</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            {/* Page Header */}
            <div className="mb-[20px]">
              <h1 className="text-[28px] font-semibold text-[#000000] mb-[8px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Location Assignment
              </h1>
              <p className="text-[14px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                Manage locations, activities, and employee assignments.
              </p>
            </div>

            {/* Assign Location Button */}
            <div className="mb-[20px] flex justify-end">
              <button
                onClick={() => setShowAddAssignmentPage(true)}
                className="px-[20px] py-[12px] text-white rounded-[5px] hover:opacity-90 transition-opacity flex items-center justify-center gap-[8px] border border-[#B5B1B1]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', backgroundColor: '#0C8DFE', height: '46px', width: '205px' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Assign Location
              </button>
            </div>

            {/* Filter and Action Bar */}
            <div className="mb-[20px] flex items-center justify-start gap-[8px] flex-wrap">
              {/* Type Dropdown */}
              <div className="relative flex-shrink-0" ref={typeDropdownRef}>
                <button
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between"
                  style={{ minWidth: '180px' }}
                >
                  <span
                    className="text-[14px] text-[#000000]"
                    style={{ fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                  >
                    {selectedType}
                  </span>
                  <svg
                    className={`w-[16px] h-[16px] text-[#6B7280] transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isTypeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[8px] bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg min-w-[180px] z-50">
                    {typeOptions.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedType(type);
                          setIsTypeDropdownOpen(false);
                        }}
                        className={`w-full px-[16px] py-[12px] text-left text-[14px] transition-colors ${selectedType === type
                          ? 'bg-[#E5E7EB] text-[#333333]'
                          : 'text-[#333333] hover:bg-[#F5F7FA]'
                          } first:rounded-t-[10px] last:rounded-b-[10px]`}
                        style={{ fontWeight: 400 }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative flex-shrink-0" ref={statusDropdownRef}>
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between"
                  style={{ minWidth: '180px' }}
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
                  <div className="absolute top-full left-0 mt-[8px] bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg min-w-[180px] z-50">
                    {statusOptions.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
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

              {/* Location Dropdown */}
              <div className="relative flex-shrink-0" ref={locationDropdownRef}>
                <button
                  onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
                  className="h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between"
                  style={{ minWidth: '180px' }}
                >
                  <span
                    className="text-[14px] text-[#000000]"
                    style={{ fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
                  >
                    {selectedLocation}
                  </span>
                  <svg
                    className={`w-[16px] h-[16px] text-[#6B7280] transition-transform ${isLocationDropdownOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isLocationDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[8px] bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg min-w-[180px] z-50">
                    {locationOptions.map((location) => (
                      <button
                        key={location}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedLocation(location);
                          setIsLocationDropdownOpen(false);
                        }}
                        className={`w-full px-[16px] py-[12px] text-left text-[14px] transition-colors ${selectedLocation === location
                          ? 'bg-[#E5E7EB] text-[#333333]'
                          : 'text-[#333333] hover:bg-[#F5F7FA]'
                          } first:rounded-t-[10px] last:rounded-b-[10px]`}
                        style={{ fontWeight: 400 }}
                      >
                        {location}
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
                  placeholder="Search by location name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{ fontWeight: 400 }}
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedAssignments.length > 0 && (
              <div className="mb-[20px] bg-white rounded-[10px] p-[16px] flex items-center gap-[16px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div className="text-[14px] text-[#333333]" style={{ fontWeight: 500 }}>
                  {selectedAssignments.length} selected
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
                          setShowDeleteConfirmModal(true);
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
                          console.log('Mark as reviewed', selectedAssignments);
                          setSelectedAssignments([]);
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

            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-[10px] overflow-hidden" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
              {loading ? (
                <div className="p-12 text-center text-[#6B7280]">Loading assignments...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E0E0E0]">
                        <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                          <input
                            type="checkbox"
                            checked={selectedAssignments.length === paginatedData.length && paginatedData.length > 0}
                            onChange={handleSelectAll}
                            className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                          />
                        </th>
                        <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                          Location name
                        </th>
                        <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                          Employee count
                        </th>
                        <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                          Type
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
                      {paginatedData.map((assignment) => (
                        <tr key={assignment.id} className="border-b border-[#E0E0E0] hover:bg-[#F9FAFB]">
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <input
                              type="checkbox"
                              checked={selectedAssignments.includes(assignment.id)}
                              onChange={() => handleCheckboxChange(assignment.id)}
                              className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                            />
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                              {assignment.locationName}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                              {assignment.employeeCount}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                              {assignment.type}
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
                                color: (assignment.status || '').toLowerCase() === 'active' ? '#00564F' : '#4A4A4A',
                                backgroundColor: (assignment.status || '').toLowerCase() === 'active' ? '#68BFCCB2' : '#D2D2D2',
                                textAlign: 'center'
                              }}
                            >
                              {assignment.status}
                            </span>
                          </td>
                          <td className="px-[12px] py-[12px] text-center" style={{ whiteSpace: 'nowrap' }}>
                            <div className="flex items-center justify-center gap-[8px]">
                              <button
                                onClick={() => handleViewActivities(assignment.locationName, assignment.location_id)}
                                className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity"
                                title="View"
                              >
                                <img src={ViewIcon} alt="View" className="w-full h-full object-contain" />
                              </button>
                              <div className="w-[1px] h-[22px] bg-[#E0E0E0]"></div>
                              <button
                                onClick={() => handleViewLocationEmployees(assignment.locationName, assignment.location_id)}
                                className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity"
                                title="View Employees"
                              >
                                <img src={AssignIcon} alt="View Employees" className="w-full h-full object-contain" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
            <HeaderIcons iconSize="w-[18px] h-[18px]" />

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
                <div className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50" style={{ overflow: 'hidden' }}>
                  <div className="px-[16px] py-[8px]">
                    <p className="text-[12px] text-[#6B7280]">{currentUser?.email || ""}</p>
                  </div>
                  <button type="button" className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsUserDropdownOpen(false); navigate("/profile"); }}>
                    Edit Profile
                  </button>
                  <div className="h-[1px] bg-[#DC2626] my-[4px]"></div>
                  <button
                    type="button"
                    onMouseDown={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      await logout();
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

        {/* Mobile Content */}
        <div className="flex-1 p-4 pb-10">
          {/* Title and Add Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[20px] font-semibold text-[#000000] mb-0">Location Assignment</h1>
              <p className="text-[12px] text-[#6B7280]">Manage location assignments</p>
            </div>
            <button
              onClick={() => setShowAddAssignmentPage(true)}
              className="w-[36px] h-[36px] bg-[#0C8DFE] text-white rounded-[8px] flex items-center justify-center shadow-sm hover:bg-[#0076E4] active:scale-95 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Mobile Filters */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[44px] pl-[44px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] outline-none focus:border-[#004D40]"
              />
            </div>

            {/* Type Dropdown */}
            <div className="relative" ref={typeDropdownRef}>
              <button
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className="w-full h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between"
              >
                <span className="text-[14px] font-medium text-[#333333]">{selectedType}</span>
                <svg className={`w-[16px] h-[16px] text-[#6B7280] transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9L12 15L18 9" /></svg>
              </button>
              {isTypeDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-20">
                  {typeOptions.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedType(type); setIsTypeDropdownOpen(false); }}
                      className={`w-full px-[16px] py-[12px] text-left text-[14px] ${selectedType === type ? 'bg-[#F3F4F6] font-semibold' : 'hover:bg-[#F9FAFB]'}`}
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
                className="w-full h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between"
              >
                <span className="text-[14px] font-medium text-[#333333]">{selectedStatus}</span>
                <svg className={`w-[16px] h-[16px] text-[#6B7280] transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9L12 15L18 9" /></svg>
              </button>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg z-20">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedStatus(status); setIsStatusDropdownOpen(false); }}
                      className={`w-full px-[16px] py-[12px] text-left text-[14px] ${selectedStatus === status ? 'bg-[#F3F4F6] font-semibold' : 'hover:bg-[#F9FAFB]'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Card List */}
          <div className="space-y-4">
            {paginatedData.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-[12px] p-4 shadow-sm border border-[#E0E0E0]"
              >
                {/* Header with Actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[40px] bg-[#00897B] rounded-[8px] flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#333333] mb-0.5">{assignment.locationName}</h3>
                      <p className="text-[12px] text-[#6B7280] font-medium">{assignment.employeeCount} Employees</p>
                    </div>
                  </div>
                </div>

                {/* Info Row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#6B7280]">Type:</span>
                    <span className="text-[12px] font-semibold text-[#333333]">{assignment.type}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                  <span
                    className="inline-block px-[12px] py-[4px] rounded-[6px] text-[12px] font-medium"
                    style={{
                      color: (assignment.status || '').toLowerCase() === 'active' ? '#00564F' : '#4A4A4A',
                      backgroundColor: (assignment.status || '').toLowerCase() === 'active' ? '#68BFCCB2' : '#D2D2D2',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {assignment.status}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-3 border-t border-[#F3F4F6]">
                  <button
                    onClick={() => handleViewActivities(assignment.locationName, assignment.location_id)}
                    className="w-full h-[38px] rounded-[8px] bg-[#00897B] text-white text-[13px] font-medium hover:bg-[#00796B] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    View Activities
                  </button>
                  <button
                    onClick={() => handleViewLocationEmployees(assignment.locationName, assignment.location_id)}
                    className="w-full h-[38px] rounded-[8px] bg-[#0C8DFE] text-white text-[13px] font-medium hover:bg-[#0076E4] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    View Employees
                  </button>
                </div>
              </div>
            ))}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-[14px] transition-colors bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA] ${currentPage === page ? 'font-semibold' : 'text-[#6B7280]'}`}
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: currentPage === page ? '#474747' : '#827F7F'
                  }}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
                disabled={currentPage === totalPages}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                <svg className="w-[16px] h-[16px] text-[#000000]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18L15 12L9 6" /></svg>
              </button>
            </div>
          )}
        </div>

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
      </div>


      <AddAssignLocationModal
        isOpen={showAddAssignmentPage}
        onClose={() => setShowAddAssignmentPage(false)}
        employees={employeesDataManagersOnly}
        assignableEmployees={assignableEmployeesForModal}
        assignableLoading={assignableTeamLoading}
        onResponsibleChange={(id) => setSelectedResponsibleManagerId(id || "")}
        locations={locationsForDropdown}
        onSave={handleAddAssignmentSave}
      />

      <ViewActivitiesModal
        isOpen={showViewActivitiesModal}
        onClose={() => setShowViewActivitiesModal(false)}
        locationName={selectedLocationForView}
        activities={activitiesForView}
        activitiesLoading={activitiesForViewLoading}
        onEditActivity={handleEditActivity}
        onViewEmployees={handleViewEmployees}
      />

      <EditActivityModal
        isOpen={showEditActivityModal}
        onClose={() => {
          setShowEditActivityModal(false);
          setSelectedActivityForEdit(null);
        }}
        activity={selectedActivityForEdit}
        locations={locationsList}
        employees={employeesData}
        onSave={handleSaveActivity}
      />

      <ViewEmployeesModal
        isOpen={showViewEmployeesModal}
        onClose={() => setShowViewEmployeesModal(false)}
        activityName={selectedActivityForViewEmployees?.name ?? selectedActivityForViewEmployees?.activity_name}
        employees={activityEmployeesForModal}
        employeesLoading={activityEmployeesLoading}
      />

      <ViewLocationEmployeesModal
        isOpen={showViewLocationEmployeesModal}
        onClose={() => setShowViewLocationEmployeesModal(false)}
        locationName={selectedLocationForEmployees}
        locationId={selectedLocationIdForEmployees}
        employees={employeesAtLocation}
        employeesLoading={employeesAtLocationLoading}
        onRemove={handleRemoveEmployeeFromLocation}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDeleteConfirmModal(false)}
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
                Are you sure you want to delete {selectedAssignments.length} selected location{selectedAssignments.length > 1 ? 's' : ''}?
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
                  console.log('Deleting selected assignments:', selectedAssignments);
                  setSelectedAssignments([]);
                  setShowDeleteConfirmModal(false);
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
                onClick={() => setShowDeleteConfirmModal(false)}
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
    </div >
  );
};

export default LocationAssignmentPage;

