// src/lib/node-definitions.ts
import type { NodeDef } from "@/types";

export const NODE_DEFS: Record<string, NodeDef> = {
  text: {
    type: "text",
    label: "Text Node",
    icon: "Type",
    color: "#7c6af7",
    inputs: [],
    outputs: [{ id: "output", label: "output", dataType: "text" }],
  },
  image: {
    type: "image",
    label: "Upload Image",
    icon: "Image",
    color: "#ff8c42",
    inputs: [],
    outputs: [{ id: "output", label: "image_url", dataType: "image" }],
  },
  video: {
    type: "video",
    label: "Upload Video",
    icon: "Video",
    color: "#4da6ff",
    inputs: [],
    outputs: [{ id: "output", label: "video_url", dataType: "video" }],
  },
  llm: {
    type: "llm",
    label: "Run LLM",
    icon: "Zap",
    color: "#3ddc97",
    inputs: [
      { id: "system_prompt", label: "system_prompt", dataType: "text" },
      { id: "user_message", label: "user_message", dataType: "text" },
      { id: "images", label: "images", dataType: "image" },
    ],
    outputs: [{ id: "output", label: "output", dataType: "text" }],
  },
  crop: {
    type: "crop",
    label: "Crop Image",
    icon: "Crop",
    color: "#f5c842",
    inputs: [
      { id: "image_url", label: "image_url", dataType: "image" },
      { id: "x_percent", label: "x_percent", dataType: "text" },
      { id: "y_percent", label: "y_percent", dataType: "text" },
      { id: "width_percent", label: "width_percent", dataType: "text" },
      { id: "height_percent", label: "height_percent", dataType: "text" },
    ],
    outputs: [{ id: "output", label: "output", dataType: "image" }],
  },
  extract: {
    type: "extract",
    label: "Extract Frame",
    icon: "Film",
    color: "#ff6eb4",
    inputs: [
      { id: "videoUrl", label: "video_url", dataType: "video" },
      { id: "timestamp", label: "timestamp", dataType: "text" },
    ],
    outputs: [{ id: "output", label: "output", dataType: "image" }],
  },
};

// Color per handle data type
export const HANDLE_COLORS: Record<string, string> = {
  text: "#7c6af7",
  image: "#ff8c42",
  video: "#4da6ff",
};
