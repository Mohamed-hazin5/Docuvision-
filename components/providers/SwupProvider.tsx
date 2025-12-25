"use client";

import { useEffect, useRef } from "react";
import Swup from "swup";
import RouteNamePlugin from "@swup/route-name-plugin";
import ScrollPlugin from "@swup/scroll-plugin";

export function SwupProvider({ children }: { children: React.ReactNode }) {
  const swupRef = useRef<Swup | null>(null);

  useEffect(() => {
    if (swupRef.current) return;

    swupRef.current = new Swup({
      containers: ["#swup"],
      plugins: [
        new RouteNamePlugin(),
        new ScrollPlugin({
          doScrollingRightAway: false,
          animateScroll: {
            betweenPages: false,
            samePageWithHash: false,
            samePage: false,
          },
        }),
      ],
      animationSelector: '[class*="transition-"]',
    });

    return () => {
      swupRef.current?.destroy();
      swupRef.current = null;
    };
  }, []);

  return (
    <div id="swup" className="transition-fade min-h-screen">
      {children}
    </div>
  );
}


