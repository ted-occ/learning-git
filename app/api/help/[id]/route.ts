import type { NextRequest } from "next/server";
import { dismissHelpRequest } from "@/app/lib/store";

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/help/[id]">
) {
  const { id } = await ctx.params;
  const found = dismissHelpRequest(id);
  if (!found) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
