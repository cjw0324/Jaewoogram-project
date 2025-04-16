import { create } from "zustand";

interface NotificationStore {
  hasUnread: boolean;
  setUnread: (val: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  hasUnread: false,
  setUnread: (val) => set({ hasUnread: val }),
}));
