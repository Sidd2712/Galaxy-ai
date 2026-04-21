"use client";
// src/components/nodes/VideoNode.tsx
import { memo, useRef } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Video, Upload, Loader2 } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { useWorkflowStore } from "@/store/workflow-store";
import type { VideoNodeData } from "@/types";

export const VideoNode = memo(function VideoNode({ id, data, selected }: NodeProps<VideoNodeData>) {
  const { updateNodeData, setNodeStatus } = useWorkflowStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.match(/^video\//)) {
      alert("Please upload a video file (mp4, mov, webm, m4v)");
      return;
    }

    setNodeStatus(id, "running");

    try {
      const paramsRes = await fetch("/api/upload/params", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileType: "video", fileName: file.name, mimeType: file.type }),
      });
      const { params, signature } = await paramsRes.json();

      const formData = new FormData();
      formData.append("params", params);
      formData.append("signature", signature);
      formData.append("file", file);

      const assemblyRes = await fetch("https://api2.transloadit.com/assemblies", {
        method: "POST",
        body: formData,
      });
      const assembly = await assemblyRes.json();

      let final = assembly;
      while (final.ok !== "ASSEMBLY_COMPLETED" && final.ok !== "ASSEMBLY_FAILED") {
        await new Promise((r) => setTimeout(r, 2000));
        const poll = await fetch(`https://api2.transloadit.com/assemblies/${assembly.assembly_id}`);
        final = await poll.json();
      }

      if (final.ok !== "ASSEMBLY_COMPLETED") throw new Error("Upload failed");

      const resultSteps = Object.values(final.results ?? {}) as any[][];
      const uploadedUrl = resultSteps[0]?.[0]?.ssl_url ?? resultSteps[0]?.[0]?.url;
      if (!uploadedUrl) throw new Error("No URL in result");

      updateNodeData(id, { uploadedUrl, output: uploadedUrl });
      setNodeStatus(id, "done", uploadedUrl);
    } catch (err: any) {
      console.error("Video upload error:", err);
      setNodeStatus(id, "error");
    }
  };

  return (
    <BaseNode id={id} status={data.status} icon={<Video size={12} />}
      title="Upload Video" accentColor="#4da6ff" selected={selected}>

      {data.uploadedUrl ? (
        <div>
          <div className="bg-bg-3 border border-border rounded-md p-2">
            <p className="font-mono text-[10px] text-success mb-0.5">✓ Uploaded via Transloadit</p>
            <p className="font-mono text-[9px] text-text-3 truncate">{data.uploadedUrl}</p>
          </div>
          <button
            onClick={() => { updateNodeData(id, { uploadedUrl: undefined, output: undefined }); setNodeStatus(id, "idle"); }}
            className="font-mono text-[9px] text-text-3 hover:text-danger mt-1"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
          className="border border-dashed border-border-2 rounded-lg p-4 text-center cursor-pointer
            hover:border-[#4da6ff] hover:bg-[#4da6ff08] transition-all group"
        >
          {data.status === "running" ? (
            <Loader2 size={20} className="mx-auto text-warning animate-spin mb-1" />
          ) : (
            <Upload size={20} className="mx-auto text-text-3 group-hover:text-[#4da6ff] mb-1 transition-colors" />
          )}
          <p className="text-[10px] text-text-3 font-mono">
            {data.status === "running" ? "Uploading…" : "Drop or click to upload"}
          </p>
          <p className="text-[9px] text-text-3 opacity-60">mp4, mov, webm, m4v</p>
        </div>
      )}

      <input ref={inputRef} type="file" accept="video/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />

      {/* Output handle */}
      <div className="flex justify-end items-center gap-1.5 pt-0.5">
        <span className="font-mono text-[10px] text-text-3">videoUrl</span>
        <Handle type="source" position={Position.Right} id="output"
          style={{ background: "#0c0c0f", border: "2px solid #4da6ff", right: -18 }} />
      </div>
    </BaseNode>
  );
});
