import React from "react";

// Icons
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;

// Activity images
const ActivityImage1 = new URL("../images/p3.jpg", import.meta.url).href;
const ActivityImage2 = new URL("../images/p1.jpg", import.meta.url).href;
const ActivityImage3 = new URL("../images/p2 (2).jpg", import.meta.url).href;

const ActivityDetailsModal = ({ activity, onClose, onDelete }) => {
    if (!activity) return null;

    // Format date
    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const day = d.getDate();
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const activityDetails = {
        location: activity.location || "Hattin School",
        coordinates: activity.coordinates || { lat: "31.50090", lng: "34.46710" },
        date: activity.date,
        duration: activity.duration || "2 hr",
        responsibleEmployee: activity.responsibleEmployee || "Ameer Jamal",
        team: activity.team || "Hasan Jaber, Rania Abed",
        status: activity.status || "Implemented",
        description: activity.description || "A planned workshop was implemented at Hattin School, targeting students through interactive and participatory methods. The activity was conducted as scheduled and achieved its intended objectives, with active engagement from participants."
    };

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/50" />

            <div
                className="bg-white rounded-[8px] relative z-50 w-full max-w-[700px] max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
                style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)' }}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-[16px] md:p-[24px] border-b border-[#E0E0E0]">
                    <div>
                        <h2
                            className="text-[18px] md:text-[20px] font-semibold text-[#003934]"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Activity Details [ <span className="text-[#477975]">{activity.activity}</span> ]
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#6B7280] hover:text-[#374151] transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-[24px]">
                    {/* Images */}
                    <div className="flex gap-[12px] mb-[24px] overflow-x-auto">
                        <img
                            src={ActivityImage1}
                            alt="Activity 1"
                            className="min-w-[150px] h-[150px] object-cover rounded-[4px]"
                        />
                        <img
                            src={ActivityImage2}
                            alt="Activity 2"
                            className="min-w-[150px] h-[150px] object-cover rounded-[4px]"
                        />
                        <img
                            src={ActivityImage3}
                            alt="Activity 3"
                            className="min-w-[150px] h-[150px] object-cover rounded-[4px]"
                        />
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-[12px] mb-[24px]">
                        <p className="text-[14px]">
                            <span className="font-medium text-[#374151]">Location :</span> <span className="text-[#6B7280]">{activityDetails.location}</span>
                        </p>
                        <p className="text-[14px]">
                            <span className="font-medium text-[#374151]">Assigned location coordinates :</span> <span className="text-[#6B7280]">Lat : {activityDetails.coordinates.lat} Lng : {activityDetails.coordinates.lng}</span>
                        </p>
                        <p className="text-[14px]">
                            <span className="font-medium text-[#374151]">Date :</span> <span className="text-[#6B7280]">{formatDate(activityDetails.date)}</span>
                        </p>
                        <p className="text-[14px]">
                            <span className="font-medium text-[#374151]">Duration :</span> <span className="text-[#6B7280]">{activityDetails.duration}</span>
                        </p>
                        <p className="text-[14px]">
                            <span className="font-medium text-[#374151]">Responsible Employee :</span> <span className="text-[#6B7280]">{activityDetails.responsibleEmployee}</span>
                        </p>
                        <p className="text-[14px]">
                            <span className="font-medium text-[#374151]">Team :</span> <span className="text-[#6B7280]">{activityDetails.team}</span>
                        </p>
                        <p className="text-[14px]">
                            <span className="font-medium text-[#374151]">Status :</span> <span className="text-[#6B7280]">{activityDetails.status}</span>
                        </p>
                    </div>

                    {/* Description */}
                    <div className="mb-[32px]">
                        <p className="text-[14px] font-medium text-[#374151] mb-[8px]">Description :</p>
                        <div className="p-[12px] border border-[#E0E0E0] rounded-[4px] bg-white" style={{ minHeight: '143px' }}>
                            <p className="text-[14px] text-[#6B7280] leading-relaxed">
                                {activityDetails.description}
                            </p>
                        </div>
                    </div>

                    {/* Buttons Footer */}
                    <div className="flex justify-center gap-[12px] md:gap-[16px] flex-wrap md:flex-nowrap">
                        <button
                            onClick={() => {
                                onClose();
                                onDelete(activity);
                            }}
                            className="px-[24px] py-[8px] rounded-[5px] flex items-center justify-center hover:bg-red-50 transition-colors w-full md:w-[180px] h-[40px]"
                            style={{
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 500,
                                fontSize: '14px',
                                backgroundColor: '#FFFFFF',
                                color: '#B70B0B',
                                border: '1px solid #B70B0B',
                                textAlign: 'center'
                            }}
                        >
                            Delete
                        </button>
                        <button
                            onClick={onClose}
                            className="px-[24px] py-[8px] rounded-[5px] flex items-center justify-center hover:bg-gray-50 transition-colors w-full md:w-[180px] h-[40px]"
                            style={{
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 500,
                                fontSize: '14px',
                                backgroundColor: '#FFFFFF',
                                color: '#7A7A7A',
                                border: '1px solid #B5B1B1',
                                textAlign: 'center'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityDetailsModal;
