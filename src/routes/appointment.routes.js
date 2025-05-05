import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller.js';

const router = Router();
const controller = new AppointmentController();

router
  .get('/', controller.getAll)
  .get('/:id', controller.getById)
  .post('/', controller.create)
  .patch('/:id', controller.update)
  .delete('/:id', controller.delete);

export default router;
