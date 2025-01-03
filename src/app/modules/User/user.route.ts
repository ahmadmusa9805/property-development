/* eslint-disable @typescript-eslint/no-explicit-any */

import express, { NextFunction, Response, Request } from 'express';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/sendImageToCloudinary';
// import { createActorValidationSchema } from '../Client/actor.validation';
// import { createAdminValidationSchema } from '../Admin/admin.validation';
import { USER_ROLE } from './user.constant';
import { UserControllers } from './user.controller';

const router = express.Router();
// router.post(
//   '/create-actor',
//   validateRequest(createActorValidationSchema),
//   UserControllers.createActor,
// );


router.post(
  '/create-admin',
  // auth(USER_ROLE.superAdmin),
  // validateRequest(UserValidation.createAdminValidationSchema),
  UserControllers.createAdmin,
);

router.get(
  '/me',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.client),
  UserControllers.getMe,
);

router.post(
  '/change-status/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
//   validateRequest(UserValidation.changeStatusValidationSchema),
  UserControllers.changeStatus,
);

router.get(
  '/',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.client),
  UserControllers.getAllUsers,
);

router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.client),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      try {
        req.body = JSON.parse(req.body.data);
      } catch (error) {
        next(error);
      }
    }
    next();
  },
  UserControllers.updateUser,
);

export const UserRoutes = router;
