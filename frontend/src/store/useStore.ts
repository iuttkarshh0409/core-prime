import { create } from "zustand";

type Tab = "overview" | "analytics" | "history";

interface AppState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isAddHabitModalOpen: boolean;
  setAddHabitModal: (open: boolean) => void;
  notification: { message: string; type: "success" | "error" } | null;
  showNotification: (message: string, type?: "success" | "error") => void;
  clearNotification: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab }),
  isAddHabitModalOpen: false,
  setAddHabitModal: (open) => set({ isAddHabitModalOpen: open }),
  notification: null,
  showNotification: (message, type = "success") => {
    set({ notification: { message, type } });
    // Auto-clear after 3 seconds
    setTimeout(() => set({ notification: null }), 3000);
  },
  clearNotification: () => set({ notification: null }),
}));
