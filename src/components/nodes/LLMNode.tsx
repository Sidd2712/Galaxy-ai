"use client";
// src/components/nodes/LLMNode.tsx
import { memo } from "react";
import { Handle, Position, useEdges, type NodeProps } from "reactflow";
import { Zap } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { useWorkflowStore } from "@/store/workflow-store";
import { GEMINI_MODELS } from "@/types";
import type { LLMNodeData } from "@/types";

const INPUT_HANDLES = [
  { id: "system_prompt", label: "system_prompt", color: "#7c6af7" },
  { id: "user_message", label: "user_message", color: "#7c6af7" },
  { id: "images", label: "images", color: "#ff8c42" },
];

export const LLMNode = memo(function LLMNode({ id, data, selected }: NodeProps<LLMNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const edges = useEdges();

  const connectedHandles = new Set(
    edges.filter((e) => e.target === id).map((e) => e.targetHandle)
  );

  return (
    <BaseNode id={id} status={data.status} icon={<Zap size={12} />}
      title="Run LLM" accentColor="#3ddc97" selected={selected}>

      {/* Gemini badge */}
      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
        bg-success/10 border border-success/20 font-mono text-[9px] text-success mb-1">
        ⚡ Google Gemini API
      </div>

      {/* Model selector */}
      <div>
        <label className="block text-[10px] text-text-3 font-mono uppercase tracking-wider mb-1">
          Model
        </label>
        <select
          value={data.model}
          onChange={(e) => updateNodeData(id, { model: e.target.value })}
          className="w-full bg-bg-3 border border-border rounded-md px-2 py-1.5
            text-[11px] font-mono text-text
            focus:outline-none focus:border-[#3ddc97] transition-colors"
        >
          {GEMINI_MODELS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Input handles */}
      <div className="space-y-1.5 pt-1">
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
            {connectedHandles.has(h.id) && (
              <span className="font-mono text-[9px] text-success">✓</span>
            )}
          </div>
        ))}
      </div>

      {/* LLM Output (shown after execution) */}
      {data.status === "running" && (
        <div className="bg-bg-3 border border-border rounded-md p-2 mt-1">
          <p className="font-mono text-[10px] text-warning animate-pulse">
            Generating via Trigger.dev…
          </p>
        </div>
      )}

      {data.output && data.status === "done" && (
        <div>
          <label className="block text-[10px] text-text-3 font-mono uppercase tracking-wider mb-1">
            Output
          </label>
          <div className="bg-bg-3 border border-[#3ddc97]/30 rounded-md p-2 max-h-24 overflow-y-auto">
            <p className="font-mono text-[10px] text-success leading-relaxed">{data.output}</p>
          </div>
        </div>
      )}

      {/* Output handle */}
      <div className="flex justify-end items-center gap-1.5 pt-1">
        <span className="font-mono text-[10px] text-text-3">output</span>
        <Handle type="source" position={Position.Right} id="output"
          style={{ background: "#0c0c0f", border: "2px solid #3ddc97", right: -18 }} />
      </div>
    </BaseNode>
  );
});
