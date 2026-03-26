import clsx from 'clsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function Skeleton() {
  return <div className="animate-pulse">
    <div className="h-3 w-20 bg-white/10 rounded mb-4" />
    <div className="h-8 w-32 bg-white/10 rounded mb-3" />
    <div className="h-3 w-24 bg-white/5 rounded" />
  </div>
}

export default function KPICard({ title, value, growth, icon: Icon, color, loading, prefix = '', suffix = '' }) {
  const isPositive = growth > 0
  const isNeutral = growth === 0 || growth == null

  const colorMap = {
    blue:   { bg: 'bg-brand-500/10',  icon: 'text-brand-400',  border: 'hover:border-brand-500/30' },
    green:  { bg: 'bg-green-500/10',  icon: 'text-green-400',  border: 'hover:border-green-500/30' },
    violet: { bg: 'bg-violet-500/10', icon: 'text-violet-400', border: 'hover:border-violet-500/30' },
    amber:  { bg: 'bg-amber-500/10',  icon: 'text-amber-400',  border: 'hover:border-amber-500/30' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div className={clsx('stat-card', c.border)}>
      {/* Subtle gradient */}
      <div className={clsx('absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -mr-8 -mt-8', c.bg)} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/35">{title}</p>
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', c.bg)}>
            <Icon size={17} className={c.icon} />
          </div>
        </div>

        {loading ? <Skeleton /> : (
          <>
            <p className="text-3xl font-bold text-white mb-1 tracking-tight">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            {growth != null && (
              <div className={clsx('flex items-center gap-1.5 text-xs font-medium',
                isNeutral ? 'text-white/30' : isPositive ? 'text-green-400' : 'text-red-400')}>
                {isNeutral ? <Minus size={12} /> : isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                <span>{isPositive ? '+' : ''}{growth}%</span>
                <span className="text-white/25 font-normal">vs prev period</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
