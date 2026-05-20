import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe, BarChart2, Users, Zap, Plus, ArrowRight, TrendingUp, Eye } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import type { Site } from '../types'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/sites').then(r => { setSites(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Total Sites', value: sites.length, icon: Globe, color: '#6366f1' },
    { label: 'Published', value: sites.filter(s => s.status === 'published').length, icon: Eye, color: '#10b981' },
    { label: 'Draft Sites', value: sites.filter(s => s.status === 'draft').length, icon: TrendingUp, color: '#f59e0b' },
    { label: 'Total Pages', value: sites.reduce((a, s) => a + (s.pages_count || 0), 0), icon: BarChart2, color: '#a855f7' },
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-400">Here's what's happening with your websites today.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-xl p-5" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">{stat.label}</span>
              <div className="p-2 rounded-lg" style={{ background: `${stat.color}20` }}>
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Sites */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Sites</h2>
            <button onClick={() => navigate('/app/sites')} className="text-sm flex items-center gap-1 text-indigo-400 hover:text-indigo-300">
              View all <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: 'var(--color-surface-2)' }} />
              ))
            ) : sites.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-xl p-12 text-center" style={{ background: 'var(--color-surface-2)', border: '2px dashed var(--color-border)' }}>
                <Globe size={40} className="text-slate-600 mx-auto mb-4" />
                <h3 className="text-white font-medium mb-2">No sites yet</h3>
                <p className="text-slate-400 text-sm mb-4">Create your first website and start building.</p>
                <button onClick={() => navigate('/app/sites')}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                  Create Site
                </button>
              </motion.div>
            ) : (
              sites.slice(0, 5).map((site, i) => (
                <motion.div key={site.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-xl group cursor-pointer transition-all"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                  onClick={() => navigate(`/app/cms/${site.id}`)}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                    {site.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{site.name}</p>
                    <p className="text-xs text-slate-500">{site.pages_count || 0} pages · {site.status}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${site.status === 'published' ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'}`}>
                    {site.status}
                  </span>
                  <ArrowRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { icon: Plus, label: 'Create New Site', desc: 'Start from scratch or a template', action: () => navigate('/app/sites'), color: '#6366f1' },
              { icon: Layers, label: 'Browse Templates', desc: 'Start faster with pre-built templates', action: () => navigate('/app/templates'), color: '#a855f7' },
              { icon: Users, label: 'Invite Team Member', desc: 'Collaborate with your team', action: () => navigate('/app/team'), color: '#10b981' },
              { icon: Zap, label: 'AI Website Builder', desc: 'Generate a site with AI in seconds', action: () => navigate('/app/sites'), color: '#f59e0b' },
            ].map(({ icon: Icon, label, desc, action, color }) => (
              <button key={label} onClick={action}
                className="w-full flex items-center gap-3 p-4 rounded-xl text-left group transition-all"
                style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                <div className="p-2 rounded-lg flex-shrink-0" style={{ background: `${color}20` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Layers(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
}
