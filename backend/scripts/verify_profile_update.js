const pool = require('../database/connection');

const API_URL = 'http://localhost:5000/api/v1';

async function verifyProfileUpdate() {
    console.log('Starting Profile Update Verification...');

    try {
        // 1. Login as John Dev (Employee)
        console.log('Logging in as John Dev...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'dev@company.com',
                password: 'password123'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful. Token acquired.');

        // 2. Update Profile (Personal Info + Emergency Contact)
        const updateData = {
            phone: '555-999-8888',
            marital_status: 'Single',
            emergency_contact: {
                name: 'Jane Doe',
                relationship: 'Sister',
                phone: '555-111-2222',
                email: 'jane@example.com'
            }
        };

        console.log('Sending Update Request...');
        const updateRes = await fetch(`${API_URL}/profile/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
        });

        console.log('Update Response Status:', updateRes.status);
        if (updateRes.ok) {
            console.log('Update Request Successful.');
        } else {
            const errText = await updateRes.text();
            console.error('Update Failed:', errText);
        }

        // 3. Verify Database - Employee
        console.log('Verifying Personal Info in DB...');
        const empRes = await pool.query(`
            SELECT phone, marital_status FROM employees WHERE email = 'dev@company.com'
        `);
        const emp = empRes.rows[0];
        console.log('Employee DB Data:', emp);

        if (emp.phone === '555-999-8888' && emp.marital_status === 'Single') {
            console.log('PASS: Personal Info updated correctly.');
        } else {
            console.error('FAIL: Personal Info mismatch.');
        }

        // 4. Verify Database - Emergency Contact
        console.log('Verifying Emergency Contact in DB...');
        const ecRes = await pool.query(`
            SELECT ec.* FROM emergency_contacts ec
            JOIN employees e ON ec.employee_id = e.id
            WHERE e.email = 'dev@company.com'
        `);
        const ec = ecRes.rows[0];
        console.log('Emergency Contact DB Data:', ec);

        if (ec && ec.name === 'Jane Doe' && ec.phone === '555-111-2222') {
            console.log('PASS: Emergency Contact updated/created correctly.');
        } else {
            console.error('FAIL: Emergency Contact mismatch or missing.');
        }

    } catch (error) {
        console.error('Verification Failed:', error.message);
    } finally {
        pool.end();
    }
}

verifyProfileUpdate();
