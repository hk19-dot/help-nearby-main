import nodemailer from 'nodemailer';
import { config } from '../config/config';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your OTP - EmergencyLocator</title>
    </head>
    <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:32px;text-align:center;">
                  <div style="font-size:32px;margin-bottom:8px;">🚨</div>
                  <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">EmergencyLocator</h1>
                  <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">Your One-Time Passcode</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px 32px;">
                  <p style="color:#94a3b8;font-size:15px;margin:0 0 24px;line-height:1.6;">
                    Use the code below to verify your identity. This OTP is valid for <strong style="color:#f1f5f9;">5 minutes</strong> and can only be used once.
                  </p>
                  <!-- OTP Box -->
                  <div style="background:#0f172a;border:2px solid #ef4444;border-radius:12px;padding:28px;text-align:center;margin:0 0 28px;">
                    <p style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Verification Code</p>
                    <div style="font-size:42px;font-weight:800;letter-spacing:16px;color:#ef4444;font-family:'Courier New',monospace;">${otp}</div>
                  </div>
                  <div style="background:#172033;border-radius:10px;padding:16px;margin-bottom:24px;">
                    <p style="color:#f59e0b;font-size:13px;margin:0;display:flex;align-items:flex-start;gap:8px;">
                      ⚠️ &nbsp;<span>Never share this code with anyone. EmergencyLocator will never ask for your OTP over phone or email.</span>
                    </p>
                  </div>
                  <p style="color:#475569;font-size:13px;margin:0;line-height:1.6;">
                    If you didn't request this code, you can safely ignore this email. Your account is secure.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#0f172a;padding:20px 32px;text-align:center;border-top:1px solid #1e293b;">
                  <p style="color:#334155;font-size:12px;margin:0;">© 2024 EmergencyLocator • Keeping you safe, always.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: `${otp} is your EmergencyLocator verification code`,
    text: `Your EmergencyLocator OTP is: ${otp}\n\nThis code expires in 5 minutes. Do not share it with anyone.`,
    html: htmlContent,
  });
};

// Verify transporter on startup (optional, won't crash if it fails)
export const verifyEmailConnection = async (): Promise<void> => {
  try {
    await transporter.verify();
    console.log('✅ Email service ready');
  } catch {
    console.warn('⚠️  Email service not configured — OTPs will be logged to console in dev mode');
  }
};
