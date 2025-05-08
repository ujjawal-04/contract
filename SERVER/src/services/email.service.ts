// src/services/email.service.ts - Fixed version with all enterprise email functions
import { Resend } from "resend";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const resend = new Resend(RESEND_API_KEY);

// Original premium confirmation email
export const sendPremiumConfirmationEmail = async (
  userEmail: string,
  userName: string
) => {
  try {
    await resend.emails.send({
      from: 'team@charandhul.com',
      to: userEmail,
      subject: 'Welcome to Premium Contract Analysis',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Premium Subscription Activated</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f7fa; color: #333333;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 640px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); margin-top: 24px; margin-bottom: 24px;">
            <!-- Header -->
            <tr>
              <td style="padding: 30px 0; text-align: center; background-color: #1a56db;">
                <h1 style="color: #ffffff; font-size: 26px; margin: 0;">Premium Subscription Activated</h1>
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
                  Dear ${userName},
                </p>

                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Thank you for subscribing to <strong>Premium Contract Analysis</strong>. Your lifetime access has been successfully activated, and you now have full access to our advanced legal intelligence tools.
                </p>

                <h2 style="color: #1a56db; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">Your Premium Access Includes:</h2>

                <ul style="padding-left: 20px; font-size: 15px; color: #444; line-height: 1.8;">
                  <li> Detailed contract breakdown with key clause identification</li>
                  <li> Negotiation point suggestions for stronger contract positioning</li>
                  <li> Access to our integrated AI chatbot for on-demand contract guidance</li>
                  <li> More 5+ risk detection </li>
                  <li> More 5+ opportunities detection </li>
                  <li> Unlimited PDF uploads for contract review</li>
                  <li> Lifetime access</li>
                </ul>

                <p style="font-size: 15px; line-height: 1.6; margin-top: 25px;">
                  You can begin exploring these features now by visiting your dashboard. All premium functionalities have already been enabled in your account.
                </p>

                <div style="text-align: center; margin: 35px 0;">
                  <a href="http://localhost:3000/dashboard" style="background-color: #1a56db; color: #ffffff; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                    Go to Dashboard
                  </a>
                </div>

                <p style="font-size: 15px; line-height: 1.6;">
                  If you have any questions, feel free to reach out to us at 
                  <a href="mailto:support@charandhul.com" style="color: #1a56db; text-decoration: none;">support@charandhul.com</a>.
                </p>

                <p style="font-size: 15px; margin-top: 30px;">Thank you for choosing our service.</p>
                <p style="font-size: 15px; margin-bottom: 0;">Best regards,<br>The Contract Analysis Team</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f0f4f9; padding: 20px 30px; text-align: center; font-size: 13px; color: #888888;">
                <p style="margin: 0;">© 2025 Contract Analysis. All rights reserved.</p>
                <p style="margin: 4px 0 0 0;">team@charandhul.com | <a href="#" style="color: #1a56db; text-decoration: none;">Privacy Policy</a></p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error(error);
  }
};

// New enterprise welcome email
export const sendEnterpriseWelcomeEmail = async (
  userEmail: string,
  userName: string,
  organizationName: string
) => {
  try {
    await resend.emails.send({
      from: 'team@charandhul.com',
      to: userEmail,
      subject: `Your Enterprise Workspace for ${organizationName} is Ready`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Enterprise Workspace Ready</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f7fa; color: #333333;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 640px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); margin-top: 24px; margin-bottom: 24px;">
            <!-- Header -->
            <tr>
              <td style="padding: 30px 0; text-align: center; background-color: #1a56db;">
                <h1 style="color: #ffffff; font-size: 26px; margin: 0;">Enterprise Workspace Ready</h1>
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
                  Dear ${userName},
                </p>

                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Congratulations! Your enterprise workspace for <strong>${organizationName}</strong> has been successfully created.
                </p>

                <h2 style="color: #1a56db; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">Next Steps:</h2>

                <ol style="padding-left: 20px; font-size: 15px; color: #444; line-height: 1.8;">
                  <li>Invite team members to your workspace</li>
                  <li>Set up your subscription plan</li>
                  <li>Upload your first contract for team collaboration</li>
                  <li>Customize your workspace settings</li>
                </ol>

                <div style="text-align: center; margin: 35px 0;">
                  <a href="${process.env.CLIENT_URL}/enterprise/dashboard" style="background-color: #1a56db; color: #ffffff; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                    Go to Enterprise Dashboard
                  </a>
                </div>

                <p style="font-size: 15px; line-height: 1.6;">
                  If you have any questions, feel free to reach out to our enterprise support team at 
                  <a href="mailto:enterprise@charandhul.com" style="color: #1a56db; text-decoration: none;">enterprise@charandhul.com</a>.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f0f4f9; padding: 20px 30px; text-align: center; font-size: 13px; color: #888888;">
                <p style="margin: 0;">© 2025 Contract Analysis. All rights reserved.</p>
                <p style="margin: 4px 0 0 0;">team@charandhul.com | <a href="#" style="color: #1a56db; text-decoration: none;">Privacy Policy</a></p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    console.log(`Enterprise welcome email sent to ${userEmail} for ${organizationName}`);
  } catch (error) {
    console.error("Error sending enterprise welcome email:", error);
  }
};

// Team invitation email
export const sendEnterpriseInviteEmail = async (
  userEmail: string,
  organizationName: string,
  inviterName: string,
  inviteToken: string,
  role: string
) => {
  const inviteUrl = `${process.env.CLIENT_URL}/accept-invite?token=${inviteToken}`;
  
  try {
    await resend.emails.send({
      from: 'team@charandhul.com',
      to: userEmail,
      subject: `You've been invited to join ${organizationName} on Contract Analysis`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Team Invitation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f7fa; color: #333333;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 640px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); margin-top: 24px; margin-bottom: 24px;">
            <!-- Header -->
            <tr>
              <td style="padding: 30px 0; text-align: center; background-color: #1a56db;">
                <h1 style="color: #ffffff; font-size: 26px; margin: 0;">Team Invitation</h1>
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
                  Hello,
                </p>

                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  ${inviterName} has invited you to join <strong>${organizationName}</strong> on Contract Analysis platform as a <strong>${role}</strong>.
                </p>

                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Contract Analysis helps teams collaborate on contract review and analysis, identify risks and opportunities, and streamline negotiation processes.
                </p>

                <div style="text-align: center; margin: 35px 0;">
                  <a href="${inviteUrl}" style="background-color: #1a56db; color: #ffffff; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                    Accept Invitation
                  </a>
                </div>

                <p style="font-size: 14px; color: #666; line-height: 1.6;">
                  This invitation will expire in 7 days. If you believe this invitation was sent in error, please disregard this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f0f4f9; padding: 20px 30px; text-align: center; font-size: 13px; color: #888888;">
                <p style="margin: 0;">© 2025 Contract Analysis. All rights reserved.</p>
                <p style="margin: 4px 0 0 0;">team@charandhul.com | <a href="#" style="color: #1a56db; text-decoration: none;">Privacy Policy</a></p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    console.log(`Enterprise invitation email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending enterprise invite email:", error);
  }
};

// Contract comment notification email
export const sendContractCommentNotification = async (
  userEmail: string,
  userName: string,
  commenterName: string,
  contractName: string,
  commentText: string,
  contractUrl: string
) => {
  try {
    await resend.emails.send({
      from: 'team@charandhul.com',
      to: userEmail,
      subject: `New comment on contract: ${contractName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contract Comment</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f7fa; color: #333333;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 640px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); margin-top: 24px; margin-bottom: 24px;">
            <!-- Header -->
            <tr>
              <td style="padding: 30px 0; text-align: center; background-color: #1a56db;">
                <h1 style="color: #ffffff; font-size: 26px; margin: 0;">New Comment on Contract</h1>
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <p style="font-size: 16px; margin-top: 0; margin-bottom: 20px;">
                  Hello ${userName},
                </p>

                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 10px;">
                  <strong>${commenterName}</strong> has commented on the contract: <strong>${contractName}</strong>
                </p>

                <div style="background-color: #f8f8f8; border-left: 4px solid #1a56db; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0;">
                  <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #555;">${commentText}</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${contractUrl}" style="background-color: #1a56db; color: #ffffff; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px;">
                    View Comment
                  </a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f0f4f9; padding: 20px 30px; text-align: center; font-size: 13px; color: #888888;">
                <p style="margin: 0;">© 2025 Contract Analysis. All rights reserved.</p>
                <p style="margin: 4px 0 0 0;">
                  <a href="${process.env.CLIENT_URL}/notification-settings" style="color: #1a56db; text-decoration: none;">Manage notification settings</a>
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Error sending comment notification email:", error);
  }
};