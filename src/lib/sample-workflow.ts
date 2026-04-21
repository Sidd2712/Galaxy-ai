// src/lib/sample-workflow.ts
// Builds the pre-loaded "Product Marketing Kit Generator" sample workflow
// that demonstrates all 6 node types + parallel execution + convergence.
// Call loadSampleWorkflow() from the canvas to hydrate the store.

import type { FlowNode, FlowEdge } from "@/types";

export function buildSampleWorkflow(): { nodes: FlowNode[]; edges: FlowEdge[] } {
  // ── Branch A: Image Processing + Product Description ─────────────
  const imgNode: FlowNode = {
    id: "sample-img",
    type: "image",
    position: { x: 40, y: 60 },
    data: { type: "image", label: "Upload Image", status: "idle" },
  };

  const cropNode: FlowNode = {
    id: "sample-crop",
    type: "crop",
    position: { x: 340, y: 60 },
    data: {
      type: "crop",
      label: "Crop Image",
      xPercent: 10,
      yPercent: 10,
      widthPercent: 80,
      heightPercent: 80,
      status: "idle",
    },
  };

  const sysPromptNode: FlowNode = {
    id: "sample-sys1",
    type: "text",
    position: { x: 40, y: 310 },
    data: {
      type: "text",
      label: "Text Node",
      content:
        "You are a professional marketing copywriter. Generate a compelling one-paragraph product description.",
      status: "idle",
    },
  };

  const productDetailsNode: FlowNode = {
    id: "sample-txt1",
    type: "text",
    position: { x: 340, y: 310 },
    data: {
      type: "text",
      label: "Text Node",
      content:
        "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.",
      status: "idle",
    },
  };

  const llm1Node: FlowNode = {
    id: "sample-llm1",
    type: "llm",
    position: { x: 660, y: 160 },
    data: { type: "llm", label: "Run LLM", model: "gemini-1.5-pro", status: "idle" },
  };

  // ── Branch B: Video Frame Extraction ─────────────────────────────
  const vidNode: FlowNode = {
    id: "sample-vid",
    type: "video",
    position: { x: 40, y: 560 },
    data: { type: "video", label: "Upload Video", status: "idle" },
  };

  const extractNode: FlowNode = {
    id: "sample-extract",
    type: "extract",
    position: { x: 340, y: 560 },
    data: { type: "extract", label: "Extract Frame", timestamp: "50%", status: "idle" },
  };

  // ── Convergence: Final Marketing Summary ─────────────────────────
  const sysPrompt2Node: FlowNode = {
    id: "sample-sys2",
    type: "text",
    position: { x: 660, y: 500 },
    data: {
      type: "text",
      label: "Text Node",
      content:
        "You are a social media manager. Create a tweet-length marketing post based on the product image and video frame.",
      status: "idle",
    },
  };

  const llm2Node: FlowNode = {
    id: "sample-llm2",
    type: "llm",
    position: { x: 980, y: 320 },
    data: { type: "llm", label: "Run LLM", model: "gemini-1.5-flash", status: "idle" },
  };

  // ── Edges ──────────────────────────────────────────────────────────
  const edges: FlowEdge[] = [
    // Branch A wiring
    {
      id: "e-img-crop",
      source: "sample-img", sourceHandle: "output",
      target: "sample-crop", targetHandle: "image_url",
      animated: true, className: "animated-edge",
      style: { stroke: "#ff8c42" },
    },
    {
      id: "e-sys1-llm1",
      source: "sample-sys1", sourceHandle: "output",
      target: "sample-llm1", targetHandle: "system_prompt",
      animated: true, className: "animated-edge",
      style: { stroke: "#7c6af7" },
    },
    {
      id: "e-txt1-llm1",
      source: "sample-txt1", sourceHandle: "output",
      target: "sample-llm1", targetHandle: "user_message",
      animated: true, className: "animated-edge",
      style: { stroke: "#7c6af7" },
    },
    {
      id: "e-crop-llm1",
      source: "sample-crop", sourceHandle: "output",
      target: "sample-llm1", targetHandle: "images",
      animated: true, className: "animated-edge",
      style: { stroke: "#ff8c42" },
    },

    // Branch B wiring
    {
      id: "e-vid-extract",
      source: "sample-vid", sourceHandle: "output",
      target: "sample-extract", targetHandle: "video_url",
      animated: true, className: "animated-edge",
      style: { stroke: "#4da6ff" },
    },

    // Convergence wiring
    {
      id: "e-sys2-llm2",
      source: "sample-sys2", sourceHandle: "output",
      target: "sample-llm2", targetHandle: "system_prompt",
      animated: true, className: "animated-edge",
      style: { stroke: "#7c6af7" },
    },
    {
      id: "e-llm1-llm2",
      source: "sample-llm1", sourceHandle: "output",
      target: "sample-llm2", targetHandle: "user_message",
      animated: true, className: "animated-edge",
      style: { stroke: "#7c6af7" },
    },
    {
      id: "e-crop-llm2",
      source: "sample-crop", sourceHandle: "output",
      target: "sample-llm2", targetHandle: "images",
      animated: true, className: "animated-edge",
      style: { stroke: "#ff8c42" },
    },
  ];

  return {
    nodes: [
      imgNode, cropNode, sysPromptNode, productDetailsNode, llm1Node,
      vidNode, extractNode, sysPrompt2Node, llm2Node,
    ],
    edges,
  };
}
