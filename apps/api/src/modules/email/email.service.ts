import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("SMTP_HOST", "smtp.gmail.com"),
      port: this.configService.get<number>("SMTP_PORT", 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>("SMTP_USER"),
        pass: this.configService.get<string>("SMTP_PASS"),
      },
    });
  }

  async sendMagicLinkEmail(to: string, magicLink: string, token: string): Promise<boolean> {
    const fromEmail = this.configService.get<string>("SMTP_FROM", this.configService.get<string>("SMTP_USER"));
    const appName = this.configService.get<string>("APP_NAME", "Instructor SaaS");

    try {
      const info = await this.transporter.sendMail({
        from: `"${appName}" <${fromEmail}>`,
        to,
        subject: `Your Login Link - ${appName}`,
        text: `
Hello,

Click the link below to log in to your account:

${magicLink}

This link will expire in 15 minutes.

If you didn't request this link, you can safely ignore this email.

Thanks,
${appName} Team
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${appName}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Log in to your account</h2>
    
    <p>Click the button below to securely log in:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${magicLink}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 14px 30px; 
                text-decoration: none; 
                border-radius: 6px; 
                font-weight: 600;
                display: inline-block;">
        Log In Now
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #666;">
      ${magicLink}
    </p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; margin-bottom: 0;">
      This link will expire in <strong>15 minutes</strong>.<br>
      If you didn't request this email, you can safely ignore it.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    © ${new Date().getFullYear()} ${appName}. All rights reserved.
  </div>
</body>
</html>
        `.trim(),
      });

      console.log(`✅ Magic link email sent to ${to}`);
      console.log(`   Message ID: ${info.messageId}`);
      
      // Also log to console for development
      console.log(`\n==============================`);
      console.log(`MAGIC LINK for ${to}:`);
      console.log(magicLink);
      console.log(`Token: ${token}`);
      console.log(`==============================\n`);

      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      
      // Still log the magic link so development isn't blocked
      console.log(`\n==============================`);
      console.log(`EMAIL FAILED - MAGIC LINK for ${to}:`);
      console.log(magicLink);
      console.log(`Token: ${token}`);
      console.log(`==============================\n`);

      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("✅ Email service connected successfully");
      return true;
    } catch (error) {
      console.error("❌ Email service connection failed:", error);
      return false;
    }
  }

  async sendLearnerInviteEmail(
    to: string,
    magicLink: string,
    token: string,
    instructorName: string
  ): Promise<boolean> {
    const fromEmail = this.configService.get<string>("SMTP_FROM", this.configService.get<string>("SMTP_USER"));
    const appName = this.configService.get<string>("APP_NAME", "Instructor SaaS");

    try {
      const info = await this.transporter.sendMail({
        from: `"${appName}" <${fromEmail}>`,
        to,
        subject: `You've been invited to ${appName}!`,
        text: `
Hello,

${instructorName} has added you as a learner on ${appName}.

Click the link below to access your account and view your lessons:

${magicLink}

This link will expire in 15 minutes. You can always request a new one from the login page.

Thanks,
${appName} Team
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${appName}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #333; margin-top: 0;">Welcome! You've been invited 🎉</h2>
    
    <p><strong>${instructorName}</strong> has added you as a learner. Click the button below to access your account:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${magicLink}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 14px 30px; 
                text-decoration: none; 
                border-radius: 6px; 
                font-weight: 600;
                display: inline-block;">
        Access My Account
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">
      Or copy and paste this link into your browser:
    </p>
    <p style="background: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #666;">
      ${magicLink}
    </p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; margin-bottom: 0;">
      This link will expire in <strong>15 minutes</strong>.<br>
      You can always request a new link from the login page.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    © ${new Date().getFullYear()} ${appName}. All rights reserved.
  </div>
</body>
</html>
        `.trim(),
      });

      console.log(`✅ Learner invite email sent to ${to}`);
      console.log(`   Message ID: ${info.messageId}`);
      
      // Also log to console for development
      console.log(`\n==============================`);
      console.log(`LEARNER INVITE for ${to}:`);
      console.log(magicLink);
      console.log(`Token: ${token}`);
      console.log(`==============================\n`);

      return true;
    } catch (error) {
      console.error(`❌ Failed to send invite email to ${to}:`, error);
      
      // Still log the magic link so development isn't blocked
      console.log(`\n==============================`);
      console.log(`EMAIL FAILED - LEARNER INVITE for ${to}:`);
      console.log(magicLink);
      console.log(`Token: ${token}`);
      console.log(`==============================\n`);

      return false;
    }
  }

  /**
   * Send a payment receipt email to the learner after a successful top-up or booking payment.
   */
  async sendPaymentReceiptEmail(
    to: string,
    receiptDetails: {
      learnerName: string;
      instructorName: string;
      amount: number;
      currency: string;
      paymentType: string;
      paymentMethod: string;
      paymentId: string;
      paidAt: Date;
      description?: string;
    }
  ): Promise<boolean> {
    const fromEmail = this.configService.get<string>("SMTP_FROM", this.configService.get<string>("SMTP_USER"));
    const appName = this.configService.get<string>("APP_NAME", "InDrive");
    const learnerAppUrl = this.configService.get<string>("LEARNER_APP_URL", "http://localhost:3002");

    const currencySymbol = receiptDetails.currency === 'GBP' ? '£' : receiptDetails.currency;
    const formattedAmount = `${currencySymbol}${receiptDetails.amount.toFixed(2)}`;
    const formattedDate = receiptDetails.paidAt.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formattedTime = receiptDetails.paidAt.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const typeLabels: Record<string, string> = {
      'top-up': 'Account Top-Up',
      'lesson-booking': 'Lesson Booking',
      'package-booking': 'Package Purchase',
      'cancellation-fee': 'Cancellation Fee',
      'refund': 'Refund',
    };
    const typeLabel = typeLabels[receiptDetails.paymentType] || receiptDetails.paymentType;
    const receiptNumber = `RCP-${receiptDetails.paymentId.slice(-8).toUpperCase()}`;
    const paymentsUrl = `${learnerAppUrl}/payments`;

    try {
      const info = await this.transporter.sendMail({
        from: `"${appName}" <${fromEmail}>`,
        to,
        subject: `Payment Receipt - ${formattedAmount} - ${appName}`,
        text: `
Payment Receipt
===============

Receipt #: ${receiptNumber}
Date: ${formattedDate} at ${formattedTime}

Hi ${receiptDetails.learnerName},

Your payment has been received successfully.

Type: ${typeLabel}
Amount: ${formattedAmount}
Instructor: ${receiptDetails.instructorName}
Payment Method: ${receiptDetails.paymentMethod}
${receiptDetails.description ? `Description: ${receiptDetails.description}` : ''}

You can view and download your receipts at:
${paymentsUrl}

Thanks,
${appName} Team
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">💳 Payment Receipt</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">${appName}</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <div>
        <p style="color: #666; font-size: 12px; margin: 0;">Receipt Number</p>
        <p style="font-weight: 700; font-size: 16px; margin: 4px 0 0; font-family: monospace;">${receiptNumber}</p>
      </div>
      <div style="text-align: right;">
        <p style="color: #666; font-size: 12px; margin: 0;">Date</p>
        <p style="font-weight: 600; font-size: 14px; margin: 4px 0 0;">${formattedDate}</p>
        <p style="color: #666; font-size: 12px; margin: 2px 0 0;">${formattedTime}</p>
      </div>
    </div>

    <p style="font-size: 16px; margin: 0 0 20px;">Hi ${receiptDetails.learnerName},</p>
    <p>Your payment has been received successfully. Here are the details:</p>
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #e2e8f0;">Type</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0;">${typeLabel}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #e2e8f0;">Instructor</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0;">${receiptDetails.instructorName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #e2e8f0;">Payment Method</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0; text-transform: capitalize;">${receiptDetails.paymentMethod}</td>
        </tr>
        ${receiptDetails.description ? `
        <tr>
          <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #e2e8f0;">Description</td>
          <td style="padding: 10px 0; font-weight: 600; text-align: right; border-bottom: 1px solid #e2e8f0;">${receiptDetails.description}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 14px 0; color: #333; font-weight: 600; font-size: 16px;">Amount Paid</td>
          <td style="padding: 14px 0; font-weight: 700; font-size: 22px; text-align: right; color: #10B981;">${formattedAmount}</td>
        </tr>
      </table>
    </div>

    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px 16px; margin: 20px 0;">
      <p style="margin: 0; color: #065f46; font-size: 14px;">✅ Payment successful — your account balance has been updated.</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${paymentsUrl}" 
         style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); 
                color: white; 
                padding: 14px 30px; 
                text-decoration: none; 
                border-radius: 6px; 
                font-weight: 600;
                display: inline-block;">
        View Payment History
      </a>
    </div>
  </div>
  
  <div style="background: #f8fafc; padding: 20px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="color: #999; font-size: 11px; margin: 0; text-align: center;">
      This is an automated receipt from ${appName}. Please keep this email for your records.<br>
      &copy; ${new Date().getFullYear()} ${appName}. All rights reserved.
    </p>
  </div>
</body>
</html>
        `.trim(),
      });

      console.log(`📧 Payment receipt email sent to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send payment receipt to ${to}:`, error);
      return false;
    }
  }

  async sendBookingConfirmationEmail(
    to: string,
    token: string,
    bookingDetails: {
      learnerName: string;
      instructorName: string;
      date: string;
      time: string;
      duration: number;
      price: number;
      currency: string;
      isPaid?: boolean;
    }
  ): Promise<boolean> {
    const fromEmail = this.configService.get<string>("SMTP_FROM", this.configService.get<string>("SMTP_USER"));
    const appName = this.configService.get<string>("APP_NAME", "InDrive");
    const learnerAppUrl = this.configService.get<string>("LEARNER_APP_URL", "http://localhost:3002");
    
    const confirmLink = `${learnerAppUrl}/verify?token=${token}`;
    const currencySymbol = bookingDetails.currency === 'GBP' ? '£' : bookingDetails.currency;
    
    const isPaid = bookingDetails.isPaid || false;
    const subject = isPaid 
      ? `Booking Confirmed with ${bookingDetails.instructorName}!`
      : `Confirm your lesson with ${bookingDetails.instructorName}`;
    const headerText = isPaid ? '✅ Booking Confirmed!' : '🚗 Confirm Your Booking';
    const headerColor = isPaid ? '#10B981' : '#3B82F6';
    const actionText = isPaid 
      ? 'Click the link below to access your learner portal:'
      : 'Click the link below to confirm your booking:';
    const buttonText = isPaid ? 'View My Booking' : 'Confirm My Booking';
    const paymentStatus = isPaid ? `✅ PAID` : `💰 ${currencySymbol}${bookingDetails.price.toFixed(2)}`;

    try {
      const info = await this.transporter.sendMail({
        from: `"${appName}" <${fromEmail}>`,
        to,
        subject,
        text: `
Hello ${bookingDetails.learnerName},

${isPaid ? 'Your driving lesson has been booked and paid for!' : 'You\'ve requested to book a driving lesson. Please confirm your booking:'}

📅 Date: ${bookingDetails.date}
🕐 Time: ${bookingDetails.time}
⏱️ Duration: ${bookingDetails.duration} minutes
👨‍🏫 Instructor: ${bookingDetails.instructorName}
${isPaid ? '✅ Payment: PAID' : `💰 Price: ${currencySymbol}${bookingDetails.price.toFixed(2)}`}

${actionText}
${confirmLink}

${isPaid ? '' : 'This link will expire in 1 hour.'}

${isPaid ? '' : 'If you didn\'t request this booking, you can safely ignore this email.'}

Thanks,
${appName} Team
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, ${headerColor} 0%, ${isPaid ? '#059669' : '#1D4ED8'} 100%); padding: 30px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">${headerText}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
    <p style="font-size: 16px; margin-top: 0;">Hi ${bookingDetails.learnerName},</p>
    
    <p>${isPaid ? 'Great news! Your driving lesson has been booked and paid for.' : 'You\'ve requested to book a driving lesson. Please confirm your booking details below:'}</p>
    
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666;">📅 Date</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${bookingDetails.date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">🕐 Time</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${bookingDetails.time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">⏱️ Duration</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${bookingDetails.duration} minutes</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">👨‍🏫 Instructor</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: right;">${bookingDetails.instructorName}</td>
        </tr>
        <tr style="border-top: 2px solid #e0e0e0;">
          <td style="padding: 12px 0 8px; color: #666;">${isPaid ? '💳 Payment' : '💰 Price'}</td>
          <td style="padding: 12px 0 8px; font-weight: 700; font-size: 18px; text-align: right; color: ${isPaid ? '#10B981' : '#333'};">${paymentStatus}</td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${confirmLink}" style="display: inline-block; background: ${headerColor}; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">${buttonText}</a>
    </div>
    
    ${isPaid ? '' : '<p style="font-size: 14px; color: #666;">This link will expire in 1 hour.</p>'}
    
    <p style="font-size: 14px; color: #666; margin-top: 20px;">${isPaid ? '' : 'If you didn\'t request this booking, you can safely ignore this email.'}</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
  </div>
</body>
</html>
        `.trim(),
      });

      console.log(`📧 Booking ${isPaid ? 'confirmed' : 'confirmation'} email sent to ${to}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send booking confirmation email to ${to}:`, error);
      return false;
    }
  }
}
