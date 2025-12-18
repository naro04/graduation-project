/**
 * Calculate the distance between two GPS coordinates using the Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters
    
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 * @param {number} degrees 
 * @returns {number} radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Determine GPS status based on distance
 * @param {number} distance - Distance in meters
 * @returns {string} GPS status: 'Verified', 'Suspicious', or 'Rejected'
 */
function getGPSStatus(distance) {
    if (distance <= 100) {
        return 'Verified';
    } else if (distance <= 200) {
        return 'Suspicious';
    } else {
        return 'Rejected';
    }
}

module.exports = {
    calculateDistance,
    getGPSStatus
};

