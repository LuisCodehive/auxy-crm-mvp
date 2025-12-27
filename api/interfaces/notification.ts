export interface Notification {
  id: string;
  userId: string;

  title: string;
  message: string;

  type: NotificationType;
  read: boolean;

  createdAt: string;

  data?: {
    requestId?: string;
    providerId?: string;
    driverId?: string;
    vehicleId?: string;
    url?: string;
    [key: string]: any;
  };
}
