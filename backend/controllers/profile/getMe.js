const pool = require("../../database/connection");
const { getMe } = require("../../database/data/queries/auth");
const { getLocationQuery, getWorkScheduleQuery } = require("../../database/data/queries/profile");

module.exports = async (req, res) => {
    try {
        const { rows } = await pool.query(getMe, [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Profile not found" });
        }

        const data = rows[0];

        // Fetch additional info: Locations and Work Schedule
        const [locationsRes, scheduleRes] = await Promise.all([
            pool.query(getLocationQuery, [req.user.id]),
            pool.query(getWorkScheduleQuery, [req.user.id])
        ]);

        const primaryLocation = locationsRes.rows.find(l => l.is_primary) || locationsRes.rows[0];

        const formattedResponse = {
            id: data.id,
            name: data.name,
            email: data.email,
            avatarUrl: data.employee_avatar_url || data.avatar_url,
            roles: data.role_name ? [data.role_name] : [],
            employee: {
                id: data.employee_id,
                employeeCode: data.employee_code,
                firstName: data.first_name,
                middleName: data.middle_name,
                lastName: data.last_name,
                fullName: data.full_name,
                phone: data.phone,
                birthDate: data.birth_date,
                gender: data.gender,
                maritalStatus: data.marital_status,
                status: data.status,
                hiredAt: data.hired_at,
                city: data.city,
                country: data.country,
                location: data.country && data.city ? `${data.country}, ${data.city}` : (primaryLocation ? primaryLocation.address : null),
                department_id: data.department_id,
                position_id: data.position_id,
                roleId: data.role_id,
                role_id: data.role_id,
                supervisorId: data.supervisor_id,
                employmentType: data.employment_type,
                department: {
                    name: data.department_name
                },
                position: {
                    title: data.position_title
                },
                supervisor: {
                    name: data.supervisor_name
                },
                emergencyContacts: data.ec_name ? [{
                    name: data.ec_name,
                    relationship: data.ec_relationship,
                    phone: data.ec_phone,
                    altPhone: data.ec_alternate_phone,
                    address: data.ec_address,
                    email: data.ec_email
                }] : [],
                locations: locationsRes.rows,
                workSchedules: scheduleRes.rows
            }
        };

        res.status(200).json(formattedResponse);
    } catch (err) {
        console.error('getMe error:', err);
        res.status(500).json({ message: "Error fetching profile", error: err.message });
    }
};
