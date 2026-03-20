import React, { useState, useEffect, useRef } from "react";
import { uploadImage } from "../services/uploads.js";

const DefaultProfileImage = new URL("../images/icons/ece298d0ec2c16f10310d45724b276a6035cb503.png", import.meta.url).href;
const CameraIcon = new URL("../images/icons/camera.png", import.meta.url).href;

/**
 * Shared Add/Edit Employee modal – same form as Super Admin (profile pic, First Name, Last Name, Department, Role, Position, Status, Save).
 * Used by EmployeesPage and TeamMembersPage (Manager). For Manager add, pass supervisorId so new employee is under the manager.
 */
const AddEditEmployeeModal = ({
  isOpen,
  onClose,
  mode = "add",
  initialData = null,
  departmentsList = [],
  positionsList = [],
  rolesList = [],
  departmentPositions: departmentPositionsProp,
  onSave,
  supervisorId = null,
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    department: "",
    position: "",
    role: "",
    status: "Active",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const departmentOptions = departmentsList.map((d) => d.name || d.title).filter(Boolean);
  const roleOptions = rolesList.map((r) => r.name).filter(Boolean);

  const getAvailablePositions = () => {
    if (!formData.department || formData.department === "" || formData.department === "Select Department") return [];
    if (departmentPositionsProp && departmentPositionsProp[formData.department]) return departmentPositionsProp[formData.department];
    const dept = departmentsList.find((d) => (d.name || d.title) === formData.department);
    const filtered = dept
      ? positionsList.filter((p) => p.department_id === dept.id || (p.department_name || p.department) === formData.department)
      : positionsList;
    return (filtered.length ? filtered : positionsList).map((p) => p.title || p.name).filter(Boolean);
  };

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSuccess(false);
    if (mode === "edit" && initialData) {
      const o = initialData.originalData || initialData;
      const firstName = o?.first_name ?? (initialData.name || "").split(" ")[0] ?? "";
      const lastName = o?.last_name ?? (initialData.name || "").split(" ").slice(1).join(" ") ?? "";
      setFormData({
        firstName,
        lastName,
        department: initialData.department && initialData.department !== "—" ? initialData.department : "",
        position: initialData.position && initialData.position !== "—" ? initialData.position : "",
        role: initialData.role && initialData.role !== "—" ? initialData.role : "",
        status: initialData.status || "Active",
      });
      setPhotoFile(null);
      setPhotoPreview(null);
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        department: "",
        position: "",
        role: "",
        status: "Active",
      });
      setPhotoFile(null);
      setPhotoPreview(null);
    }
  }, [isOpen, mode, initialData?.id]);

  const handleDepartmentChange = (e) => {
    const v = e.target.value;
    setFormData((prev) => ({ ...prev, department: v, position: "" }));
  };

  const handlePhotoClick = () => fileInputRef.current?.click();
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (e.g. JPG, PNG).");
      return;
    }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError(null);
    e.target.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      setError("First name and last name are required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      let departmentId = null,
        positionId = null,
        roleId = null;
      const deptName = formData.department && formData.department !== "Select Department" ? formData.department : null;
      const posTitle = formData.position && formData.position !== "Select Position" ? formData.position : null;
      const roleName = formData.role && formData.role !== "Select Role" ? formData.role : null;
      if (deptName && departmentsList.length) {
        const found = departmentsList.find((d) => (d.name || d.title || "").trim() === deptName.trim());
        if (found?.id) departmentId = found.id;
      }
      if (posTitle && positionsList.length) {
        const found = positionsList.find((p) => (p.title || p.name || "").trim() === posTitle.trim());
        if (found?.id) positionId = found.id;
      }
      if (roleName && rolesList.length) {
        const found = rolesList.find((r) => (r.name || "").trim() === roleName.trim());
        if (found?.id) roleId = found.id;
      }
      let avatarUrl = null;
      if (photoFile) {
        const uploaded = await uploadImage(photoFile);
        avatarUrl = typeof uploaded === "string" ? uploaded : Array.isArray(uploaded) ? uploaded[0] : uploaded?.url ?? uploaded?.image_url ?? null;
      } else if (mode === "edit" && initialData) {
        const o = initialData.originalData || initialData;
        avatarUrl = o?.avatar_url ?? o?.avatarUrl ?? null;
        if ((avatarUrl == null || avatarUrl === "") && initialData.photo && typeof initialData.photo === "string" && initialData.photo.startsWith("http")) {
          try {
            avatarUrl = new URL(initialData.photo).pathname;
          } catch {
            avatarUrl = null;
          }
        }
      }
      const payload = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        status: formData.status.toLowerCase(),
        ...(departmentId != null && { department_id: departmentId }),
        ...(positionId != null && { position_id: positionId }),
        ...(roleId != null && { role_id: roleId }),
        ...(avatarUrl != null && avatarUrl !== "" && { avatar_url: avatarUrl }),
      };
      if (mode === "add" && supervisorId) payload.supervisor_id = supervisorId;
      await onSave(payload);
      setSuccess(true);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoFile(null);
      setPhotoPreview(null);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1200);
    } catch (err) {
      setError(err?.response?.data?.message ?? err?.message ?? (mode === "edit" ? "Failed to update." : "Failed to create."));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const title = mode === "edit" ? "Edit Employee" : "Add Employee";
  const defaultPhoto = mode === "edit" && initialData?.photo ? initialData.photo : DefaultProfileImage;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleClose}>
      <style>{`
        select option:checked { background-color: #E5E7EB !important; color: #000000 !important; }
        select option:hover { background-color: #F5F7FA; }
      `}</style>
      <div className="bg-white rounded-[10px] relative mx-[16px] w-full max-w-[500px]" onClick={(e) => e.stopPropagation()}>
        <div className="px-[32px] py-[24px] flex items-center justify-between border-b border-[#E0E0E0]">
          <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "24px", color: "#003934" }}>{title}</h2>
          <button type="button" onClick={handleClose} className="w-[32px] h-[32px] rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] flex items-center justify-center transition-colors">
            <svg className="w-[16px] h-[16px] text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-[32px]">
          <div className="flex justify-start mb-[30px]">
            <div className="relative">
              <div
                className="w-[120px] h-[120px] rounded-full bg-[#F5F5F5] flex items-center justify-center overflow-hidden"
                style={{ backgroundImage: !photoPreview ? "repeating-linear-gradient(45deg, #E0E0E0 0px, #E0E0E0 10px, #F5F5F5 10px, #F5F5F5 20px)" : "none" }}
              >
                <img src={photoPreview || defaultPhoto} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={handlePhotoClick}
                className="absolute bottom-0 right-0 w-[24px] h-[24px] bg-white rounded-full flex items-center justify-center border-2 border-white cursor-pointer hover:bg-gray-50"
                style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
              >
                <img src={CameraIcon} alt="Choose photo" className="w-[16px] h-[16px] object-contain" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-[16px] p-[12px] rounded-[8px] bg-red-50 border border-red-200">
                <p className="text-[14px] text-red-600">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-[16px] p-[12px] rounded-[8px] bg-green-50 border border-green-200">
                <p className="text-[14px] text-green-600">{mode === "edit" ? "Employee updated successfully!" : "Employee created successfully!"}</p>
              </div>
            )}
            <div className="space-y-[16px]">
              <div className="flex items-center">
                <label className="flex-shrink-0 mr-[12px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "100%", color: "#181818", width: "100px" }}>First Name</label>
                <input
                  type="text"
                  placeholder="Enter the First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  className="flex-1 focus:outline-none bg-white"
                  style={{ height: "26px", padding: "0 12px", borderRadius: "4px", border: "0.8px solid #939393", fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#000000" }}
                />
              </div>
              <div className="flex items-center">
                <label className="flex-shrink-0 mr-[12px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "100%", color: "#181818", width: "100px" }}>Last Name</label>
                <input
                  type="text"
                  placeholder="Enter the Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  className="flex-1 focus:outline-none bg-white"
                  style={{ height: "26px", padding: "0 12px", borderRadius: "4px", border: "0.8px solid #939393", fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6B7280" }}
                />
              </div>
              <div className="flex items-center">
                <label className="flex-shrink-0 mr-[12px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "100%", color: "#181818", width: "100px" }}>Department</label>
                <div className="relative flex-1">
                  <select
                    value={formData.department}
                    onChange={handleDepartmentChange}
                    className="w-full focus:outline-none bg-white appearance-none cursor-pointer"
                    style={{ height: "26px", padding: "0 12px", paddingRight: "32px", borderRadius: "4px", border: "0.8px solid #939393", fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#000000" }}
                  >
                    <option value="">Select Department</option>
                    {departmentOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex-shrink-0 mr-[12px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "100%", color: "#181818", width: "100px" }}>Role</label>
                <div className="relative flex-1">
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full focus:outline-none bg-white appearance-none cursor-pointer"
                    style={{ height: "26px", padding: "0 12px", paddingRight: "32px", borderRadius: "4px", border: "0.8px solid #939393", fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#000000" }}
                  >
                    <option value="">Select Role</option>
                    {roleOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex-shrink-0 mr-[12px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "100%", color: "#181818", width: "100px" }}>Position</label>
                <div className="relative flex-1">
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                    disabled={!formData.department || formData.department === ""}
                    className="w-full focus:outline-none bg-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                    style={{ height: "26px", padding: "0 12px", paddingRight: "32px", borderRadius: "4px", border: "0.8px solid #939393", fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#000000" }}
                  >
                    <option value="">Select Position</option>
                    {getAvailablePositions().map((pos) => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                  <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex-shrink-0 mr-[12px]" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "16px", lineHeight: "100%", color: "#181818", width: "100px" }}>Status</label>
                <div className="relative flex-1">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full focus:outline-none bg-white appearance-none cursor-pointer"
                    style={{ height: "26px", padding: "0 12px", paddingRight: "32px", borderRadius: "4px", border: "0.8px solid #939393", fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#000000" }}
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
            <div className="flex items-center justify-center gap-[12px] mt-[40px]">
              <button
                type="button"
                onClick={handleClose}
                className="px-[40px] py-[6px] rounded-[5px] hover:opacity-90 transition-opacity border border-[#B5B1B1]"
                style={{ backgroundColor: "#FFFFFF", color: "#737373", fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-[40px] py-[6px] rounded-[5px] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#00564F", color: "#FFFFFF", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", border: "1px solid #B5B1B1", boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)" }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEditEmployeeModal;
