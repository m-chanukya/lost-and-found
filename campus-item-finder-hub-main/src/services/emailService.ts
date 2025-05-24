import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export class EmailService {
  static async sendPasswordResetEmail(email: string, name: string): Promise<void> {
    // Generate a reset token that expires in 1 hour
    const resetToken = jwt.sign(
      { email, type: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Create reset link with token
    const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;

    const msg = {
      to: email,
      from: 'noreply@campusitemfinder.com', // Verify this domain in SendGrid
      subject: 'Reset Your Password - Campus Item Finder',
      text: `Hi ${name},\n\nYou requested to reset your password. Click the link below to reset it:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.\n\nBest regards,\nCampus Item Finder Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p>Hi ${name},</p>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">Best regards,<br>Campus Item Finder Team</p>
        </div>
      `,
    };

    if (!SENDGRID_API_KEY) {
      console.log('SendGrid API key not found. Email would have been sent:', {
        to: email,
        resetLink,
      });
      return;
    }

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  static verifyResetToken(token: string): { email: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string; type: string };
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }
      return { email: decoded.email };
    } catch (error) {
      throw new Error('Invalid or expired reset token');
    }
  }
} 