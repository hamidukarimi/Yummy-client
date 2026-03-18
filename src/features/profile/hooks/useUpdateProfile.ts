import { useMutation } from "@tanstack/react-query";
import { updateProfileService } from "@/features/profile/services/profile.service";
import { parseApiError } from "@/utils/errorHandler";
import useAuthStore from "@/store/authStore";
import type { UpdateProfilePayload } from "@/features/profile/services/profile.service";

const useUpdateProfile = () => {
  const { setUser } = useAuthStore();

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      try {
        return await updateProfileService(payload);
      } catch (rawError) {
        throw parseApiError(rawError);
      }
    },
    onSuccess: (updatedUser) => {
      // Update auth store immediately
      setUser(updatedUser);
    },
  });

  return { updateProfile: mutate, isPending, error, isSuccess };
};

export default useUpdateProfile;