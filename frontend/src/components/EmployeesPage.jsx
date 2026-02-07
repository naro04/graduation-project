import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import LogoutModal from "./LogoutModal";
import { logout, getCurrentUser, getEffectiveRole } from "../services/auth.js";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, bulkActionEmployees } from "../services/employees.js";
import { uploadImage } from "../services/uploads.js";
import { getDepartments } from "../services/departments.js";
import { getPositions } from "../services/positions.js";
import { getRoles } from "../services/rbac.js";

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").replace(/\/api\/v1\/?$/, "");

function toAbsoluteAvatarUrl(avatarUrl) {
  if (!avatarUrl || typeof avatarUrl !== "string") return null;
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) return avatarUrl;
  const path = avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`;
  return `${API_ORIGIN}${path}`;
}

// Logo images
const LogoMobile = new URL("../images/LogoMobile.jpg", import.meta.url).href;
const LogoDesktop = new URL("../images/LogoDesktop.png", import.meta.url).href;

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Icons
const EditIcon = new URL("../images/icons/edit.png", import.meta.url).href;
const EditIcon6 = new URL("../images/icons/edit6.png", import.meta.url).href;
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;
const WarningIcon = new URL("../images/icons/warnning.png", import.meta.url).href;
const EmployeeIcon = new URL("../images/icons/employee.png", import.meta.url).href;
const CameraIcon = new URL("../images/icons/camera.png", import.meta.url).href;
const DefaultProfileImage = new URL("../images/icons/ece298d0ec2c16f10310d45724b276a6035cb503.png", import.meta.url).href;

// Employee Photos
const MohamedAliPhoto = new URL("../images/Mohamed Ali.jpg", import.meta.url).href;
const AmalAhmedPhoto = new URL("../images/Amal Ahmed.png", import.meta.url).href;
const AmjadSaeedPhoto = new URL("../images/Amjad Saeed.jpg", import.meta.url).href;
const JanaHassanPhoto = new URL("../images/Jana Hassan.jpg", import.meta.url).href;

const EmployeesPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const effectiveRole = getEffectiveRole(userRole);
  const [activeMenu, setActiveMenu] = useState(2);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All Departments");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddEmployeePage, setShowAddEmployeePage] = useState(false);
  const [showEditEmployeePage, setShowEditEmployeePage] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isBulkActionsDropdownOpen, setIsBulkActionsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const departmentDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const bulkActionsDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [employeesData, setEmployeesData] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [employeesError, setEmployeesError] = useState(null);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [positionsList, setPositionsList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);
  const [saveEmployeeError, setSaveEmployeeError] = useState(null);
  const [saveEmployeeSuccess, setSaveEmployeeSuccess] = useState(false);

  // Form state for Add/Edit Employee
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    department: "",
    position: "",
    role: "",
    status: "Active"
  });

  // Mapping of departments to positions
  const departmentPositions = {
    "HR": ["HR Manager"],
    "Field Operations": ["Activity Facilitator", "Trainer", "Social Worker"],
    "Office": ["Administrative Assistant", "Data Entry", "Office Coordinator"],
    "Project Management": ["Project Manager", "Team Leader", "Field Supervisor"],
    "Finance": ["Finance Manager", "Accountant", "Financial Analyst"],
    "IT": ["System Administration"]
  };

  // Get available positions based on selected department
  const getAvailablePositions = () => {
    if (!formData.department || formData.department === "" || formData.department === "Select Department") {
      return [];
    }
    return departmentPositions[formData.department] || [];
  };

  // Handle department change
  const handleDepartmentChange = (e) => {
    const selectedDept = e.target.value;
    setFormData({
      ...formData,
      department: selectedDept,
      position: "" // Reset position when department changes
    });
  };

  // Reset form and profile photo when opening Add Employee page
  useEffect(() => {
    if (showAddEmployeePage) {
      setFormData({
        firstName: "",
        lastName: "",
        department: "",
        position: "",
        role: "",
        status: "Active"
      });
      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
    }
  }, [showAddEmployeePage]);

  // Reset profile photo when opening Edit modal
  useEffect(() => {
    if (showEditEmployeePage && editingEmployee) {
      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
      setProfilePhotoFile(null);
      setProfilePhotoPreview(null);
    }
  }, [showEditEmployeePage, editingEmployee?.id]);

  const handleProfilePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSaveEmployeeError("Please choose an image file (e.g. JPG, PNG).");
      return;
    }
    if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
    setProfilePhotoFile(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
    setSaveEmployeeError(null);
    e.target.value = "";
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDepartmentDropdownOpen && departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setIsDepartmentDropdownOpen(false);
      }
      if (isRoleDropdownOpen && roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setIsRoleDropdownOpen(false);
      }
      if (isStatusDropdownOpen && statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
      if (isBulkActionsDropdownOpen && bulkActionsDropdownRef.current && !bulkActionsDropdownRef.current.contains(event.target)) {
        setIsBulkActionsDropdownOpen(false);
      }
      if (isUserDropdownOpen && userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDepartmentDropdownOpen, isRoleDropdownOpen, isStatusDropdownOpen, isBulkActionsDropdownOpen, isUserDropdownOpen]);

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR Admin",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Fetch employees from API on component mount
  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      setEmployeesError(null);
      const response = await getEmployees();
      
      if (response && response.data) {
        // Transform API data to component format
        const transformedEmployees = response.data.map(emp => ({
          id: emp.id,
          name: emp.full_name || `${emp.first_name} ${emp.last_name}`,
          employeeId: emp.employee_code || "",
          email: emp.email || "",
          role: emp.role_name || "",
          position: emp.position_title || "",
          department: emp.department_name || "",
          status: emp.status === "active" ? "Active" : (emp.status === "under_review" ? "Under Review" : "Inactive"),
          phone: emp.phone || "",
          joinDate: emp.hired_at || "",
          photo: toAbsoluteAvatarUrl(emp.avatar_url) || EmployeeIcon,
          originalData: emp
        }));
        
        setEmployeesData(transformedEmployees);
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
      setEmployeesError(err.message || 'Failed to load employees');
      // Fallback to empty array if API fails
      setEmployeesData([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    Promise.all([getDepartments(), getPositions(), getRoles()])
      .then(([depts, positions, roles]) => {
        setDepartmentsList(Array.isArray(depts) ? depts : []);
        setPositionsList(Array.isArray(positions) ? positions : []);
        setRolesList(Array.isArray(roles) ? roles : []);
      })
      .catch((err) => console.error("Failed to load departments/positions/roles:", err));
  }, []);

  // Handle form submission for adding/editing employee
  const handleAddEmployeeSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName) {
      setSaveEmployeeError('First name and last name are required');
      return;
    }

    const isEditing = showEditEmployeePage && editingEmployee?.id;

    try {
      setIsSavingEmployee(true);
      setSaveEmployeeError(null);
      setSaveEmployeeSuccess(false);

      // Resolve department_id, position_id, role_id from API lists (أو من الموظفين إذا القوائم فاضية)
      let departmentId = null;
      let positionId = null;
      let roleId = null;
      const deptName = formData.department && formData.department !== "" && formData.department !== "Select Department" ? formData.department : null;
      const posTitle = formData.position && formData.position !== "" && formData.position !== "Select Position" ? formData.position : null;
      const roleName = formData.role && formData.role !== "" && formData.role !== "Select Role" ? formData.role : null;

      if (deptName) {
        const found = departmentsList.find(d => (d.name || "").trim() === deptName.trim());
        if (found?.id) departmentId = found.id;
        else {
          const foundEmployee = employeesData.find(emp => (emp.department || "").trim() === deptName.trim());
          if (foundEmployee?.originalData?.department_id) departmentId = foundEmployee.originalData.department_id;
        }
      }
      if (posTitle) {
        const found = positionsList.find(p => (p.title || p.name || "").trim() === posTitle.trim());
        if (found?.id) positionId = found.id;
        else {
          const foundEmployee = employeesData.find(emp => (emp.position || "").trim() === posTitle.trim());
          if (foundEmployee?.originalData?.position_id) positionId = foundEmployee.originalData.position_id;
        }
      }
      if (roleName) {
        const found = rolesList.find(r => (r.name || "").trim() === roleName.trim());
        if (found?.id) roleId = found.id;
        else {
          const foundEmployee = employeesData.find(emp => (emp.role || "").trim() === roleName.trim());
          if (foundEmployee?.originalData?.role_id) roleId = foundEmployee.originalData.role_id;
        }
      }

      let avatarUrl = null;
      if (profilePhotoFile) {
        const uploaded = await uploadImage(profilePhotoFile);
        avatarUrl = typeof uploaded === "string" ? uploaded : (Array.isArray(uploaded) ? uploaded[0] : uploaded?.url ?? uploaded?.image_url ?? null);
      } else if (isEditing) {
        // عند التعديل بدون تغيير الصورة: نرسل الـ avatar_url الحالية عشان الباكند ما يمسحها
        avatarUrl = editingEmployee?.originalData?.avatar_url ?? editingEmployee?.originalData?.avatarUrl;
        if ((avatarUrl == null || avatarUrl === "") && editingEmployee?.photo && typeof editingEmployee.photo === "string" && editingEmployee.photo.startsWith("http")) {
          try {
            avatarUrl = new URL(editingEmployee.photo).pathname;
          } catch {
            avatarUrl = null;
          }
        }
      }

      const employeeData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        status: formData.status.toLowerCase(),
        ...(departmentId && { department_id: departmentId }),
        ...(positionId && { position_id: positionId }),
        ...(roleId && { role_id: roleId }),
        ...(avatarUrl != null && avatarUrl !== "" && { avatar_url: avatarUrl })
      };

      const response = isEditing
        ? await updateEmployee(editingEmployee.id, employeeData)
        : await createEmployee(employeeData);

      if (response != null) {
        setSaveEmployeeSuccess(true);
        if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
        setProfilePhotoFile(null);
        setProfilePhotoPreview(null);
        setFormData({
          firstName: "",
          lastName: "",
          department: "",
          position: "",
          role: "",
          status: "Active"
        });

        setTimeout(async () => {
          if (isEditing) {
            setShowEditEmployeePage(false);
            setEditingEmployee(null);
          } else {
            setShowAddEmployeePage(false);
          }
          setSaveEmployeeSuccess(false);
          await fetchEmployees();
        }, 1500);
      }
    } catch (err) {
      console.error(isEditing ? 'Failed to update employee:' : 'Failed to create employee:', err);
      setSaveEmployeeError(err.response?.data?.message ?? err.message ?? (isEditing ? 'Failed to update employee. Please try again.' : 'Failed to create employee. Please try again.'));
    } finally {
      setIsSavingEmployee(false);
    }
  };

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    return employeesData.filter(employee => {
      const matchesSearch = !searchQuery ||
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (employee.employeeId && employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDepartment = selectedDepartment === "All Departments" || employee.department === selectedDepartment;
      const matchesRole = selectedRole === "All Roles" || employee.role === selectedRole;
      const matchesStatus = selectedStatus === "All Status" || (employee.status || "").trim() === (selectedStatus || "").trim();

      return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    });
  }, [employeesData, searchQuery, selectedDepartment, selectedRole, selectedStatus]);

  // Handle checkbox selection
  const handleCheckboxChange = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(e => e.id));
    }
  };

  // Warning Modal Component (for table actions)
  if (showWarningModal && !showEditEmployeePage) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={() => {
          setShowWarningModal(false);
          setEmployeeToDelete(null);
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
            <img src={WarningIcon} alt="Warning" className="w-[73px] h-[61px] object-contain" />
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
              Are you Sure to delete this Employee ?
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
              onClick={async () => {
                if (employeeToDelete?.id) {
                  try {
                    await deleteEmployee(employeeToDelete.id);
                    await fetchEmployees();
                  } catch (err) {
                    console.error("Failed to delete employee:", err);
                    setEmployeesError(err.response?.data?.message ?? err.message ?? "Failed to delete employee");
                  }
                }
                setShowWarningModal(false);
                setEmployeeToDelete(null);
                if (showEditEmployeePage) {
                  setShowEditEmployeePage(false);
                  setEditingEmployee(null);
                }
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
                setEmployeeToDelete(null);
                if (showEditEmployeePage) {
                  setShowEditEmployeePage(false);
                  setEditingEmployee(null);
                }
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
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      {/* ملف اختيار الصورة مشترك بين Add و Edit - لازم يكون دائماً في الـ DOM */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleProfilePhotoChange}
        className="hidden"
      />
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen" style={{ overflowX: 'hidden' }}>
        {/* Sidebar Component */}
        <Sidebar
          userRole={effectiveRole}
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          onLogoutClick={() => setIsLogoutModalOpen(true)}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-[#F5F7FA]">
          {/* Header - White background */}
          <header className="bg-white px-[40px] py-[24px]">
            <div className="flex items-center justify-between mb-[16px]">
              {/* Search Bar */}
              <div className="relative">
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

              <div className="flex items-center gap-[16px]">
                {/* Message Icon */}
                <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={MessageIcon} alt="Messages" className="w-[20px] h-[20px] object-contain" />
                </button>

                {/* Notification Bell */}
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
              <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: '#B0B0B0' }}>User Management</span>
                <span style={{ color: '#8E8C8C', margin: '0 4px' }}> &gt; </span>
                <span style={{ color: '#8E8C8C' }}>Employees</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] overflow-y-auto bg-[#F5F7FA]" style={{ overflowX: 'hidden' }}>
            {/* Page Header */}
            <div className="mb-[20px]">
              <h1 className="text-[28px] font-semibold text-[#000000] mb-[8px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Employees
              </h1>
              <p className="text-[14px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                Manage all employees in your organization
              </p>
            </div>

            {/* Error Message */}
            {employeesError && (
              <div className="mb-[20px] p-[16px] rounded-[8px] bg-red-50 border border-red-200">
                <p className="text-[14px] text-red-600">{employeesError}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoadingEmployees && (
              <div className="mb-[20px] flex items-center justify-center py-[40px]">
                <div className="text-[14px] text-[#6B7280]">Loading employees...</div>
              </div>
            )}

            {/* Add Employee Button */}
            <div className="mb-[20px] flex justify-end">
              <button
                onClick={() => setShowAddEmployeePage(true)}
                className="px-[20px] py-[12px] text-white rounded-[5px] hover:opacity-90 transition-opacity flex items-center justify-center gap-[8px] border border-[#B5B1B1]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', backgroundColor: '#0C8DFE', height: '46px', width: '205px' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Add Employee
              </button>
            </div>

            {/* Filter and Action Bar */}
            <div className="mb-[20px] flex items-center justify-start gap-[32px] flex-wrap">
              {/* Department Dropdown */}
              <div className="relative" ref={departmentDropdownRef}>
                <button
                  onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                  className="appearance-none px-[20px] py-[12px] pr-[40px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] text-[#374151] focus:outline-none focus:border-[#004D40] transition-colors cursor-pointer w-full text-left"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, minWidth: '200px' }}
                >
                  <span>{selectedDepartment}</span>
                </button>
                <svg className={`absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#6B7280] transition-transform pointer-events-none ${isDepartmentDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {isDepartmentDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[4px] bg-white rounded-[8px] border border-[#E0E0E0] shadow-lg z-50 w-full">
                    {["HR", "Field Operations", "Office", "Project Management", "Finance", "IT", "All Departments"].map((dept) => (
                      <button
                        key={dept}
                        onClick={() => {
                          setSelectedDepartment(dept);
                          setIsDepartmentDropdownOpen(false);
                        }}
                        className={`w-full px-[20px] py-[12px] text-left text-[14px] transition-colors cursor-pointer ${selectedDepartment === dept
                          ? 'bg-[#E5E7EB] text-[#000000]'
                          : 'bg-white text-[#374151] hover:bg-[#F5F7FA]'
                          }`}
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400
                        }}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Role Dropdown */}
              <div className="relative" ref={roleDropdownRef}>
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="appearance-none px-[20px] py-[12px] pr-[40px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] text-[#374151] focus:outline-none focus:border-[#004D40] transition-colors cursor-pointer w-full text-left"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, minWidth: '200px' }}
                >
                  <span>{selectedRole}</span>
                </button>
                <svg className={`absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#6B7280] transition-transform pointer-events-none ${isRoleDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {isRoleDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[4px] bg-white rounded-[8px] border border-[#E0E0E0] shadow-lg z-50 w-full">
                    {["Super Admin", "HR Admin", "Manager", "Field Worker", "Office Staff", "All Roles"].map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setSelectedRole(role);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full px-[20px] py-[12px] text-left text-[14px] transition-colors cursor-pointer ${selectedRole === role
                          ? 'bg-[#E5E7EB] text-[#000000]'
                          : 'bg-white text-[#374151] hover:bg-[#F5F7FA]'
                          }`}
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400
                        }}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="appearance-none px-[20px] py-[12px] pr-[40px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] text-[#374151] focus:outline-none focus:border-[#004D40] transition-colors cursor-pointer w-full text-left"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, minWidth: '200px' }}
                >
                  <span>{selectedStatus}</span>
                </button>
                <svg className={`absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#6B7280] transition-transform pointer-events-none ${isStatusDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-[4px] bg-white rounded-[8px] border border-[#E0E0E0] shadow-lg z-50 w-full">
                    {["All Status", "Active", "Under Review", "Inactive"].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full px-[20px] py-[12px] text-left text-[14px] transition-colors cursor-pointer ${selectedStatus === status
                          ? 'bg-[#E5E7EB] text-[#000000]'
                          : 'bg-white text-[#374151] hover:bg-[#F5F7FA]'
                          }`}
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 400
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by name or ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-[16px] py-[12px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedEmployees.length > 0 && (
              <div className="mb-[20px] bg-white rounded-[10px] p-[16px] flex items-center gap-[16px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div className="text-[14px] text-[#333333]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                  {selectedEmployees.length} selected
                </div>
                <div className="relative" ref={bulkActionsDropdownRef}>
                  <button
                    onClick={() => setIsBulkActionsDropdownOpen(!isBulkActionsDropdownOpen)}
                    className="px-[16px] py-[8px] rounded-[8px] border border-[#E0E0E0] bg-white flex items-center gap-[8px] hover:bg-[#F5F7FA] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}
                  >
                    <span>Bulk Actions</span>
                    <svg className="w-[12px] h-[12px] text-[#6B7280]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {isBulkActionsDropdownOpen && (
                    <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-20 min-w-[200px]">
                      <button
                        onClick={async () => {
                          try {
                            await bulkActionEmployees({ action: "delete", ids: selectedEmployees });
                            await fetchEmployees();
                            setSelectedEmployees([]);
                            setIsBulkActionsDropdownOpen(false);
                          } catch (err) {
                            console.error("Bulk delete failed:", err);
                            setEmployeesError(err.response?.data?.message ?? err.message ?? "Bulk delete failed");
                          }
                        }}
                        className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] flex items-center gap-[8px] first:rounded-t-[8px]"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                      >
                        <span style={{ fontSize: '16px' }}>✗</span>
                        Delete selected
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await bulkActionEmployees({ action: "review", ids: selectedEmployees });
                            await fetchEmployees();
                            setSelectedEmployees([]);
                            setIsBulkActionsDropdownOpen(false);
                          } catch (err) {
                            console.error("Bulk action failed:", err);
                            setEmployeesError(err.response?.data?.message ?? err.message ?? "Bulk action failed");
                          }
                        }}
                        className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] flex items-center gap-[8px] last:rounded-b-[8px]"
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                      >
                        <span style={{ fontSize: '16px' }}>✓</span>
                        Mark as reviewed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Employees Table */}
            <div className="bg-white rounded-[10px] border border-[#E0E0E0] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" style={{ borderSpacing: 0 }}>
                  <thead>
                    <tr>
                      <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0', color: '#6C6C6C' }}>
                        <input
                          type="checkbox"
                          checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                          onChange={handleSelectAll}
                          className="w-[16px] h-[16px] rounded border-[#E0E0E0] cursor-pointer"
                        />
                      </th>
                      <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0', color: '#6C6C6C' }}>
                        Employee
                      </th>
                      <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0', color: '#6C6C6C' }}>
                        Employee ID
                      </th>
                      <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0', color: '#6C6C6C' }}>
                        Department
                      </th>
                      <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0', color: '#6C6C6C' }}>
                        Position
                      </th>
                      <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0', color: '#6C6C6C' }}>
                        Role
                      </th>
                      <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0', color: '#6C6C6C' }}>
                        Status
                      </th>
                      <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, borderBottom: '1px solid #E0E0E0', color: '#6C6C6C' }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!isLoadingEmployees && filteredEmployees.length === 0 && (
                      <tr>
                        <td colSpan="8" className="py-[40px] text-center">
                          <p className="text-[14px] text-[#6B7280]">No employees found</p>
                        </td>
                      </tr>
                    )}
                    {!isLoadingEmployees && filteredEmployees.map((employee, index) => (
                      <tr key={employee.id} className="transition-colors" style={{ borderBottom: index < filteredEmployees.length - 1 ? '1px solid #E0E0E0' : 'none' }}>
                        <td className="py-[16px] px-[20px] text-center" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee.id)}
                            onChange={() => handleCheckboxChange(employee.id)}
                            className="w-[16px] h-[16px] rounded border-[#E0E0E0] cursor-pointer"
                          />
                        </td>
                        <td className="py-[16px] px-[20px] text-center" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <div className="flex items-center justify-center gap-[12px]">
                            <div className="w-[40px] h-[40px] rounded-full bg-[#E0E0E0] flex items-center justify-center flex-shrink-0 overflow-hidden">
                              <img
                                src={employee.photo || EmployeeIcon}
                                alt={employee.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = EmployeeIcon; }}
                              />
                            </div>
                            <p className="text-[14px] font-medium" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#000000' }}>
                              {employee.name}
                            </p>
                          </div>
                        </td>
                        <td className="py-[16px] px-[20px] text-center" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <p className="text-[14px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#000000' }}>
                            {employee.employeeId || '-'}
                          </p>
                        </td>
                        <td className="py-[16px] px-[20px] text-center" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <p className="text-[14px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#000000' }}>
                            {employee.department}
                          </p>
                        </td>
                        <td className="py-[16px] px-[20px] text-center" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <p className="text-[14px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#000000' }}>
                            {employee.position || '-'}
                          </p>
                        </td>
                        <td className="py-[16px] px-[20px] text-center" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <p className="text-[14px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#000000' }}>
                            {employee.role}
                          </p>
                        </td>
                        <td className="py-[16px] px-[20px] text-center" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <span
                            className={`inline-block px-[8px] py-[4px] rounded-[4px] text-[12px] font-semibold`}
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 600,
                              color: employee.status === 'Active' ? '#00564F' : employee.status === 'Under Review' ? '#92400E' : '#4A4A4A',
                              backgroundColor: employee.status === 'Active' ? '#68BFCCB2' : employee.status === 'Under Review' ? '#FEF3C7' : '#D2D2D2'
                            }}
                          >
                            {employee.status}
                          </span>
                        </td>
                        <td className="py-[16px] px-[20px] text-center">
                          <div className="flex items-center justify-center gap-0">
                            <button
                              onClick={() => {
                                setEditingEmployee(employee);
                                setFormData({
                                  firstName: employee.name.split(' ')[0] || "",
                                  lastName: employee.name.split(' ').slice(1).join(' ') || "",
                                  department: employee.department || "",
                                  position: employee.position || "",
                                  role: employee.role || "",
                                  status: employee.status || "Active"
                                });
                                setShowEditEmployeePage(true);
                              }}
                              className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity"
                              title="Edit"
                            >
                              <img src={EditIcon6} alt="Edit" className="w-full h-full object-contain" />
                            </button>
                            <div className="w-[1px] h-[22px] bg-[#E0E0E0] mx-[8px]"></div>
                            <button
                              onClick={() => {
                                setEmployeeToDelete(employee);
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

              {/* Empty State */}
              {filteredEmployees.length === 0 && (
                <div className="py-[60px] text-center">
                  <p className="text-[16px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    No employees found
                  </p>
                </div>
              )}

              {/* Pagination */}
              {filteredEmployees.length > 0 && (
                <div className="border-t border-[#E0E0E0] px-[20px] py-[16px] flex items-center justify-center gap-[8px]">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-[16px] h-[16px] text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  {[1, 2, 3].map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-[14px] transition-colors bg-white border border-[#E0E0E0] hover:bg-[#F5F7FA] ${currentPage === page
                        ? 'font-semibold'
                        : ''
                        }`}
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: currentPage === page ? 600 : 400,
                        color: currentPage === page ? '#474747' : '#827F7F'
                      }}
                    >
                      {page}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === 3}
                    className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-[16px] h-[16px] text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen bg-[#F5F7FA]">
        {/* Mobile Header */}
        <header className="h-[70px] bg-white flex items-center justify-between px-[16px] sticky top-0 z-30 border-b border-[#E0E0E0]">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-[40px] h-[40px] rounded-[8px] bg-[#004D40] flex items-center justify-center hover:bg-[#003830] transition-colors"
          >
            <svg className="w-[24px] h-[24px] text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

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
                      setIsUserDropdownOpen(false);
                      setTimeout(() => {
                        navigate("/login", { replace: true });
                      }, 100);
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

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

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
        <div className="p-[16px]">
          {/* Page Header */}
          <div className="mb-[16px]">
            <h1 className="text-[20px] font-semibold text-[#000000] mb-[4px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Employees
            </h1>
            <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              Manage and view all employees
            </p>
          </div>

          {/* Search Bar - Mobile */}
          <div className="relative mb-[16px]">
            <svg className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[40px] pl-[40px] pr-[16px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
              style={{ fontWeight: 400 }}
            />
          </div>

          {/* Add Employee Button - Mobile */}
          <button
            onClick={() => setShowAddEmployeePage(true)}
            className="w-full mb-[16px] px-[20px] py-[12px] bg-[#004D40] text-white rounded-[10px] hover:bg-[#003830] transition-colors flex items-center justify-center gap-[8px]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add Employee
          </button>

          {/* Employees Cards - Mobile */}
          <div className="flex flex-col gap-[12px]">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="bg-white rounded-[10px] border border-[#E0E0E0] shadow-sm p-[16px]">
                <div className="flex items-start justify-between mb-[12px]">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[40px] h-[40px] rounded-full bg-[#E5E7EB] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={employee.photo || EmployeeIcon}
                        alt={employee.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = EmployeeIcon; }}
                      />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#111827] mb-[2px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                        {employee.name}
                      </p>
                      <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                        {employee.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <button
                      onClick={() => {
                        setEditingEmployee(employee);
                        setFormData({
                          firstName: employee.name.split(' ')[0] || "",
                          lastName: employee.name.split(' ').slice(1).join(' ') || "",
                          department: employee.department || "",
                          position: employee.position || "",
                          role: employee.role || "",
                          status: employee.status || "Active"
                        });
                        setShowEditEmployeePage(true);
                      }}
                      className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
                    >
                      <img src={EditIcon} alt="Edit" className="w-[16px] h-[16px] object-contain" />
                    </button>
                    <button
                      onClick={() => {
                        setEmployeeToDelete(employee);
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
                    {employee.role}
                  </span>
                  <span
                    className={`inline-block px-[12px] py-[4px] rounded-[6px] text-[12px] font-medium ${
                      employee.status === 'Active' ? 'bg-[#D1FAE5] text-[#065F46]' : employee.status === 'Under Review' ? 'bg-[#FEF3C7] text-[#92400E]' : 'bg-[#FEE2E2] text-[#991B1B]'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                  >
                    {employee.status}
                  </span>
                  </div>
                <div className="space-y-[4px]">
                  <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    <span className="font-medium text-[#374151]">Department:</span> {employee.department}
                  </p>
                  <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    <span className="font-medium text-[#374151]">Phone:</span> {employee.phone}
                  </p>
                  <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    <span className="font-medium text-[#374151]">Joined:</span> {employee.joinDate}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State - Mobile */}
          {filteredEmployees.length === 0 && (
            <div className="py-[60px] text-center">
              <p className="text-[16px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                No employees found
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployeePage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowAddEmployeePage(false);
            setFormData({ firstName: "", lastName: "", department: "", position: "", role: "", status: "Active" });
            if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
            setProfilePhotoFile(null);
            setProfilePhotoPreview(null);
          }}
        >
          <style>{`
            select option:checked {
              background-color: #E5E7EB !important;
              color: #000000 !important;
            }
            select option:hover {
              background-color: #F5F7FA;
            }
          `}</style>
          <div
            className="bg-white rounded-[10px] relative mx-[16px] w-full max-w-[500px]"
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
                Add Employee
              </h2>
              <button
                onClick={() => {
                  setShowAddEmployeePage(false);
                  setFormData({ firstName: "", lastName: "", department: "", position: "", role: "", status: "Active" });
                  if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
                  setProfilePhotoFile(null);
                  setProfilePhotoPreview(null);
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
              {/* Profile Picture */}
              <div className="flex justify-start mb-[30px]">
                <div className="relative">
                  <div
                    className="w-[120px] h-[120px] rounded-full bg-[#F5F5F5] flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundImage: !profilePhotoPreview ? 'repeating-linear-gradient(45deg, #E0E0E0 0px, #E0E0E0 10px, #F5F5F5 10px, #F5F5F5 20px)' : 'none'
                    }}
                  >
                    <img src={profilePhotoPreview || DefaultProfileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={handleProfilePhotoClick}
                    className="absolute bottom-0 right-0 w-[24px] h-[24px] bg-white rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-gray-50"
                    style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  >
                    <img src={CameraIcon} alt="Choose photo" className="w-[16px] h-[16px] object-contain" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddEmployeeSubmit}>
                {saveEmployeeError && (
                  <div className="mb-[16px] p-[12px] rounded-[8px] bg-red-50 border border-red-200">
                    <p className="text-[14px] text-red-600">{saveEmployeeError}</p>
                  </div>
                )}
                {saveEmployeeSuccess && (
                  <div className="mb-[16px] p-[12px] rounded-[8px] bg-green-50 border border-green-200">
                    <p className="text-[14px] text-green-600">Employee created successfully!</p>
                  </div>
                )}
                {/* Form Fields - Single Column */}
                <div className="space-y-[16px]">
                  {/* First Name */}
                  <div className="flex items-center">
                    <label
                      className="flex-shrink-0 mr-[12px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        width: '100px'
                      }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter the First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="flex-1 focus:outline-none bg-white"
                      style={{
                        height: '26px',
                        padding: '0 12px',
                        borderRadius: '4px',
                        border: '0.8px solid #939393',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        color: '#000000'
                      }}
                    />
                  </div>

                  {/* Last Name */}
                  <div className="flex items-center">
                    <label
                      className="flex-shrink-0 mr-[12px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        width: '100px'
                      }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter the Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="flex-1 focus:outline-none bg-white"
                      style={{
                        height: '26px',
                        padding: '0 12px',
                        borderRadius: '4px',
                        border: '0.8px solid #939393',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        color: '#6B7280'
                      }}
                    />
                  </div>

                  {/* Department */}
                  <div className="flex items-center">
                    <label
                      className="flex-shrink-0 mr-[12px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        width: '100px'
                      }}
                    >
                      Department
                    </label>
                    <div className="relative flex-1">
                      <select
                        value={formData.department}
                        onChange={handleDepartmentChange}
                        className="w-full focus:outline-none bg-white appearance-none cursor-pointer"
                        style={{
                          height: '26px',
                          padding: '0 12px',
                          paddingRight: '32px',
                          borderRadius: '4px',
                          border: '0.8px solid #939393',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#000000'
                        }}
                      >
                        <option value="">Select Department</option>
                        <option value="HR">HR</option>
                        <option value="Field Operations">Field Operations</option>
                        <option value="Office">Office</option>
                        <option value="Project Management">Project Management</option>
                        <option value="Finance">Finance</option>
                        <option value="IT">IT</option>
                      </select>
                      <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Position */}
                  <div className="flex items-center">
                    <label
                      className="flex-shrink-0 mr-[12px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        width: '100px'
                      }}
                    >
                      Position
                    </label>
                    <div className="relative flex-1">
                      <select
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        disabled={!formData.department || formData.department === ""}
                        className="w-full focus:outline-none bg-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                        style={{
                          height: '26px',
                          padding: '0 12px',
                          paddingRight: '32px',
                          borderRadius: '4px',
                          border: '0.8px solid #939393',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#000000'
                        }}
                      >
                        <option value="">Select Position</option>
                        {getAvailablePositions().map((position) => (
                          <option key={position} value={position}>
                            {position}
                          </option>
                        ))}
                      </select>
                      <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-center">
                    <label
                      className="flex-shrink-0 mr-[12px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        width: '100px'
                      }}
                    >
                      Role
                    </label>
                    <div className="relative flex-1">
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full focus:outline-none bg-white appearance-none cursor-pointer"
                        style={{
                          height: '26px',
                          padding: '0 12px',
                          paddingRight: '32px',
                          borderRadius: '4px',
                          border: '0.8px solid #939393',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#000000'
                        }}
                      >
                        <option value="">Select Role</option>
                        <option value="Super Admin">Super Admin</option>
                        <option value="HR Admin">HR Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Field Worker">Field Worker</option>
                        <option value="Office Staff">Office Staff</option>
                      </select>
                      <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <label
                      className="flex-shrink-0 mr-[12px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        width: '100px'
                      }}
                    >
                      Status
                    </label>
                    <div className="relative flex-1">
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full focus:outline-none bg-white appearance-none cursor-pointer"
                        style={{
                          height: '26px',
                          padding: '0 12px',
                          paddingRight: '32px',
                          borderRadius: '4px',
                          border: '0.8px solid #939393',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#000000'
                        }}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-[12px] mt-[40px]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddEmployeePage(false);
                      setFormData({ firstName: "", lastName: "", department: "", position: "", role: "", status: "Active" });
                      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
                      setProfilePhotoFile(null);
                      setProfilePhotoPreview(null);
                    }}
                    className="px-[40px] py-[6px] rounded-[5px] hover:opacity-90 transition-opacity border border-[#B5B1B1]"
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#737373',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEmployee}
                    className="px-[40px] py-[6px] rounded-[5px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#00564F',
                      color: '#FFFFFF',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      border: '1px solid #B5B1B1',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                    }}
                  >
                    {isSavingEmployee ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditEmployeePage && editingEmployee && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowEditEmployeePage(false);
            setEditingEmployee(null);
          }}
        >
          <style>{`
            select option:checked {
              background-color: #E5E7EB !important;
              color: #000000 !important;
            }
            select option:hover {
              background-color: #F5F7FA;
            }
          `}</style>
          <div
            className="bg-white rounded-[10px] relative mx-[16px] w-full max-w-[500px]"
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
                Edit Employee
              </h2>
              <button
                onClick={() => {
                  setShowEditEmployeePage(false);
                  setEditingEmployee(null);
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
              {/* Profile Picture */}
              <div className="flex justify-start mb-[30px]">
                <div className="relative">
                  <div
                    className="w-[120px] h-[120px] rounded-full bg-[#F5F5F5] flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundImage: !profilePhotoPreview ? 'repeating-linear-gradient(45deg, #E0E0E0 0px, #E0E0E0 10px, #F5F5F5 10px, #F5F5F5 20px)' : 'none'
                    }}
                  >
                    <img src={profilePhotoPreview || editingEmployee.photo || DefaultProfileImage} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={handleProfilePhotoClick}
                    className="absolute bottom-0 right-0 w-[24px] h-[24px] bg-white rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-gray-50"
                    style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  >
                    <img src={CameraIcon} alt="Choose photo" className="w-[16px] h-[16px] object-contain" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddEmployeeSubmit}>
                {/* Error Message */}
                {saveEmployeeError && (
                  <div className="mb-[16px] p-[12px] rounded-[8px] bg-red-50 border border-red-200">
                    <p className="text-[14px] text-red-600">{saveEmployeeError}</p>
                  </div>
                )}

                {/* Success Message */}
                {saveEmployeeSuccess && (
                  <div className="mb-[16px] p-[12px] rounded-[8px] bg-green-50 border border-green-200">
                    <p className="text-[14px] text-green-600">{showEditEmployeePage && editingEmployee ? 'Employee updated successfully!' : 'Employee created successfully!'}</p>
                  </div>
                )}

                {/* Form Fields - Single Column */}
                <div className="space-y-[16px]">
                  {/* First Name */}
                  <div className="flex items-center">
                    <label
                      className="flex-shrink-0 mr-[12px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        width: '100px'
                      }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="flex-1 focus:outline-none bg-white"
                      style={{
                        height: '26px',
                        padding: '0 12px',
                        borderRadius: '4px',
                        border: '0.8px solid #939393',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        color: '#6B7280'
                      }}
                    />
                  </div>

                  {/* Last Name */}
                  <div className="flex items-center">
                    <label
                      className="flex-shrink-0 mr-[12px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        width: '100px'
                      }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="flex-1 focus:outline-none bg-white"
                      style={{
                        height: '26px',
                        padding: '0 12px',
                        borderRadius: '4px',
                        border: '0.8px solid #939393',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        color: '#6B7280'
                      }}
                    />
                  </div>

                  {/* Department */}
                  <div className="flex items-center">
                    <label
                      className="flex-shrink-0 mr-[12px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        width: '100px'
                      }}
                    >
                      Department
                    </label>
                    <div className="relative flex-1">
                      <select
                        value={formData.department}
                        onChange={handleDepartmentChange}
                        className="w-full focus:outline-none bg-white appearance-none cursor-pointer"
                        style={{
                          height: '26px',
                          padding: '0 12px',
                          paddingRight: '32px',
                          borderRadius: '4px',
                          border: '0.8px solid #939393',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#6B7280'
                        }}
                      >
                        <option value="">Select Department</option>
                        <option value="HR">HR</option>
                        <option value="Field Operations">Field Operations</option>
                        <option value="Office">Office</option>
                        <option value="Project Management">Project Management</option>
                        <option value="Finance">Finance</option>
                        <option value="IT">IT</option>
                      </select>
                      <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Position */}
                  <div className="flex items-center">
                    <label
                      className="flex-shrink-0 mr-[12px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        width: '100px'
                      }}
                    >
                      Position
                    </label>
                    <div className="relative flex-1">
                      <select
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        disabled={!formData.department || formData.department === ""}
                        className="w-full focus:outline-none bg-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                        style={{
                          height: '26px',
                          padding: '0 12px',
                          paddingRight: '32px',
                          borderRadius: '4px',
                          border: '0.8px solid #939393',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#6B7280'
                        }}
                      >
                        <option value="">Select Position</option>
                        {getAvailablePositions().map((position) => (
                          <option key={position} value={position}>
                            {position}
                          </option>
                        ))}
                      </select>
                      <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="flex items-center">
                    <label
                      className="flex-shrink-0 mr-[12px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        width: '100px'
                      }}
                    >
                      Role
                    </label>
                    <div className="relative flex-1">
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full focus:outline-none bg-white appearance-none cursor-pointer"
                        style={{
                          height: '26px',
                          padding: '0 12px',
                          paddingRight: '32px',
                          borderRadius: '4px',
                          border: '0.8px solid #939393',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#6B7280'
                        }}
                      >
                        <option value="">Select Role</option>
                        <option value="Super Admin">Super Admin</option>
                        <option value="HR Admin">HR Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Field Worker">Field Worker</option>
                        <option value="Office Staff">Office Staff</option>
                      </select>
                      <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <label
                      className="flex-shrink-0 mr-[12px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        width: '100px'
                      }}
                    >
                      Status
                    </label>
                    <div className="relative flex-1">
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full focus:outline-none bg-white appearance-none cursor-pointer"
                        style={{
                          height: '26px',
                          padding: '0 12px',
                          paddingRight: '32px',
                          borderRadius: '4px',
                          border: '0.8px solid #939393',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#6B7280'
                        }}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between mt-[40px]">
                  <button
                    type="button"
                    onClick={() => {
                      setEmployeeToDelete(editingEmployee);
                      setShowWarningModal(true);
                    }}
                    className="px-[24px] py-[6px] rounded-[5px] hover:opacity-90 transition-opacity"
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#CC0000',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      border: '1px solid #CC0000'
                    }}
                  >
                    Delete
                  </button>
                  <div className="flex items-center gap-[12px]">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditEmployeePage(false);
                        setEditingEmployee(null);
                      }}
                      className="px-[24px] py-[6px] rounded-[5px] hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: '#FFFFFF',
                        color: '#737373',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        border: '1px solid #B5B1B1'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-[24px] py-[6px] rounded-[5px] hover:opacity-90 transition-opacity"
                      style={{
                        backgroundColor: '#00564F',
                        color: '#FFFFFF',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        border: '1px solid #B5B1B1',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                      }}
                    >
                      Update
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={async () => {
          setIsLogoutModalOpen(false);
          try {
            await logout();
            navigate("/login", { replace: true });
          } catch (error) {
            console.error('Logout error:', error);
            navigate("/login", { replace: true });
          }
        }}
      />
    </div>
  );
};

export default EmployeesPage;

