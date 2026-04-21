"use client";
// src/components/nodes/ExtractFrameNode.tsx
import { memo } from "react";
import { Handle, Position, useEdges, type NodeProps } from "reactflow";
import { Film } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { useWorkflowStore } from "@/store/workflow-store";
import type { ExtractFrameNodeData } from "@/types";

const INPUT_HANDLES = [
  { id: "videoUrl", label: "videoUrl", color: "#4da6ff" },
  { id: "timestamp", label: "timestamp", color: "#7c6af7" },
];

export const ExtractFrameNode = memo(function ExtractFrameNode({
  id, data, selected
}: NodeProps<ExtractFrameNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const edges = useEdges();
  const connectedHandles = new Set(
    edges.filter((e) => e.target === id).map((e) => e.targetHandle)
  );

  const tsConnected = connectedHandles.has("timestamp");

  return (
    <BaseNode id={id} status={data.status} icon={<Film size={12} />}
      title="Extract Frame" accentColor="#ff6eb4" selected={selected}>

      {/* Input handles */}
      <div className="space-y-1.5 mb-2">
        {INPUT_HANDLES.map((h) => (
          <div key={h.id} className="flex items-center gap-1.5 relative">
            <Handle
              type="target"
              position={Position.Left}
              id={h.id}
              style={{
                background: connectedHandles.has(h.id) ? h.color : "#0c0c0f",
                border: `2px solid ${h.color}`,
                left: -18,
              }}
            />
            <span className={`font-mono text-[10px] ${connectedHandles.has(h.id) ? "text-text-2" : "text-text-3"}`}>
              {h.label}
            </span>
          </div>
        ))}
      </div>

      {/* Timestamp param */}
      <div>
        <label className="block text-[10px] text-text-3 font-mono uppercase tracking-wider mb-1">
          Timestamp
        </label>
        <input
          type="text"
          value={data.timestamp}
          disabled={tsConnected}
          onChange={(e) => updateNodeData(id, { timestamp: e.target.value })}
          placeholder="50% or 10 (seconds)"
          className="w-full bg-bg-3 border border-border rounded-md px-2 py-1.5
            text-[11px] font-mono text-text
            focus:outline-none focus:border-[#ff6eb4]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors"
        />
        <p className="font-mono text-[9px] text-text-3 mt-1">
          Use % for relative position or seconds
        </p>
      </div>

      <p className="font-mono text-[9px] text-text-3">⚡ FFmpeg via Trigger.dev</p>

      {data.output && data.status === "done" && (
        <p className="font-mono text-[9px] text-success truncate">✓ {data.output}</p>
      )}

      {/* Output handle */}
      <div className="flex justify-end items-center gap-1.5 pt-1">
        <span className="font-mono text-[10px] text-text-3">output (image)</span>
        <Handle type="source" position={Position.Right} id="output"
          style={{ background: "#0c0c0f", border: "2px solid #ff6eb4", right: -18 }} />
      </div>
    </BaseNode>
  );
});
