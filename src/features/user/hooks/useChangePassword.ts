import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { changePasswordService } from "@/features/user/services/user.service";
import { removeToken } from "@/utils/token";
import useAuthStore from "@/store/authStore";
import type { ChangePasswordPayload } from "@/features/user/types/user.types";
import type { ParsedError } from "@/utils/errorHandler";

const useChangePassword = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const { mutate, isPending, isError, isSuccess, error } = useMutation<void, ParsedError, ChangePasswordPayload>({
    mutationFn: async (payload: ChangePasswordPayload) => {
      await changePasswordService(payload);
    },
    onSuccess: () => {
      removeToken();
      clearAuth();
      navigate("/login");
    },
    onError: (error) => {
      console.error("[useChangePassword]", error.message);
    },
  });

  return { changePassword: mutate, isPending, isError, isSuccess, error };
};

export default useChangePassword;