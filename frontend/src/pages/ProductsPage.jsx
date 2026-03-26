import { useState } from 'react'
import { Search, Package } from 'lucide-react'
import { productsAPI } from '../services/api'
import { usePolling, useDebounce } from '../hooks/useFetch'
import clsx from 'clsx'

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const debouncedSearch = useDebounce(search)

  const { data: categories } = usePolling(productsAPI.getCategories, null, 60000, [])
  const { data: products, loading } = usePolling(
    productsAPI.getProducts,
    { search: debouncedSearch || undefined, category_id: categoryId || undefined },
    60000,
    [debouncedSearch, categoryId]
  )

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-sm text-white/35 mt-0.5">{(products || []).length} products</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input className="input pl-9 text-sm" placeholder="Search products…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input text-sm w-full sm:w-44">
            <option value="">All Categories</option>
            {(categories || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/5" />
              <div className="h-3 bg-white/5 rounded w-3/4" />
              <div className="h-2.5 bg-white/5 rounded w-1/2" />
              <div className="flex justify-between">
                <div className="h-4 bg-white/5 rounded w-1/3" />
                <div className="h-4 bg-white/5 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (products || []).length === 0 ? (
        <div className="card text-center py-16">
          <Package size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(products || []).map(p => (
            <div key={p.id} className="card hover:border-white/15 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                <Package size={18} className="text-brand-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 leading-snug">{p.name}</h3>
              <p className="text-xs text-white/30 font-mono mb-3">{p.sku}</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white">${Number(p.price).toFixed(2)}</span>
                <span className={clsx('badge text-xs', p.stock > 20 ? 'bg-green-500/10 text-green-400' : p.stock > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400')}>
                  {p.stock} in stock
                </span>
              </div>
              <div className="mt-2">
                <span className={clsx('badge text-xs', p.is_active ? 'bg-green-500/5 text-green-500/60' : 'bg-red-500/5 text-red-500/60')}>
                  {p.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
