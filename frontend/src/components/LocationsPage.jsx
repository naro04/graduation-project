import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Action icons
const EditIcon = new URL("../images/icons/update.png", import.meta.url).href;
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;

const WarningIcon = new URL("../images/icons/warnning.png", import.meta.url).href;

const LocationsPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("5-1");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All Type");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [isBulkActionsDropdownOpen, setIsBulkActionsDropdownOpen] = useState(false);
  const [showAddLocationPage, setShowAddLocationPage] = useState(false);
  const [showEditLocationPage, setShowEditLocationPage] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const typeDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const bulkActionsDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Form state for Add/Edit Location
  const [formData, setFormData] = useState({
    name: "",
    type: "Office",
    status: "Active",
    latitude: "",
    longitude: ""
  });

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Sample locations data
  const locationsData = [
    {
      id: 1,
      name: "Gaza Office",
      type: "Office",
      latitude: "31.5009",
      longitude: "34.4671",
      status: "Active"
    },
    {
      id: 2,
      name: "Field Site A",
      type: "Field",
      latitude: "31.5032",
      longitude: "34.4628",
      status: "Active"
    },
    {
      id: 3,
      name: "Training Center",
      type: "Office",
      latitude: "31.4975",
      longitude: "31.4975",
      status: "Inactive"
    }
  ];

  // Handle checkbox selection
  const handleCheckboxChange = (locationId) => {
    setSelectedLocations(prev => {
      if (prev.includes(locationId)) {
        return prev.filter(id => id !== locationId);
      } else {
        return [...prev, locationId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedLocations.length === paginatedData.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(paginatedData.map(loc => loc.id));
    }
  };

  // Type options
  const typeOptions = ["All Type", "Office", "Field"];
  const statusOptions = ["All Status", "Active", "Inactive"];

  // Filter data
  const filteredData = locationsData.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All Type" || location.type === selectedType;
    const matchesStatus = selectedStatus === "All Status" || location.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.max(3, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Reset form when opening Add Location page
  useEffect(() => {
    if (showAddLocationPage) {
      setFormData({
        name: "",
        type: "Office",
        status: "Active",
        latitude: "",
        longitude: ""
      });
    }
  }, [showAddLocationPage]);

  // Set form data when opening Edit Location page
  useEffect(() => {
    if (showEditLocationPage && editingLocation) {
      setFormData({
        name: editingLocation.name,
        type: editingLocation.type,
        status: editingLocation.status,
        latitude: editingLocation.latitude,
        longitude: editingLocation.longitude
      });
    }
  }, [showEditLocationPage, editingLocation]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
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

  // Handle updating a location
  const handleUpdateLocation = () => {
    console.log('Update location:', editingLocation.id, formData);
    // In a real application, you would send this data to a backend API
    // and then update your local state (e.g., locationsData)
    setShowEditLocationPage(false);
    setEditingLocation(null);
  };

  // Handle deleting a location (opens warning modal)
  const handleDeleteLocationClick = () => {
    setLocationToDelete(editingLocation);
    setShowWarningModal(true);
  };

  // Handle actual deletion after warning confirmation
  const handleDeleteConfirmed = () => {
    if (locationToDelete) {
      console.log('Deleting location:', locationToDelete);
      // In a real application, you would send a delete request to a backend API
      // and then update your local state (e.g., filter locationsData)
      setShowEditLocationPage(false); // Close edit modal if open
      setEditingLocation(null); // Clear editing state
    }
    setShowWarningModal(false);
    setLocationToDelete(null);
  };

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
        <main className="flex-1 flex flex-col bg-[#F5F7FA]">
          {/* Header */}
          <header className="bg-white px-[40px] py-[24px]">
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
                        className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#DC2626] font-medium hover:bg-red-50 transition-colors"
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
                <span style={{ color: '#8E8C8C' }}>Locations</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            {/* Page Header */}
            <div className="mb-[20px]">
              <h1 className="text-[28px] font-semibold text-[#000000] mb-[8px]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                Locations
              </h1>
              <p className="text-[14px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                Manage work and activity locations
              </p>
            </div>

            {/* Add Location Button */}
            <div className="mb-[20px] flex justify-end">
              <button
                onClick={() => setShowAddLocationPage(true)}
                className="px-[20px] py-[12px] text-white rounded-[5px] hover:opacity-90 transition-opacity flex items-center justify-center gap-[8px] border border-[#B5B1B1]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '14px', backgroundColor: '#0C8DFE', height: '46px', width: '205px' }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Add Location
              </button>
            </div>

            {/* Filter and Action Bar */}
            <div className="mb-[20px] flex items-center justify-start gap-[8px] flex-wrap">
              {/* Type Dropdown */}
              <div className="relative flex-shrink-0" ref={typeDropdownRef}>
                <button
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className="h-[44px] px-[16px] rounded-[10px] border border-[#E0E0E0] bg-white flex items-center justify-between"
                  style={{ minWidth: '240px' }}
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
                  <div className="absolute top-full left-0 mt-[8px] bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg min-w-[240px] z-50">
                    {typeOptions.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
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
                  style={{ minWidth: '240px' }}
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
                  <div className="absolute top-full left-0 mt-[8px] bg-white border border-[#E0E0E0] rounded-[10px] shadow-lg min-w-[240px] z-50">
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
            {selectedLocations.length > 0 && (
              <div className="mb-[20px] bg-white rounded-[10px] p-[16px] flex items-center gap-[16px]" style={{ boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div className="text-[14px] text-[#333333]" style={{ fontWeight: 500 }}>
                  {selectedLocations.length} selected
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
                          console.log('Delete selected', selectedLocations);
                          setLocationToDelete(selectedLocations);
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
                          console.log('Mark as reviewed', selectedLocations);
                          setSelectedLocations([]);
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
                          checked={selectedLocations.length === paginatedData.length && paginatedData.length > 0}
                          onChange={handleSelectAll}
                          className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                        />
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Location name
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Type
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Latitude
                      </th>
                      <th className="px-[12px] py-[12px] text-center text-[#6B7280] border-r border-[#E0E0E0]" style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '14px' }}>
                        Longitude
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
                    {paginatedData.map((location) => (
                      <tr key={location.id} className="border-b border-[#E0E0E0] hover:bg-[#F9FAFB]">
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <input
                            type="checkbox"
                            checked={selectedLocations.includes(location.id)}
                            onChange={() => handleCheckboxChange(location.id)}
                            className="w-[16px] h-[16px] rounded border-[#E0E0E0]"
                          />
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {location.name}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {location.type}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {location.latitude}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span className="text-[13px] text-[#333333]" style={{ fontWeight: 600 }}>
                            {location.longitude}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] border-r border-[#E0E0E0] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <span
                            className="inline-block px-[12px] py-[4px] rounded-[5px]"
                            style={{
                              fontWeight: 500,
                              fontSize: '13px',
                              lineHeight: '100%',
                              whiteSpace: 'nowrap',
                              color: location.status === 'Active' ? '#00564F' : '#4A4A4A',
                              backgroundColor: location.status === 'Active' ? '#68BFCCB2' : '#D2D2D2',
                              textAlign: 'center'
                            }}
                          >
                            {location.status}
                          </span>
                        </td>
                        <td className="px-[12px] py-[12px] text-center" style={{ whiteSpace: 'nowrap' }}>
                          <div className="flex items-center justify-center gap-0">
                            <button
                              onClick={() => {
                                setEditingLocation(location);
                                setShowEditLocationPage(true);
                              }}
                              className="w-[22px] h-[22px] flex items-center justify-center hover:opacity-70 transition-opacity"
                              title="Edit"
                            >
                              <img src={EditIcon} alt="Edit" className="w-full h-full object-contain" />
                            </button>
                            <div className="w-[1px] h-[22px] bg-[#E0E0E0] mx-[8px]"></div>
                            <button
                              onClick={() => {
                                setLocationToDelete(location);
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
            <div className="relative" ref={userDropdownRef}>
              <div
                className="flex items-center gap-[6px] cursor-pointer"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              >
                <img
                  src={UserAvatar}
                  alt="User"
                  className="w-[32px] h-[32px] rounded-full object-cover border-2 border-[#E5E7EB]"
                />
                <img
                  src={DropdownArrow}
                  alt=""
                  className={`w-[12px] h-[12px] object-contain transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[14px] z-50">
                  <div className="px-[16px] mb-[12px]">
                    <p className="text-[14px] font-semibold text-[#333333]">Firas!</p>
                    <p className="text-[12px] text-[#6B7280]">elijlafiras@gmail.com</p>
                  </div>
                  <button className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors">
                    Edit Profile
                  </button>
                  <div className="h-[1px] bg-[#DC2626] my-[8px]"></div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/login");
                    }}
                    className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#DC2626] font-medium hover:bg-red-50 transition-colors"
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
          {/* Title and Add Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[20px] font-semibold text-[#000000] mb-0">Locations</h1>
              <p className="text-[12px] text-[#6B7280]">Manage work and activity locations</p>
            </div>
            <button
              onClick={() => setShowAddLocationPage(true)}
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
            <div className="relative">
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
                      onClick={() => { setSelectedType(type); setIsTypeDropdownOpen(false); }}
                      className={`w-full px-[16px] py-[12px] text-left text-[14px] ${selectedType === type ? 'bg-[#F3F4F6] font-semibold' : 'hover:bg-[#F9FAFB]'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative">
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
                      onClick={() => { setSelectedStatus(status); setIsStatusDropdownOpen(false); }}
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
            {paginatedData.map((location) => (
              <div
                key={location.id}
                className="bg-white rounded-[12px] p-4 shadow-sm border border-[#E0E0E0]"
              >
                {/* Header with Actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-[40px] h-[40px] bg-[#F3F4F6] rounded-[8px] flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#004D40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#333333] mb-0.5">{location.name}</h3>
                      <p className="text-[12px] text-[#6B7280] font-medium">{location.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingLocation(location);
                        setShowEditLocationPage(true);
                      }}
                      className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
                      title="Edit"
                    >
                      <img src={EditIcon} alt="Edit" className="w-[16px] h-[16px] object-contain" />
                    </button>
                    <button
                      onClick={() => {
                        setLocationToDelete(location);
                        setShowWarningModal(true);
                      }}
                      className="w-[32px] h-[32px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
                      title="Delete"
                    >
                      <img src={DeleteIcon} alt="Delete" className="w-[16px] h-[16px] object-contain" />
                    </button>
                  </div>
                </div>

                {/* Badge Row */}
                <div className="mb-3">
                  <span
                    className="inline-block px-[12px] py-[4px] rounded-[6px] text-[12px] font-medium"
                    style={{
                      color: location.status === 'Active' ? '#00564F' : '#4A4A4A',
                      backgroundColor: location.status === 'Active' ? '#68BFCCB2' : '#D2D2D2',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {location.status}
                  </span>
                </div>

                {/* Location Details Grid */}
                <div className="space-y-2 pt-3 border-t border-[#F3F4F6]">
                  <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span className="font-semibold text-[#374151]">Latitude:</span> {location.latitude}
                  </p>
                  <p className="text-[12px] text-[#6B7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span className="font-semibold text-[#374151]">Longitude:</span> {location.longitude}
                  </p>
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
      </div>

      {/* Warning Modal (Shared) */}
      {showWarningModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowWarningModal(false);
            setLocationToDelete(null);
          }}
        >
          <div
            className="bg-white shadow-lg relative w-full max-w-[469px]"
            style={{
              minHeight: '290px',
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
                  color: '#B70B0B'
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
                  color: '#000000'
                }}
              >
                Are you Sure to delete {Array.isArray(locationToDelete) ? 'these Locations' : 'this Location'} ?
              </p>
            </div>

            {/* Sub-message */}
            <div className="text-center pb-[40px] px-[20px]">
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '10px',
                  color: '#4E4E4E'
                }}
              >
                This action can't be undone
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-[20px] px-[20px] pb-[30px] flex-wrap sm:flex-nowrap">
              <button
                onClick={() => {
                  if (locationToDelete) {
                    console.log('Deleting:', locationToDelete);
                    if (Array.isArray(locationToDelete)) {
                      setSelectedLocations([]);
                    }
                  }
                  setShowWarningModal(false);
                  setLocationToDelete(null);
                }}
                className="text-white focus:outline-none w-full sm:w-[144px] h-[34px] bg-[#A20000] border border-[#B5B1B1] font-semibold text-[16px] shadow-md transition-opacity hover:opacity-90"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  setLocationToDelete(null);
                }}
                className="text-white focus:outline-none w-full sm:w-[144px] h-[34px] bg-[#7A7A7A] border border-[#B5B1B1] font-semibold text-[16px] shadow-md transition-opacity hover:opacity-90"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {showAddLocationPage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white w-full max-w-[480px] rounded-[12px] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]">
              <h2 className="text-[20px] font-bold text-[#003934]" style={{ fontFamily: 'Inter, sans-serif' }}>Add New Location</h2>
              <button
                onClick={() => setShowAddLocationPage(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F5F7FA] transition-colors"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <form className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[14px] font-semibold text-[#181818]" style={{ fontFamily: 'Inter, sans-serif' }}>Location Name</label>
                <input
                  type="text"
                  placeholder="Enter Location Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-[42px] px-3 rounded-[8px] border border-[#E0E0E0] focus:border-[#003934] focus:ring-1 focus:ring-[#003934] outline-none text-[14px] transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[16px] font-semibold text-[#181818]" style={{ fontFamily: 'Inter, sans-serif' }}>Location Type</label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-[50px] px-4 rounded-[10px] border border-[#E0E0E0] focus:border-[#003934] outline-none text-[15px] appearance-none cursor-pointer bg-white"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="Office">Office</option>
                    <option value="Field">Field</option>
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] font-semibold text-[#181818]" style={{ fontFamily: 'Inter, sans-serif' }}>Latitude</label>
                <input
                  type="text"
                  placeholder="Enter Latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full h-[42px] px-3 rounded-[8px] border border-[#E0E0E0] focus:border-[#003934] outline-none text-[14px] transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] font-semibold text-[#181818]" style={{ fontFamily: 'Inter, sans-serif' }}>Longitude</label>
                <input
                  type="text"
                  placeholder="Enter Longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full h-[42px] px-3 rounded-[8px] border border-[#E0E0E0] focus:border-[#003934] outline-none text-[14px] transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div className="pt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddLocationPage(false)}
                  className="flex-1 h-[44px] rounded-[8px] border border-[#E0E0E0] text-[#6B7280] font-semibold text-[15px] hover:bg-[#F5F7FA] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => { e.preventDefault(); setShowAddLocationPage(false); }}
                  className="flex-1 h-[44px] rounded-[8px] bg-[#003934] text-white font-semibold text-[15px] hover:bg-[#002b27] transition-all shadow-md active:scale-[0.98]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {showEditLocationPage && editingLocation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white w-full max-w-[480px] rounded-[12px] overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0E0E0]">
              <h2 className="text-[20px] font-bold text-[#003934]" style={{ fontFamily: 'Inter, sans-serif' }}>Edit Location</h2>
              <button
                onClick={() => setShowEditLocationPage(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F5F7FA] transition-colors"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <form className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[14px] font-semibold text-[#181818]" style={{ fontFamily: 'Inter, sans-serif' }}>Location Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-[42px] px-3 rounded-[8px] border border-[#E0E0E0] focus:border-[#003934] outline-none text-[14px]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[16px] font-semibold text-[#181818]" style={{ fontFamily: 'Inter, sans-serif' }}>Location Type</label>
                <div className="relative">
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full h-[50px] px-4 rounded-[10px] border border-[#E0E0E0] focus:border-[#003934] outline-none text-[15px] appearance-none cursor-pointer bg-white"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <option value="Office">Office</option>
                    <option value="Field">Field</option>
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] font-semibold text-[#181818]" style={{ fontFamily: 'Inter, sans-serif' }}>Latitude</label>
                <input
                  type="text"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="w-full h-[42px] px-3 rounded-[8px] border border-[#E0E0E0] focus:border-[#003934] outline-none text-[14px]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[14px] font-semibold text-[#181818]" style={{ fontFamily: 'Inter, sans-serif' }}>Longitude</label>
                <input
                  type="text"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="w-full h-[42px] px-3 rounded-[8px] border border-[#E0E0E0] focus:border-[#003934] outline-none text-[14px]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div className="pt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLocationToDelete(editingLocation);
                    setShowWarningModal(true);
                  }}
                  className="px-4 h-[44px] rounded-[8px] bg-white text-[#B20A0A] font-normal text-[14px] hover:bg-red-50 transition-colors flex items-center justify-center"
                  style={{ fontFamily: 'Inter, sans-serif', border: '1px solid #B20A0A' }}
                >
                  Delete
                </button>
                <div className="flex-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditLocationPage(false)}
                    className="flex-1 h-[44px] rounded-[8px] border border-[#E0E0E0] text-[#6B7280] font-semibold text-[15px] hover:bg-[#F5F7FA] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => { e.preventDefault(); setShowEditLocationPage(false); }}
                    className="flex-1 h-[44px] rounded-[8px] bg-[#003934] text-white font-semibold text-[15px] hover:bg-[#002b27] transition-all shadow-md active:scale-[0.98]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Update
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsPage;

