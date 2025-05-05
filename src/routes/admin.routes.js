import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { AuthGuard } from '../middleware/jwt-auth.guard.js';
import { SuperAdminGuard } from '../middleware/super-admin.guard.js';
import { SelfGuard } from '../middleware/self-admin.guard.js';

const router = Router();
const controller = new AdminController();

router
  .post('/superadmin', controller.createSuperAdmin)
  .post('/', AuthGuard, SuperAdminGuard, controller.createAdmin)
  .post('/signin', controller.signinAdmin)
  .post('/confirm-signin', controller.confirmSigninAdmin)
  .post('/token', controller.getAccessToken)
  .post('/signout', AuthGuard, controller.signoutAdmin)
  .get('/', AuthGuard, SuperAdminGuard, controller.getAllAdmins)
  .get('/:id', AuthGuard, SelfGuard, controller.getAdminById)
  .patch('/:id', AuthGuard, SelfGuard, controller.updateAdminById)
  .delete('/:id', AuthGuard, SuperAdminGuard, controller.deleteAdminById);

export default router;
