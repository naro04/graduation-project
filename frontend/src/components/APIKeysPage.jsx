import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Icons
const EyeIcon = new URL("../images/icons/eye.png", import.meta.url).href;
const BlindIcon = new URL("../images/icons/blind.png", import.meta.url).href;
const WarningIcon = new URL("../images/icons/warnning (2).png", import.meta.url).href;
const ReloadIcon = new URL("../images/icons/reload.png", import.meta.url).href;
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;

import LogoutModal from "./LogoutModal";
// Logout icon for modal
// const LogoutIcon2 = new URL("../images/icons/logout2.png", import.meta.url).href;

const roleDisplayNames = {
  superAdmin: "Super Admin",
  hr: "HR Manager",
  manager: "Manager",
  fieldEmployee: "Field Employee",
  officer: "Officer"
};

const APIKeysPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("8-4");
  const [visibleKeys, setVisibleKeys] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const itemsPerPage = 5;
  const userDropdownRef = useRef(null);
  const desktopDropdownRef = useRef(null);

  // Sample API Keys Data
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      keyName: "Production API",
      apiKey: "sk_live_5123456789abcdefghij",
      permissions: ["Read", "Write"],
      createdDate: "Dec 10, 2024",
      status: "Active"
    },
    {
      id: 2,
      keyName: "Mobile App Integration",
      apiKey: "sk_live_9876543210fedcba",
      permissions: ["Read Only"],
      createdDate: "Nov 25, 2024",
      status: "Active"
    },
    {
      id: 3,
      keyName: "Testing Environment",
      apiKey: "sk_test_abcdefghij1234567890",
      permissions: ["Read", "Write", "Delete"],
      createdDate: "Oct 15, 2024",
      status: "Revoked"
    },
    {
      id: 4,
      keyName: "Production API",
      apiKey: "sk_live_5123456789abcdefghij",
      permissions: ["Read", "Write"],
      createdDate: "Dec 10, 2024",
      status: "Active"
    },
    {
      id: 5,
      keyName: "Production API",
      apiKey: "sk_live_5123456789abcdefghij",
      permissions: ["Read", "Write"],
      createdDate: "Dec 10, 2024",
      status: "Active"
    },
    {
      id: 6,
      keyName: "Development API",
      apiKey: "sk_dev_1234567890abcdefghij",
      permissions: ["Read", "Write", "Delete"],
      createdDate: "Sep 20, 2024",
      status: "Active"
    },
    {
      id: 7,
      keyName: "Analytics Integration",
      apiKey: "sk_live_analytics123456789",
      permissions: ["Read Only"],
      createdDate: "Aug 5, 2024",
      status: "Active"
    }
  ]);

  const toggleKeyVisibility = (id) => {
    setVisibleKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
    alert("API Key copied to clipboard!");
  };

  const maskApiKey = (key) => {
    if (key.length <= 12) return key;
    return key.substring(0, 12) + "•".repeat(12);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this API key?")) {
      setApiKeys(apiKeys.filter(key => key.id !== id));
    }
  };

  const handleGenerateNew = () => {
    // Generate new API key logic here
    const newKey = {
      id: apiKeys.length + 1,
      keyName: `New API Key ${apiKeys.length + 1}`,
      apiKey: `sk_live_${Math.random().toString(36).substring(2, 22)}`,
      permissions: ["Read", "Write"],
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: "Active"
    };
    setApiKeys([newKey, ...apiKeys]);
  };

  // Pagination
  const actualTotalPages = Math.ceil(apiKeys.length / itemsPerPage) || 1;
  const totalPages = Math.max(3, actualTotalPages);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentKeys = apiKeys.slice(startIndex, endIndex);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target)) {
        setIsDesktopDropdownOpen(false);
      }
    };

    if (isUserDropdownOpen || isDesktopDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserDropdownOpen, isDesktopDropdownOpen]);

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen" style={{ overflowX: 'hidden' }}>
        <Sidebar userRole={userRole} activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogoutClick={() => setIsLogoutModalOpen(true)} />

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
              {/* Message Icon */}
              <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                <img src={MessageIcon} alt="Messages" className="w-[20px] h-[20px] object-contain" />
              </button>

              {/* Notification Bell */}
              <button className="relative w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                <img src={NotificationIcon} alt="Notifications" className="w-[20px] h-[20px] object-contain" />
                <span className="absolute top-[4px] right-[4px] w-[8px] h-[8px] bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Profile */}
                <div className="relative" ref={desktopDropdownRef}>
                  <div
                    className="flex items-center gap-[12px] cursor-pointer"
                    onClick={() => setIsDesktopDropdownOpen(!isDesktopDropdownOpen)}
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
                          className={`w-[14px] h-[14px] object-contain transition-transform duration-200 mt-[2px] ${isDesktopDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <p className="text-[12px] font-normal text-[#6B7280]">{roleDisplayNames[userRole]}</p>
                    </div>
                  </div>

                  {/* Dropdown Menu */}
                  {isDesktopDropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50"
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="px-[16px] py-[8px]">
                        <p className="text-[12px] text-[#6B7280]">elijlafiras@gmail.com</p>
                      </div>
                      <button className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors">
                        Edit Profile
                      </button>
                      <div className="h-[1px] bg-[#DC2626] my-[4px]"></div>
                      <button
                        onClick={() => setIsLogoutModalOpen(true)}
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
              <span style={{ color: '#B0B0B0' }}>More</span>
              <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
              <span style={{ color: '#8E8C8C' }}>API Keys</span>
            </p>
          </div>
        </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
            {/* Page Header */}
            <div className="mb-[32px]" style={{ minWidth: 0, maxWidth: '100%' }}>
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
                API Keys
              </h1>
              <p 
                style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  fontWeight: 400, 
                  fontSize: '14px',
                  lineHeight: '100%', 
                  letterSpacing: '0%',
                  color: '#505050'
                }}
              >
                Manage API keys for integrations and third-party access
              </p>
            </div>

            {/* Important Warning */}
            <div 
              className="mb-[24px] p-[16px] rounded-[8px]"
              style={{ 
                backgroundColor: '#FFDEDE'
              }}
            >
              <div className="flex items-start gap-[12px]">
                <img src={WarningIcon} alt="Warning" className="w-[20px] h-[20px] flex-shrink-0 mt-[2px]" />
                <div>
                  <p 
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 600, 
                      fontSize: '14px', 
                      color: '#803A04',
                      marginBottom: '4px',
                      lineHeight: '100%'
                    }}
                  >
                    Important
                  </p>
                  <p 
                    style={{ 
                      fontFamily: 'Inter, sans-serif', 
                      fontWeight: 300, 
                      fontSize: '12px', 
                      color: '#803A04',
                      lineHeight: '140%'
                    }}
                  >
                    Keep your API keys secure and never share them publicly. API keys provide access to sensitive data and system<br />
                    operations.
                  </p>
                </div>
              </div>
            </div>

            {/* Generate New API Key Button */}
            <div className="mb-[32px]">
              <button
                onClick={handleGenerateNew}
                className="flex items-center gap-[8px] px-[20px] py-[12px] rounded-[8px] text-white transition-colors"
                style={{ 
                  fontFamily: 'Inter, sans-serif', 
                  fontWeight: 500, 
                  fontSize: '14px',
                  lineHeight: '100%',
                  backgroundColor: '#0C8DFE',
                  hover: { backgroundColor: '#0A7AE6' }
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0A7AE6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#0C8DFE'}
              >
                <svg className="w-[20px] h-[20px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Generate New API Key
              </button>
            </div>

            {/* API Keys Table Section */}
            <div 
              className="bg-white rounded-[12px] border border-[#B3B3B3] api-keys-white-container"
              style={{
                overflow: 'visible',
                overflowY: 'visible',
                overflowX: 'visible',
                maxHeight: 'none',
                height: 'auto'
              }}
            >
              <div className="p-[24px] border-b border-[#E0E0E0]">
                <h2 
                  style={{ 
                    fontFamily: 'Inter, sans-serif', 
                    fontWeight: 600, 
                    fontSize: '18px', 
                    color: '#000000',
                    lineHeight: '100%'
                  }}
                >
                  Your API Keys
                </h2>
              </div>

              {/* Table */}
              <div style={{ overflow: 'visible', overflowY: 'visible' }}>
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-[#E0E0E0]">
                      <th 
                        className="text-left p-[16px]"
                        style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          fontWeight: 600, 
                          fontSize: '12px', 
                          color: '#6B7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderRight: '1px solid #E0E0E0'
                        }}
                      >
                        KEY NAME
                      </th>
                      <th 
                        className="text-left p-[16px]"
                        style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          fontWeight: 600, 
                          fontSize: '12px', 
                          color: '#6B7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderRight: '1px solid #E0E0E0'
                        }}
                      >
                        API KEY
                      </th>
                      <th 
                        className="text-left p-[16px]"
                        style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          fontWeight: 600, 
                          fontSize: '12px', 
                          color: '#6B7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderRight: '1px solid #E0E0E0'
                        }}
                      >
                        PERMISSIONS
                      </th>
                      <th 
                        className="text-left p-[16px]"
                        style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          fontWeight: 600, 
                          fontSize: '12px', 
                          color: '#6B7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderRight: '1px solid #E0E0E0'
                        }}
                      >
                        CREATED DATE
                      </th>
                      <th 
                        className="text-left p-[16px]"
                        style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          fontWeight: 600, 
                          fontSize: '12px', 
                          color: '#6B7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          borderRight: '1px solid #E0E0E0'
                        }}
                      >
                        STATUS
                      </th>
                      <th 
                        className="text-left p-[16px]"
                        style={{ 
                          fontFamily: 'Inter, sans-serif', 
                          fontWeight: 600, 
                          fontSize: '12px', 
                          color: '#6B7280',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentKeys.map((key) => (
                      <tr key={key.id} className="border-b border-[#E0E0E0] hover:bg-[#F9FAFB] transition-colors">
                        <td className="p-[16px]" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <p 
                            style={{ 
                              fontFamily: 'Inter, sans-serif', 
                              fontWeight: 500, 
                              fontSize: '14px', 
                              color: '#333333'
                            }}
                          >
                            {key.keyName}
                          </p>
                        </td>
                        <td className="p-[16px]" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <div className="flex items-center gap-[8px]">
                            <span 
                              style={{ 
                                fontFamily: 'monospace', 
                                fontWeight: 400, 
                                fontSize: '14px', 
                                color: '#333333'
                              }}
                            >
                              {visibleKeys[key.id] ? key.apiKey : maskApiKey(key.apiKey)}
                            </span>
                            <button
                              onClick={() => toggleKeyVisibility(key.id)}
                              className="w-[20px] h-[20px] flex items-center justify-center hover:opacity-70 transition-opacity"
                            >
                              <img 
                                src={visibleKeys[key.id] ? BlindIcon : EyeIcon} 
                                alt={visibleKeys[key.id] ? "Hide" : "Show"} 
                                className="w-[16px] h-[16px]"
                              />
                            </button>
                            <button
                              onClick={() => copyToClipboard(key.apiKey)}
                              className="w-[20px] h-[20px] flex items-center justify-center hover:opacity-70 transition-opacity"
                              title="Copy to clipboard"
                            >
                              <svg className="w-[16px] h-[16px] text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="p-[16px]" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <p 
                            style={{ 
                              fontFamily: 'Inter, sans-serif', 
                              fontWeight: 400, 
                              fontSize: '14px', 
                              color: '#333333'
                            }}
                          >
                            {key.permissions.join(", ")}
                          </p>
                        </td>
                        <td className="p-[16px]" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <p 
                            style={{ 
                              fontFamily: 'Inter, sans-serif', 
                              fontWeight: 400, 
                              fontSize: '14px', 
                              color: '#333333'
                            }}
                          >
                            {key.createdDate}
                          </p>
                        </td>
                        <td className="p-[16px]" style={{ borderRight: '1px solid #E0E0E0' }}>
                          <span
                            className="inline-block px-[12px] py-[4px] rounded text-[12px] font-medium text-center"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              backgroundColor: key.status === "Active" ? "#68BFCC" : "#FFBDB6B2",
                              color: key.status === "Active" ? "#00564F" : "#830000",
                              minWidth: '80px',
                              display: 'inline-block'
                            }}
                          >
                            {key.status}
                          </span>
                        </td>
                        <td className="p-[16px]">
                          <div className="flex items-center justify-center gap-0">
                            <button
                              onClick={() => {
                                // Handle reload action
                                console.log("Reload API key:", key.id);
                              }}
                              className="w-[26px] h-[26px] flex items-center justify-center hover:opacity-70 transition-opacity"
                              style={{ borderRight: '1px solid #6B7280', paddingRight: '8px', marginRight: '8px' }}
                              title="Reload"
                            >
                              <img src={ReloadIcon} alt="Reload" className="w-full h-full object-contain" />
                            </button>
                            <button
                              onClick={() => handleDelete(key.id)}
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
            {apiKeys.length > 0 && (
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
                    onClick={() => setIsLogoutModalOpen(true)}
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
            onLogoutClick={() => setIsLogoutModalOpen(true)}
          />
        </div>

        {/* Mobile Content */}
        <div className="flex-1 p-4 pb-10">
          {/* Page Header */}
          <div className="mb-6">
            <h1
              className="mb-2"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: '100%',
                color: '#000000'
              }}
            >
              API Keys
            </h1>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '140%',
                color: '#505050'
              }}
            >
              Manage API keys for integrations and third-party access
            </p>
          </div>

          {/* Important Warning - Mobile */}
          <div
            className="mb-4 p-4 rounded-[8px]"
            style={{
              backgroundColor: '#FFDEDE'
            }}
          >
            <div className="flex items-start gap-3">
              <img src={WarningIcon} alt="Warning" className="w-[18px] h-[18px] flex-shrink-0 mt-[2px]" />
              <div>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: '#803A04',
                    marginBottom: '4px',
                    lineHeight: '100%'
                  }}
                >
                  Important
                </p>
                <p
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 300,
                    fontSize: '11px',
                    color: '#803A04',
                    lineHeight: '140%'
                  }}
                >
                  Keep your API keys secure and never share them publicly. API keys provide access to sensitive data and system operations.
                </p>
              </div>
            </div>
          </div>

          {/* Generate New API Key Button - Mobile */}
          <div className="mb-6">
            <button
              onClick={handleGenerateNew}
              className="flex items-center gap-2 px-5 py-3 rounded-[8px] text-white transition-colors w-full justify-center"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: '14px',
                backgroundColor: '#0C8DFE'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0A7AE6'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#0C8DFE'}
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate New API Key
            </button>
          </div>

          {/* API Keys Cards - Mobile */}
          <div className="space-y-4 mb-6">
            {currentKeys.map((key) => (
              <div key={key.id} className="bg-white rounded-[12px] p-4 border" style={{ borderColor: '#B3B3B3' }}>
                {/* Key Name and Status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#333333',
                        marginBottom: '4px'
                      }}
                    >
                      {key.keyName}
                    </h3>
                    <span
                      className="inline-block px-3 py-1 rounded text-[11px] font-medium"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        backgroundColor: key.status === "Active" ? "#68BFCC" : "#FFBDB6B2",
                        color: key.status === "Active" ? "#00564F" : "#830000"
                      }}
                    >
                      {key.status}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        console.log("Reload API key:", key.id);
                      }}
                      className="w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity"
                      title="Reload"
                    >
                      <img src={ReloadIcon} alt="Reload" className="w-[18px] h-[18px] object-contain" />
                    </button>
                    <button
                      onClick={() => handleDelete(key.id)}
                      className="w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity"
                      title="Delete"
                    >
                      <img src={DeleteIcon} alt="Delete" className="w-[18px] h-[18px] object-contain" />
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-b border-[#E0E0E0] my-3"></div>

                {/* API Key */}
                <div className="mb-3">
                  <p
                    className="mb-2"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
                      color: '#6B7280'
                    }}
                  >
                    API Key
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="flex-1 break-all"
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#333333'
                      }}
                    >
                      {visibleKeys[key.id] ? key.apiKey : maskApiKey(key.apiKey)}
                    </span>
                    <button
                      onClick={() => toggleKeyVisibility(key.id)}
                      className="w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
                    >
                      <img
                        src={visibleKeys[key.id] ? BlindIcon : EyeIcon}
                        alt={visibleKeys[key.id] ? "Hide" : "Show"}
                        className="w-[18px] h-[18px]"
                      />
                    </button>
                    <button
                      onClick={() => copyToClipboard(key.apiKey)}
                      className="w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
                      title="Copy to clipboard"
                    >
                      <svg className="w-[18px] h-[18px] text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-3">
                  <p
                    className="mb-2"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
                      color: '#6B7280'
                    }}
                  >
                    Permissions
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#333333'
                    }}
                  >
                    {key.permissions.join(", ")}
                  </p>
                </div>

                {/* Created Date */}
                <div>
                  <p
                    className="mb-2"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '12px',
                      color: '#6B7280'
                    }}
                  >
                    Created Date
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '12px',
                      color: '#333333'
                    }}
                  >
                    {key.createdDate}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - Mobile */}
          {apiKeys.length > 0 && (
            <div className="flex items-center justify-center gap-2">
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
                    fontSize: '12px',
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
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          window.location.href = "/login";
        }}
      />
    </div>
  );
};


export default APIKeysPage;

