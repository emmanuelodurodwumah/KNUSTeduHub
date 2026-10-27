import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      username: null,
      isAdmin: false,
      adminStatusLoaded: false,
      login: ({ access, refresh, username }) =>
        set({
          accessToken: access,
          refreshToken: refresh,
          username,
          isAdmin: false,
          adminStatusLoaded: false,
        }),
      setAdminStatus: (isAdmin) => set({ isAdmin, adminStatusLoaded: true }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          username: null,
          isAdmin: false,
          adminStatusLoaded: false,
        }),
    }),
    {
      name: "digistore-auth",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        username: state.username,
      }),
      migrate: (persistedState) => ({
        ...persistedState,
        isAdmin: false,
        adminStatusLoaded: false,
      }),
    },
  ),
);

export default useAuthStore;
