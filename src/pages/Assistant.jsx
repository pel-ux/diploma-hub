console.log("API KEY:", import.meta.env.VITE_GEMINI_API_KEY)
import { useState, useEffect, useRef } from "react"
import { auth } from "../services/firebase.js"
import { useNavigate } from "react-router-dom"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your DiplomaHub AI study assistant. Ask me anything — exam questions, concept explanations, or practice problems."
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState("General")
  const bottomRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) navigate("/login")
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const subjects = ["General", "Biology", "Chemistry", "Physics", "Mathematics"]

  const sendMessage = async () => {
  if (!input.trim() || loading) return
  
  console.log("API KEY:", import.meta.env.VITE_GEMINI_API_KEY)
  
  const userMessage = { role: "user", content: input }
  // rest of the code...

    
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setLoading(true)

    try {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: input }] }],
        systemInstruction: {
          parts: [{ text: `You are a helpful sciences diploma study assistant specializing in ${subject}. Keep answers clear, concise and exam-focused.` }]
        }
      })
    }
  )

  const data = await response.json()
  console.log("Gemini response:", data)
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received."
  setMessages(prev => [...prev, { role: "assistant", content: reply }])
} catch (error) {
  console.log("Gemini error:", error)
  setMessages(prev => [...prev, {
    role: "assistant",
    content: "Connection error. Please check your network and try again."
  }])
}
    

    setLoading(false)
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: `Chat cleared. What would you like to work on in ${subject}?`
    }])
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-400 hover:text-blue-900 transition-colors text-sm"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-lg font-semibold text-blue-900">AI Study Assistant</h1>
            <p className="text-xs text-gray-400">Powered by Gemini</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          Clear chat
        </button>
      </div>

      <div className="flex flex-1 max-w-5xl mx-auto w-full px-4 py-6 gap-6">

        {/* Sidebar - subjects */}
        <div className="hidden lg:flex flex-col gap-2 w-44 flex-shrink-0">
          <p className="text-xs font-medium text-gray-400 mb-1">Subject</p>
          {subjects.map(s => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className={`text-left text-sm px-4 py-2.5 rounded-xl transition-colors font-medium
                ${subject === s
                  ? "bg-blue-900 text-white"
                  : "bg-white border border-gray-100 text-gray-600 hover:border-blue-200 hover:text-blue-900"
                }`}
            >
              {s}
            </button>
          ))}

          <div className="mt-4">
            <p className="text-xs font-medium text-gray-400 mb-2">Quick prompts</p>
            {[
              "Practice question",
              "Key concepts",
              "Exam tips",
              "Summarise topic"
            ].map(p => (
              <button
                key={p}
                onClick={() => setInput(p)}
                className="w-full text-left text-xs px-3 py-2 mb-1.5 rounded-lg bg-white border border-gray-100 text-gray-500 hover:border-amber-300 hover:text-amber-700 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden">

          {/* Mobile subject selector */}
          <div className="lg:hidden flex gap-2 p-3 border-b border-gray-100 overflow-x-auto">
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-colors
                  ${subject === s
                    ? "bg-blue-900 text-white"
                    : "bg-gray-100 text-gray-600"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1
                  ${msg.role === "assistant" ? "bg-amber-400 text-blue-900" : "bg-blue-900 text-white"}`}>
                  {msg.role === "assistant" ? "AI" : "You"}
                </div>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === "assistant"
                    ? "bg-gray-50 text-gray-800 rounded-tl-none"
                    : "bg-blue-900 text-white rounded-tr-none"
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-xs font-bold text-blue-900">AI</div>
                <div className="bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-4 flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Ask a ${subject} question...`}
              rows={1}
              className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm outline-none focus:border-blue-900 focus:bg-white transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Assistant