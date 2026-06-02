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
          title: 'Neural Onboarding Initialized',
          content: 'Welcome to the Protech Ecosystem. I am your System Intelligence. Let me synchronize you with your new commercial command center in 60 seconds.',
          position: 'center'
        },
        {
          targetId: 'sidebar-inventory',
          title: 'Asset Management Node',
          content: 'Control your products, track stock velocity, and monitor expiry nodes across your entire network here.',
          position: 'right'
        },
        {
          targetId: 'sidebar-pos',
          title: 'Commerce Interface',
          content: 'The POS terminal executes transactions in real-time. It operates autonomously even when disconnected from cloud nodes.',
          position: 'right'
        },
        {
          targetId: 'dashboard-stats',
          title: 'Intelligence Stream',
          content: 'Monitor revenue yield, order cycles, and inventory health via these live data nodes. The ecosystem never sleeps.',
          position: 'bottom'
        },
        {
          targetId: 'quick-actions',
          title: 'Rapid Execution Trigger',
          content: 'Instantly inject new sales, expenses, or stock adjustments into the system ledger from any terminal.',
          position: 'top'
        },
        {
          targetId: 'user-profile',
          title: 'Nexus Configuration',
          content: 'Fine-tune your business profile, manage authorized staff, and synchronize your billing nodes here.',
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
