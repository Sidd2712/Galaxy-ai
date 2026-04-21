// src/app/(app)/workflow/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { WorkflowCanvas } from "@/components/workflow/WorkflowCanvas";

export default async function WorkflowPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Load or create the user's workflow
  let workflow = await db.workflow.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  if (!workflow) {
    workflow = await db.workflow.create({
      data: { userId, name: "My First Workflow" },
    });
  }

  // Load run history (last 20)
  const runs = await db.workflowRun.findMany({
    where: { workflowId: workflow.id },
    include: { nodeRuns: { orderBy: { startedAt: "asc" } } },
    orderBy: { startedAt: "desc" },
    take: 20,
  });

  return (
    <WorkflowCanvas
      workflowId={workflow.id}
      initialNodes={(workflow.nodes as any[]) ?? []}
      initialEdges={(workflow.edges as any[]) ?? []}
      initialViewport={(workflow.viewport as any) ?? { x: 0, y: 0, zoom: 1 }}
      initialRuns={runs}
    />
  );
}
