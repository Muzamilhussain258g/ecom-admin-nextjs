import { create } from "zustand";
import type { LoggedInUser } from "@/features/auth/types";

interface UserState {
  user: LoggedInUser | null;
  setUser: (user: LoggedInUser) => void;
  clearUser: () => void;
}

// Client profile state only; authentication remains the server's responsibility.
export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
