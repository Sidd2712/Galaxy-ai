// src/app/api/workflow/save/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { saveWorkflowSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = saveWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { workflowId, name, nodes, edges, viewport } = parsed.data;

    // Verify ownership
    const workflow = await db.workflow.findFirst({
      where: { id: workflowId, userId },
    });
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const updated = await db.workflow.update({
      where: { id: workflowId },
      data: {
        ...(name ? { name } : {}),
        nodes: nodes as any,
        edges: edges as any,
        viewport: viewport as any,
      },
    });

    return NextResponse.json({ success: true, workflow: updated });
  } catch (err) {
    console.error("[workflow/save]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
