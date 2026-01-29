import React, { useState } from "react";

// Image
const MapImage = new URL("../images/bbf1cf76f80864eff2ed472fba9c341651a1964e.png", import.meta.url).href;

const AddLocationModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        type: "Office",
        status: "Active",
        latitude: "",
        longitude: ""
    });

    const handleMapClick = () => {
        // Simulating auto-fill of coordinates on map click
        // In a real app, this would get coordinates from the click event relative to the map projection
        setFormData(prev => ({
            ...prev,
            latitude: "31.5009",
            longitude: "34.4671"
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-[8px] w-full max-w-[450px] max-h-[90vh] overflow-y-auto relative"
                onClick={e => e.stopPropagation()}
                style={{ fontFamily: 'Inter, sans-serif' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-[20px] pb-[10px] border-b border-[#E0E0E0]">
                    <h2 className="text-[20px] font-semibold text-[#003934]">Add New Location</h2>
                    <button onClick={onClose} className="text-[#6B7280] hover:text-[#374151]">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-[24px] space-y-[16px]">
                    {/* Location Name */}
                    <div>
                        <label className="block text-[14px] font-medium text-[#181818] mb-[8px]">Location Name</label>
                        <input
                            type="text"
                            placeholder="Enter the Location Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-[36px] px-[12px] border border-[#E0E0E0] rounded-[4px] text-[14px] focus:outline-none focus:border-[#00564F]"
                        />
                    </div>

                    {/* Location Type */}
                    <div>
                        <label className="block text-[14px] font-medium text-[#181818] mb-[8px]">Location Type</label>
                        <div className="relative">
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full h-[36px] px-[12px] border border-[#E0E0E0] rounded-[4px] text-[14px] focus:outline-none focus:border-[#00564F] appearance-none bg-white cursor-pointer"
                            >
                                <option value="Office">Office</option>
                                <option value="Field">Field</option>
                            </select>
                            <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#6B7280] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Location Status */}
                    <div>
                        <label className="block text-[14px] font-medium text-[#181818] mb-[8px]">Location Status</label>
                        <div className="relative">
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full h-[36px] px-[12px] border border-[#E0E0E0] rounded-[4px] text-[14px] focus:outline-none focus:border-[#00564F] appearance-none bg-white cursor-pointer"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                            <svg className="absolute right-[12px] top-1/2 -translate-y-1/2 w-[12px] h-[12px] text-[#6B7280] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Latitude */}
                    <div>
                        <label className="block text-[14px] font-medium text-[#181818] mb-[8px]">Latitude</label>
                        <input
                            type="text"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                            className="w-full h-[36px] px-[12px] border border-[#E0E0E0] rounded-[4px] text-[14px] focus:outline-none focus:border-[#00564F]"
                        />
                    </div>

                    {/* Longitude */}
                    <div>
                        <label className="block text-[14px] font-medium text-[#181818] mb-[8px]">Longitude</label>
                        <input
                            type="text"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                            className="w-full h-[36px] px-[12px] border border-[#E0E0E0] rounded-[4px] text-[14px] focus:outline-none focus:border-[#00564F]"
                        />
                    </div>

                    {/* Map Image */}
                    <div className="mt-[8px]">
                        <img
                            src={MapImage}
                            alt="Location Map"
                            className="w-full h-[120px] object-cover rounded-[8px] cursor-pointer hover:opacity-95 transition-opacity border border-[#E0E0E0]"
                            onClick={handleMapClick}
                            title="Click to set coordinates"
                        />
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex items-center gap-[12px] pt-[8px]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-[40px] border border-[#E0E0E0] rounded-[6px] text-[#374151] font-medium text-[14px] hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="flex-1 h-[40px] bg-[#00564F] rounded-[6px] text-white font-medium text-[14px] hover:bg-[#00423c] transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddLocationModal;
