import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentStep: 0,
      steps: [
        {
          targetId: 'welcome-center',
          title: 'Welcome Guide',
          content: 'Welcome to Protech. Let us walk you through the system dashboard in 60 seconds.',
          position: 'center'
        },
        {
          targetId: 'sidebar-inventory',
          title: 'Inventory & Products',
          content: 'Manage your products, track stock levels, and monitor expiration dates here.',
          position: 'right'
        },
        {
          targetId: 'sidebar-pos',
          title: 'POS & Sales',
          content: 'The POS system records transactions in real-time. It works smoothly to handle your sales.',
          position: 'right'
        },
        {
          targetId: 'dashboard-stats',
          title: 'System Metrics',
          content: 'Monitor your revenue, sales orders, and product stock levels through live charts.',
          position: 'bottom'
        },
        {
          targetId: 'quick-actions',
          title: 'Quick Actions',
          content: 'Quickly record new sales, expenses, or stock adjustments from any page.',
          position: 'top'
        },
        {
          targetId: 'user-profile',
          title: 'Settings & Profile',
          content: 'Update your store profile, manage staff accounts, and view subscription details here.',
          position: 'left'
        }
      ],
      startTour: () => set({ isActive: true, currentStep: 0 }),
      nextStep: () => {
        const { currentStep, steps } = get();
        if (currentStep < steps.length - 1) {
          set({ currentStep: currentStep + 1 });
        } else {
          set({ isActive: false, currentStep: 0 });
        }
      },
      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },
      skipTour: () => set({ isActive: false, currentStep: 0 }),
      completeTour: () => set({ isActive: false, currentStep: 0 }),
    }),
    {
      name: 'protech-onboarding-storage',
    }
  )
);
