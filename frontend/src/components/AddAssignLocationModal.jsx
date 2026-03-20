import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadImages } from "../services/uploads";

const UploadIcon = new URL("../images/icons/upload.png", import.meta.url).href;

const AddAssignLocationModal = ({ isOpen, onClose, locations = [], employees = [], assignableEmployees = null, assignableLoading = false, onResponsibleChange, onSave }) => {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        location: "",
        activityName: "",
        activityType: "Workshop",
        projectName: ""
    });
    const [responsibleEmployeeId, setResponsibleEmployeeId] = useState("");
    const [activityImageFiles, setActivityImageFiles] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [numberOfDays, setNumberOfDays] = useState(1);
    const [activityDates, setActivityDates] = useState([""]);
    const [saving, setSaving] = useState(false);
    const [validationError, setValidationError] = useState("");

    // List for "Assign Employee" checkboxes: use assignableEmployees (team of selected manager) when provided, else fallback to employees
    const listForAssign = assignableEmployees !== null && Array.isArray(assignableEmployees) ? assignableEmployees : (Array.isArray(employees) ? employees : []);

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setFormData({
                location: "",
                activityName: "",
                activityType: "Workshop",
                projectName: ""
            });
            setResponsibleEmployeeId("");
            setActivityImageFiles([]);
            setSelectedEmployees([]);
            setNumberOfDays(1);
            setActivityDates([""]);
            setValidationError("");
        }
    }, [isOpen]);

    // When responsible person changes, notify parent and clear selection (assignable list will change)
    const handleResponsibleChange = (e) => {
        const id = e.target.value || "";
        setResponsibleEmployeeId(id);
        setSelectedEmployees([]);
        if (typeof onResponsibleChange === "function") onResponsibleChange(id);
    };

    // Update activity dates when number of days changes
    useEffect(() => {
        if (isOpen) {
            setActivityDates(prev => {
                const newDates = Array.from({ length: numberOfDays }, (_, i) => prev[i] || "");
                return newDates;
            });
        }
    }, [numberOfDays, isOpen]);

    const handleEmployeeCheckboxChange = (employeeId) => {
        setSelectedEmployees(prev => {
            if (prev.includes(employeeId)) {
                return prev.filter(id => id !== employeeId);
            } else {
                return [...prev, employeeId];
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError("");
        const locationId = (formData.location || "").toString().trim();
        if (!locationId) {
            setValidationError("Please select a location.");
            return;
        }
        if (!selectedEmployees.length) {
            setValidationError("Please select at least one employee.");
            return;
        }
        if (!onSave) {
            onClose();
            return;
        }
        setSaving(true);
        try {
            let activityImageUrls = [];
            if (activityImageFiles.length > 0) {
                const urls = await uploadImages(activityImageFiles);
                activityImageUrls = Array.isArray(urls) ? urls : (urls ? [urls] : []);
            }
            const extra = {
                activityName: formData.activityName?.trim() || "",
                activityType: formData.activityType || "Workshop",
                projectName: formData.projectName?.trim() || "",
                responsibleEmployeeId: responsibleEmployeeId || null,
                activityImageUrls,
                numberOfDays,
                activityDates: activityDates.filter(Boolean),
            };
            const result = onSave(locationId, selectedEmployees, extra);
            if (result && typeof result.then === "function") {
                await result;
            }
            onClose();
        } catch (err) {
            setValidationError(err?.response?.data?.message || err?.message || "Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
            style={{ fontFamily: 'Inter, sans-serif' }}
        >
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

            <div
                className="bg-white rounded-[8px] w-full max-w-[550px] max-h-[90vh] overflow-y-auto relative flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-[24px] pb-[10px] border-b border-[#E0E0E0]">
                    <h2 className="text-[24px] font-semibold text-[#003934]">Add New Assign Location</h2>
                    <button onClick={onClose} className="text-[#6B7280] hover:text-[#374151]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-[24px] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-[24px]">
                            {/* Location */}
                            <div className="flex flex-col">
                                <label className="text-[16px] font-medium text-[#181818] mb-[8px]">
                                    Location
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="focus:outline-none bg-white appearance-none cursor-pointer w-full"
                                        style={{
                                            height: '36px',
                                            padding: '0 12px',
                                            paddingRight: '32px',
                                            borderRadius: '4px',
                                            border: '0.8px solid #939393',
                                            fontSize: '14px',
                                            color: formData.location ? '#000000' : '#9CA3AF'
                                        }}
                                    >
                                        <option value="" disabled style={{ color: '#9CA3AF' }}>Select Location</option>
                                        {(Array.isArray(locations) ? locations : []).map((loc) => {
                                            const id = typeof loc === 'object' ? (loc.id ?? loc.location_id) : loc;
                                            const name = typeof loc === 'object' ? (loc.name ?? loc.location_name ?? '') : String(loc);
                                            return <option key={id ?? name} value={id ?? name} style={{ color: '#727272' }}>{name || id}</option>;
                                        })}
                                    </select>
                                    <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate("/locations/all")}
                                    className="mt-[8px] text-[#0C8DFE] hover:underline text-left text-[14px]"
                                >
                                    + Add New Location
                                </button>
                            </div>

                            {/* Activity Name */}
                            <div className="flex flex-col">
                                <label className="text-[16px] font-medium text-[#181818] mb-[8px]">
                                    Activity Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.activityName}
                                    onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                                    placeholder="Enter Activity Name"
                                    className="focus:outline-none bg-white w-full"
                                    style={{
                                        height: '36px',
                                        padding: '0 12px',
                                        borderRadius: '4px',
                                        border: '0.8px solid #939393',
                                        fontSize: '14px',
                                        color: '#000000'
                                    }}
                                />
                            </div>

                            {/* Activity Type */}
                            <div className="flex flex-col">
                                <label className="text-[16px] font-medium text-[#181818] mb-[8px]">
                                    Activity Type
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.activityType}
                                        onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                                        className="focus:outline-none bg-white appearance-none cursor-pointer w-full"
                                        style={{
                                            height: '36px',
                                            padding: '0 12px',
                                            paddingRight: '32px',
                                            borderRadius: '4px',
                                            border: '0.8px solid #939393',
                                            fontSize: '14px',
                                            color: '#000000'
                                        }}
                                    >
                                        <option value="Workshop" style={{ color: '#727272' }}>Workshop</option>
                                        <option value="Group Session" style={{ color: '#727272' }}>Group Session</option>
                                    </select>
                                    <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Project Name */}
                            <div className="flex flex-col">
                                <label className="text-[16px] font-medium text-[#181818] mb-[8px]">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.projectName}
                                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                                    placeholder="Enter project name"
                                    className="focus:outline-none bg-white w-full"
                                    style={{
                                        height: '36px',
                                        padding: '0 12px',
                                        borderRadius: '4px',
                                        border: '0.8px solid #939393',
                                        fontSize: '14px',
                                        color: '#000000'
                                    }}
                                />
                            </div>

                            {/* Responsible Person */}
                            <div className="flex flex-col">
                                <label className="text-[16px] font-medium text-[#181818] mb-[8px]">
                                    Responsible Person
                                </label>
                                <div className="relative">
                                    <select
                                        value={responsibleEmployeeId}
                                        onChange={handleResponsibleChange}
                                        className="focus:outline-none bg-white appearance-none cursor-pointer w-full"
                                        style={{
                                            height: '36px',
                                            padding: '0 12px',
                                            paddingRight: '32px',
                                            borderRadius: '4px',
                                            border: '0.8px solid #939393',
                                            fontSize: '14px',
                                            color: responsibleEmployeeId ? '#000000' : '#9CA3AF'
                                        }}
                                    >
                                        <option value="" disabled style={{ color: '#9CA3AF' }}>Select responsible person</option>
                                        {(Array.isArray(employees) ? employees : []).map((emp) => (
                                            <option key={emp.id} value={emp.id} style={{ color: '#727272' }}>{emp.name}</option>
                                        ))}
                                    </select>
                                    {Array.isArray(employees) && employees.length === 0 && (
                                        <p className="text-[13px] text-[#6B7280] mt-1">
                                            No managers in the system. Go to <strong>User Management → Employees</strong>, add or edit a user and set <strong>Role</strong> to <strong>Manager</strong>.
                                        </p>
                                    )}
                                    <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Activity Images */}
                            <div className="flex flex-col">
                                <label className="text-[16px] font-medium text-[#181818] mb-[8px]">
                                    Activity Images
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        id="activity-images-upload"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => setActivityImageFiles(e.target.files ? Array.from(e.target.files) : [])}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="activity-images-upload"
                                        className="w-full min-h-[120px] border-2 border-dashed border-[#E0E0E0] rounded-[5px] flex flex-col items-center justify-center cursor-pointer hover:border-[#004D40] transition-colors bg-[#FAFAFA]"
                                    >
                                        <img src={UploadIcon} alt="Upload" className="w-[32px] h-[32px] mb-[8px] object-contain" />
                                        {activityImageFiles.length > 0 ? (
                                            <p
                                                className="text-center px-[16px]"
                                                style={{
                                                    fontFamily: 'Inter, sans-serif',
                                                    fontSize: '14px',
                                                    fontWeight: 400,
                                                    color: '#6B7280'
                                                }}
                                            >
                                                {activityImageFiles.length} image(s) selected
                                            </p>
                                        ) : (
                                            <div className="flex flex-col items-center gap-[4px]">
                                                <p
                                                    className="text-center px-[16px]"
                                                    style={{
                                                        fontFamily: 'Inter, sans-serif',
                                                        fontSize: '14px',
                                                        fontWeight: 400,
                                                        color: '#6B6B6B'
                                                    }}
                                                >
                                                    Click to upload or drag and drop
                                                </p>
                                                <p
                                                    className="text-center px-[16px]"
                                                    style={{
                                                        fontFamily: 'Inter, sans-serif',
                                                        fontSize: '14px',
                                                        fontWeight: 400,
                                                        color: '#949494'
                                                    }}
                                                >
                                                    Images only
                                                </p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Assign Employee — only team members of selected responsible manager (backend: must be supervised by responsible) */}
                            <div className="flex flex-col">
                                <label className="text-[16px] font-medium text-[#181818] mb-[8px]">
                                    Assign Employee
                                </label>
                                <div
                                    className="bg-white border border-[#939393] rounded-[4px] w-full"
                                    style={{
                                        height: '200px',
                                        overflowY: 'auto',
                                        overflowX: 'hidden'
                                    }}
                                >
                                    <div className="p-[12px] space-y-[12px]">
                                        {!responsibleEmployeeId && (
                                            <p className="text-[14px] text-[#6B7280]">Select responsible person first, then choose employees from their team.</p>
                                        )}
                                        {responsibleEmployeeId && assignableLoading && (
                                            <p className="text-[14px] text-[#6B7280]">Loading team members…</p>
                                        )}
                                        {responsibleEmployeeId && !assignableLoading && listForAssign.length === 0 && (
                                            <p className="text-[14px] text-[#6B7280]">No team members for this manager.</p>
                                        )}
                                        {listForAssign.map((employee) => (
                                            <div key={employee.id} className="flex items-center gap-[12px]">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEmployees.includes(employee.id)}
                                                    onChange={() => handleEmployeeCheckboxChange(employee.id)}
                                                    className="w-[16px] h-[16px] rounded border-[#E0E0E0] flex-shrink-0 cursor-pointer"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[14px] font-medium text-black mb-[2px]">
                                                        {employee.name}
                                                    </div>
                                                    <div className="text-[12px] text-gray-500">
                                                        {employee.role}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-[8px] text-[14px] text-gray-500">
                                    {selectedEmployees.length} employee(s) selected
                                </div>
                            </div>

                            {/* Number of Activity Days */}
                            <div className="flex flex-col">
                                <label className="text-[16px] font-medium text-[#181818] mb-[8px]">
                                    Number of Activity Days
                                </label>
                                <div className="relative">
                                    <select
                                        value={numberOfDays}
                                        onChange={(e) => setNumberOfDays(parseInt(e.target.value))}
                                        className="focus:outline-none bg-white appearance-none cursor-pointer w-full"
                                        style={{
                                            height: '36px',
                                            padding: '0 12px',
                                            paddingRight: '32px',
                                            borderRadius: '4px',
                                            border: '0.8px solid #939393',
                                            fontSize: '14px',
                                            color: '#000000'
                                        }}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                            <option key={day} value={day} style={{ color: '#727272' }}>
                                                {day} {day === 1 ? 'day' : 'days'}
                                            </option>
                                        ))}
                                    </select>
                                    <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Activity Dates */}
                            <div className="flex flex-col">
                                <label className="text-[16px] font-medium text-[#181818] mb-[8px]">
                                    Activity Dates
                                </label>
                                <div className="space-y-[12px]">
                                    {activityDates.map((date, index) => (
                                        <div key={index} className="flex flex-col">
                                            <label className="text-[14px] font-medium text-[#181818] mb-[8px]">
                                                Day {index + 1}
                                            </label>
                                            <div className="relative w-full">
                                                <input
                                                    type="date"
                                                    value={date}
                                                    onChange={(e) => {
                                                        const newDates = [...activityDates];
                                                        newDates[index] = e.target.value;
                                                        setActivityDates(newDates);
                                                    }}
                                                    className="focus:outline-none bg-white w-full cursor-pointer"
                                                    style={{
                                                        height: '36px',
                                                        padding: '0 12px',
                                                        paddingRight: '40px',
                                                        borderRadius: '4px',
                                                        border: '0.8px solid #939393',
                                                        fontSize: '14px',
                                                        color: '#000000'
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
                                                    className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity z-10"
                                                >
                                                    <svg className="w-[16px] h-[16px] text-[#939393]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {validationError && (
                            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                {validationError}
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-[20px] mt-[32px]">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
                                className="w-[164px] h-[34px] rounded-[5px] bg-white border border-[#B5B1B1] text-[#000000] font-semibold text-[16px] flex items-center justify-center hover:bg-gray-50 transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.25)] disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-[170px] h-[34px] rounded-[5px] bg-[#00564F] border border-[#B5B1B1] text-white font-semibold text-[16px] flex items-center justify-center hover:opacity-90 transition-opacity shadow-[0_2px_4px_rgba(0,0,0,0.25)] disabled:opacity-60"
                            >
                                {saving ? "Saving..." : "Assign Location"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddAssignLocationModal;
