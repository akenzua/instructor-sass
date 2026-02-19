"use client";

import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/lib/api";

export interface SearchFilters {
  postcode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  transmission?: string;
  lessonType?: string;
  maxPrice?: number;
  language?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export function useSearchInstructors(filters: SearchFilters, enabled: boolean) {
  return useQuery({
    queryKey: ["search", "instructors", filters],
    queryFn: () => searchApi.searchInstructors(filters),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

export function useResolvePostcode(postcode: string, enabled: boolean) {
  return useQuery({
    queryKey: ["search", "postcode", postcode],
    queryFn: () => searchApi.resolvePostcode(postcode),
    enabled: enabled && postcode.length >= 5,
    staleTime: 24 * 60 * 60 * 1000, // postcodes don't change
  });
}
