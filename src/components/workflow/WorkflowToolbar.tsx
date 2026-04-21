"use client";
// src/components/workflow/WorkflowToolbar.tsx
// Floating toolbar on the canvas with sample workflow loader, fit-view, select-all
import { Sparkles, Maximize2, BoxSelect } from "lucide-react";
import { useReactFlow } from "reactflow";
import { useWorkflowStore } from "@/store/workflow-store";
import { buildSampleWorkflow } from "@/lib/sample-workflow";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export function WorkflowToolbar() {
  const { fitView } = useReactFlow();
  const { toast } = useToast();
  const { loadWorkflow, workflowId, nodes } = useWorkflowStore();

  const loadSample = () => {
    if (nodes.length > 0) {
      if (!confirm("This will replace your current workflow. Continue?")) return;
    }
    const { nodes: sampleNodes, edges: sampleEdges } = buildSampleWorkflow();
    loadWorkflow(workflowId, sampleNodes, sampleEdges, { x: 0, y: 0, zoom: 0.75 });
    setTimeout(() => fitView({ padding: 0.1, duration: 400 }), 50);
    toast({ description: "✦ Sample workflow loaded! Hit Run All to execute." });
  };

  const selectAll = () => {
    const store = useWorkflowStore.getState();
    store.selectNodes(store.nodes.map((n) => n.id));
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1
      bg-bg-2 border border-border rounded-lg p-1 shadow-xl">
      <ToolBtn onClick={loadSample} label="Load Sample Workflow">
        <Sparkles size={13} />
        <span className="text-[11px] font-medium">Sample Workflow</span>
      </ToolBtn>
      <div className="w-px h-5 bg-border mx-0.5" />
      <ToolBtn onClick={() => fitView({ padding: 0.1, duration: 300 })} label="Fit View">
        <Maximize2 size={13} />
      </ToolBtn>
      <ToolBtn onClick={selectAll} label="Select All (⌘A)">
        <BoxSelect size={13} />
      </ToolBtn>
    </div>
  );
}

function ToolBtn({
  children, onClick, label
}: {
  children: React.ReactNode; onClick: () => void; label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "flex items-center gap-1.5 px-2.5 h-7 rounded-md",
        "text-text-3 hover:text-text hover:bg-surface",
        "transition-all duration-100 text-xs"
      )}
    >
      {children}
    </button>
  );
}
