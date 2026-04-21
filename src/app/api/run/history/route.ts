// src/app/api/run/history/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const workflowId = searchParams.get("workflowId");

    const runs = await db.workflowRun.findMany({
      where: {
        userId,
        ...(workflowId ? { workflowId } : {}),
      },
      include: {
        nodeRuns: { orderBy: { startedAt: "asc" } },
      },
      orderBy: { startedAt: "desc" },
      take: 30,
    });

    return NextResponse.json({ runs });
  } catch (err) {
    console.error("[run/history]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
