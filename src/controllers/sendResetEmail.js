import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import createError from 'http-errors';
import User from '../../models/user.js';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
  JWT_SECRET,
  APP_DOMAIN,
} = process.env;

export const sendResetEmail = async (req, res, next) => {
  console.log('sendResetEmail controller triggered');
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw createError(404, 'User not found!');

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '5m' });

    const resetLink = `${APP_DOMAIN}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html: `<p>To reset your password, click the link below:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>This link is valid for 5 minutes.</p>`,
    });

    res.status(200).json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  } catch (error) {
    console.error('Email error:', error);
    next(createError(500, 'Failed to send the email, please try again later.'));
  }
};
