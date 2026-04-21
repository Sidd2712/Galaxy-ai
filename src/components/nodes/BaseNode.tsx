"use client";
// src/components/nodes/BaseNode.tsx
import { memo } from "react";
import { X } from "lucide-react";
import { useWorkflowStore } from "@/store/workflow-store";
import { cn } from "@/lib/utils";
import type { NodeStatus } from "@/types";

interface Props {
  id: string;
  status: NodeStatus;
  icon: React.ReactNode;
  title: string;
  accentColor: string;
  children: React.ReactNode;
  selected?: boolean;
  className?: string;
}

export const BaseNode = memo(function BaseNode({
  id, status, icon, title, accentColor, children, selected, className
}: Props) {
  const deleteNode = useWorkflowStore((s) => s.deleteNode);

  return (
    <div
      className={cn(
        "relative bg-surface border rounded-xl text-xs overflow-visible",
        "transition-all duration-150",
        status === "running" && "node-running",
        status === "done" && "node-done",
        status === "error" && "node-error",
        selected && "ring-2 ring-accent ring-opacity-50",
        className
      )}
      style={{
        borderColor: selected ? accentColor : undefined,
        width: 240,
      }}
    >
      {/* Delete button (shown when selected) */}
      {selected && (
        <button
          onPointerDown={(e) => { e.stopPropagation(); deleteNode(id); }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-danger
            flex items-center justify-center z-30 border-2 border-bg
            hover:brightness-110 transition-all"
        >
          <X size={9} className="text-white font-bold" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: accentColor + "26" }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        <span className="font-display font-semibold text-[11px] flex-1 truncate tracking-wide">
          {title}
        </span>
        <NodeStatusBadge status={status} />
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">{children}</div>
    </div>
  );
});

function NodeStatusBadge({ status }: { status: NodeStatus }) {
  if (status === "idle") return null;
  const map = {
    running: "text-warning bg-warning/10 animate-pulse",
    done: "text-success bg-success/10",
    error: "text-danger bg-danger/10",
  };
  const label = { running: "● running", done: "✓ done", error: "✗ error" };
  return (
    <span className={cn("font-mono text-[9px] px-1.5 py-0.5 rounded uppercase", map[status])}>
      {label[status]}
    </span>
  );
}
