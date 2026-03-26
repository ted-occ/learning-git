import {
  setCommandStatus,
  getCommandStatuses,
  type CommandStatus,
} from "@/app/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ commandStatuses: getCommandStatuses() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { seatNumber, commandId, status } = body as {
    seatNumber: number;
    commandId: string;
    status: CommandStatus;
  };

  if (seatNumber === undefined || seatNumber === null || !commandId || !["ok", "error"].includes(status)) {
    return Response.json({ error: "invalid fields" }, { status: 400 });
  }

  setCommandStatus(seatNumber, commandId, status);
  return Response.json({ ok: true });
}
