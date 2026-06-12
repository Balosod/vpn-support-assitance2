interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
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
        <p className="whitespace-pre-wrap break-words">{content}</p>
      </div>
    </div>
  );
}
