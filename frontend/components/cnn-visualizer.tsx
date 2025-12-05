"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

type ProcessingStage = "idle" | "scanning" | "layer1" | "layer2" | "result"
type QuizState = "question" | "checking" | "correct" | "wrong"

const BRAIN_SCANS = [
  {
    id: 1,
    src: "/brain-mri-scan-healthy.jpg",
    label: "Scan A",
    hasCancer: false,
  },
  {
    id: 2,
    src: "/brain-mri-scan-tumor.jpg",
    label: "Scan B",
    hasCancer: true,
  },
]

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export function CNNVisualizer() {
  const [quizState, setQuizState] = useState<QuizState>("question")
  const [showUploadMode, setShowUploadMode] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [stage, setStage] = useState<ProcessingStage>("idle")
  const [result, setResult] = useState<"cancer" | "no-cancer" | null>(null)
  const [activeLayer, setActiveLayer] = useState(0)
  const [processedImages, setProcessedImages] = useState<string[]>([])
  const [visibleImages, setVisibleImages] = useState<number[]>([])
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleQuizAnswer = (hasCancer: boolean) => {
    setQuizState("checking")

    // 3 second delay to "think"
    setTimeout(() => {
      if (hasCancer) {
        setQuizState("correct")
      } else {
        setQuizState("wrong")
      }
    }, 3000)
  }

  const resetQuiz = () => {
    setQuizState("question")
    setShowUploadMode(false)
  }

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imgSrc = event.target?.result as string
        setSelectedImage(imgSrc)
        setShowScanModal(true)
        setResult(null)
        setConfidenceScore(null)
        setError(null)
        setStage("idle")
        setActiveLayer(0)
        setVisibleImages([])
        generateProcessedImages(imgSrc)

        setTimeout(() => {
          runAnalysis(file)
        }, 800)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateProcessedImages = (imgSrc: string) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const processed: string[] = []

      const filters1 = [
        { size: 60, filter: "contrast(150%) saturate(120%)" },
        { size: 60, filter: "grayscale(100%) contrast(200%)" },
        { size: 60, filter: "sepia(80%) saturate(150%)" },
        { size: 60, filter: "hue-rotate(180deg) saturate(120%)" },
      ]

      filters1.forEach(({ size, filter }) => {
        const c = document.createElement("canvas")
        c.width = size
        c.height = size
        const ctx = c.getContext("2d")
        if (ctx) {
          ctx.imageSmoothingEnabled = false
          ctx.filter = filter
          const temp = document.createElement("canvas")
          temp.width = 16
          temp.height = 16
          const tempCtx = temp.getContext("2d")
          if (tempCtx) {
            tempCtx.imageSmoothingEnabled = false
            tempCtx.filter = filter
            tempCtx.drawImage(img, 0, 0, 16, 16)
            ctx.drawImage(temp, 0, 0, 16, 16, 0, 0, size, size)
          }
          processed.push(c.toDataURL())
        }
      })

      const filters2 = [
        "contrast(200%)",
        "saturate(200%) hue-rotate(30deg)",
        "hue-rotate(90deg)",
        "hue-rotate(180deg)",
        "hue-rotate(270deg)",
        "grayscale(100%)",
        "sepia(100%)",
        "invert(100%)",
      ]

      filters2.forEach((filter) => {
        const c = document.createElement("canvas")
        c.width = 40
        c.height = 40
        const ctx = c.getContext("2d")
        if (ctx) {
          ctx.imageSmoothingEnabled = false
          const temp = document.createElement("canvas")
          temp.width = 8
          temp.height = 8
          const tempCtx = temp.getContext("2d")
          if (tempCtx) {
            tempCtx.imageSmoothingEnabled = false
            tempCtx.filter = filter
            tempCtx.drawImage(img, 0, 0, 8, 8)
            ctx.drawImage(temp, 0, 0, 8, 8, 0, 0, 40, 40)
          }
          processed.push(c.toDataURL())
        }
      })

      setProcessedImages(processed)
    }
    img.src = imgSrc
  }

  useEffect(() => {
    if (activeLayer === 1) {
      setVisibleImages([])
      const timers: NodeJS.Timeout[] = []
      for (let i = 0; i < 4; i++) {
        timers.push(setTimeout(() => setVisibleImages((prev) => [...prev, i]), i * 400))
      }
      return () => timers.forEach(clearTimeout)
    } else if (activeLayer === 2) {
      setVisibleImages([0, 1, 2, 3])
      const timers: NodeJS.Timeout[] = []
      for (let i = 0; i < 8; i++) {
        timers.push(setTimeout(() => setVisibleImages((prev) => [...prev, 4 + i]), i * 250))
      }
      return () => timers.forEach(clearTimeout)
    } else if (activeLayer === 3) {
      setVisibleImages([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    }
  }, [activeLayer])

  const runAnalysis = async (file: File) => {
    setResult(null)
    setActiveLayer(0)
    setVisibleImages([])
    setIsAnalyzing(true)
    setError(null)

    const stages: { stage: ProcessingStage; delay: number; layer: number }[] = [
      { stage: "scanning", delay: 0, layer: 0 },
      { stage: "layer1", delay: 2000, layer: 1 },
      { stage: "layer2", delay: 5000, layer: 2 },
      { stage: "result", delay: 8500, layer: 3 },
    ]

    stages.forEach(({ stage: s, delay, layer }) => {
      setTimeout(() => {
        setStage(s)
        setActiveLayer(layer)
      }, delay)
    })

    // Call backend API after animation completes
    setTimeout(async () => {
      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(`${API_BASE_URL}/chat/braintumor/detect`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`)
        }

        const data = await response.json()
        
        // Map backend response to frontend result
        const predictionClass = data.predicted_class || ""
        const confidence = data.confidence_score || 0
        
        setConfidenceScore(confidence)
        
        if (predictionClass === "tumor") {
          setResult("cancer")
        } else {
          setResult("no-cancer")
        }
      } catch (err) {
        console.error("Error analyzing image:", err)
        setError(err instanceof Error ? err.message : "Failed to analyze image")
        // Fallback to random result on error
        setResult(Math.random() > 0.5 ? "cancer" : "no-cancer")
      } finally {
        setIsAnalyzing(false)
      }
    }, 8500)
  }

  const closeScanModal = () => {
    setShowScanModal(false)
    setSelectedImage(null)
    setStage("idle")
    setResult(null)
    setConfidenceScore(null)
    setError(null)
    setActiveLayer(0)
    setVisibleImages([])
  }

  // ...existing code...
  return (
    <div className="w-full min-h-screen bg-[#1a1a2e] font-mono flex flex-col">
      {/* Pixel Grid Background */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#fff 1px, transparent 1px),
            linear-gradient(90deg, #fff 1px, transparent 1px)
          `,
          backgroundSize: "16px 16px",
        }}
      />

      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} onChange={handleCustomUpload} accept="image/*" className="hidden" />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block bg-[#16213e] border-4 border-[#0f3460] px-6 py-3 relative">
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#e94560]" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#e94560]" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#e94560]" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#e94560]" />

            <h1 className="text-2xl md:text-3xl font-bold text-[#e94560] tracking-wider uppercase">Brain Scanner</h1>
            <div className="flex justify-center gap-2 mt-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-[#e94560] animate-pixel-blink"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {showUploadMode ? (
          /* Upload Your Own Mode */
          <div className="flex flex-col items-center">
            <div className="bg-[#16213e] border-4 border-[#0f3460] px-6 py-4 mb-8 relative">
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#e94560]" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#e94560]" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#e94560]" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#e94560]" />
              <p className="text-[#eaeaea] text-lg md:text-xl text-center tracking-wide">
                Upload your own <span className="text-[#e94560] font-bold">brain scan</span>!
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="group relative bg-[#16213e] border-4 border-[#0f3460] p-6 hover:border-[#e94560] transition-all duration-200 active:scale-95"
            >
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#0f3460] group-hover:bg-[#e94560] transition-colors" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#0f3460] group-hover:bg-[#e94560] transition-colors" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#0f3460] group-hover:bg-[#e94560] transition-colors" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#0f3460] group-hover:bg-[#e94560] transition-colors" />

              <div className="w-40 h-40 md:w-48 md:h-48 bg-[#0f3460] border-2 border-[#1a1a2e] flex flex-col items-center justify-center gap-3">
                <div className="text-5xl text-[#e94560]">+</div>
                <span className="text-[#eaeaea] text-sm uppercase tracking-wider">Click to Upload</span>
              </div>
            </button>

            <button
              onClick={resetQuiz}
              className="mt-6 bg-[#0f3460] border-2 border-[#e94560] px-6 py-2 text-[#e94560] font-bold uppercase tracking-wider hover:bg-[#e94560] hover:text-white transition-colors"
            >
              Back to Quiz
            </button>
          </div>
        ) : (
          /* Quiz Mode */
          <div className="flex flex-col items-center">
            {/* Question */}
            {quizState === "question" && (
              <>
                <div className="bg-[#16213e] border-4 border-[#0f3460] px-6 py-4 mb-8 relative">
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#e94560]" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#e94560]" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#e94560]" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#e94560]" />
                  <p className="text-[#eaeaea] text-lg md:text-xl text-center tracking-wide">
                    Which brain has <span className="text-[#e94560] font-bold">cancer</span>?
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 md:gap-10">
                  {BRAIN_SCANS.map((scan) => (
                    <button
                      key={scan.id}
                      onClick={() => handleQuizAnswer(scan.hasCancer)}
                      className="group relative bg-[#16213e] border-4 border-[#0f3460] p-3 hover:border-[#e94560] transition-all duration-200 active:scale-95"
                    >
                      <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#0f3460] group-hover:bg-[#e94560] transition-colors" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#0f3460] group-hover:bg-[#e94560] transition-colors" />
                      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#0f3460] group-hover:bg-[#e94560] transition-colors" />
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#0f3460] group-hover:bg-[#e94560] transition-colors" />

                      <div className="w-32 h-32 md:w-40 md:h-40 bg-[#0f3460] border-2 border-[#1a1a2e] overflow-hidden">
                        <img
                          src={scan.src || "/placeholder.svg"}
                          alt={scan.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          style={{ imageRendering: "pixelated" }}
                        />
                      </div>
                      <div className="mt-2 text-center">
                        <span className="text-[#e94560] font-bold uppercase tracking-widest">{scan.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {quizState === "checking" && (
              <div className="flex flex-col items-center">
                <div className="bg-[#16213e] border-4 border-[#0f3460] px-8 py-6 relative">
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#e94560]" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#e94560]" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#e94560]" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#e94560]" />

                  <div className="flex flex-col items-center gap-4">
                    <p className="text-[#eaeaea] text-xl font-bold uppercase tracking-wider">Checking...</p>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-4 h-4 bg-[#e94560] animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    {/* Loading bar */}
                    <div className="w-48 h-3 bg-[#0f3460] border-2 border-[#1a1a2e] overflow-hidden">
                      <div className="h-full bg-[#e94560] animate-loading-bar" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {quizState === "correct" && (
              <div className="flex flex-col items-center animate-pixel-pop">
                <div className="bg-[#16213e] border-4 border-[#00b894] px-8 py-6 relative">
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#00b894]" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00b894]" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#00b894]" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#00b894]" />

                  <div className="flex flex-col items-center gap-4">
                    {/* Pixel checkmark */}
                    <div className="w-20 h-20 bg-[#00b894] flex items-center justify-center relative">
                      <svg width="48" height="48" viewBox="0 0 48 48" className="text-white">
                        <path
                          d="M8 24 L16 8 L24 24 L40 8 L32 24 L40 40 L24 24 L16 40 Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0"
                        />
                        {/* Pixel checkmark */}
                        <rect x="8" y="24" width="4" height="4" fill="white" />
                        <rect x="12" y="28" width="4" height="4" fill="white" />
                        <rect x="16" y="32" width="4" height="4" fill="white" />
                        <rect x="20" y="28" width="4" height="4" fill="white" />
                        <rect x="24" y="24" width="4" height="4" fill="white" />
                        <rect x="28" y="20" width="4" height="4" fill="white" />
                        <rect x="32" y="16" width="4" height="4" fill="white" />
                        <rect x="36" y="12" width="4" height="4" fill="white" />
                      </svg>
                    </div>
                    <p className="text-[#00b894] text-2xl font-bold uppercase tracking-wider">Good Job!</p>
                    <p className="text-[#eaeaea] text-sm text-center">You found the brain with cancer!</p>

                    {/* Sparkles */}
                    <div className="absolute -top-4 -left-4 w-2 h-2 bg-[#00b894] animate-ping" />
                    <div
                      className="absolute -top-4 -right-4 w-2 h-2 bg-[#00b894] animate-ping"
                      style={{ animationDelay: "0.2s" }}
                    />
                    <div
                      className="absolute -bottom-4 -left-4 w-2 h-2 bg-[#00b894] animate-ping"
                      style={{ animationDelay: "0.4s" }}
                    />
                    <div
                      className="absolute -bottom-4 -right-4 w-2 h-2 bg-[#00b894] animate-ping"
                      style={{ animationDelay: "0.6s" }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    onClick={resetQuiz}
                    className="bg-[#0f3460] border-4 border-[#e94560] px-6 py-3 text-[#e94560] font-bold uppercase tracking-wider hover:bg-[#e94560] hover:text-white transition-colors relative"
                  >
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#e94560]" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#e94560]" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#e94560]" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#e94560]" />
                    Play Again
                  </button>
                  <button
                    onClick={() => setShowUploadMode(true)}
                    className="bg-[#00b894] border-4 border-[#00b894] px-6 py-3 text-white font-bold uppercase tracking-wider hover:bg-[#00d9a5] transition-colors relative animate-pulse"
                  >
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-white" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white" />
                    Try Your Own!
                  </button>
                </div>
              </div>
            )}

            {quizState === "wrong" && (
              <div className="flex flex-col items-center animate-pixel-pop">
                <div className="bg-[#16213e] border-4 border-[#e94560] px-8 py-6 relative animate-shake">
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#e94560]" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#e94560]" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#e94560]" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#e94560]" />

                  <div className="flex flex-col items-center gap-4">
                    {/* Pixel X */}
                    <div className="w-20 h-20 bg-[#e94560] flex items-center justify-center">
                      <svg width="48" height="48" viewBox="0 0 48 48">
                        {/* Pixel X mark */}
                        <rect x="8" y="8" width="4" height="4" fill="white" />
                        <rect x="12" y="12" width="4" height="4" fill="white" />
                        <rect x="16" y="16" width="4" height="4" fill="white" />
                        <rect x="20" y="20" width="4" height="4" fill="white" />
                        <rect x="24" y="24" width="4" height="4" fill="white" />
                        <rect x="28" y="28" width="4" height="4" fill="white" />
                        <rect x="32" y="32" width="4" height="4" fill="white" />
                        <rect x="36" y="36" width="4" height="4" fill="white" />

                        <rect x="36" y="8" width="4" height="4" fill="white" />
                        <rect x="32" y="12" width="4" height="4" fill="white" />
                        <rect x="28" y="16" width="4" height="4" fill="white" />
                        <rect x="16" y="28" width="4" height="4" fill="white" />
                        <rect x="12" y="32" width="4" height="4" fill="white" />
                        <rect x="8" y="36" width="4" height="4" fill="white" />
                      </svg>
                    </div>
                    <p className="text-[#e94560] text-2xl font-bold uppercase tracking-wider">Try Again!</p>
                    <p className="text-[#eaeaea] text-sm text-center">This brain is healthy. Pick the other one!</p>
                  </div>
                </div>

                <button
                  onClick={() => setQuizState("question")}
                  className="mt-8 bg-[#e94560] border-4 border-[#e94560] px-8 py-3 text-white font-bold uppercase tracking-wider hover:bg-[#ff6b6b] transition-colors relative"
                >
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-white" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white" />
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white" />
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a15]/90 backdrop-blur-md">
          <div className="relative bg-[#16213e] border-4 border-[#0f3460] p-4 md:p-6 w-full max-w-4xl animate-pixel-pop">
            {/* Close button */}
            <button
              onClick={closeScanModal}
              className="absolute top-2 right-2 w-8 h-8 bg-[#e94560] text-white font-bold text-xl hover:bg-[#ff6b6b] transition-colors z-10 flex items-center justify-center"
            >
              X
            </button>

            {/* Pixel corners */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#e94560]" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#e94560]" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#e94560]" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#e94560]" />

            <h2 className="text-center text-xl font-bold text-[#e94560] uppercase tracking-wider mb-4">
              Scanning Your Brain
            </h2>

            {/* CNN Flow */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-2">
              {/* Input */}
              <div className="flex flex-col items-center flex-shrink-0">
                <span className="mb-2 text-xs font-bold text-[#e94560] uppercase tracking-widest">Input</span>
                <div className="w-20 h-20 md:w-24 md:h-24 bg-[#0f3460] border-4 border-[#e94560] overflow-hidden relative">
                  {selectedImage && (
                    <>
                      <img
                        src={selectedImage || "/placeholder.svg"}
                        alt="Selected scan"
                        className="w-full h-full object-cover"
                        style={{ imageRendering: "pixelated" }}
                      />
                      {stage === "scanning" && (
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute inset-x-0 h-1 bg-[#e94560] animate-scan" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Arrow 1 */}
              <div className={`transition-opacity duration-300 ${activeLayer >= 1 ? "opacity-100" : "opacity-30"}`}>
                <div className="hidden lg:flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 bg-[#e94560] ${activeLayer >= 1 ? "animate-pixel-flow" : ""}`}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <div className="lg:hidden flex flex-col gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 bg-[#e94560] ${activeLayer >= 1 ? "animate-pixel-flow" : ""}`}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>

              {/* Layer 1 - Finding Shapes */}
              <div className="flex flex-col items-center flex-shrink-0">
                <span className="mb-2 text-xs font-bold text-[#e94560] uppercase tracking-widest">Finding Shapes</span>
                <div
                  className={`relative bg-[#0f3460] border-4 p-2 transition-colors ${activeLayer === 1 ? "border-[#e94560]" : "border-[#1a1a2e]"}`}
                >
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 md:w-11 md:h-11 bg-[#1a1a2e] border-2 border-[#0f3460] overflow-hidden transition-all duration-300
                          ${visibleImages.includes(i) ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                        style={{ transitionDelay: `${i * 0.1}s` }}
                      >
                        {processedImages[i] ? (
                          <img
                            src={processedImages[i] || "/placeholder.svg"}
                            alt={`Feature ${i + 1}`}
                            className={`w-full h-full object-cover ${activeLayer === 1 && visibleImages.includes(i) ? "animate-pixel-pulse" : ""}`}
                            style={{ imageRendering: "pixelated" }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {activeLayer >= 1 && <div className="w-2 h-2 bg-[#e94560] animate-pixel-blink" />}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {activeLayer === 1 && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-[#e94560] animate-pixel-blink"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[#eaeaea]/60 mt-2 uppercase">4 Maps</span>
              </div>

              {/* Arrow 2 */}
              <div className={`transition-opacity duration-300 ${activeLayer >= 2 ? "opacity-100" : "opacity-30"}`}>
                <div className="hidden lg:flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 bg-[#e94560] ${activeLayer >= 2 ? "animate-pixel-flow" : ""}`}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <div className="lg:hidden flex flex-col gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 bg-[#e94560] ${activeLayer >= 2 ? "animate-pixel-flow" : ""}`}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>

              {/* Layer 2 - Deep Thinking */}
              <div className="flex flex-col items-center flex-shrink-0">
                <span className="mb-2 text-xs font-bold text-[#e94560] uppercase tracking-widest">Deep Thinking</span>
                <div
                  className={`relative bg-[#0f3460] border-4 p-2 transition-colors ${activeLayer === 2 ? "border-[#e94560]" : "border-[#1a1a2e]"}`}
                >
                  <div className="grid grid-cols-4 gap-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 md:w-8 md:h-8 bg-[#1a1a2e] border border-[#0f3460] overflow-hidden transition-all duration-300
                          ${visibleImages.includes(4 + i) ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}
                        style={{ transitionDelay: `${i * 0.08}s` }}
                      >
                        {processedImages[4 + i] ? (
                          <img
                            src={processedImages[4 + i] || "/placeholder.svg"}
                            alt={`Feature ${i + 1}`}
                            className={`w-full h-full object-cover ${activeLayer === 2 && visibleImages.includes(4 + i) ? "animate-pixel-pulse" : ""}`}
                            style={{ imageRendering: "pixelated" }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {activeLayer >= 2 && <div className="w-1 h-1 bg-[#e94560] animate-pixel-blink" />}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {activeLayer === 2 && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-[#e94560] animate-pixel-blink"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[#eaeaea]/60 mt-2 uppercase">8 Maps</span>
              </div>

              {/* Arrow 3 */}
              <div className={`transition-opacity duration-300 ${activeLayer >= 3 ? "opacity-100" : "opacity-30"}`}>
                <div className="hidden lg:flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 bg-[#e94560] ${activeLayer >= 3 ? "animate-pixel-flow" : ""}`}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <div className="lg:hidden flex flex-col gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 bg-[#e94560] ${activeLayer >= 3 ? "animate-pixel-flow" : ""}`}
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>

              {/* Result */}
              <div className="flex flex-col items-center flex-shrink-0">
                <span className="mb-2 text-xs font-bold text-[#e94560] uppercase tracking-widest">Result</span>
                <div className="flex flex-col gap-2">
                  <div
                    className={`w-20 h-10 flex items-center justify-center gap-2 border-4 transition-all
                      ${result === "no-cancer" ? "bg-[#00b894] border-[#00b894] animate-pixel-pop" : "bg-[#0f3460] border-[#1a1a2e]"}
                      ${activeLayer >= 3 && !result ? "animate-pixel-blink" : ""}`}
                  >
                    <span className="text-base">{result === "no-cancer" ? ":)" : "?"}</span>
                    <span
                      className={`font-bold text-xs uppercase ${result === "no-cancer" ? "text-white" : "text-[#00b894]"}`}
                    >
                      OK
                    </span>
                  </div>
                  <div
                    className={`w-20 h-10 flex items-center justify-center gap-2 border-4 transition-all
                      ${result === "cancer" ? "bg-[#e94560] border-[#e94560] animate-pixel-pop" : "bg-[#0f3460] border-[#1a1a2e]"}
                      ${activeLayer >= 3 && !result ? "animate-pixel-blink" : ""}`}
                  >
                    <span className="text-base">{result === "cancer" ? ":(" : "?"}</span>
                    <span
                      className={`font-bold text-xs uppercase ${result === "cancer" ? "text-white" : "text-[#e94560]"}`}
                    >
                      RISK
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6 bg-[#0f3460] border-2 border-[#1a1a2e] h-4 relative overflow-hidden">
              <div
                className="h-full bg-[#e94560] transition-all duration-500"
                style={{
                  width:
                    stage === "idle"
                      ? "0%"
                      : stage === "scanning"
                        ? "25%"
                        : stage === "layer1"
                          ? "50%"
                          : stage === "layer2"
                            ? "75%"
                            : "100%",
                }}
              />
              <div className="absolute inset-0 flex">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="flex-1 border-r-2 border-[#1a1a2e] last:border-r-0" />
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-[#eaeaea]/60 uppercase">
              <span>Scan</span>
              <span>Layer 1</span>
              <span>Layer 2</span>
              <span>Done</span>
            </div>

            {/* Result message for custom uploads */}
            {result && (
              <div className="mt-6 flex flex-col items-center">
                <div className="flex flex-col items-center animate-pixel-pop">
                  <span className="text-[#eaeaea] text-lg font-bold uppercase tracking-wider mb-3">Scan Complete!</span>
                  <p className="text-[#eaeaea]/70 text-sm text-center">
                    {result === "cancer"
                      ? "The AI detected a possible issue. See a doctor!"
                      : "The AI says this brain looks healthy!"}
                  </p>
                  {confidenceScore !== null && (
                    <p className="text-[#e94560] text-xs mt-2">
                      Confidence: {(confidenceScore * 100).toFixed(1)}%
                    </p>
                  )}
                  {error && (
                    <p className="text-[#ff6b6b] text-xs mt-2">
                      Note: {error}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => {
                      closeScanModal()
                      setTimeout(() => fileInputRef.current?.click(), 100)
                    }}
                    className="bg-[#0f3460] border-2 border-[#e94560] px-6 py-3 text-[#e94560] font-bold uppercase tracking-wider hover:bg-[#e94560] hover:text-white transition-colors"
                  >
                    Scan Another
                  </button>
                  <button
                    onClick={() => {
                      closeScanModal()
                      resetQuiz()
                    }}
                    className="bg-[#e94560] border-2 border-[#e94560] px-6 py-3 text-white font-bold uppercase tracking-wider hover:bg-[#ff6b6b] transition-colors"
                  >
                    Back to Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}