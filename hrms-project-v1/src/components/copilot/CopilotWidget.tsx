"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  Bot,
  Send,
  X,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  Compass,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useViewMode } from "@/context/ViewModeContext";

interface Message {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: Date;
  actions?: { label: string; url: string; variant?: "default" | "outline" | "secondary" }[];
  suggestedQuestions?: string[];
  source?: "knowledge_base" | "llm";
}

function generateCopilotMessageId(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

export function CopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { user, activeRole } = useViewMode();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Load welcome prompt when opened or when route changes significantly
  useEffect(() => {
    if (messages.length === 0) {
      loadInitialGreeting();
    }
  }, [pathname]);

  const loadInitialGreeting = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "", // empty triggers greeting
          currentRoute: pathname,
          role: activeRole || "EMPLOYEE",
        }),
      });
      const data = await res.json();
      setMessages([
        {
          id: generateCopilotMessageId("welcome"),
          sender: "copilot",
          text: data.reply,
          timestamp: new Date(),
          actions: data.suggestedActions,
          suggestedQuestions: data.suggestedQuestions,
          source: data.source,
        },
      ]);
    } catch (e) {
      console.error("Failed to load Copilot greeting:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: generateCopilotMessageId("user"),
      sender: "user",
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          currentRoute: pathname,
          role: activeRole || "EMPLOYEE",
        }),
      });

      const data = await res.json();
      const botMessage: Message = {
        id: generateCopilotMessageId("copilot"),
        sender: "copilot",
        text: data.reply,
        timestamp: new Date(),
        actions: data.suggestedActions,
        suggestedQuestions: data.suggestedQuestions,
        source: data.source,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: generateCopilotMessageId("error"),
          sender: "copilot",
          text: "I encountered an issue connecting to the knowledge assistant. Please try again or check our documentation.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (url: string) => {
    router.push(url);
  };

  // Get current page friendly name
  const getCurrentPageName = () => {
    if (!pathname) return "Workspace";
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] || "dashboard";
    return last.charAt(0).toUpperCase() + last.slice(1).replace("-", " ");
  };

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 cursor-pointer"
          aria-label="Open Gpilot"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 animate-pulse text-amber-200" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
            </span>
          </div>
          <span className="text-sm font-semibold tracking-wide">Gpilot</span>
        </button>
      )}

      {/* Copilot Window */}
      {isOpen && (
        <div className="flex flex-col w-[380px] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[82vh] bg-background/95 backdrop-blur-md rounded-2xl shadow-2xl border border-border overflow-hidden transition-all duration-200 animate-in fade-in-50 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Gpilot</h3>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-muted-foreground">
                    Guide
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Compass className="w-3 h-3 text-primary/70" />
                  Viewing: <span className="font-medium text-foreground">{getCurrentPageName()}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={loadInitialGreeting}
                title="Reset conversation"
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                title="Minimize Gpilot"
                className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm momentum-scroll">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "copilot" && (
                  <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                    m.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-xs"
                      : "bg-muted/60 text-foreground border border-border/50 rounded-tl-xs"
                  }`}
                >
                  {/* Message Text with Simple Line Break Formatting */}
                  <div className="whitespace-pre-wrap leading-relaxed text-[13px]">
                    {formatMessageText(m.text)}
                  </div>

                  {/* Action Shortcuts */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-border/40 flex flex-wrap gap-1.5">
                      {m.actions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(act.url)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-background text-foreground border border-border hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer shadow-xs"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 text-primary" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Suggested Follow-up Questions */}
                  {m.suggestedQuestions && m.suggestedQuestions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-border/40 space-y-1.5">
                      <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> Suggested next steps:
                      </p>
                      <div className="flex flex-col gap-1">
                        {m.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="text-left text-xs text-primary hover:underline py-0.5 transition-colors cursor-pointer"
                          >
                            • {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-center text-muted-foreground">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
                <div className="bg-muted/50 rounded-2xl px-4 py-2 border border-border/40 text-xs text-muted-foreground">
                  Finding the best guide...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-muted/30 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask how to do anything in HRMS..."
                className="flex-1 text-xs h-9 bg-background focus-visible:ring-primary/30"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isLoading}
                className="h-9 px-3 gap-1 rounded-lg"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <div className="flex justify-between items-center mt-2 px-1 text-[10px] text-muted-foreground">
              <span>Instant step-by-step assistance</span>
              <span className="text-primary/80">Role: {activeRole || "Employee"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Basic markdown parser for bold, bullet points and numbers
 */
function formatMessageText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

