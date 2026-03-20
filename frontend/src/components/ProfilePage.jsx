import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfileMe,
  updateProfile,
  getPersonalInfo,
  updatePersonalInfo,
  getJobInfo,
  updateJobInfo,
  getEmergencyContact,
  updateEmergencyContact,
  getWorkSchedule,
  getAccountSecurity,
  getProfileLocation,
} from "../services/profile.js";
import { getDepartments } from "../services/departments.js";
import { getPositions } from "../services/positions.js";
import { getRoles } from "../services/rbac.js";
import { getLocationTypes } from "../services/locationTypes.js";
import { getLocations } from "../services/locations.js";
import { createLocationAssignment, deleteLocationAssignment } from "../services/locationAssignments.js";
import { getEffectiveRole, getCurrentUser, updateStoredUserAvatar } from "../services/auth.js";
import { uploadImage } from "../services/uploads.js";
import { toAbsoluteAvatarUrl } from "../utils/avatarUrl.js";
import { AvatarOrPlaceholder } from "./HeaderUserAvatar.jsx";
import HeaderIcons from "./HeaderIcons";

// Header icons
const MessageIcon = new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href;
const NotificationIcon = new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href;
const DropdownArrow = new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href;

// Profile page icons
const EditIcon = new URL("../images/icons/edit.png", import.meta.url).href;
const EmployeeIcon = new URL("../images/icons/employee.png", import.meta.url).href;
const PhoneIcon = new URL("../images/icons/phone.png", import.meta.url).href;
const EmailIcon = new URL("../images/icons/email.png", import.meta.url).href;
const LocationIcon = new URL("../images/icons/location.png", import.meta.url).href;
const FacebookIcon = new URL("../images/icons/facebook.png", import.meta.url).href;
const TwitterIcon = new URL("../images/icons/twitter.png", import.meta.url).href;
const WhatsAppIcon = new URL("../images/icons/whatsapp.png", import.meta.url).href;
const PersonalIcon = new URL("../images/icons/personal.png", import.meta.url).href;
const ContactDetailsIcon = new URL("../images/icons/Contact Details.png", import.meta.url).href;
const JobIcon = new URL("../images/icons/job.png", import.meta.url).href;
const LocationIcon2 = new URL("../images/icons/location " + "(2).png", import.meta.url).href;
const EmergencyIcon = new URL("../images/icons/phonecontact.png", import.meta.url).href;
const SecurityIcon = new URL("../images/icons/password.png", import.meta.url).href;
const BlindIcon = new URL("../images/icons/blind.png", import.meta.url).href;
const MapImage = new URL("../images/e5ac96eeb7643360c0c0b37452c907b359c45a58.png", import.meta.url).href;
const ScheduleIcon = new URL("../images/icons/Schedule.png", import.meta.url).href;
const DropdownIcon = new URL("../images/icons/dropdown.png", import.meta.url).href;

import LogoutModal from "./LogoutModal";
// Logout icon for modal
// Logout icon for modal
// const LogoutIcon2 = new URL("../images/icons/logout2.png", import.meta.url).href;

