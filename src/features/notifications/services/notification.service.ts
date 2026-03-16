import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type {
  PaginatedNotifications,
  ApiNotification,
} from "@/features/notifications/types/notification.types";

export const getNotificationsService = async (): Promise<PaginatedNotifications> => {
  const response = await api.get<ApiResponse<PaginatedNotifications>>(
    ENDPOINTS.notifications.all,
  );
  return response.data.data;
};

export const getUnreadCountService = async (): Promise<number> => {
  const response = await api.get<ApiResponse<{ count: number }>>(
    ENDPOINTS.notifications.unreadCount,
  );
  return response.data.data.count;
};

export const markAsReadService = async (id: string): Promise<ApiNotification> => {
  const response = await api.patch<ApiResponse<{ notification: ApiNotification }>>(
    ENDPOINTS.notifications.markRead(id),
  );
  return response.data.data.notification;
};

export const markAllAsReadService = async (): Promise<void> => {
  await api.patch(ENDPOINTS.notifications.markAllRead);
};

export const deleteNotificationService = async (id: string): Promise<void> => {
  await api.delete(ENDPOINTS.notifications.delete(id));
};