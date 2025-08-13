"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, RotateCcw, MessageCircle, Sparkles } from "lucide-react"

interface Message {
    role: "user" | "assistant"
    content: string
    timestamp: Date
    id: string // Added unique ID to track messages
}

export default function ModernChat() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [animatingMessages, setAnimatingMessages] = useState<Set<string>>(new Set()) // Track which messages are animating
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto"
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [input])

    useEffect(() => {
        if (messages.length > 0) {
            const latestMessage = messages[messages.length - 1]
            setAnimatingMessages((prev) => new Set([...prev, latestMessage.id]))

            // Remove from animating set after animation completes
            const timer = setTimeout(() => {
                setAnimatingMessages((prev) => {
                    const newSet = new Set(prev)
                    newSet.delete(latestMessage.id)
                    return newSet
                })
            }, 500)

            return () => clearTimeout(timer)
        }
    }, [messages]) // Updated dependency to messages

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage: Message = {
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
            id: `user-${Date.now()}`, // Added unique ID
        }

        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setLoading(true)

        try {
            const messagesToSend = [...messages, userMessage]
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: messagesToSend }),
            })

            const data = await res.json()
            const assistantMessage: Message = {
                role: "assistant",
                content: data.error ? `Error: ${data.details || data.error}` : data.reply,
                timestamp: new Date(),
                id: `assistant-${Date.now()}`, // Added unique ID
            }

            setMessages((prev) => [...prev, assistantMessage])
        } catch {
            const errorMessage: Message = {
                role: "assistant",
                content: "I'm having trouble connecting right now. Please try again.",
                timestamp: new Date(),
                id: `error-${Date.now()}`, // Added unique ID
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage(e)
        }
    }

    function clearChat() {
        setMessages([])
        setAnimatingMessages(new Set()) // Clear animating messages too
    }

    function formatTime(date: Date) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-200 rounded-full animate-pulse opacity-60"></div>
                <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-200 rounded-full animate-ping opacity-40"></div>
                <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce opacity-50"></div>
                <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-cyan-200 rounded-full animate-pulse opacity-30"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10 animate-fade-in">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300 hover:rotate-12 animate-gradient-shift">
                        <MessageCircle className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-gray-900 animate-slide-in-left">AI Assistant</h1>
                        <p className="text-sm text-gray-500 animate-slide-in-left [animation-delay:0.1s]">Always here to help</p>
                    </div>
                </div>
                {messages.length > 0 && (
                    <button
                        onClick={clearChat}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md animate-slide-in-right"
                    >
                        <RotateCcw className="w-4 h-4 transition-transform duration-200 hover:rotate-180" />
                        Clear
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4 animate-float shadow-lg">
                            <MessageCircle className="w-8 h-8 text-blue-600 animate-pulse" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2 animate-slide-in-up">Start a conversation</h3>
                        <p className="text-gray-500 max-w-sm animate-slide-in-up [animation-delay:0.2s]">
                            Ask me anything! I'm here to help with questions, creative tasks, or just to chat.
                        </p>
                        <div className="mt-4 flex gap-2">
                            <Sparkles className="w-4 h-4 text-blue-400 animate-spin-slow" />
                            <Sparkles className="w-3 h-3 text-purple-400 animate-ping" />
                            <Sparkles className="w-4 h-4 text-indigo-400 animate-bounce" />
                        </div>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"} ${
                                animatingMessages.has(message.id) ? "animate-message-appear" : ""
                            }`} // Only animate messages that are in the animating set
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 hover:scale-110 ${
                                    message.role === "user"
                                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-blue-200"
                                        : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:shadow-md"
                                }`}
                            >
                                {message.role === "user" ? "You" : "AI"}
                            </div>
                            <div
                                className={`flex flex-col max-w-xs sm:max-w-md ${
                                    message.role === "user" ? "items-end" : "items-start"
                                }`}
                            >
                                <div
                                    className={`px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                                        message.role === "user"
                                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md shadow-md hover:shadow-blue-200"
                                            : "bg-gradient-to-br from-gray-100 to-gray-50 text-gray-900 rounded-bl-md shadow-sm hover:shadow-md"
                                    }`}
                                >
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                </div>
                                <span className="text-xs text-gray-400 mt-1 px-1 animate-fade-in [animation-delay:0.5s]">
                  {formatTime(message.timestamp)}
                </span>
                            </div>
                        </div>
                    ))
                )}

                {loading && (
                    <div className="flex gap-3 animate-slide-in-left">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 animate-pulse">
                            AI
                        </div>
                        <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm animate-pulse">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-wave [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-wave [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-wave"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-100 bg-white/80 backdrop-blur-sm animate-slide-in-up">
                <form onSubmit={sendMessage} className="flex gap-3">
                    <div className="flex-1 relative">
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-lg focus:shadow-blue-100 transition-all duration-300 max-h-32 min-h-[48px] hover:border-gray-300 hover:shadow-md"
                rows={1}
            />
                        <div className="absolute right-3 bottom-3 text-xs text-gray-400 transition-colors duration-200">
                            {input.length > 0 && (
                                <span
                                    className={`${input.length > 500 ? "text-red-400" : input.length > 300 ? "text-yellow-400" : "text-gray-400"} animate-fade-in`}
                                >
                  {input.length} chars
                </span>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-200 active:scale-95 group"
                    >
                        <Send className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </button>
                </form>
                <p className="text-xs text-gray-400 mt-2 text-center animate-fade-in [animation-delay:0.3s]">
                    Press Enter to send • Shift+Enter for new line
                </p>
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes message-appear {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes wave {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-in-left { animation: slide-in-left 0.6s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.6s ease-out; }
        .animate-slide-in-up { animation: slide-in-up 0.6s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-message-appear { animation: message-appear 0.5s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-wave { animation: wave 1.4s ease-in-out infinite; }
        .animate-gradient-shift { 
          background-size: 200% 200%; 
          animation: gradient-shift 3s ease infinite; 
        }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }
      `}</style>
        </div>
    )
}