const ProfilePage = ({ userRole = "superAdmin" }) => {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("personal");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isEmergencyEditMode, setIsEmergencyEditMode] = useState(false);
  const [emergencyContactData, setEmergencyContactData] = useState([]);
  const [isSavingEmergency, setIsSavingEmergency] = useState(false);
  const [emergencySaveError, setEmergencySaveError] = useState(null);
  const [emergencySaveSuccess, setEmergencySaveSuccess] = useState(false);
  const [isJobEditMode, setIsJobEditMode] = useState(false);
  const [jobFormData, setJobFormData] = useState({ departmentId: "", positionId: "", employmentType: "" });
  const [departmentsList, setDepartmentsList] = useState([]);
  const [positionsList, setPositionsList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [isSavingJob, setIsSavingJob] = useState(false);
  const [jobSaveError, setJobSaveError] = useState(null);
  const [isLocationsEditMode, setIsLocationsEditMode] = useState(false);
  const [locationsEditPrimaryId, setLocationsEditPrimaryId] = useState("");
  const [locationsEditSecondaryId, setLocationsEditSecondaryId] = useState("");
  const [isLocationsSaving, setIsLocationsSaving] = useState(false);
  const [locationsSaveError, setLocationsSaveError] = useState(null);
  const [locationTypesList, setLocationTypesList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [isScheduleInfoOpen, setIsScheduleInfoOpen] = useState(false);
  const avatarFileInputRef = useRef(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);

  // Role display names
  const effectiveRole = getEffectiveRole();
  // Profile edit permissions by role (aligned with Roles & Permissions page)
  const canEditProfileJob = effectiveRole === "superAdmin" || effectiveRole === "hr";       // user:edit / editEmployee
  const canEditProfileLocations = effectiveRole === "superAdmin";                            // location:assign_employees
  const canEditProfileSchedule = effectiveRole === "superAdmin";                             // no schedule permission in RBAC
  const roleDisplayNames = {
    superAdmin: "Super Admin",
    hr: "HR Admin",
    manager: "Manager",
    fieldEmployee: "Field Employee",
    officer: "Officer",
  };

  const tabs = [
    { id: "personal", label: "Personal" },
    { id: "job", label: "Job" },
    { id: "locations", label: "Locations" },
    { id: "schedule", label: "Schedule" },
    { id: "emergency", label: "Emergency Contact" },
    { id: "security", label: "Security" },
  ];

  // Helper function to convert DD/MM/YYYY to YYYY-MM-DD
  const convertDateToInputFormat = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      // Assuming DD/MM/YYYY format
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return "";
  };

  // Schedule week navigation helpers
  const formatDateRange = (startDate) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 4); // Thursday (5 days: Sun-Thu)

    const startDay = startDate.getDate();
    const endDay = endDate.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[startDate.getMonth()];

    return `${startDay} ${month} - ${endDay} ${month}`;
  };

  const getWeekDays = (startDate) => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu"];
      days.push({
        name: dayNames[i],
        date: date.getDate(),
        fullDate: date
      });
    }
    return days;
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  // Fetch main profile on mount (GET /profile/me)
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProfileMe();
        setProfileData(data || null);
      } catch (err) {
        console.error("Failed to load profile data:", err);
        setError(err.message || "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // When profile loaded or tab changes, load section from its endpoint (GET personal-info, job-info, emergency-contact, work-schedule, account-security)
  useEffect(() => {
    if (!profileData || isLoading) return;

    const fetchSection = async () => {
      try {
        if (activeTab === "personal") {
          const data = await getPersonalInfo();
          if (data) setProfileData((prev) => ({ ...prev, employee: { ...(prev?.employee || {}), ...data } }));
        } else if (activeTab === "job") {
          const data = await getJobInfo();
          if (data) {
            setProfileData((prev) => {
              const prevEmp = prev?.employee || {};
              return {
                ...prev,
                employee: {
                  ...prevEmp,
                  department: data.department != null ? { name: data.department } : prevEmp.department,
                  position: data.position != null ? { title: data.position } : prevEmp.position,
                  supervisor: data.supervisor != null ? { name: data.supervisor } : prevEmp.supervisor,
                  employmentType: data.employment_type ?? data.employmentType ?? prevEmp.employmentType,
                  employee_type: data.employee_type,
                  department_id: data.department_id,
                  position_id: data.position_id,
                  role_id: data.role_id,
                },
                jobInfo: data,
              };
            });
          }
        } else if (activeTab === "emergency") {
          const data = await getEmergencyContact();
          const contacts = data?.emergencyContacts ?? (Array.isArray(data) ? data : []);
          setProfileData((prev) => ({ ...prev, employee: { ...(prev?.employee || {}), emergencyContacts: contacts } }));
        } else if (activeTab === "schedule") {
          const data = await getWorkSchedule();
          if (data) setProfileData((prev) => ({ ...prev, workSchedule: data }));
        } else if (activeTab === "locations") {
          const list = await getProfileLocation();
          setProfileData((prev) => ({ ...prev, locations: Array.isArray(list) ? list : [] }));
        } else if (activeTab === "security") {
          const data = await getAccountSecurity();
          if (data) setProfileData((prev) => ({ ...prev, accountSecurity: data }));
        }
      } catch (err) {
        console.error("Failed to load section:", activeTab, err);
      }
    };

    fetchSection();
  }, [activeTab]);

  // Initialize form data when profile data is loaded or edit mode is enabled
  useEffect(() => {
    if (profileData && isEditMode) {
      setFormData({
        employeeCode: profileData.employee?.employeeCode || profileData.employee?.employee_code || "",
        status: profileData.employee?.status || "",
        firstName: profileData.employee?.firstName || profileData.name?.split(' ')[0] || "",
        middleName: profileData.employee?.middleName || "",
        lastName: profileData.employee?.lastName || profileData.name?.split(' ').slice(1).join(' ') || "",
        email: profileData.email || "",
        phone: profileData.employee?.phone || "",
        birthDate: profileData.employee?.birthDate ? convertDateToInputFormat(formatDate(profileData.employee.birthDate)) : "",
        gender: profileData.employee?.gender || "",
        maritalStatus: profileData.employee?.maritalStatus || "",
      });
    }
  }, [profileData, isEditMode]);

  // Initialize emergency contact data when profile data is loaded or emergency edit mode is enabled
  useEffect(() => {
    if (profileData && isEmergencyEditMode) {
      const contacts = profileData.employee?.emergencyContacts || [];
      setEmergencyContactData(
        contacts.length > 0 
          ? contacts.map(contact => ({
              name: contact.name || "",
              relationship: contact.relationship || "",
              phone: contact.phone || "",
              altPhone: contact.altPhone || "",
              address: contact.address || "",
              email: contact.email || ""
            }))
          : [{
              name: "",
              relationship: "",
              phone: "",
              altPhone: "",
              address: "",
              email: ""
            }]
      );
    }
  }, [profileData, isEmergencyEditMode]);

  // Load departments, positions and roles when Job tab is active (for edit dropdowns and job info block)
  useEffect(() => {
    if (activeTab !== "job") return;
    let cancelled = false;
    Promise.all([getDepartments(), getPositions(), getRoles()])
      .then(([depts, positions, roles]) => {
        if (!cancelled) {
          setDepartmentsList(Array.isArray(depts) ? depts : []);
          setPositionsList(Array.isArray(positions) ? positions : []);
          setRolesList(Array.isArray(roles) ? roles : []);
        }
      })
      .catch((err) => console.error("Failed to load departments/positions/roles:", err));
    return () => { cancelled = true; };
  }, [activeTab]);

  // Load location types and locations when Locations tab is active (for edit dropdowns)
  useEffect(() => {
    if (activeTab !== "locations") return;
    let cancelled = false;
    Promise.all([getLocationTypes(), getLocations()])
      .then(([types, locs]) => {
        if (!cancelled) {
          setLocationTypesList(Array.isArray(types) ? types : []);
          setLocationsList(Array.isArray(locs) ? locs : (locs?.data ?? locs?.items ?? []));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLocationTypesList([]);
          setLocationsList([]);
          console.error("Failed to load location types/locations:", err);
        }
      });
    return () => { cancelled = true; };
  }, [activeTab]);

  // Initialize job form when entering job edit mode
  useEffect(() => {
    if (activeTab === "job" && isJobEditMode && profileData?.jobInfo) {
      const j = profileData.jobInfo;
      setJobFormData({
        departmentId: j.department_id ?? j.departmentId ?? "",
        positionId: j.position_id ?? j.positionId ?? "",
        employmentType: j.employment_type ?? j.employmentType ?? "",
      });
    }
  }, [activeTab, isJobEditMode, profileData?.jobInfo]);

  // Handle edit mode toggle
  const handleEditClick = () => {
    setIsEditMode(true);
    setSaveError(null);
    setSaveSuccess(false);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setFormData({});
    setSaveError(null);
    setSaveSuccess(false);
  };

  // Handle form input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle password input change
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle change password
  const handleChangePassword = async () => {
    try {
      // Validation
      if (!passwordData.currentPassword) {
        setSaveError('Please enter your current password');
        return;
      }
      if (!passwordData.newPassword) {
        setSaveError('Please enter a new password');
        return;
      }
      if (passwordData.newPassword.length < 6) {
        setSaveError('New password must be at least 6 characters long');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setSaveError('New password and confirm password do not match');
        return;
      }

      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      // Prepare data for API
      const updateData = {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword
      };

      await updateProfile(updateData);
      
      setSaveSuccess(true);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to change password:', err);
      setSaveError(err.message || 'Failed to change password. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleJobEditClick = () => {
    setJobSaveError(null);
    setIsJobEditMode(true);
  };
  const handleCancelJobEdit = () => {
    setIsJobEditMode(false);
    setJobFormData({ departmentId: "", positionId: "", employmentType: "" });
  };
  const handleSaveJob = async () => {
    setIsSavingJob(true);
    setJobSaveError(null);
    try {
      await updateJobInfo({
        departmentId: jobFormData.departmentId || undefined,
        positionId: jobFormData.positionId || undefined,
        employmentType: jobFormData.employmentType || undefined,
      });
      const data = await getJobInfo();
      if (data) {
        setProfileData((prev) => {
          const prevEmp = prev?.employee || {};
          return {
            ...prev,
            employee: {
              ...prevEmp,
              department: data.department != null ? { name: data.department } : prevEmp.department,
              position: data.position != null ? { title: data.position } : prevEmp.position,
              supervisor: data.supervisor != null ? { name: data.supervisor } : prevEmp.supervisor,
              employmentType: data.employment_type ?? data.employmentType ?? prevEmp.employmentType,
              department_id: data.department_id,
              position_id: data.position_id,
            },
            jobInfo: data,
          };
        });
      }
      setIsJobEditMode(false);
    } catch (err) {
      setJobSaveError(err?.message || "Failed to save job info.");
    } finally {
      setIsSavingJob(false);
    }
  };

  const handleLocationsEditClick = () => {
    setLocationsEditPrimaryId(primaryLocation?.id ?? "");
    setLocationsEditSecondaryId(secondaryLocation?.id ?? "");
    setLocationsSaveError(null);
    setIsLocationsEditMode(true);
  };
  const handleCancelLocationsEdit = () => {
    setIsLocationsEditMode(false);
    setLocationsSaveError(null);
  };
  const handleSaveLocationsEdit = async () => {
    const employeeId = profileData?.employee?.id;
    if (!employeeId) {
      setLocationsSaveError("Employee not found.");
      return;
    }
    const currentIds = (profileLocations || []).map((l) => l.id ?? l.location_id).filter(Boolean);
    const newIds = [locationsEditPrimaryId, locationsEditSecondaryId].filter(Boolean);
    setLocationsSaveError(null);
    setIsLocationsSaving(true);
    try {
      for (const locId of currentIds) {
        if (!newIds.includes(locId)) await deleteLocationAssignment(employeeId, locId);
      }
      for (const locId of newIds) {
        if (!currentIds.includes(locId)) await createLocationAssignment({ employee_id: employeeId, location_id: locId });
      }
      const list = await getProfileLocation();
      setProfileData((prev) => ({ ...prev, locations: Array.isArray(list) ? list : [] }));
      setIsLocationsEditMode(false);
    } catch (err) {
      setLocationsSaveError(err?.response?.data?.message || err?.message || "Failed to update locations.");
    } finally {
      setIsLocationsSaving(false);
    }
  };

  // Handle emergency contact edit mode toggle
  const handleEmergencyEditClick = () => {
    setIsEmergencyEditMode(true);
    setEmergencySaveError(null);
    setEmergencySaveSuccess(false);
  };

  // Handle cancel emergency contact edit
  const handleCancelEmergencyEdit = () => {
    setIsEmergencyEditMode(false);
    setEmergencyContactData([]);
    setEmergencySaveError(null);
    setEmergencySaveSuccess(false);
  };

  // Handle emergency contact input change
  const handleEmergencyContactChange = (index, field, value) => {
    setEmergencyContactData(prev => {
      const updated = [...prev];
      if (!updated[index]) {
        updated[index] = {
          name: "",
          relationship: "",
          phone: "",
          altPhone: "",
          address: "",
          email: ""
        };
      }
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  // Handle add new emergency contact
  const handleAddEmergencyContact = () => {
    setEmergencyContactData(prev => [
      ...prev,
      {
        name: "",
        relationship: "",
        phone: "",
        altPhone: "",
        address: "",
        email: ""
      }
    ]);
  };

  // Handle remove emergency contact
  const handleRemoveEmergencyContact = (index) => {
    setEmergencyContactData(prev => prev.filter((_, i) => i !== index));
  };

  // Handle save emergency contact
  const handleSaveEmergencyContact = async () => {
    try {
      setIsSavingEmergency(true);
      setEmergencySaveError(null);
      setEmergencySaveSuccess(false);

      // Validate at least one contact has required fields
      const validContacts = emergencyContactData.filter(contact => 
        contact.name && contact.phone
      );

      if (validContacts.length === 0 && emergencyContactData.length > 0) {
        setEmergencySaveError('Please fill in at least name and phone for one contact');
        setIsSavingEmergency(false);
        return;
      }

      // Prepare data for API
      const updateData = {
        emergencyContacts: emergencyContactData.filter(contact => 
          contact.name || contact.phone || contact.relationship
        )
      };

      await updateEmergencyContact(updateData);
      
      // Refresh profile data
      const updatedData = await getProfileMe();
      setProfileData(updatedData);
      
      setEmergencySaveSuccess(true);
      setIsEmergencyEditMode(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setEmergencySaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to save emergency contact:', err);
      setEmergencySaveError(err.message || 'Failed to save emergency contact. Please try again.');
    } finally {
      setIsSavingEmergency(false);
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      // Prepare data for API (only send changed fields)
      const updateData = {};
      
      if (formData.firstName !== undefined) updateData.firstName = formData.firstName;
      if (formData.middleName !== undefined) updateData.middleName = formData.middleName;
      if (formData.lastName !== undefined) updateData.lastName = formData.lastName;
      if (formData.email !== undefined) updateData.email = formData.email;
      if (formData.phone !== undefined) updateData.phone = formData.phone;
      if (formData.birthDate !== undefined) {
        // Convert YYYY-MM-DD to ISO format if needed
        updateData.birthDate = formData.birthDate;
      }
      if (formData.gender !== undefined) updateData.gender = formData.gender;
      if (formData.maritalStatus !== undefined) updateData.maritalStatus = formData.maritalStatus;
      if (effectiveRole === "superAdmin" && formData.employeeCode !== undefined) updateData.employeeCode = formData.employeeCode;
      if (effectiveRole === "superAdmin" && formData.status !== undefined) updateData.status = formData.status;

      // Use updatePersonalInfo endpoint with PUT method
      await updatePersonalInfo(updateData);
      
      // Refresh profile data
      const updatedData = await getProfileMe();
      setProfileData(updatedData);
      
      setSaveSuccess(true);
      setIsEditMode(false);
      setFormData({});
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setSaveError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Change profile picture: upload then update personal info with avatarUrl
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    e.target.value = "";
    setAvatarError(null);
    setIsAvatarUploading(true);
    try {
      const url = await uploadImage(file);
      const avatarUrl = typeof url === "string" ? url : (url?.url ?? url?.image_url ?? null);
      if (!avatarUrl) throw new Error("Failed to get image URL");
      await updatePersonalInfo({ avatarUrl });
      const updated = await getProfileMe();
      setProfileData(updated);
      const newAvatarUrl = updated?.avatarUrl ?? updated?.employee?.avatarUrl ?? avatarUrl;
      updateStoredUserAvatar(newAvatarUrl);
    } catch (err) {
      console.error("Failed to update profile picture:", err);
      setAvatarError(err.message || "Failed to update picture. Try again.");
    } finally {
      setIsAvatarUploading(false);
    }
  };

  // Helper function to format date from ISO string to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return "";
    }
  };

  // Helper function to calculate age from birth date
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return null;
    try {
      const birthDate = new Date(birthDateString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      return null;
    }
  };

  // Extract user data from profile response
  const userData = profileData ? {
    employeeId: profileData.employee?.employeeCode || "",
    firstName: profileData.employee?.firstName || profileData.name?.split(' ')[0] || "",
    middleName: profileData.employee?.middleName || "",
    lastName: profileData.employee?.lastName || profileData.name?.split(' ').slice(1).join(' ') || "",
    fullName: profileData.employee?.fullName || profileData.name || "",
    email: profileData.email || "",
    phone: profileData.employee?.phone || "",
    location: "Palestine, Gaza", // Not in API response, keeping default
    birthDate: formatDate(profileData.employee?.birthDate),
    age: calculateAge(profileData.employee?.birthDate),
    gender: profileData.employee?.gender || "",
    maritalStatus: profileData.employee?.maritalStatus || "",
    status: profileData.employee?.status || "",
    avatarUrl: profileData.avatarUrl || profileData.employee?.avatarUrl || null,
    roles: profileData.roles || [],
    department: (() => { const d = profileData.employee?.department; return typeof d === "string" ? d : d?.name ?? profileData.jobInfo?.department ?? ""; })(),
    position: (() => { const p = profileData.employee?.position; return typeof p === "string" ? p : p?.title ?? profileData.jobInfo?.position ?? ""; })(),
    employeeCode: profileData.employee?.employeeCode || "",
    hiredAt: formatDate(profileData.employee?.hiredAt),
    employmentType: profileData.employee?.employmentType || profileData.employee?.employment_type || profileData.jobInfo?.employment_type || "",
    supervisor: (() => { const s = profileData.employee?.supervisor; return typeof s === "string" ? s : s?.name ?? profileData.jobInfo?.supervisor ?? null; })(),
    emergencyContacts: profileData.employee?.emergencyContacts || [],
  } : null;

  const profileLocations = profileData?.locations ?? [];
  const primaryLocation = profileLocations[0] ?? null;
  const secondaryLocation = profileLocations[1] ?? null;
  const mapLocation = profileLocations.find((l) => l.latitude != null && l.longitude != null) || primaryLocation;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setIsMobileDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isMobileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isMobileDropdownOpen]);

  return (
    <>
    <div className="flex-1 flex flex-col bg-[#F5F7FA] min-h-screen overflow-x-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header - Desktop Only */}
      <header className="hidden lg:flex bg-white flex-col border-b border-[#E0E0E0] px-[40px] py-[24px]">
        <div className="flex items-center justify-between mb-[16px]">
          {/* Search Bar */}
          <div className="relative">
            <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              className="w-[280px] h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
            />
          </div>

          {/* Right Side - Icons and User */}
          <div className="flex items-center gap-[16px]">
            <HeaderIcons />

            {/* User Profile */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="flex items-center gap-[12px] cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <AvatarOrPlaceholder
                  src={toAbsoluteAvatarUrl(userData?.avatarUrl) || userData?.avatarUrl}
                  alt="User"
                  className="w-[44px] h-[44px] rounded-full object-cover border-2 border-[#E5E7EB]"
                />
                <div>
                  <div className="flex items-center gap-[6px]">
                    <p className="text-[16px] font-semibold text-[#333333]">
                      Hi, {isLoading ? "..." : (userData?.firstName || profileData?.name?.split(' ')[0] || "User")}!
                    </p>
                    <img
                      src={DropdownArrow}
                      alt=""
                      className={`w-[14px] h-[14px] object-contain transition-transform duration-200 mt-[2px] ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <p className="text-[12px] font-normal text-[#6B7280]">{roleDisplayNames[effectiveRole]}</p>
                </div>
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-[8px] w-[200px] bg-white rounded-[8px] shadow-lg border border-[#E0E0E0] py-[8px] z-50">
                  <div className="px-[16px] py-[8px]">
                    <p className="text-[12px] text-[#6B7280]">{currentUser?.email || ""}</p>
                  </div>
                  <button type="button" className="w-full px-[16px] py-[10px] text-left text-[14px] text-[#333333] hover:bg-[#F5F7FA] transition-colors" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setIsDropdownOpen(false); navigate("/profile"); }}>
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
        <div className="mt-[16px]">
          <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
            <span style={{ color: '#B0B0B0' }}>More</span>
            <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
            <span style={{ color: '#8E8C8C' }}>My Profile</span>
          </p>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-1 flex-col">

        {/* Main Content - Green header starts below Sidebar */}
        <div className="flex-1 overflow-x-hidden">
          {/* Profile Card Container - No top margin, starts right after header */}
          <div className="bg-white rounded-[12px] shadow-sm overflow-hidden mx-[24px] mt-[24px] mb-[24px]">

            {/* Green Header Section - Top only */}
            <div
              className="px-[24px] pt-[24px] pb-[20px] relative rounded-[12px] border-b border-[#E0E0E0] flex flex-col"
              style={{ backgroundColor: '#004D40' }}
            >
              {/* Avatar with edit icon - Positioned to extend beyond green header */}
              <div className="absolute left-[16px] top-[16px] w-[180px] h-[160px] rounded-[8px] z-10 group">
                <AvatarOrPlaceholder
                  src={toAbsoluteAvatarUrl(userData?.avatarUrl) || userData?.avatarUrl}
                  alt="Profile"
                  className="w-full h-full rounded-[8px] object-cover"
                />
                <input
                  ref={avatarFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  disabled={isAvatarUploading}
                  className="absolute bottom-[8px] right-[8px] w-[36px] h-[36px] rounded-full bg-[#004D40] text-white flex items-center justify-center shadow-md hover:bg-[#003934] focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-60 disabled:pointer-events-none transition-all"
                  title="Change profile picture"
                >
                  <img src={EditIcon} alt="Edit" className="w-[18px] h-[18px] object-contain" />
                </button>
                {isAvatarUploading && (
                  <div className="absolute inset-0 rounded-[8px] bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Updating...</span>
                  </div>
                )}
                {avatarError && (
                  <div className="absolute -bottom-6 left-0 right-0 text-[11px] text-red-600 bg-white/95 px-2 py-1 rounded shadow truncate" title={avatarError}>
                    {avatarError}
                  </div>
                )}
              </div>

              {/* Top Row: Name */}
              <div className="flex items-start gap-[20px] pl-[220px]">
                {/* Name and Role */}
                <div className="flex-1">
                  <h1 className="text-[24px] font-bold text-white" style={{ fontFamily: 'Libre Caslon Text, serif', lineHeight: '100%' }}>
                    {isLoading ? "Loading..." : (userData?.fullName || profileData?.name || "User")}
                  </h1>
                  <p className="text-[13px] text-white/80">
                    {isLoading ? "" : (userData?.roles?.[0] || profileData?.roles?.[0] || roleDisplayNames[effectiveRole])}
                  </p>
                </div>
              </div>

              {/* Tabs - At the bottom of green header (aligned with content) */}
              <div className="flex gap-[8px] pl-[256px] mt-auto pt-[24px]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-[16px] py-[8px] text-[13px] font-medium transition-all rounded-[6px] ${activeTab === tab.id
                      ? 'bg-white text-[#004D40]'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-[40px]">
                <p className="text-[16px] text-[#666666]">Loading profile data...</p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="mx-[24px] mt-[24px] mb-[24px] p-[16px] bg-red-50 border border-red-200 rounded-[8px]">
                <p className="text-[14px] text-red-600">{error}</p>
              </div>
            )}

            {/* Content Section - Split Layout */}
            {!isLoading && !error && userData && (
            <div className="flex pt-[20px]">
              {/* Left Side - Contact Info (Below green header, aligned with avatar) */}
              <div className="min-w-[240px] w-[300px] max-w-[320px] pl-[16px] pr-[20px] pb-[20px] flex-shrink-0">
                {/* Contact Info */}
                <div className="flex flex-col gap-[14px] mt-[20px] min-w-0">
                  {/* Employee ID */}
                  <div className="flex items-center gap-[10px] min-w-0">
                    <div className="w-[24px] h-[24px] rounded-full bg-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                      <img src={EmployeeIcon} alt="Employee" className="w-[14px] h-[14px] object-contain" />
                    </div>
                    <span className="text-[13px] text-[#666666] whitespace-nowrap truncate min-w-0">#{userData?.employeeCode || userData?.employeeId || "N/A"}</span>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-[10px] min-w-0">
                    <div className="w-[24px] h-[24px] rounded-full bg-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                      <img src={PhoneIcon} alt="Phone" className="w-[14px] h-[14px] object-contain" />
                    </div>
                    <span className="text-[13px] text-[#666666] whitespace-nowrap truncate min-w-0">{userData?.phone || "N/A"}</span>
                  </div>

                  {/* Email - full address visible; scroll horizontally if very long */}
                  <div className="flex items-start gap-[10px] min-w-0">
                    <div className="w-[24px] h-[24px] rounded-full bg-[#E5E7EB] flex items-center justify-center flex-shrink-0 mt-[1px]">
                      <img src={EmailIcon} alt="Email" className="w-[14px] h-[14px] object-contain" />
                    </div>
                    <div className="min-w-0 overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'thin' }}>
                      <span className="text-[13px] text-[#666666] whitespace-nowrap" title={userData?.email || "N/A"}>{userData?.email || "N/A"}</span>
                    </div>
                  </div>

                  {/* Location - allow wrap for long text */}
                  <div className="flex items-start gap-[10px] min-w-0">
                    <div className="w-[24px] h-[24px] rounded-full bg-[#E5E7EB] flex items-center justify-center flex-shrink-0 mt-[1px]">
                      <img src={LocationIcon} alt="Location" className="w-[14px] h-[14px] object-contain" />
                    </div>
                    <span className="text-[13px] text-[#666666] break-words min-w-0">{userData?.location || "N/A"}</span>
                  </div>

                  {/* Divider Line */}
                  <div className="h-[1px] bg-[#E0E0E0] my-[8px]"></div>

                  {/* Social Icons */}
                  <div className="flex items-center gap-[12px]">
                    <button className="w-[20px] h-[20px] flex items-center justify-center hover:opacity-80 transition-opacity">
                      <img src={FacebookIcon} alt="Facebook" className="w-[20px] h-[20px] object-contain" />
                    </button>
                    <button className="w-[20px] h-[20px] flex items-center justify-center hover:opacity-80 transition-opacity">
                      <img src={TwitterIcon} alt="Twitter" className="w-[20px] h-[20px] object-contain" />
                    </button>
                    <button className="w-[20px] h-[20px] flex items-center justify-center hover:opacity-80 transition-opacity">
                      <img src={WhatsAppIcon} alt="WhatsApp" className="w-[20px] h-[20px] object-contain" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side - Form Content (White background). min-w-0 so schedule table can scroll horizontally when needed. */}
              <div className={`flex-1 min-w-0 pl-[24px] pb-[24px] pt-0 bg-white ${activeTab === "schedule" ? "pr-[24px]" : "pr-[24px]"}`}>
                {activeTab === "personal" && (
                  <div>
                    {/* Personal Section Header */}
                    <div className="flex items-center justify-between mb-[12px] pl-[8px] mt-[4px]">
                      <div className="flex items-center gap-[8px]">
                        <img src={PersonalIcon} alt="Personal" className="w-[24px] h-[24px] object-contain" />
                        <h2 className="text-[21px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Personal</h2>
                      </div>
                      <button
                        type="button"
                        onClick={handleEditClick}
                        disabled={isEditMode}
                        className="w-[28px] h-[28px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mr-[24px]"
                        title={effectiveRole === "superAdmin" ? "Edit (Super Admin: all fields)" : "Edit Personal (ID and Status are read-only)"}
                      >
                        <img src={EditIcon} alt="Edit" className="w-[20px] h-[20px] object-contain" />
                      </button>
                    </div>

                    {/* Basic Information */}
                    <div className="mb-[24px] bg-[#F5F7FA] rounded-[8px] p-[20px]">
                      <div className="flex items-center gap-[8px] mb-[16px]">
                        <img src={PersonalIcon} alt="Basic Information" className="w-[22px] h-[22px] object-contain" />
                        <h3 className="text-[18px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Basic Information</h3>
                      </div>

                      {/* Form Grid - 2 columns */}
                      <div className="grid grid-cols-2 gap-x-[20px] gap-y-[12px]">
                        {/* Employee # - editable only for Super Admin */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Employee #</label>
                          <input
                            type="text"
                            value={effectiveRole === "superAdmin" && isEditMode ? (formData.employeeCode ?? (userData?.employeeCode || userData?.employeeId || "")) : (userData?.employeeCode || userData?.employeeId || "")}
                            onChange={effectiveRole === "superAdmin" ? (e) => handleInputChange('employeeCode', e.target.value) : undefined}
                            readOnly={!(effectiveRole === "superAdmin" && isEditMode)}
                            className={`w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none ${effectiveRole === "superAdmin" && isEditMode ? 'bg-white focus:border-[#00564F]' : 'bg-[#F9FAFB]'}`}
                          />
                        </div>

                        {/* Status - editable only for Super Admin */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Status</label>
                          <input
                            type="text"
                            value={effectiveRole === "superAdmin" && isEditMode ? (formData.status ?? (userData?.status || "")) : (userData?.status || "")}
                            onChange={effectiveRole === "superAdmin" ? (e) => handleInputChange('status', e.target.value) : undefined}
                            readOnly={!(effectiveRole === "superAdmin" && isEditMode)}
                            className={`w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none ${effectiveRole === "superAdmin" && isEditMode ? 'bg-white focus:border-[#00564F]' : 'bg-[#F9FAFB]'}`}
                          />
                        </div>

                        {/* First Name */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">First Name</label>
                          <input
                            type="text"
                            value={isEditMode ? (formData.firstName ?? (userData?.firstName || "")) : (userData?.firstName || "")}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            readOnly={!isEditMode}
                            className={`w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none ${isEditMode ? 'bg-white focus:border-[#00564F]' : 'bg-[#F9FAFB]'}`}
                          />
                        </div>

                        {/* Middle Name */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Middle Name</label>
                          <input
                            type="text"
                            value={isEditMode ? (formData.middleName ?? (userData?.middleName || "")) : (userData?.middleName || "")}
                            onChange={(e) => handleInputChange('middleName', e.target.value)}
                            readOnly={!isEditMode}
                            className={`w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none ${isEditMode ? 'bg-white focus:border-[#00564F]' : 'bg-[#F9FAFB]'}`}
                          />
                        </div>

                        {/* Last Name - Full width */}
                        <div className="col-span-2 grid grid-cols-3 gap-[20px]">
                          <div>
                            <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Last Name</label>
                            <input
                              type="text"
                              value={isEditMode ? (formData.lastName ?? (userData?.lastName || "")) : (userData?.lastName || "")}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              readOnly={!isEditMode}
                              className={`w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none ${isEditMode ? 'bg-white focus:border-[#00564F]' : 'bg-[#F9FAFB]'}`}
                            />
                          </div>
                        </div>

                        {/* Birth Date */}
                        <div className="w-3/4">
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Birth Date</label>
                          <input
                            type="date"
                            value={isEditMode ? (formData.birthDate ?? (userData?.birthDate ? convertDateToInputFormat(userData.birthDate) : "")) : (userData?.birthDate ? convertDateToInputFormat(userData.birthDate) : "")}
                            onChange={(e) => handleInputChange('birthDate', e.target.value)}
                            readOnly={!isEditMode}
                            className={`w-full h-[36px] pl-[10px] pr-[10px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none ${isEditMode ? 'bg-white focus:border-[#00564F]' : 'bg-[#F9FAFB]'}`}
                          />
                        </div>

                        {/* Empty */}
                        <div></div>

                        {/* Gender */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Gender</label>
                          <div className="relative">
                            <select
                              value={isEditMode ? (formData.gender ?? (userData?.gender || "")) : (userData?.gender || "")}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              disabled={!isEditMode}
                              className={`w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none appearance-none ${isEditMode ? 'bg-white focus:border-[#00564F] cursor-pointer' : 'bg-[#F9FAFB]'}`}
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Marital Status */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Marital Status</label>
                          <div className="relative">
                            <select
                              value={isEditMode ? (formData.maritalStatus ?? (userData?.maritalStatus || "")) : (userData?.maritalStatus || "")}
                              onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                              disabled={!isEditMode}
                              className={`w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none appearance-none ${isEditMode ? 'bg-white focus:border-[#00564F] cursor-pointer' : 'bg-[#F9FAFB]'}`}
                            >
                              <option value="">Select Status</option>
                              <option value="Single">Single</option>
                              <option value="Married">Married</option>
                              <option value="Divorced">Divorced</option>
                              <option value="Widowed">Widowed</option>
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="bg-[#F5F7FA] rounded-[8px] p-[20px]">
                      <div className="flex items-center gap-[8px] mb-[16px]">
                        <img src={ContactDetailsIcon} alt="Contact Details" className="w-[18px] h-[18px] object-contain" />
                        <h3 className="text-[18px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Contact Details</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-x-[20px] gap-y-[12px]">
                        {/* Email Address */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Email Address</label>
                          <input
                            type="email"
                            value={isEditMode ? (formData.email ?? (userData?.email || "")) : (userData?.email || "")}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            readOnly={!isEditMode}
                            className={`w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none ${isEditMode ? 'bg-white focus:border-[#00564F]' : 'bg-[#F9FAFB]'}`}
                          />
                        </div>

                        {/* Phone Number */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Phone Number</label>
                          <input
                            type="tel"
                            value={isEditMode ? (formData.phone ?? (userData?.phone || "")) : (userData?.phone || "")}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            readOnly={!isEditMode}
                            className={`w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none ${isEditMode ? 'bg-white focus:border-[#00564F]' : 'bg-[#F9FAFB]'}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save/Cancel Buttons and Messages */}
                    {isEditMode && (
                      <div className="mt-[24px]">
                        {/* Error Message */}
                        {saveError && (
                          <div className="mb-[16px] p-[12px] rounded-[6px] bg-red-50 border border-red-200">
                            <p className="text-[13px] text-red-600">{saveError}</p>
                          </div>
                        )}
                        
                        {/* Success Message */}
                        {saveSuccess && (
                          <div className="mb-[16px] p-[12px] rounded-[6px] bg-green-50 border border-green-200">
                            <p className="text-[13px] text-green-600">Profile updated successfully!</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-[12px]">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="px-[24px] py-[8px] rounded-[6px] border border-[#E0E0E0] bg-white text-[#737373] text-[14px] font-medium hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="px-[24px] py-[8px] rounded-[6px] bg-[#00564F] text-white text-[14px] font-semibold hover:bg-[#004D40] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "job" && (
                  <div>
                    {/* Job Section Header */}
                    <div className="flex items-center justify-between mb-[20px]">
                      <div className="flex items-center gap-[8px]">
                        <img src={JobIcon} alt="Job" className="w-[20px] h-[20px] object-contain" />
                        <h2 className="text-[21px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Job</h2>
                      </div>
                      {canEditProfileJob && (
                        <button type="button" onClick={handleJobEditClick} disabled={isJobEditMode} className="w-[28px] h-[28px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors mr-[24px]" title="Edit Job">
                          <img src={EditIcon} alt="Edit" className="w-[20px] h-[20px] object-contain" />
                        </button>
                      )}
                    </div>

                    {/* Job Information */}
                    <div className="bg-[#F5F7FA] rounded-[8px] p-[20px]">
                      <div className="flex items-center gap-[8px] mb-[16px]">
                        <img src={JobIcon} alt="Job Information" className="w-[18px] h-[18px] object-contain" />
                        <h3 className="text-[18px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Job Information</h3>
                      </div>

                      {jobSaveError && <p className="text-red-600 text-[13px] mb-3">{jobSaveError}</p>}

                      {/* Form Grid - 2 columns */}
                      <div className="grid grid-cols-2 gap-x-[20px] gap-y-[12px]">
                        {/* Department */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Department</label>
                          <div className="relative">
                            <select
                              value={isJobEditMode ? (jobFormData.departmentId ?? "") : (profileData?.jobInfo?.department_id ?? profileData?.employee?.department_id ?? "")}
                              onChange={isJobEditMode ? (e) => setJobFormData((prev) => ({ ...prev, departmentId: e.target.value })) : undefined}
                              readOnly={!isJobEditMode}
                              disabled={!isJobEditMode}
                              className={`w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none appearance-none ${isJobEditMode ? "bg-white cursor-pointer" : "bg-[#F9FAFB]"}`}
                            >
                              <option value="">Select Department</option>
                              {departmentsList.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Position */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Position</label>
                          <div className="relative">
                            <select
                              value={isJobEditMode ? (jobFormData.positionId ?? "") : (profileData?.jobInfo?.position_id ?? profileData?.employee?.position_id ?? "")}
                              onChange={isJobEditMode ? (e) => setJobFormData((prev) => ({ ...prev, positionId: e.target.value })) : undefined}
                              readOnly={!isJobEditMode}
                              disabled={!isJobEditMode}
                              className={`w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none appearance-none ${isJobEditMode ? "bg-white cursor-pointer" : "bg-[#F9FAFB]"}`}
                            >
                              <option value="">Select Position</option>
                              {positionsList.map((p) => (
                                <option key={p.id} value={p.id}>{p.title ?? p.name}</option>
                              ))}
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Employee Type */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Employee Type</label>
                          <div className="relative">
                            <select
                              value={isJobEditMode ? (jobFormData.employmentType ?? "") : ((userData?.employmentType || profileData?.jobInfo?.employment_type) ?? "")}
                              onChange={isJobEditMode ? (e) => setJobFormData((prev) => ({ ...prev, employmentType: e.target.value })) : undefined}
                              readOnly={!isJobEditMode}
                              disabled={!isJobEditMode}
                              className={`w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none appearance-none ${isJobEditMode ? "bg-white cursor-pointer" : "bg-[#F9FAFB]"}`}
                            >
                              <option value="">Select Employee Type</option>
                              <option value="Full-Time">Full-Time</option>
                              <option value="Part-Time">Part-Time</option>
                              <option value="Contract">Contract</option>
                              <option value="Intern">Intern</option>
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Supervisor - read-only (not updated by API yet) */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Supervisor</label>
                          <div className="relative">
                            <select
                              value={userData?.supervisor || "none"}
                              readOnly
                              disabled
                              className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none appearance-none"
                            >
                              <option value="">Select Supervisor</option>
                              <option value="none">None</option>
                              <option value={userData?.supervisor || ""}>{typeof userData?.supervisor === "string" ? userData.supervisor : (userData?.supervisor?.name ?? "None")}</option>
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Employment Type (same as Employee Type for save) */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Employment Type</label>
                          <div className="relative">
                            <select
                              value={isJobEditMode ? (jobFormData.employmentType ?? "") : ((userData?.employmentType || profileData?.jobInfo?.employment_type) ?? "")}
                              onChange={isJobEditMode ? (e) => setJobFormData((prev) => ({ ...prev, employmentType: e.target.value })) : undefined}
                              readOnly={!isJobEditMode}
                              disabled={!isJobEditMode}
                              className={`w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none appearance-none ${isJobEditMode ? "bg-white cursor-pointer" : "bg-[#F9FAFB]"}`}
                            >
                              <option value="">Select Employment Type</option>
                              <option value="Full-Time">Full-Time</option>
                              <option value="Part-Time">Part-Time</option>
                              <option value="Contract-Based">Contract-Based</option>
                              <option value="Consultant">Consultant</option>
                              <option value="Volunteer">Volunteer</option>
                              <option value="Intern">Intern</option>
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {isJobEditMode && (
                        <div className="flex items-center justify-end gap-[12px] mt-[20px]">
                          <button type="button" onClick={handleCancelJobEdit} disabled={isSavingJob} className="px-[24px] py-[8px] rounded-[6px] border border-[#E0E0E0] bg-white text-[#737373] text-[14px] font-medium hover:bg-[#F5F5F5] transition-colors disabled:opacity-50">
                            Cancel
                          </button>
                          <button type="button" onClick={handleSaveJob} disabled={isSavingJob} className="px-[24px] py-[8px] rounded-[6px] bg-[#00564F] text-white text-[14px] font-semibold hover:bg-[#004D40] transition-colors disabled:opacity-50">
                            {isSavingJob ? "Saving..." : "Save"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "locations" && (
                  <div>
                    {/* Locations Section Header */}
                    <div className="flex items-center justify-between mb-[20px]">
                      <div className="flex items-center gap-[8px]">
                        <img src={LocationIcon2} alt="Locations" className="w-[20px] h-[20px] object-contain" />
                        <h2 className="text-[21px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Locations</h2>
                      </div>
                      {canEditProfileLocations && (
                        <button type="button" onClick={handleLocationsEditClick} disabled={isLocationsEditMode} className="w-[28px] h-[28px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors mr-[24px]" title="Edit Locations">
                          <img src={EditIcon} alt="Edit" className="w-[20px] h-[20px] object-contain" />
                        </button>
                      )}
                    </div>

                    {isLocationsEditMode && canEditProfileLocations && (
                      <div className="mb-[20px] p-[16px] rounded-[8px] bg-[#F0F9FF] border border-[#0EA5E9]/30">
                        <p className="text-[13px] text-[#0C4A6E] mb-3">Select primary and optional secondary location.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px] mb-3">
                          <div>
                            <label className="block text-[12px] font-medium text-[#4B5563] mb-1">Primary Location</label>
                            <select
                              value={locationsEditPrimaryId}
                              onChange={(e) => setLocationsEditPrimaryId(e.target.value)}
                              className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] focus:outline-none focus:border-[#00564F]"
                            >
                              <option value="">Select location</option>
                              {(Array.isArray(locationsList) ? locationsList : []).map((loc) => {
                                const id = loc.id ?? loc.location_id;
                                const name = loc.name ?? loc.location_name ?? "";
                                return <option key={id} value={id}>{name || id}</option>;
                              })}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[12px] font-medium text-[#4B5563] mb-1">Secondary Location</label>
                            <select
                              value={locationsEditSecondaryId}
                              onChange={(e) => setLocationsEditSecondaryId(e.target.value)}
                              className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] focus:outline-none focus:border-[#00564F]"
                            >
                              <option value="">None</option>
                              {(Array.isArray(locationsList) ? locationsList : []).map((loc) => {
                                const id = loc.id ?? loc.location_id;
                                const name = loc.name ?? loc.location_name ?? "";
                                return <option key={id} value={id}>{name || id}</option>;
                              })}
                            </select>
                          </div>
                        </div>
                        {locationsSaveError && <p className="text-[13px] text-red-600 mb-2">{locationsSaveError}</p>}
                        <div className="flex gap-2">
                          <button type="button" onClick={handleSaveLocationsEdit} disabled={isLocationsSaving} className="px-[16px] py-[6px] rounded-[6px] bg-[#00564F] text-white text-[13px] font-medium hover:bg-[#004D40] disabled:opacity-60">
                            {isLocationsSaving ? "Saving..." : "Save"}
                          </button>
                          <button type="button" onClick={handleCancelLocationsEdit} disabled={isLocationsSaving} className="px-[16px] py-[6px] rounded-[6px] border border-[#E0E0E0] bg-white text-[#333] text-[13px] font-medium hover:bg-[#F5F5F5]">
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {isLocationsEditMode && !canEditProfileLocations && (
                      <div className="mb-[20px] p-[16px] rounded-[8px] bg-[#F0F9FF] border border-[#0EA5E9]/30">
                        <p className="text-[13px] text-[#0C4A6E] mb-2">Assigned locations are set by an admin. Contact your admin or HR to request or change your assigned locations.</p>
                        <button type="button" onClick={handleCancelLocationsEdit} className="px-[16px] py-[6px] rounded-[6px] border border-[#E0E0E0] bg-white text-[#333] text-[13px] font-medium hover:bg-[#F5F5F5]">Close</button>
                      </div>
                    )}

                    {/* Assigned Locations */}
                    <div className="bg-[#F5F7FA] rounded-[8px] p-[20px] mb-[24px]">
                      <div className="flex items-center gap-[8px] mb-[16px]">
                        <img src={LocationIcon2} alt="Assigned Locations" className="w-[18px] h-[18px] object-contain" />
                        <h3 className="text-[18px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Assigned Locations</h3>
                      </div>

                      {profileLocations.length === 0 && (
                        <div className="mb-[20px] p-[16px] rounded-[8px] bg-amber-50 border border-amber-200 text-[13px] text-amber-800">
                          <p className="font-medium mb-1">No locations assigned yet.</p>
                          <p>{canEditProfileLocations ? (
                            <>Locations are assigned from <strong>Locations Management → Location Assignment</strong>. Click the edit icon above for more.</>
                          ) : (
                            <>Locations are assigned by an admin. <strong>Contact your admin or HR</strong> to have locations assigned to you.</>
                          )}</p>
                        </div>
                      )}

                      {/* Primary Location - from DB */}
                      <div className="mb-[24px]">
                        <h4 className="text-[14px] font-semibold text-[#333333] mb-[16px]">Primary Location</h4>
                        <div className="grid grid-cols-3 gap-x-[20px] gap-y-[12px]">
                          <div>
                            <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Location Type</label>
                            <input type="text" readOnly value={primaryLocation?.location_type ?? ""} placeholder="Select Type" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Location Name</label>
                            <input type="text" readOnly value={primaryLocation?.name ?? ""} placeholder="Select Location" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Location Code</label>
                            <input type="text" readOnly value={primaryLocation?.id ?? ""} placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none" />
                          </div>
                          <div className="col-span-3">
                            <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Physical Address</label>
                            <input type="text" readOnly value={primaryLocation?.address ?? ""} placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none" />
                          </div>
                        </div>
                      </div>

                      {/* Divider Line */}
                      <div className="h-[1px] bg-[#E0E0E0] my-[24px]"></div>

                      {/* Secondary Location - from DB */}
                      <div>
                        <h4 className="text-[14px] font-semibold text-[#333333] mb-[16px]">Secondary Location</h4>
                        <div className="grid grid-cols-3 gap-x-[20px] gap-y-[12px]">
                          <div>
                            <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Location Type</label>
                            <input type="text" readOnly value={secondaryLocation?.location_type ?? ""} placeholder="Select Type" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Location Name</label>
                            <input type="text" readOnly value={secondaryLocation?.name ?? ""} placeholder="Select Location" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Location Code</label>
                            <input type="text" readOnly value={secondaryLocation?.id ?? ""} placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none" />
                          </div>
                          <div className="col-span-3">
                            <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Physical Address</label>
                            <input type="text" readOnly value={secondaryLocation?.address ?? ""} placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none" />
                          </div>
                        </div>
                      </div>

                      {/* Divider Line */}
                      <div className="h-[1px] bg-[#E0E0E0] my-[24px]"></div>

                      {/* Current Location - real map from DB lat/lng */}
                      <div>
                        <h3 className="text-[15px] font-semibold text-[#333333] mb-[16px]">Current Location</h3>
                        <div className="w-[65%] overflow-hidden rounded-[8px] border border-[#E0E0E0]">
                          {mapLocation?.latitude != null && mapLocation?.longitude != null ? (
                            <iframe
                              title="Location Map"
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(mapLocation.longitude) - 0.01}%2C${Number(mapLocation.latitude) - 0.01}%2C${Number(mapLocation.longitude) + 0.01}%2C${Number(mapLocation.latitude) + 0.01}&layer=mapnik&marker=${mapLocation.latitude}%2C${mapLocation.longitude}`}
                              className="w-full h-[278px] border-0"
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          ) : (
                            <img src={MapImage} alt="Current Location Map" className="w-full h-[178px] object-cover" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "schedule" && (
                  <div>
                    {/* Schedule Section Header - same layout as Job, Locations (edit icon on the right; column has extra pr when schedule) */}
                    <div className="flex items-center justify-between mb-[20px] pl-[8px] mt-[4px] min-w-0">
                      <div className="flex items-center gap-[8px] min-w-0">
                        <img src={ScheduleIcon} alt="Schedule" className="w-[24px] h-[24px] object-contain flex-shrink-0" />
                        <h2 className="text-[21px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Schedule</h2>
                      </div>
                      {canEditProfileSchedule && (
                        <button type="button" onClick={() => setIsScheduleInfoOpen((v) => !v)} className="flex-shrink-0 w-[28px] h-[28px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors mr-[24px]" title="Edit Schedule">
                          <img src={EditIcon} alt="Edit" className="w-[20px] h-[20px] object-contain" />
                        </button>
                      )}
                    </div>

                    {isScheduleInfoOpen && (
                      <div className="mb-[20px] p-[16px] rounded-[8px] bg-[#F0F9FF] border border-[#0EA5E9]/30">
                        <p className="text-[13px] text-[#0C4A6E] mb-2">
                          Work schedule editing from profile is not available yet. To change your schedule, contact your admin or HR. This will be available in a future update.
                        </p>
                        <button type="button" onClick={() => setIsScheduleInfoOpen(false)} className="px-[16px] py-[6px] rounded-[6px] border border-[#E0E0E0] bg-white text-[#333] text-[13px] font-medium hover:bg-[#F5F5F5]">
                          Close
                        </button>
                      </div>
                    )}

                    {/* Work Schedule Section */}
                    <div className="bg-[#F5F7FA] rounded-[8px] p-[20px]">
                      <div className="flex items-center gap-[8px] mb-[16px]">
                        <img src={ScheduleIcon} alt="Work Schedule" className="w-[18px] h-[18px] object-contain" />
                        <h3 className="text-[18px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Work Schedule</h3>
                      </div>

                      {/* Week Navigation */}
                      <div className="flex items-center justify-center gap-[16px] mb-[20px]">
                        <button
                          onClick={() => navigateWeek('prev')}
                          className="w-[32px] h-[32px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <svg className="w-[16px] h-[16px] text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <span className="text-[14px] font-medium text-[#333333]">{formatDateRange(currentWeekStart)}</span>
                        <button
                          onClick={() => navigateWeek('next')}
                          className="w-[32px] h-[32px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-white transition-colors"
                        >
                          <svg className="w-[16px] h-[16px] text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      {/* Schedule Table - fits without scroll; time blocks wrap if needed */}
                      <div className="border border-[#E0E0E0]">
                        <table className="w-full border-collapse table-fixed" style={{ tableLayout: 'fixed' }}>
                          <thead>
                            <tr>
                              <th className="text-left text-[14px] font-medium text-[#666666] pb-[12px] pr-[12px] bg-white w-[72px]" style={{ borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0' }}></th>
                              {getWeekDays(currentWeekStart).map((day, index) => (
                                <th key={index} className="text-center pt-[16px] pb-[8px] px-[4px] bg-white" style={{ borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0' }}>
                                  <div className="flex flex-col items-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#716F6F' }}>{day.name}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#000000' }}>{day.date}</span>
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {/* Time Row */}
                            <tr>
                              <td className="text-center text-[14px] font-medium text-[#666666] py-[16px] px-[12px] bg-white align-middle" style={{ borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0' }}>Time</td>
                              {getWeekDays(currentWeekStart).map((day, index) => (
                                <td key={index} className="text-center py-[12px] px-[4px] bg-white align-middle break-words" style={{ borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0' }}>
                                  {index === 0 && (
                                    <div className="inline-block max-w-full px-[6px] py-[8px] text-[9px] leading-tight break-words" style={{ backgroundColor: '#FFD5DD', color: '#000000', borderLeft: '2px solid #E24564', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                                      9:00 Am - 2:00 Pm
                                    </div>
                                  )}
                                  {index === 1 && (
                                    <div className="inline-block max-w-full px-[6px] py-[8px] text-[9px] leading-tight break-words" style={{ backgroundColor: '#D5E1FF', color: '#000000', borderLeft: '2px solid #1976D2', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                                      10:00 Am - 4:00 Pm
                                    </div>
                                  )}
                                  {index === 2 && (
                                    <div className="inline-block max-w-full px-[6px] py-[8px] text-[9px] leading-tight break-words" style={{ backgroundColor: '#F1D1AC', color: '#000000', borderLeft: '2px solid #F57C00', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                                      9:00 Am - 2:00 Pm
                                    </div>
                                  )}
                                  {index === 3 && (
                                    <div className="inline-block max-w-full px-[6px] py-[8px] text-[9px] leading-tight break-words" style={{ backgroundColor: '#DAFFD5', color: '#000000', borderLeft: '2px solid #388E3C', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                                      8:00 Am - 2:00 Pm
                                    </div>
                                  )}
                                  {index === 4 && (
                                    <div className="inline-block max-w-full px-[6px] py-[8px] text-[9px] leading-tight break-words" style={{ backgroundColor: '#FFB5FE', color: '#000000', borderLeft: '2px solid #7B1FA2', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
                                      10:00 Am - 3:00 Pm
                                    </div>
                                  )}
                                </td>
                              ))}
                            </tr>
                            {/* Shift Type Row */}
                            <tr>
                              <td className="text-center text-[14px] font-medium text-[#666666] py-[16px] px-[12px] bg-white" style={{ borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0' }}>Shift Type</td>
                              {getWeekDays(currentWeekStart).map((day, index) => (
                                <td key={index} className="text-center text-[13px] text-[#000000] py-[12px] px-[4px] bg-white break-words" style={{ borderBottom: '1px solid #E0E0E0', borderRight: '1px solid #E0E0E0' }}>
                                  Office
                                </td>
                              ))}
                            </tr>
                            {/* Location Row */}
                            <tr>
                              <td className="text-center text-[14px] font-medium text-[#666666] py-[16px] px-[12px] bg-white" style={{ borderRight: '1px solid #E0E0E0' }}>Location</td>
                              {getWeekDays(currentWeekStart).map((day, index) => (
                                <td key={index} className="text-center text-[13px] text-[#000000] py-[12px] px-[4px] bg-white break-words" style={{ borderRight: '1px solid #E0E0E0' }}>
                                  Head Office
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "emergency" && (
                  <div>
                    {/* Emergency Contact Section Header */}
                    <div className="flex items-center justify-between mb-[20px]">
                      <div className="flex items-center gap-[8px]">
                        <img src={EmergencyIcon} alt="Emergency Contact" className="w-[24px] h-[24px] object-contain" />
                        <h2 className="text-[21px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Emergency Contact</h2>
                      </div>
                      <button 
                        type="button"
                        onClick={handleEmergencyEditClick}
                        disabled={isEmergencyEditMode}
                        className="w-[28px] h-[28px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit Emergency Contact"
                      >
                        <img src={EditIcon} alt="Edit" className="w-[20px] h-[20px] object-contain" />
                      </button>
                    </div>

                    {/* Emergency Contact Information */}
                    <div className="bg-[#F5F7FA] rounded-[8px] p-[20px]">
                      {/* Error Message */}
                      {emergencySaveError && (
                        <div className="mb-[16px] p-[12px] rounded-[6px] bg-red-50 border border-red-200">
                          <p className="text-[13px] text-red-600">{emergencySaveError}</p>
                        </div>
                      )}
                      
                      {/* Success Message */}
                      {emergencySaveSuccess && (
                        <div className="mb-[16px] p-[12px] rounded-[6px] bg-green-50 border border-green-200">
                          <p className="text-[13px] text-green-600">Emergency contact updated successfully!</p>
                        </div>
                      )}

                      {isEmergencyEditMode ? (
                        // Edit Mode
                        emergencyContactData.length > 0 ? (
                          emergencyContactData.map((contact, index) => (
                            <div key={index} className={index > 0 ? "mt-[20px] pt-[20px] border-t border-[#E0E0E0]" : ""}>
                              <div className="flex items-center justify-between mb-[16px]">
                                <h4 className="text-[14px] font-semibold text-[#00564F]">
                                  Emergency Contact {index + 1}
                                </h4>
                                {emergencyContactData.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEmergencyContact(index)}
                                    className="text-[12px] text-red-600 hover:text-red-700"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                              {/* Form Grid - 2 columns */}
                              <div className="grid grid-cols-2 gap-x-[20px] gap-y-[12px]">
                                {/* Name */}
                                <div>
                                  <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Name</label>
                                  <input
                                    type="text"
                                    value={contact.name || ""}
                                    onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                                    className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                                  />
                                </div>

                                {/* Relationship */}
                                <div>
                                  <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Relationship</label>
                                  <input
                                    type="text"
                                    value={contact.relationship || ""}
                                    onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                                    className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                                  />
                                </div>

                                {/* Phone Number */}
                                <div>
                                  <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Phone Number</label>
                                  <input
                                    type="tel"
                                    value={contact.phone || ""}
                                    onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                                    className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                                  />
                                </div>

                                {/* Alternate Phone */}
                                <div>
                                  <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Alternate Phone</label>
                                  <input
                                    type="tel"
                                    value={contact.altPhone || ""}
                                    onChange={(e) => handleEmergencyContactChange(index, 'altPhone', e.target.value)}
                                    className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                                  />
                                </div>

                                {/* Address */}
                                <div>
                                  <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Address</label>
                                  <input
                                    type="text"
                                    value={contact.address || ""}
                                    onChange={(e) => handleEmergencyContactChange(index, 'address', e.target.value)}
                                    className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                                  />
                                </div>

                                {/* Email Address */}
                                <div>
                                  <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Email Address</label>
                                  <input
                                    type="email"
                                    value={contact.email || ""}
                                    onChange={(e) => handleEmergencyContactChange(index, 'email', e.target.value)}
                                    className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[13px] text-[#666666] text-center py-[20px]">No emergency contacts</p>
                        )
                      ) : (
                        // View Mode
                        userData?.emergencyContacts && userData.emergencyContacts.length > 0 ? (
                          userData.emergencyContacts.map((contact, index) => (
                            <div key={index} className={index > 0 ? "mt-[20px] pt-[20px] border-t border-[#E0E0E0]" : ""}>
                              <h4 className="text-[14px] font-semibold text-[#00564F] mb-[16px]">
                                Emergency Contact {index + 1}
                              </h4>
                              {/* Form Grid - 2 columns */}
                              <div className="grid grid-cols-2 gap-x-[20px] gap-y-[12px]">
                                {/* Name */}
                                <div>
                                  <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Name</label>
                                  <input
                                    type="text"
                                    value={contact.name || ""}
                                    readOnly
                                    className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none"
                                  />
                                </div>

                                {/* Relationship */}
                                <div>
                                  <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Relationship</label>
                                  <input
                                    type="text"
                                    value={contact.relationship || ""}
                                    readOnly
                                    className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none"
                                  />
                                </div>

                                {/* Phone Number */}
                                <div>
                                  <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Phone Number</label>
                                  <input
                                    type="tel"
                                    value={contact.phone || ""}
                                    readOnly
                                    className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none"
                                  />
                                </div>

                                {/* Alternate Phone */}
                                <div>
                                  <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Alternate Phone</label>
                                  <input
                                    type="tel"
                                    value={contact.altPhone || ""}
                                    readOnly
                                    className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none"
                                  />
                                </div>

                                {/* Address */}
                                <div>
                                  <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Address</label>
                                  <input
                                    type="text"
                                    value={contact.address || ""}
                                    readOnly
                                    className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none"
                                  />
                                </div>

                                {/* Email Address */}
                                <div>
                                  <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Email Address</label>
                                  <input
                                    type="email"
                                    value={contact.email || ""}
                                    readOnly
                                    className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-[13px] text-[#666666] text-center py-[20px]">No emergency contacts available</p>
                        )
                      )}

                      {/* Add Contact Button (Edit Mode Only) */}
                      {isEmergencyEditMode && (
                        <button
                          type="button"
                          onClick={handleAddEmergencyContact}
                          className="mt-[20px] px-[16px] py-[8px] rounded-[6px] border border-[#00564F] text-[#00564F] text-[13px] font-medium hover:bg-[#00564F] hover:text-white transition-colors"
                        >
                          + Add Contact
                        </button>
                      )}

                      {/* Save/Cancel Buttons (Edit Mode Only) */}
                      {isEmergencyEditMode && (
                        <div className="flex items-center justify-end gap-[12px] mt-[24px]">
                          <button
                            type="button"
                            onClick={handleCancelEmergencyEdit}
                            disabled={isSavingEmergency}
                            className="px-[24px] py-[8px] rounded-[6px] border border-[#E0E0E0] bg-white text-[#737373] text-[14px] font-medium hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEmergencyContact}
                            disabled={isSavingEmergency}
                            className="px-[24px] py-[8px] rounded-[6px] bg-[#00564F] text-white text-[14px] font-semibold hover:bg-[#004D40] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            {isSavingEmergency ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div>
                    {/* Account Security Section Header */}
                    <div className="flex items-center justify-between mb-[20px]">
                      <div className="flex items-center gap-[8px]">
                        <img src={SecurityIcon} alt="Account Security" className="w-[24px] h-[24px] object-contain" />
                        <h2 className="text-[21px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Account Security</h2>
                      </div>
                      <button type="button" className="w-[28px] h-[28px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors" title="Change your password below">
                        <img src={EditIcon} alt="Edit" className="w-[20px] h-[20px] object-contain" />
                      </button>
                    </div>

                    {/* Current Password Section */}
                    <div className="bg-[#F5F7FA] rounded-[8px] p-[20px] mb-[20px]">
                      <div className="flex items-center gap-[8px] mb-[16px]">
                        <img src={SecurityIcon} alt="Current Password" className="w-[18px] h-[18px] object-contain" />
                        <h3 className="text-[18px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Current Password</h3>
                      </div>

                      <div className="space-y-[12px]">
                        {/* Error Message */}
                        {saveError && (
                          <div className="p-[12px] rounded-[6px] bg-red-50 border border-red-200">
                            <p className="text-[13px] text-red-600">{saveError}</p>
                          </div>
                        )}
                        
                        {/* Success Message */}
                        {saveSuccess && (
                          <div className="p-[12px] rounded-[6px] bg-green-50 border border-green-200">
                            <p className="text-[13px] text-green-600">Password changed successfully!</p>
                          </div>
                        )}

                        {/* Current Password */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                              placeholder="Enter current password"
                              className="w-full h-[36px] px-[10px] pr-[36px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                            />
                            <button 
                              type="button"
                              onClick={() => togglePasswordVisibility('current')}
                              className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center hover:opacity-70"
                            >
                              <img src={BlindIcon} alt="Toggle password visibility" className="w-[16px] h-[16px] object-contain" />
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                              placeholder="Enter new password"
                              className="w-full h-[36px] px-[10px] pr-[36px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                            />
                            <button 
                              type="button"
                              onClick={() => togglePasswordVisibility('new')}
                              className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center hover:opacity-70"
                            >
                              <img src={BlindIcon} alt="Toggle password visibility" className="w-[16px] h-[16px] object-contain" />
                            </button>
                          </div>
                        </div>

                        {/* Confirm New Password */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                              placeholder="Confirm new password"
                              className="w-full h-[36px] px-[10px] pr-[36px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                            />
                            <button 
                              type="button"
                              onClick={() => togglePasswordVisibility('confirm')}
                              className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center hover:opacity-70"
                            >
                              <img src={BlindIcon} alt="Toggle password visibility" className="w-[16px] h-[16px] object-contain" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Save Changes Button */}
                      <button 
                        type="button"
                        onClick={handleChangePassword}
                        disabled={isSaving}
                        className="mt-[20px] w-[113px] h-[33px] bg-[#00564F] text-white text-[12px] font-medium rounded-[8px] border border-[#00564F] hover:bg-[#004D40] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" 
                        style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout - full width like other pages */}
      <div className="lg:hidden min-h-screen bg-[#F5F7FA] w-full max-w-[100vw] overflow-x-hidden">
        {/* Mobile Content - container takes full width */}
        <div className="w-full max-w-[100vw] py-[16px] px-0 box-border">
          {/* Breadcrumb */}
          <div className="mb-[12px] px-[12px]">
            <span className="text-[12px]">
              <span className="text-[#666666]">More</span>
              <span className="text-[#666666] mx-[4px]">&gt;</span>
              <span className="text-[#4B5563] font-medium">My Profile</span>
            </span>
          </div>

          {/* Profile Card - Mobile - full width, no scroll on card; only tab content scrolls inside */}
          {!isLoading && !error && userData && (
          <div className="w-full max-w-[100vw] bg-white rounded-[12px] shadow-sm flex flex-col mb-[16px] max-h-[calc(100vh-100px)] min-h-0 box-border">
            {/* Green Header - fixed height, no scroll */}
            <div
              className="flex-shrink-0 px-[16px] pt-[16px] pb-[12px] relative rounded-t-[12px] flex flex-col"
              style={{ backgroundColor: '#004D40' }}
            >
              {/* Avatar and Name Row */}
              <div className="flex items-center gap-[12px] mb-[12px]">
                {/* Avatar */}
                <AvatarOrPlaceholder
                  src={toAbsoluteAvatarUrl(userData?.avatarUrl) || userData?.avatarUrl}
                  alt="Profile"
                  className="w-[80px] h-[80px] rounded-[8px] object-cover flex-shrink-0"
                />

                {/* Name and Role */}
                <div className="flex-1">
                  <h1 className="text-[18px] font-bold text-white mb-[4px]" style={{ fontFamily: 'Libre Caslon Text, serif', lineHeight: '100%' }}>{!isLoading && (userData?.fullName || profileData?.name || "User")}</h1>
                  <p className="text-[11px] text-white/80">{roleDisplayNames[effectiveRole]}</p>
                </div>
              </div>

              {/* Tabs - wrap to next line, no horizontal scroll */}
              <div className="flex flex-wrap gap-[8px]">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-[14px] py-[8px] text-[12px] font-medium transition-all rounded-[8px] ${activeTab === tab.id
                      ? 'bg-white text-[#004D40]'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content - Mobile - only this area scrolls */}
            <div className="flex-1 min-h-0 overflow-y-auto p-[16px] bg-white rounded-b-[12px]">
              {activeTab === "personal" && (
                <div>
                  {/* Personal Section Header */}
                  <div className="flex items-center justify-between mb-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <img src={PersonalIcon} alt="Personal" className="w-[18px] h-[18px] object-contain" />
                      <h2 className="text-[18px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Personal</h2>
                    </div>
                    <button
                      type="button"
                      onClick={handleEditClick}
                      disabled={isEditMode}
                      className="w-[28px] h-[28px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={effectiveRole === "superAdmin" ? "Edit (Super Admin: all fields)" : "Edit Personal (ID and Status are read-only)"}
                    >
                      <img src={EditIcon} alt="Edit" className="w-[20px] h-[20px] object-contain" />
                    </button>
                  </div>

                  {/* Basic Information */}
                  <div className="mb-[20px] bg-[#F5F7FA] rounded-[8px] p-[16px]">
                    <div className="flex items-center gap-[8px] mb-[12px]">
                      <img src={PersonalIcon} alt="Basic Information" className="w-[16px] h-[16px] object-contain" />
                      <h3 className="text-[16px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Basic Information</h3>
                    </div>

                    <div className="space-y-[12px]">
                      {/* Employee # - editable only for Super Admin */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Employee #</label>
                        <input
                          type="text"
                          value={effectiveRole === "superAdmin" && isEditMode ? (formData.employeeCode ?? (userData?.employeeCode || userData?.employeeId || "")) : (userData?.employeeCode || userData?.employeeId || "")}
                          onChange={effectiveRole === "superAdmin" ? (e) => handleInputChange('employeeCode', e.target.value) : undefined}
                          readOnly={!(effectiveRole === "superAdmin" && isEditMode)}
                          className={`w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none ${effectiveRole === "superAdmin" && isEditMode ? 'bg-white' : 'bg-[#F9FAFB]'}`}
                        />
                      </div>

                      {/* Status - editable only for Super Admin */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Status</label>
                        <input
                          type="text"
                          value={effectiveRole === "superAdmin" && isEditMode ? (formData.status ?? (userData?.status || "")) : (userData?.status || "")}
                          onChange={effectiveRole === "superAdmin" ? (e) => handleInputChange('status', e.target.value) : undefined}
                          readOnly={!(effectiveRole === "superAdmin" && isEditMode)}
                          className={`w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] text-[13px] text-[#333333] focus:outline-none ${effectiveRole === "superAdmin" && isEditMode ? 'bg-white' : 'bg-[#F9FAFB]'}`}
                        />
                      </div>

                      {/* First Name */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">First Name</label>
                        <input type="text" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                      </div>

                      {/* Middle Name */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Middle Name</label>
                        <input type="text" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                      </div>

                      {/* Last Name */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Last Name</label>
                        <input type="text" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                      </div>

                      {/* Birth Date */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Birth Date</label>
                        <input
                          type="date"
                          className="w-full h-[36px] pl-[10px] pr-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none"
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Gender</label>
                        <div className="relative">
                          <select
                            className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>

                      {/* Marital Status */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Marital Status</label>
                        <div className="relative">
                          <select
                            className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="">Select Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                          <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="bg-[#F5F7FA] rounded-[8px] p-[16px]">
                    <div className="flex items-center gap-[8px] mb-[12px]">
                      <img src={ContactDetailsIcon} alt="Contact Details" className="w-[16px] h-[16px] object-contain" />
                      <h3 className="text-[18px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Contact Details</h3>
                    </div>

                    <div className="space-y-[12px]">
                      {/* Email Address */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Email Address</label>
                        <input type="email" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Phone Number</label>
                        <input type="tel" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "job" && (
                <div>
                  {/* Job Section Header */}
                  <div className="flex items-center justify-between mb-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <img src={JobIcon} alt="Job" className="w-[18px] h-[18px] object-contain" />
                      <h2 className="text-[18px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Job</h2>
                    </div>
                    {canEditProfileJob && (
                      <button type="button" onClick={handleJobEditClick} disabled={isJobEditMode} className="w-[28px] h-[28px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors" title="Edit Job">
                        <img src={EditIcon} alt="Edit" className="w-[20px] h-[20px] object-contain" />
                      </button>
                    )}
                  </div>

                  {/* Job Information */}
                  <div className="bg-[#F5F7FA] rounded-[8px] p-[16px]">
                    <div className="flex items-center gap-[8px] mb-[12px]">
                      <img src={JobIcon} alt="Job Information" className="w-[16px] h-[16px] object-contain" />
                      <h3 className="text-[16px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Job Information</h3>
                    </div>

                    <div className="space-y-[12px]">
                      {/* Department - من الـ API */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Department</label>
                        <div className="relative">
                          <select
                            value={profileData?.jobInfo?.department_id ?? profileData?.employee?.department_id ?? ""}
                            readOnly
                            disabled
                            className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none appearance-none"
                          >
                            <option value="">Select Department</option>
                            {departmentsList.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                          <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>

                      {/* Position - من الـ API */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Position</label>
                        <div className="relative">
                          <select
                            value={profileData?.jobInfo?.position_id ?? profileData?.employee?.position_id ?? ""}
                            readOnly
                            disabled
                            className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none appearance-none"
                          >
                            <option value="">Select Position</option>
                            {positionsList.map((p) => (
                              <option key={p.id} value={p.id}>{p.title ?? p.name}</option>
                            ))}
                          </select>
                          <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>

                      {/* Employee Type (Role) - من الـ API */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Employee Type</label>
                        <div className="relative">
                          <select
                            value={profileData?.jobInfo?.role_id ?? profileData?.employee?.role_id ?? effectiveRole ?? ""}
                            readOnly
                            disabled
                            className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none appearance-none"
                          >
                            <option value="">Select Employee Type</option>
                            {rolesList.map((r) => (
                              <option key={r.id} value={r.id ?? r.name}>{r.name ?? r.title}</option>
                            ))}
                          </select>
                          <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>

                      {/* Supervisor - بدون قائمة ثابتة */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Supervisor</label>
                        <div className="relative">
                          <select
                            className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none appearance-none"
                            value={userData?.supervisor ?? (effectiveRole === "superAdmin" ? "none" : "")}
                            readOnly
                            disabled
                          >
                            <option value="">Select Supervisor</option>
                            <option value="none">None</option>
                            {userData?.supervisor ? <option value={typeof userData.supervisor === "string" ? userData.supervisor : (userData.supervisor?.id ?? "")}>{typeof userData.supervisor === "string" ? userData.supervisor : (userData.supervisor?.name ?? "—")}</option> : null}
                          </select>
                          <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>

                      {/* Employment Type */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Employment Type</label>
                        <div className="relative">
                          <select value={userData?.employmentType || ""} readOnly disabled className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none appearance-none">
                            <option value="">Select Employment Type</option>
                            <option value="Full-Time">Full-Time</option>
                            <option value="Part-Time">Part-Time</option>
                            <option value="Contract-Based">Contract-Based</option>
                            <option value="Consultant">Consultant</option>
                            <option value="Volunteer">Volunteer</option>
                            <option value="Intern">Intern</option>
                          </select>
                          <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "locations" && (
                <div>
                  {/* Locations Section Header */}
                  <div className="flex items-center justify-between mb-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <img src={LocationIcon2} alt="Locations" className="w-[18px] h-[18px] object-contain" />
                      <h2 className="text-[18px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Locations</h2>
                    </div>
                    {canEditProfileLocations && (
                      <button type="button" onClick={handleLocationsEditClick} disabled={isLocationsEditMode} className="w-[28px] h-[28px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors" title="Edit Locations">
                        <img src={EditIcon} alt="Edit" className="w-[20px] h-[20px] object-contain" />
                      </button>
                    )}
                  </div>

                  {isLocationsEditMode && canEditProfileLocations && (
                    <div className="mb-[16px] p-[12px] rounded-[8px] bg-[#F0F9FF] border border-[#0EA5E9]/30">
                      <p className="text-[12px] text-[#0C4A6E] mb-2">Select primary and optional secondary location.</p>
                      <div className="space-y-2 mb-2">
                        <div>
                          <label className="block text-[11px] font-medium text-[#4B5563] mb-0.5">Primary</label>
                          <select value={locationsEditPrimaryId} onChange={(e) => setLocationsEditPrimaryId(e.target.value)} className="w-full h-[34px] px-[8px] rounded-[6px] border border-[#E0E0E0] bg-white text-[12px] focus:outline-none focus:border-[#00564F]">
                            <option value="">Select</option>
                            {(Array.isArray(locationsList) ? locationsList : []).map((loc) => {
                              const id = loc.id ?? loc.location_id;
                              const name = loc.name ?? loc.location_name ?? "";
                              return <option key={id} value={id}>{name || id}</option>;
                            })}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#4B5563] mb-0.5">Secondary</label>
                          <select value={locationsEditSecondaryId} onChange={(e) => setLocationsEditSecondaryId(e.target.value)} className="w-full h-[34px] px-[8px] rounded-[6px] border border-[#E0E0E0] bg-white text-[12px] focus:outline-none focus:border-[#00564F]">
                            <option value="">None</option>
                            {(Array.isArray(locationsList) ? locationsList : []).map((loc) => {
                              const id = loc.id ?? loc.location_id;
                              const name = loc.name ?? loc.location_name ?? "";
                              return <option key={id} value={id}>{name || id}</option>;
                            })}
                          </select>
                        </div>
                      </div>
                      {locationsSaveError && <p className="text-[12px] text-red-600 mb-1">{locationsSaveError}</p>}
                      <div className="flex gap-2">
                        <button type="button" onClick={handleSaveLocationsEdit} disabled={isLocationsSaving} className="px-[12px] py-[5px] rounded-[6px] bg-[#00564F] text-white text-[12px] font-medium disabled:opacity-60">{isLocationsSaving ? "Saving..." : "Save"}</button>
                        <button type="button" onClick={handleCancelLocationsEdit} disabled={isLocationsSaving} className="px-[12px] py-[5px] rounded-[6px] border border-[#E0E0E0] bg-white text-[12px] font-medium">Cancel</button>
                      </div>
                    </div>
                  )}
                  {isLocationsEditMode && !canEditProfileLocations && (
                    <div className="mb-[16px] p-[12px] rounded-[8px] bg-[#F0F9FF] border border-[#0EA5E9]/30">
                      <p className="text-[12px] text-[#0C4A6E] mb-2">Assigned locations are set by an admin. Contact your admin or HR to request or change your locations.</p>
                      <button type="button" onClick={handleCancelLocationsEdit} className="px-[12px] py-[6px] rounded-[6px] border border-[#E0E0E0] bg-white text-[#333] text-[12px] font-medium">Close</button>
                    </div>
                  )}

                  {/* Assigned Locations */}
                  <div className="bg-[#F5F7FA] rounded-[8px] p-[16px] mb-[20px]">
                    <div className="flex items-center gap-[8px] mb-[12px]">
                      <img src={LocationIcon2} alt="Assigned Locations" className="w-[16px] h-[16px] object-contain" />
                      <h3 className="text-[16px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Assigned Locations</h3>
                    </div>

                    {profileLocations.length === 0 && (
                      <div className="mb-[16px] p-[12px] rounded-[8px] bg-amber-50 border border-amber-200 text-[12px] text-amber-800">
                        <p className="font-medium mb-1">No locations assigned yet.</p>
                        <p>{canEditProfileLocations ? "Go to Locations Management → Location Assignment." : "Contact your admin or HR to have locations assigned."}</p>
                      </div>
                    )}

                    {/* Primary Location */}
                    <div className="mb-[20px]">
                      <h4 className="text-[14px] font-semibold text-[#333333] mb-[12px]">Primary Location</h4>
                      <div className="space-y-[12px]">
                        {/* Location Type */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Location Type</label>
                          <div className="relative">
                            <select className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none appearance-none cursor-pointer">
                              <option value="">Select Type</option>
                              {locationTypesList.map((t) => {
                                const name = t.name ?? t.type ?? t.title;
                                return name ? <option key={t.id ?? name} value={name}>{name}</option> : null;
                              })}
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Location Name */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Location Name</label>
                          <div className="relative">
                            <select className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none appearance-none cursor-pointer">
                              <option value="">Select Location</option>
                              {locationsList.map((loc) => (
                                <option key={loc.id} value={loc.id}>{loc.name ?? loc.title ?? ""}</option>
                              ))}
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Location Code */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Location Code</label>
                          <input type="text" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                        </div>

                        {/* Status */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Status</label>
                          <div className="relative">
                            <select className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none appearance-none cursor-pointer">
                              <option value="">Select Status</option>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Physical Address */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Physical Address</label>
                          <input type="text" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                        </div>

                        {/* Operating Days */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Operating Days</label>
                          <div className="relative">
                            <select className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none appearance-none cursor-pointer">
                              <option value="">Select Days</option>
                              <option value="Sunday - Thursday">Sunday - Thursday</option>
                              <option value="Monday - Friday">Monday - Friday</option>
                              <option value="Saturday - Wednesday">Saturday - Wednesday</option>
                              <option value="Sunday - Friday">Sunday - Friday</option>
                              <option value="Monday - Saturday">Monday - Saturday</option>
                              <option value="All Week">All Week</option>
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Contact Person Name */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Contact Person Name</label>
                          <input type="text" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                        </div>

                        {/* Contact Person Phone */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Contact Person Phone</label>
                          <input type="tel" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                        </div>

                        {/* Opening Time / Closing Time */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Opening Time / Closing Time</label>
                          <input type="text" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* Divider Line */}
                    <div className="h-[1px] bg-[#E0E0E0] my-[20px]"></div>

                    {/* Secondary Location */}
                    <div>
                      <h4 className="text-[14px] font-semibold text-[#333333] mb-[12px]">Secondary Location</h4>
                      <div className="space-y-[12px]">
                        {/* Location Type */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Location Type</label>
                          <div className="relative">
                            <select className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none appearance-none cursor-pointer">
                              <option value="">Select Type</option>
                              {locationTypesList.map((t) => {
                                const name = t.name ?? t.type ?? t.title;
                                return name ? <option key={t.id ?? name} value={name}>{name}</option> : null;
                              })}
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Location Name */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Location Name</label>
                          <div className="relative">
                            <select className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none appearance-none cursor-pointer">
                              <option value="">Select Location</option>
                              {locationsList.map((loc) => (
                                <option key={loc.id} value={loc.id}>{loc.name ?? loc.title ?? ""}</option>
                              ))}
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Location Code */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Location Code</label>
                          <input type="text" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                        </div>

                        {/* Status */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Status</label>
                          <div className="relative">
                            <select className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none appearance-none cursor-pointer">
                              <option value="">Select Status</option>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Physical Address */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Physical Address</label>
                          <input type="text" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                        </div>

                        {/* Operating Days */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Operating Days</label>
                          <div className="relative">
                            <select className="w-full h-[36px] pl-[10px] pr-[28px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none appearance-none cursor-pointer">
                              <option value="">Select Days</option>
                              <option value="Sunday - Thursday">Sunday - Thursday</option>
                              <option value="Monday - Friday">Monday - Friday</option>
                              <option value="Saturday - Wednesday">Saturday - Wednesday</option>
                              <option value="Sunday - Friday">Sunday - Friday</option>
                              <option value="Monday - Saturday">Monday - Saturday</option>
                              <option value="All Week">All Week</option>
                            </select>
                            <svg className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#666666] pointer-events-none" viewBox="0 0 24 24" fill="none">
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Contact Person Name */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Contact Person Name</label>
                          <input type="text" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                        </div>

                        {/* Contact Person Phone */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Contact Person Phone</label>
                          <input type="tel" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                        </div>

                        {/* Opening Time / Closing Time */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Opening Time / Closing Time</label>
                          <input type="text" placeholder="" className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Location - real map from DB */}
                  <div className="bg-[#F5F7FA] rounded-[8px] p-[16px]">
                    <h3 className="text-[14px] font-semibold text-[#333333] mb-[12px]">Current Location</h3>
                    <div className="w-full rounded-[8px] overflow-hidden border border-[#E0E0E0]">
                      {mapLocation?.latitude != null && mapLocation?.longitude != null ? (
                        <iframe
                          title="Location Map"
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(mapLocation.longitude) - 0.01}%2C${Number(mapLocation.latitude) - 0.01}%2C${Number(mapLocation.longitude) + 0.01}%2C${Number(mapLocation.latitude) + 0.01}&layer=mapnik&marker=${mapLocation.latitude}%2C${mapLocation.longitude}`}
                          className="w-full h-[200px] border-0"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      ) : (
                        <img src={MapImage} alt="Current Location Map" className="w-full h-[150px] object-cover" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "schedule" && (
                <div className="pr-[72px]">
                  {/* Schedule Section Header - same layout as Locations */}
                  <div className="flex items-center justify-between mb-[16px]">
                    <div className="flex items-center gap-[8px] min-w-0">
                      <img src={ScheduleIcon} alt="Schedule" className="w-[18px] h-[18px] object-contain flex-shrink-0" />
                      <h2 className="text-[18px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Schedule</h2>
                    </div>
                    {canEditProfileSchedule && (
                      <button type="button" onClick={() => setIsScheduleInfoOpen((v) => !v)} className="flex-shrink-0 w-[28px] h-[28px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors" title="Edit Schedule">
                        <img src={EditIcon} alt="Edit" className="w-[20px] h-[20px] object-contain" />
                      </button>
                    )}
                  </div>

                  {isScheduleInfoOpen && (
                    <div className="mb-[16px] p-[12px] rounded-[8px] bg-[#F0F9FF] border border-[#0EA5E9]/30">
                      <p className="text-[12px] text-[#0C4A6E] mb-2">Work schedule editing from profile is not available yet. Contact your admin or HR.</p>
                      <button type="button" onClick={() => setIsScheduleInfoOpen(false)} className="px-[12px] py-[6px] rounded-[6px] border border-[#E0E0E0] bg-white text-[#333] text-[12px] font-medium">Close</button>
                    </div>
                  )}

                  {/* Work Schedule Section (Mobile) - same full-width layout as Assigned Locations */}
                  <div className="bg-[#F5F7FA] rounded-[8px] p-[16px]">
                    <div className="flex items-center gap-[8px] mb-[12px]">
                      <img src={ScheduleIcon} alt="Work Schedule" className="w-[16px] h-[16px] object-contain" />
                      <h3 className="text-[16px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Work Schedule</h3>
                    </div>
                    <div className="flex items-center justify-center gap-[12px] mb-[16px]">
                      <button
                        onClick={() => navigateWeek('prev')}
                        className="w-[28px] h-[28px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <svg className="w-[14px] h-[14px] text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="text-[13px] font-medium text-[#333333]">{formatDateRange(currentWeekStart)}</span>
                      <button
                        onClick={() => navigateWeek('next')}
                        className="w-[28px] h-[28px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <svg className="w-[14px] h-[14px] text-[#666666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-[10px]">
                      {getWeekDays(currentWeekStart).map((day, index) => {
                        const timeData = [
                          { time: '9:00 Am - 2:00 Pm', bg: '#FFD5DD', border: '#E24564' },
                          { time: '10:00 Am - 4:00 Pm', bg: '#D5E1FF', border: '#1976D2' },
                          { time: '9:00 Am - 2:00 Pm', bg: '#F1D1AC', border: '#F57C00' },
                          { time: '8:00 Am - 2:00 Pm', bg: '#DAFFD5', border: '#388E3C' },
                          { time: '10:00 Am - 3:00 Pm', bg: '#FFB5FE', border: '#7B1FA2' }
                        ];
                        const currentTime = timeData[index] || timeData[0];

                        return (
                          <div key={index} className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-[10px] p-[14px]">
                            <div className="flex items-center justify-between mb-[8px]">
                              <span className="text-[15px] font-semibold text-[#374151]" style={{ fontFamily: 'Inter, sans-serif' }}>{day.name} {day.date}</span>
                            </div>
                            <div className="flex flex-col gap-[6px]">
                              <div className="flex items-center justify-between text-[13px]">
                                <span className="text-[#6B7280]">Time</span>
                                <span
                                  className="px-[8px] py-[5px] rounded-[6px] text-[12px] font-medium"
                                  style={{ backgroundColor: currentTime.bg, color: '#000', borderLeft: `3px solid ${currentTime.border}` }}
                                >
                                  {currentTime.time}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[13px]">
                                <span className="text-[#6B7280]">Shift</span>
                                <span className="text-[#111827] font-medium">Office</span>
                              </div>
                              <div className="flex items-center justify-between text-[13px]">
                                <span className="text-[#6B7280]">Location</span>
                                <span className="text-[#111827] font-medium">Head Office</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "emergency" && (
                <div>
                  {/* Emergency Contact Section Header */}
                  <div className="flex items-center justify-between mb-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <img src={EmergencyIcon} alt="Emergency Contact" className="w-[18px] h-[18px] object-contain" />
                      <h2 className="text-[18px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Emergency Contact</h2>
                    </div>
                    <button 
                      type="button"
                      onClick={handleEmergencyEditClick}
                      disabled={isEmergencyEditMode}
                      className="w-[28px] h-[28px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Edit Emergency Contact"
                    >
                      <img src={EditIcon} alt="Edit" className="w-[20px] h-[20px] object-contain" />
                    </button>
                  </div>

                  {/* Emergency Contact Information */}
                  <div className="bg-[#F5F7FA] rounded-[8px] p-[16px]">
                    {/* Error Message */}
                    {emergencySaveError && (
                      <div className="mb-[12px] p-[12px] rounded-[6px] bg-red-50 border border-red-200">
                        <p className="text-[13px] text-red-600">{emergencySaveError}</p>
                      </div>
                    )}
                    
                    {/* Success Message */}
                    {emergencySaveSuccess && (
                      <div className="mb-[12px] p-[12px] rounded-[6px] bg-green-50 border border-green-200">
                        <p className="text-[13px] text-green-600">Emergency contact updated successfully!</p>
                      </div>
                    )}

                    {isEmergencyEditMode ? (
                      // Edit Mode
                      emergencyContactData.length > 0 ? (
                        emergencyContactData.map((contact, index) => (
                          <div key={index} className={index > 0 ? "mt-[16px] pt-[16px] border-t border-[#E0E0E0]" : ""}>
                            <div className="flex items-center justify-between mb-[12px]">
                              <h4 className="text-[13px] font-semibold text-[#00564F]">
                                Emergency Contact {index + 1}
                              </h4>
                              {emergencyContactData.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEmergencyContact(index)}
                                  className="text-[12px] text-red-600 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            <div className="space-y-[12px]">
                              {/* Name */}
                              <div>
                                <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Name</label>
                                <input
                                  type="text"
                                  value={contact.name || ""}
                                  onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                                  className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                                />
                              </div>

                              {/* Relationship */}
                              <div>
                                <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Relationship</label>
                                <input
                                  type="text"
                                  value={contact.relationship || ""}
                                  onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                                  className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                                />
                              </div>

                              {/* Phone Number */}
                              <div>
                                <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Phone Number</label>
                                <input
                                  type="tel"
                                  value={contact.phone || ""}
                                  onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                                  className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                                />
                              </div>

                              {/* Alternate Phone */}
                              <div>
                                <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Alternate Phone</label>
                                <input
                                  type="tel"
                                  value={contact.altPhone || ""}
                                  onChange={(e) => handleEmergencyContactChange(index, 'altPhone', e.target.value)}
                                  className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                                />
                              </div>

                              {/* Address */}
                              <div>
                                <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Address</label>
                                <input
                                  type="text"
                                  value={contact.address || ""}
                                  onChange={(e) => handleEmergencyContactChange(index, 'address', e.target.value)}
                                  className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                                />
                              </div>

                              {/* Email Address */}
                              <div>
                                <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Email Address</label>
                                <input
                                  type="email"
                                  value={contact.email || ""}
                                  onChange={(e) => handleEmergencyContactChange(index, 'email', e.target.value)}
                                  className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[13px] text-[#666666] text-center py-[16px]">No emergency contacts</p>
                      )
                    ) : (
                      // View Mode
                      userData?.emergencyContacts && userData.emergencyContacts.length > 0 ? (
                        userData.emergencyContacts.map((contact, index) => (
                          <div key={index} className={index > 0 ? "mt-[16px] pt-[16px] border-t border-[#E0E0E0]" : ""}>
                            <h4 className="text-[13px] font-semibold text-[#00564F] mb-[12px]">
                              Emergency Contact {index + 1}
                            </h4>
                            <div className="space-y-[12px]">
                              {/* Name */}
                              <div>
                                <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Name</label>
                                <input
                                  type="text"
                                  value={contact.name || ""}
                                  readOnly
                                  className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none"
                                />
                              </div>

                              {/* Relationship */}
                              <div>
                                <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Relationship</label>
                                <input
                                  type="text"
                                  value={contact.relationship || ""}
                                  readOnly
                                  className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none"
                                />
                              </div>

                              {/* Phone Number */}
                              <div>
                                <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Phone Number</label>
                                <input
                                  type="tel"
                                  value={contact.phone || ""}
                                  readOnly
                                  className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none"
                                />
                              </div>

                              {/* Alternate Phone */}
                              <div>
                                <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Alternate Phone</label>
                                <input
                                  type="tel"
                                  value={contact.altPhone || ""}
                                  readOnly
                                  className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none"
                                />
                              </div>

                              {/* Address */}
                              <div>
                                <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Address</label>
                                <input
                                  type="text"
                                  value={contact.address || ""}
                                  readOnly
                                  className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none"
                                />
                              </div>

                              {/* Email Address */}
                              <div>
                                <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Email Address</label>
                                <input
                                  type="email"
                                  value={contact.email || ""}
                                  readOnly
                                  className="w-full h-[36px] px-[10px] rounded-[6px] border border-[#E0E0E0] bg-[#F9FAFB] text-[13px] text-[#333333] focus:outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[13px] text-[#666666] text-center py-[16px]">No emergency contacts available</p>
                      )
                    )}

                    {/* Add Contact Button (Edit Mode Only) */}
                    {isEmergencyEditMode && (
                      <button
                        type="button"
                        onClick={handleAddEmergencyContact}
                        className="mt-[16px] px-[16px] py-[8px] rounded-[6px] border border-[#00564F] text-[#00564F] text-[13px] font-medium hover:bg-[#00564F] hover:text-white transition-colors"
                      >
                        + Add Contact
                      </button>
                    )}

                    {/* Save/Cancel Buttons (Edit Mode Only) */}
                    {isEmergencyEditMode && (
                      <div className="flex items-center justify-end gap-[12px] mt-[20px]">
                        <button
                          type="button"
                          onClick={handleCancelEmergencyEdit}
                          disabled={isSavingEmergency}
                          className="px-[20px] py-[8px] rounded-[6px] border border-[#E0E0E0] bg-white text-[#737373] text-[13px] font-medium hover:bg-[#F5F5F5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveEmergencyContact}
                          disabled={isSavingEmergency}
                          className="px-[20px] py-[8px] rounded-[6px] bg-[#00564F] text-white text-[13px] font-semibold hover:bg-[#004D40] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          {isSavingEmergency ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div>
                  {/* Account Security Section Header */}
                  <div className="flex items-center justify-between mb-[16px]">
                    <div className="flex items-center gap-[8px]">
                      <img src={SecurityIcon} alt="Account Security" className="w-[18px] h-[18px] object-contain" />
                      <h2 className="text-[18px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Account Security</h2>
                    </div>
                    <button type="button" className="w-[28px] h-[28px] rounded-[6px] border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors" title="Change your password below">
                      <img src={EditIcon} alt="Edit" className="w-[20px] h-[20px] object-contain" />
                    </button>
                  </div>

                  {/* Current Password Section */}
                  <div className="bg-[#F5F7FA] rounded-[8px] p-[16px] mb-[16px]">
                    <div className="flex items-center gap-[8px] mb-[12px]">
                      <img src={SecurityIcon} alt="Current Password" className="w-[16px] h-[16px] object-contain" />
                      <h3 className="text-[16px] font-semibold" style={{ fontFamily: 'Libre Caslon Text, serif', color: '#00564F', lineHeight: '100%' }}>Current Password</h3>
                    </div>

                    <div className="space-y-[12px]">
                      {/* Error Message */}
                      {saveError && (
                        <div className="p-[12px] rounded-[6px] bg-red-50 border border-red-200">
                          <p className="text-[13px] text-red-600">{saveError}</p>
                        </div>
                      )}
                      
                      {/* Success Message */}
                      {saveSuccess && (
                        <div className="p-[12px] rounded-[6px] bg-green-50 border border-green-200">
                          <p className="text-[13px] text-green-600">Password changed successfully!</p>
                        </div>
                      )}

                      {/* Current Password */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                            placeholder="Enter current password"
                            className="w-full h-[36px] px-[10px] pr-[36px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                          />
                          <button 
                            type="button"
                            onClick={() => togglePasswordVisibility('current')}
                            className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center hover:opacity-70"
                          >
                            <img src={BlindIcon} alt="Toggle password visibility" className="w-[16px] h-[16px] object-contain" />
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                            placeholder="Enter new password"
                            className="w-full h-[36px] px-[10px] pr-[36px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                          />
                          <button 
                            type="button"
                            onClick={() => togglePasswordVisibility('new')}
                            className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center hover:opacity-70"
                          >
                            <img src={BlindIcon} alt="Toggle password visibility" className="w-[16px] h-[16px] object-contain" />
                          </button>
                        </div>
                      </div>

                      {/* Confirm New Password */}
                      <div>
                        <label className="block text-[13px] font-medium text-[#4B5563] mb-[4px]">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full h-[36px] px-[10px] pr-[36px] rounded-[6px] border border-[#E0E0E0] bg-white text-[13px] text-[#333333] focus:outline-none focus:border-[#00564F]"
                          />
                          <button 
                            type="button"
                            onClick={() => togglePasswordVisibility('confirm')}
                            className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center hover:opacity-70"
                          >
                            <img src={BlindIcon} alt="Toggle password visibility" className="w-[16px] h-[16px] object-contain" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Save Changes Button */}
                    <button 
                      type="button"
                      onClick={handleChangePassword}
                      disabled={isSaving}
                      className="mt-[16px] w-[113px] h-[33px] bg-[#00564F] text-white text-[12px] font-medium rounded-[8px] border border-[#00564F] hover:bg-[#004D40] transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" 
                      style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
    </>
  );
};

export default ProfilePage;
