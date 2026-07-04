export const logoutUserCompletely = async (signOutFunction: Function) => {
  if (typeof window !== "undefined") {
    // 1. Clear Local and Session Storage
    window.localStorage.clear();
    window.sessionStorage.clear();

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

    // 3. Clear all visible cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }

  // 4. Sign out without automatic redirect to handle hard refresh manually
  await signOutFunction({ redirect: false });

  // 5. Hard redirect to login to clear any React/Next.js memory caches
  window.location.href = "/login";
};
