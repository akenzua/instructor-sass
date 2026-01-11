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
}
