import React from 'react';

// Icons
const EditIcon = new URL("../images/icons/edit6.png", import.meta.url).href;
const ViewIcon = new URL("../images/icons/eyewhite.png", import.meta.url).href;
const EmployeeIcon = new URL("../images/icons/employee2.png", import.meta.url).href; // Assuming this icon exists or reusing a similar one

const ViewActivitiesModal = ({ isOpen, onClose, locationName, activities = [], activitiesLoading = false, onEditActivity, onViewEmployees }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
            style={{ fontFamily: 'Inter, sans-serif' }}
        >
            <div
                className="bg-white rounded-[8px] w-full max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-[24px] pb-[16px] border-b border-[#E0E0E0] flex justify-between items-start">
                    <div>
                        <h2 className="text-[24px] font-semibold text-[#003934] mb-[4px]">
                            Activities at {locationName}
                        </h2>
                        <p className="text-[14px] text-[#6B7280]">
                            {activities.length} activities found
                        </p>
                    </div>
                    <button onClick={onClose} className="text-[#6B7280] hover:text-[#374151]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-[24px] bg-[#FFFFFF]">
                    <div className="space-y-[24px]">
                        {activitiesLoading ? (
                            <p className="text-center text-gray-500 py-8">Loading activities...</p>
                        ) : activities.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No activities found for this location.</p>
                        ) : (
                            activities.map((activity) => {
                                const name = activity.name ?? activity.activity_name ?? "";
                                const employeeCount = activity.employee_count ?? activity.employeeCount ?? 0;
                                const startDate = activity.start_date ?? activity.startDate ?? "";
                                const endDate = activity.end_date ?? activity.endDate ?? "";
                                const status = activity.status ?? "Active";
                                return (
                                <div
                                    key={activity.id}
                                    className="bg-white rounded-[12px] p-[20px] border border-[#E0E0E0] shadow-sm"
                                >
                                    <div className="flex justify-between items-start mb-[8px]">
                                        <h3 className="text-[18px] font-semibold text-[#181818]">
                                            {name}
                                        </h3>
                                        <span className={`px-[12px] py-[4px] rounded-[4px] text-[12px] font-medium ${status === 'Active'
                                            ? 'bg-[#E6F6F4] text-[#00564F]'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-[16px] mb-[16px] text-[14px] text-[#6B7280]">
                                        <div className="flex items-center gap-[6px]">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <path d="M13.3333 14V12.6667C13.3333 11.9594 13.0524 11.2811 12.5523 10.7811C12.0522 10.281 11.3739 10 10.6667 10H5.33333C4.62609 10 3.94781 10.281 3.44772 10.7811C2.94762 11.2811 2.66667 11.9594 2.66667 12.6667V14M10.6667 4.66667C10.6667 6.13943 9.47276 7.33333 8 7.33333C6.52724 7.33333 5.33333 6.13943 5.33333 4.66667C5.33333 3.19391 6.52724 2 8 2C9.47276 2 10.6667 3.19391 10.6667 4.66667Z" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            {employeeCount} employees
                                        </div>
                                        <span>
                                            {startDate} - {endDate}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-[12px]">
                                        <button
                                            className="flex items-center gap-[6px] px-[16px] py-[8px] bg-[#00897B] text-white rounded-[4px] text-[13px] font-medium hover:bg-[#00796B] transition-colors"
                                            onClick={() => {
                                                if (onViewEmployees) {
                                                    onViewEmployees(activity);
                                                }
                                            }}
                                        >
                                            <img src={ViewIcon} alt="" className="w-[14px] h-[14px] object-contain" />
                                            View Employees
                                        </button>
                                        <button
                                            className={`flex items-center gap-[6px] px-[16px] py-[8px] rounded-[4px] text-[13px] font-medium transition-colors ${activity.canEdit
                                                ? 'bg-[#AEAEAEB2] text-[#444444] hover:bg-opacity-80'
                                                : 'bg-[#C4C4C4] text-[#939292] cursor-not-allowed'
                                                }`}
                                            disabled={!activity.canEdit}
                                            onClick={() => {
                                                if (activity.canEdit && onEditActivity) {
                                                    onEditActivity(activity);
                                                }
                                            }}
                                        >
                                            <img src={EditIcon} alt="" className="w-[14px] h-[14px] object-contain" />
                                            Edit Activity
                                        </button>
                                    </div>

                                    {(activity.canEdit === false) && (
                                        <p className="mt-[12px] text-[12px] text-[#6B7280]">
                                            This activity cannot be edited as the end date has passed
                                        </p>
                                    )}
                                </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewActivitiesModal;
