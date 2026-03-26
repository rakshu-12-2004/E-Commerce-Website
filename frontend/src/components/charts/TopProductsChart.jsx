import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1e2535] border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-white/50 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold">${Number(payload[0].value).toLocaleString()}</p>
      <p className="text-white/40 text-xs">{payload[1]?.value} units</p>
    </div>
  )
}

export default function TopProductsChart({ data = [], loading }) {
  if (loading) return (
    <div className="h-64 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )

  const chartData = data.slice(0, 8).map(p => ({
    name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name,
    revenue: p.revenue,
    units: p.units_sold,
  }))

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barSize={6}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'Sora' }}
            axisLine={false} tickLine={false}
            tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Sora' }}
            axisLine={false} tickLine={false}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} fillOpacity={0.85} />
        </BarChart>
      </ResponsiveContainer>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/30 border-b border-white/[0.06]">
              <th className="text-left py-2 font-medium">#</th>
              <th className="text-left py-2 font-medium">Product</th>
              <th className="text-left py-2 font-medium hidden sm:table-cell">Category</th>
              <th className="text-right py-2 font-medium">Revenue</th>
              <th className="text-right py-2 font-medium">Units</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 6).map((p, i) => (
              <tr key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="py-2.5 text-white/20 font-mono">{String(i+1).padStart(2,'0')}</td>
                <td className="py-2.5">
                  <p className="text-white/80 font-medium truncate max-w-[140px]">{p.name}</p>
                  <p className="text-white/30 font-mono text-[10px]">{p.sku}</p>
                </td>
                <td className="py-2.5 hidden sm:table-cell">
                  <span className="badge bg-white/5 text-white/40">{p.category}</span>
                </td>
                <td className="py-2.5 text-right text-white/70 font-mono">${Number(p.revenue).toLocaleString()}</td>
                <td className="py-2.5 text-right text-white/50">{p.units_sold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
