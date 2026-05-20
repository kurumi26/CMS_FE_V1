import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  LayoutDashboard, Globe, Layers, Users, Image, BarChart2,
  Settings, LogOut, ChevronRight, Plus
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BrandLogo from '../components/BrandLogo'

const navItems = [
  { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/app/sites', icon: Globe, label: 'My Sites' },
  { path: '/app/templates', icon: Layers, label: 'Templates' },
  { path: '/app/media', icon: Image, label: 'Media' },
  { path: '/app/team', icon: Users, label: 'Team' },
  { path: '/app/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('jaycms.sidebarCollapsed') === 'true')

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('jaycms.sidebarCollapsed', String(next))
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-surface)' }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col h-full flex-shrink-0 overflow-hidden"
        style={{ background: 'var(--color-surface-2)', borderRight: '1px solid var(--color-border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <BrandLogo size={36} alt="CMS Logo" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg tracking-tight gradient-text whitespace-nowrap"
              >
                Jay CMS
              </motion.span>
            )}
          </AnimatePresence>
          <button onClick={toggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="ml-auto p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-200"
          >
            <motion.div animate={{ rotate: collapsed ? 0 : 180 }}>
              <ChevronRight size={15} />
            </motion.div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative ${
                  isActive
                    ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'rgba(var(--color-primary-rgb),0.15)', color: 'var(--color-primary)' } : {}}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div layoutId="sidebar-indicator"
                      className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
                      style={{ background: 'var(--color-primary)' }}
                    />
                  )}
                  <Icon size={18} className="flex-shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Quick Create */}
        <div className="px-2 pb-2">
          <button
            onClick={() => navigate('/app/sites')}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}
          >
            <Plus size={16} className="flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">
                  New Site
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-slate-200">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button onClick={handleLogout} className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
