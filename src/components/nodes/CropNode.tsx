"use client";
// src/components/nodes/CropNode.tsx
import { memo } from "react";
import { Handle, Position, useEdges, type NodeProps } from "reactflow";
import { Crop } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { useWorkflowStore } from "@/store/workflow-store";
import type { CropNodeData } from "@/types";

const INPUT_HANDLES = [
  { id: "image_url", label: "image_url", color: "#ff8c42" },
  { id: "x_percent", label: "x_percent", color: "#7c6af7" },
  { id: "y_percent", label: "y_percent", color: "#7c6af7" },
  { id: "width_percent", label: "width_percent", color: "#7c6af7" },
  { id: "height_percent", label: "height_percent", color: "#7c6af7" },
];

export const CropNode = memo(function CropNode({ id, data, selected }: NodeProps<CropNodeData>) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const edges = useEdges();

  const connectedHandles = new Set(
    edges.filter((e) => e.target === id).map((e) => e.targetHandle)
  );

  const numField = (key: keyof CropNodeData, label: string, handleId: string) => {
    const isConnected = connectedHandles.has(handleId);
    return (
      <div className="flex flex-col gap-0.5">
        <label className="text-[9px] font-mono text-text-3 uppercase">{label}</label>
        <input
          type="number"
          min={0} max={100}
          value={(data as any)[key]}
          disabled={isConnected}
          onChange={(e) => updateNodeData(id, { [key]: Number(e.target.value) } as any)}
          className="w-full bg-bg-3 border border-border rounded px-1.5 py-1
            text-[11px] font-mono text-text
            focus:outline-none focus:border-[#f5c842]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors"
        />
      </div>
    );
  };

  return (
    <BaseNode id={id} status={data.status} icon={<Crop size={12} />}
      title="Crop Image" accentColor="#f5c842" selected={selected}>

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

      {/* Crop params grid */}
      <div className="grid grid-cols-2 gap-2">
        {numField("xPercent", "X%", "x_percent")}
        {numField("yPercent", "Y%", "y_percent")}
        {numField("widthPercent", "W%", "width_percent")}
        {numField("heightPercent", "H%", "height_percent")}
      </div>

      <p className="font-mono text-[9px] text-text-3 mt-1">⚡ FFmpeg via Trigger.dev</p>

      {data.output && data.status === "done" && (
        <p className="font-mono text-[9px] text-success truncate mt-1">✓ {data.output}</p>
      )}

      {/* Output handle */}
      <div className="flex justify-end items-center gap-1.5 pt-1">
        <span className="font-mono text-[10px] text-text-3">output</span>
        <Handle type="source" position={Position.Right} id="output"
          style={{ background: "#0c0c0f", border: "2px solid #f5c842", right: -18 }} />
      </div>
    </BaseNode>
  );
});
