import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller.js';
import { AuthGuard } from '../middleware/jwt-auth.guard.js';
import { AdminGuard } from '../middleware/admin.guard.js';
import { SelfGuard } from '../middleware/self-admin.guard.js';

const router = Router();
const controller = new DoctorController();

router
  .post('/', AuthGuard, AdminGuard, controller.createDoctor)
  .post('/signin', controller.signinDoctor)
  .post('/confirm-signin', controller.confirmSigninDoctor)
  .post('/token', controller.getAccessTokenDoctor)
  .post('/signout', controller.signoutDoctor)
  .get('/', controller.getAllDoctors)
  .get('/:id', controller.getDoctorById)
  .patch('/:id', AuthGuard, SelfGuard, controller.updateDoctorById)
  .delete('/:id', AuthGuard, AdminGuard, controller.deleteDoctorById);

export default router;
