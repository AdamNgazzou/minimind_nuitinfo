interface CNNLayersProps {
  isProcessing: boolean
}

export function CNNLayers({ isProcessing }: CNNLayersProps) {
  const layers = [
    { name: "Feature Finder", color: "#d96f6f", borderColor: "#c95f5f" },
    { name: "Signal Cleaner", color: "#e8a77a", borderColor: "#d8976a" },
    { name: "Decision Trigger", color: "#8ecf9f", borderColor: "#7ebf8f" },
    { name: "Final Analysis", color: "#7fb7da", borderColor: "#6fa7ca" },
  ]

  return (
    <div className="flex flex-col items-center gap-2">
      {layers.map((layer, index) => (
        <div key={layer.name} className="flex flex-col items-center">
          {/* Layer block */}
          <div
            className={`
              w-36 md:w-44 h-12 rounded flex items-center justify-center
              font-mono text-xs text-white/90 border-2 transition-all duration-300
              ${isProcessing ? "animate-pulse" : ""}
            `}
            style={{
              backgroundColor: layer.color,
              borderColor: layer.borderColor,
              boxShadow: "2px 2px 0px rgba(0,0,0,0.15)",
              animationDelay: isProcessing ? `${index * 200}ms` : "0ms",
            }}
          >
            {layer.name}
          </div>

          {/* Arrow between layers */}
          {index < layers.length - 1 && <div className="text-[#98b8c8] font-mono text-lg my-1">↓</div>}
        </div>
      ))}
    </div>
  )
}
