import jwt from 'jsonwebtoken';
import { catchError } from '../utils/error-response.js';

export const AuthGuard = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    const bearer = auth?.split(' ')[0];
    if (!auth || !bearer) {
      return catchError(401, 'Authorization error', res);
    }
    const token = auth?.split(' ')[1];
    if (!token) {
      return catchError(401, 'Token not found', res);
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    if (!decodedToken) {
      return catchError(401, 'Token expired', res);
    }
    req.user = decodedToken;
    return next();
  } catch (error) {
    return catchError(500, error.message, res);
  }
};
