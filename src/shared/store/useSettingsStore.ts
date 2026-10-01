import { create } from "zustand";

export const BOOK_PAGE_SIZES = [100, 200, 500, 1000, 2000] as const;
export type BookPageSize = (typeof BOOK_PAGE_SIZES)[number];

type SettingsState = {
  bookPageSize: BookPageSize;
  setBookPageSize: (bookPageSize: BookPageSize) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  bookPageSize: 2000,
  setBookPageSize: (bookPageSize) => set({ bookPageSize }),
}));
