import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller.js';
import { AuthGuard } from '../middleware/jwt-auth.guard.js';
import { DoctorGuard } from '../middleware/doctor.guard.js';
import { SelfGuard } from '../middleware/self-admin.guard.js';
import { SelfPatientGuard } from '../middleware/self-patient.guard.js';

const router = Router();
const controller = new PatientController();

router
  .post('/signup', controller.signupPatient)
  .post('/signin', controller.signinPatient)
  .post('/token', controller.getAccessTokenPatient)
  .post('/signout', controller.signoutPatient)
  .get('/', AuthGuard, DoctorGuard, controller.getAllPatients)
  .get('/:id', AuthGuard, SelfPatientGuard, controller.getPatientById)
  .patch('/:id', AuthGuard, SelfGuard, controller.updatePatientById)
  .delete('/:id', AuthGuard, SelfGuard, controller.deletePatientById);

export default router;
