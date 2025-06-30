import jwt from 'jsonwebtoken';
import createError from 'http-errors';

const { JWT_ACCESS_SECRET } = process.env;

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createError(401, 'Access token is required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);

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
