interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

export default function ChatMessage({
  role,
  content,
  isTyping = false,
}: ChatMessageProps) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-[28px] px-4 py-3 text-sm leading-6 shadow-sm ${
          isUser
            ? "bg-sky-600 text-white rounded-br-none"
            : "bg-slate-100 text-slate-900 rounded-bl-none"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">
          {content}
          {isTyping ? (
            <span className="ml-1 inline-block h-5 w-[1px] animate-pulse rounded-sm bg-slate-500 align-bottom" />
          ) : null}
        </p>
      </div>
    </div>
  );
}
