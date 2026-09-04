"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogoutFeedback } from "@/components/providers/logout-feedback-provider";

export function LogoutButton() {
  const { openLogoutFeedback } = useLogoutFeedback();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
      onClick={() => openLogoutFeedback()}
      title="Log out"
    >
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
