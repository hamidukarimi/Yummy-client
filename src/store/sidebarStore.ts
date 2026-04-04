import { create } from "zustand";

interface SidebarState {
  isOpen: boolean;
  open:   () => void;
  close:  () => void;
  toggle: () => void;
}

const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  open:   () => set({ isOpen: true }),
  close:  () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));

export default useSidebarStore;