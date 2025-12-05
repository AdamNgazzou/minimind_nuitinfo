import { ChatInterface } from "@/components/chat-interface";
import { Minus, Square, X } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 overflow-hidden bg-black">
      {/* Neon Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.15),transparent_60%)] animate-pulse" />

      {/* Pixel Grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
        linear-gradient(#00ffff20 1px, transparent 1px),
        linear-gradient(90deg, #00ffff20 1px, transparent 1px)
      `,
          backgroundSize: "16px 16px",
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 animate-[scan_6s_linear_infinite]"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* Your Window */}
      <div className="relative z-10 w-full max-w-xl h-[400px] flex flex-col bg-[#c0c0c0] win95-border shadow-[0_0_40px_#00ffff55]">
        <header className="flex items-center justify-between px-1 py-1 win95-titlebar">
          <span className="font-[family-name:var(--font-pixel)] text-[10px] text-white px-1 tracking-wider">
            Chat
          </span>
          <div className="flex gap-[2px]">
            <button className="w-4 h-4 bg-[#c0c0c0] win95-button flex items-center justify-center">
              <Minus className="w-2 h-2" />
            </button>
            <button className="w-4 h-4 bg-[#c0c0c0] win95-button flex items-center justify-center">
              <Square className="w-2 h-2" />
            </button>
            <button className="w-4 h-4 bg-[#c0c0c0] win95-button flex items-center justify-center">
              <X className="w-2 h-2" />
            </button>
          </div>
        </header>

        <ChatInterface />
      </div>
    </main>
  );
}
