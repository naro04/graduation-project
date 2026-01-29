import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

// User Avatar
const UserAvatar = new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href;

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Support icons
const EmailIcon = new URL("../images/icons/email (2).png", import.meta.url).href;
const MessageSupportIcon = new URL("../images/icons/message.png", import.meta.url).href;
const HelpIcon = new URL("../images/icons/help.png", import.meta.url).href;

// Other icons
const ClockIcon = new URL("../images/icons/time.png", import.meta.url).href;
const CheckIcon = new URL("../images/icons/verified.png", import.meta.url).href;
const UploadIcon = new URL("../images/icons/upload.png", import.meta.url).href;

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

const SupportPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("8-6");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const userDropdownRef = useRef(null);
  const desktopDropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    message: "",
    file: null
  });

  // Close dropdowns when clicking outside
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
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserDropdownOpen, isDesktopDropdownOpen]);

  const recentTickets = [
    {
      id: "TICK-1234",
      title: "GPS tracking not working",
      date: "Dec 22, 2024",
      status: "In Progress"
    },
    {
      id: "TICK-1198",
      title: "Cannot export attendance report",
      date: "Dec 18, 2024",
      status: "Resolved"
    },
    {
      id: "TICK-1165",
      title: "Leave balance not updating",
      date: "Dec 15, 2024",
      status: "Resolved"
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Ticket submitted successfully!");
    setFormData({
      subject: "",
      category: "",
      message: "",
      file: null
    });
  };

  const handleClear = () => {
    setFormData({
      subject: "",
      category: "",
      message: "",
      file: null
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <style>{`
        select option:checked,
        select option:hover {
          background-color: #E5E7EB !important;
        }
        select option {
          background-color: white;
        }
      `}</style>
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
                <span style={{ color: '#8E8C8C' }}>Support</span>
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
                Support
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
                Get help and support from our team
              </p>
            </div>

            {/* Top Three Cards */}
            <div className="grid grid-cols-3 gap-[24px] mb-[48px]">
              {/* Contact Support Card */}
              <div
                className="bg-white rounded-[12px] border p-[24px] cursor-pointer transition-all hover:shadow-md flex flex-col h-full"
                style={{
                  borderColor: '#E0E0E0',
                  borderWidth: '1px'
                }}
              >
                <div className="flex items-start gap-[16px] mb-[16px]">
                  <div
                    className="w-[48px] h-[48px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: '#BCDEDC80'
                    }}
                  >
                    <img src={EmailIcon} alt="Email" className="w-[24px] h-[24px] object-contain" />
                  </div>
                  <div className="flex-1">
                    <h3
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        color: '#000000',
                        marginBottom: '8px'
                      }}
                    >
                      Contact Support
                    </h3>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '140%',
                        letterSpacing: '0%',
                        color: '#505050',
                        marginBottom: '12px'
                      }}
                    >
                      Get in touch with our support team via email
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        color: '#505050',
                        marginBottom: '16px'
                      }}
                    >
                      support@hrfieldactivity.com
                    </p>
                  </div>
                </div>
                <button
                  className="w-full px-[16px] py-[10px] rounded-[8px] border transition-colors mt-auto"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '100%',
                    backgroundColor: 'white',
                    borderColor: '#E0E0E0',
                    color: '#000000'
                  }}
                >
                  Email Us
                </button>
              </div>

              {/* Submit a Ticket Card */}
              <div
                className="bg-white rounded-[12px] border p-[24px] cursor-pointer transition-all hover:shadow-md flex flex-col h-full"
                style={{
                  borderColor: '#E0E0E0',
                  borderWidth: '1px'
                }}
              >
                <div className="flex items-start gap-[16px] mb-[16px]">
                  <div
                    className="w-[48px] h-[48px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: '#BCDEDC80'
                    }}
                  >
                    <img src={MessageSupportIcon} alt="Ticket" className="w-[24px] h-[24px] object-contain" />
                  </div>
                  <div className="flex-1">
                    <h3
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        color: '#000000',
                        marginBottom: '8px'
                      }}
                    >
                      Submit a Ticket
                    </h3>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '140%',
                        letterSpacing: '0%',
                        color: '#505050',
                        marginBottom: '8px'
                      }}
                    >
                      Create a support ticket and track its status
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        color: '#505050',
                        marginBottom: '16px'
                      }}
                    >
                      Average response time: 4 hours
                    </p>
                  </div>
                </div>
                <button
                  className="w-full px-[16px] py-[10px] rounded-[8px] border transition-colors mt-auto"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '100%',
                    backgroundColor: 'white',
                    borderColor: '#E0E0E0',
                    color: '#000000'
                  }}
                >
                  Create Ticket
                </button>
              </div>

              {/* FAQ Card */}
              <div
                className="bg-white rounded-[12px] border p-[24px] cursor-pointer transition-all hover:shadow-md flex flex-col h-full"
                style={{
                  borderColor: '#E0E0E0',
                  borderWidth: '1px'
                }}
              >
                <div className="flex items-start gap-[16px] mb-[16px]">
                  <div
                    className="w-[48px] h-[48px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: '#BCDEDC80'
                    }}
                  >
                    <img src={HelpIcon} alt="FAQ" className="w-[24px] h-[24px] object-contain" />
                  </div>
                  <div className="flex-1">
                    <h3
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        color: '#000000',
                        marginBottom: '8px'
                      }}
                    >
                      FAQ
                    </h3>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '140%',
                        letterSpacing: '0%',
                        color: '#505050',
                        marginBottom: '8px'
                      }}
                    >
                      Find answers to commonly asked questions
                    </p>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        lineHeight: '100%',
                        letterSpacing: '0%',
                        color: '#505050',
                        marginBottom: '16px'
                      }}
                    >
                      50+ articles
                    </p>
                  </div>
                </div>
                <button
                  className="w-full px-[16px] py-[10px] rounded-[8px] border transition-colors mt-auto"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    lineHeight: '100%',
                    backgroundColor: 'white',
                    borderColor: '#E0E0E0',
                    color: '#000000'
                  }}
                >
                  View FAQ
                </button>
              </div>
            </div>

            {/* Bottom Section - Two Columns */}
            <div className="grid grid-cols-3 gap-[24px]">
              {/* Left Column - Submit a Support Ticket Form */}
              <div className="col-span-2">
                <div className="bg-white rounded-[12px] border border-[#E0E0E0] p-[24px]">
                  <h2
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '20px',
                      color: '#000000',
                      marginBottom: '24px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #E0E0E0',
                      lineHeight: '100%'
                    }}
                  >
                    Submit a Support Ticket
                  </h2>

                  <form onSubmit={handleSubmit}>
                    {/* Subject Field */}
                    <div className="mb-[20px]">
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#181818'
                        }}
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Brief description of your issue"
                        className="w-full h-[44px] px-[16px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#00564F] transition-colors"
                        style={{ fontWeight: 400 }}
                      />
                    </div>

                    {/* Category Field */}
                    <div className="mb-[20px]">
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#181818'
                        }}
                      >
                        Category
                      </label>
                      <div className="relative">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full h-[44px] px-[16px] pr-[40px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] focus:outline-none focus:border-[#00564F] transition-colors appearance-none"
                          style={{
                            fontWeight: 400,
                            color: formData.category ? '#000000' : '#9CA3AF'
                          }}
                        >
                          <option value="" style={{ color: '#9CA3AF' }}>Select Category</option>
                          <option value="technical" style={{ color: '#000000' }}>Technical Issue</option>
                          <option value="billing" style={{ color: '#000000' }}>Billing</option>
                          <option value="feature" style={{ color: '#000000' }}>Feature Request</option>
                          <option value="other" style={{ color: '#000000' }}>Other</option>
                        </select>
                        <svg className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#9CA3AF] pointer-events-none" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>

                    {/* Message Field */}
                    <div className="mb-[12px]">
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#181818'
                        }}
                      >
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Describe your issue detail..."
                        rows="10"
                        className="w-full px-[16px] py-[12px] rounded-[8px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#00564F] transition-colors resize-y"
                        style={{ fontWeight: 400, fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>

                    {/* Helper Text */}
                    <p
                      className="mb-[20px]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '12px',
                        color: '#666666',
                        lineHeight: '140%'
                      }}
                    >
                      Please provide as much detail as possible to help us resolve your issue quickly
                    </p>

                    {/* Attach File Section */}
                    <div className="mb-[24px]">
                      <label
                        className="block mb-[8px]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          color: '#181818'
                        }}
                      >
                        Attach File <span style={{ color: '#909090' }}>(Optional)</span>
                      </label>
                      <div
                        className="border-2 border-dashed rounded-[8px] p-[32px] text-center cursor-pointer transition-colors hover:border-[#00564F]"
                        style={{ borderColor: '#E0E0E0' }}
                        onClick={() => document.getElementById('file-upload').click()}
                      >
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <img src={UploadIcon} alt="Upload" className="w-[32px] h-[32px] mx-auto mb-[12px] opacity-50" />
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '14px',
                            color: '#666666',
                            lineHeight: '140%'
                          }}
                        >
                          Click to upload or drag and drop
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#9CA3AF',
                            lineHeight: '140%',
                            marginTop: '4px'
                          }}
                        >
                          PDF, DOC, or Image (max 10MB)
                        </p>
                      </div>
                    </div>

                    {/* Form Buttons */}
                    <div className="flex items-center gap-[12px]">
                      <button
                        type="submit"
                        className="px-[24px] py-[12px] rounded-[8px] text-white transition-colors"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          lineHeight: '100%',
                          backgroundColor: '#00564F'
                        }}
                      >
                        Submit Ticket
                      </button>
                      <button
                        type="button"
                        onClick={handleClear}
                        className="px-[24px] py-[12px] rounded-[8px] border border-[#E0E0E0] bg-white transition-colors hover:bg-[#F5F7FA]"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px',
                          lineHeight: '100%',
                          color: '#666666'
                        }}
                      >
                        Clear Form
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Column - Recent Tickets, Support Hours, Emergency Support */}
              <div className="col-span-1 flex flex-col gap-[24px]">
                {/* Recent Tickets */}
                <div className="bg-white rounded-[12px] border border-[#E0E0E0] p-[24px] flex flex-col">
                  <h2
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '18px',
                      color: '#000000',
                      marginBottom: '20px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #E0E0E0',
                      lineHeight: '100%'
                    }}
                  >
                    Recent Tickets
                  </h2>
                  <div className="space-y-[12px] mb-[20px]">
                    {recentTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="p-[12px] rounded-[8px] border border-[#E0E0E0]"
                        style={{ backgroundColor: '#F0F9FA' }}
                      >
                        <div className="flex items-start justify-between mb-[8px]">
                          <span
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 400,
                              fontSize: '12px',
                              color: '#666666',
                              lineHeight: '100%'
                            }}
                          >
                            {ticket.id}
                          </span>
                          <span
                            className="px-[8px] py-[2px] rounded-full"
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 500,
                              fontSize: '11px',
                              lineHeight: '100%',
                              backgroundColor: ticket.status === "Resolved" ? '#41ADA780' : '#ADB7B780',
                              color: ticket.status === "Resolved" ? '#00564F' : '#6B6B6B'
                            }}
                          >
                            {ticket.status}
                          </span>
                        </div>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#000000',
                            marginBottom: '8px',
                            lineHeight: '140%'
                          }}
                        >
                          {ticket.title}
                        </p>
                        <p
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 400,
                            fontSize: '12px',
                            color: '#666666',
                            lineHeight: '100%'
                          }}
                        >
                          {ticket.date}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    className="w-full px-[16px] py-[10px] rounded-[8px] border border-[#E0E0E0] bg-white transition-colors hover:bg-[#F5F7FA] mt-auto"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '14px',
                      lineHeight: '100%',
                      color: '#000000'
                    }}
                  >
                    View All Tickets
                  </button>
                </div>

                {/* Support Hours and Emergency Support - Same Height */}
                <div className="flex flex-col gap-[24px]">
                  {/* Support Hours */}
                  <div className="bg-white rounded-[12px] border border-[#E0E0E0] p-[24px] flex flex-col" style={{ flex: '1 1 0' }}>
                    <h2
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '18px',
                        color: '#000000',
                        marginBottom: '20px',
                        lineHeight: '100%'
                      }}
                    >
                      Support Hours
                    </h2>
                    <div className="space-y-[16px] flex-1">
                      <div className="flex items-start gap-[12px]">
                        <img src={ClockIcon} alt="Clock" className="w-[24px] h-[24px] mt-[2px] flex-shrink-0 object-contain" />
                        <div>
                          <p
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 600,
                              fontSize: '14px',
                              color: '#000000',
                              marginBottom: '4px',
                              lineHeight: '100%'
                            }}
                          >
                            Business Hours
                          </p>
                          <p
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 400,
                              fontSize: '14px',
                              color: '#666666',
                              lineHeight: '140%'
                            }}
                          >
                            Mon - Fri: 9:00 AM - 6:00 PM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-[12px]">
                        <img src={CheckIcon} alt="Check" className="w-[20px] h-[20px] mt-[2px] flex-shrink-0 object-contain" />
                        <div>
                          <p
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 600,
                              fontSize: '14px',
                              color: '#000000',
                              marginBottom: '4px',
                              lineHeight: '100%'
                            }}
                          >
                            Average Response Time
                          </p>
                          <p
                            style={{
                              fontFamily: 'Inter, sans-serif',
                              fontWeight: 400,
                              fontSize: '14px',
                              color: '#666666',
                              lineHeight: '140%'
                            }}
                          >
                            4 hours during business hours
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Support */}
                  <div
                    className="rounded-[12px] border border-[#E0E0E0] p-[24px] flex flex-col"
                    style={{ background: 'linear-gradient(180deg, #FFDBDB 0%, #FFFFFF 100%)', flex: '1 1 0' }}
                  >
                    <h2
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 600,
                        fontSize: '18px',
                        color: '#000000',
                        marginBottom: '12px',
                        lineHeight: '100%'
                      }}
                    >
                      Emergency Support
                    </h2>
                    <p
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 400,
                        fontSize: '14px',
                        color: '#666666',
                        marginBottom: '20px',
                        lineHeight: '140%',
                        flex: 1
                      }}
                    >
                      For critical system issues affecting multiple users
                    </p>
                    <button
                      className="w-full px-[16px] py-[12px] rounded-[8px] text-white transition-colors hover:opacity-90 mt-auto"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '14px',
                        lineHeight: '100%',
                        backgroundColor: '#A20000'
                      }}
                    >
                      Contact Emergency Support
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Message Icon */}
            <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center">
              <img src={MessageIcon} alt="Messages" className="w-[20px] h-[20px] object-contain" />
            </button>

            {/* Notification Bell */}
            <button className="relative w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center">
              <img src={NotificationIcon} alt="Notifications" className="w-[20px] h-[20px] object-contain" />
              <span className="absolute top-[4px] right-[4px] w-[8px] h-[8px] bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2"
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
              </button>

              {isUserDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-[180px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-2 z-50">
                  <div className="px-4 py-2">
                    <p className="text-[12px] text-[#6B7280]">elijlafiras@gmail.com</p>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors">
                    Edit Profile
                  </button>
                  <div className="h-[1px] bg-[#DC2626] my-1"></div>
                  <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="w-full px-4 py-2 text-left text-[14px] text-[#DC2626] hover:bg-[#F5F7FA] transition-colors"
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

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

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
              Support
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
              Get help and support from our team
            </p>
          </div>

          {/* Top Three Cards - Mobile */}
          <div className="space-y-4 mb-6">
            {/* Contact Support Card */}
            <div className="bg-white rounded-[12px] border border-[#E0E0E0] p-4">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#BCDEDC80' }}
                >
                  <img src={EmailIcon} alt="Email" className="w-[20px] h-[20px] object-contain" />
                </div>
                <div className="flex-1">
                  <h3
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      lineHeight: '100%',
                      color: '#000000',
                      marginBottom: '6px'
                    }}
                  >
                    Contact Support
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '11px',
                      lineHeight: '140%',
                      color: '#505050',
                      marginBottom: '8px'
                    }}
                  >
                    Get in touch with our support team via email
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '11px',
                      color: '#505050',
                      marginBottom: '12px'
                    }}
                  >
                    support@hrfieldactivity.com
                  </p>
                </div>
              </div>
              <button
                className="w-full px-4 py-2 rounded-[8px] border border-[#E0E0E0] bg-white text-[13px] font-medium text-[#000000]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Email Us
              </button>
            </div>

            {/* Submit a Ticket Card */}
            <div className="bg-white rounded-[12px] border border-[#E0E0E0] p-4">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#BCDEDC80' }}
                >
                  <img src={MessageSupportIcon} alt="Ticket" className="w-[20px] h-[20px] object-contain" />
                </div>
                <div className="flex-1">
                  <h3
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      lineHeight: '100%',
                      color: '#000000',
                      marginBottom: '6px'
                    }}
                  >
                    Submit a Ticket
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '11px',
                      lineHeight: '140%',
                      color: '#505050',
                      marginBottom: '6px'
                    }}
                  >
                    Create a support ticket and track its status
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '11px',
                      color: '#505050',
                      marginBottom: '12px'
                    }}
                  >
                    Average response time: 4 hours
                  </p>
                </div>
              </div>
              <button
                className="w-full px-4 py-2 rounded-[8px] border border-[#E0E0E0] bg-white text-[13px] font-medium text-[#000000]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Create Ticket
              </button>
            </div>

            {/* FAQ Card */}
            <div className="bg-white rounded-[12px] border border-[#E0E0E0] p-4">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#BCDEDC80' }}
                >
                  <img src={HelpIcon} alt="FAQ" className="w-[20px] h-[20px] object-contain" />
                </div>
                <div className="flex-1">
                  <h3
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      lineHeight: '100%',
                      color: '#000000',
                      marginBottom: '6px'
                    }}
                  >
                    FAQ
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '11px',
                      lineHeight: '140%',
                      color: '#505050',
                      marginBottom: '6px'
                    }}
                  >
                    Find answers to commonly asked questions
                  </p>
                  <p
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      fontSize: '11px',
                      color: '#505050',
                      marginBottom: '12px'
                    }}
                  >
                    50+ articles
                  </p>
                </div>
              </div>
              <button
                className="w-full px-4 py-2 rounded-[8px] border border-[#E0E0E0] bg-white text-[13px] font-medium text-[#000000]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                View FAQ
              </button>
            </div>
          </div>

          {/* Submit a Support Ticket Form - Mobile */}
          <div className="bg-white rounded-[12px] border border-[#E0E0E0] p-4 mb-6">
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                color: '#000000',
                marginBottom: '20px',
                paddingBottom: '12px',
                borderBottom: '1px solid #E0E0E0',
                lineHeight: '100%'
              }}
            >
              Submit a Support Ticket
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Subject Field */}
              <div className="mb-4">
                <label
                  className="block mb-2 text-[13px] font-medium text-[#181818]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief description of your issue"
                  className="w-full h-[40px] px-3 rounded-[8px] border border-[#E0E0E0] bg-white text-[13px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#00564F]"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                />
              </div>

              {/* Category Field */}
              <div className="mb-4">
                <label
                  className="block mb-2 text-[13px] font-medium text-[#181818]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Category
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full h-[40px] px-3 pr-10 rounded-[8px] border border-[#E0E0E0] bg-white text-[13px] focus:outline-none focus:border-[#00564F] appearance-none"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      color: formData.category ? '#000000' : '#9CA3AF'
                    }}
                  >
                    <option value="" style={{ color: '#9CA3AF' }}>Select Category</option>
                    <option value="technical" style={{ color: '#000000' }}>Technical Issue</option>
                    <option value="billing" style={{ color: '#000000' }}>Billing</option>
                    <option value="feature" style={{ color: '#000000' }}>Feature Request</option>
                    <option value="other" style={{ color: '#000000' }}>Other</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] pointer-events-none" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Message Field */}
              <div className="mb-3">
                <label
                  className="block mb-2 text-[13px] font-medium text-[#181818]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Describe your issue detail..."
                  rows="6"
                  className="w-full px-3 py-2 rounded-[8px] border border-[#E0E0E0] bg-white text-[13px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#00564F] resize-y"
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                />
              </div>

              {/* Helper Text */}
              <p
                className="mb-4 text-[11px] text-[#666666]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '140%' }}
              >
                Please provide as much detail as possible to help us resolve your issue quickly
              </p>

              {/* Attach File Section */}
              <div className="mb-4">
                <label
                  className="block mb-2 text-[13px] font-medium text-[#181818]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Attach File <span style={{ color: '#909090' }}>(Optional)</span>
                </label>
                <div
                  className="border-2 border-dashed rounded-[8px] p-6 text-center cursor-pointer transition-colors"
                  style={{ borderColor: '#E0E0E0' }}
                  onClick={() => document.getElementById('file-upload-mobile').click()}
                >
                  <input
                    type="file"
                    id="file-upload-mobile"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <img src={UploadIcon} alt="Upload" className="w-[24px] h-[24px] mx-auto mb-2 opacity-50" />
                  <p
                    className="text-[12px] text-[#666666] mb-1"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '140%' }}
                  >
                    Click to upload or drag and drop
                  </p>
                  <p
                    className="text-[10px] text-[#9CA3AF]"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '140%' }}
                  >
                    PDF, DOC, or Image (max 10MB)
                  </p>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-[8px] text-white text-[13px] font-medium"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: '#00564F'
                  }}
                >
                  Submit Ticket
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full px-4 py-3 rounded-[8px] border border-[#E0E0E0] bg-white text-[13px] font-medium text-[#666666]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Clear Form
                </button>
              </div>
            </form>
          </div>

          {/* Recent Tickets - Mobile */}
          <div className="bg-white rounded-[12px] border border-[#E0E0E0] p-4 mb-6">
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                color: '#000000',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid #E0E0E0',
                lineHeight: '100%'
              }}
            >
              Recent Tickets
            </h2>
            <div className="space-y-3 mb-4">
              {recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-3 rounded-[8px] border border-[#E0E0E0]"
                  style={{ backgroundColor: '#F0F9FA' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span
                      className="text-[11px] text-[#666666]"
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '100%' }}
                    >
                      {ticket.id}
                    </span>
                    <span
                      className="px-2 py-1 rounded-full text-[10px] font-medium"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        backgroundColor: ticket.status === "Resolved" ? '#41ADA780' : '#ADB7B780',
                        color: ticket.status === "Resolved" ? '#00564F' : '#6B6B6B'
                      }}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <p
                    className="text-[13px] font-semibold text-[#000000] mb-1"
                    style={{ fontFamily: 'Inter, sans-serif', lineHeight: '140%' }}
                  >
                    {ticket.title}
                  </p>
                  <p
                    className="text-[11px] text-[#666666]"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '100%' }}
                  >
                    {ticket.date}
                  </p>
                </div>
              ))}
            </div>
            <button
              className="w-full px-4 py-2 rounded-[8px] border border-[#E0E0E0] bg-white text-[13px] font-medium text-[#000000]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              View All Tickets
            </button>
          </div>

          {/* Support Hours - Mobile */}
          <div className="bg-white rounded-[12px] border border-[#E0E0E0] p-4 mb-6">
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                color: '#000000',
                marginBottom: '16px',
                lineHeight: '100%'
              }}
            >
              Support Hours
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <img src={ClockIcon} alt="Clock" className="w-[20px] h-[20px] mt-1 flex-shrink-0 object-contain" />
                <div>
                  <p
                    className="text-[13px] font-semibold text-[#000000] mb-1"
                    style={{ fontFamily: 'Inter, sans-serif', lineHeight: '100%' }}
                  >
                    Business Hours
                  </p>
                  <p
                    className="text-[12px] text-[#666666]"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '140%' }}
                  >
                    Mon - Fri: 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <img src={CheckIcon} alt="Check" className="w-[18px] h-[18px] mt-1 flex-shrink-0 object-contain" />
                <div>
                  <p
                    className="text-[13px] font-semibold text-[#000000] mb-1"
                    style={{ fontFamily: 'Inter, sans-serif', lineHeight: '100%' }}
                  >
                    Average Response Time
                  </p>
                  <p
                    className="text-[12px] text-[#666666]"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '140%' }}
                  >
                    4 hours during business hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Support - Mobile */}
          <div
            className="rounded-[12px] border border-[#E0E0E0] p-4"
            style={{ background: 'linear-gradient(180deg, #FFDBDB 0%, #FFFFFF 100%)' }}
          >
            <h2
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                color: '#000000',
                marginBottom: '10px',
                lineHeight: '100%'
              }}
            >
              Emergency Support
            </h2>
            <p
              className="text-[12px] text-[#666666] mb-4"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, lineHeight: '140%' }}
            >
              For critical system issues affecting multiple users
            </p>
            <button
              className="w-full px-4 py-3 rounded-[8px] text-white text-[13px] font-medium"
              style={{
                fontFamily: 'Inter, sans-serif',
                backgroundColor: '#A20000'
              }}
            >
              Contact Emergency Support
            </button>
          </div>
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

export default SupportPage;

