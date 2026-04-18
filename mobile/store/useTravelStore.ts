import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "../utils/storage";

export interface TravelState {
  selectedPassport: string | null;
  selectedDestination: string | null;
  setPassport: (code: string) => void;
  setDestination: (code: string) => void;
  clearSelections: () => void;
}

export const useTravelStore = create<TravelState>()(
  persist(
    (set) => ({
      selectedPassport: null,
      selectedDestination: null,
      setPassport: (code) => {
        set({ selectedPassport: code });
      },
      setDestination: (code) => {
        set({ selectedDestination: code });
      },
      clearSelections: () => {
        set({ selectedPassport: null, selectedDestination: null });
      },
    }),
    {
      name: "travel-store",
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
