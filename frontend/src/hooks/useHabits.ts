import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export const useHabits = () => {
  return useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data } = await api.get("/habits");
      return data;
    },
  });
};

export const useCheckInHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, status }: { habitId: number; status: number }) => {
      const { data } = await api.post("/logs/check-in", { 
        habit_id: habitId, 
        status 
      });
      return data;
    },
    // Multi-invalidation: Refresh both habits (streaks) and analytics
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
};

export const useAddHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post("/habits", { name });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
};

export const useArchiveHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: number) => {
      const { data } = await api.patch(`/habits/${habitId}/archive`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
};

export const useUnarchiveHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habitId: number) => {
      const { data } = await api.patch(`/habits/${habitId}/unarchive`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
};
