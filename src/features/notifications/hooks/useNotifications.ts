import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationsService,
  markAsReadService,
  markAllAsReadService,
  deleteNotificationService,
} from "@/features/notifications/services/notification.service";

export const notificationsQueryKey = ["notifications"] as const;

const useNotifications = () => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: notificationsQueryKey,
    queryFn: ({ pageParam }) => getNotificationsService(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
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

  const pages = data?.pages ?? [];

  return {
    notifications: pages.flatMap((page) => page.notifications),
    unreadCount:   pages[0]?.unreadCount ?? 0,
    total:         pages[0]?.total ?? 0,
    isLoading,
    isError,
    markRead,
    markAllRead,
    deleteNotification,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
  };
};

export default useNotifications;
