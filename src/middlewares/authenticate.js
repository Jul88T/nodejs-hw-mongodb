import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import Session from '../models/session.js';

const { JWT_ACCESS_SECRET } = process.env;

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError(401, 'Access token is required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

    const session = await Session.findOne({ accessToken: token });
    if (!session) {
      return next(createError(401, 'Session not found'));
    }

    req.user = {
      id: decoded.userId,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(createError(401, 'Access token expired'));
    }

    return next(createError(401, 'Invalid access token'));
  }
};
