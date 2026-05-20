import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import { BarChart2, Eye, Globe, Smartphone, Monitor, TrendingUp } from 'lucide-react'

interface Overview {
  total_views: number
  unique_visitors: number
  avg_time_on_page: number
  bounce_rate: number
  by_day: { date: string; views: number }[]
  top_pages: { slug: string; views: number }[]
  devices: { device: string; count: number }[]
}

export default function AnalyticsPage() {
  const { siteId } = useParams<{ siteId: string }>()
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!siteId) return
    api.get(`/analytics/${siteId}/overview`).then(r => setData(r.data)).finally(() => setLoading(false))
  }, [siteId])

  if (loading) return <div className="p-8 text-slate-400">Loading analytics...</div>
  if (!data) return <div className="p-8 text-slate-400">No analytics data available.</div>

  const maxViews = Math.max(...(data.by_day?.map(d => d.views) || [1]), 1)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Analytics</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Views', value: data.total_views?.toLocaleString(), icon: Eye, color: '#6366f1' },
          { label: 'Unique Visitors', value: data.unique_visitors?.toLocaleString(), icon: Globe, color: '#10b981' },
          { label: 'Avg. Time (s)', value: data.avg_time_on_page, icon: TrendingUp, color: '#f59e0b' },
          { label: 'Bounce Rate', value: `${data.bounce_rate}%`, icon: BarChart2, color: '#ef4444' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">{kpi.label}</p>
              <kpi.icon size={18} style={{ color: kpi.color }} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{kpi.value ?? '—'}</p>
          </div>
        ))}
      </div>

      {/* Page views chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-slate-800 mb-4">Page Views (Last 30 Days)</h2>
        {data.by_day?.length ? (
          <div className="flex items-end gap-1 h-40">
            {data.by_day.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full rounded-t transition-all hover:opacity-80"
                  style={{ height: `${(d.views / maxViews) * 100}%`, background: '#6366f1', minHeight: '2px' }}
                  title={`${d.date}: ${d.views}`} />
              </div>
            ))}
          </div>
        ) : <p className="text-slate-400 text-sm">No data yet.</p>}
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>{data.by_day?.[0]?.date}</span>
          <span>{data.by_day?.[data.by_day.length - 1]?.date}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top pages */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Top Pages</h2>
          {data.top_pages?.length ? (
            <div className="flex flex-col gap-2">
              {data.top_pages.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 truncate">{p.slug || '/'}</span>
                  <span className="font-semibold text-slate-900 ml-4">{p.views}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-400 text-sm">No page data.</p>}
        </div>

        {/* Devices */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Devices</h2>
          {data.devices?.length ? (
            <div className="flex flex-col gap-3">
              {data.devices.map((d, i) => {
                const total = data.devices.reduce((s, x) => s + x.count, 0)
                const pct = total ? Math.round((d.count / total) * 100) : 0
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 capitalize">{d.device}</span>
                      <span className="text-slate-500">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#6366f1' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : <p className="text-slate-400 text-sm">No device data.</p>}
        </div>
      </div>
    </div>
  )
}
