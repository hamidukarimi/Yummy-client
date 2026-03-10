import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query";
import { parseApiError } from "@/utils/errorHandler";

// ─── Query Client ─────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      mutation.meta;
      return parseApiError(error);
    },
  }),
  queryCache: new QueryCache({
    onError: (error) => {
      return parseApiError(error);
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const { statusCode } = parseApiError(error);
        if (statusCode >= 400 && statusCode < 500) return false;
        return failureCount < 2;
      },
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

export default queryClient;
