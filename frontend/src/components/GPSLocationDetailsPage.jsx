import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Sidebar from "./Sidebar";
import { getEffectiveRole, getCurrentUser } from "../services/auth.js";

// Fix default marker icons in Leaflet with Vite/bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Action icons
const DeleteIcon = new URL("../images/icons/Delet.png", import.meta.url).href;
const WarningIcon = new URL("../images/icons/warnning.png", import.meta.url).href;

const roleDisplayNames = { superAdmin: "Super Admin", hr: "HR Admin", manager: "Manager", fieldEmployee: "Field Employee", officer: "Officer" };

function MapFitBounds({ current, assigned }) {
  const map = useMap();
  const hasCurrent = current && !Number.isNaN(current[0]) && !Number.isNaN(current[1]);
  const hasAssigned = assigned && !Number.isNaN(assigned[0]) && !Number.isNaN(assigned[1]);
  React.useEffect(() => {
    if (hasCurrent && hasAssigned) {
      try {
        map.fitBounds(L.latLngBounds(current, assigned), { padding: [24, 24], maxZoom: 16 });
      } catch (_) {}
    }
  }, [map, hasCurrent, hasAssigned, current, assigned]);
  return null;
}

const GPSLocationDetailsPage = ({ userRole = "superAdmin" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const effectiveRole = getEffectiveRole();
  const employee = location.state?.employee;
  const selectedDate = location.state?.date || new Date(2025, 11, 7);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Format date
  const formatDate = (date) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  if (!employee) {
    return (
      <div className="min-h-screen w-full bg-[#F5F7FA] flex items-center justify-center">
        <p>No employee data found</p>
      </div>
    );
  }

  const raw = employee.originalData ?? {};
  const parseNum = (v) => (v !== null && v !== undefined && v !== "" ? Number(v) : NaN);
  const currentLat = parseNum(raw.location_latitude);
  const currentLng = parseNum(raw.location_longitude);
  const assignedLat = parseNum(raw.assigned_latitude);
  const assignedLng = parseNum(raw.assigned_longitude);
  const hasCurrent = !Number.isNaN(currentLat) && !Number.isNaN(currentLng);
  const hasAssigned = !Number.isNaN(assignedLat) && !Number.isNaN(assignedLng);

  const mapCenter = useMemo(() => {
    if (hasCurrent) return [currentLat, currentLng];
    if (hasAssigned) return [assignedLat, assignedLng];
    return [31.5, 34.4667];
  }, [hasCurrent, hasAssigned, currentLat, currentLng, assignedLat, assignedLng]);

  // GPS Location data (for display below map)
  const gpsLocationData = {
    location: employee.location || raw.location_name || raw.location_address || "—",
    currentCoordinates: { lat: hasCurrent ? String(currentLat) : "—", lng: hasCurrent ? String(currentLng) : "—" },
    assignedCoordinates: { lat: hasAssigned ? String(assignedLat) : "—", lng: hasAssigned ? String(assignedLng) : "—" },
    distanceDifference: employee.distanceDifference ?? (raw.distance_from_base != null ? `${Math.round(Number(raw.distance_from_base))} m` : "—"),
    timestamp: `${employee.checkIn || ""} - ${formatDate(selectedDate)}`,
    status: employee.status ?? raw.gps_status ?? "—"
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA]" style={{ fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>
      <div className="hidden lg:flex min-h-screen" style={{ overflowX: 'hidden' }}>
        {/* Sidebar Component */}
        <Sidebar 
          userRole={effectiveRole}
          activeMenu="3-2"
          setActiveMenu={() => {}}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-[#F5F7FA]" style={{ minWidth: 0, maxWidth: '100%', overflowX: 'hidden' }}>
          {/* Header */}
          <header className="bg-white px-[40px] py-[24px]" style={{ minWidth: 0, maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
            <div className="flex items-center justify-between mb-[16px]" style={{ minWidth: 0, maxWidth: '100%' }}>
              <div className="relative flex-shrink-0">
                <svg className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input 
                  type="text"
                  placeholder="Search"
                  className="w-[280px] h-[44px] pl-[48px] pr-[16px] rounded-[10px] border border-[#E0E0E0] bg-white text-[14px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#004D40] transition-colors"
                  style={{ fontWeight: 400 }}
                />
              </div>
              
              <div className="flex items-center gap-[16px] flex-shrink-0">
                <button className="w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={new URL("../images/6946bb75eb51db75adabc0ccd83d4fe4c365858f.png", import.meta.url).href} alt="Messages" className="w-[20px] h-[20px] object-contain" />
                </button>
                <button className="relative w-[36px] h-[36px] rounded-[8px] bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                  <img src={new URL("../images/ebf8a1610effc5cf80410fb898c4452b8d535684.png", import.meta.url).href} alt="Notifications" className="w-[20px] h-[20px] object-contain" />
                  <span className="absolute top-[4px] right-[4px] w-[8px] h-[8px] bg-red-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-[12px] cursor-pointer">
                  <img 
                    src={new URL("../images/c3485c911ad8f5739463d77de89e5fedf4b2785c.jpg", import.meta.url).href}
                    alt="User"
                    className="w-[44px] h-[44px] rounded-full object-cover border-2 border-[#E5E7EB]"
                  />
                  <div>
                    <div className="flex items-center gap-[6px]">
                      <p className="text-[16px] font-semibold text-[#333333]">Hi, {currentUser?.name || currentUser?.full_name || currentUser?.firstName || "User"}!</p>
                      <img src={new URL("../images/f770524281fcd53758f9485b3556316915e91e7b.png", import.meta.url).href} alt="" className="w-[14px] h-[14px] object-contain" />
                    </div>
                    <p className="text-[12px] font-normal text-[#6B7280]">{roleDisplayNames[effectiveRole]}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Breadcrumb */}
            <div>
              <p className="text-[12px]" style={{ fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>
                <span style={{ color: '#B0B0B0' }}>Attendance</span>
                <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
                <span style={{ color: '#B0B0B0' }}>GPS Verifications</span>
                <span className="mx-[8px]" style={{ color: '#B0B0B0' }}>&gt;</span>
                <span style={{ color: '#8E8C8C' }}>GPS Location</span>
              </p>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-[36px] bg-[#F5F7FA]" style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%', boxSizing: 'border-box' }}>
            <div className="max-w-[700px] mx-auto relative">
              {/* Delete Icon - Top Right */}
              <button
                onClick={() => setShowWarningModal(true)}
                className="absolute top-0 w-[32px] h-[32px] flex items-center justify-center hover:opacity-70 transition-opacity"
                style={{
                  border: '0.8px solid #7A7A7A',
                  borderRadius: '5px',
                  right: '-80px'
                }}
                title="Delete"
              >
                <img src={DeleteIcon} alt="Delete" className="w-full h-full object-contain p-[2px]" />
              </button>

              {/* Header */}
              <div className="mb-[24px]">
                <h2 
                  className="text-[28px]"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    color: '#003934',
                    textAlign: 'left',
                    marginLeft: '20px'
                  }}
                >
                  GPS Location [ {employee.name} ]
                </h2>
              </div>

              {/* Map Section */}
              <div className="mb-[24px]" style={{ marginLeft: '20px' }}>
                <div 
                  className="rounded-[10px] overflow-hidden"
                  style={{ 
                    width: '430px',
                    height: '220px',
                    border: '1px solid #E0E0E0',
                    minHeight: '220px'
                  }}
                >
                  <MapContainer
                    center={mapCenter}
                    zoom={hasCurrent || hasAssigned ? 15 : 10}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapFitBounds
                      current={hasCurrent ? [currentLat, currentLng] : null}
                      assigned={hasAssigned ? [assignedLat, assignedLng] : null}
                    />
                    {hasCurrent && (
                      <Marker position={[currentLat, currentLng]}>
                        <Popup>Current check-in location</Popup>
                      </Marker>
                    )}
                    {hasAssigned && (
                      <Marker position={[assignedLat, assignedLng]}>
                        <Popup>Assigned location</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </div>

              {/* Location Details */}
              <div className="text-left space-y-[12px] mb-[32px]" style={{ marginLeft: '20px' }}>
                <p 
                  className="text-[14px]"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: '#4E4E4E'
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#2E2E2E' }}>Location:</span> {gpsLocationData.location}
                </p>
                <p 
                  className="text-[14px]"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: '#4E4E4E'
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#2E2E2E' }}>Current coordinates:</span> Lat : {gpsLocationData.currentCoordinates.lat} Lng : {gpsLocationData.currentCoordinates.lng}
                </p>
                <p 
                  className="text-[14px]"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: '#4E4E4E'
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#2E2E2E' }}>Assigned location coordinates:</span> Lat : {gpsLocationData.assignedCoordinates.lat} Lng : {gpsLocationData.assignedCoordinates.lng}
                </p>
                <p 
                  className="text-[14px]"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: '#4E4E4E'
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#2E2E2E' }}>Distance difference:</span> {gpsLocationData.distanceDifference}
                </p>
                <p 
                  className="text-[14px]"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: '#4E4E4E'
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#2E2E2E' }}>Timestamp:</span> {gpsLocationData.timestamp}
                </p>
                <p 
                  className="text-[14px]"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 400,
                    color: '#4E4E4E'
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#2E2E2E' }}>Status:</span> {gpsLocationData.status}
                </p>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => navigate('/attendance/gps')}
                  className="px-[24px] py-[8px] rounded-[5px] text-white flex items-center justify-center"
                  style={{ 
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    backgroundColor: '#7A7A7A',
                    border: '1px solid #B5B1B1',
                    width: '115px',
                    height: '34px',
                    marginRight: '-80px'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <p className="p-[24px] text-center text-[#6B7280]">Mobile view coming soon</p>
      </div>

      {/* Warning Modal */}
      {showWarningModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowWarningModal(false)}
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
              <img src={WarningIcon} alt="Warning" className="w-[73px] h-[61px] object-contain" />
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
                Are you Sure to delete this GPS Verification?
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
                onClick={() => {
                  console.log('Deleting employee attendance:', employee);
                  setShowWarningModal(false);
                  navigate('/attendance/gps');
                }}
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
                onClick={() => {
                  setShowWarningModal(false);
                }}
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

export default GPSLocationDetailsPage;

