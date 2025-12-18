const pool = require('../database/connection');
const attendanceQueries = require('../database/data/queries/attendance');
const gpsQueries = require('../database/data/queries/gpsVerification');
const { calculateDistance, getGPSStatus } = require('../utils/calculateDistance');

/**
 * Get employee record by user_id
 */
const getEmployeeByUserId = async (userId) => {
    const result = await pool.query(attendanceQueries.getEmployeeByUserIdQuery, [userId]);
    return result.rows[0];
};

/**
 * Determine daily status based on check-in time
 * Assuming 9:00 AM is the cutoff for being on time
 */
const getDailyStatus = (checkInTime) => {
    const hour = new Date(checkInTime).getHours();
    const minute = new Date(checkInTime).getMinutes();
    const checkInMinutes = hour * 60 + minute;
    const onTimeMinutes = 9 * 60; // 9:00 AM
    
    if (checkInMinutes > onTimeMinutes) {
        return 'Late';
    }
    return 'Present';
};

/**
 * Verify GPS and update attendance record
 */
const verifyGPSForAttendance = async (attendanceId, employeeId, latitude, longitude) => {
    // Get employee's assigned locations
    const locationsResult = await pool.query(gpsQueries.getEmployeeLocationsQuery, [employeeId]);
    
    if (locationsResult.rows.length === 0) {
        // No assigned locations
        await pool.query(gpsQueries.updateGPSStatusQuery, [null, 'Not Verified', attendanceId]);
        return { distance: null, status: 'Not Verified' };
    }

    // Calculate distance to each assigned location and find the minimum
    let minDistance = Infinity;
    let hasValidLocation = false;

    for (const location of locationsResult.rows) {
        if (location.latitude && location.longitude) {
            hasValidLocation = true;
            const distance = calculateDistance(
                latitude,
                longitude,
                location.latitude,
                location.longitude
            );

            if (distance < minDistance) {
                minDistance = distance;
            }
        }
    }

    if (!hasValidLocation) {
        await pool.query(gpsQueries.updateGPSStatusQuery, [null, 'Not Verified', attendanceId]);
        return { distance: null, status: 'Not Verified' };
    }

    // Determine GPS status based on minimum distance
    const gpsStatus = getGPSStatus(minDistance);
    await pool.query(gpsQueries.updateGPSStatusQuery, [minDistance, gpsStatus, attendanceId]);
    
    return { distance: minDistance, status: gpsStatus };
};

exports.getMyAttendance = async (req, res) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const userId = req.user.id;

        const result = await pool.query(attendanceQueries.getMyAttendanceQuery, [
            userId,
            status || null,
            parseInt(limit),
            offset
        ]);

        res.status(200).json({
            status: 'success',
            data: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: result.rows.length
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching attendance', error: err.message });
    }
};

exports.checkIn = async (req, res) => {
    try {
        const { latitude, longitude, location_address, work_type } = req.body;
        const userId = req.user.id;

        // Get employee record
        const employee = await getEmployeeByUserId(userId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee record not found' });
        }

        // Check if already checked in today (without check-out)
        const todayAttendanceResult = await pool.query(attendanceQueries.getTodayAttendanceQuery, [userId]);
        if (todayAttendanceResult.rows.length > 0) {
            return res.status(400).json({ 
                message: 'You have already checked in today. Please check out first.' 
            });
        }

        // Determine daily status
        const checkInTime = new Date();
        const dailyStatus = getDailyStatus(checkInTime);

        // Create check-in record
        const checkInResult = await pool.query(attendanceQueries.createCheckInQuery, [
            employee.id,
            latitude || null,
            longitude || null,
            location_address || null,
            work_type || 'Office',
            dailyStatus,
            'Not Verified' // Will be updated after GPS verification
        ]);

        const attendance = checkInResult.rows[0];

        // Verify GPS if coordinates are provided
        if (latitude && longitude) {
            const gpsVerification = await verifyGPSForAttendance(
                attendance.id,
                employee.id,
                latitude,
                longitude
            );
            attendance.distance_from_base = gpsVerification.distance;
            attendance.gps_status = gpsVerification.status;
        } else {
            // No GPS coordinates provided
            await pool.query(gpsQueries.updateGPSStatusQuery, [null, 'Not Verified', attendance.id]);
            attendance.gps_status = 'Not Verified';
            attendance.distance_from_base = null;
        }

        res.status(201).json({
            status: 'success',
            message: 'Checked in successfully',
            data: attendance
        });
    } catch (err) {
        res.status(500).json({ message: 'Error during check-in', error: err.message });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get employee record
        const employee = await getEmployeeByUserId(userId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee record not found' });
        }

        // Get today's check-in record (without check-out)
        const todayAttendanceResult = await pool.query(attendanceQueries.getTodayAttendanceQuery, [userId]);
        if (todayAttendanceResult.rows.length === 0) {
            return res.status(400).json({ 
                message: 'No active check-in found. Please check in first.' 
            });
        }

        const attendance = todayAttendanceResult.rows[0];

        // Update check-out time
        const checkOutResult = await pool.query(attendanceQueries.updateCheckOutQuery, [attendance.id]);

        res.status(200).json({
            status: 'success',
            message: 'Checked out successfully',
            data: checkOutResult.rows[0]
        });
    } catch (err) {
        res.status(500).json({ message: 'Error during check-out', error: err.message });
    }
};

