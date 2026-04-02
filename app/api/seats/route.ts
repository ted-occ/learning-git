import { NextResponse } from "next/server";
import { seatUser, unseatUser, getSeatedUsers } from "@/app/lib/store";

export async function GET() {
  return NextResponse.json({ seats: getSeatedUsers() });
}

export async function POST(request: Request) {
  const { seatNumber, action } = await request.json();
  if (action === "seat") {
    seatUser(seatNumber);
  } else if (action === "unseat") {
    unseatUser(seatNumber);
  }
  return NextResponse.json({ seats: getSeatedUsers() });
}
