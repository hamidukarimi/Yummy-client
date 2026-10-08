import useAuth from "@/hooks/useAuth";
import { useMessageSocket } from "@/features/messages/hooks/useMessages";

const MessageRealtime = () => {
  const { user } = useAuth();
  useMessageSocket(user?.id);
  return null;
};

export default MessageRealtime;
