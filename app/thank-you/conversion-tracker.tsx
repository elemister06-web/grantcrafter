"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export default function ConversionTracker({
  value,
  transactionId,
}: {
  value: number;
  transactionId: string;
}) {
  useEffect(() => {
    const key = `gc_conversion_${transactionId}`;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const fire = () => {
      if (typeof window.gtag === "function") {
        window.gtag("event", "conversion", {
          send_to: "AW-18151623677/eUVvCNr98KscEP2Xr89D",
          value,
          currency: "USD",
          transaction_id: transactionId,
        });
      } else {
        setTimeout(fire, 500);
      }
    };
    fire();
  }, [value, transactionId]);

  return null;
}
