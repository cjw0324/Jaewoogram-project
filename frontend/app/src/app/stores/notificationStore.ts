import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotificationStore {
  hasUnread: boolean;
  setUnread: (val: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      hasUnread: false,
      setUnread: (val) => set({ hasUnread: val }),
    }),
    {
      name: "notification-storage", // 🔑 localStorage key 이름
    }
  )
);
