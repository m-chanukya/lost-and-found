import { ItemMatch, LostItem, FoundItem, NotificationPreferences } from '@/types/item';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { DatabaseService } from './databaseService';

export class NotificationService {
  private static transporter = nodemailer.createTransport({
    // Configure your email service here
    // Example for Gmail:
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  private static twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  private static async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
      });
      console.log(`Email sent successfully to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  private static async sendSMS(
    to: string,
    message: string
  ): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        body: message,
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
      });
      console.log(`SMS sent successfully to ${to}`);
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  private static generateMatchEmail(
    match: ItemMatch,
    lostItem: LostItem,
    foundItem: FoundItem
  ): string {
    return `
      <h2>Potential Match Found!</h2>
      <p>We've found a potential match for your lost item with ${match.matchConfidence}% confidence.</p>
      
      <h3>Your Lost Item</h3>
      <ul>
        <li><strong>Title:</strong> ${lostItem.title}</li>
        <li><strong>Category:</strong> ${lostItem.category}</li>
        <li><strong>Description:</strong> ${lostItem.description}</li>
        <li><strong>Last Seen:</strong> ${lostItem.lastSeenLocation}</li>
        <li><strong>Date Lost:</strong> ${new Date(lostItem.date).toLocaleDateString()}</li>
      </ul>

      <h3>Found Item Details</h3>
      <ul>
        <li><strong>Location Found:</strong> ${foundItem.foundLocation}</li>
        <li><strong>Date Found:</strong> ${new Date(foundItem.date).toLocaleDateString()}</li>
        <li><strong>Description:</strong> ${foundItem.description}</li>
      </ul>

      <p>Please log in to your account to view more details and confirm if this is your item.</p>
      <a href="${process.env.APP_URL}/matches/${match.id}" style="
        background-color: #1a73e8;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 5px;
        display: inline-block;
        margin-top: 10px;
      ">
        View Match Details
      </a>
    `;
  }

  private static generateMatchSMS(
    match: ItemMatch,
    lostItem: LostItem,
    foundItem: FoundItem
  ): string {
    return `
      Potential match found for your lost ${lostItem.title}!
      Confidence: ${match.matchConfidence}%
      Found at: ${foundItem.foundLocation}
      View details: ${process.env.APP_URL}/matches/${match.id}
    `.trim();
  }

  public static async notifyMatch(
    match: ItemMatch,
    lostItem: LostItem,
    foundItem: FoundItem,
    userPreferences: NotificationPreferences
  ): Promise<void> {
    const notifications: Promise<void>[] = [];

    if (userPreferences.email && userPreferences.emailAddress) {
      const emailContent = this.generateMatchEmail(match, lostItem, foundItem);
      notifications.push(
        this.sendEmail(
          userPreferences.emailAddress,
          'Potential Match Found - Campus Item Finder',
          emailContent
        )
      );
    }

    if (userPreferences.sms && userPreferences.phoneNumber) {
      const smsContent = this.generateMatchSMS(match, lostItem, foundItem);
      notifications.push(
        this.sendSMS(userPreferences.phoneNumber, smsContent)
      );
    }

    try {
      await Promise.all(notifications);
    } catch (error) {
      console.error('Error sending notifications:', error);
      throw error;
    }
  }

  static async sendTestEmail(to: string): Promise<void> {
    console.log('Test email configuration:', {
      from: process.env.EMAIL_USER,
      to: to,
      hasPassword: !!process.env.EMAIL_APP_PASSWORD
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Campus Item Finder - Test Email',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from the Campus Item Finder system.</p>
        <p>If you received this email, it means your email configuration is working correctly.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email:', error);
      throw error;
    }
  }

  static async notifyUserOfMatch(match: ItemMatch): Promise<void> {
    try {
      console.log('Starting email notification process...');
      console.log('Using email configuration:', {
        emailUser: process.env.EMAIL_USER,
        hasPassword: !!process.env.EMAIL_APP_PASSWORD
      });

      const userPrefs = await DatabaseService.getUserPreferences(match.lostItem!.userId);
      
      if (!userPrefs || !userPrefs.email || !userPrefs.emailAddress) {
        console.log('User preferences check failed:', {
          hasPrefs: !!userPrefs,
          emailEnabled: userPrefs?.email,
          hasEmailAddress: !!userPrefs?.emailAddress
        });
        return;
      }

      const matchConfidencePercent = Math.round(match.matchConfidence * 100);
      
      const emailContent = `
        <h2>Potential Match Found for Your Lost Item!</h2>
        <p>We've found an item that matches your lost ${match.lostItem!.title} with ${matchConfidencePercent}% confidence.</p>
        
        <h3>Lost Item Details:</h3>
        <ul>
          <li>Title: ${match.lostItem!.title}</li>
          <li>Category: ${match.lostItem!.category}</li>
          <li>Last Seen: ${match.lostItem!.lastSeenLocation}</li>
          <li>Description: ${match.lostItem!.description}</li>
        </ul>

        <h3>Found Item Details:</h3>
        <ul>
          <li>Found Location: ${match.foundItem!.foundLocation}</li>
          <li>Date Found: ${new Date(match.foundItem!.date).toLocaleDateString()}</li>
          <li>Description: ${match.foundItem!.description}</li>
        </ul>

        <p>If this is your item, please log in to the Campus Item Finder to confirm the match.</p>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userPrefs.emailAddress,
        subject: `Potential Match Found - ${match.lostItem!.title}`,
        html: emailContent
      };

      console.log('Attempting to send email to:', userPrefs.emailAddress);
      
      await this.transporter.sendMail(mailOptions);
      console.log(`Match notification email sent successfully to ${userPrefs.emailAddress}`);
    } catch (error) {
      console.error('Error in email notification process:', error);
      throw error;
    }
  }
} 