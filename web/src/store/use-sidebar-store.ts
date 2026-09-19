import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  colorHex: string; // Keeping for backwards compatibility
  colorHsl: string;
  setColor: (colorHex: string, colorHsl: string) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      colorHex: '#0B1629', // Figma Make Deep Navy 900
      colorHsl: '218 58% 10%',
      setColor: (colorHex, colorHsl) => set({ colorHex, colorHsl }),
    }),
    {
      name: 'sidebar-color-v2',
    }
  )
);
