const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS,
  },
});

const APP_URL = process.env.APP_URL || 'https://www.omogl.com';
const FROM    = `"Omogl Arena" <${process.env.EMAIL_FROM}>`;

async function sendVerificationEmail(email, name, token) {
  const link = `${APP_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: '⚔️ Verify your Omogl account',
    html: `
      <div style="font-family:Inter,sans-serif;background:#050508;color:#f8fafc;padding:40px;max-width:560px;margin:auto;border-radius:16px;border:1px solid rgba(168,85,247,0.3)">
        <h1 style="color:#a855f7;font-size:28px;margin-bottom:8px">Welcome to the Arena, ${name || 'Warrior'}!</h1>
        <p style="color:#94a3b8;line-height:1.7">You're one step away from joining the Omogl Face Battle Arena. Click the button below to verify your email and activate your account.</p>
        <a href="${link}" style="display:inline-block;margin:28px 0;padding:14px 32px;background:linear-gradient(135deg,#a855f7,#7c3aed);color:#fff;text-decoration:none;border-radius:99px;font-weight:700;font-size:15px">✅ Verify My Account</a>
        <p style="color:#475569;font-size:13px">This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0"/>
        <p style="color:#334155;font-size:12px">Omogl — The Face Battle Arena &nbsp;|&nbsp; <a href="${APP_URL}" style="color:#a855f7">omogl.com</a></p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(email, token) {
  const link = `${APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: '🔑 Reset your Omogl password',
    html: `
      <div style="font-family:Inter,sans-serif;background:#050508;color:#f8fafc;padding:40px;max-width:560px;margin:auto;border-radius:16px;border:1px solid rgba(168,85,247,0.3)">
        <h1 style="color:#a855f7;font-size:28px;margin-bottom:8px">Password Reset Request</h1>
        <p style="color:#94a3b8;line-height:1.7">We received a request to reset your Omogl password. Click the button below to set a new one.</p>
        <a href="${link}" style="display:inline-block;margin:28px 0;padding:14px 32px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;text-decoration:none;border-radius:99px;font-weight:700;font-size:15px">🔑 Reset My Password</a>
        <p style="color:#475569;font-size:13px">This link expires in <strong>1 hour</strong>. If you didn't request this, your account is safe — just ignore this email.</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0"/>
        <p style="color:#334155;font-size:12px">Omogl — The Face Battle Arena &nbsp;|&nbsp; <a href="${APP_URL}" style="color:#a855f7">omogl.com</a></p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
