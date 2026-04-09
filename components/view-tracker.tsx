"use client";

import { useEffect, useRef } from "react";

interface ViewTrackerProps {
  tavernId: string;
  source?: "web" | "map" | "card" | "search";
}

export default function ViewTracker({ tavernId, source = "web" }: ViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Only track once per page load
    if (hasTracked.current) return;
    hasTracked.current = true;

    // Track the view
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tavernId, source }),
    }).catch((error) => {
      console.error("Failed to track view:", error);
    });
  }, [tavernId, source]);

  // This component doesn't render anything
  return null;
}
