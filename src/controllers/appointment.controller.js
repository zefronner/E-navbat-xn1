import Appointment from '../models/appointment.model.js';
import { appointmentValidator } from '../validation/appointment.validation.js';
import { catchError } from '../utils/error-response.js';

export class AppointmentController {
  async create(req, res) {
    try {
      const { error, value } = appointmentValidator(req.body);
      if (error) {
        return catchError(400, error, res);
      }
      const appointment = await Appointment.create(value);
      return res.status(201).json({
        statusCode: 201,
        message: 'success',
        data: appointment,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async getAll(_, res) {
    try {
      const appointment = await Appointment.find()
        .populate('patientId')
        .populate('graphId');
      return res.status(201).json({
        statusCode: 201,
        message: 'success',
        data: appointment,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }
  async getById(req, res) {
    try {
      const appointment = await AppointmentController.findAppById(
        req.params.id,
        res
      );
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: appointment,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }
  async update(req, res) {
    try {
      const id = req.params.id;
      await AppointmentController.findAppById(id, res);
      const updatedApp = await Appointment.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: updatedApp,
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      await AppointmentController.findAppById(id);
      await Appointment.findByIdAndDelete(id);
      return res.status(200).json({
        statusCode: 200,
        message: 'success',
        data: {},
      });
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }

  static async findAppById(id, res) {
    try {
      const appointment = await Appointment.findById(id).populate('graphId').populate('patientId');
      if (!appointment) {
        return catchError(404, `Appointment not found by ID ${id}`, res);
      }
      return appointment;
    } catch (error) {
      return catchError(500, error.message, res);
    }
  }
}
