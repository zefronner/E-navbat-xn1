import Patient from '../models/patient.model.js';
import { catchError } from '../utils/error-response.js';
import { patientValidator } from '../validation/patient.validation.js';
import { decode, encode } from '../utils/bcrypt-encrypt.js';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/generate-tokens.js';
import { writeToCookie } from '../utils/cookie.js';

export class PatientController {
  async signupPatient(req, res) {
    try {
      const { error, value } = patientValidator(req.body);
      if (error) {
        return catchError(400, error, res);
      }
      const { phoneNumber, fullName, password, address, age, gender } = value;
      const existPhone = await Patient.findOne({ phoneNumber });
      if (existPhone) {
        return catchError(409, 'Phone number already exist', res);
      }
      const hashedPassword = await decode(password, 7);
      const patient = await Patient.create({
        phoneNumber,
        fullName,
        hashedPassword,
        address,
        age,
        gender,
      });
      const payload = { id: patient._id, is_patient: true };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      writeToCookie(res, 'refreshTokenPatient', refreshToken);
      return res.status(201).json({
        statusCode: 201,
        message: 'success',
        data: accessToken,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async signinPatient(req, res) {
    try {
      const { phoneNumber, password } = req.body;
      const patient = await Patient.findOne({ phoneNumber });
      const isMatchPass = await encode(password, patient?.hashedPassword);
      if (!patient || !isMatchPass) {
        return catchError(404, 'Phone number or password incorrect', res);
      }
      const payload = { id: patient._id, is_patient: true };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      writeToCookie(res, 'refreshTokenPatient', refreshToken);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: accessToken,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async getAccessTokenPatient(req, res) {
    try {
      const refreshToken = req.cookies.refreshTokenPatient;
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
      const payload = { id: decodedData.id, is_patient: true };
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

  async signoutPatient(req, res) {
    try {
      const refreshToken = req.cookies.refreshTokenPatient;
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
      res.clearCookie('refreshTokenPatient');
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async getAllPatients(_, res) {
    try {
      const patients = await Patient.find().populate('appointments');
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: patients,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async getPatientById(req, res) {
    try {
      const patient = await PatientController.findPatientById(
        req.params.id,
        res
      );
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: patient,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async updatePatientById(req, res) {
    try {
      const id = req.params.id;
      await PatientController.findPatientById(id, res);
      const updatedPatient = await Patient.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: updatedPatient,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async deletePatientById(req, res) {
    try {
      const id = req.params.id;
      await PatientController.findPatientById(id, res);
      await Patient.findByIdAndDelete(id);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  static async findPatientById(id, res) {
    try {
      const patient = await Patient.findById(id).populate('appointments');
      if (!patient) {
        return catchError(404, 'Patient not found', res);
      }
      return patient;
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }
}
