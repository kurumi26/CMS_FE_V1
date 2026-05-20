import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Globe, Edit3, Trash2, ExternalLink, Copy, Zap, X, Send, EyeOff, RotateCcw, Flame } from 'lucide-react'
import api from '../services/api'
import type { Site, Template } from '../types'
import toast from 'react-hot-toast'

// ─── Site thumbnail: gradient derived from name hash ────────────────────────
const GRADIENTS = [
  ['#6366f1', '#a855f7'],
  ['#0ea5e9', '#6366f1'],
  ['#10b981', '#0ea5e9'],
  ['#f59e0b', '#ef4444'],
  ['#ec4899', '#a855f7'],
  ['#14b8a6', '#6366f1'],
  ['#f97316', '#ec4899'],
  ['#8b5cf6', '#3b82f6'],
]

function nameHash(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return h % GRADIENTS.length
}

function SiteThumbnail({ site }: { site: Site }) {
  const [a, b] = GRADIENTS[nameHash(site.name)]
  const initial = (site.name[0] || '?').toUpperCase()
  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${a}20, ${b}18)` }}>
      {/* Mini browser chrome mockup */}
      <div className="absolute inset-3 rounded-lg overflow-hidden shadow-lg flex flex-col"
        style={{ background: '#0d0d17', border: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Browser bar */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f59e0b' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e' }} />
          <div className="flex-1 mx-2 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>
        {/* Page mockup */}
        <div className="flex-1 flex flex-col gap-1.5 p-2">
          <div className="h-3 rounded-sm flex-shrink-0" style={{ background: `${a}40` }} />
          <div className="flex gap-1.5 flex-1">
            <div className="flex-1 rounded-sm" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="w-1/3 rounded-sm" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
          <div className="h-2 rounded-sm" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>
      {/* Initial badge */}
      <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
        {initial}
      </div>
    </div>
  )
}

export default function SitesPage() {
  const navigate = useNavigate()
  const [sites, setSites] = useState<Site[]>([])
  const [trashedSites, setTrashedSites] = useState<Site[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [mode, setMode] = useState<'blank' | 'template' | 'ai'>('blank')
  const [view, setView] = useState<'sites' | 'trash'>('sites')

  useEffect(() => {
    Promise.all([api.get('/sites'), api.get('/templates'), api.get('/sites/trash')]).then(([s, t, tr]) => {
      setSites(s.data); setTemplates(t.data); setTrashedSites(tr.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const createSite = async () => {
    if (!name.trim()) { toast.error('Site name is required'); return }
    setCreating(true)
    try {
      const res = await api.post('/sites', { name, description, template_id: selectedTemplate })
      const newSite: Site = res.data
      setSites(prev => [newSite, ...prev])
      setShowCreate(false)
      setName(''); setDescription(''); setSelectedTemplate(null)
      toast.success('Site created!')
      if (newSite.pages && newSite.pages.length > 0) {
        navigate(`/builder/${newSite.id}/${newSite.pages[0].id}`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create site')
    } finally {
      setCreating(false)
    }
  }

  const handleAiGenerate = async () => {
    if (!name.trim()) { toast.error('Enter site name first'); return }
    if (!aiPrompt.trim()) { toast.error('Enter AI prompt'); return }
    setAiLoading(true)
    try {
      const res = await api.post('/sites', { name, description })
      const newSite: Site = res.data
      // Generate with AI
      const aiRes = await api.post('/ai/generate', { prompt: aiPrompt, type: 'website' })
      const aiContent = aiRes.data.result
      if (newSite.pages && newSite.pages.length > 0) {
        await api.put(`/sites/${newSite.id}/pages/${newSite.pages[0].id}`, { content: aiContent })
      }
      setSites(prev => [{ ...newSite, pages_count: newSite.pages?.length || 1 }, ...prev])
      setShowCreate(false)
      toast.success('AI site generated!')
      if (newSite.pages && newSite.pages.length > 0) {
        navigate(`/builder/${newSite.id}/${newSite.pages[0].id}`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate site')
    } finally {
      setAiLoading(false)
    }
  }

  const deleteSite = async (site: Site) => {
    if (!confirm(`Move "${site.name}" to Recycle Bin?`)) return
    try {
      await api.delete(`/sites/${site.id}`)
      setSites(prev => prev.filter(s => s.id !== site.id))
      setTrashedSites(prev => [{ ...site, deleted_at: new Date().toISOString() } as any, ...prev])
      toast.success('Moved to Recycle Bin')
    } catch {
      toast.error('Failed to delete site')
    }
  }

  const restoreSite = async (site: Site) => {
    try {
      const { data } = await api.post(`/sites/${site.id}/restore`)
      setTrashedSites(prev => prev.filter(s => s.id !== site.id))
      setSites(prev => [data.site, ...prev])
      toast.success(`"${site.name}" restored!`)
    } catch {
      toast.error('Failed to restore site')
    }
  }

  const permanentlyDelete = async (site: Site) => {
    if (!confirm(`Permanently delete "${site.name}"? This CANNOT be undone.`)) return
    try {
      await api.delete(`/sites/${site.id}/force`)
      setTrashedSites(prev => prev.filter(s => s.id !== site.id))
      toast.success('Permanently deleted')
    } catch {
      toast.error('Failed to permanently delete')
    }
  }

  const duplicateSite = async (site: Site) => {
    try {
      const res = await api.post(`/sites/${site.id}/duplicate`)
      setSites(prev => [res.data, ...prev])
      toast.success('Site duplicated')
    } catch {
      toast.error('Failed to duplicate site')
    }
  }

  const togglePublish = async (site: Site) => {
    const isPublished = site.status === 'published'
    try {
      await api.post(`/sites/${site.id}/${isPublished ? 'unpublish' : 'publish'}`)
      setSites(prev => prev.map(s => s.id === site.id ? { ...s, status: isPublished ? 'draft' : 'published' } : s))
      toast.success(isPublished ? 'Site unpublished' : 'Site is now live! 🚀')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const getLiveUrl = (site: Site) => `${window.location.origin}/s/${site.slug}`

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Sites</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all your websites in one place.</p>
        </div>
        {view === 'sites' && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
            <Plus size={16} /> New Site
          </button>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
        <button onClick={() => setView('sites')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={view === 'sites' ? { background: 'rgba(99,102,241,0.2)', color: '#818cf8' } : { color: '#64748b' }}>
          My Sites
        </button>
        <button onClick={() => setView('trash')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={view === 'trash' ? { background: 'rgba(239,68,68,0.15)', color: '#f87171' } : { color: '#64748b' }}>
          <Trash2 size={13} /> Recycle Bin
          {trashedSites.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
              {trashedSites.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: 'var(--color-surface-2)' }} />)}
        </div>
      ) : view === 'trash' ? (
        /* ── Recycle Bin ── */
        trashedSites.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="rounded-2xl p-20 text-center" style={{ border: '2px dashed var(--color-border)' }}>
            <Trash2 size={48} className="text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Recycle Bin is Empty</h3>
            <p className="text-slate-500">Deleted sites will appear here for recovery.</p>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trashedSites.map((site, i) => (
              <motion.div key={site.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-2)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="h-28 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))' }}>
                  <Globe size={32} className="opacity-30 text-red-400" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white truncate mb-1">{site.name}</h3>
                  <p className="text-xs text-slate-500 mb-4">Deleted • restore to recover</p>
                  <div className="flex gap-2">
                    <button onClick={() => restoreSite(site)}
                      className="flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all"
                      style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                      <RotateCcw size={12} /> Restore
                    </button>
                    <button onClick={() => permanentlyDelete(site)}
                      className="flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all"
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                      <Flame size={12} /> Delete Forever
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : sites.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl p-20 text-center" style={{ border: '2px dashed var(--color-border)' }}>
          <Globe size={48} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No sites yet</h3>
          <p className="text-slate-400 mb-6">Create your first website in seconds.</p>
          <button onClick={() => setShowCreate(true)}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
            Create Your First Site
          </button>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site, i) => (
            <motion.div key={site.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="group rounded-xl overflow-hidden" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              {/* Thumbnail */}
              <div className="h-36 relative overflow-hidden">
                <SiteThumbnail site={site} />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                  <button onClick={() => navigate(`/app/cms/${site.id}`)}
                    className="p-1.5 rounded-lg text-white transition-all" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <Edit3 size={13} />
                  </button>
                  <button onClick={() => duplicateSite(site)}
                    className="p-1.5 rounded-lg text-white transition-all" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <Copy size={13} />
                  </button>
                  <button onClick={() => deleteSite(site)}
                    className="p-1.5 rounded-lg text-red-400 transition-all" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate">{site.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{site.pages_count || 0} pages</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${site.status === 'published' ? 'text-emerald-400 bg-emerald-400/10' : 'text-amber-400 bg-amber-400/10'}`}>
                    {site.status}
                  </span>
                </div>

                {/* Live URL badge when published */}
                {site.status === 'published' && (
                  <a href={getLiveUrl(site)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 mt-2 text-xs truncate transition-colors"
                    style={{ color: '#34d399' }}
                    onClick={e => e.stopPropagation()}>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                    {getLiveUrl(site)}
                    <ExternalLink size={10} className="flex-shrink-0" />
                  </a>
                )}

                <div className="flex gap-2 mt-3">
                  <button onClick={() => navigate(`/builder/${site.id}/${site.pages?.[0]?.id || ''}`)}
                    className="flex-1 py-2 text-xs font-medium rounded-lg transition-all text-white"
                    style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                    Edit
                  </button>
                  <button onClick={() => togglePublish(site)}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1"
                    style={site.status === 'published'
                      ? { background: 'rgba(239,68,68,0.1)', color: '#f87171' }
                      : { background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>
                    {site.status === 'published'
                      ? <><EyeOff size={11} /> Unpublish</>
                      : <><Send size={11} /> Publish</>}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowCreate(false) }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-xl rounded-2xl p-6" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Create New Site</h2>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded text-slate-400 hover:text-white"><X size={18} /></button>
              </div>

              {/* Mode Tabs */}
              <div className="flex gap-1 p-1 rounded-lg mb-6" style={{ background: 'var(--color-surface-3)' }}>
                {[{ key: 'blank', label: 'Blank' }, { key: 'template', label: 'From Template' }, { key: 'ai', label: '⚡ AI Generate' }].map(({ key, label }) => (
                  <button key={key} onClick={() => setMode(key as any)}
                    className="flex-1 py-2 text-sm font-medium rounded-md transition-all"
                    style={mode === key ? { background: 'var(--color-surface-2)', color: '#818cf8' } : { color: '#64748b' }}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Site name *"
                  className="w-full px-4 py-3 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }} />
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)"
                  className="w-full px-4 py-3 rounded-lg text-sm text-white outline-none"
                  style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }} />

                {mode === 'template' && (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {templates.map(t => (
                      <button key={t.id} onClick={() => setSelectedTemplate(selectedTemplate === t.id ? null : t.id)}
                        className="p-3 rounded-lg text-left text-sm transition-all"
                        style={{ background: selectedTemplate === t.id ? 'rgba(99,102,241,0.2)' : 'var(--color-surface-3)', border: `1px solid ${selectedTemplate === t.id ? '#6366f1' : 'transparent'}`, color: selectedTemplate === t.id ? '#818cf8' : '#94a3b8' }}>
                        <p className="font-medium text-white truncate">{t.name}</p>
                        <p className="text-xs opacity-60 capitalize">{t.category}</p>
                      </button>
                    ))}
                  </div>
                )}

                {mode === 'ai' && (
                  <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} rows={3}
                    placeholder="Describe your website... e.g. 'A modern SaaS startup website with dark theme, features section, and pricing table'"
                    className="w-full px-4 py-3 rounded-lg text-sm text-white outline-none resize-none"
                    style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }} />
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  style={{ background: 'var(--color-surface-3)' }}>
                  Cancel
                </button>
                <button
                  onClick={mode === 'ai' ? handleAiGenerate : createSite}
                  disabled={creating || aiLoading}
                  className="flex-1 py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                  {mode === 'ai' ? <><Zap size={14} />{aiLoading ? 'Generating...' : 'Generate with AI'}</> : creating ? 'Creating...' : 'Create Site'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
