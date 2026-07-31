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
      colorHex: '#0f172a',
      colorHsl: '222.2 47.4% 11.2%', // Default Navy (shadcn default)
      setColor: (colorHex, colorHsl) => set({ colorHex, colorHsl }),
    }),
    {
      name: 'sidebar-color-v2',
    }
  )
);
