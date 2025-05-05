import { catchError } from '../utils/error-response.js';

export const SuperAdminGuard = (req, res, next) => {
  try {
    const user = req?.user;
    if (user?.role !== 'superadmin') {
      return catchError(401, 'Forbidden user', res);
    }
    return next();
  } catch (error) {
    return catchError(500, error.message, res);
  }
};
