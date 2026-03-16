import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationsService,
  markAsReadService,
  markAllAsReadService,
  deleteNotificationService,
} from "@/features/notifications/services/notification.service";
import type { PaginatedNotifications } from "@/features/notifications/types/notification.types";

export const notificationsQueryKey = ["notifications"] as const;

const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<PaginatedNotifications>({
    queryKey:  notificationsQueryKey,
    queryFn:   getNotificationsService,
    staleTime: 1000 * 30,
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => markAsReadService(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: markAllAsReadService,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
      void queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });

  const { mutate: deleteNotification } = useMutation({
    mutationFn: (id: string) => deleteNotificationService(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });

  return {
    notifications: data?.notifications ?? [],
    unreadCount:   data?.unreadCount ?? 0,
    total:         data?.total ?? 0,
    isLoading,
    isError,
    markRead,
    markAllRead,
    deleteNotification,
  };
};

export default useNotifications;