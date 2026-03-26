"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import SeatNumberModal from "./seat-number-modal";

interface SeatNumberContextValue {
  seatNumber: number;
}

const SeatNumberContext = createContext<SeatNumberContextValue | null>(null);

export function useSeatNumber() {
  const ctx = useContext(SeatNumberContext);
  if (!ctx) throw new Error("useSeatNumber must be used within SeatNumberProvider");
  return ctx.seatNumber;
}

export default function SeatNumberProvider({
  children,
}: {
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const [seatNumber, setSeatNumber] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
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
  }, [searchParams]);

  function handleSubmit(seat: number) {
    localStorage.setItem("seatNumber", String(seat));
    setSeatNumber(seat);
  }

  if (!loaded) return null;

  if (seatNumber === null) {
    return <SeatNumberModal onSubmit={handleSubmit} />;
  }

  return (
    <SeatNumberContext.Provider value={{ seatNumber }}>
      {children}
    </SeatNumberContext.Provider>
  );
}
