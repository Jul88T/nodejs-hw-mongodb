import User from '../models/user.js';
import bcrypt from 'bcrypt';
import createError from 'http-errors';
import Session from '../models/session.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';
import jwt from 'jsonwebtoken';

const { JWT_REFRESH_SECRET } = process.env;

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError(409, 'Email in use');
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ name, email, password: hashedPassword });
  const user = newUser.toObject();
  delete user.password;
  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) throw createError(401, 'Email or password is wrong');

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) throw createError(401, 'Email or password is wrong');

  await Session.deleteMany({ userId: user._id });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  );

  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return { accessToken, refreshToken, sessionId: session._id };
};

export const logoutUser = async (refreshToken) => {
  const session = await Session.findOne({ refreshToken });
  if (!session) throw createError(401, 'Session not found');
  await Session.deleteOne({ _id: session._id });
};

export const refreshSession = async (refreshToken) => {
  let payload;

  try {
    payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch {
    throw createError(401, 'Invalid refresh token');
  }

  const session = await Session.findOne({ refreshToken });
  if (!session) {
    throw createError(401, 'Session not found');
  }

  const userId = payload.userId;

  await Session.deleteOne({ _id: session._id });

  const newAccessToken = generateAccessToken(userId);
  const newRefreshToken = generateRefreshToken(userId);

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  );

  await Session.create({
    userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return newAccessToken;
};
