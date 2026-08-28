"use client";

import { useEffect } from "react";

export function VersionRecoveryListener() {
  useEffect(() => {
    // Handle Unhandled Promise Rejections (Next.js Server Actions 404 / UnrecognizedActionError)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const errorMsg = typeof reason === "string" ? reason : reason?.message || "";
      const errorName = reason?.name || "";

      if (
        errorName === "UnrecognizedActionError" ||
        errorMsg.includes("was not found on the server") ||
        errorMsg.includes("Failed to find Server Action") ||
        errorMsg.includes("Failed to fetch Server Action")
      ) {
        console.warn("[Protech OS] Detected stale client deployment bundles. Synchronizing with latest live version...");
        
        const lastSync = parseInt(sessionStorage.getItem("protech_last_version_sync") || "0", 10);
        const now = Date.now();

        // Prevent rapid reload loops (allow 1 reload every 8 seconds)
        if (now - lastSync > 8000) {
          sessionStorage.setItem("protech_last_version_sync", now.toString());
          window.location.reload();
        }
      }
    };

    // Handle Global Errors
    const handleGlobalError = (event: ErrorEvent) => {
      const errorMsg = event.message || "";
      const errorName = event.error?.name || "";

      if (
        errorName === "UnrecognizedActionError" ||
        errorMsg.includes("was not found on the server") ||
        errorMsg.includes("Failed to find Server Action")
      ) {
        console.warn("[Protech OS] Refreshing client bundle cache for new deployment...");
        const lastSync = parseInt(sessionStorage.getItem("protech_last_version_sync") || "0", 10);
        const now = Date.now();

        if (now - lastSync > 8000) {
          sessionStorage.setItem("protech_last_version_sync", now.toString());
          window.location.reload();
        }
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleGlobalError);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleGlobalError);
    };
  }, []);

  return null;
}
