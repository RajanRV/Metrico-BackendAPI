const { AuditLog } = require('../models');

const writeAuditLog = async ({
    action_type,
    user = null,
    record_type = null,
    record_id = null,
    details_json = null,
    ip_address = null,
}) => {
    try {
        await AuditLog.create({
            user_id: user?.user_id ?? null,
            user_name_snapshot: user
                ? `${user.first_name} ${user.last_name}`
                : null,
            action_type,
            record_type,
            record_id,
            details_json,
            ip_address,
        });
    } catch (err) {
        console.error('[AuditLog] Failed to write audit log:', err.message);
    }
};

module.exports = { writeAuditLog };
