const helpData = {
    categories: [
        {
            id: 'getting-started',
            title: 'Getting Started',
            description: 'Learn the basics of the HR & Field Activity Management System',
            icon: 'Book',
            links: [
                { title: 'Introduction to the Platform', path: '/help/intro' },
                { title: 'Settings up your Account', path: '/help/settings' },
                { title: 'Dashboard Overview', path: '/help/dashboard' },
                { title: 'User Roles and Permissions', path: '/help/roles' }
            ]
        },
        {
            id: 'attendance-gps',
            title: 'Attendance & GPS',
            description: 'Track employee attendance and manage GPS-based check-ins',
            icon: 'Clock',
            links: [
                { title: 'How to Mark Attendance', path: '/help/mark-attendance' },
                { title: 'GPS Location Tracking', path: '/help/gps' },
                { title: 'Setting Up Geofencing', path: '/help/geofencing' },
                { title: 'Attendance Reports', path: '/help/attendance-reports' }
            ]
        },
        {
            id: 'activities-reports',
            title: 'Activities & Reports',
            description: 'Manage field activities and generate comprehensive reports',
            icon: 'Zap',
            links: [
                { title: 'Creating Field Activities', path: '/help/create-activity' },
                { title: 'Activity Status Tracking', path: '/help/activity-status' },
                { title: 'Generating Reports', path: '/help/gen-reports' },
                { title: 'Export Data', path: '/help/export' }
            ]
        },
        {
            id: 'leave-management',
            title: 'Leave Management',
            description: 'Handle leave requests, approvals, and leave policies',
            icon: 'FileText',
            links: [
                { title: 'Submitting Leave Requests', path: '/help/submit-leave' },
                { title: 'Leave Approval Workflow', path: '/help/leave-approval' },
                { title: 'Leave Balance Overview', path: '/help/leave-balance' },
                { title: 'Leave Policies', path: '/help/leave-policies' }
            ]
        },
        {
            id: 'employee-management',
            title: 'Employee Management',
            description: 'Add, edit, and manage employee information',
            icon: 'Users',
            links: [
                { title: 'Adding New Employees', path: '/help/add-employee' },
                { title: 'Managing Employee Profiles', path: '/help/manage-profiles' },
                { title: 'Department Setup', path: '/help/dept-setup' },
                { title: 'Employee Onboarding', path: '/help/onboarding' }
            ]
        },
        {
            id: 'system-configuration',
            title: 'System Configuration',
            description: 'Configure system settings and customize workflows',
            icon: 'Settings',
            links: [
                { title: 'System Settings Overview', path: '/help/sys-settings' },
                { title: 'Notifications Configuration', path: '/help/notifications' },
                { title: 'API Integration', path: '/help/api-integration' },
                { title: 'Security Settings', path: '/help/security' }
            ]
        }
    ],
    popularArticles: [
        { id: 1, title: 'How to reset your password ?', views: '2.5k views' },
        { id: 2, title: 'Setting up GPS-based attendance', views: '1.8k views' },
        { id: 3, title: 'Understanding leave approval workflows', views: '1.6k views' },
        { id: 4, title: 'Generating monthly attendance reports', views: '1.4k views' },
        { id: 5, title: 'Configuring notification settings', views: '1.2k views' }
    ]
};

exports.getHelpContent = async (req, res) => {
    try {
        res.status(200).json({
            status: 'success',
            data: helpData
        });
    } catch (err) {
        console.error('Error fetching help content:', err);
        res.status(500).json({
            message: 'Internal server error while fetching help content',
            error: err.message
        });
    }
};
