const pool = require('../database/connection');
const gpsQueries = require('../database/data/queries/gpsVerification');
const { calculateDistance, getGPSStatus } = require('../utils/calculateDistance');

exports.getGPSVerifications = async (req, res) => {
    try {
        const { date, status, search, page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const result = await pool.query(gpsQueries.getGPSVerificationsQuery, [
            date || null,
            status || null,
            search || null,
            parseInt(limit),
            offset
        ]);

        // Get assigned location coordinates for each record
        const records = await Promise.all(result.rows.map(async (row) => {
            // Get the closest assigned location for this employee
            const locationsResult = await pool.query(gpsQueries.getEmployeeLocationsQuery, [row.employee_id]);
            let assignedLocation = null;
            
            if (locationsResult.rows.length > 0) {
                // Find the closest assigned location
                if (row.location_latitude && row.location_longitude) {
                    let minDistance = Infinity;
                    for (const loc of locationsResult.rows) {
                        if (loc.latitude && loc.longitude) {
                            const dist = calculateDistance(
                                row.location_latitude,
                                row.location_longitude,
                                loc.latitude,
                                loc.longitude
                            );
                            if (dist < minDistance) {
                                minDistance = dist;
                                assignedLocation = loc;
                            }
                        }
                    }
                } else {
                    assignedLocation = locationsResult.rows[0];
                }
            }

            return {
                ...row,
                location_name: row.location_address || assignedLocation?.name || '-',
                assigned_latitude: assignedLocation?.latitude || null,
                assigned_longitude: assignedLocation?.longitude || null,
                assigned_location_name: assignedLocation?.name || null
            };
        }));

        res.status(200).json({
            status: 'success',
            data: records,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: result.rows.length
            }
        });
    } catch (err) {
        console.error('Error fetching GPS verifications:', err);
        res.status(500).json({ message: 'Error fetching GPS verifications', error: err.message });
    }
};

exports.getGPSStats = async (req, res) => {
    try {
        const { date } = req.query;

        const result = await pool.query(gpsQueries.getGPSStatsQuery, [date || null]);
        const stats = result.rows[0] || {};

        res.status(200).json({
            status: 'success',
            data: {
                total_count: stats.total_logs || 0,
                verified_count: stats.verified_logs || 0,
                suspicious_count: stats.suspicious_logs || 0,
                rejected_count: stats.rejected_logs || 0,
                not_verified_count: stats.not_verified_logs || 0
            }
        });
    } catch (err) {
        console.error('Error fetching GPS stats:', err);
        res.status(500).json({ message: 'Error fetching GPS stats', error: err.message });
    }
};

exports.verifyGPS = async (req, res) => {
    try {
        const { attendance_id } = req.params;

        // Get attendance record
        const attendanceResult = await pool.query(gpsQueries.getAttendanceByIdQuery, [attendance_id]);
        if (attendanceResult.rows.length === 0) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        const attendance = attendanceResult.rows[0];

        // Check if GPS coordinates exist - if not, mark as Not Verified
        if (!attendance.location_latitude || !attendance.location_longitude) {
            const updateResult = await pool.query(gpsQueries.updateGPSStatusQuery, [
                null,
                'Not Verified',
                attendance_id
            ]);

            return res.status(200).json({
                status: 'success',
                message: 'GPS coordinates are not available. Marked as Not Verified.',
                data: {
                    ...updateResult.rows[0],
                    distance_from_base: null,
                    gps_status: 'Not Verified'
                }
            });
        }

        // Get employee's assigned locations
        const locationsResult = await pool.query(gpsQueries.getEmployeeLocationsQuery, [attendance.employee_id]);
        
        if (locationsResult.rows.length === 0) {
            // If no assigned locations, mark as "Not Verified"
            const updateResult = await pool.query(gpsQueries.updateGPSStatusQuery, [
                null,
                'Not Verified',
                attendance_id
            ]);

            return res.status(200).json({
                status: 'success',
                message: 'No assigned locations found. Marked as Not Verified.',
                data: {
                    ...attendance,
                    distance_from_base: null,
                    gps_status: 'Not Verified'
                }
            });
        }

        // Calculate distance to each assigned location and find the minimum
        let minDistance = Infinity;
        let closestLocation = null;
        let hasValidLocation = false;

        for (const location of locationsResult.rows) {
            if (location.latitude && location.longitude) {
                hasValidLocation = true;
                const distance = calculateDistance(
                    attendance.location_latitude,
                    attendance.location_longitude,
                    location.latitude,
                    location.longitude
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    closestLocation = location;
                }
            }
        }

        // If no locations have GPS coordinates, mark as Not Verified
        if (!hasValidLocation) {
            const updateResult = await pool.query(gpsQueries.updateGPSStatusQuery, [
                null,
                'Not Verified',
                attendance_id
            ]);

            return res.status(200).json({
                status: 'success',
                message: 'Assigned locations do not have GPS coordinates. Marked as Not Verified.',
                data: {
                    ...updateResult.rows[0],
                    distance_from_base: null,
                    gps_status: 'Not Verified'
                }
            });
        }

        // Determine GPS status based on minimum distance
        const gpsStatus = getGPSStatus(minDistance);

        // Update attendance record
        const updateResult = await pool.query(gpsQueries.updateGPSStatusQuery, [
            minDistance,
            gpsStatus,
            attendance_id
        ]);

        res.status(200).json({
            status: 'success',
            message: 'GPS verification completed',
            data: {
                ...updateResult.rows[0],
                closest_location: closestLocation ? {
                    id: closestLocation.id,
                    name: closestLocation.name,
                    address: closestLocation.address
                } : null
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error verifying GPS', error: err.message });
    }
};

exports.updateGPSStatus = async (req, res) => {
    try {
        const { attendance_id } = req.params;
        const { gps_status } = req.body;

        const validStatuses = ['Verified', 'Suspicious', 'Rejected', 'Not Verified'];
        if (!validStatuses.includes(gps_status)) {
            return res.status(400).json({ 
                message: 'Invalid GPS status. Must be one of: Verified, Suspicious, Rejected, Not Verified' 
            });
        }

        // Get attendance record
        const attendanceResult = await pool.query(gpsQueries.getAttendanceByIdQuery, [attendance_id]);
        if (attendanceResult.rows.length === 0) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        const attendance = attendanceResult.rows[0];

        // Update GPS status (preserve distance)
        const updateResult = await pool.query(
            `UPDATE attendance SET gps_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [gps_status, attendance_id]
        );

        res.status(200).json({
            status: 'success',
            message: 'GPS status updated successfully',
            data: updateResult.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: 'Error updating GPS status', error: err.message });
    }
};

