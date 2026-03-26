import { useState, useCallback } from 'react'
import { format, subDays } from 'date-fns'
import { DollarSign, ShoppingCart, Users, TrendingUp, Download, RefreshCw, Filter } from 'lucide-react'
import { toast } from 'react-hot-toast'
import KPICard from '../components/common/KPICard'
import DateRangeFilter from '../components/common/DateRangeFilter'
import RevenueChart from '../components/charts/RevenueChart'
import OrdersBarChart from '../components/charts/OrdersBarChart'
import CategoryPieChart from '../components/charts/CategoryPieChart'
import TopProductsChart from '../components/charts/TopProductsChart'
import AIInsightsPanel from '../components/common/AIInsightsPanel'
import { usePolling } from '../hooks/useFetch'
import { dashboardAPI, salesAPI, productsAPI } from '../services/api'

const today = format(new Date(), 'yyyy-MM-dd')
const defaultStart = format(subDays(new Date(), 29), 'yyyy-MM-dd')

export default function OverviewPage() {
  const [dates, setDates] = useState({ start_date: defaultStart, end_date: today })
  const [categoryId, setCategoryId] = useState('')
  const [exporting, setExporting] = useState(false)

  const params = { ...dates, ...(categoryId && { category_id: categoryId }) }

  const { data: kpi, loading: kpiLoading, refetch: refetchKPI } = usePolling(
    dashboardAPI.getKPI, params, 30000, [dates, categoryId]
  )
  const { data: revenue, loading: revLoading, refetch: refetchRev } = usePolling(
    dashboardAPI.getRevenueChart, params, 30000, [dates, categoryId]
  )
  const { data: categories, loading: catLoading } = usePolling(
    dashboardAPI.getCategorySales, params, 30000, [dates, categoryId]
  )
  const { data: topProducts, loading: topLoading } = usePolling(
    dashboardAPI.getTopProducts, params, 30000, [dates, categoryId]
  )
  const { data: catList } = usePolling(productsAPI.getCategories, null, 60000, [])

  const handleDateChange = ({ start_date, end_date }) => {
    setDates({ start_date: start_date || dates.start_date, end_date: end_date || dates.end_date })
  }

  const handleRefreshAll = () => { refetchKPI(); refetchRev(); toast.success('Data refreshed') }

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await salesAPI.exportCSV(params)
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `sales-report-${dates.start_date}-${dates.end_date}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report exported!')
    } catch { toast.error('Export failed') }
    finally { setExporting(false) }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-sm text-white/35 mt-0.5">
            {dates.start_date} — {dates.end_date}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="input py-2 text-xs w-36"
          >
            <option value="">All Categories</option>
            {(catList || []).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <DateRangeFilter
            startDate={dates.start_date}
            endDate={dates.end_date}
            onChange={handleDateChange}
          />

          <button onClick={handleRefreshAll} className="btn-secondary p-2.5">
            <RefreshCw size={14} />
          </button>

          <button onClick={handleExport} disabled={exporting} className="btn-primary text-xs">
            {exporting
              ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Download size={14} />}
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={kpi ? `$${Number(kpi.total_revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '—'}
          growth={kpi?.revenue_growth}
          icon={DollarSign}
          color="blue"
          loading={kpiLoading}
        />
        <KPICard
          title="Total Orders"
          value={kpi?.total_orders ?? '—'}
          growth={kpi?.orders_growth}
          icon={ShoppingCart}
          color="violet"
          loading={kpiLoading}
        />
        <KPICard
          title="Total Customers"
          value={kpi?.total_customers ?? '—'}
          growth={kpi?.customers_growth}
          icon={Users}
          color="green"
          loading={kpiLoading}
        />
        <KPICard
          title="Conversion Rate"
          value={kpi ? `${kpi.conversion_rate}%` : '—'}
          icon={TrendingUp}
          color="amber"
          loading={kpiLoading}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue Over Time</h3>
              <p className="text-xs text-white/30 mt-0.5">Daily revenue trend</p>
            </div>
            <span className="badge bg-brand-500/10 text-brand-400">Area chart</span>
          </div>
          <RevenueChart data={revenue || []} loading={revLoading} />
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Category Sales</h3>
              <p className="text-xs text-white/30 mt-0.5">Revenue by category</p>
            </div>
          </div>
          <CategoryPieChart data={categories || []} loading={catLoading} />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Orders Per Day</h3>
              <p className="text-xs text-white/30 mt-0.5">Daily order volume</p>
            </div>
          </div>
          <OrdersBarChart data={revenue || []} loading={revLoading} />
        </div>

        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Top Products</h3>
              <p className="text-xs text-white/30 mt-0.5">By revenue this period</p>
            </div>
          </div>
          <TopProductsChart data={topProducts || []} loading={topLoading} />
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <AIInsightsPanel />
        </div>
        <div className="lg:col-span-2 card">
          <h3 className="text-sm font-semibold text-white mb-4">Period Summary</h3>
          {kpi ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Avg Order Value', value: kpi.total_orders ? `$${(kpi.total_revenue / kpi.total_orders).toFixed(0)}` : '$0' },
                { label: 'Active Customers', value: kpi.active_customers ?? '—' },
                { label: 'Revenue Growth', value: `${kpi.revenue_growth > 0 ? '+' : ''}${kpi.revenue_growth}%` },
                { label: 'Orders Growth', value: `${kpi.orders_growth > 0 ? '+' : ''}${kpi.orders_growth}%` },
                { label: 'Customer Growth', value: `${kpi.customers_growth > 0 ? '+' : ''}${kpi.customers_growth}%` },
                { label: 'Conversion Rate', value: `${kpi.conversion_rate}%` },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-xs text-white/35 mb-1">{item.label}</p>
                  <p className="text-lg font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] animate-pulse">
                  <div className="h-2.5 bg-white/10 rounded w-2/3 mb-2" />
                  <div className="h-6 bg-white/5 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
