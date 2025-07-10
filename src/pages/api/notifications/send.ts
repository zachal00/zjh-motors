import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type, channel, recipients, message, subject } = req.body;

  try {
    if (channel === 'email') {
      for (const recipient of recipients) {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: recipient.email,
          subject: subject,
          text: message,
          html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
        });
      }
    } else if (channel === 'sms') {
      for (const recipient of recipients) {
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: recipient.phone,
        });
      }
    } else {
      return res.status(400).json({ message: 'Invalid channel' });
    }

    res.status(200).json({ message: 'Notifications sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Failed to send notification' });
  }
}