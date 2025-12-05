"use client"

import { useState } from "react"
import { PixelBrain } from "./pixel-brain"
import { CNNLayers } from "./cnn-layers"
import { DiagnosticOutput } from "./diagnostic-output"

export function BrainOMatic() {
  const [result, setResult] = useState<"healthy" | "risk" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const runDiagnostic = () => {
    setIsProcessing(true)
    setResult(null)

    setTimeout(() => {
      setResult(Math.random() > 0.3 ? "healthy" : "risk")
      setIsProcessing(false)
    }, 2000)
  }

  return (
    <div className="w-full max-w-5xl">
      {/* Title */}
      <div className="text-center mb-8">
        <h1
          className="font-mono text-2xl md:text-3xl font-bold text-[#5a7a8a] tracking-wide"
          style={{ textShadow: "2px 2px 0px rgba(176, 154, 214, 0.3)" }}
        >
          BRAIN-O-MATIC 5000
        </h1>
        <p className="font-mono text-sm text-[#7a9aaa] mt-1">— Diagnostic Flow —</p>
      </div>

      {/* Main Diagram */}
      <div
        className="bg-[#d4e8f0] rounded-lg p-6 border-4 border-[#a8c8d8]"
        style={{ boxShadow: "4px 4px 0px #9ab8c8" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left Panel - Input */}
          <div className="flex flex-col items-center">
            <div className="bg-[#c8dce8] rounded-lg p-4 border-2 border-[#98b8c8] w-full">
              <p className="font-mono text-xs text-[#6a8a9a] text-center mb-3 uppercase tracking-wider">
                Input: Brain Scan
              </p>
              <PixelBrain />
            </div>
            <button
              onClick={runDiagnostic}
              disabled={isProcessing}
              className="mt-4 font-mono text-sm bg-[#8ecf9f] hover:bg-[#7ebf8f] text-[#3a5a4a] 
                         px-4 py-2 rounded border-2 border-[#6eaf7f] transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: "2px 2px 0px #5e9f6f" }}
            >
              {isProcessing ? "Analyzing..." : "Run Diagnostic"}
            </button>
          </div>

          {/* Middle Panel - CNN Layers */}
          <div className="flex flex-col items-center">
            <p className="font-mono text-xs text-[#6a8a9a] text-center mb-3 uppercase tracking-wider">CNN Processing</p>
            <CNNLayers isProcessing={isProcessing} />
          </div>

          {/* Right Panel - Output */}
          <div className="flex flex-col items-center">
            <div className="bg-[#c8dce8] rounded-lg p-4 border-2 border-[#98b8c8] w-full">
              <p className="font-mono text-xs text-[#6a8a9a] text-center mb-3 uppercase tracking-wider">
                Diagnostic Output
              </p>
              <DiagnosticOutput result={result} isProcessing={isProcessing} />
            </div>
          </div>
        </div>

        {/* Flow Arrows for mobile */}
        <div className="flex md:hidden justify-center my-4">
          <div className="font-mono text-[#7a9aaa] text-2xl">↓ → ↓</div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 font-mono text-xs text-[#6a8a9a]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#d96f6f] rounded border border-[#c95f5f]"></div>
          <span>Feature Finder</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#e8a77a] rounded border border-[#d8976a]"></div>
          <span>Signal Cleaner</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#8ecf9f] rounded border border-[#7ebf8f]"></div>
          <span>Decision Trigger</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#7fb7da] rounded border border-[#6fa7ca]"></div>
          <span>Final Analysis</span>
        </div>
      </div>
    </div>
  )
}
