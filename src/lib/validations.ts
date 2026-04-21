// src/lib/validations.ts
import { z } from "zod";

// ─── ReactFlow node/edge (loose, as they come from client) ────────
const viewportSchema = z.object({
  x: z.number(),
  y: z.number(),
  zoom: z.number().min(0.1).max(4),
});

// ─── Save Workflow ────────────────────────────────────────────────
export const saveWorkflowSchema = z.object({
  workflowId: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  nodes: z.array(z.any()),   // ReactFlow nodes serialised as JSON
  edges: z.array(z.any()),
  viewport: viewportSchema,
});

// ─── Run Workflow ─────────────────────────────────────────────────
export const runWorkflowSchema = z.object({
  workflowId: z.string().cuid(),
  nodeIds: z.array(z.string()).min(1),
  scope: z.enum(["FULL", "SELECTED", "SINGLE"]),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

// ─── LLM Node Execution ───────────────────────────────────────────
export const llmExecuteSchema = z.object({
  model: z.string().min(1),
  systemPrompt: z.string().optional(),
  userMessage: z.string(),
  imageUrls: z.array(z.string().url()).optional(),
});

// ─── Crop Image ───────────────────────────────────────────────────
export const cropImageSchema = z.object({
  imageUrl: z.string().url(),
  xPercent: z.number().min(0).max(100).default(0),
  yPercent: z.number().min(0).max(100).default(0),
  widthPercent: z.number().min(1).max(100).default(100),
  heightPercent: z.number().min(1).max(100).default(100),
});

// ─── Extract Frame ────────────────────────────────────────────────
export const extractFrameSchema = z.object({
  videoUrl: z.string().url(),
  timestamp: z.string().default("50%"),
});

// ─── Upload signed URL ────────────────────────────────────────────
export const uploadUrlSchema = z.object({
  fileType: z.enum(["image", "video"]),
  fileName: z.string(),
  mimeType: z.string(),
});
