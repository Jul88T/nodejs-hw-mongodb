import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from '../services/auth.js';
import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/user.js';
import Session from '../models/session.js';
import bcrypt from 'bcryptjs';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
  JWT_SECRET,
  APP_DOMAIN,
} = process.env;

export const register = async (req, res, next) => {
  try {
    const newUser = await registerUser(req.body);
    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, sessionId } = await loginUser(req.body);

    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .cookie('sessionId', sessionId.toString(), {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in an user!',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw createError(401, 'No refresh token provided');

    const accessToken = await refreshSession(refreshToken);
    res.status(200).json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return res.status(401).json({ message: 'No refresh token provided' });

    await logoutUser(refreshToken);
    res.clearCookie('refreshToken');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const sendResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw createError(404, 'User not found!');
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '5m' });
    const resetLink = `${APP_DOMAIN}/reset-password?token=${token}`;

    console.log('📧 SMTP config:', {
      host: SMTP_HOST,
      port: SMTP_PORT,
      user: SMTP_USER,
      pass: SMTP_PASSWORD ? '✓' : '✗',
      from: SMTP_FROM,
    });

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html: `
          <h2>Reset Password</h2>
          <p>Click the link below to reset your password. The link is valid for 5 minutes:</p>
          <a href="${resetLink}">${resetLink}</a>
        `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch {
      return next(
        createError(500, 'Failed to send the email, please try again later.')
      );
    }

    res.status(200).json({
      status: 200,
      message: 'Reset password email has been successfully sent.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let email;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      email = decoded.email;
    } catch {
      throw createError(401, 'Token is expired or invalid.');
    }

    const user = await User.findOne({ email });
    if (!user) throw createError(404, 'User not found!');

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    await Session.deleteMany({ user: user._id });

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
