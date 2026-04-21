// src/types/index.ts
import type { Node, Edge, Viewport } from "reactflow";

// ─── Node Types ───────────────────────────────────────────────────
export type NodeType = "text" | "image" | "video" | "llm" | "crop" | "extract";
export type NodeStatus = "idle" | "running" | "done" | "error";
export type RunStatus = "RUNNING" | "SUCCESS" | "FAILED" | "PARTIAL";
export type RunScope = "FULL" | "SELECTED" | "SINGLE";

// ─── Node Data (per type) ─────────────────────────────────────────
export interface TextNodeData {
  type: "text";
  label: string;
  content: string;
  status: NodeStatus;
  output?: string;
}

export interface ImageNodeData {
  type: "image";
  label: string;
  uploadedUrl?: string;
  previewUrl?: string;
  status: NodeStatus;
  output?: string;
}

export interface VideoNodeData {
  type: "video";
  label: string;
  uploadedUrl?: string;
  status: NodeStatus;
  output?: string;
}

export interface LLMNodeData {
  type: "llm";
  label: string;
  model: string;
  status: NodeStatus;
  output?: string;
}

export interface CropNodeData {
  type: "crop";
  label: string;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  status: NodeStatus;
  output?: string;
}

export interface ExtractFrameNodeData {
  type: "extract";
  label: string;
  timestamp: string;
  status: NodeStatus;
  output?: string;
}

export type AnyNodeData =
  | TextNodeData
  | ImageNodeData
  | VideoNodeData
  | LLMNodeData
  | CropNodeData
  | ExtractFrameNodeData;

export type FlowNode = Node<AnyNodeData>;
export type FlowEdge = Edge;

// ─── Handle types ─────────────────────────────────────────────────
export type HandleDataType = "text" | "image" | "video";

export interface HandleDef {
  id: string;
  label: string;
  dataType: HandleDataType;
}

export interface NodeDef {
  type: NodeType;
  label: string;
  icon: string;
  color: string;
  inputs: HandleDef[];
  outputs: HandleDef[];
}

// ─── Run History ──────────────────────────────────────────────────
export interface NodeRunRecord {
  id: string;
  nodeId: string;
  nodeType: string;
  nodeLabel: string;
  status: RunStatus;
  triggerId?: string | null;
  inputs?: Record<string, unknown> | null;
  output?: string | null;
  errorMsg?: string | null;
  startedAt: Date;
  finishedAt?: Date | null;
  durationMs?: number | null;
}

export interface WorkflowRunRecord {
  id: string;
  workflowId: string;
  userId: string;
  scope: RunScope;
  status: RunStatus;
  startedAt: Date;
  finishedAt?: Date | null;
  durationMs?: number | null;
  nodeRuns: NodeRunRecord[];
}

// ─── API Payloads ─────────────────────────────────────────────────
export interface SaveWorkflowPayload {
  workflowId: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport: Viewport;
}

export interface RunWorkflowPayload {
  workflowId: string;
  nodeIds: string[];        // which nodes to run
  scope: RunScope;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface RunWorkflowResponse {
  runId: string;
  status: RunStatus;
  nodeRuns: NodeRunRecord[];
}

// ─── Gemini Models ────────────────────────────────────────────────
export const GEMINI_MODELS = [
  "gemini-2.5-flash-preview-04-17",
  "gemini-2.5-pro-preview-03-25",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
] as const;
export type GeminiModel = (typeof GEMINI_MODELS)[number];
