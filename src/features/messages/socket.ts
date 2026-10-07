import { io, type Socket } from "socket.io-client";
import { getToken } from "@/utils/token";

let socket: Socket | null = null;

export const connectMessageSocket = (): Socket | null => {
  const token = getToken();
  const url = import.meta.env.VITE_API_URL as string | undefined;
  if (!token || !url) return null;

  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return socket;
  }

  socket = io(url, {
    autoConnect: true,
    auth: { token },
    withCredentials: true,
  });

  socket.on("connect_error", () => {
    const nextToken = getToken();
    if (socket && nextToken) socket.auth = { token: nextToken };
  });

  return socket;
};

export const disconnectMessageSocket = (): void => {
  socket?.disconnect();
  socket = null;
};
