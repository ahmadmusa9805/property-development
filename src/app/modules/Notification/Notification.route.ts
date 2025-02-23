import express from 'express';
import { NotificationControllers } from './Notification.controller';

const router = express.Router();

router.post(
  '/create-Notification',
  NotificationControllers.createNotification,
);

router.put(
  '/mark-as-read',
  NotificationControllers.markNotificationAsRead,
);

router.get(
  '/unread',
  NotificationControllers.getAllUnreadNotifications,
);

export const NotificationRoutes = router;
