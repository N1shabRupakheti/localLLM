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
        <div className="min-h-screen bg-gray-950 text-gray-100 p-4">
            <div className="max-w-3xl mx-auto h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 rounded-t-2xl flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">✦</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Gemini Chat</h1>
                        <p className="text-xs text-gray-400">AI Assistant</p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 bg-gray-900 border-x border-gray-800 p-6 overflow-y-auto space-y-6">
                    {prompt.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center">
                            <div className="max-w-md">
                                <div className="text-6xl mb-4 opacity-20">✦</div>
                                <p className="text-gray-400 text-lg">Start a conversation</p>
                                <p className="text-gray-500 text-sm mt-2">
                                    Send a message below to begin chatting with Gemini
                                </p>
                            </div>
                        </div>
                    ) : (
                        prompt.map((p, i) => (
                            <div
                                key={i}
                                className={`max-w-[80%] px-5 py-4 rounded-2xl ${p.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-gray-800 text-gray-100 rounded-bl-none'
                                    }`}
                            >
                                <div className="text-xs opacity-70 mb-2">
                                    {p.role === 'user' ? 'You' : 'Gemini'}
                                </div>

                                {p.role === 'user' ? (
                                    <div className="leading-relaxed whitespace-pre-wrap">{p.content}</div>
                                ) : (
                                    <div className="prose prose-invert prose-sm max-w-none leading-relaxed">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ node, ...props }) => {
                                                    void node;
                                                    return <p className="mb-3 last:mb-0" {...props} />;
                                                },
                                                strong: ({ node, ...props }) => {
                                                    void node;
                                                    return <strong className="font-semibold" {...props} />;
                                                },
                                                em: ({ node, ...props }) => {
                                                    void node;
                                                    return <em className="italic" {...props} />;
                                                },
                                                ul: ({ node, ...props }) => {
                                                    void node;
                                                    return <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />;
                                                },
                                                ol: ({ node, ...props }) => {
                                                    void node;
                                                    return <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />;
                                                },
                                            }}
                                        >
                                            {p.content}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-950 border-x border-red-900 text-red-400 px-6 py-3 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-b-2xl p-6">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            className="flex-1 bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none rounded-2xl px-6 py-4 text-lg placeholder-gray-500 transition-colors"
                        />

                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-8 py-4 rounded-2xl font-medium flex items-center gap-2 transition-all active:scale-95"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending
                                </>
                            ) : (
                                <>Send →</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
