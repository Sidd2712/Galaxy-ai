"use client";
// src/components/nodes/BaseNode.tsx
import { memo } from "react";
import { X, AlertCircle } from "lucide-react";
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
  // Step 1: Add data prop to access the error message stored in 'output'
  data?: any; 
}

export const BaseNode = memo(function BaseNode({
  id, status, icon, title, accentColor, children, selected, className, data
}: Props) {
  const deleteNode = useWorkflowStore((s) => s.deleteNode);

  return (
    <div
      className={cn(
        "relative bg-surface border rounded-xl text-xs overflow-visible transition-all duration-150 shadow-sm",
        // Step 2: Add dynamic rings and backgrounds for Krea-like polish
        status === "running" && "ring-2 ring-warning animate-pulse bg-warning/[0.02]",
        status === "done" && "border-success/50 bg-success/[0.02]",
        status === "error" && "border-danger bg-danger/[0.02] shadow-[0_0_15px_rgba(239,68,68,0.1)]",
        selected && "ring-2 ring-accent ring-opacity-50 shadow-lg",
        className
      )}
      style={{
        borderColor: selected ? accentColor : undefined,
        width: 260, // Increased width for better readability of parameters
      }}
    >
      {/* Delete button */}
      {selected && (
        <button
          onPointerDown={(e) => { e.stopPropagation(); deleteNode(id); }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-danger
            flex items-center justify-center z-30 border-2 border-bg
            hover:scale-110 transition-all"
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
        <span className="font-display font-bold text-[10px] flex-1 truncate tracking-wider uppercase opacity-70">
          {title}
        </span>
        <NodeStatusBadge status={status} />
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {/* Step 3: In-line Error Message Display */}
        {status === "error" && data?.output && (
          <div className="flex gap-2 p-2 rounded-lg bg-danger/10 border border-danger/20 text-danger animate-in fade-in zoom-in duration-200">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5 overflow-hidden">
               <span className="font-bold text-[9px] uppercase tracking-tighter">Execution Failed</span>
               <p className="font-mono text-[10px] leading-tight break-words italic">
                 {data.output}
               </p>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
});

function NodeStatusBadge({ status }: { status: NodeStatus }) {
  if (status === "idle") return null;
  const map = {
    running: "text-warning bg-warning/10",
    done: "text-success bg-success/10",
    error: "text-danger bg-danger/10",
  };
  const label = { running: "● running", done: "✓ done", error: "✗ error" };
  return (
    <span className={cn("font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter", map[status])}>
      {label[status]}
    </span>
  );
}