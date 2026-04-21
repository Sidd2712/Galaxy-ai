"use client";
// src/components/workflow/NodeSidebar.tsx
import { useState } from "react";
import { Type, Image, Video, Zap, Crop, Film, Plus } from "lucide-react";
import { NODE_DEFS } from "@/lib/node-definitions";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Type, Image, Video, Zap, Crop, Film,
};

const NODE_SUBTITLES: Record<string, string> = {
  text: "Text input & prompt",
  image: "jpg, png, webp, gif",
  video: "mp4, mov, webm, m4v",
  llm: "Google Gemini API",
  crop: "FFmpeg · Trigger.dev",
  extract: "FFmpeg · Trigger.dev",
};

interface Props {
  onAddNode: (type: string) => void;
}

export function NodeSidebar({ onAddNode }: Props) {
  const [search, setSearch] = useState("");

  const filtered = Object.values(NODE_DEFS).filter((def) =>
    def.label.toLowerCase().includes(search.toLowerCase())
  );

  const onDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData("application/nextflow-node", type);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="w-[220px] h-full bg-bg-2 border-r border-border flex flex-col overflow-hidden">
      {/* Search */}
      <div className="p-2 border-b border-border">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Search nodes…"
          className="w-full bg-surface border border-border rounded-md px-3 py-1.5
            text-xs text-text placeholder-text-3
            focus:outline-none focus:border-accent
            transition-colors font-mono"
        />
      </div>

      {/* Section label */}
      <p className="px-3.5 pt-3 pb-1 text-[10px] text-text-3 font-mono uppercase tracking-widest">
        Quick Access
      </p>

      {/* Node list */}
      <div className="flex-1 overflow-y-auto py-1">
        {filtered.map((def) => {
          const Icon = ICON_MAP[def.icon] ?? Type;
          return (
            <div
              key={def.type}
              draggable
              onDragStart={(e) => onDragStart(e, def.type)}
              onClick={() => onAddNode(def.type)}
              className="group flex items-center gap-2.5 mx-2 px-2.5 py-2 rounded-lg
                cursor-grab active:cursor-grabbing
                border border-transparent
                hover:bg-surface hover:border-border
                transition-all duration-100"
            >
              {/* Icon badge */}
              <div
                className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0"
                style={{ background: def.color + "26" }}
              >
                <Icon size={13} style={{ color: def.color }} />
              </div>

              {/* Labels */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text leading-tight">{def.label}</p>
                <p className="text-[10px] text-text-3 leading-tight mt-0.5">
                  {NODE_SUBTITLES[def.type]}
                </p>
              </div>

              {/* Add button (shown on hover) */}
              <div className="w-5 h-5 rounded bg-surface-2 flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Plus size={11} className="text-text-3" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2.5 border-t border-border">
        <p className="text-[10px] text-text-3 font-mono text-center">
          Drag or click to add nodes
        </p>
      </div>
    </aside>
  );
}
