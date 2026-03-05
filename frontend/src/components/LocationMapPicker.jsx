import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const DEFAULT_CENTER = [31.5, 34.4667];
const DEFAULT_ZOOM = 10;

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      if (typeof onSelect === "function") {
        onSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

/**
 * Interactive map: click to set location; lat/lng are filled automatically.
 * @param {string|number} latitude - Current latitude
 * @param {string|number} longitude - Current longitude
 * @param {function(lat: number, lng: number)} onSelect - Called when user clicks on map
 * @param {string} [className] - Optional class for container
 * @param {number} [height=200] - Map height in px
 */
const LocationMapPicker = ({ latitude, longitude, onSelect, className = "", height = 200 }) => {
  const lat = useMemo(() => {
    const n = parseFloat(latitude);
    return Number.isFinite(n) ? n : null;
  }, [latitude]);
  const lng = useMemo(() => {
    const n = parseFloat(longitude);
    return Number.isFinite(n) ? n : null;
  }, [longitude]);

  const center = useMemo(() => {
    if (lat != null && lng != null) return [lat, lng];
    return DEFAULT_CENTER;
  }, [lat, lng]);

  const zoom = lat != null && lng != null ? 14 : DEFAULT_ZOOM;

  return (
    <div className={className} style={{ height: `${height}px`, width: "100%", borderRadius: "8px", overflow: "hidden", border: "1px solid #E0E0E0" }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onSelect={onSelect} />
        {lat != null && lng != null && <Marker position={[lat, lng]} />}
      </MapContainer>
    </div>
  );
};

export default LocationMapPicker;
