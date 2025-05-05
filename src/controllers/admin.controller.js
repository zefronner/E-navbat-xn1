import Admin from '../models/admin.model.js';
import { adminValidator } from '../validation/admin.validation.js';
import { catchError } from '../utils/error-response.js';
import { decode, encode } from '../utils/bcrypt-encrypt.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generate-tokens.js';
import { transporter } from '../utils/mail-sender.js';
import jwt from 'jsonwebtoken';
import { generateOTP } from '../utils/otp-generator.js';
import { setCache, getCache } from '../utils/cache.js';
import { writeToCookie } from '../utils/cookie.js';
import logger from '../utils/logger/logger.js';

export class AdminController {
  async createSuperAdmin(req, res) {
    try {
      const checkSuperAdmin = await Admin.findOne({ role: 'superadmin' });
      if (checkSuperAdmin) {
        logger.error('Danggg! Super admin bizda allaqachon bor');
        return catchError(409, 'Super admin already exist', res);
      }
      const { error, value } = adminValidator(req.body);
      if (error) {
        return catchError(406, error, res);
      }
      const { username, password } = value;
      const hashedPassword = await decode(password, 7);
      const superadmin = await Admin.create({
        username,
        hashedPassword,
        role: 'superadmin',
      });
      return res.status(201).json({
        statusCode: 201,
        message: 'success',
        data: superadmin,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async createAdmin(req, res) {
    try {
      const { error, value } = adminValidator(req.body);
      if (error) {
        return catchError(406, error, res);
      }
      const { username, password } = value;
      const hashedPassword = await decode(password, 7);
      const admin = await Admin.create({
        username,
        hashedPassword,
        role: 'admin',
      });
      logger.info(`Bizga yangi admin qoshildi -> ${value.username}`);
      return res.status(201).json({
        statusCode: 201,
        message: 'success',
        data: admin,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async signinAdmin(req, res) {
    try {
      const { username, password } = req.body;
      const admin = await Admin.findOne({ username });
      if (!admin) {
        return 404, 'Admin not found', res;
      }
      const matchPassword = await encode(password, admin.hashedPassword);
      if (!matchPassword) {
        return catchError(400, 'Invalid password', res);
      }
      const otp = generateOTP();
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.SMTP_USER,
        subject: 'e-navbat',
        text: otp,
      };
      transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
          return catchError(500, `Error sending to mail: ${err}`, res);
        } else if (info) {
          setCache(admin.username, otp);
        }
      });
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async confirmSigninAdmin(req, res) {
    try {
      const { username, otp } = req.body;
      const admin = await Admin.findOne({ username });
      if (!admin) {
        return catchError(404, 'Username not found', res);
      }
      const otpCache = getCache(username);
      if (!otpCache || otp != otpCache) {
        return catchError(400, 'OTP expired', res);
      }
      const payload = { id: admin._id, role: admin.role };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      writeToCookie(res, 'refreshTokenAdmin', refreshToken);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: accessToken,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async getAccessToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshTokenAdmin;
      if (!refreshToken) {
        return catchError(401, 'Refresh token not found', res);
      }
      const decodedData = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY
      );
      if (!decodedData) {
        return catchError(401, 'Refresh token expire', res);
      }
      const payload = { id: decodedData.id, role: decodedData.role };
      const accessToken = generateAccessToken(payload);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: accessToken,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async signoutAdmin(req, res) {
    try {
      const refreshToken = req.cookies.refreshTokenAdmin;
      if (!refreshToken) {
        return catchError(401, 'Refresh token not found', res);
      }
      const decodedData = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY
      );
      if (!decodedData) {
        return catchError(401, 'Refresh token expire', res);
      }
      res.clearCookie('refreshTokenAdmin');
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async getAllAdmins(_, res) {
    try {
      const admins = await Admin.find();
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: admins,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async getAdminById(req, res) {
    try {
      const admin = await AdminController.findAdminById(req.params.id, res);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: admin,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async updateAdminById(req, res) {
    try {
      const id = req.params.id;
      await AdminController.findAdminById(id, res);
      const updatedAdmin = await Admin.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: updatedAdmin,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async deleteAdminById(req, res) {
    try {
      const id = req.params.id;
      const admin = await AdminController.findAdminById(id, res);
      if (admin.role === 'superadmin') {
        return catchError(400, 'Danggg\nSuper admin cannot be delete', res);
      }
      await Admin.findByIdAndDelete(id);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  static async findAdminById(id, res) {
    try {
      const admin = await Admin.findById(id);
      if (!admin) {
        return catchError(404, `Admin not found by ID ${id}`, res);
      }
      return admin;
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }
}
