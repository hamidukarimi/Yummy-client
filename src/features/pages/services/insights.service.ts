import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { PageInsights } from "@/features/pages/types/insights.types";

export const getPageInsightsService = async (slug: string): Promise<PageInsights> => {
  const response = await api.get<ApiResponse<{ insights: PageInsights }>>(
    ENDPOINTS.pages.insights(slug),
  );
  return response.data.data.insights;
};
