
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Настройка транспортера
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true' || true, // true для 465, false для других
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Отправка OTP кода администратору
 * @param {string} to - Email получателя
 * @param {string} otp - 6-значный код
 */
export async function sendAdminOTP(to, otp) {
  const htmlContent = `
    <div style="background-color: #0a0a0c; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; border-radius: 20px; text-align: center; max-width: 500px; margin: auto; border: 1px solid #2d2d3d;">
      <div style="font-size: 40px; margin-bottom: 20px;">🦄</div>
      <h1 style="color: #ffffff; font-weight: 900; letter-spacing: -1px; margin-bottom: 10px;">Skazka<span style="color: #8b5cf6;">AI</span></h1>
      <p style="color: #6b7280; text-transform: uppercase; font-size: 10px; font-weight: bold; tracking: 2px;">Панель управления магией</p>
      
      <div style="margin: 40px 0; padding: 30px; background: rgba(139, 92, 246, 0.1); border: 1px dashed #8b5cf6; border-radius: 16px;">
        <p style="color: #9ca3af; font-size: 14px; margin-bottom: 15px;">Ваш код доступа в замок:</p>
        <span style="font-size: 42px; font-weight: 900; letter-spacing: 10px; color: #ffffff;">${otp}</span>
      </div>
      
      <p style="color: #4b5563; font-size: 12px; line-height: 1.6;">
        Если вы не запрашивали этот код, просто проигнорируйте письмо.<br>
        Код действителен в течение 10 минут.
      </p>
      
      <div style="margin-top: 40px; border-top: 1px solid #1f2937; pt: 20px; font-size: 10px; color: #374151;">
        © 2025 SkazkaAI Engine. Защищено магией.
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"SkazkaAI Security" <${process.env.SMTP_USER}>`,
      to,
      subject: `🗝️ Ваш код доступа: ${otp}`,
      html: htmlContent,
    });
    console.log('✉️ Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Mailer Error:', error);
    return false;
  }
}
