import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import LogoutModal from "./LogoutModal";

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
const EditIcon6 = new URL("../images/icons/edit6.png", import.meta.url).href;
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;
const WarningIcon = new URL("../images/icons/warnning.png", import.meta.url).href;

const DepartmentsPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("2-3");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState("All Departments");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddDepartmentPage, setShowAddDepartmentPage] = useState(false);
  const [showEditDepartmentPage, setShowEditDepartmentPage] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [isBulkActionsDropdownOpen, setIsBulkActionsDropdownOpen] = useState(false);

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const departmentDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const bulkActionsDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Form state for Add/Edit Department
  const [formData, setFormData] = useState({
    name: "",
    status: "Active",
    description: ""
  });

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Sample departments data
  const departmentsData = [
    {
      id: 1,
      name: "Human Resource",
      employeeCount: 5,
      status: "Active"
    },
    {
      id: 2,
      name: "Field Operations",
      employeeCount: 8,
      status: "Active"
    },
    {
      id: 3,
      name: "Office Administration",
      employeeCount: 9,
      status: "Active"
    },
    {
      id: 4,
      name: "Project Management",
      employeeCount: 0,
      status: "Inactive"
    },
    {
      id: 5,
      name: "Finance",
      employeeCount: 4,
      status: "Active"
    },
    {
      id: 6,
      name: "Information Technology",
      employeeCount: 4,
      status: "Active"
    }
  ];

  const filteredDepartments = departmentsData.filter(department => {
    const matchesSearch = !searchQuery ||
      department.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment = selectedDepartmentFilter === "All Departments" || department.name === selectedDepartmentFilter;
    const matchesStatus = selectedStatus === "All Status" || department.status === selectedStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Handle checkbox selection
  const handleCheckboxChange = (departmentId) => {
    setSelectedDepartments(prev => {
      if (prev.includes(departmentId)) {
        return prev.filter(id => id !== departmentId);
      } else {
        return [...prev, departmentId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedDepartments.length === filteredDepartments.length) {
      setSelectedDepartments([]);
    } else {
      setSelectedDepartments(filteredDepartments.map(dept => dept.id));
    }
  };

  // Reset form when opening Add Department page
  useEffect(() => {
    if (showAddDepartmentPage) {
      setFormData({
        name: "",
        status: "Active",
        description: ""
      });
    }
  }, [showAddDepartmentPage]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on Log Out button - don't close dropdown in that case
      const isLogoutButton = event.target.closest('button')?.textContent?.trim() === 'Log Out';
      if (isLogoutButton) {
        return;
      }

      if (isDepartmentDropdownOpen && departmentDropdownRef.current && !departmentDropdownRef.current.contains(event.target)) {
        setIsDepartmentDropdownOpen(false);
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
  }, [isDepartmentDropdownOpen, isStatusDropdownOpen, isBulkActionsDropdownOpen, isUserDropdownOpen]);




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

        <main className="flex-1 flex flex-col bg-[#F5F7FA]">
          <header className="h-[115px] bg-white flex flex-col justify-center px-[40px]">
            <div className="flex items-center justify-between">
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
                <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={MessageIcon} alt="Messages" className="w-[20px] h-[20px] object-contain" />
                </button>
                <button className="relative w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={NotificationIcon} alt="Notifications" className="w-[20px] h-[20px] object-contain" />
                  <span className="absolute top-[4px] right-[4px] w-[8px] h-[8px] bg-red-500 rounded-full"></span>
                </button>
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
            <div className="mt-[12px]">
              <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: '#B0B0B0' }}>User Management</span>
                <span style={{ color: '#8E8C8C', margin: '0 4px' }}> &gt; </span>
                <span style={{ color: '#8E8C8C' }}>Departments</span>
              </p>
            </div>
          </header>

          <div className="flex-1 p-[36px] overflow-y-auto bg-[#F5F7FA]" style={{ overflowX: 'hidden' }}>
            <div className="mb-[20px]">
              <h1 className="text-[28px] font-semibold text-[#000000] mb-[8px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Departments
              </h1>
              <p className="text-[14px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                Manage your organization departments
              </p>
            </div>

            <div className="mb-[20px] flex flex-col gap-[20px]">
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setShowAddDepartmentPage(true)}
                  className="px-[20px] py-[12px] text-white rounded-[5px] hover:opacity-90 transition-opacity flex items-center justify-center gap-[8px] border border-[#B5B1B1]"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', backgroundColor: '#0C8DFE', height: '39px', width: '205px' }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Add Department
                </button>
              </div>

              <div className="flex items-center justify-between gap-[32px] flex-wrap">
                <div className="flex items-center gap-[32px] flex-wrap">
                  <div className="relative" ref={departmentDropdownRef}>
                    <button
                      onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                      className="appearance-none px-[20px] py-[12px] pr-[40px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] text-[#374151] focus:outline-none focus:border-[#004D40] transition-colors cursor-pointer w-full text-left"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, minWidth: '200px' }}
                    >
                      <span>{selectedDepartmentFilter}</span>
                    </button>
                    <svg className={`absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#6B7280] transition-transform pointer-events-none ${isDepartmentDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    {isDepartmentDropdownOpen && (
                      <div className="absolute top-full left-0 mt-[4px] bg-white rounded-[8px] border border-[#E0E0E0] shadow-lg z-50 w-full">
                        {["Human Resource", "Field Operations", "Office Administration", "Project Management", "Finance", "Information Technology", "All Departments"].map((dept) => (
                          <button
                            key={dept}
                            onClick={() => {
                              setSelectedDepartmentFilter(dept);
                              setIsDepartmentDropdownOpen(false);
                            }}
                            className={`w-full px-[20px] py-[12px] text-left text-[14px] transition-colors cursor-pointer ${selectedDepartmentFilter === dept
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
                        {["All Status", "Active", "Inactive"].map((status) => (
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
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-[16px] py-[12px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, width: '205px' }}
                  />
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedDepartments.length > 0 && (
              <div className="mb-[20px] bg-white rounded-[10px] p-[16px] flex items-center gap-[16px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div className="text-[14px] text-[#333333]" style={{ fontWeight: 500 }}>
                  {selectedDepartments.length} selected
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
                    <div className="absolute top-full left-0 mt-[4px] bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-20 min-w-[180px]">
                      <div className="px-[16px] py-[8px] border-b border-[#E0E0E0]">
                        <p className="text-[14px] text-[#000000]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>Bulk Actions</p>
                      </div>
                      <button
                        onClick={() => {
                          console.log('Delete selected departments:', selectedDepartments);
                          setSelectedDepartments([]);
                          setIsBulkActionsDropdownOpen(false);
                        }}
                        className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] flex items-center gap-[8px]"
                        style={{ fontWeight: 400, fontFamily: 'Inter, sans-serif' }}
                      >
                        <svg className="w-[16px] h-[16px] text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Delete selected
                      </button>
                      <button
                        onClick={() => {
                          console.log('Mark as reviewed:', selectedDepartments);
                          setSelectedDepartments([]);
                          setIsBulkActionsDropdownOpen(false);
                        }}
                        className="w-full px-[16px] py-[12px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] flex items-center gap-[8px] rounded-b-[8px]"
                        style={{ fontWeight: 400, fontFamily: 'Inter, sans-serif' }}
                      >
                        <svg className="w-[16px] h-[16px] text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Mark as reviewed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-[10px] border border-[#E0E0E0] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" style={{ borderSpacing: 0 }}>
                  <thead>
                    <tr>
                      <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0', color: '#6C6C6C' }}>
                        <input
                          type="checkbox"
                          checked={selectedDepartments.length === filteredDepartments.length && filteredDepartments.length > 0}
                          onChange={handleSelectAll}
                          className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                        />
                      </th>
                      <th className="py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0', color: '#6C6C6C', textAlign: 'left' }}>
                        Department Name
                      </th>
                      <th className="text-center py-[16px] px-[20px] text-[14px] font-semibold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0', color: '#6C6C6C' }}>
                        Employee count
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
                    {filteredDepartments.map((department, index) => (
                      <tr key={department.id} className="transition-colors" style={{ borderBottom: index < filteredDepartments.length - 1 ? '1px solid #E0E0E0' : 'none' }}>
                        <td className="py-[16px] px-[20px] text-center" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <input
                            type="checkbox"
                            checked={selectedDepartments.includes(department.id)}
                            onChange={() => handleCheckboxChange(department.id)}
                            className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                          />
                        </td>
                        <td className="py-[16px] px-[20px]" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <p className="text-[14px] font-medium" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#000000', textAlign: 'left' }}>
                            {department.name}
                          </p>
                        </td>
                        <td className="py-[16px] px-[20px] text-center" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <p className="text-[14px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#000000' }}>
                            {department.employeeCount}
                          </p>
                        </td>
                        <td className="py-[16px] px-[20px] text-center" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <span className={`inline-block px-[8px] py-[4px] rounded-[4px] text-[12px] font-semibold`} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: department.status === 'Active' ? '#00564F' : '#4A4A4A', backgroundColor: department.status === 'Active' ? '#68BFCCB2' : '#D2D2D2' }}>
                            {department.status}
                          </span>
                        </td>
                        <td className="py-[16px] px-[20px] text-center">
                          <div className="flex items-center justify-center gap-0">
                            <button
                              onClick={() => {
                                setEditingDepartment(department);
                                setFormData({
                                  name: department.name || "",
                                  status: department.status || "Active",
                                  description: ""
                                });
                                setShowEditDepartmentPage(true);
                              }}
                              className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity"
                              title="Edit"
                            >
                              <img src={EditIcon6} alt="Edit" className="w-full h-full object-contain" />
                            </button>
                            <div className="w-[1px] h-[22px] bg-[#E0E0E0] mx-[8px]"></div>
                            <button
                              onClick={() => {
                                setDepartmentToDelete(department);
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

              {filteredDepartments.length === 0 && (
                <div className="py-[60px] text-center">
                  <p className="text-[16px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    No departments found
                  </p>
                </div>
              )}

              {filteredDepartments.length > 0 && (
                <div className="border-t border-[#E0E0E0] px-[20px] py-[16px] flex items-center justify-center gap-[8px]">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-[32px] h-[32px] rounded-full border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-[16px] h-[16px] text-[#000000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

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

      {/* Add Department Modal */}
      {showAddDepartmentPage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowAddDepartmentPage(false);
            setFormData({
              name: "",
              status: "Active",
              description: ""
            });
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
                Add Department
              </h2>
              <button
                onClick={() => {
                  setShowAddDepartmentPage(false);
                  setFormData({
                    name: "",
                    status: "Active",
                    description: ""
                  });
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
              <form>
                {/* Form Fields - Single Column */}
                <div className="space-y-[16px]">
                  {/* Department Name */}
                  <div className="flex flex-col">
                    <label
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        marginBottom: '8px'
                      }}
                    >
                      Department Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter Department Name"
                      className="focus:outline-none bg-white"
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

                  {/* Department Status */}
                  <div className="flex flex-col">
                    <label
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        marginBottom: '8px'
                      }}
                    >
                      Department Status
                    </label>
                    <div className="relative">
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
                        <option value="Active" style={{ color: '#727272' }}>Active</option>
                        <option value="Inactive" style={{ color: '#727272' }}>Inactive</option>
                      </select>
                      <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col">
                    <label
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        marginBottom: '8px'
                      }}
                    >
                      Description <span style={{ color: '#727272' }}>(Optional)</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="focus:outline-none bg-white"
                      rows="6"
                      style={{
                        padding: '12px',
                        borderRadius: '4px',
                        border: '0.8px solid #939393',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        color: '#6B7280',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-center gap-[12px] mt-[24px]">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddDepartmentPage(false);
                      setFormData({
                        name: "",
                        status: "Active",
                        description: ""
                      });
                    }}
                    className="focus:outline-none"
                    style={{
                      width: '100px',
                      height: '34px',
                      borderRadius: '5px',
                      backgroundColor: 'white',
                      color: '#737373',
                      border: '1px solid #E0E0E0',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      lineHeight: '100%',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-white focus:outline-none"
                    style={{
                      width: '100px',
                      height: '34px',
                      borderRadius: '5px',
                      backgroundColor: '#004D40',
                      border: '1px solid #B5B1B1',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      lineHeight: '100%',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                    }}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditDepartmentPage && editingDepartment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowEditDepartmentPage(false);
            setEditingDepartment(null);
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
                Edit Department
              </h2>
              <button
                onClick={() => {
                  setShowEditDepartmentPage(false);
                  setEditingDepartment(null);
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
              <form>
                {/* Form Fields - Single Column */}
                <div className="space-y-[16px]">
                  {/* Department Name */}
                  <div className="flex flex-col">
                    <label
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        marginBottom: '8px'
                      }}
                    >
                      Department Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter Department Name"
                      className="focus:outline-none bg-white"
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

                  {/* Department Status */}
                  <div className="flex flex-col">
                    <label
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        marginBottom: '8px'
                      }}
                    >
                      Department Status
                    </label>
                    <div className="relative">
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
                        <option value="Active" style={{ color: '#727272' }}>Active</option>
                        <option value="Inactive" style={{ color: '#727272' }}>Inactive</option>
                      </select>
                      <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col">
                    <label
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: '100%',
                        color: '#181818',
                        marginBottom: '8px'
                      }}
                    >
                      Description <span style={{ color: '#727272' }}>(Optional)</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="focus:outline-none bg-white"
                      rows="6"
                      style={{
                        padding: '12px',
                        borderRadius: '4px',
                        border: '0.8px solid #939393',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        color: '#6B7280',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between mt-[24px]">
                  <button
                    type="button"
                    onClick={() => {
                      setDepartmentToDelete(editingDepartment);
                      setShowWarningModal(true);
                    }}
                    className="focus:outline-none"
                    style={{
                      width: '100px',
                      height: '34px',
                      borderRadius: '5px',
                      backgroundColor: 'white',
                      color: '#DC2626',
                      border: '1px solid #DC2626',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '16px',
                      lineHeight: '100%',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                    }}
                  >
                    Delete
                  </button>
                  <div className="flex items-center gap-[12px]">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditDepartmentPage(false);
                        setEditingDepartment(null);
                      }}
                      className="focus:outline-none"
                      style={{
                        width: '100px',
                        height: '34px',
                        borderRadius: '5px',
                        backgroundColor: 'white',
                        color: '#737373',
                        border: '1px solid #E0E0E0',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: '100%',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="text-white focus:outline-none"
                      style={{
                        width: '100px',
                        height: '34px',
                        borderRadius: '5px',
                        backgroundColor: '#004D40',
                        border: '1px solid #B5B1B1',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: '100%',
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

      {/* Warning Modal */}
      {showWarningModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowWarningModal(false);
            setDepartmentToDelete(null);
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
            <div className="flex justify-center pt-[40px] pb-[20px]">
              <img src={WarningIcon} alt="Warning" className="w-[73px] h-[61px] object-contain" />
            </div>

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
                Are you Sure to delete this Department ?
              </p>
            </div>

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

            <div className="flex items-center justify-center gap-[20px] px-[20px]">
              <button
                onClick={() => {
                  if (departmentToDelete) {
                    console.log('Deleting department:', departmentToDelete);
                  }
                  setShowWarningModal(false);
                  setDepartmentToDelete(null);
                  setShowEditDepartmentPage(false);
                  setEditingDepartment(null);
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
                  setDepartmentToDelete(null);
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
            userRole={userRole}
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
              Departments
            </h1>
            <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
              Manage and view all departments
            </p>
          </div>

          {/* Search Bar - Mobile */}
          <div className="relative mb-[16px]">
            <svg className="absolute left-[12px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[40px] pl-[40px] pr-[16px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
              style={{ fontWeight: 400 }}
            />
          </div>

          {/* Filters - Mobile */}
          <div className="flex gap-[12px] mb-[16px]">
            <div className="relative flex-1" ref={departmentDropdownRef}>
              <button
                onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
                className="w-full appearance-none px-[16px] pr-[40px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] text-[#374151] focus:outline-none focus:border-[#004D40] transition-colors cursor-pointer text-left flex items-center"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, height: '44px' }}
              >
                <span>{selectedDepartmentFilter}</span>
              </button>
              <svg className={`absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#6B7280] transition-transform pointer-events-none ${isDepartmentDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {isDepartmentDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] bg-white rounded-[8px] border border-[#E0E0E0] shadow-lg z-50 w-full">
                  {["Human Resource", "Field Operations", "Office Administration", "Project Management", "Finance", "Information Technology", "All Departments"].map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        setSelectedDepartmentFilter(dept);
                        setIsDepartmentDropdownOpen(false);
                      }}
                      className={`w-full px-[20px] py-[12px] text-left text-[14px] transition-colors cursor-pointer ${selectedDepartmentFilter === dept
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

            <div className="relative flex-1" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full appearance-none px-[16px] pr-[40px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] text-[#374151] focus:outline-none focus:border-[#004D40] transition-colors cursor-pointer text-left flex items-center"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, height: '44px' }}
              >
                <span>{selectedStatus}</span>
              </button>
              <svg className={`absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#6B7280] transition-transform pointer-events-none ${isStatusDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-[4px] bg-white rounded-[8px] border border-[#E0E0E0] shadow-lg z-50 w-full">
                  {["All Status", "Active", "Inactive"].map((status) => (
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
          </div>

          {/* Add Department Button - Mobile */}
          <button
            onClick={() => setShowAddDepartmentPage(true)}
            className="w-full mb-[16px] px-[20px] py-[12px] bg-[#004D40] text-white rounded-[10px] hover:bg-[#003830] transition-colors flex items-center justify-center gap-[8px]"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add Department
          </button>

          {/* Departments Cards - Mobile */}
          <div className="flex flex-col gap-[12px]">
            {filteredDepartments.map((department) => (
              <div key={department.id} className="bg-white rounded-[10px] border border-[#E0E0E0] shadow-sm p-[16px]">
                <div className="flex items-start justify-between mb-[12px]">
                  <div>
                    <p className="text-[14px] font-medium text-[#111827] mb-[4px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      {department.name}
                    </p>
                    <span className={`inline-block px-[12px] py-[4px] rounded-[6px] text-[12px] font-medium ${department.status === 'Active' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#FEE2E2] text-[#991B1B]'}`} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
                      {department.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <button
                      onClick={() => {
                        setEditingDepartment(department);
                        setFormData({
                          name: department.name || "",
                          status: department.status || "Active",
                          description: ""
                        });
                        setShowEditDepartmentPage(true);
                      }}
                      className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
                    >
                      <img src={EditIcon6} alt="Edit" className="w-[16px] h-[16px] object-contain" />
                    </button>
                    <button
                      onClick={() => {
                        setDepartmentToDelete(department);
                        setShowWarningModal(true);
                      }}
                      className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
                    >
                      <img src={DeleteIcon} alt="Delete" className="w-[16px] h-[16px] object-contain" />
                    </button>
                  </div>
                </div>
                <div className="space-y-[4px]">
                  <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                    <span className="font-medium text-[#374151]">Employees:</span> {department.employeeCount}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filteredDepartments.length === 0 && (
            <div className="py-[60px] text-center">
              <p className="text-[16px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                No departments found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentsPage;

