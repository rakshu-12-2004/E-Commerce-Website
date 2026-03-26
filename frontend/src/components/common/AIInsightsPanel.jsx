import { useFetch } from '../../hooks/useFetch'
import { dashboardAPI } from '../../services/api'
import { Sparkles, RefreshCw } from 'lucide-react'

export default function AIInsightsPanel() {
  const { data, loading, error, refetch } = useFetch(dashboardAPI.getAIInsights, null, [])

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Insights</h3>
            <p className="text-[10px] text-white/30">Trend analysis & recommendations</p>
          </div>
        </div>
        <button onClick={refetch} disabled={loading}
          className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/5 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-2.5 bg-white/5 rounded w-full" />
                <div className="h-2.5 bg-white/5 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-400/60 text-xs">{error}</p>}

      {data?.insights && (
        <div className="space-y-3">
          {data.insights.map((ins, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition-colors">
              <span className="text-lg leading-none flex-shrink-0 mt-0.5">{ins.icon}</span>
              <div>
                <p className="text-xs font-semibold text-white/80 mb-0.5">{ins.title}</p>
                <p className="text-xs text-white/40 leading-relaxed">{ins.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.generated_at && (
        <p className="text-[10px] text-white/15 mt-3">
          Generated: {new Date(data.generated_at).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}
