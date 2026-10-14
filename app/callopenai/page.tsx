'use client'

import { useState } from "react"
import ReactMarkdown from 'react-markdown';

interface Prompt {
    role: 'user' | 'assistant';
    content: string;
}

export default function CallOpenAI() {
    const [prompt, setPrompt] = useState<Prompt[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMessage: Prompt = { role: 'user', content: input }

        // 1. Add user message to state & clear input field
        const updatedPrompts = [...prompt, userMessage]
        setPrompt(updatedPrompts)
        setInput("")
        setLoading(true)
        setError("")

        try {
            // 2. Call your backend Next.js API Route (which safely runs server-side)
            const response = await fetch('/callopenai/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: updatedPrompts }) // Sends the array of objects
            })

            if (!response.ok) {
                const message = await response.text()
                throw new Error(message || "API call failed")
            }

            // Placeholder to handle your text stream
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            // Set up a blank model response that we can stream text into
            setPrompt((prev) => [...prev, { role: 'assistant', content: '' }])

            while (reader) {
                const { value, done } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)

                // Stream text chunk into the last message item
                setPrompt((prev) => {
                    const newPrompts = [...prev]
                    const last = newPrompts[newPrompts.length - 1]
                    if (last && last.role === 'assistant') {
                        newPrompts[newPrompts.length - 1] = {
                            ...last,
                            content: last.content + chunk,
                        }
                    }
                    return newPrompts
                })
            }

        } catch (error) {
            console.error("Failed to fetch:", error)
            setError(error instanceof Error ? error.message : "API call failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#080b14] text-white relative overflow-hidden">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px]" />
                <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto min-h-screen flex flex-col px-4 sm:px-6">

                {/* Header */}
                <header className="flex items-center justify-between py-5 border-b border-white/[0.08]">
                    <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-2xl font-bold">✦</span>
                            <div className="absolute inset-0 rounded-2xl border border-white/20" />
                        </div>

                        <div>
                            <h1 className="text-lg font-bold tracking-tight">
                                Gemini<span className="text-blue-400">.</span>Chat
                            </h1>
                            <p className="text-xs text-gray-500">
                                Your ideas, amplified.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                        <span className="text-xs text-emerald-300 font-medium">
                            AI Ready
                        </span>
                    </div>
                </header>

                {/* Chat area */}
                <main className="flex-1 flex flex-col py-8 min-h-0">

                    {prompt.length === 0 ? (
                        /* Welcome screen */
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full scale-150" />
                                <div className="relative w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-400/20 via-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-2xl">
                                    <span className="text-5xl bg-gradient-to-br from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        ✦
                                    </span>
                                </div>
                                <span className="absolute -top-2 -right-2 text-xl animate-bounce">✨</span>
                                <span className="absolute -bottom-1 -left-3 text-lg animate-pulse">💫</span>
                            </div>

                            <p className="text-xs uppercase tracking-[0.3em] text-indigo-300/80 mb-4">
                                A little spark of intelligence
                            </p>

                            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                                What's on your{" "}
                                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    mind?
                                </span>
                            </h2>

                            <p className="text-gray-400 max-w-md leading-relaxed mb-10">
                                Ask questions, explore wild ideas, debug code,
                                or learn something completely new. Let's make
                                something happen.
                            </p>

                            {/* Starter prompts */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
                                {[
                                    {
                                        icon: "💻",
                                        title: "Help me code",
                                        desc: "Debug something or build a project",
                                        prompt: "Help me come up with a fun coding project."
                                    },
                                    {
                                        icon: "🧠",
                                        title: "Explain something",
                                        desc: "Make complicated things simple",
                                        prompt: "Explain a complicated technology concept in simple terms."
                                    },
                                    {
                                        icon: "🚀",
                                        title: "Explore an idea",
                                        desc: "Think big and get creative",
                                        prompt: "Give me an interesting idea for a software project."
                                    },
                                    {
                                        icon: "🎲",
                                        title: "Surprise me",
                                        desc: "Teach me something unexpected",
                                        prompt: "Teach me a surprising fact about technology."
                                    }
                                ].map((item) => (
                                    <button
                                        key={item.title}
                                        type="button"
                                        onClick={() => setInput(item.prompt)}
                                        className="group text-left p-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.06] hover:border-indigo-400/40 transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl group-hover:scale-110 transition-transform">
                                                {item.icon}
                                            </span>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-200 mb-1 group-hover:text-white">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs text-gray-500 leading-relaxed">
                                                    {item.desc}
                                                </p>
                                            </div>
                                            <span className="ml-auto text-gray-600 group-hover:text-indigo-300 transition-colors">
                                                ↗
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Conversation */
                        <div className="flex-1 space-y-8 pb-6">
                            {prompt.map((p, i) => (
                                <div
                                    key={i}
                                    className={`flex gap - 3 sm: gap - 4 ${p.role === "user"
                                        ? "flex-row-reverse"
                                        : "flex-row"
                                        } `}
                                >
                                    {/* Avatar */}
                                    <div
                                        className={`shrink - 0 w - 9 h - 9 rounded - xl flex items - center justify - center text - lg ${p.role === "user"
                                            ? "bg-white/10 border border-white/10"
                                            : "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-indigo-500/10"
                                            } `}
                                    >
                                        {p.role === "user" ? "👤" : "✦"}
                                    </div>

                                    {/* Message */}
                                    <div
                                        className={`min - w - 0 max - w - [88 %] sm: max - w - [80 %] ${p.role === "user" ? "items-end" : "items-start"
                                            } flex flex - col`}
                                    >
                                        <div className="flex items-center gap-2 mb-2 px-1">
                                            <span className="text-xs font-semibold text-gray-300">
                                                {p.role === "user" ? "You" : "Gemini"}
                                            </span>
                                            {p.role !== "user" && (
                                                <span className="text-[10px] text-indigo-300 bg-indigo-400/10 border border-indigo-400/10 px-2 py-0.5 rounded-full">
                                                    AI
                                                </span>
                                            )}
                                        </div>

                                        <div
                                            className={`w - full rounded - 2xl px - 4 sm: px - 5 py - 4 ${p.role === "user"
                                                ? "bg-gradient-to-br from-indigo-600 to-blue-600 rounded-tr-sm shadow-lg shadow-indigo-900/20"
                                                : "bg-white/[0.045] border border-white/[0.08] rounded-tl-sm backdrop-blur-xl"
                                                } `}
                                        >
                                            {p.role === "user" ? (
                                                <div className="whitespace-pre-wrap break-words leading-7 text-sm sm:text-[15px]">
                                                    {p.content}
                                                </div>
                                            ) : (
                                                <div className="prose prose-invert prose-sm max-w-none break-words leading-7 prose-headings:text-gray-100 prose-a:text-blue-300 prose-code:text-cyan-300 prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10">
                                                    <ReactMarkdown
                                                        components={{
                                                            p: ({ node, ...props }) => {
                                                                void node;
                                                                return (
                                                                    <p className="mb-3 last:mb-0 text-gray-200" {...props} />
                                                                );
                                                            },
                                                            strong: ({ node, ...props }) => {
                                                                void node;
                                                                return <strong className="font-semibold text-white" {...props} />;
                                                            },
                                                            em: ({ node, ...props }) => {
                                                                void node;
                                                                return <em className="italic text-gray-300" {...props} />;
                                                            },
                                                            ul: ({ node, ...props }) => {
                                                                void node;
                                                                return <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-indigo-400" {...props} />;
                                                            },
                                                            ol: ({ node, ...props }) => {
                                                                void node;
                                                                return <ol className="list-decimal pl-5 mb-4 space-y-2 marker:text-indigo-400" {...props} />;
                                                            },
                                                            h1: ({ node, ...props }) => {
                                                                void node;
                                                                return <h1 className="text-xl font-bold mt-5 mb-3" {...props} />;
                                                            },
                                                            h2: ({ node, ...props }) => {
                                                                void node;
                                                                return <h2 className="text-lg font-bold mt-5 mb-3" {...props} />;
                                                            },
                                                            h3: ({ node, ...props }) => {
                                                                void node;
                                                                return <h3 className="text-base font-semibold mt-4 mb-2" {...props} />;
                                                            },
                                                            blockquote: ({ node, ...props }) => {
                                                                void node;
                                                                return <blockquote className="border-l-2 border-indigo-400 pl-4 text-gray-400 italic" {...props} />;
                                                            },
                                                        }}
                                                    >
                                                        {p.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Loading indicator */}
                            {loading && (
                                <div className="flex gap-3 sm:gap-4">
                                    <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                        <span>✦</span>
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-gray-300 mb-3 px-1">
                                            Gemini is thinking
                                        </div>
                                        <div className="flex items-center gap-1.5 px-4 py-4 rounded-2xl rounded-tl-sm bg-white/[0.045] border border-white/[0.08]">
                                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="ml-12 rounded-xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
                                    <span className="mr-2">⚠️</span>
                                    {error}
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* Composer */}
                <footer className="sticky bottom-0 pb-5 pt-3 bg-gradient-to-t from-[#080b14] via-[#080b14]/95 to-transparent">
                    <form
                        onSubmit={handleSubmit}
                        className="relative max-w-4xl mx-auto"
                    >
                        <div className="absolute -inset-[1px] rounded-[1.4rem] bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-purple-500/50 blur-sm opacity-50" />

                        <div className="relative rounded-[1.35rem] border border-white/10 bg-[#101421]/95 backdrop-blur-2xl shadow-2xl">
                            <textarea
                                rows={1}
                                placeholder="Ask anything... what's on your mind?"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        if (!loading && input.trim()) {
                                            e.currentTarget.form?.requestSubmit();
                                        }
                                    }
                                }}
                                disabled={loading}
                                className="w-full resize-none bg-transparent text-white placeholder-gray-500 px-5 pt-5 pb-3 outline-none text-sm sm:text-base min-h-[60px] max-h-40 disabled:opacity-50"
                            />

                            <div className="flex items-center justify-between gap-3 px-4 pb-3">
                                <p className="text-[10px] sm:text-xs text-gray-600 pl-1">
                                    <span className="text-gray-500">↵</span> Send
                                    <span className="mx-2 text-gray-700">·</span>
                                    <span className="text-gray-500">⇧ ↵</span> New line
                                </p>

                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-400 hover:via-indigo-400 hover:to-purple-400 disabled:from-gray-700 disabled:via-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-3 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
                                >
                                    {loading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Thinking
                                        </>
                                    ) : (
                                        <>
                                            Send
                                            <span className="text-base group-hover:translate-x-0.5 transition-transform">
                                                ↗
                                            </span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <p className="text-center text-[10px] text-gray-600 mt-3">
                            Powered by Gemini · AI can make mistakes, so double-check important information.
                        </p>
                    </form>
                </footer>
            </div>
        </div>
    )
}
