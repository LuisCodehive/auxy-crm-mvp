import { Notification } from '../interfaces/notification';

//const API_URL = import.meta.env.VITE_API_URL;

export const NotificationService = {
  getAll: async (): Promise<Notification[]> => {
    const res = await fetch(`/notifications`);
    return res.json();
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await fetch(
      `/notifications/unread-count`
    );
    const data = await res.json();
    return data.count;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const res = await fetch(
      `/notifications/${id}/read`,
      { method: 'PATCH' }
    );
    return res.json();
  },

  markAllAsRead: async (): Promise<void> => {
    await fetch(`/notifications/read-all`, {
      method: 'PATCH',
    });
  },
};
