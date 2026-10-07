import api from "@/api/axios";
import { ENDPOINTS } from "@/api/endpoints";
import type { ApiResponse } from "@/types/api.types";
import type { ApiMenu, MenuSection } from "@/features/pages/types/menu.types";

export const getMenuService = async (slug: string): Promise<ApiMenu | null> => {
  const response = await api.get<ApiResponse<{ menu: ApiMenu | null }>>(
    ENDPOINTS.pages.menu(slug),
  );
  return response.data.data.menu;
};

export const saveMenuService = async (
  slug: string,
  sections: MenuSection[],
): Promise<ApiMenu> => {
  const response = await api.put<ApiResponse<{ menu: ApiMenu }>>(
    ENDPOINTS.pages.menu(slug),
    { sections },
  );
  return response.data.data.menu;
};
