// hooks/usePackages.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export interface Package {
  _id: string;
  title: string;
  slug: string;
  featuredImage: string;
  overview: string;
  destination?: string[]; // ← it's an array!
  categoryAndPrice?: { category: string; price: number }[];
  isActive: boolean;
}

export const usePackages = (searchQuery?: string, destinationKey?: string) => {
  return useQuery<Package[]>({
    queryKey: ["packages", searchQuery, destinationKey],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (searchQuery) {
        params.set("search", searchQuery);
      }
      if (destinationKey && destinationKey !== "explore") {
        params.set("destination", destinationKey); // e.g., "Manali"
      }

      const res = await api.get(`/packages?${params.toString()}`);
      return res.data.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 mins cache
    retry: 2,
  });
};
