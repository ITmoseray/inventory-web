import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  colorClass: string;
  setColorClass: (colorClass: string) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      colorClass: 'bg-slate-900', // Default dark color
      setColorClass: (colorClass) => set({ colorClass }),
    }),
    {
      name: 'sidebar-color-storage',
    }
  )
);
