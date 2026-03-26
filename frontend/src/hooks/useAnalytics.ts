import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";

export const useAnalytics = () => {
  const statsQuery = useQuery({
    queryKey: ["analytics", "global"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/global");
      return data;
    },
  });

  const insightsQuery = useQuery({
    queryKey: ["analytics", "insights"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/insights");
      return data;
    },
  });

  return {
    stats: statsQuery.data,
    insights: insightsQuery.data || [],
    isLoading: statsQuery.isLoading || insightsQuery.isLoading,
    isError: statsQuery.isError || insightsQuery.isError,
  };
};
