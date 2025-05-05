import { catchError } from '../utils/error-response.js';

export const DoctorGuard = (req, res, next) => {
  try {
    const user = req?.user;
    if (
      user?.role === 'superadmin' ||
      user?.role === 'admin' ||
      user?.is_doctor
    ) {
      return next();
    }
    return catchError(401, 'Forbidden user', res);
  } catch (error) {
    return catchError(500, error.message, res);
  }
};
