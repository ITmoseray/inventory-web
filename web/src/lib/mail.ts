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

/**
 * Notify the referrer when a referral event occurs.
 */
export const sendReferralNotification = async (options: {
  toEmail: string;
  referrerName: string;
  referredBusinessName: string;
  event: "LINK_USED" | "SUCCESSFUL" | "REWARD_GRANTED";
}) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("⚠️ Cannot send referral notification: SMTP not configured.");
    return;
  }

  const { toEmail, referrerName, referredBusinessName, event } = options;
  const domain = process.env.NEXTAUTH_URL || "https://app.protechassist.com";

  const eventMessages: Record<typeof event, { subject: string; body: string; color: string }> = {
    LINK_USED: {
      subject: `🎉 Your referral link was used by ${referredBusinessName}!`,
      body: `<strong>${referredBusinessName}</strong> has registered using your referral link. The referral is now <strong>Pending</strong> — it will become Successful once they activate a paid subscription.`,
      color: "#f59e0b",
    },
    SUCCESSFUL: {
      subject: `✅ Your referral to ${referredBusinessName} is now Successful!`,
      body: `<strong>${referredBusinessName}</strong> has activated a paid subscription through your referral. Your reward is pending admin approval!`,
      color: "#10b981",
    },
    REWARD_GRANTED: {
      subject: `🏆 Your referral reward has been granted!`,
      body: `Congratulations! Your reward for referring <strong>${referredBusinessName}</strong> has been officially granted. Thank you for spreading the word about Protech Assist!`,
      color: "#6366f1",
    },
  };

  const msg = eventMessages[event];

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:12px;">
      <div style="background:${msg.color};padding:20px 24px;border-radius:8px 8px 0 0;text-align:center;">
        <h2 style="color:#fff;margin:0;font-size:20px;">Protech Assist Referral Program</h2>
      </div>
      <div style="padding:24px;">
        <p style="color:#334155;font-size:15px;line-height:1.7;">Hi <strong>${referrerName}</strong>,</p>
        <p style="color:#475569;font-size:14px;line-height:1.7;">${msg.body}</p>
        <div style="text-align:center;margin-top:24px;">
          <a href="${domain}/dashboard/referrals" style="display:inline-block;background:${msg.color};color:#fff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;">
            View My Referrals →
          </a>
        </div>
        <hr style="border:0;border-top:1px solid #f1f5f9;margin:28px 0;" />
        <p style="color:#94a3b8;font-size:11px;text-align:center;">Protech Assist SL Limited • This is an automated notification</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Protech Assist" <no-reply@protechassist.com>',
      to: toEmail,
      subject: msg.subject,
      html,
    });
    console.log(`✅ Referral notification (${event}) sent to ${toEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send referral notification (${event}):`, error);
  }
};

/**
 * Sends an email notification to the affiliate when their application is approved
 */
