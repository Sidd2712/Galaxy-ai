// src/store/workflow-store.ts
import { create } from "zustand";
import { temporal } from "zundo";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type NodeChange,
  type EdgeChange,
  type Viewport,
} from "reactflow";
import type {
  FlowNode,
  FlowEdge,
  AnyNodeData,
  NodeStatus,
  WorkflowRunRecord,
} from "@/types";
import { NODE_DEFS } from "@/lib/node-definitions";

// ─── Helper: build default node data per type ─────────────────────
function defaultData(type: string): AnyNodeData {
  switch (type) {
    case "text":
      return { type: "text", label: "Text Node", content: "", status: "idle" };
    case "image":
      return { type: "image", label: "Upload Image", status: "idle" };
    case "video":
      return { type: "video", label: "Upload Video", status: "idle" };
    case "llm":
      return { type: "llm", label: "Run LLM", model: "gemini-2.5-flash-preview-04-17", status: "idle" };
    case "crop":
      return { type: "crop", label: "Crop Image", xPercent: 0, yPercent: 0, widthPercent: 100, heightPercent: 100, status: "idle" };
    case "extract":
      return { type: "extract", label: "Extract Frame", timestamp: "50%", status: "idle" };
    default:
      return { type: "text", label: type, content: "", status: "idle" };
  }
}

let _nodeCounter = 0;

// ─── Store shape ──────────────────────────────────────────────────
interface WorkflowState {
  workflowId: string;
  workflowName: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport: Viewport;
  selectedNodeIds: string[];
  runs: WorkflowRunRecord[];
  isSaving: boolean;
  isRunning: boolean;
  sidebarOpen: boolean;
  historyOpen: boolean;

  // ReactFlow handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => boolean;

  // Node CRUD
  addNode: (type: string, position?: { x: number; y: number }) => string;
  updateNodeData: (id: string, data: Partial<AnyNodeData>) => void;
  setNodeStatus: (id: string, status: NodeStatus, output?: string) => void;
  deleteNode: (id: string) => void;
  selectNodes: (ids: string[]) => void;

  // Workflow
  setViewport: (vp: Viewport) => void;
  setWorkflowName: (name: string) => void;
  loadWorkflow: (id: string, nodes: FlowNode[], edges: FlowEdge[], vp: Viewport) => void;
  saveWorkflow: () => Promise<void>;
  resetNodeStatuses: () => void;

  // Runs
  addRun: (run: WorkflowRunRecord) => void;
  updateRun: (runId: string, partial: Partial<WorkflowRunRecord>) => void;
  setRuns: (runs: WorkflowRunRecord[]) => void;

