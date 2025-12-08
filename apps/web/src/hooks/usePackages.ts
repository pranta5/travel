import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { IPackage, ApiResponse } from "../app/types/package";

export const usePackages = (opts?: {
  page?: number;
  limit?: number;
  destination?: string;
  category?: string;
}) => {
  const { page = 1, limit = 10, destination, category } = opts ?? {};

  return useQuery<IPackage[], Error>({
    queryKey: ["packages", page, limit, destination ?? null, category ?? null],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (destination) params.set("destination", destination);
      if (category) params.set("category", category);

      const q = params.toString() ? `?${params.toString()}` : "";
      const res = await api.get<ApiResponse<IPackage[]>>(`/packages${q}`);
      return res.data.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};
