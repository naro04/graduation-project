import React, { useState, useEffect } from "react";

// Icons
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href; // Reusing delete icon

const EditActivityModal = ({ isOpen, onClose, activity, locations, employees }) => {
    // Form state
    const [formData, setFormData] = useState({
        activityName: "",
        location: "",
    });
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [numberOfDays, setNumberOfDays] = useState(1);
    const [activityDates, setActivityDates] = useState([""]);
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);

    // Populate form data when opening
    useEffect(() => {
        if (isOpen && activity) {
            setFormData({
                activityName: activity.name || "",
                location: activity.locationName || "", // Assuming locationName is available in activity object or passed correctly
            });
            // Mocking selected employees for now as IDs 1, 2, 3 based on sample
            setSelectedEmployees([1, 2, 3]);

            // Handle dates
            // If activity has date range, generate dates. Otherwise default.
            // Simplified logic based on previous page logic
            setNumberOfDays(2); // Example default based on screenshot "2 day"
            setActivityDates(["2025-12-19", "2025-12-19"]); // Example dates based on screenshot
        }
    }, [isOpen, activity]);

    // Update activity dates when number of days changes
    useEffect(() => {
        if (isOpen) {
            setActivityDates(prev => {
                const newDates = [...prev];
                if (numberOfDays > prev.length) {
                    return [...newDates, ...Array(numberOfDays - prev.length).fill("")];
                } else {
                    return newDates.slice(0, numberOfDays);
                }
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

    const handleDeleteDate = (index) => {
        const newDates = [...activityDates];
        newDates[index] = ""; // or splice if we want to remove the day entirely, but usually clears value
        // The previous logic spliced and reduced day count. Let's do that to match.
        newDates.splice(index, 1);
        setActivityDates(newDates);
        setNumberOfDays(newDates.length);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Update activity:', { ...formData, selectedEmployees, numberOfDays, activityDates });
        onClose();
    };

    const handleDeleteActivity = () => {
        console.log('Delete activity:', activity);
        setSelectedEmployees([]);
        setShowDeleteWarning(false);
        onClose();
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
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
                className="bg-white rounded-[8px] w-full max-w-[550px] max-h-[90vh] overflow-hidden relative flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-[24px] pb-[10px] border-b border-[#E0E0E0]">
                    <h2 className="text-[24px] font-semibold text-[#003934]">Edit {formData.activityName}</h2>
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
                            {/* Activity Name */}
                            <div className="flex flex-col">
                                <label className="text-[14px] text-[#6B7280] mb-[4px]">
                                    Activity Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.activityName}
                                    onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                                    className="focus:outline-none bg-white w-full border border-[#939393] rounded-[4px] px-[12px] h-[36px] text-[#000000] text-[14px]"
                                />
                            </div>

                            {/* Location */}
                            <div className="flex flex-col">
                                <label className="text-[14px] text-[#6B7280] mb-[4px]">
                                    Location
                                </label>
                                <div className="relative">
                                    <select
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="focus:outline-none bg-white appearance-none cursor-pointer w-full border border-[#939393] rounded-[4px] px-[12px] pr-[32px] h-[36px] text-[#000000] text-[14px]"
                                    >
                                        <option value="" disabled>Select Location</option>
                                        {locations.map((location) => (
                                            <option key={location} value={location}>{location}</option>
                                        ))}
                                    </select>
                                    <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#939393] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>

                            {/* Assign Employee */}
                            <div className="flex flex-col">
                                <label className="text-[14px] font-semibold text-[#181818] mb-[4px]">
                                    Assign Employee
                                </label>
                                <div
                                    className="bg-white border border-[#939393] rounded-[4px] w-full h-[150px] overflow-y-auto"
                                >
                                    <div className="p-[12px] space-y-[12px]">
                                        {employees.map((employee) => (
                                            <div key={employee.id} className="flex items-center gap-[12px] border-b border-[#F0F0F0] pb-[8px] last:border-0 last:pb-0">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEmployees.includes(employee.id)}
                                                    onChange={() => handleEmployeeCheckboxChange(employee.id)}
                                                    className="w-[16px] h-[16px] rounded border-[#E0E0E0] flex-shrink-0 cursor-pointer"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[13px] font-semibold text-black mb-[2px]">
                                                        {employee.name}
                                                    </div>
                                                    <div className="text-[11px] text-gray-500">
                                                        {employee.role}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-[4px] text-[12px] text-[#6B7280]">
                                    {selectedEmployees.length} employee(s) selected
                                </div>
                            </div>

                            {/* Number of Activity Days */}
                            <div className="flex flex-col">
                                <label className="text-[14px] font-semibold text-[#181818] mb-[4px]">
                                    Number of Activity Days
                                </label>
                                <div className="relative">
                                    <select
                                        value={numberOfDays}
                                        onChange={(e) => setNumberOfDays(parseInt(e.target.value))}
                                        className="focus:outline-none bg-white appearance-none cursor-pointer w-full border border-[#939393] rounded-[4px] px-[12px] pr-[32px] h-[36px] text-[#000000] text-[14px]"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                                            <option key={day} value={day}>
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
                                <label className="text-[14px] font-semibold text-[#181818] mb-[4px]">
                                    Activity Dates
                                </label>
                                <div className="space-y-[12px]">
                                    {activityDates.map((date, index) => (
                                        <div key={index} className="flex flex-col">
                                            <label className="text-[12px] text-[#6B7280] mb-[4px]">
                                                Day {index + 1}
                                            </label>
                                            <div className="flex gap-[8px] items-center">
                                                <div className="relative w-full">
                                                    <input
                                                        type="date"
                                                        value={date}
                                                        onChange={(e) => {
                                                            const newDates = [...activityDates];
                                                            newDates[index] = e.target.value;
                                                            setActivityDates(newDates);
                                                        }}
                                                        className="focus:outline-none bg-white w-full border border-[#939393] rounded-[4px] px-[12px] pr-[40px] h-[36px] text-[#000000] text-[14px] cursor-pointer"
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
                                                        className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#6B7280] hover:text-[#4B5563] cursor-pointer"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                                        </svg>
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteDate(index)}
                                                    className="w-[36px] h-[36px] flex items-center justify-center border border-[#939393] rounded-[4px] hover:bg-gray-50"
                                                >
                                                    <img src={DeleteIcon} alt="Delete" className="w-[16px] h-[16px] object-contain" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex items-center justify-between mt-[32px] pt-[20px]">
                            <button
                                type="button"
                                onClick={() => setShowDeleteWarning(true)}
                                className="w-[100px] h-[34px] rounded-[5px] bg-white border border-[#D32F2F] text-[#D32F2F] font-semibold text-[14px] hover:bg-red-50 transition-colors"
                            >
                                Delete
                            </button>
                            <div className="flex items-center gap-[12px]">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-[100px] h-[34px] rounded-[5px] bg-white border border-[#B5B1B1] text-[#000000] font-semibold text-[14px] hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="w-[100px] h-[34px] rounded-[5px] bg-[#00564F] border border-[#B5B1B1] text-white font-semibold text-[14px] hover:opacity-90 transition-opacity"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Delete Warning Modal */}
            {showDeleteWarning && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]"
                    onClick={() => setShowDeleteWarning(false)}
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
                                onClick={handleDeleteActivity}
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
                                onClick={() => setShowDeleteWarning(false)}
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
};

export default EditActivityModal;
