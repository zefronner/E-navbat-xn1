import Doctor from '../models/doctor.model.js';
import { catchError } from '../utils/error-response.js';
import { doctorValidator } from '../validation/doctor.validation.js';
import { generateOTP } from '../utils/otp-generator.js';
import { setCache, getCache } from '../utils/cache.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generate-tokens.js';
import { writeToCookie } from '../utils/cookie.js';

export class DoctorController {
  async createDoctor(req, res) {
    try {
      const { error, value } = doctorValidator(req.body);
      if (error) {
        return catchError(400, error, res);
      }
      const existPhone = await Doctor.findOne({
        phoneNumber: value.phoneNumber,
      });
      if (existPhone) {
        return catchError(409, 'Phone number already exist', res);
      }
      const doctor = await Doctor.create(value);
      return res.status(201).json({
        statusCode: 201,
        message: 'success',
        data: doctor,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async signinDoctor(req, res) {
    try {
      const { phoneNumber } = req.body;
      const doctor = await Doctor.findOne({ phoneNumber });
      if (!doctor) {
        return catchError(404, 'Doctor not found', res);
      }
      const otp = generateOTP();
      setCache(phoneNumber, otp);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: otp,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async confirmSigninDoctor(req, res) {
    try {
      const { phoneNumber, otp } = req.body;
      const doctor = await Doctor.findOne({ phoneNumber });
      if (!doctor) {
        return catchError(400, 'Wrong phone number', res);
      }
      const otpCache = getCache(phoneNumber);
      if (!otpCache || otpCache != otp) {
        return catchError(400, 'OTP expired', res);
      }
      const payload = { id: doctor._id, is_doctor: true };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      writeToCookie(res, 'refreshTokenDoctor', refreshToken);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: accessToken,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async getAccessTokenDoctor(req, res) {
    try {
      const refreshToken = req.cookies.refreshTokenDoctor;
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
      const payload = { id: decodedData.id, is_doctor: true };
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

  async signoutDoctor(req, res) {
    try {
      const refreshToken = req.cookies.refreshTokenDoctor;
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
      res.clearCookie('refreshTokenDoctor');
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async getAllDoctors(_, res) {
    try {
      const doctors = await Doctor.find().populate('graphs');
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: doctors,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async getDoctorById(req, res) {
    try {
      const doctor = await DoctorController.findDoctorById(req.params.id, res);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: doctor,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async updateDoctorById(req, res) {
    try {
      const id = req.params.id;
      await DoctorController.findDoctorById(id);
      const updatedDoctor = await Doctor.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: updatedDoctor,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async deleteDoctorById(req, res) {
    try {
      const id = req.params.id;
      await DoctorController.findDoctorById(id, res);
      await Doctor.findByIdAndDelete(id);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  static async findDoctorById(id, res) {
    try {
      const doctor = await Doctor.findById(id).populate('graphs');
      if (!doctor) {
        return catchError(404, `Doctor not found by ID ${id}`, res);
      }
      return doctor;
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }
}
