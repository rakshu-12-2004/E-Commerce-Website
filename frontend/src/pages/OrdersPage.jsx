import { useState, useEffect } from 'react'
import { format, subDays } from 'date-fns'
import { Search, Download, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import DateRangeFilter from '../components/common/DateRangeFilter'
import { salesAPI } from '../services/api'
import { useDebounce } from '../hooks/useFetch'
import clsx from 'clsx'

const today = format(new Date(), 'yyyy-MM-dd')
const defaultStart = format(subDays(new Date(), 29), 'yyyy-MM-dd')

const STATUS_STYLES = {
  completed: 'bg-green-500/10 text-green-400',
  pending:   'bg-amber-500/10 text-amber-400',
  shipped:   'bg-brand-500/10 text-brand-400',
  cancelled: 'bg-red-500/10 text-red-400',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [dates, setDates] = useState({ start_date: defaultStart, end_date: today })
  const [exporting, setExporting] = useState(false)
  const debouncedSearch = useDebounce(search, 400)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await salesAPI.getOrders({
        ...dates,
        search: debouncedSearch || undefined,
        status: status || undefined,
        page,
        page_size: 15,
      })
      setOrders(res.data.orders)
      setTotal(res.data.total)
      setTotalPages(res.data.total_pages)
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }

  useEffect(() => { setPage(1) }, [debouncedSearch, status, dates])
  useEffect(() => { fetchOrders() }, [page, debouncedSearch, status, dates])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await salesAPI.exportCSV(dates)
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url; a.download = `orders-${dates.start_date}-to-${dates.end_date}.csv`; a.click()
      URL.revokeObjectURL(url)
      toast.success('Exported!')
    } catch { toast.error('Export failed') }
    finally { setExporting(false) }
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-white/35 mt-0.5">{total.toLocaleString()} total orders</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DateRangeFilter startDate={dates.start_date} endDate={dates.end_date}
            onChange={({ start_date, end_date }) => setDates(p => ({ ...p, ...(start_date && { start_date }), ...(end_date && { end_date }) }))} />
          <button onClick={fetchOrders} className="btn-secondary p-2.5"><RefreshCw size={14} /></button>
          <button onClick={handleExport} disabled={exporting} className="btn-primary text-xs">
            {exporting ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={14} />}
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              className="input pl-9 text-sm"
              placeholder="Search orders, customers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} className="input text-sm w-full sm:w-40">
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-white/30">
                <th className="text-left py-3.5 px-5 text-xs font-medium uppercase tracking-wider">Order</th>
                <th className="text-left py-3.5 px-4 text-xs font-medium uppercase tracking-wider hidden md:table-cell">Customer</th>
                <th className="text-left py-3.5 px-4 text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="text-right py-3.5 px-4 text-xs font-medium uppercase tracking-wider">Amount</th>
                <th className="text-right py-3.5 px-5 text-xs font-medium uppercase tracking-wider hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {[5, 4, 4, 4, 5].map((px, j) => (
                      <td key={j} className={`py-3.5 px-${px} ${j === 1 ? 'hidden md:table-cell' : ''} ${j === 4 ? 'hidden lg:table-cell' : ''}`}>
                        <div className="h-3 bg-white/5 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16 text-white/25 text-sm">No orders found</td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-5">
                    <span className="text-white/70 font-mono text-xs">{o.order_number}</span>
                  </td>
                  <td className="py-3.5 px-4 hidden md:table-cell">
                    <p className="text-white/80 font-medium">{o.customer_name}</p>
                    <p className="text-white/30 text-xs">{o.customer_email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={clsx('badge capitalize', STATUS_STYLES[o.status] || 'bg-white/5 text-white/40')}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-white/80">
                    ${Number(o.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-5 text-right text-white/35 text-xs hidden lg:table-cell">
                    {format(new Date(o.created_at), 'MMM d, yyyy HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <p className="text-xs text-white/30">
              Page {page} of {totalPages} · {total} total
            </p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 text-white/50 hover:text-white transition-colors">
                <ChevronLeft size={15} />
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                return (
                  <button key={pg} onClick={() => setPage(pg)}
                    className={clsx('w-7 h-7 rounded-lg text-xs transition-colors',
                      page === pg ? 'bg-brand-500 text-white' : 'hover:bg-white/5 text-white/40 hover:text-white')}>
                    {pg}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 text-white/50 hover:text-white transition-colors">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
