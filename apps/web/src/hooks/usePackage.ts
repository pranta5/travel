import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { IPackage, ApiResponse } from "../app/types/package";

export const usePackage = (slug?: string) => {
  return useQuery<IPackage, Error>({
    queryKey: ["package", slug],
    queryFn: async () => {
      if (!slug) throw new Error("Missing slug");
      const res = await api.get<ApiResponse<IPackage>>(`/packages/${slug}`);
      return res.data.data;
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
  });
};
