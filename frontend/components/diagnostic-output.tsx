interface DiagnosticOutputProps {
  result: "healthy" | "risk" | null
  isProcessing: boolean
}

export function DiagnosticOutput({ result, isProcessing }: DiagnosticOutputProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Healthy Result */}
      <div
        className={`
          w-full p-3 rounded border-2 transition-all duration-300
          ${
            result === "healthy"
              ? "bg-[#c8e8a8] border-[#a8c888] scale-105"
              : "bg-[#e8e8d8] border-[#c8c8b8] opacity-50"
          }
        `}
      >
        <div className="flex items-center gap-3">
          {/* Pixel face - happy */}
          <div className="grid grid-cols-5 gap-0.5">
            {[0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0].map((pixel, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-sm"
                style={{
                  backgroundColor: pixel ? "#5a8a5a" : "transparent",
                }}
              />
            ))}
          </div>
          <div>
            <p className="font-mono text-xs font-bold text-[#4a7a4a]">No Cancer</p>
            <p className="font-mono text-[10px] text-[#6a9a6a]">Healthy Result</p>
          </div>
        </div>
      </div>

      {/* Risk Result */}
      <div
        className={`
          w-full p-3 rounded border-2 transition-all duration-300
          ${result === "risk" ? "bg-[#f0c8a8] border-[#d8a888] scale-105" : "bg-[#e8e8d8] border-[#c8c8b8] opacity-50"}
        `}
      >
        <div className="flex items-center gap-3">
          {/* Pixel face - concerned */}
          <div className="grid grid-cols-5 gap-0.5">
            {[0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0].map((pixel, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-sm"
                style={{
                  backgroundColor: pixel ? "#9a5a4a" : "transparent",
                }}
              />
            ))}
          </div>
          <div>
            <p className="font-mono text-xs font-bold text-[#8a4a3a]">Cancer Detected</p>
            <p className="font-mono text-[10px] text-[#aa6a5a]">Risk Detected</p>
          </div>
        </div>
      </div>

      {/* Processing indicator */}
      {isProcessing && <div className="font-mono text-xs text-[#7a9aaa] animate-pulse">Processing scan...</div>}

      {/* Waiting state */}
      {!result && !isProcessing && <div className="font-mono text-xs text-[#9ab8c8]">Awaiting input...</div>}
    </div>
  )
}
