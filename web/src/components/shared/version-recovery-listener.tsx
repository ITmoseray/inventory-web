"use client";

import { useEffect } from "react";

export function VersionRecoveryListener() {
  useEffect(() => {
    // 1. Intercept window.fetch to catch 404 on Server Actions
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // If a Next.js Server Action POST returns 404 (stale deployment action hash)
        if (response.status === 404) {
          const req = args[0];
          const init = args[1];
          const isPost = init?.method === "POST" || (typeof req === "object" && (req as Request).method === "POST");
          
          if (isPost) {
            const lastSync = parseInt(sessionStorage.getItem("protech_last_version_sync") || "0", 10);
            const now = Date.now();

            if (now - lastSync > 6000) {
              sessionStorage.setItem("protech_last_version_sync", now.toString());
              console.warn("[Protech OS] Detected new deployment version. Automatically synchronizing client bundles...");
              window.location.reload();
            }
          }
        }
        return response;
      } catch (err: any) {
        if (
          err?.name === "UnrecognizedActionError" ||
          err?.message?.includes("was not found on the server")
        ) {
          const lastSync = parseInt(sessionStorage.getItem("protech_last_version_sync") || "0", 10);
          const now = Date.now();
          if (now - lastSync > 6000) {
            sessionStorage.setItem("protech_last_version_sync", now.toString());
            window.location.reload();
          }
        }
        throw err;
      }
    };

    // 2. Unhandled Promise Rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const errorMsg = typeof reason === "string" ? reason : reason?.message || "";
      const errorName = reason?.name || "";

      if (
        errorName === "UnrecognizedActionError" ||
        errorMsg.includes("was not found on the server") ||
        errorMsg.includes("Failed to find Server Action")
      ) {
        const lastSync = parseInt(sessionStorage.getItem("protech_last_version_sync") || "0", 10);
        const now = Date.now();
        if (now - lastSync > 6000) {
          sessionStorage.setItem("protech_last_version_sync", now.toString());
          window.location.reload();
        }
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
