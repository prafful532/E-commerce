const nodemailer = require('nodemailer');

// Email configuration
const emailTransporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send email notification
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"ModernStore" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const result = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

/**
 * Send SMS notification (placeholder - integrate with your SMS service)
 * @param {Object} options - SMS options
 * @param {string} options.to - Recipient phone number
 * @param {string} options.message - SMS message
 */
const sendSMS = async (options) => {
  try {
    // Placeholder for SMS service integration
    // You can integrate with services like Twilio, AWS SNS, etc.
    console.log(`SMS would be sent to ${options.to}: ${options.message}`);
    
    // Example Twilio integration:
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
    
    const result = await client.messages.create({
      body: options.message,
      from: process.env.TWILIO_PHONE,
      to: options.to
    });
    
    return result;
    */
    
    return { success: true, message: 'SMS sent (demo mode)' };
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw error;
  }
};

/**
 * Send push notification (placeholder)
 * @param {Object} options - Push notification options
 */
const sendPushNotification = async (options) => {
  try {
    // Placeholder for push notification service
    console.log('Push notification would be sent:', options);
    return { success: true, message: 'Push notification sent (demo mode)' };
  } catch (error) {
    console.error('Push notification failed:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendSMS,
  sendPushNotification
};