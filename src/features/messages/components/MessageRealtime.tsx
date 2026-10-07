import useAuth from "@/hooks/useAuth";
import { useMessageSocket } from "@/features/messages/hooks/useMessages";

const MessageRealtime = () => {
  const { user } = useAuth();
  useMessageSocket(Boolean(user));
  return null;
};

export default MessageRealtime;
