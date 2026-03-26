const dashboardQueries = {
    // 1. Employee Counts
    getTotalEmployees: (scope = 'system') => {
        if (scope === 'team') return `SELECT COUNT(*) as total FROM employees WHERE supervisor_id = $1 AND status = 'active';`;
        return `SELECT COUNT(*) as total FROM employees WHERE status = 'active';`;
    },

    // 2. Attendance Metrics (Present today, Late today) - Returning Counts and Totals for percentage calculation
    getAttendanceMetrics: (scope = 'system') => {
        let employeeFilter = "status = 'active'";
        let attendanceFilter = "DATE(check_in_time) = CURRENT_DATE";
        
        if (scope === 'team') {
            employeeFilter += " AND supervisor_id = $1";
            attendanceFilter += " AND employee_id IN (SELECT id FROM employees WHERE supervisor_id = $1)";
        } else if (scope === 'personal') {
            attendanceFilter += " AND employee_id = $1";
            // For personal, total is always 1 if we want to show 100% or 0%
            return `
                SELECT 
                    (SELECT COUNT(*) FROM attendance WHERE ${attendanceFilter}) as present_count,
                    (SELECT COUNT(*) FROM attendance WHERE ${attendanceFilter} AND check_in_time::time > '09:00:00') as late_count,
                    1 as total_active;
            `;
        }

        return `
            SELECT 
                (SELECT COUNT(DISTINCT employee_id) FROM attendance WHERE ${attendanceFilter}) as present_count,
                (SELECT COUNT(DISTINCT employee_id) FROM attendance WHERE ${attendanceFilter} AND check_in_time::time > '09:00:00') as late_count,
                (SELECT COUNT(*) FROM employees WHERE ${employeeFilter}) as total_active;
        `;
    },

    // 3. Leave Requests (Counts by status)
    getLeaveRequestMetrics: (scope = 'system') => {
        let filter = "";
        if (scope === 'team') {
            filter = "WHERE employee_id IN (SELECT id FROM employees WHERE supervisor_id = $1)";
        } else if (scope === 'personal') {
            filter = "WHERE employee_id = $1";
        }

        return `
            SELECT 
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                COUNT(*) as total_count
            FROM leave_requests
            ${filter};
        `;
    },

    // 4. Active Locations
    getActiveLocations: (scope = 'system') => {
        if (scope === 'personal' || scope === 'team') {
            // For managers/officers, show locations where they or their team are assigned
            return `
                SELECT COUNT(DISTINCT location_id) as active_count 
                FROM location_assignments 
                WHERE employee_id = $1 OR employee_id IN (SELECT id FROM employees WHERE supervisor_id = $1);
            `;
        }
        return `SELECT COUNT(*) as active_count FROM locations;`;
    },

    // 5. Attendance Chart Data (Last 7 days)
    getAttendanceChartData: (scope = 'system') => {
        let filter = "";
        if (scope === 'team') {
            filter = "AND a.employee_id IN (SELECT id FROM employees WHERE supervisor_id = $1)";
        } else if (scope === 'personal') {
            filter = "AND a.employee_id = $1";
        }

        return `
            SELECT 
                TO_CHAR(day_series, 'Mon DD') as day_name,
                COUNT(DISTINCT a.employee_id) as present_count
            FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') as day_series
            LEFT JOIN attendance a ON DATE(a.check_in_time) = day_series ${filter}
            GROUP BY day_series
            ORDER BY day_series ASC;
        `;
    },

    // 6. Activity Statistics Chart (Planned vs Completed/Implemented)
    getActivityChartData: (scope = 'system') => {
        let filter = "";
        if (scope === 'team') {
            filter = "AND (act.id IN (SELECT activity_id FROM activity_assignments WHERE employee_id IN (SELECT id FROM employees WHERE supervisor_id = $1)))";
        } else if (scope === 'personal') {
            filter = "AND (act.id IN (SELECT activity_id FROM activity_assignments WHERE employee_id = $1))";
        }

        return `
            SELECT 
                TO_CHAR(day_series, 'Mon DD') as day_name,
                SUM(CASE WHEN act.implementation_status = 'Implemented' OR act.implementation_status = 'Completed' THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN act.implementation_status = 'Planned' THEN 1 ELSE 0 END) as planned_count
            FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') as day_series
            LEFT JOIN activities act ON DATE(act.start_time) = day_series ${filter}
            GROUP BY day_series
            ORDER BY day_series ASC;
        `;
    },

    // 7. User Metrics (Admin Only)
    getUserMetrics: `
        SELECT 
            (SELECT COUNT(*) FROM employees WHERE status = 'active') as active_users,
            (SELECT COUNT(*) FROM employees WHERE status != 'active') as inactive_users,
            (SELECT COUNT(*) FROM employees WHERE hired_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d;
    `
};

module.exports = dashboardQueries;
