export function PixelBrain() {
  // Pixel art brain representation using a grid
  const brainPixels = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [1, 2, 3, 2, 2, 3, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 3, 2, 2, 3, 2, 1],
    [1, 2, 2, 3, 3, 2, 2, 1],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ]

  const colors: Record<number, string> = {
    0: "transparent",
    1: "#9a7aaa", // muted purple outline
    2: "#e8a8b8", // soft pink
    3: "#f0b8a8", // light coral
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="grid gap-0.5 p-3 bg-[#7a9a9a]/20 rounded"
        style={{
          gridTemplateColumns: "repeat(8, 1fr)",
        }}
      >
        {brainPixels.flat().map((pixel, i) => (
          <div
            key={i}
            className="w-5 h-5 md:w-6 md:h-6 rounded-sm transition-all duration-300"
            style={{
              backgroundColor: colors[pixel],
              boxShadow: pixel > 0 ? "1px 1px 0px rgba(0,0,0,0.1)" : "none",
            }}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-8 gap-0.5 opacity-40">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-5 h-0.5 md:w-6 bg-[#7a9a9a]" />
        ))}
      </div>
      <p className="font-mono text-[10px] text-[#7a9aaa] mt-1">SCAN GRID</p>
    </div>
  )
}
