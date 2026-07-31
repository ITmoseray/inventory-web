import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  colorClass: string; // Keeping for backwards compatibility if needed, but not used.
  colorHex: string;
  setColorHex: (colorHex: string, colorClass?: string) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      colorClass: 'bg-slate-900', 
      colorHex: '#0f172a', // Default Navy
      setColorHex: (colorHex, colorClass = '') => set({ colorHex, colorClass }),
    }),
    {
      name: 'sidebar-color-storage',
    }
  )
);
