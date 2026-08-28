import { create } from 'zustand';

interface ChatStoreState {
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  toggleChat: () => void;
}

export const useChatStore = create<ChatStoreState>((set) => ({
  isChatOpen: false,
  setChatOpen: (open) => set({ isChatOpen: open }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
}));
