"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSeatNumber } from "./seat-number-provider";

export default function HelpButton() {
  const seatNumber = useSeatNumber();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentSectionRef = useRef("");

  // Track which section is currently visible
  useEffect(() => {
    const headings = document.querySelectorAll("[id^='step-']");
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            currentSectionRef.current =
              entry.target.id.replace("step-", "") || "";
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, []);

  const handleClick = useCallback(async () => {
    if (sent || loading) return;
    setLoading(true);
    try {
      await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seatNumber,
          currentSection: currentSectionRef.current,
        }),
      });
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } finally {
      setLoading(false);
    }
  }, [seatNumber, sent, loading]);

  return (
    <button
      onClick={handleClick}
      disabled={loading || sent}
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg transition ${
        sent
          ? "bg-green-600 text-white"
          : "bg-red-500 text-white hover:bg-red-600 active:bg-red-700"
      } disabled:opacity-70`}
    >
      {sent ? (
        <>
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          送信しました
        </>
      ) : (
        <>
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z"
            />
          </svg>
          {loading ? "送信中..." : "助けてほしい"}
        </>
      )}
    </button>
  );
}
