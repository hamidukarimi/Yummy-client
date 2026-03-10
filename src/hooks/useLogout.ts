import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logoutService } from "@/features/auth/services/auth.service";
import { removeToken } from "@/utils/token";
import useAuthStore from "@/store/authStore";
import queryClient from "@/lib/queryClient";
import type { ParsedError } from "@/utils/errorHandler";

const useLogout = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const { mutate, isPending } = useMutation<void, ParsedError>({
    mutationFn: async () => {
      await logoutService();
    },
    onSuccess: () => {
      removeToken();
      clearAuth();
      queryClient.clear();
      navigate("/login");
    },
    onError: () => {
      removeToken();
      clearAuth();
      queryClient.clear();
      navigate("/login");
    },
  });

  return { logout: mutate, isPending };
};

export default useLogout;