"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Images,
  Swords,
  LayoutDashboard,
  Megaphone,
  Crosshair,
  ArrowUp,
  AlertCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ChatBubble } from "@/components/home/chat-bubble";
import { LoadingIndicator } from "@/components/home/loading-indicator";

type FollowUp = {
  label: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
};

const FOLLOW_UPS: FollowUp[] = [
  {
    label: "More visual references",
    prompt: "Suggest more visual reference directions for this brand.",
    icon: Images,
  },
  {
    label: "Compare competitors",
    prompt: "Compare this brand against its main competitors.",
    icon: Swords,
  },
  {
    label: "Build a moodboard",
    prompt: "Describe a moodboard direction I could build for this brand.",
    icon: LayoutDashboard,
  },
  {
    label: "Campaign ideas",
    prompt: "Give me a few campaign ideas grounded in this brand's positioning.",
    icon: Megaphone,
  },
  {
    label: "Refine positioning",
    prompt: "How could this brand's positioning be sharpened?",
    icon: Crosshair,
  },
];

export type ChatMessageItem = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatPanelProps = {
  projectId: string;
  prompt: string;
  title: string;
  summary: string;
  confidenceLabel?: string | null;
  initialMessages?: ChatMessageItem[];
  className?: string;
};

type ChatApiResponse = {
  userMessage?: ChatMessageItem;
  assistantMessage?: ChatMessageItem;
  error?: string;
};

/**
 * Persistent, functional AI chat panel. Replays the original prompt + audit
 * summary, renders saved follow-up turns, and sends new messages to
 * POST /api/projects/[projectId]/chat.
 */
export function WorkspaceChatPanel({
  projectId,
  prompt,
  title,
  summary,
  confidenceLabel,
  initialMessages = [],
  className,
}: ChatPanelProps) {
  const [messages, setMessages] =
    React.useState<ChatMessageItem[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const send = React.useCallback(
    async (raw: string) => {
      const content = raw.trim();
      if (!content || sending) return;

      setError(null);
      const optimisticId = `tmp-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: optimisticId, role: "user", content },
      ]);
      setInput("");
      setSending(true);

      try {
        const res = await fetch(`/api/projects/${projectId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        });
        const data = (await res.json()) as ChatApiResponse;
        if (!res.ok || !data.assistantMessage) {
          throw new Error(data.error ?? "Failed to get a reply.");
        }

        setMessages((prev) => {
          const next = prev.filter((m) => m.id !== optimisticId);
          if (data.userMessage) next.push(data.userMessage);
          if (data.assistantMessage) next.push(data.assistantMessage);
          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setSending(false);
      }
    },
    [projectId, sending]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  const canSend = input.trim().length > 0 && !sending;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center gap-2 px-1 pb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[hsl(280_70%_60%)] text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">{title}</p>
          <p className="text-xs text-muted-foreground">AI strategist</p>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-0.5 pb-2 scrollbar-thin"
      >
        {/* Audit intro — always shown */}
        <ChatBubble role="user">{prompt || title}</ChatBubble>
        <ChatBubble role="assistant">
          <div className="space-y-2.5">
            <p>Here&apos;s what I found for {title}.</p>
            {summary && (
              <p className="text-[14px] text-muted-foreground">{summary}</p>
            )}
            {confidenceLabel && (
              <p className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-2.5 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                {confidenceLabel}
              </p>
            )}
            <p className="text-[14px]">Ask me anything about this brand.</p>
          </div>
        </ChatBubble>

        {/* Saved + live conversation */}
        {messages.map((m) => (
          <ChatBubble key={m.id} role={m.role}>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </ChatBubble>
        ))}

        {sending && (
          <ChatBubble role="assistant">
            <LoadingIndicator label="Thinking…" />
          </ChatBubble>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Suggested follow-ups — send real messages */}
      <div className="flex flex-wrap gap-1.5 px-0.5 pb-2.5 pt-3">
        {FOLLOW_UPS.map((item) => (
          <motion.button
            key={item.label}
            type="button"
            disabled={sending}
            onClick={() => void send(item.prompt)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <item.icon className="h-3 w-3 text-primary" />
            {item.label}
          </motion.button>
        ))}
      </div>

      {/* Composer */}
      <div className="px-0.5">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border bg-card/50 px-3 py-2 transition-colors",
            "border-border/60 focus-within:border-primary/40"
          )}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            rows={1}
            placeholder="Ask a follow-up…"
            className="max-h-28 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-60"
          />
          <button
            type="button"
            aria-label="Send"
            disabled={!canSend}
            onClick={() => void send(input)}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all",
              canSend
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-secondary text-muted-foreground"
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
        <AnimatePresence />
      </div>
    </div>
  );
}
