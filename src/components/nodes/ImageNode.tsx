"use client";
// src/components/nodes/ImageNode.tsx
import { memo, useRef } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Image, Upload, Loader2 } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { useWorkflowStore } from "@/store/workflow-store";
import type { ImageNodeData } from "@/types";

export const ImageNode = memo(function ImageNode({ id, data, selected }: NodeProps<ImageNodeData>) {
  const { updateNodeData, setNodeStatus } = useWorkflowStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.match(/^image\//)) {
      alert("Please upload an image file (jpg, png, webp, gif)");
      return;
    }

    setNodeStatus(id, "running");

    try {
      // Get signed params from our API
      const paramsRes = await fetch("/api/upload/params", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileType: "image", fileName: file.name, mimeType: file.type }),
      });
      const { params, signature, key } = await paramsRes.json();

      // Build Transloadit form
      const formData = new FormData();
      formData.append("params", params);
      formData.append("signature", signature);
      formData.append("file", file);

      const assemblyRes = await fetch("https://api2.transloadit.com/assemblies", {
        method: "POST",
        body: formData,
      });
      const assembly = await assemblyRes.json();

      // Poll for completion
      let final = assembly;
      while (final.ok !== "ASSEMBLY_COMPLETED" && final.ok !== "ASSEMBLY_FAILED") {
        await new Promise((r) => setTimeout(r, 1500));
        const poll = await fetch(`https://api2.transloadit.com/assemblies/${assembly.assembly_id}`);
        final = await poll.json();
      }

      if (final.ok !== "ASSEMBLY_COMPLETED") throw new Error("Upload failed");

      // Get the uploaded URL (from first result step)
      const resultSteps = Object.values(final.results ?? {}) as any[][];
      const uploadedUrl = resultSteps[0]?.[0]?.ssl_url ?? resultSteps[0]?.[0]?.url;

      if (!uploadedUrl) throw new Error("No URL in Transloadit result");

      updateNodeData(id, {
        uploadedUrl,
        previewUrl: uploadedUrl,
        output: uploadedUrl,
      });
      setNodeStatus(id, "done", uploadedUrl);
    } catch (err: any) {
      console.error("Upload error:", err);
      setNodeStatus(id, "error");
    }
  };

  return (
    <BaseNode id={id} status={data.status} icon={<Image size={12} />}
      title="Upload Image" accentColor="#ff8c42" selected={selected}>

      {/* Upload zone */}
      {data.previewUrl ? (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.previewUrl}
            alt="preview"
            className="w-full h-20 object-cover rounded-md border border-border"
          />
          <p className="font-mono text-[10px] text-success mt-1.5">✓ Uploaded via Transloadit</p>
          <button
            onClick={() => { updateNodeData(id, { previewUrl: undefined, uploadedUrl: undefined, output: undefined }); setNodeStatus(id, "idle"); }}
            className="font-mono text-[9px] text-text-3 hover:text-danger mt-0.5"
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
            hover:border-[#ff8c42] hover:bg-[#ff8c4208] transition-all group"
        >
          {data.status === "running" ? (
            <Loader2 size={20} className="mx-auto text-warning animate-spin mb-1" />
          ) : (
            <Upload size={20} className="mx-auto text-text-3 group-hover:text-[#ff8c42] mb-1 transition-colors" />
          )}
          <p className="text-[10px] text-text-3 font-mono">
            {data.status === "running" ? "Uploading…" : "Drop or click to upload"}
          </p>
          <p className="text-[9px] text-text-3 opacity-60">jpg, png, webp, gif</p>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />

      {/* Output handle */}
      <div className="flex justify-end items-center gap-1.5 pt-0.5">
        <span className="font-mono text-[10px] text-text-3">image_url</span>
        <Handle type="source" position={Position.Right} id="output"
          style={{ background: "#0c0c0f", border: "2px solid #ff8c42", right: -18 }} />
      </div>
    </BaseNode>
  );
});
