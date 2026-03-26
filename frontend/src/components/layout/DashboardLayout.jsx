import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-hot-toast'
import {
  BarChart3, LayoutDashboard, ShoppingCart, Package, Users,
  LogOut, Menu, X, Bell, ChevronDown, TrendingUp
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Signed out')
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0c1120]">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-[#131929] border-r border-white/[0.06] transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-sm flex-shrink-0">
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-base leading-none">SalesIQ</span>
            <p className="text-[10px] text-white/30 mt-0.5">Analytics Dashboard</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-white/30 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 mb-3">Main</p>
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-brand-400' : ''} />
                  {label}
                  {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />}
                </>
              )}
            </NavLink>
          ))}

          <div className="mt-6 pt-4 border-t border-white/[0.06]">
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-widest px-3 mb-3">System</p>
            <div className="px-3 py-2.5 rounded-xl bg-brand-500/8 border border-brand-500/15">
              <div className="flex items-center gap-2 text-brand-300 text-xs font-medium">
                <TrendingUp size={14} />
                Live Tracking Active
              </div>
              <p className="text-white/30 text-[11px] mt-0.5">Auto-refresh every 30s</p>
            </div>
          </div>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.full_name?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name || user?.username}</p>
              <p className="text-[11px] text-white/30 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} title="Sign out"
              className="text-white/20 hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.06] bg-[#131929]/50 backdrop-blur-sm flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/50 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
            <span className="text-xs text-white/30 hidden sm:block">Live</span>
          </div>
          <button className="relative p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-400 rounded-full" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-xl px-3 py-2 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.full_name?.[0] || user?.username?.[0] || 'U'}
            </div>
            <span className="text-sm text-white/70 hidden sm:block">{user?.username}</span>
            <ChevronDown size={14} className="text-white/30" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
