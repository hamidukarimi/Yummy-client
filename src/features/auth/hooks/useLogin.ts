import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { loginService } from "@/features/auth/services/auth.service";
import { setToken } from "@/utils/token";
import useAuthStore from "@/store/authStore";
import { parseApiError } from "@/utils/errorHandler";
import type { LoginPayload } from "@/features/auth/types/auth.types";
import type { ParsedError } from "@/utils/errorHandler";

const useLogin = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const { mutate, isPending, isError, error } = useMutation<
    void,
    ParsedError,
    LoginPayload
  >({
    mutationFn: async (payload: LoginPayload) => {
      try {
        const result = await loginService(payload);
        setToken(result.accessToken);
        setUser(result.user);
      } catch (rawError) {
        throw parseApiError(rawError);
      }
    },
    onSuccess: () => {
      navigate("/dashboard");
    },
    onError: (error) => {
      console.error("[useLogin]", error.message);
    },
  });

  return { login: mutate, isPending, isError, error };
};

export default useLogin;
