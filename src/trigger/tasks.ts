import { task, logger } from "@trigger.dev/sdk/v3";
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

// ─── LLM Task (Google Gemini) ─────────────────────────────────────
export const llmTask = task({
  id: "llm-execute",
  maxDuration: 120,
  run: async (payload: {
    model: string;
    systemPrompt?: string;
    userMessage: string;
    imageUrls?: string[];
    nodeRunId: string;
  }) => {
    logger.info("LLM task started", { model: payload.model, nodeRunId: payload.nodeRunId });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
    // Build content parts
    const parts: Part[] = [];

    // Add image parts if provided
    if (payload.imageUrls?.length) {
      for (const url of payload.imageUrls) {
        try {
          const resp = await fetch(url);
          const buffer = await resp.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const mimeType = resp.headers.get("content-type") ?? "image/jpeg";
          parts.push({ inlineData: { data: base64, mimeType } });
        } catch (err) {
          logger.warn("Failed to fetch image", { url, err });
        }
      }
    }

    // Add user message
    parts.push({ text: payload.userMessage });

    const systemInstruction = payload.systemPrompt?.trim() ? payload.systemPrompt : undefined;

    const modelInstance = genAI.getGenerativeModel({
      model: payload.model,
      ...(systemInstruction ? { systemInstruction } : {}),
    });

    const result = await modelInstance.generateContent({ contents: [{ role: "user", parts }] });
    const text = result.response.text();

    logger.info("LLM task completed", { chars: text.length });
    return { output: text };
  },
});

// ─── Crop Image Task ──────────────────────────────────────────────
export const cropImageTask = task({
  id: "crop-image",
  maxDuration: 60,
  run: async (payload: {
    imageUrl: string;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
    nodeRunId: string;
    transloaditKey: string;
    transloaditSecret: string;
  }) => {
    logger.info("Crop image task started", { nodeRunId: payload.nodeRunId });

    const imgResp = await fetch(payload.imageUrl);
    if (!imgResp.ok) throw new Error("Failed to fetch source image");
    const imageBytes = await imgResp.arrayBuffer();

    const params = {
      auth: { key: payload.transloaditKey },
      steps: {
        cropped: {
          robot: "/image/resize",
          use: ":original",
          result: true,
          resize_strategy: "crop",
          // Correct math: x2 = x1 + width
          crop_x1: payload.xPercent / 100,
          crop_y1: payload.yPercent / 100,
          crop_x2: (payload.xPercent + payload.widthPercent) / 100,
          crop_y2: (payload.yPercent + payload.heightPercent) / 100,
        }
      }
    };

    const formData = new FormData();
    formData.append("params", JSON.stringify(params));
    formData.append("file", new Blob([imageBytes]), "source.jpg");

    const assemblyResp = await fetch("https://api2.transloadit.com/assemblies", {
      method: "POST",
      body: formData,
    });

    if (!assemblyResp.ok) {
      const errorDetail = await assemblyResp.text();
      throw new Error(`Transloadit Start Error: ${assemblyResp.status} - ${errorDetail}`);
    }

    let finalAssembly = await assemblyResp.json();
    let attempts = 0;

    while (
      finalAssembly.ok !== "ASSEMBLY_COMPLETED" &&
      finalAssembly.ok !== "ASSEMBLY_FAILED" &&
      attempts < 30
    ) {
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await fetch(finalAssembly.assembly_ssl_url);
      finalAssembly = await poll.json();
      attempts++;
    }

    if (finalAssembly.ok !== "ASSEMBLY_COMPLETED") {
      throw new Error(`Crop Failed: ${finalAssembly.message || "Unknown error"}`);
    }

    const outputUrl = finalAssembly.results?.cropped?.[0]?.ssl_url;
    if (!outputUrl) throw new Error("No output URL from Transloadit");

    return { output: outputUrl };
  },
});

// ─── Extract Frame Task ──────────────────────────────────────────
export const extractFrameTask = task({
  id: "extract-frame",
  maxDuration: 90,
  run: async (payload: {
    videoUrl: string;
    timestamp: string;
    nodeRunId: string;
    transloaditKey: string;
    transloaditSecret: string;
  }) => {
    logger.info("Extract frame task started", { nodeRunId: payload.nodeRunId });

    const videoResp = await fetch(payload.videoUrl);
    if (!videoResp.ok) throw new Error("Failed to fetch source video");
    const videoBytes = await videoResp.arrayBuffer();

    const formData = new FormData();
    formData.append(
      "params",
      JSON.stringify({
        auth: { key: payload.transloaditKey },
        steps: {
          frame: {
            robot: "/video/thumbs",
            use: ":original",
            count: 1,
            // Handle percentage or seconds
            offsets: payload.timestamp.endsWith("%")
              ? [payload.timestamp]
              : [formatTimestamp(parseFloat(payload.timestamp))],
            ffmpeg_stack: "v6.0.0",
            result: true,
          },
        },
      })
    );
    formData.append("file", new Blob([videoBytes]), "source.mp4");

    const assemblyResp = await fetch("https://api2.transloadit.com/assemblies", {
      method: "POST",
      body: formData,
    });

    if (!assemblyResp.ok) {
      const errorDetail = await assemblyResp.text();
      throw new Error(`Transloadit Video Error: ${assemblyResp.status} - ${errorDetail}`);
    }

    let finalAssembly = await assemblyResp.json();
    let attempts = 0;

    while (
      finalAssembly.ok !== "ASSEMBLY_COMPLETED" &&
      finalAssembly.ok !== "ASSEMBLY_FAILED" &&
      attempts < 30
    ) {
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await fetch(finalAssembly.assembly_ssl_url);
      finalAssembly = await poll.json();
      attempts++;
    }

    if (finalAssembly.ok !== "ASSEMBLY_COMPLETED") {
      throw new Error(`Frame Extraction Failed: ${finalAssembly.message || "Unknown error"}`);
    }

    const outputUrl = finalAssembly.results?.frame?.[0]?.ssl_url;
    if (!outputUrl) throw new Error("No frame URL from Transloadit");

    return { output: outputUrl };
  },
});

function formatTimestamp(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}