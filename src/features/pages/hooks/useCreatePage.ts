import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageService } from "@/features/pages/services/page.service";
import { parseApiError } from "@/utils/errorHandler";
import type { CreatePagePayload, ApiPage } from "@/features/pages/types/page.types";
import type { ParsedError } from "@/utils/errorHandler";

const useCreatePage = () => {
  const navigate = useNavigate();

  const { mutate, isPending, isError, error } = useMutation<ApiPage, ParsedError, CreatePagePayload>({
    mutationFn: async (payload: CreatePagePayload) => {
      try {
        return await createPageService(payload);
      } catch (rawError) {
        throw parseApiError(rawError);
      }
    },
    onSuccess: (page) => {
      navigate(`/pages/${page.slug}`);
    },
    onError: (error) => {
      console.error("[useCreatePage]", error.message);
    },
  });

  return { createPage: mutate, isPending, isError, error };
};

export default useCreatePage;