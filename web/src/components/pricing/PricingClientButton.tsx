"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export function PricingClientButton({ planName, showTrial }: { planName: string, showTrial: boolean }) {
  const router = useRouter();
  const isEnterprise = planName === 'Enterprise';

  if (isEnterprise) {
    return (
      <Button 
        onClick={() => router.push('mailto:protechassist36@gmail.com')}
        className="w-full h-12 font-bold bg-slate-900 dark:bg-indigo-600 dark:text-white dark:hover:bg-indigo-700"
      >
        Contact Sales
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {showTrial && (
        <Button 
          onClick={() => router.push('/register')}
          className="w-full h-12 font-bold bg-indigo-600 hover:bg-indigo-700"
        >
          Start Free Trial
        </Button>
      )}
      <Button 
        onClick={() => router.push('/register')}
        variant={showTrial ? "outline" : "default"}
        className={cn("w-full h-12 font-bold", !showTrial && "bg-indigo-600 hover:bg-indigo-700")}
      >
        Subscribe Now
      </Button>
    </div>
  );
}
