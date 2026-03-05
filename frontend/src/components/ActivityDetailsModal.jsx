import React, { useState, useEffect } from "react";
import { getLocationActivityById } from "../services/locationActivities";
import { apiClient } from "../services/apiClient";

// Icons
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;

// Fallback placeholder images (only when API returns no images)
const PlaceholderImage = new URL("../images/p3.jpg", import.meta.url).href;

function getUploadsBaseUrl() {
    const b = apiClient.defaults.baseURL || "";
    return b.replace(/\/api\/v1\/?$/, "") || window.location.origin;
}

/** Build full image URLs from API (activity_image_urls, activity_images, image_urls) or parse paths from description */
function getActivityImageUrls(api) {
    if (!api) return [];
    const base = getUploadsBaseUrl();
    const raw = api.activity_image_urls ?? api.activity_images ?? api.image_urls ?? api.images;
    let urls = Array.isArray(raw) ? raw : typeof raw === "string" ? [raw] : [];
    urls = urls.map((u) => {
        if (typeof u !== "string" || !u.trim()) return null;
        if (/^https?:\/\//i.test(u)) return u;
        const path = u.startsWith("/") ? u : `/${u}`;
        return `${base}${path}`;
    }).filter(Boolean);
    const desc = api.description || "";
    const pathRegex = /(?:^|[\s\n])((?:\.?\.?\/)?(?:v\/)?uploads\/[^\s\n]+?\.(?:jpe?g|png|gif|webp))/gi;
    let match;
    while ((match = pathRegex.exec(desc)) !== null) {
        const path = match[1].replace(/^\.\//, "").replace(/^v\//, "/");
        const full = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : "/" + path}`;
        if (!urls.includes(full)) urls.push(full);
    }
    return urls;
}

// Normalize API response: same field names as backend may use latitude/longitude, assigned_*, location_*, etc.
function getCoordsFromApi(a) {
    const lat = a?.coordinates?.lat ?? a?.latitude ?? a?.location_latitude ?? a?.assigned_latitude ?? a?.location?.latitude ?? "";
    const lng = a?.coordinates?.lng ?? a?.longitude ?? a?.location_longitude ?? a?.assigned_longitude ?? a?.location?.longitude ?? "";
    const latStr = lat != null && String(lat).trim() !== "" ? String(lat) : "—";
    const lngStr = lng != null && String(lng).trim() !== "" ? String(lng) : "—";
    return { lat: latStr, lng: lngStr };
}

function buildDetailsFromApi(api) {
    if (!api) return null;
    const coords = getCoordsFromApi(api);
    const startDate = api.start_date ?? api.startDate ?? api.date;
    const durRaw = api.duration ?? api.duration_hours ?? api.duration_hours_count;
    const duration = durRaw != null && String(durRaw).trim() !== "" ? (typeof durRaw === "number" ? `${durRaw} hr` : String(durRaw)) : "—";
    const team = Array.isArray(api.team) ? api.team.join(", ") : (typeof api.team === "string" ? api.team : (api.team_members ?? "—"));
    const respName = api.responsible_employee ?? api.responsibleEmployee ?? api.responsible_employee_name ?? api.employee_name ?? (api.responsible_employee_id ? "—" : "—");
    const respFromObj = api.responsible_employee_obj ?? api.responsibleEmployeeObj;
    const responsibleEmployee = typeof respFromObj === "object" && respFromObj?.name != null ? respFromObj.name : (respName || "—");
    return {
        location: api.location_name ?? api.location ?? "—",
        coordinates: coords,
        date: startDate,
        duration,
        responsibleEmployee,
        team,
        status: api.status ?? "—",
        description: api.description ?? "—",
    };
}

const ActivityDetailsModal = ({ activity, onClose, onDelete }) => {
    const [detailsFromApi, setDetailsFromApi] = useState(null);
    const [rawApiData, setRawApiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!activity?.id) {
            setDetailsFromApi(null);
            setRawApiData(null);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setError(null);
        getLocationActivityById(activity.id)
            .then((data) => {
                if (!cancelled) {
                    setRawApiData(data);
                    setDetailsFromApi(buildDetailsFromApi(data));
                }
            })
            .catch((err) => {
                if (!cancelled) setError(err?.message ?? "Failed to load activity details.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [activity?.id]);

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

    const fallback = {
        location: activity.location || "—",
        coordinates: (() => {
            const c = activity.coordinates || {};
            const lat = c.lat != null && String(c.lat).trim() !== "" ? c.lat : "—";
            const lng = c.lng != null && String(c.lng).trim() !== "" ? c.lng : "—";
            return { lat, lng };
        })(),
        date: activity.date,
        duration: activity.duration || "—",
        responsibleEmployee: activity.responsibleEmployee || "—",
        team: activity.team || "—",
        status: activity.status || "—",
        description: activity.description || "—",
    };
    const activityDetails = detailsFromApi ?? fallback;
    const imageUrls = getActivityImageUrls(rawApiData ?? activity);
    const showPlaceholders = imageUrls.length === 0;
    const descriptionText = (activityDetails.description || "").replace(/(?:^|[\s\n])((?:\.?\.?\/)?(?:v\/)?uploads\/[^\s\n]+?\.(?:jpe?g|png|gif|webp)\s*)/gim, "").trim() || "—";

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
                    {loading && (
                        <div className="flex items-center justify-center py-12 text-[#6B7280] text-[14px]">
                            Loading activity details…
                        </div>
                    )}
                    {error && !loading && (
                        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-[14px]">
                            {error}
                        </div>
                    )}
                    {!loading && (
                        <>
                    {/* Images: show uploaded/API images; only show placeholder when none */}
                    <div className="flex gap-[12px] mb-[24px] overflow-x-auto">
                        {imageUrls.length > 0 ? (
                            imageUrls.map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    alt={`Activity ${i + 1}`}
                                    className="min-w-[150px] h-[150px] object-cover rounded-[4px]"
                                    onError={(e) => { e.target.style.display = "none"; }}
                                />
                            ))
                        ) : showPlaceholders ? (
                            <img
                                src={PlaceholderImage}
                                alt="Activity"
                                className="min-w-[150px] h-[150px] object-cover rounded-[4px] opacity-60"
                            />
                        ) : null}
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
                                {descriptionText}
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityDetailsModal;
