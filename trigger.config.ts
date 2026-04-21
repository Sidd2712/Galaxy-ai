import { defineConfig } from "@trigger.dev/sdk/v3";
import { ffmpeg } from "@trigger.dev/build/extensions/core"; // 1. Import the extension

export default defineConfig({
  project: "proj_adrcwxhhajzrtwclqzfn",
  dirs: ["./src/trigger"],
  maxDuration: 300,
  build: {
    // 2. Add it to the extensions array
    extensions: [ffmpeg()], 
  },
});