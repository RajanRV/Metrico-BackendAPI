const bcrypt = require('bcryptjs');
const { User, Facility } = require('../../models');
const { signAccessToken, signRefreshToken } = require('../../utils/jwt');
const { writeAuditLog } = require('../../utils/auditLogger');

const mobileLoginService = async ({ email, password, ip }) => {

    // 1. Find user + facility
    const user = await User.findOne({
        where: {
            email: email.toLowerCase().trim(),
        },
        include: [
            {
                model: Facility,
                as: 'Facility',                              // ← capital F
                attributes: ['facility_id', 'facility_name'],
            },
        ],
    });

    // 2. User not found
    if (!user) {
        return { status: 401, success: false, message: 'Invalid email or password.' };
    }

    // 3. Deactivated user
    if (user.status === 'Inactive') {
        return {
            status: 403,
            success: false,
            message: 'Your account has been deactivated. Please contact your administrator.',
        };
    }

    // 4. Mobile = Testing Staff ONLY
    if (user.role !== 'Testing Staff') {
        return {
            status: 403,
            success: false,
            message: 'Mobile app access is only available for Testing Staff.',
        };
    }

    // 5. Wrong password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        return { status: 401, success: false, message: 'Invalid email or password.' };
    }

    // 6. Generate tokens
    const tokenPayload = {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
        facility_id: user.facility_id,
        organization_id: user.organization_id,
        platform: 'mobile',
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // 7. Activate on first login + stamp last login
    const updates = { last_login_at: new Date() };
    if (user.status === 'Invited') {
        updates.status = 'Active';
    }
    await user.update(updates);

    // 8. Audit log
    await writeAuditLog({
        action_type: 'USER_LOGIN',
        user: user,
        record_type: 'User',
        record_id: user.user_id,
        details_json: { method: 'email_password', platform: 'mobile' },
        ip_address: ip,
    });

    // 9. Success
    return {
        status: 200,
        success: true,
        message: 'Mobile login successful.',
        data: {
            access_token: accessToken,
            refresh_token: refreshToken,
            login_method: 'email_password',
            user: {
                user_id: user.user_id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: user.role,
                facility: {
                    facility_id: user.Facility?.facility_id ?? null,  // ← capital F
                    facility_name: user.Facility?.facility_name ?? null,  // ← capital F
                },
            },
        },
    };
};

const getMobileProfileService = async ({ user_id }) => {

    const user = await User.findOne({
        where: { user_id },
        include: [
            {
                model: Facility,
                as: 'Facility',
                attributes: ['facility_id', 'facility_name'],
            },
        ],
    });

    if (!user) {
        return { status: 404, success: false, message: 'User not found.' };
    }

    if (user.status !== 'Active') {
        return { status: 403, success: false, message: 'Account is deactivated.' };
    }

    return {
        status: 200,
        success: true,
        message: 'Profile fetched successfully.',
        data: {
            user: {
                user_id: user.user_id,
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                role: user.role,
                login_method: 'email_password',
                facility: {
                    facility_id: user.Facility?.facility_id ?? null,
                    facility_name: user.Facility?.facility_name ?? null,
                },
            },
        },
    };
};

module.exports = { mobileLoginService, getMobileProfileService };
