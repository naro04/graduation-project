const leaveQueries = {
    getLeaves: `
        SELECT 
            lr.*,
            e.full_name as employee_name,
            e.avatar_url as employee_avatar,
            p.title as position_name,
            d.name as department_name,
            (lr.end_date - lr.start_date + 1) as total_days
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        LEFT JOIN positions p ON e.position_id = p.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE ($1::text IS NULL OR e.full_name ILIKE '%' || $1 || '%')
          AND ($2::text IS NULL OR lr.leave_type = $2)
          AND ($3::text IS NULL OR lr.status = $3)
        ORDER BY lr.created_at DESC;
    `,

    getLeaveStats: `
        SELECT 
            COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
            COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
            COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count
        FROM leave_requests;
    `,

    createLeave: `
        INSERT INTO leave_requests (
            employee_id, leave_type, start_date, end_date, reason, document_url, status
        ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *;
    `,

    updateLeaveStatus: `
        UPDATE leave_requests 
        SET 
            status = $1::text, 
            admin_notes = $2,
            approved_by = $3,
            approved_at = CASE WHEN $1::text IN ('approved', 'rejected') THEN NOW() ELSE NULL END,
            updated_at = NOW()
        WHERE id = $4
        RETURNING *;
    `,

    bulkDeleteLeaves: `
        DELETE FROM leave_requests 
        WHERE id = ANY($1::uuid[])
        RETURNING *;
    `,

    getMyLeaves: `
        SELECT 
            lr.*,
            (lr.end_date - lr.start_date + 1) as total_days
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        WHERE e.user_id = $1
        ORDER BY lr.created_at DESC;
    `,

    getMyLeaveStats: `
        SELECT 
            leave_type,
            total_days,
            used_days,
            (total_days - used_days) as remaining_days
        FROM leave_balances lb
        JOIN employees e ON lb.employee_id = e.id
        WHERE e.user_id = $1;
    `
};

const getLeaveReports = require('./getLeaveReports');

module.exports = {
    ...leaveQueries,
    ...getLeaveReports
};
