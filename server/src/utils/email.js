
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@example.com';

async function sendEmail({ to, subject, html }) {
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = { to, from: FROM_EMAIL, subject, html };
    await sgMail.send(msg);
    console.log('Sent email via SendGrid to', to);
    return;
  }

  // Fallback to SMTP (e.g., Mailhog, Gmail, etc.)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 1025,
    secure: false,
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    } : undefined
  });

  await transporter.sendMail({ from: FROM_EMAIL, to, subject, html });
  console.log('Sent email via SMTP to', to);
}

function resetPasswordTemplate(link) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click below:</p>
      <a href="${link}" style="background: #007bff; color: #fff; padding: 10px 20px; text-decoration: none;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    </div>
  `;
}

module.exports = { sendEmail, resetPasswordTemplate };
