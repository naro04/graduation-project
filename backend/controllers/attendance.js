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
 * Format time to 12-hour format (e.g., "08:00 Am")
 */
const formatTime = (date) => {
    if (!date) return null;
    const d = new Date(date);
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'Pm' : 'Am';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};

/**
 * Format date to display format (e.g., "07 Dec 2025")
 */
const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
};

/**
 * Calculate work hours difference
 */
const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return null;
    const diffMs = new Date(checkOut) - new Date(checkIn);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} hr , ${minutes} m`;
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

        // Get attendance history
        const result = await pool.query(attendanceQueries.getMyAttendanceQuery, [
            userId,
            status || null,
            parseInt(limit),
            offset
        ]);

        // Get today's attendance (with or without checkout)
        const todayQuery = `
            SELECT a.*
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE e.user_id = $1
              AND DATE(a.check_in_time) = CURRENT_DATE
            ORDER BY a.check_in_time DESC
            LIMIT 1;
        `;
        const todayResult = await pool.query(todayQuery, [userId]);
        const todayAttendance = todayResult.rows[0];

        // Format records for frontend
        const records = result.rows.map(row => ({
            id: row.id,
            date: formatDate(row.date || row.check_in_time),
            checkInAt: formatTime(row.check_in_time),
            checkOutAt: row.check_out_time ? formatTime(row.check_out_time) : null,
            workHours: calculateWorkHours(row.check_in_time, row.check_out_time),
            location: row.location || row.location_address || '-',
            type: row.type || row.work_type || 'Office',
            status: row.status || row.daily_status || 'Present',
            gpsStatus: row.gps_status
        }));

        // Build today status for the check-in/check-out card
        let todayStatus = { checkedIn: false };
        if (todayAttendance) {
            todayStatus = {
                checkedIn: true,
                checkInTime: formatTime(todayAttendance.check_in_time),
                checkInLocation: todayAttendance.location_address || 'Unknown Location',
                checkInMethod: todayAttendance.check_in_method || 'GPS',
                checkOutTime: todayAttendance.check_out_time ? formatTime(todayAttendance.check_out_time) : null,
                checkOutLocation: todayAttendance.check_out_time ? (todayAttendance.location_address || 'Unknown Location') : null,
                checkOutMethod: todayAttendance.check_out_method || null,
                totalHours: calculateWorkHours(todayAttendance.check_in_time, todayAttendance.check_out_time),
                gpsStatus: todayAttendance.gps_status
            };
        }

        res.status(200).json({
            status: 'success',
            records: records,
            todayStatus: todayStatus,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: result.rows.length
            }
        });
    } catch (err) {
        console.error('Error fetching attendance:', err);
        res.status(500).json({ message: 'Error fetching attendance', error: err.message });
    }
};

exports.checkIn = async (req, res) => {
    try {
        const { latitude, longitude, location_address, work_type, manual_location_id, check_in_method } = req.body;
        const userId = req.user.id;
        
        // Debug logging
        console.log('Check-in request body:', req.body);
        console.log('check_in_method received:', check_in_method);

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

        // Resolve location address
        let finalLocationAddress = location_address;
        
        // If manual location was selected (GPS fallback), get the location name
        if (manual_location_id && !location_address) {
            const locationResult = await pool.query('SELECT name, address FROM locations WHERE id = $1', [manual_location_id]);
            if (locationResult.rows.length > 0) {
                finalLocationAddress = locationResult.rows[0].name || locationResult.rows[0].address;
            }
        }

        // Determine check-in method
        const method = check_in_method || (latitude && longitude ? 'GPS' : 'Manual');

        // Create check-in record
        const checkInResult = await pool.query(attendanceQueries.createCheckInQuery, [
            employee.id,
            latitude || null,
            longitude || null,
            finalLocationAddress || 'Unknown Location',
            work_type || 'Office',
            dailyStatus,
            'Not Verified', // Will be updated after GPS verification
            method
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
            // No GPS coordinates provided - mark as Not Verified
            await pool.query(gpsQueries.updateGPSStatusQuery, [null, 'Not Verified', attendance.id]);
            attendance.gps_status = 'Not Verified';
            attendance.distance_from_base = null;
        }

        res.status(201).json({
            status: 'success',
            message: 'Checked in successfully',
            data: {
                id: attendance.id,
                checkInTime: formatTime(attendance.check_in_time),
                location: finalLocationAddress || 'Unknown Location',
                gpsStatus: attendance.gps_status,
                dailyStatus: dailyStatus
            }
        });
    } catch (err) {
        console.error('Error during check-in:', err);
        res.status(500).json({ message: 'Error during check-in', error: err.message });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const { latitude, longitude, location_address, manual_location_id, check_out_method } = req.body;
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

        // Resolve location address for checkout
        let checkoutLocationAddress = location_address;
        
        if (manual_location_id && !location_address) {
            const locationResult = await pool.query('SELECT name, address FROM locations WHERE id = $1', [manual_location_id]);
            if (locationResult.rows.length > 0) {
                checkoutLocationAddress = locationResult.rows[0].name || locationResult.rows[0].address;
            }
        }

        // Determine check-out method
        const method = check_out_method || (latitude && longitude ? 'GPS' : 'Manual');

        // Update check-out time
        const checkOutResult = await pool.query(attendanceQueries.updateCheckOutQuery, [attendance.id, method]);
        const updatedAttendance = checkOutResult.rows[0];

        // Calculate total work hours
        const totalHours = calculateWorkHours(updatedAttendance.check_in_time, updatedAttendance.check_out_time);

        res.status(200).json({
            status: 'success',
            message: 'Checked out successfully',
            data: {
                id: updatedAttendance.id,
                checkInTime: formatTime(updatedAttendance.check_in_time),
                checkOutTime: formatTime(updatedAttendance.check_out_time),
                checkInLocation: updatedAttendance.location_address || 'Unknown Location',
                checkOutLocation: checkoutLocationAddress || updatedAttendance.location_address || 'Unknown Location',
                totalHours: totalHours,
                dailyStatus: updatedAttendance.daily_status
            }
        });
    } catch (err) {
        console.error('Error during check-out:', err);
        res.status(500).json({ message: 'Error during check-out', error: err.message });
    }
};

/**
 * Get available locations for manual selection (GPS fallback)
 */
exports.getLocationsForCheckIn = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, address, latitude, longitude
            FROM locations
            WHERE status = 'active'
            ORDER BY name ASC
        `);

        res.status(200).json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        console.error('Error fetching locations:', err);
        res.status(500).json({ message: 'Error fetching locations', error: err.message });
    }
};

