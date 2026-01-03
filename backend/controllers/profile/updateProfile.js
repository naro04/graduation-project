const pool = require("../../database/connection");
const { updatePersonalInfoQuery } = require("../../database/data/queries/profile/getPersonalInfo");
const { upsertEmergencyContactQuery } = require("../../database/data/queries/profile/getEmergencyContact");

exports.updateProfile = async (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Not authorized, user ID missing" });
    }

    const userId = req.user.id;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get Employee ID from User ID
        const empRes = await client.query('SELECT id FROM employees WHERE user_id = $1', [userId]);
        if (empRes.rows.length === 0) {
            throw new Error('Employee record not found');
        }
        const employeeId = empRes.rows[0].id;

        // 2. Extract & Normalize Data from Body        // Destructure personal info and potential flat emergency fields
        let {
            // Personal Info
            first_name, middle_name, last_name, birth_date,
            gender, marital_status, phone,

            'firstName': firstName_camel,
            'lastName': lastName_camel,
            'middleName': middleName_camel,
            'maritalStatus': maritalStatus_camel,

            // Support alternative birth date field names
            'birth_of_date': birth_of_underscore,
            'birth_of-date': birth_of_dash,
            'birth-of-date': birth_of_kebab,
            'birth_date': birth_date_standard,
            'birthDate': birth_date_camel,

            // Job Info
            department_id, position_id, employment_type,
            'departmentId': departmentId_camel,
            'positionId': positionId_camel,
            'employmentType': employmentType_camel,

            // Nested Emergency Contact Object/Array
            emergency_contact,
            emergencyContacts,

            // Flat Emergency Contact Fields (if not nested)
            name: ec_name_flat,
            relationship: ec_rel_flat,
            phone: ec_phone_flat,
            email: ec_email_flat,
            address: ec_address_flat,
            'alternate-phone': ec_alt_phone_kebab_flat,
            'alternate_phone': ec_alt_phone_snake_flat
        } = req.body;

        // Normalize birth_date
        let finalBirthDate = birth_date || birth_date_standard || birth_date_camel ||
            birth_of_underscore || birth_of_dash || birth_of_kebab || null;

        if (finalBirthDate && typeof finalBirthDate === 'string' && finalBirthDate.includes('-')) {
            const parts = finalBirthDate.split('-');
            if (parts[0].length === 2 && parts[2].length === 4) {
                finalBirthDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        // 3. Update Personal Info
        await client.query(updatePersonalInfoQuery, [
            employeeId,
            first_name || firstName_camel || null,
            middle_name || middleName_camel || null,
            last_name || lastName_camel || null,
            finalBirthDate,
            gender || null,
            marital_status || maritalStatus_camel || null,
            phone || null,
            req.body.avatarUrl || req.body.avatar_url || null
        ]);

        // 3b. Update Job Info (if provided)
        const deptId = department_id || departmentId_camel;
        const posId = position_id || positionId_camel;
        const empType = employment_type || employmentType_camel;
        const roleId = req.body.role_id || req.body.roleId;

        if (deptId || posId || empType) {
            let updateFields = [];
            let values = [];
            let idx = 1;

            if (deptId) { updateFields.push(`department_id = $${idx++}`); values.push(deptId); }
            if (posId) { updateFields.push(`position_id = $${idx++}`); values.push(posId); }
            if (empType) { updateFields.push(`employment_type = $${idx++}`); values.push(empType); }

            if (updateFields.length > 0) {
                values.push(employeeId);
                await client.query(`
                    UPDATE employees 
                    SET ${updateFields.join(', ')}, updated_at = NOW() 
                    WHERE id = $${idx}
                `, values);
            }
        }

        // 3c. Update Role (if provided)
        if (roleId) {
            await client.query(`
                DELETE FROM user_roles WHERE user_id = $1
            `, [userId]);
            await client.query(`
                INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)
            `, [userId, roleId]);
        }

        // 4. Upsert Emergency Contact
        // Decide if we have emergency data (either nested or flat)
        const ecFromArray = (emergencyContacts && emergencyContacts.length > 0) ? emergencyContacts[0] : null;
        const hasNestedEC = (emergency_contact && emergency_contact.name) || (ecFromArray && ecFromArray.name);
        const hasFlatEC = ec_name_flat;

        if (hasNestedEC || hasFlatEC) {
            const source = ecFromArray || emergency_contact || {};
            const ecName = hasNestedEC ? source.name : ec_name_flat;
            const ecRel = hasNestedEC ? source.relationship : ec_rel_flat;
            const ecPhone = hasNestedEC ? source.phone : ec_phone_flat;
            const ecEmail = hasNestedEC ? (source.email || null) : (ec_email_flat || null);
            const ecAddress = hasNestedEC ? (source.address || null) : (ec_address_flat || null);

            const ecAltPhone = hasNestedEC
                ? (source.alternate_phone || source['alternate-phone'] || source.altPhone || null)
                : (ec_alt_phone_kebab_flat || ec_alt_phone_snake_flat || null);

            // Ensure table exists
            await client.query(`
                CREATE TABLE IF NOT EXISTS emergency_contacts (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
                    name TEXT NOT NULL,
                    relationship TEXT,
                    phone TEXT,
                    alternate_phone TEXT,
                    address TEXT,
                    email TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(employee_id)
                );
            `);

            await client.query(upsertEmergencyContactQuery, [
                employeeId, ecName, ecRel, ecPhone, ecAltPhone, ecAddress, ecEmail
            ]);
        }

        await client.query('COMMIT');
        res.status(200).json({ status: 'success', message: 'Profile updated successfully' });

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Update Profile Error:', err);
        res.status(500).json({ success: false, message: "Internal server error during profile update", error: err.message });
    } finally {
        if (client) client.release();
    }
};
