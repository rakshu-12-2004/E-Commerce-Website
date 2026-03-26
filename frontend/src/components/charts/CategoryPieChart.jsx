import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#3d5ffe', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-[#1e2535] border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-white font-semibold text-sm">{d.category}</p>
      <p className="text-white/60 text-xs mt-1">${Number(d.revenue).toLocaleString()}</p>
      <p className="text-white/40 text-xs">{d.percentage}% of total</p>
    </div>
  )
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  if (percentage < 5) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontFamily="Sora" fontWeight={600}>
      {percentage}%
    </text>
  )
}

export default function CategoryPieChart({ data = [], loading }) {
  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
    </div>
  )

  if (!data.length) return (
    <div className="h-64 flex items-center justify-center text-white/30 text-sm">No data available</div>
  )

  return (
    <div className="flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="revenue"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={95}
            innerRadius={55}
            labelLine={false}
            label={<CustomLabel />}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-1.5">
        {data.map((d, i) => (
          <div key={d.category} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-white/50 truncate">{d.category}</span>
            <span className="text-white/30 ml-auto flex-shrink-0">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
