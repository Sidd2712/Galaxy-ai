"use client";
// src/components/nodes/TextNode.tsx
import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Type } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { useWorkflowStore } from "@/store/workflow-store";
import type { TextNodeData } from "@/types";

export const TextNode = memo(function TextNode({ id, data, selected }: NodeProps<TextNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  return (
    <BaseNode id={id} status={data.status} icon={<Type size={12} />}
      title="Text Node" accentColor="#7c6af7" selected={selected}>

      <div>
        <label className="block text-[10px] text-text-3 font-mono uppercase tracking-wider mb-1">
          Content
        </label>
        <textarea
          value={data.content}
          onChange={(e) => updateNodeData(id, { content: e.target.value })}
          placeholder="Enter text or prompt…"
          rows={3}
          className="w-full bg-bg-3 border border-border rounded-md px-2 py-1.5
            text-[11px] font-mono text-text resize-none
            focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Output handle */}
      <div className="flex justify-end items-center gap-1.5 pt-1">
        <span className="font-mono text-[10px] text-text-3">output</span>
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          style={{ background: "#0c0c0f", border: "2px solid #7c6af7", right: -18 }}
        />
      </div>
    </BaseNode>
  );
});
