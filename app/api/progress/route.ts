import { markComplete, getProgress, getSteps } from "@/app/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    checkpoints: getProgress(),
    steps: getSteps(),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { seatNumber, stepId } = body as {
    seatNumber: number;
    stepId: string;
  };

  if (seatNumber === undefined || seatNumber === null || !stepId) {
    return Response.json({ error: "missing fields" }, { status: 400 });
  }

  markComplete(seatNumber, stepId);
  return Response.json({ ok: true });
}
