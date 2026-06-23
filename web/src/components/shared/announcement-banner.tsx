"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

export function AnnouncementBanner() {
  const [banner, setBanner] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const url = `/api/announcement?t=${Date.now()}`;
        const res = await fetch(url, { cache: "no-store" });
        const text = await res.text();
        console.log("[AnnouncementBanner] raw response:", text);
        const data = JSON.parse(text);
        setBanner(data.banner ?? "");
      } catch (err) {
        console.error("[AnnouncementBanner] error:", err);
      } finally {
        setLoaded(true);
      }
    };

    fetchBanner();
    const id = setInterval(fetchBanner, 20_000);
    return () => clearInterval(id);
  }, []);

  // Always render the container — makes it visible even while loading
  return (
    <div
      style={{
        width: "100%",
        flexShrink: 0,
        position: "relative",
        zIndex: 9999,
      }}
    >
      {loaded && banner ? (
        <div
          style={{
            background: "linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)",
            color: "#fff",
            padding: "10px 16px",
            textAlign: "center",
            fontSize: "11px",
            fontWeight: 900,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            borderBottom: "1px solid rgba(99,102,241,0.4)",
          }}
        >
          <Zap style={{ width: 14, height: 14, color: "#818cf8", flexShrink: 0 }} />
          <span>{banner}</span>
          <Zap style={{ width: 14, height: 14, color: "#818cf8", flexShrink: 0 }} />
        </div>
      ) : null}
    </div>
  );
}
