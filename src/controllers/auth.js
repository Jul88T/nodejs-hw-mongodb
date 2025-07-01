import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from '../services/auth.js';
import createError from 'http-errors';

export const register = async (req, res, next) => {
  try {
    const newUser = await registerUser(req.body);
    res.status(201).json({
      status: 'success',
      message: 'Successfully registered a user!',
      data: {
        user: newUser,
      },
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
      status: 'success',
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
      status: 'success',
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
