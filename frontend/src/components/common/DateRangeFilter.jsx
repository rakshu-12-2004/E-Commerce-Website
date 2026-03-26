import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { format, subDays } from 'date-fns'
import clsx from 'clsx'

const PRESETS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
]

export default function DateRangeFilter({ startDate, endDate, onChange }) {
  const [open, setOpen] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')

  const applyPreset = (days) => {
    const start = format(subDays(new Date(), days - 1), 'yyyy-MM-dd')
    onChange({ start_date: start, end_date: today })
    setOpen(false)
  }

  const displayLabel = startDate && endDate
    ? `${startDate} → ${endDate}`
    : 'Select range'

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="btn-secondary text-xs gap-2">
        <Calendar size={14} />
        <span className="hidden sm:inline">{displayLabel}</span>
        <ChevronDown size={12} className={clsx('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#1e2535] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-white/[0.06]">
            <p className="text-xs text-white/40 font-medium mb-2">Quick select</p>
            <div className="flex gap-2">
              {PRESETS.map(p => (
                <button key={p.days} onClick={() => applyPreset(p.days)}
                  className="flex-1 text-center text-xs py-1.5 rounded-lg bg-white/5 hover:bg-brand-500/20 hover:text-brand-300 text-white/60 transition-colors">
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3 space-y-2">
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-widest mb-1 block">From</label>
              <input type="date" value={startDate || ''} max={endDate || today}
                onChange={e => onChange({ start_date: e.target.value, end_date: endDate })}
                className="input text-xs py-2"
              />
            </div>
            <div>
              <label className="text-[10px] text-white/30 uppercase tracking-widest mb-1 block">To</label>
              <input type="date" value={endDate || ''} min={startDate} max={today}
                onChange={e => onChange({ start_date: startDate, end_date: e.target.value })}
                className="input text-xs py-2"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