  // UI
  toggleSidebar: () => void;
  toggleHistory: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    (set, get) => ({
      workflowId: "",
      workflowName: "Untitled Workflow",
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      selectedNodeIds: [],
      runs: [],
      isSaving: false,
      isRunning: false,
      sidebarOpen: true,
      historyOpen: true,

      // ── ReactFlow handlers ─────────────────────────────────────
      onNodesChange: (changes) => {
        set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) as FlowNode[] }));
        // Sync selection
        const selected = get().nodes.filter((n) => n.selected).map((n) => n.id);
        set({ selectedNodeIds: selected });
      },

      onEdgesChange: (changes) => {
        set((s) => ({ edges: applyEdgeChanges(changes, s.edges) as FlowEdge[] }));
      },

      onConnect: (connection) => {
        if (!connection.source || !connection.target) return false;

        // Type-safe connection validation
        const sourceNode = get().nodes.find((n) => n.id === connection.source);
        const targetNode = get().nodes.find((n) => n.id === connection.target);
        if (!sourceNode || !targetNode) return false;

        const sourceDef = NODE_DEFS[sourceNode.data.type];
        const targetDef = NODE_DEFS[targetNode.data.type];

        const sourceHandle = sourceDef?.outputs.find(
          (h) => h.id === connection.sourceHandle
        );
        const targetHandle = targetDef?.inputs.find(
          (h) => h.id === connection.targetHandle
        );

        if (!sourceHandle || !targetHandle) return false;
        if (sourceHandle.dataType !== targetHandle.dataType) {
          console.warn("Type mismatch:", sourceHandle.dataType, "→", targetHandle.dataType);
          return false;
        }

        // DAG: no cycles
        if (wouldCreateCycle(get().edges, connection.source, connection.target)) {
          console.warn("Circular connection blocked");
          return false;
        }

        set((s) => ({
          edges: addEdge(
            {
              ...connection,
              animated: true,
              className: "animated-edge",
              style: { stroke: getEdgeColor(sourceHandle.dataType) },
            },
            s.edges
          ) as FlowEdge[],
        }));
        return true;
      },

      // ── Node CRUD ──────────────────────────────────────────────
      addNode: (type, position) => {
        const id = `node-${Date.now()}-${++_nodeCounter}`;
        const pos = position ?? {
          x: 100 + Math.random() * 300,
          y: 80 + Math.random() * 200,
        };
        const node: FlowNode = {
          id,
          type,
          position: pos,
          data: defaultData(type) as AnyNodeData,
        };
        set((s) => ({ nodes: [...s.nodes, node] }));
        return id;
      },

      updateNodeData: (id, data) => {
        set((s) => ({
          nodes: s.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n
          ),
        }));
      },

      setNodeStatus: (id, status, output) => {
        set((s) => ({
          nodes: s.nodes.map((n) =>
            n.id === id
              ? { ...n, data: { ...n.data, status, ...(output !== undefined ? { output } : {}) } }
              : n
          ),
        }));
      },

      deleteNode: (id) => {
        set((s) => ({
          nodes: s.nodes.filter((n) => n.id !== id),
          edges: s.edges.filter((e) => e.source !== id && e.target !== id),
        }));
      },

      selectNodes: (ids) => set({ selectedNodeIds: ids }),

      // ── Workflow ───────────────────────────────────────────────
      setViewport: (viewport) => set({ viewport }),

      setWorkflowName: (workflowName) => set({ workflowName }),

      loadWorkflow: (workflowId, nodes, edges, viewport) => {
        set({ workflowId, nodes, edges, viewport });
      },

      resetNodeStatuses: () => {
        set((s) => ({
          nodes: s.nodes.map((n) => ({
            ...n,
            data: { ...n.data, status: "idle" as NodeStatus, output: undefined },
          })),
        }));
      },

      saveWorkflow: async () => {
        const { workflowId, workflowName, nodes, edges, viewport } = get();
        if (!workflowId) return;
        set({ isSaving: true });
        try {
          await fetch("/api/workflow/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workflowId, name: workflowName, nodes, edges, viewport }),
          });
        } finally {
          set({ isSaving: false });
        }
      },

      // ── Runs ───────────────────────────────────────────────────
      addRun: (run) => set((s) => ({ runs: [run, ...s.runs] })),

      updateRun: (runId, partial) =>
        set((s) => ({
          runs: s.runs.map((r) => (r.id === runId ? { ...r, ...partial } : r)),
        })),

      setRuns: (runs) => set({ runs }),

      // ── UI ─────────────────────────────────────────────────────
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      toggleHistory: () => set((s) => ({ historyOpen: !s.historyOpen })),
    }),
    { limit: 50 } // undo/redo history depth
  )
);

// ─── Helpers ──────────────────────────────────────────────────────
function wouldCreateCycle(edges: FlowEdge[], from: string, to: string): boolean {
  const visited = new Set<string>();
  const stack = [to];
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur === from) return true;
    if (visited.has(cur)) continue;
    visited.add(cur);
    edges.filter((e) => e.source === cur).forEach((e) => stack.push(e.target));
  }
  return false;
}

function getEdgeColor(dataType: string): string {
  return { text: "#7c6af7", image: "#ff8c42", video: "#4da6ff" }[dataType] ?? "#7c6af7";
}

// ─── Undo/Redo exports ────────────────────────────────────────────
export const useTemporalStore = (useWorkflowStore as any).temporal as ReturnType<typeof temporal>;
