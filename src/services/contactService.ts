import nodemailer from 'nodemailer';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  feedbackType: string;
  message: string;
}

export class ContactService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create transporter using Gmail SMTP
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'qeezit@gmail.com',
        pass: process.env.EMAIL_PASSWORD || '' // App password for Gmail
      }
    });
  }

  async sendContactEmail(formData: ContactFormData): Promise<void> {
    const { firstName, lastName, email, feedbackType, message } = formData;
    
    // Map feedback types to readable text
    const feedbackTypeMap: { [key: string]: string } = {
      'love': 'I love this about Qeezit',
      'feature': 'I wish Qeezit had this feature',
      'bug': 'I found a big bug',
      'other': 'Something else'
    };

    const feedbackTypeText = feedbackTypeMap[feedbackType] || feedbackType;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'qeezit@gmail.com',
      to: 'qeezit@gmail.com',
      subject: `New Contact Form Submission - ${feedbackTypeText}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0; font-size: 24px;">New Contact Form Submission</h2>
          </div>
          
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="color: #1f2937; margin-top: 0;">Contact Information</h3>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #3b82f6;">${email}</a></p>
              <p><strong>Feedback Type:</strong> ${feedbackTypeText}</p>
            </div>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #1f2937; margin-top: 0;">Message</h3>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${message}</div>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>This message was sent from the Qeezit Contact Form</p>
              <p>Reply directly to this email to respond to ${firstName} ${lastName}</p>
            </div>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Contact Information:
- Name: ${firstName} ${lastName}
- Email: ${email}
- Feedback Type: ${feedbackTypeText}

Message:
${message}

---
This message was sent from the Qeezit Contact Form
Reply directly to this email to respond to ${firstName} ${lastName}
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('📧 Contact email sent successfully to qeezit@gmail.com');
    } catch (error) {
      console.error('❌ Failed to send contact email:', error);
      throw new Error(`Failed to send email: ${(error as Error).message}`);
    }
  }
}
