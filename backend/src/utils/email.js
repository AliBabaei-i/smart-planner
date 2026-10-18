import nodemailer from 'nodemailer'
import logger from './logger.js'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const sendResetEmail = async (to, resetUrl) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('SMTP not configured. Email not sent. Link:', resetUrl)
    return false
  }

  try {
    await transporter.sendMail({
      from: `"Smart Planner" <${process.env.SMTP_USER}>`,
      to,
      subject: 'بازیابی رمز عبور - Smart Planner',
      html: `
        <div dir="rtl" style="font-family: Tahoma, sans-serif; padding: 20px;">
          <h2>بازیابی رمز عبور</h2>
          <p>برای تغییر رمز عبور خود روی لینک زیر کلیک کنید:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;margin:16px 0;">
            تغییر رمز عبور
          </a>
          <p>این لینک تا ۱ ساعت دیگر منقضی می‌شود.</p>
          <p>اگر شما این درخواست را نداده‌اید، نادیده بگیرید.</p>
        </div>
      `,
    })
    logger.success(`✅ Reset email sent to ${to}`)
    return true
  } catch (error) {
    logger.error('Email send failed:', error.message)
    return false
  }
}