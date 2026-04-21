// src/app/api/run/execute/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runWorkflowSchema } from "@/lib/validations";
import { runs } from "@trigger.dev/sdk/v3";
import { llmTask, cropImageTask, extractFrameTask } from "@/trigger/tasks";
import type { FlowNode, FlowEdge } from "@/types";

export const maxDuration = 300; // 5 min for full workflow

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = runWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const { workflowId, nodeIds, scope, nodes, edges } = parsed.data;

    // Verify ownership
    const workflow = await db.workflow.findFirst({ where: { id: workflowId, userId } });
    if (!workflow) return NextResponse.json({ error: "Workflow not found" }, { status: 404 });

    // Create the run record
    const workflowRun = await db.workflowRun.create({
      data: {
        workflowId,
        userId,
        scope: scope as any,
        status: "RUNNING",
      },
    });

    // Execute nodes in topological order with parallel branches
    const result = await executeWorkflow(
      workflowRun.id,
      nodeIds,
      nodes as FlowNode[],
      edges as FlowEdge[]
    );

    // Determine overall status
    const nodeRunStatuses = result.map((r) => r.status);
    const allSuccess = nodeRunStatuses.every((s) => s === "SUCCESS");
    const anySuccess = nodeRunStatuses.some((s) => s === "SUCCESS");
    const finalStatus = allSuccess ? "SUCCESS" : anySuccess ? "PARTIAL" : "FAILED";

    const finishedAt = new Date();
    await db.workflowRun.update({
      where: { id: workflowRun.id },
      data: {
        status: finalStatus as any,
        finishedAt,
        durationMs: finishedAt.getTime() - workflowRun.startedAt.getTime(),
      },
    });

    // Fetch full run with nodeRuns
    const fullRun = await db.workflowRun.findUnique({
      where: { id: workflowRun.id },
      include: { nodeRuns: { orderBy: { startedAt: "asc" } } },
    });

    return NextResponse.json({ success: true, run: fullRun });
  } catch (err) {
    console.error("[run/execute]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── Topological execution engine ────────────────────────────────
async function executeWorkflow(
  runId: string,
  nodeIds: string[],
  allNodes: FlowNode[],
  allEdges: FlowEdge[]
) {
  const nodeSet = new Set(nodeIds);
  const nodeMap = Object.fromEntries(allNodes.map((n) => [n.id, n]));

  // Build adjacency & in-degree within selected set
  const inDegree: Record<string, number> = {};
  const children: Record<string, string[]> = {};
  const outputs: Record<string, string> = {}; // nodeId → computed output value

  nodeIds.forEach((id) => {
    inDegree[id] = 0;
    children[id] = [];
  });

  allEdges.forEach((e) => {
    if (nodeSet.has(e.source) && nodeSet.has(e.target)) {
      children[e.source].push(e.target);
      inDegree[e.target]++;
    }
  });

  const allResults: Array<{
    nodeId: string; status: "SUCCESS" | "FAILED"; output?: string;
  }> = [];

  // BFS level-by-level (parallel within each level)
  let queue = nodeIds.filter((id) => inDegree[id] === 0);

  while (queue.length > 0) {
    // Execute all nodes in this level in parallel
    const levelResults = await Promise.all(
      queue.map((nodeId) => executeNode(runId, nodeMap[nodeId], allEdges, outputs))
    );

    // Store outputs and update allResults
    levelResults.forEach(({ nodeId, status, output }) => {
      if (output) outputs[nodeId] = output;
      allResults.push({ nodeId, status, output });

      // Decrement in-degree of children
      (children[nodeId] || []).forEach((child) => {
        inDegree[child]--;
      });
    });

    // Next queue = nodes whose in-degree just hit 0
    queue = nodeIds.filter((id) => inDegree[id] === 0 && !outputs[id] && !allResults.find(r => r.nodeId === id));
  }

  return allResults;
}

// ─── Execute a single node via Trigger.dev ────────────────────────
async function executeNode(
  runId: string,
  node: FlowNode,
  allEdges: FlowEdge[],
  resolvedOutputs: Record<string, string>
): Promise<{ nodeId: string; status: "SUCCESS" | "FAILED"; output?: string }> {
  const startedAt = new Date();

  // Create node run record
  const nodeRun = await db.nodeRun.create({
    data: {
      workflowRunId: runId,
      nodeId: node.id,
      nodeType: node.data.type,
      nodeLabel: node.data.label,
      status: "RUNNING",
    },
  });

  try {
    let output: string | undefined;

    switch (node.data.type) {
      case "text": {
        output = (node.data as any).content ?? "";
        break;
      }

      case "image": {
        output = (node.data as any).uploadedUrl ?? (node.data as any).output ?? "";
        console.log(`[EXECUTE] Video node ${node.id} finished with URL: ${output}`);
        break;
      }

      case "video": {
        output = (node.data as any).uploadedUrl ?? (node.data as any).output ?? "";
        break;
      }

      case "llm": {
        // Resolve inputs from connected nodes
        const systemPrompt = resolveInput(node.id, "system_prompt", allEdges, resolvedOutputs)
          ?? "";
        const userMessage = resolveInput(node.id, "user_message", allEdges, resolvedOutputs)
          ?? (node.data as any).content ?? "";
        const imageUrl = resolveInput(node.id, "images", allEdges, resolvedOutputs);
        const imageUrls = imageUrl ? [imageUrl] : [];

        // Trigger.dev task
        const handle = await llmTask.trigger({
          model: (node.data as any).model ?? "gemini-1.5-pro",
          systemPrompt: systemPrompt || undefined,
          userMessage,
          imageUrls,
          nodeRunId: nodeRun.id,
        });

        // Wait for completion
        const taskResult = await runs.poll(handle.id, { pollIntervalMs: 1000 });
        if (taskResult.status !== "COMPLETED") throw new Error("LLM task failed");
        output = (taskResult.output as any).output;
        break;
      }

      case "crop": {
        const imageUrl = resolveInput(node.id, "image_url", allEdges, resolvedOutputs)
          ?? (node.data as any).output ?? "";

        const handle = await cropImageTask.trigger({
          imageUrl,
          xPercent: (node.data as any).xPercent ?? 0,
          yPercent: (node.data as any).yPercent ?? 0,
          widthPercent: (node.data as any).widthPercent ?? 100,
          heightPercent: (node.data as any).heightPercent ?? 100,
          nodeRunId: nodeRun.id,
          transloaditKey: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY!,
          transloaditSecret: process.env.TRANSLOADIT_SECRET!,
        });

        const taskResult = await runs.poll(handle.id, { pollIntervalMs: 1000 });
        if (taskResult.status !== "COMPLETED") throw new Error("Crop task failed");
        output = (taskResult.output as any).output;
        break;
      }

      case "extract": {
        let videoUrl = resolveInput(node.id, "video_url", allEdges, resolvedOutputs);
        if (!videoUrl) {
          const backupEdge = allEdges.find(e => e.target === node.id);
          if (backupEdge) {
            videoUrl = resolvedOutputs[backupEdge.source];
            console.log(`[RECOVERY] Found videoUrl from source node: ${backupEdge.source}`);
          }
        }

        // 3. LAST RESORT: Check if there's a hardcoded URL in the node itself
        if (!videoUrl) {
          videoUrl = (node.data as any).uploadedUrl || (node.data as any).output || "";
        }

        const timestamp = resolveInput(node.id, "timestamp", allEdges, resolvedOutputs)
          ?? (node.data as any).timestamp 
          ?? "50%";

        // Trigger the task
        const handle = await extractFrameTask.trigger({
          videoUrl,
          timestamp,
          nodeRunId: nodeRun.id,
          transloaditKey: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY!,
          transloaditSecret: process.env.TRANSLOADIT_SECRET!,
        });
        const taskResult = await runs.poll(handle.id, { pollIntervalMs: 1000 });
        if (taskResult.status !== "COMPLETED") throw new Error("Extract task failed");
        
        // Make sure we extract the nested 'output' string from Trigger.dev
        output = (taskResult.output as any).output;
        break;
      }
    }

    const finishedAt = new Date();
    await db.nodeRun.update({
      where: { id: nodeRun.id },
      data: {
        status: "SUCCESS",
        output,
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
      },
    });

    return { nodeId: node.id, status: "SUCCESS", output };
  } catch (err: any) {
    const finishedAt = new Date();
    await db.nodeRun.update({
      where: { id: nodeRun.id },
      data: {
        status: "FAILED",
        errorMsg: err?.message ?? "Unknown error",
        finishedAt,
        durationMs: finishedAt.getTime() - startedAt.getTime(),
      },
    });
    return { nodeId: node.id, status: "FAILED" };
  }
}

// ─── Resolve input handle value from connected upstream node ──────
function resolveInput(
  nodeId: string,
  handleId: string,
  edges: FlowEdge[],
  outputs: Record<string, string>
): string | undefined {
  const edge = edges.find((e) => e.target === nodeId && e.targetHandle === handleId);
  if (!edge) return undefined;
  return outputs[edge.source];
}
