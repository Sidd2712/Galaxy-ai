// src/app/api/workflow/export/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const workflowId = searchParams.get("id");
    if (!workflowId) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const workflow = await db.workflow.findFirst({
      where: { id: workflowId, userId },
    });
    if (!workflow) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const exportData = {
      name: workflow.name,
      nodes: workflow.nodes,
      edges: workflow.edges,
      viewport: workflow.viewport,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${workflow.name.replace(/\s+/g, "-")}.json"`,
      },
    });
  } catch (err) {
    console.error("[workflow/export]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
