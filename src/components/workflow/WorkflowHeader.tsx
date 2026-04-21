"use client";
// src/components/workflow/WorkflowHeader.tsx
import { UserButton } from "@clerk/nextjs";
import { useWorkflowStore } from "@/store/workflow-store";
import {
  LayoutGrid, History, Undo2, Redo2, Play, PlayCircle,
  Download, Upload, Save, Loader2
} from "lucide-react";

interface Props {
  onRunAll: () => void;
  onRunSelected: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleSidebar: () => void;
  onToggleHistory: () => void;
  isRunning: boolean;
  hasSelection: boolean;
}

export function WorkflowHeader({
  onRunAll, onRunSelected, onUndo, onRedo,
  onToggleSidebar, onToggleHistory, isRunning, hasSelection
}: Props) {
  const { workflowName, setWorkflowName, isSaving, saveWorkflow } = useWorkflowStore();

  const exportWorkflow = () => {
    const { nodes, edges } = useWorkflowStore.getState();
    const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${workflowName.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
  };

  const importWorkflow = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const { nodes, edges } = JSON.parse(text);
        const { workflowId } = useWorkflowStore.getState();
        useWorkflowStore.getState().loadWorkflow(workflowId, nodes, edges, { x: 0, y: 0, zoom: 1 });
      } catch { alert("Invalid workflow JSON"); }
    };
    input.click();
  };

  return (
    <header className="h-12 bg-bg-2 border-b border-border flex items-center px-3 gap-2 shrink-0 z-50">
      {/* Logo */}
      <span className="font-display font-black text-lg bg-gradient-to-br from-accent-2 to-[#6ef0d8] bg-clip-text text-transparent mr-1 select-none">
        NextFlow
      </span>

      <div className="w-px h-5 bg-border" />

      {/* Sidebar toggles */}
      <HeaderBtn onClick={onToggleSidebar} title="Toggle Sidebar">
        <LayoutGrid size={14} />
      </HeaderBtn>
      <HeaderBtn onClick={onToggleHistory} title="Toggle History">
        <History size={14} />
      </HeaderBtn>

      <div className="w-px h-5 bg-border" />

      {/* Undo / Redo */}
      <HeaderBtn onClick={onUndo} title="Undo (⌘Z)"><Undo2 size={14} /></HeaderBtn>
      <HeaderBtn onClick={onRedo} title="Redo (⌘⇧Z)"><Redo2 size={14} /></HeaderBtn>

      <div className="w-px h-5 bg-border" />

      {/* Workflow name */}
      <input
        className="bg-transparent border-none outline-none font-mono text-xs text-text-2 hover:text-text focus:text-text w-40 truncate"
        value={workflowName}
        onChange={(e) => setWorkflowName(e.target.value)}
        onBlur={() => saveWorkflow()}
      />

      <div className="flex-1" />

      {/* Export / Import */}
      <HeaderBtn onClick={exportWorkflow} title="Export JSON"><Download size={14} /></HeaderBtn>
      <HeaderBtn onClick={importWorkflow} title="Import JSON"><Upload size={14} /></HeaderBtn>

      {/* Save */}
      <HeaderBtn onClick={() => saveWorkflow()} title="Save (⌘S)">
        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
      </HeaderBtn>

      <div className="w-px h-5 bg-border" />

      {/* Run Selected */}
      <button
        onClick={onRunSelected}
        disabled={isRunning || !hasSelection}
        className="flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium
          border border-border bg-surface text-text-2
          hover:border-accent hover:text-accent-2
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-150"
      >
        <PlayCircle size={13} />
        Run Selected
      </button>

      {/* Run All */}
      <button
        onClick={onRunAll}
        disabled={isRunning}
        className="flex items-center gap-1.5 px-3 h-7 rounded-md text-xs font-medium
          bg-success text-[#0a1a12]
          hover:brightness-110
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-150"
      >
        {isRunning
          ? <Loader2 size={13} className="animate-spin" />
          : <Play size={13} />}
        {isRunning ? "Running…" : "Run All"}
      </button>

      <div className="w-px h-5 bg-border" />
      <UserButton afterSignOutUrl="/sign-in" />
    </header>
  );
}

function HeaderBtn({ children, onClick, title }: {
  children: React.ReactNode; onClick: () => void; title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded-md
        text-text-3 hover:text-text hover:bg-surface
        transition-all duration-100"
    >
      {children}
    </button>
  );
}
