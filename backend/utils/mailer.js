/**
 * mailer.js — Email alert utility using nodemailer
 * Sends real-time email notifications for HIGH severity security events.
 *
 * Setup:
 *   1. Create a Gmail App Password at https://myaccount.google.com/apppasswords
 *   2. Set in .env:
 *        SMTP_USER=your-email@gmail.com
 *        SMTP_PASS=your-16-char-app-password
 *        ALERT_EMAIL=recipient@yourcompany.com
 *
 * Usage:
 *   const { sendHighAlert } = require("../utils/mailer");
 *   await sendHighAlert(alert);
 */

const nodemailer = require("nodemailer");

// Only create transporter if SMTP is configured
let transporter = null;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Sends an email notification for a HIGH severity alert.
 * Silently skips if SMTP is not configured (no SMTP_USER in .env).
 *
 * @param {Object} alert - Mongoose Alert document
 */
const sendHighAlert = async (alert) => {
  if (!transporter || !process.env.ALERT_EMAIL) return;

  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const geoInfo = alert.city && alert.country
    ? `${alert.city}, ${alert.country}`
    : "Location unknown";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1a; color: #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #ff3366, #cc0033); padding: 20px 24px;">
        <h1 style="margin: 0; color: #fff; font-size: 1.4rem;">🚨 HIGH Severity Alert</h1>
        <p style="margin: 4px 0 0; color: rgba(255,255,255,0.8); font-size: 0.85rem;">SOC SIEM Dashboard — Automated Alert</p>
      </div>
      <div style="padding: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #94a3b8; width: 140px;">🔴 Alert</td><td style="padding: 8px 0; font-weight: bold; color: #ff3366;">${alert.title}</td></tr>
          <tr><td style="padding: 8px 0; color: #94a3b8;">📡 IP Address</td><td style="padding: 8px 0; font-family: monospace; color: #00d4ff;">${alert.ipAddress}</td></tr>
          <tr><td style="padding: 8px 0; color: #94a3b8;">🌍 Location</td><td style="padding: 8px 0;">${geoInfo}</td></tr>
          <tr><td style="padding: 8px 0; color: #94a3b8;">⚡ Severity</td><td style="padding: 8px 0; color: #ff3366; font-weight: bold;">${alert.severity}</td></tr>
          <tr><td style="padding: 8px 0; color: #94a3b8;">📋 Status</td><td style="padding: 8px 0;">${alert.status}</td></tr>
          <tr><td style="padding: 8px 0; color: #94a3b8;">🕐 Time (IST)</td><td style="padding: 8px 0;">${timestamp}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 12px 16px; background: rgba(255,51,102,0.1); border-left: 3px solid #ff3366; border-radius: 4px;">
          <p style="margin: 0; font-size: 0.85rem; color: #cbd5e1;">Immediate action recommended. Log in to the SOC dashboard to investigate and acknowledge this alert.</p>
        </div>
      </div>
      <div style="padding: 12px 24px; background: rgba(255,255,255,0.03); text-align: center; font-size: 0.75rem; color: #475569;">
        SOC SIEM Dashboard — Automated Security Notification
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"SOC SIEM Dashboard" <${process.env.SMTP_USER}>`,
      to: process.env.ALERT_EMAIL,
      subject: `🚨 [HIGH] Security Alert: ${alert.title} — ${alert.ipAddress}`,
      html,
    });
  } catch (err) {
    // Never let email failures crash the ingest endpoint
    console.error("[Mailer] Failed to send alert email:", err.message);
  }
};

module.exports = { sendHighAlert };
