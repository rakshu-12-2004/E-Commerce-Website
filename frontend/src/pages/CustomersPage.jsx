import { useState, useEffect } from 'react'
import { Search, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { customersAPI } from '../services/api'
import { useDebounce } from '../hooks/useFetch'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await customersAPI.getCustomers({
        search: debouncedSearch || undefined,
        page,
        page_size: 15,
      })
      setCustomers(res.data.customers)
      setTotal(res.data.total)
      setTotalPages(Math.ceil(res.data.total / 15))
    } catch { toast.error('Failed to load customers') }
    finally { setLoading(false) }
  }

  useEffect(() => { setPage(1) }, [debouncedSearch])
  useEffect(() => { fetch() }, [page, debouncedSearch])

  const getInitials = name => name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
  const AVATAR_COLORS = ['from-brand-400 to-brand-600', 'from-violet-400 to-violet-600', 'from-green-400 to-green-600', 'from-amber-400 to-amber-600', 'from-pink-400 to-pink-600']

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-white/35 mt-0.5">{total.toLocaleString()} total customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input className="input pl-9 text-sm" placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-white/30">
                <th className="text-left py-3.5 px-5 text-xs font-medium uppercase tracking-wider">Customer</th>
                <th className="text-left py-3.5 px-4 text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Location</th>
                <th className="text-right py-3.5 px-4 text-xs font-medium uppercase tracking-wider">Orders</th>
                <th className="text-right py-3.5 px-4 text-xs font-medium uppercase tracking-wider">Total Spent</th>
                <th className="text-right py-3.5 px-5 text-xs font-medium uppercase tracking-wider hidden lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td className="py-3.5 px-5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" /><div className="space-y-1.5"><div className="h-3 bg-white/5 rounded w-24 animate-pulse" /><div className="h-2 bg-white/5 rounded w-32 animate-pulse" /></div></div></td>
                    {[1,2,3,4].map(j => <td key={j} className="py-3.5 px-4"><div className="h-3 bg-white/5 rounded w-16 ml-auto animate-pulse" /></td>)}
                  </tr>
                ))
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-16"><Users size={28} className="text-white/10 mx-auto mb-2" /><p className="text-white/25 text-sm">No customers found</p></td></tr>
              ) : customers.map((c, idx) => (
                <tr key={c.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <p className="text-white/80 font-medium">{c.name}</p>
                        <p className="text-white/30 text-xs">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 hidden sm:table-cell text-white/40 text-xs">{c.city || '—'}</td>
                  <td className="py-3.5 px-4 text-right text-white/60">{c.total_orders}</td>
                  <td className="py-3.5 px-4 text-right font-mono text-white/80">${Number(c.total_spent).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="py-3.5 px-5 text-right text-white/30 text-xs hidden lg:table-cell">
                    {format(new Date(c.joined_at), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <p className="text-xs text-white/30">Page {page} of {totalPages} · {total} total</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 text-white/50 hover:text-white transition-colors">
                <ChevronLeft size={15} />
              </button>
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
