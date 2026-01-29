import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4b2785c.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Action icons
const ViewIcon = new URL("../images/icons/eyewhite.png", import.meta.url).href;
const EditIcon = new URL("../images/icons/edit6.png", import.meta.url).href;
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;
const WarningIcon = new URL("../images/icons/warnning.png", import.meta.url).href;


const LocationActivitiesPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const { locationName } = useParams();
  const [activeMenu, setActiveMenu] = useState("5-3");
  const [showEditPage, setShowEditPage] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    activityName: "",
    location: "",
    selectedEmployees: [],
    numberOfDays: 1,
    activityDates: [""]
  });

  // Role display names
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  // Sample activities data
  const activitiesData = {
    "Gaza Office": [
      {
        id: 1,
        name: "Team Building Workshop",
        employeeCount: 10,
        startDate: "12/14/2025",
        endDate: "12/16/2024",
        status: "Active",
        canEdit: false
      },
      {
        id: 2,
        name: "Safety Training",
        employeeCount: 5,
        startDate: "12/19/2025",
        endDate: "12/25/2025",
        status: "Active",
        canEdit: true
      }
    ],
    "Field Site A": [
      {
        id: 3,
        name: "Field Operations Training",
        employeeCount: 8,
        startDate: "12/21/2025",
        endDate: "12/23/2025",
        status: "Active",
        canEdit: true
      }
    ],
    "Training Center": []
  };

  const decodedLocationName = locationName ? decodeURIComponent(locationName) : "";
  const activities = activitiesData[decodedLocationName] || [];

  // Sample employees data
  const employeesData = [
    { id: 1, name: "Mohamed Ali", role: "Office • Data Entry" },
    { id: 2, name: "Amal Ahmed", role: "Field Operation • Trainer" },
    { id: 3, name: "Amjad Saeed", role: "HR • HR Manager" }
  ];

  // Sample locations for dropdown
  const locationsList = ["Gaza Office", "Field Site A", "Training Center"];

  // Handle employee checkbox
  const handleEmployeeCheckboxChange = (employeeId) => {
    setEditFormData(prev => ({
      ...prev,
      selectedEmployees: prev.selectedEmployees.includes(employeeId)
        ? prev.selectedEmployees.filter(id => id !== employeeId)
        : [...prev.selectedEmployees, employeeId]
    }));
  };

  // Handle delete date
  const handleDeleteDate = (index) => {
    const newDates = [...editFormData.activityDates];
    newDates.splice(index, 1);
    setEditFormData(prev => ({
      ...prev,
      activityDates: newDates,
      numberOfDays: newDates.length
    }));
  };

  // Handle edit button click
  const handleEditClick = (activity) => {
    setSelectedActivity(activity);
    // Convert dates from "mm/dd/yyyy" to "yyyy-mm-dd" format for date input
    const convertDate = (dateStr) => {
      if (!dateStr) return "";
      const [month, day, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };
    const startDate = convertDate(activity.startDate);
    const endDate = convertDate(activity.endDate);
    const dates = [];
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const current = new Date(start);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    }
    
    setEditFormData({
      activityName: activity.name,
      location: decodedLocationName,
      selectedEmployees: [1, 2, 3], // Default selected employees
      numberOfDays: dates.length || 1,
      activityDates: dates.length > 0 ? dates : [""]
    });
    setShowEditPage(true);
  };

  // Edit Activity Page Component
  if (showEditPage && selectedActivity) {
    return (
      <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
        <style>{`
          select option:checked {
            background-color: #E5E7EB !important;
            color: #000000 !important;
          }
          select option:hover {
            background-color: #F5F7FA;
          }
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
        {/* Desktop Layout */}
        <div className="hidden lg:flex min-h-screen" style={{ overflowX: 'hidden' }}>
          <Sidebar 
            userRole={userRole}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
          />

          <main className="flex-1 flex flex-col bg-[#F5F7FA]">
            <header className="h-[115px] bg-white flex items-center justify-between px-[40px]">
              <div className="relative">
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
              
              <div className="flex items-center gap-[16px]">
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
            </header>

            <div className="flex-1 p-[36px] overflow-y-auto bg-[#F5F7FA]" style={{ overflowX: 'hidden' }}>
              <div className="max-w-[700px] mx-auto">
                <div className="flex items-center justify-between mb-[56px]">
                  <h1 
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 600, 
                      fontSize: '28px', 
                      lineHeight: '100%', 
                      letterSpacing: '0%',
                      color: '#003934',
                      textAlign: 'left'
                    }}
                  >
                    Edit {selectedActivity.name}
                  </h1>
                  <button
                    type="button"
                    onClick={() => setShowWarningModal(true)}
                    className="w-[40px] h-[40px] rounded-[8px] border border-[#E0E0E0] bg-white flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
                    style={{ flexShrink: 0 }}
                  >
                    <img src={DeleteIcon} alt="Delete" className="w-[20px] h-[20px] object-contain" />
                  </button>
                </div>

                <form>
                  <div className="space-y-[32px]">
                    {/* Activity Name */}
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
                        Activity Name
                      </label>
                      <input 
                        type="text"
                        value={editFormData.activityName}
                        onChange={(e) => setEditFormData({ ...editFormData, activityName: e.target.value })}
                        placeholder="Enter Activity Name"
                        className="focus:outline-none bg-white"
                        style={{ 
                          height: '26px',
                          padding: '0 12px',
                          borderRadius: '4px',
                          border: '0.8px solid #939393',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#000000',
                          width: '470px',
                          maxWidth: '470px'
                        }}
                      />
                    </div>

                    {/* Location */}
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
                        Location
                      </label>
                      <div className="relative" style={{ width: '470px', maxWidth: '470px', overflow: 'hidden' }}>
                        <select 
                          value={editFormData.location}
                          onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                          className="focus:outline-none bg-white appearance-none cursor-pointer"
                          style={{ 
                            height: '26px',
                            padding: '0 12px',
                            paddingRight: '32px',
                            borderRadius: '4px',
                            border: '0.8px solid #939393',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            color: editFormData.location ? '#000000' : '#454545',
                            width: '100%',
                            maxWidth: '100%'
                          }}
                        >
                          <option value="" disabled style={{ color: '#454545' }}>Select Location</option>
                          {locationsList.map((location) => (
                            <option key={location} value={location} style={{ color: '#727272' }}>{location}</option>
                          ))}
                        </select>
                        <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Assign Employee */}
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
                        Assign Employee
                      </label>
                      <div 
                        className="bg-white border border-[#939393] rounded-[4px]"
                        style={{ 
                          width: '470px',
                          maxWidth: '470px',
                          height: '200px',
                          overflowY: 'auto',
                          overflowX: 'hidden'
                        }}
                      >
                        <div className="p-[12px] space-y-[12px]">
                          {employeesData.map((employee) => (
                            <div key={employee.id} className="flex items-center gap-[12px]">
                              <input 
                                type="checkbox"
                                checked={editFormData.selectedEmployees.includes(employee.id)}
                                onChange={() => handleEmployeeCheckboxChange(employee.id)}
                                className="w-[16px] h-[16px] rounded border-[#E0E0E0] flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div 
                                  style={{ 
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    color: '#000000',
                                    marginBottom: '2px'
                                  }}
                                >
                                  {employee.name}
                                </div>
                                <div 
                                  style={{ 
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '12px',
                                    fontWeight: 400,
                                    color: '#6B7280'
                                  }}
                                >
                                  {employee.role}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div 
                        className="mt-[8px]"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: 400,
                          color: '#6B7280'
                        }}
                      >
                        {editFormData.selectedEmployees.length} employee(s) selected
                      </div>
                    </div>

                    {/* Number of Activity Days */}
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
                        Number of Activity Days
                      </label>
                      <div className="relative" style={{ width: '470px', maxWidth: '470px', overflow: 'hidden' }}>
                        <select 
                          value={editFormData.numberOfDays}
                          onChange={(e) => {
                            const days = parseInt(e.target.value);
                            const currentDates = [...editFormData.activityDates];
                            if (days > currentDates.length) {
                              // Add empty dates
                              const newDates = [...currentDates, ...Array.from({ length: days - currentDates.length }, () => "")];
                              setEditFormData({ ...editFormData, numberOfDays: days, activityDates: newDates });
                            } else if (days < currentDates.length) {
                              // Remove dates from end
                              const newDates = currentDates.slice(0, days);
                              setEditFormData({ ...editFormData, numberOfDays: days, activityDates: newDates });
                            } else {
                              setEditFormData({ ...editFormData, numberOfDays: days });
                            }
                          }}
                          className="focus:outline-none bg-white appearance-none cursor-pointer"
                          style={{ 
                            height: '26px',
                            padding: '0 12px',
                            paddingRight: '32px',
                            borderRadius: '4px',
                            border: '0.8px solid #939393',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            color: '#000000',
                            width: '100%',
                            maxWidth: '100%'
                          }}
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                            <option key={day} value={day} style={{ color: '#727272' }}>
                              {day} {day === 1 ? 'day' : 'days'}
                            </option>
                          ))}
                        </select>
                        <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Activity Dates */}
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
                        Activity Dates
                      </label>
                      <div className="space-y-[12px]">
                        {editFormData.activityDates.map((date, index) => (
                          <div key={index} className="flex flex-col">
                            <label 
                              style={{ 
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#181818',
                                marginBottom: '8px'
                              }}
                            >
                              Day {index + 1}
                            </label>
                            <div className="relative" style={{ width: '470px', maxWidth: '470px' }}>
                              <input 
                                type="date"
                                data-date-index={index}
                                value={date}
                                onChange={(e) => {
                                  const newDates = [...editFormData.activityDates];
                                  newDates[index] = e.target.value;
                                  setEditFormData({ ...editFormData, activityDates: newDates });
                                }}
                                className="focus:outline-none bg-white"
                                style={{ 
                                  height: '26px',
                                  padding: '0 12px',
                                  paddingRight: '80px',
                                  borderRadius: '4px',
                                  border: '0.8px solid #939393',
                                  fontFamily: 'Inter, sans-serif',
                                  fontSize: '14px',
                                  color: '#000000',
                                  width: '100%',
                                  cursor: 'pointer'
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
                                className="absolute right-[40px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity z-10"
                              >
                                <svg className="w-[16px] h-[16px] text-[#939393]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDate(index)}
                                className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity z-10"
                              >
                                <img src={DeleteIcon} alt="Delete" className="w-[16px] h-[16px] object-contain" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-start gap-[20px] mt-[40px]" style={{ marginLeft: '60px' }}>
                    <button
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Update activity:', editFormData);
                        setShowEditPage(false);
                      }}
                      className="text-white focus:outline-none"
                      style={{ 
                        width: '170px',
                        height: '34px',
                        borderRadius: '5px',
                        backgroundColor: '#00564F',
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
                    <button
                      type="button"
                      onClick={() => setShowEditPage(false)}
                      className="text-white focus:outline-none"
                      style={{ 
                        width: '164px',
                        height: '34px',
                        borderRadius: '5px',
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
                </form>
              </div>
            </div>
          </main>
        </div>

        {/* Warning Modal */}
        {showWarningModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setShowWarningModal(false);
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
                  Are you Sure to delete this Activity?
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
                    if (selectedActivity) {
                      console.log('Deleting activity:', selectedActivity);
                      setShowEditPage(false);
                      setSelectedActivity(null);
                    }
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
  }

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
                <span style={{ color: '#B0B0B0' }}>Locations Management</span>
                <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
                <span style={{ color: '#B0B0B0' }}>Location Assignment</span>
                <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
                <span style={{ color: '#8E8C8C' }}>Activities</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            {/* Page Header */}
            <div className="mb-[24px] pb-[16px] border-b border-[#E0E0E0]">
              <h1 
                className="text-[28px] font-semibold mb-[4px]"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  color: '#003934'
                }}
              >
                Activities at {decodedLocationName}
              </h1>
              <p 
                className="text-[14px]"
                style={{ 
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  color: '#6B7280'
                }}
              >
                {activities.length} activities found
              </p>
            </div>

            {/* Activities List */}
            {activities.length > 0 ? (
              <div className="space-y-[16px]">
                {activities.map((activity) => {
                  const isPastEndDate = new Date(activity.endDate) < new Date();
                  return (
                    <div 
                      key={activity.id}
                      className="bg-white border border-[#E0E0E0] rounded-[10px] p-[20px] relative"
                    >
                      {/* Status Badge */}
                      <div 
                        className="absolute top-[20px] right-[20px] px-[12px] py-[4px] rounded-[5px]"
                        style={{
                          backgroundColor: '#68BFCCB2',
                          color: '#00564F',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '13px',
                          fontWeight: 500,
                          lineHeight: '100%'
                        }}
                      >
                        {activity.status}
                      </div>

                      {/* Activity Title */}
                      <h3 
                        className="text-[16px] font-medium mb-[12px] pr-[80px]"
                        style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          color: '#181818'
                        }}
                      >
                        {activity.name}
                      </h3>

                      {/* Activity Details */}
                      <div className="flex items-center gap-[16px] mb-[16px]">
                        <div className="flex items-center gap-[6px]">
                          <svg className="w-[16px] h-[16px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span 
                            className="text-[10px]"
                            style={{ 
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 400,
                              color: '#636363'
                            }}
                          >
                            {activity.employeeCount} employees
                          </span>
                        </div>
                        <div className="flex items-center gap-[6px]">
                          <svg className="w-[16px] h-[16px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span 
                            className="text-[10px]"
                            style={{ 
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 400,
                              color: '#636363'
                            }}
                          >
                            {activity.startDate} - {activity.endDate}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-[12px] mb-[8px]">
                        <button
                          onClick={() => {
                            navigate(`/locations/assignment/activities/${encodeURIComponent(decodedLocationName)}/employees/${encodeURIComponent(activity.name)}`);
                          }}
                          className="px-[16px] py-[6px] rounded-[5px] flex items-center gap-[8px] hover:opacity-90 transition-opacity"
                          style={{
                            backgroundColor: '#009084',
                            color: '#FFFFFF',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            height: '27px'
                          }}
                        >
                          <img src={ViewIcon} alt="View" className="w-[16px] h-[16px] object-contain" />
                          View Employees
                        </button>
                        <button
                          disabled={!activity.canEdit || isPastEndDate}
                          onClick={() => !activity.canEdit || isPastEndDate ? null : handleEditClick(activity)}
                          className={`px-[16px] py-[6px] rounded-[5px] flex items-center gap-[8px] transition-opacity ${
                            !activity.canEdit || isPastEndDate ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'
                          }`}
                          style={{
                            backgroundColor: '#AEAEAEB2',
                            color: (!activity.canEdit || isPastEndDate) ? '#939292' : '#444444',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            fontWeight: 500,
                            height: '27px'
                          }}
                        >
                          <img src={EditIcon} alt="Edit" className="w-[16px] h-[16px] object-contain" />
                          Edit Activity
                        </button>
                      </div>

                      {/* Warning Message */}
                      {isPastEndDate && (
                        <p 
                          className="text-[12px] mt-[4px]"
                          style={{ 
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            color: '#6B7280'
                          }}
                        >
                          This activity cannot be edited as the end date has passed
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-[#E0E0E0] rounded-[10px] p-[40px] text-center">
                <p 
                  className="text-[14px]"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: '#6B7280'
                  }}
                >
                  No activities found for this location
                </p>
              </div>
            )}

            {/* Close Button */}
            <div className="mt-[32px] flex justify-end">
              <button
                onClick={() => navigate("/locations/assignment")}
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

export default LocationActivitiesPage;