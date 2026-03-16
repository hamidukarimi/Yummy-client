import { useQuery } from "@tanstack/react-query";
import { getUnreadCountService } from "@/features/notifications/services/notification.service";

const useUnreadCount = (enabled = true) => {
  const { data } = useQuery({
    queryKey:     ["notifications", "unread"],
    queryFn:      getUnreadCountService,
    staleTime:    1000 * 30,
    refetchInterval: 1000 * 60,
    enabled,
  });

  return data ?? 0;
};

export default useUnreadCount;