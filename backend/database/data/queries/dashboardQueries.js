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
            return `
                SELECT 
                    COUNT(*) FILTER (WHERE daily_status = 'Present') as present_count,
                    COUNT(*) FILTER (WHERE daily_status = 'Late') as late_count,
                    COUNT(*) as total_present,
                    1 as total_active
                FROM attendance 
                WHERE ${attendanceFilter}
            `;
        }

        return `
            SELECT 
                COUNT(DISTINCT employee_id) FILTER (WHERE daily_status = 'Present') as present_count,
                COUNT(DISTINCT employee_id) FILTER (WHERE daily_status = 'Late') as late_count,
                COUNT(DISTINCT employee_id) as total_present,
                (SELECT COUNT(*) FROM employees WHERE ${employeeFilter}) as total_active
            FROM attendance 
            WHERE ${attendanceFilter}
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
            // Team scope: Activities where any team member is assigned
            filter = "AND (act.id IN (SELECT activity_id FROM activity_employees WHERE employee_id IN (SELECT id FROM employees WHERE supervisor_id = $1)))";
        } else if (scope === 'personal') {
            // Personal scope: Activities where the current user is assigned
            filter = "AND (act.id IN (SELECT activity_id FROM activity_employees WHERE employee_id = $1))";
        }

        return `
            SELECT 
                TO_CHAR(day_series, 'Mon DD') as day_name,
                SUM(CASE WHEN act.implementation_status = 'Implemented' THEN 1 ELSE 0 END) as implemented_count,
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
    `,

    // 8. Weekly Attendance Percentage (Last 7 days)
    getAttendanceWeekPercentage: (scope = 'system') => {
        let filter = "";
        let employeeFilter = "status = 'active'";
        if (scope === 'team') {
            filter = "AND a.employee_id IN (SELECT id FROM employees WHERE supervisor_id = $1)";
            employeeFilter += " AND supervisor_id = $1";
        } else if (scope === 'personal') {
            filter = "AND a.employee_id = $1";
            employeeFilter += " AND id = $1";
        }

        return `
            WITH daily_attendance AS (
                SELECT 
                    day_series,
                    COUNT(DISTINCT a.employee_id) as present_count
                FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day') as day_series
                LEFT JOIN attendance a ON DATE(a.check_in_time) = day_series ${filter}
                GROUP BY day_series
            ),
            team_size AS (
                SELECT COUNT(*) as total FROM employees WHERE ${employeeFilter}
            )
            SELECT 
                CASE 
                    WHEN (SELECT total FROM team_size) = 0 THEN 0
                    ELSE ROUND(AVG(present_count)::numeric / (SELECT total FROM team_size) * 100)
                END as weekly_percentage
            FROM daily_attendance;
        `;
    },

    // 9. Activity Metrics (Approved/Pending counts - last 7 days)
    getActivityMetrics: (scope = 'system') => {
        let filter = "WHERE start_time >= CURRENT_DATE - INTERVAL '6 days'";
        if (scope === 'team') {
            filter += " AND id IN (SELECT activity_id FROM activity_employees WHERE employee_id IN (SELECT id FROM employees WHERE supervisor_id = $1))";
        } else if (scope === 'personal') {
            filter += " AND id IN (SELECT activity_id FROM activity_employees WHERE employee_id = $1)";
        }

        return `
            SELECT 
                COUNT(*) FILTER (WHERE approval_status = 'Approved') as approved_count,
                COUNT(*) FILTER (WHERE approval_status = 'Pending') as pending_count,
                COUNT(*) as total_count
            FROM activities
            ${filter};
        `;
    }
};

module.exports = dashboardQueries;
