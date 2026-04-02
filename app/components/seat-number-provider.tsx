"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SeatNumberModal from "./seat-number-modal";

interface SeatNumberContextValue {
  seatNumber: number;
  clearSeat: () => void;
}

const SeatNumberContext = createContext<SeatNumberContextValue | null>(null);

export function useSeatNumber() {
  const ctx = useContext(SeatNumberContext);
  if (!ctx) throw new Error("useSeatNumber must be used within SeatNumberProvider");
  return ctx.seatNumber;
}

export function useClearSeat() {
  const ctx = useContext(SeatNumberContext);
  if (!ctx) throw new Error("useClearSeat must be used within SeatNumberProvider");
  return ctx.clearSeat;
}

export default function SeatNumberProvider({
  children,
}: {
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [seatNumber, setSeatNumber] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeDayChecked, setActiveDayChecked] = useState(false);

  useEffect(() => {
    fetch("/api/active-day")
      .then((r) => r.json())
      .then((data) => {
        if (!data.activeDay) {
          router.replace("/");
          return;
        }
        setActiveDayChecked(true);
      });
  }, [router]);

  useEffect(() => {
    if (!activeDayChecked) return;
    // URL parameter takes priority: ?seat=N
    const seatParam = searchParams.get("seat");
    if (seatParam !== null) {
      const num = parseInt(seatParam, 10);
      if (!isNaN(num) && num >= 0 && num <= 15) {
        setSeatNumber(num);
        setLoaded(true);
        return;
      }
    }

    // Fall back to localStorage
    const saved = localStorage.getItem("seatNumber");
    if (saved) {
      const num = parseInt(saved, 10);
      if (num >= 0 && num <= 15) {
        setSeatNumber(num);
      }
    }
    setLoaded(true);
  }, [searchParams, activeDayChecked]);

  function handleSubmit(seat: number) {
    localStorage.setItem("seatNumber", String(seat));
    setSeatNumber(seat);
  }

  function clearSeat() {
    localStorage.removeItem("seatNumber");
    setSeatNumber(null);
  }

  if (!activeDayChecked || !loaded) return null;

  if (seatNumber === null) {
    return <SeatNumberModal onSubmit={handleSubmit} />;
  }

  return (
    <SeatNumberContext.Provider value={{ seatNumber, clearSeat }}>
      {children}
    </SeatNumberContext.Provider>
  );
}
