import { NextResponse } from "next/server";
import { getActiveDay, setActiveDay } from "@/app/lib/store";

export async function GET() {
  return NextResponse.json({ activeDay: getActiveDay() });
}

export async function POST(request: Request) {
  const { dayId } = await request.json();
  setActiveDay(dayId ?? null);
  return NextResponse.json({ activeDay: getActiveDay() });
}
