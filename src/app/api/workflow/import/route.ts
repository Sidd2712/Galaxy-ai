// src/app/api/workflow/import/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const importSchema = z.object({
  workflowId: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
  viewport: z.object({ x: z.number(), y: z.number(), zoom: z.number() }).optional(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = importSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { workflowId, name, nodes, edges, viewport } = parsed.data;

    const existing = await db.workflow.findFirst({ where: { id: workflowId, userId } });
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Strip execution state from imported nodes
    const cleanNodes = nodes.map((n: any) => ({
      ...n,
      data: { ...n.data, status: "idle", output: undefined },
    }));

    const updated = await db.workflow.update({
      where: { id: workflowId },
      data: {
        ...(name ? { name } : {}),
        nodes: cleanNodes as any,
        edges: edges as any,
        ...(viewport ? { viewport: viewport as any } : {}),
      },
    });

    return NextResponse.json({ success: true, workflow: updated });
  } catch (err) {
    console.error("[workflow/import]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
