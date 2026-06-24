"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function BlockScreenSignout() {
  return (
    <Button 
      variant="outline" 
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-xl px-6 h-12 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white font-black text-xs uppercase tracking-widest gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </Button>
  );
}
