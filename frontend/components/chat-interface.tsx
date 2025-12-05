"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  isTyping?: boolean
}

const INITIAL_MESSAGE: Message = {
  id: 0,
  text: "Hello! I am your assistant. How can I help you today?",
  sender: "bot",
}

const BOT_RESPONSE = "AI response will appear here..."
const FALLBACK_RESPONSE = "Sorry, I couldn't connect to the server. Please try again later."
const API_ENDPOINT = "http://localhost:8000/chat"

function PixelSmiley() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="fill-current">
      <rect x="4" y="4" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="7" width="2" height="2" />
      <rect x="12" y="7" width="2" height="2" />
      <rect x="6" y="12" width="2" height="2" />
      <rect x="8" y="14" width="4" height="2" />
      <rect x="12" y="12" width="2" height="2" />
    </svg>
  )
}

function PixelSend() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="fill-current">
      <rect x="2" y="9" width="10" height="2" />
      <rect x="10" y="7" width="2" height="2" />
      <rect x="12" y="5" width="2" height="2" />
      <rect x="14" y="9" width="2" height="2" />
      <rect x="12" y="13" width="2" height="2" />
      <rect x="10" y="11" width="2" height="2" />
    </svg>
  )
}

function PixelDots() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" className="fill-current">
      <rect x="3" y="9" width="2" height="2" />
      <rect x="9" y="9" width="2" height="2" />
      <rect x="15" y="9" width="2" height="2" />
    </svg>
  )
}

function PixelMinimize() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <rect x="3" y="10" width="8" height="2" fill="currentColor" />
    </svg>
  )
}

function PixelMaximize() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <rect x="3" y="3" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="3" width="8" height="2" fill="currentColor" />
    </svg>
  )
}

function PixelClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      <rect x="3" y="5" width="2" height="2" fill="currentColor" />
      <rect x="5" y="7" width="2" height="2" fill="currentColor" />
      <rect x="7" y="5" width="2" height="2" fill="currentColor" />
      <rect x="9" y="3" width="2" height="2" fill="currentColor" />
      <rect x="3" y="9" width="2" height="2" fill="currentColor" />
      <rect x="9" y="9" width="2" height="2" fill="currentColor" />
      <rect x="7" y="7" width="2" height="2" fill="currentColor" />
      <rect x="5" y="5" width="2" height="2" fill="currentColor" />
    </svg>
  )
}

function PixelAvatar({ isUser }: { isUser: boolean }) {
  return (
    <div className="w-12 h-12 pixel-avatar flex items-center justify-center flex-shrink-0">
      <svg width="32" height="32" viewBox="0 0 32 32">
        {/* Hair */}
        <rect x="10" y="2" width="12" height="4" fill={isUser ? "#e94560" : "#0f3460"} />
        <rect x="8" y="4" width="4" height="2" fill={isUser ? "#e94560" : "#0f3460"} />
        <rect x="20" y="4" width="4" height="2" fill={isUser ? "#e94560" : "#0f3460"} />
        {/* Head */}
        <rect x="10" y="6" width="12" height="10" fill="#eaeaea" />
        {/* Body */}
        <rect x="8" y="16" width="16" height="10" fill={isUser ? "#e94560" : "#0f3460"} />
        {/* Arms */}
        <rect x="4" y="16" width="4" height="8" fill={isUser ? "#e94560" : "#0f3460"} />
        <rect x="24" y="16" width="4" height="8" fill={isUser ? "#e94560" : "#0f3460"} />
        {/* Legs */}
        <rect x="8" y="26" width="6" height="4" fill="#16213e" />
        <rect x="18" y="26" width="6" height="4" fill="#16213e" />
        {/* Face */}
        {isUser ? (
          <>
            <rect x="12" y="9" width="2" height="2" fill="#1a1a2e" />
            <rect x="18" y="9" width="2" height="2" fill="#1a1a2e" />
            <rect x="14" y="12" width="4" height="2" fill="#e94560" />
          </>
        ) : (
          <>
            <rect x="12" y="9" width="8" height="2" fill="#e94560" />
            <rect x="14" y="12" width="4" height="2" fill="#1a1a2e" />
          </>
        )}
      </svg>
    </div>
  )
}

