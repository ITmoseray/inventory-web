import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";

/**
 * Creates a nodemailer transporter using environment variables.
 * We create this dynamically to ensure environment variables are loaded.
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    console.warn("⚠️ SMTP configuration is incomplete. Verification emails will fail.");
    console.log(`Current config - Host: ${host || 'MISSING'}, Port: ${port}, User: ${user ? 'SET' : 'MISSING'}`);
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const domain = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationLink = `${domain}/verify-email?token=${token}`;
  
  const transporter = getTransporter();
  
  if (!transporter) {
    console.error("❌ Cannot send email: SMTP transporter not initialized. Check your environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD).");
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || '"Protech System" <no-reply@protech.com>',
    to: email,
    subject: "Verify your email - Protech System",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #0f172a; font-weight: 800;">Welcome to Protech System</h2>
        <p style="color: #64748b; line-height: 1.6;">Thank you for registering. Please verify your email address to activate your account.</p>
        <a href="${verificationLink}" style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px;">Verify Email Address</a>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">If you did not create an account, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 10px;">Protech Assist SL Limited</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    // Log more specific info for debugging
    if (error instanceof Error) {
      console.error(`Error details: ${error.message}`);
    }
  }
};

export const generateVerificationToken = () => {
  return uuidv4();
};
