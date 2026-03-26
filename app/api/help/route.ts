import { addHelpRequest, getActiveHelpRequests } from "@/app/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ requests: getActiveHelpRequests() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { seatNumber, currentSection } = body as {
    seatNumber: number;
    currentSection: string;
  };

  if (seatNumber === undefined || seatNumber === null) {
    return Response.json({ error: "missing seatNumber" }, { status: 400 });
  }

  const id = addHelpRequest(seatNumber, currentSection || "");
  return Response.json({ ok: true, id });
}
