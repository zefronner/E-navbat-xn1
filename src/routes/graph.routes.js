import { Router } from 'express';
import { GraphController } from '../controllers/graph.controller.js';
import { AuthGuard } from '../middleware/jwt-auth.guard.js';
import { DoctorGuard } from '../middleware/doctor.guard.js';
import { SelfGuard } from '../middleware/self-admin.guard.js';

const router = Router();
const controller = new GraphController();

router
  .post('/', AuthGuard, DoctorGuard, controller.createGraph)
  .get('/', controller.getAllGraphs)
  .get('/:id', controller.getGraphById)
  .patch('/:id', AuthGuard, DoctorGuard, SelfGuard, controller.updateGraphById)
  .delete(
    '/:id',
    AuthGuard,
    DoctorGuard,
    SelfGuard,
    controller.deleteGraphById
  );

export default router;
