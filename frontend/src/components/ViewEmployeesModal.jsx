import React from 'react';

// Employee Photos
const MohamedAliPhoto = new URL("../images/Mohamed Ali.jpg", import.meta.url).href;
const AmalAhmedPhoto = new URL("../images/Amal Ahmed.png", import.meta.url).href;
const AmjadSaeedPhoto = new URL("../images/Amjad Saeed.jpg", import.meta.url).href;
const JanaHassanPhoto = new URL("../images/Jana Hassan.jpg", import.meta.url).href;
const HasanJaberPhoto = new URL("../images/Hasan Jaber.jpg", import.meta.url).href;

const ViewEmployeesModal = ({ isOpen, onClose, activityName, employees = [], employeesLoading = false }) => {
    if (!isOpen) return null;

    // Mock employee photos mapping (in real app, this would come from employee data)
    const photoMap = {
        "Mohamed Ali": MohamedAliPhoto,
        "Amal Ahmed": AmalAhmedPhoto,
        "Amjad Saeed": AmjadSaeedPhoto,
        "Jana Hassan": JanaHassanPhoto,
        "Hasan Jaber": HasanJaberPhoto
    };

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
            style={{ fontFamily: 'Inter, sans-serif' }}
        >
            <div
                className="bg-white rounded-[8px] w-full max-w-[650px] max-h-[90vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-[24px] pb-[16px] border-b border-[#E0E0E0] flex justify-between items-start">
                    <div>
                        <h2 className="text-[24px] font-semibold text-[#003934] mb-[4px]">
                            Employees in {activityName}
                        </h2>
                        <p className="text-[14px] text-[#6B7280]">
                            {employees.length} Employees
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
                    {employeesLoading ? (
                        <p className="text-center text-gray-500 py-8">Loading employees...</p>
                    ) : employees.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No employees found for this activity.</p>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden md:block bg-white border border-[#E0E0E0] rounded-[4px] overflow-hidden">
                                {/* Table Header */}
                                <div
                                    className="grid grid-cols-[2fr_1fr_1fr] border-b border-[#E0E0E0]"
                                    style={{
                                        backgroundColor: '#ECEAEA'
                                    }}
                                >
                                    <div
                                        className="text-[14px] font-semibold text-left"
                                        style={{
                                            padding: '12px 16px',
                                            borderRight: '1px solid #E0E0E0',
                                            color: '#000000'
                                        }}
                                    >
                                        Employee Name
                                    </div>
                                    <div
                                        className="text-[14px] font-semibold text-center"
                                        style={{
                                            padding: '12px 16px',
                                            borderRight: '1px solid #E0E0E0',
                                            color: '#000000'
                                        }}
                                    >
                                        Department
                                    </div>
                                    <div
                                        className="text-[14px] font-semibold text-center"
                                        style={{
                                            padding: '12px 16px',
                                            color: '#000000'
                                        }}
                                    >
                                        Position
                                    </div>
                                </div>

                                {/* Table Rows */}
                                {employees.map((employee, index) => (
                                    <div
                                        key={employee.id || index}
                                        className={`grid grid-cols-[2fr_1fr_1fr] border-b border-[#E0E0E0] last:border-b-0 ${index % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'
                                            }`}
                                    >
                                        <div
                                            className="flex items-center gap-[12px]"
                                            style={{
                                                padding: '12px 16px',
                                                borderRight: '1px solid #E0E0E0'
                                            }}
                                        >
                                            <img
                                                src={photoMap[employee.name] || MohamedAliPhoto}
                                                alt={employee.name}
                                                className="w-[40px] h-[40px] rounded-full object-cover"
                                            />
                                            <span
                                                className="text-[14px]"
                                                style={{
                                                    color: '#000000'
                                                }}
                                            >
                                                {employee.name}
                                            </span>
                                        </div>
                                        <div
                                            className="flex items-center justify-center text-center text-[14px]"
                                            style={{
                                                padding: '12px 16px',
                                                borderRight: '1px solid #E0E0E0',
                                                color: '#000000'
                                            }}
                                        >
                                            {employee.department}
                                        </div>
                                        <div
                                            className="flex items-center justify-center text-center text-[14px]"
                                            style={{
                                                padding: '12px 16px',
                                                color: '#000000'
                                            }}
                                        >
                                            {employee.position}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-3">
                                {employees.map((employee, index) => (
                                    <div
                                        key={employee.id || index}
                                        className="bg-white border border-[#E0E0E0] rounded-[8px] p-4"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <img
                                                src={photoMap[employee.name] || MohamedAliPhoto}
                                                alt={employee.name}
                                                className="w-[48px] h-[48px] rounded-full object-cover"
                                            />
                                            <div className="flex-1">
                                                <h3 className="text-[15px] font-semibold text-[#000000] mb-1">
                                                    {employee.name}
                                                </h3>
                                                <p className="text-[13px] text-[#6B7280]">
                                                    {employee.department}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-3 border-t border-[#F0F0F0]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[12px] text-[#6B7280]">Position:</span>
                                                <span className="text-[13px] font-semibold text-[#000000]">
                                                    {employee.position}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewEmployeesModal;
