'use strict';

const nodemailer = require('nodemailer');

const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
} = process.env;

const isConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);
const fromAddress = SMTP_FROM || SMTP_USER;

let transporter = null;

if (isConfigured) {
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000,
    });
} else {
    console.warn('[mailService] SMTP_* env vars not set — running in stub mode. Emails will be logged, not sent.');
}

const inviteTemplate = ({ firstName, email, tempPassword }) => `
    <div style="font-family: sans-serif; max-width: 480px;">
        <h2>Welcome to Metrico, ${firstName}!</h2>
        <p>An account has been created for you. Use the credentials below to log in:</p>
        <p><strong>Email:</strong> ${email}<br/>
        <strong>Temporary password:</strong> ${tempPassword}</p>
        <p>Log in with these credentials — your account will be activated automatically the first time you sign in.</p>
    </div>
`;

const sendInvite = async ({ to, firstName, tempPassword }) => {
    if (!isConfigured) {
        console.log(`[mailService] (stub) Invite NOT sent — mail service not configured.`);
        console.log(`[mailService] (stub) to: ${to}, tempPassword: ${tempPassword}`);
        return { sent: false, reason: 'mail_service_not_configured' };
    }

    try {
        await transporter.sendMail({
            from: fromAddress,
            to,
            subject: 'Welcome to Metrico — your account is ready',
            html: inviteTemplate({ firstName, email: to, tempPassword }),
        });
        return { sent: true };
    } catch (err) {
        console.error('[mailService] Failed to send invite email:', err.message);
        return { sent: false, reason: 'send_failed' };
    }
};

module.exports = { sendInvite, isConfigured };