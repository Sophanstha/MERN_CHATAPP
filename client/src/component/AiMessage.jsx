import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import moment from "moment";
import {
  HiSparkles,
  HiOutlineTrash,
  HiOutlineClipboardDocument,
  HiCheck,
} from "react-icons/hi2";
import { FaAngleLeft } from "react-icons/fa6";
import { IoMdSend } from "react-icons/io";
import { BACKEND_URL } from "../helper/apiUrl";

// Custom code block renderer with language badge and Copy Code button
const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const codeContent = String(children).replace(/\n$/, "");

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-teal-700 dark:text-teal-300 font-mono text-xs font-semibold"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900 text-slate-100 shadow-md">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 text-xs text-slate-400 font-mono border-b border-slate-700">
        <span className="uppercase tracking-wider font-semibold text-teal-400">
          {match ? match[1] : "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white px-2 py-0.5 rounded hover:bg-slate-700 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <HiCheck className="text-emerald-400" size={14} />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <HiOutlineClipboardDocument size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 overflow-x-auto text-xs font-mono leading-relaxed">
        <pre className="!bg-transparent !p-0 !m-0">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};

const AiMessage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Fetch AI conversation history
  const fetchAiHistory = async () => {
    setFetchingHistory(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/ai/history`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setMessages(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching AI history:", err);
      if (err?.response?.data?.logout) {
        navigate("/");
      }
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchAiHistory();
  }, []);

  // Send message to Gemini
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim() || loading) return;

    const trimmed = text.trim();
    setInputText("");

    // Optimistically show user message
    const tempUserMsg = {
      role: "user",
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/ai/message`,
        { message: trimmed },
        { withCredentials: true }
      );

      if (res.data?.success) {
        setMessages((prev) => [...prev, res.data.modelMessage]);
      }
    } catch (err) {
      console.error("Error in AI response:", err);
      const errorMsg =
        err?.response?.data?.message ||
        "Failed to receive response from Gemini AI. Please check your connection.";

      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `⚠️ **Error:** ${errorMsg}`,
          createdAt: new Date().toISOString(),
        },
      ]);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Clear conversation history
  const handleClearHistory = async () => {
    if (messages.length === 0) return;
    if (!window.confirm("Are you sure you want to clear your Gemini AI chat history?")) {
      return;
    }

    try {
      const res = await axios.delete(`${BACKEND_URL}/api/ai/history`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setMessages([]);
        toast.success("AI chat history cleared.");
      }
    } catch (err) {
      toast.error("Failed to clear history.");
    }
  };

  // Copy full model response
  const handleCopyMessage = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Response copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Suggested prompts
  const starterPrompts = [
    {
      icon: "💡",
      title: "Explain Concept",
      prompt: "Explain how WebSockets enable real-time messaging in simple terms with an example.",
    },
    {
      icon: "⚡",
      title: "Write React Code",
      prompt: "Create a modern React custom hook `useDebounce` with full TypeScript/JSDoc types.",
    },
    {
      icon: "📝",
      title: "Draft Message",
      prompt: "Draft a polite and professional follow-up message to a client about a project milestone.",
    },
    {
      icon: "🧠",
      title: "Feature Brainstorm",
      prompt: "What are 5 innovative features that would make a MERN chat application stand out in 2026?",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-10 w-full h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center px-4 transition-colors">
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-teal-600"
            title="Back to messages"
          >
            <FaAngleLeft size={24} />
          </Link>

          {/* Glowing Gemini Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <HiSparkles size={20} className="animate-spin-slow" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white">
                Gemini AI Assistant
              </h3>
              <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-teal-500/10 to-indigo-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-xs flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Active &amp; Ready</span>
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5">
          {/* Clear History Button */}
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              title="Clear chat history"
              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
            >
              <HiOutlineTrash size={18} />
            </button>
          )}
        </div>
      </header>

      {/* Messages Scroll Area */}
      <section className="flex-1 overflow-x-hidden overflow-y-auto scrollbar p-4 relative">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          {/* Empty State / Welcome Screen */}
          {messages.length === 0 && !fetchingHistory && (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-teal-500/20 mb-4 animate-bounce-slow">
                <HiSparkles size={34} />
              </div>

              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                Hello! How can I help you today?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8">
                I am your personal AI assistant powered by Google Gemini. Ask me
                programming questions, request summaries, brainstorm ideas, or draft
                messages.
              </p>

              {/* Starter Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left">
                {starterPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.prompt)}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-teal-50/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 transition-all text-left group shadow-xs cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {item.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message List */}
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg._id || index}
                className={`flex gap-3 ${
                  isUser ? "justify-end" : "justify-start"
                } items-start`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white flex-shrink-0 shadow-xs mt-1">
                    <HiSparkles size={16} />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] sm:max-w-xl md:max-w-2xl shadow-xs transition-all ${
                    isUser
                      ? "bg-teal-600 text-white rounded-tr-xs"
                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-gray-100 dark:border-slate-800"
                  }`}
                >
                  {isUser ? (
                    <p className="text-sm font-normal leading-relaxed whitespace-pre-wrap break-words">
                      {msg.text}
                    </p>
                  ) : (
                    <div className="text-sm leading-relaxed break-words space-y-2 markdown-body">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: CodeBlock,
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-600 dark:text-teal-400 underline hover:text-teal-700 font-medium"
                            >
                              {children}
                            </a>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 space-y-1 my-2">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-5 space-y-1 my-2">
                              {children}
                            </ol>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-teal-500 pl-3 italic text-slate-600 dark:text-slate-400 my-2">
                              {children}
                            </blockquote>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-1">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-2.5 mb-1">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 mb-1">
                              {children}
                            </h3>
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>

                      {/* AI Response Footer: Copy button & timestamp */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                        <span className="font-mono">
                          {msg.createdAt
                            ? moment(msg.createdAt).format("hh:mm A")
                            : ""}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.text, index)}
                          className="flex items-center gap-1 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
                          title="Copy response"
                        >
                          {copiedIndex === index ? (
                            <>
                              <HiCheck className="text-emerald-500" size={13} />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <HiOutlineClipboardDocument size={13} />
                              <span>Copy response</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {isUser && (
                    <p className="text-[10px] text-teal-100 text-right mt-1 font-mono">
                      {msg.createdAt
                        ? moment(msg.createdAt).format("hh:mm A")
                        : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Thinking / Loading Animation */}
          {loading && (
            <div className="flex gap-3 justify-start items-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-teal-500 flex items-center justify-center text-white flex-shrink-0 shadow-xs mt-1">
                <HiSparkles size={16} className="animate-spin-slow" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-xs bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-bounce"></span>
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Gemini is thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </section>

      {/* Input Area */}
      <footer className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 transition-colors">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="max-w-4xl mx-auto flex items-end gap-2"
        >
          <div className="flex-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700 focus-within:border-teal-500 dark:focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all px-3 py-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask Gemini anything... (Press Enter to send, Shift+Enter for new line)"
              className="w-full bg-transparent outline-none resize-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 max-h-32 leading-relaxed"
              style={{ minHeight: "24px" }}
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all shadow-md hover:shadow-teal-500/20 cursor-pointer"
            title="Send Message"
          >
            <IoMdSend size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default AiMessage;