function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-2 px-5 py-4 pixel-bubble pixel-bubble-bot">
      <div className="flex gap-2">
        <div className="w-3 h-3 thinking-dot" style={{ background: "#e94560" }} />
        <div className="w-3 h-3 thinking-dot" style={{ background: "#e94560" }} />
        <div className="w-3 h-3 thinking-dot" style={{ background: "#e94560" }} />
      </div>
      <span className="text-[8px] text-[#a0a0a0] ml-2" style={{ fontFamily: "'Press Start 2P', monospace" }}>
        THINKING
      </span>
    </div>
  )
}

function TypedText({
  text,
  onComplete,
  speed = 30,
}: {
  text: string
  onComplete?: () => void
  speed?: number
}) {
  const [displayedText, setDisplayedText] = useState("")
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    setDisplayedText("")
    setIsComplete(false)
    let index = 0

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setIsComplete(true)
        onComplete?.()
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed, onComplete])

  return (
    <span>
      {displayedText}
      {!isComplete && <span className="typing-cursor inline-block w-2 h-3 ml-1" style={{ background: "#e94560" }} />}
    </span>
  )
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isThinking) return

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    const messageText = inputValue.trim()
    setInputValue("")
    setIsThinking(true)

    let botResponseText = FALLBACK_RESPONSE

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageText }),
      })

      if (response.ok) {
        const data = await response.json()
        // Use only the 'reply' field from the response
        if (data.reply) {
          botResponseText = data.reply
        }
      }
    } catch (error) {
      // Use fallback message on error
      console.error("Error connecting to chat API:", error)
    }

    setIsThinking(false)

    const botMessage: Message = {
      id: Date.now() + 1,
      text: botResponseText,
      sender: "bot",
      isTyping: true,
    }

    setMessages((prev) => [...prev, botMessage])
    setTypingMessageId(botMessage.id)
  }

  const handleTypingComplete = (messageId: number) => {
    setTypingMessageId(null)
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isTyping: false } : msg)))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <>
      <div className="pixel-titlebar h-10 flex items-center justify-between px-3">
        <span className="text-white text-[10px] tracking-wider font-bold drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
          RETRO CHAT
        </span>
        <div className="flex gap-2">
          <button className="w-6 h-6 pixel-button flex items-center justify-center">
            <PixelMinimize />
          </button>
          <button className="w-6 h-6 pixel-button flex items-center justify-center">
            <PixelMaximize />
          </button>
          <button className="w-6 h-6 pixel-button flex items-center justify-center">
            <PixelClose />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden dither-bg p-2 gap-2 relative scanlines">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 pixel-inset flex flex-col gap-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-4 message-appear ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <PixelAvatar isUser={message.sender === "user"} />
              <div
                className={`max-w-[70%] px-5 py-4 text-[10px] leading-relaxed pixel-bubble ${
                  message.sender === "user" ? "pixel-bubble-user" : "pixel-bubble-bot"
                }`}
                style={{ fontFamily: "'Press Start 2P', monospace" }}
              >
                {message.sender === "bot" && message.isTyping ? (
                  <TypedText text={message.text} onComplete={() => handleTypingComplete(message.id)} speed={40} />
                ) : (
                  message.text
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-end gap-4 flex-row message-appear">
              <PixelAvatar isUser={false} />
              <ThinkingIndicator />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="w-28 pixel-inset p-3 flex flex-col gap-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-4 border-4"
              style={{
                background: i % 2 === 0 ? "#e94560" : "#0f3460",
                borderColor: "#0f3460",
                boxShadow: "inset 2px 2px 0 0 rgba(255,255,255,0.2), inset -2px -2px 0 0 rgba(0,0,0,0.3)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="p-3 dither-bg border-t-4 border-[#0f3460]">
        <div className="flex gap-3 items-center">
          <button className="w-10 h-10 pixel-button flex items-center justify-center text-[#e94560]">
            <PixelSmiley />
          </button>

          <div className="flex-1 pixel-inset">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="TYPE HERE..."
              disabled={isThinking}
              className="w-full bg-transparent text-[#eaeaea] placeholder:text-[#506080] px-4 py-3 text-[10px] focus:outline-none disabled:opacity-50"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            />
          </div>

          <button className="w-10 h-10 pixel-button flex items-center justify-center text-[#e94560]">
            <PixelDots />
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isThinking}
            className="w-10 h-10 pixel-button flex items-center justify-center text-[#e94560] disabled:opacity-50"
          >
            <PixelSend />
          </button>
        </div>
      </div>
    </>
  )
}
