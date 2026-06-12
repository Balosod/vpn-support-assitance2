export default function ChatHeader() {
  return (
    <header className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">
            VPN Support
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            AI VPN Assistant
          </h1>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-right">
          Ask anything about VPN setup, troubleshooting, server choice, billing,
          and performance.
        </p>
      </div>
    </header>
  );
}
