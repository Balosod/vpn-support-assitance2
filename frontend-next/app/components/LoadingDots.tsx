export default function LoadingDots() {
  return (
    <div className="flex justify-start">
      <div className="rounded-[28px] bg-slate-100 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full bg-slate-500 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-2.5 w-2.5 rounded-full bg-slate-500 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2.5 w-2.5 rounded-full bg-slate-500 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
          <span className="text-sm text-slate-500">Typing...</span>
        </div>
      </div>
    </div>
  );
}
