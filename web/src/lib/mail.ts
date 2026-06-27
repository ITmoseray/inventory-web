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

/**
 * Sends an email alert to the Super Admin whenever a new business
 * registers or requests a subscription upgrade that needs approval.
 */
export const sendPendingApprovalNotification = async (options: {
  businessName: string;
  businessType: string;
  email?: string | null;
  phone?: string | null;
  plan: string;
  billingPeriod: string;
  reason: 'NEW_REGISTRATION' | 'SUBSCRIPTION_REQUEST';
}) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("⚠️ Cannot send Super Admin approval notification: SMTP not configured.");
    return;
  }

  const adminEmail = process.env.SUPERADMIN_EMAIL || process.env.SMTP_USER;
  if (!adminEmail) {
    console.warn("⚠️ Cannot send Super Admin approval notification: No admin email configured (SUPERADMIN_EMAIL or SMTP_USER).",
      { SUPERADMIN_EMAIL: process.env.SUPERADMIN_EMAIL, SMTP_USER: process.env.SMTP_USER });
    return;
  }

  const domain = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const approvalsUrl = `${domain}/super-admin/approvals`;

  const reasonLabel = options.reason === 'NEW_REGISTRATION'
    ? '🆕 New Store Registration'
    : '⬆️ Subscription Upgrade Request';

  const billingLabel = options.billingPeriod === 'annual'
    ? '⚡ Annual (Save 20%)'
    : 'Monthly';

  const planColors: Record<string, string> = {
    BASIC: '#64748b',
    STANDARD: '#3b82f6',
    BUSINESS: '#8b5cf6',
    ENTERPRISE: '#6366f1',
  };
  const planColor = planColors[options.plan.toUpperCase()] || '#6366f1';

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
        <tr><td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:32px 40px;">
                <p style="margin:0;color:rgba(255,255,255,0.7);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:3px;">Protech Inventory OS</p>
                <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Action Required: Pending Approval</h1>
              </td>
            </tr>

            <!-- Alert Banner -->
            <tr>
              <td style="background:#fef3c7;padding:12px 40px;border-bottom:1px solid #fde68a;">
                <p style="margin:0;color:#92400e;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;">⚠️ ${reasonLabel}</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px 40px;">
                <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
                  A new request requires your approval in the Super Admin dashboard.
                </p>

                <!-- Business Card -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
                  <tr>
                    <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin:0;font-size:18px;font-weight:900;color:#0f172a;">${options.businessName}</p>
                            <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:700;letter-spacing:1px;">${options.businessType}</p>
                          </td>
                          <td align="right">
                            <span style="background:${planColor};color:#fff;padding:4px 12px;border-radius:999px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">${options.plan}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:16px 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        ${options.email ? `
                        <tr>
                          <td style="padding:6px 0;color:#64748b;font-size:12px;font-weight:600;">Email</td>
                          <td style="padding:6px 0;color:#0f172a;font-size:12px;font-weight:800;text-align:right;">${options.email}</td>
                        </tr>` : ''}
                        ${options.phone ? `
                        <tr>
                          <td style="padding:6px 0;color:#64748b;font-size:12px;font-weight:600;">Phone</td>
                          <td style="padding:6px 0;color:#0f172a;font-size:12px;font-weight:800;text-align:right;">${options.phone}</td>
                        </tr>` : ''}
                        <tr>
                          <td style="padding:6px 0;color:#64748b;font-size:12px;font-weight:600;">Plan Requested</td>
                          <td style="padding:6px 0;color:${planColor};font-size:12px;font-weight:800;text-align:right;">${options.plan}</td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;color:#64748b;font-size:12px;font-weight:600;">Billing Period</td>
                          <td style="padding:6px 0;color:#059669;font-size:12px;font-weight:800;text-align:right;">${billingLabel}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- CTA Button -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <a href="${approvalsUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#ffffff;padding:14px 36px;text-decoration:none;border-radius:10px;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:2px;box-shadow:0 4px 12px rgba(79,70,229,0.3);">
                        Review &amp; Approve →
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:24px 0 0;color:#94a3b8;font-size:11px;text-align:center;">
                  Or copy this link: <a href="${approvalsUrl}" style="color:#6366f1;">${approvalsUrl}</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
                <p style="margin:0;color:#94a3b8;font-size:10px;text-align:center;">Protech Assist SL Limited &bull; This is an automated system alert</p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Protech System" <no-reply@protech.com>',
      to: adminEmail,
      subject: `[Action Required] ${reasonLabel}: ${options.businessName} — ${options.plan} ${billingLabel}`,
      html,
    });
    console.log(`✅ Super Admin approval notification sent for: ${options.businessName}`);
  } catch (error) {
    console.error("❌ Failed to send Super Admin approval notification:", error);
  }
};
