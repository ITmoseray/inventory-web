export const logoutUserCompletely = async (signOutFunction: Function) => {
  if (typeof window !== "undefined") {
    // 0. Preserve review & feedback status before clearing
    const preservedStorage: Record<string, string> = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && (key.startsWith("protech_feedback_") || key.startsWith("protech_reviewed_"))) {
        preservedStorage[key] = window.localStorage.getItem(key) || "";
      }
    }

    // 1. Clear Local and Session Storage
    window.localStorage.clear();
    window.sessionStorage.clear();

    // Restore preserved feedback flags
    Object.entries(preservedStorage).forEach(([k, v]) => {
      window.localStorage.setItem(k, v);
    });

    // 2. Clear IndexedDB (used by dexie or other offline storage)
    if (window.indexedDB && window.indexedDB.databases) {
      try {
        const dbs = await window.indexedDB.databases();
        dbs.forEach((db) => {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
          }
        });
      } catch (err) {
        console.error("Failed to clear IndexedDB", err);
      }
    }

    // 3. Clear all session cookies except feedback flags
    document.cookie.split(";").forEach((c) => {
      const cookieName = c.split("=")[0].trim();
      if (!cookieName.startsWith("protech_feedback_")) {
        document.cookie = cookieName + "=;expires=" + new Date(0).toUTCString() + ";path=/";
      }
    });
  }

  // 4. Sign out without automatic redirect to handle hard refresh manually
  await signOutFunction({ redirect: false });

  // 5. Hard redirect to login to clear any React/Next.js memory caches
  window.location.href = "/login";
};