export const sendAffiliateApprovalNotification = async (options: {
  email: string;
  fullName: string;
  affiliateCode: string;
}) => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("⚠️ Cannot send affiliate approval email: SMTP not configured.");
    return;
  }

  const domain = process.env.NEXTAUTH_URL || "https://inventory-web--protech-website-38a37.us-east4.hosted.app";
  const loginUrl = `${domain}/login?callbackUrl=/affiliate/dashboard`;
  const referralLink = `${domain}/ref/${options.affiliateCode}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"ProTech Assist SL" <no-reply@protechassist.com>',
    to: options.email,
    subject: `🎉 Congratulations! Your ProTech Assist Partner Account is Approved (${options.affiliateCode})`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;color:#f8fafc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border:1px solid #334155;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.4);">
              
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#059669 0%,#0d9488 100%);padding:36px 40px;text-align:center;">
                  <p style="margin:0;color:rgba(255,255,255,0.8);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:3px;">ProTech Assist SL Limited</p>
                  <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-0.5px;">Welcome to the Partner Network!</h1>
                </td>
              </tr>

              <!-- Content Body -->
              <tr>
                <td style="padding:36px 40px;">
                  <p style="margin:0 0 16px;color:#cbd5e1;font-size:15px;line-height:1.6;">
                    Dear <strong>${options.fullName}</strong>,
                  </p>
                  <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6;">
                    Congratulations! Your application to become an official affiliate partner of <strong>ProTech Assist SL Limited</strong> has been reviewed and <span style="color:#34d399;font-weight:bold;">officially approved</span>.
                  </p>

                  <!-- Credentials Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border:1px solid #334155;border-radius:14px;overflow:hidden;margin-bottom:28px;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:700;letter-spacing:1px;">Assigned Permanent Partner Code</p>
                        <p style="margin:6px 0 0;font-size:22px;font-weight:900;font-family:monospace;color:#34d399;">${options.affiliateCode}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:16px 24px;background:#141f32;border-top:1px solid #1e293b;">
                        <p style="margin:0;font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:700;letter-spacing:1px;">Your Primary Referral Link</p>
                        <p style="margin:6px 0 0;font-size:13px;font-family:monospace;color:#38bdf8;word-break:break-all;">${referralLink}</p>
                      </td>
                    </tr>
                  </table>

                  <!-- What's Next -->
                  <h3 style="margin:0 0 12px;font-size:14px;font-weight:800;color:#f8fafc;text-transform:uppercase;letter-spacing:1px;">Quick Start Guide:</h3>
                  <ul style="margin:0 0 28px;padding-left:20px;color:#94a3b8;font-size:13px;line-height:1.8;">
                    <li><strong>Share Your Link:</strong> Post on WhatsApp status, Facebook, or pitch directly to retail shops and pharmacies for Enterprise OS POS.</li>
                    <li><strong>Earn up to 15%:</strong> Earn guaranteed single-level commissions on software subscriptions and student training cohorts.</li>
                    <li><strong>30-Day Attribution:</strong> Visitors clicking your link are locked to your account for 30 full days.</li>
                    <li><strong>Withdraw Earnings:</strong> Request payouts directly to Orange Money, Afrimoney, or Bank Transfer from your dashboard.</li>
                  </ul>

                  <!-- CTA Button -->
                  <div style="text-align:center;margin:32px 0 16px;">
                    <a href="${loginUrl}" style="background:linear-gradient(135deg,#059669 0%,#0d9488 100%);color:#ffffff;padding:14px 32px;text-decoration:none;border-radius:12px;font-weight:bold;font-size:14px;display:inline-block;box-shadow:0 4px 16px rgba(5,150,105,0.4);">
                      Sign In to Partner Portal →
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:24px 40px;background:#0f172a;border-top:1px solid #334155;text-align:center;">
                  <p style="margin:0;color:#64748b;font-size:11px;">
                    ProTech Assist SL Limited &bull; Empowering Businesses Through Technology<br/>
                    Freetown, Sierra Leone
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Affiliate approval email sent to ${options.email}`);
  } catch (error) {
    console.error("❌ Failed to send affiliate approval email:", error);
  }
};

/**
 * Sends an email notification to the affiliate when their application is rejected
 */
export const sendAffiliateRejectionNotification = async (options: {
  email: string;
  fullName: string;
  reason?: string;
}) => {
  const transporter = getTransporter();
  if (!transporter) return;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"ProTech Assist SL" <no-reply@protechassist.com>',
    to: options.email,
    subject: "Update Regarding Your ProTech Assist Partner Application",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #334155;">
        <h2 style="color: #f8fafc; margin-top: 0;">Partner Application Status Update</h2>
        <p style="color: #cbd5e1; line-height: 1.6;">Dear <strong>${options.fullName}</strong>,</p>
        <p style="color: #94a3b8; line-height: 1.6;">
          Thank you for your interest in the ProTech Assist SL Affiliate Partner Program. After careful review of your application, our team is unable to approve your account at this time.
        </p>
        ${options.reason ? `
        <div style="background: #1e293b; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #fca5a5;"><strong>Reason provided:</strong> ${options.reason}</p>
        </div>` : ''}
        <p style="color: #94a3b8; line-height: 1.6;">
          If you believe this was in error or if your circumstances have changed, please contact ProTech Assist support or reply to this email.
        </p>
        <hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0;" />
        <p style="color: #64748b; font-size: 11px; margin: 0;">ProTech Assist SL Limited &bull; Empowering Businesses Through Technology</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("❌ Failed to send affiliate rejection email:", error);
  }
};