/**
 * Get daily attendance for all employees (HR/Admin view)
 */
exports.getDailyAttendance = async (req, res) => {
    try {
        const { date, location, status, search } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        // Get attendance records for the specified date
        const attendanceQuery = `
            SELECT 
                a.id,
                a.employee_id,
                e.full_name as employee_name,
                e.employee_code,
                e.avatar_url,
                a.check_in_time,
                a.check_out_time,
                a.work_type as attendance_type,
                a.location_address as location,
                a.daily_status as status,
                a.gps_status
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE DATE(a.check_in_time) = $1
            ORDER BY a.check_in_time DESC
        `;
        
        const result = await pool.query(attendanceQuery, [targetDate]);

        // Calculate stats
        const totalEmployeesResult = await pool.query('SELECT COUNT(*) as total FROM employees WHERE status = $1', ['active']);
        const totalEmployees = parseInt(totalEmployeesResult.rows[0]?.total || 0);

        const presentCount = result.rows.filter(r => r.status === 'Present' || r.status === 'Late').length;
        const lateCount = result.rows.filter(r => r.status === 'Late').length;
        const absentCount = Math.max(0, totalEmployees - presentCount);

        // Format records for frontend
        const records = result.rows.map(row => ({
            id: row.id,
            employeeId: row.employee_id,
            employeeName: row.employee_name,
            employeeCode: row.employee_code,
            avatarUrl: row.avatar_url,
            checkInAt: row.check_in_time,
            checkOutAt: row.check_out_time,
            attendanceType: row.attendance_type || 'Office',
            location: row.location || '-',
            status: row.check_out_time ? row.status : (row.status === 'Present' || row.status === 'Late' ? 'In progress' : row.status),
            gpsStatus: row.gps_status,
            gpsVerified: row.gps_status === 'Verified' || row.gps_status === 'Suspicious'
        }));

        // Apply filters
        let filteredRecords = records;
        if (location && location !== 'All Locations') {
            filteredRecords = filteredRecords.filter(r => r.location === location);
        }
        if (status && status !== 'All Status') {
            filteredRecords = filteredRecords.filter(r => r.status === status);
        }
        if (search) {
            const searchLower = search.toLowerCase();
            filteredRecords = filteredRecords.filter(r => 
                r.employeeName.toLowerCase().includes(searchLower) ||
                r.employeeCode.toLowerCase().includes(searchLower)
            );
        }

        res.status(200).json({
            status: 'success',
            records: filteredRecords,
            stats: {
                presentToday: presentCount,
                absentToday: absentCount,
                lateArrivals: lateCount
            }
        });
    } catch (err) {
        console.error('Error fetching daily attendance:', err);
        res.status(500).json({ message: 'Error fetching daily attendance', error: err.message });
    }
};

/**
 * Delete attendance record
 */
exports.deleteAttendance = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query('DELETE FROM attendance WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        res.status(200).json({
            status: 'success',
            message: 'Attendance record deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting attendance:', err);
        res.status(500).json({ message: 'Error deleting attendance', error: err.message });
    }
};
