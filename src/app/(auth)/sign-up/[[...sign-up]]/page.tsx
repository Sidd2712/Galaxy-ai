// src/app/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #2a2a38 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="font-display font-black text-3xl bg-gradient-to-br from-accent-2 to-[#6ef0d8] bg-clip-text text-transparent mb-2">
            NextFlow
          </h1>
          <p className="text-text-3 text-sm font-mono">LLM Workflow Builder</p>
        </div>
        <SignUp
          appearance={{
            variables: {
              colorBackground: "#1a1a23",
              colorText: "#e8e8f0",
              colorTextSecondary: "#9898b0",
              colorInputBackground: "#111116",
              colorInputText: "#e8e8f0",
              colorPrimary: "#7c6af7",
              borderRadius: "8px",
            },
          }}
        />
      </div>
    </div>
  );
}
