import { SessionAnalytics } from "../../lib/chat";

interface AnalyticsPanelProps {
  analytics: SessionAnalytics;
  showAnalytics: boolean;
  onToggle: () => void;
}

export default function AnalyticsPanel({
  analytics,
  showAnalytics,
  onToggle,
}: AnalyticsPanelProps) {
  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          {showAnalytics ? "Hide analytics" : "Show analytics"}
        </button>
      </div>

      {showAnalytics && (
        <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs text-slate-600">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="uppercase tracking-[0.3em] text-slate-500">
                Session
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {analytics.sessionId}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="uppercase tracking-[0.3em] text-slate-500">
                Requests
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {analytics.requests}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="uppercase tracking-[0.3em] text-slate-500">
                Messages
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {analytics.messagesExchanged}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="uppercase tracking-[0.3em] text-slate-500">
                Off-topic
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {analytics.offTopicRequests}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="uppercase tracking-[0.3em] text-slate-500">
                Avg latency
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {Math.round(analytics.averageResponseTimeMs)} ms
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="uppercase tracking-[0.3em] text-slate-500">
                Last interaction
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {new Date(analytics.lastInteraction).toLocaleString()}
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
