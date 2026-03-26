import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, parseISO } from 'date-fns'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1e2535] border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-xs text-white/40 mb-1">{label}</p>
      <p className="text-white font-semibold">{payload[0].value} orders</p>
    </div>
  )
}

export default function OrdersBarChart({ data = [], loading }) {
  const formatted = data.map(d => ({
    ...d,
    label: (() => { try { return format(parseISO(d.date), 'MMM d') } catch { return d.date } })()
  }))

  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} barSize={8}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Sora' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'Sora' }}
          axisLine={false}
          tickLine={false}
          width={35}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
          {formatted.map((_, i) => (
            <Cell key={i} fill={`rgba(139, 92, 246, ${0.4 + (i / formatted.length) * 0.6})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
