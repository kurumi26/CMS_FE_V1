import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Monitor, Tablet, Smartphone, Undo2, Redo2, Eye, Save,
  Globe, Grid, Zap, ChevronLeft, Plus, Settings, Layers, Link2, Copy, HelpCircle, X
} from 'lucide-react'
import { useBuilderStore } from '../store/builderStore'
import api from '../services/api'
import type { Page, Site } from '../types'
import toast from 'react-hot-toast'
import BuilderCanvas from '../components/builder/BuilderCanvas'
import ElementsPanel from '../components/builder/ElementsPanel'
import DesignPanel from '../components/builder/DesignPanel'
import AiPanel from '../components/builder/AiPanel'

type SidePanel = 'elements' | 'design' | 'ai' | null

export default function BuilderPage() {
  const { siteId, pageId } = useParams<{ siteId: string; pageId: string }>()
  const navigate = useNavigate()

  const {
    sections, setSections, deviceMode, setDeviceMode,
    isDirty, markClean, showGrid, setShowGrid,
    zoom, setZoom, undo, redo, historyIndex, history, selectedId,
    setInheritedSections,
  } = useBuilderStore()

  const [site, setSite] = useState<Site | null>(null)
  const [page, setPage] = useState<Page | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [saving, setSaving] = useState(false)
  const [sidePanel, setSidePanel] = useState<SidePanel>('elements')
  const [publishing, setPublishing] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  useEffect(() => {
    if (!siteId || !pageId) return
    Promise.all([
      api.get(`/sites/${siteId}`),
      api.get(`/sites/${siteId}/pages/${pageId}`),
      api.get(`/sites/${siteId}/pages`),
    ]).then(([sRes, pRes, psRes]) => {
      setSite(sRes.data)
      const currentPage: Page = pRes.data
      const allPages: Page[] = psRes.data
      setPage(currentPage)
      setPages(allPages)
      setSections(currentPage.content?.sections || [])

      // If editing a non-homepage page, load homepage's navbar sections to show as inherited
      if (!currentPage.is_homepage) {
        const homepage = allPages.find(p => p.is_homepage)
        if (homepage) {
          api.get(`/sites/${siteId}/pages/${homepage.id}`)
            .then(({ data }) => {
              const navSections = (data.content?.sections || []).filter((s: any) => s.type === 'navbar')
              setInheritedSections(navSections)
            })
        } else {
          setInheritedSections([])
        }
      } else {
        setInheritedSections([])
      }
    }).catch(() => toast.error('Failed to load page'))
  }, [siteId, pageId])

  // Auto-save every 30s if dirty
  useEffect(() => {
    if (!isDirty) return
    const t = setTimeout(handleSave, 30000)
    return () => clearTimeout(t)
  }, [isDirty, sections])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSave() }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) undo()
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) redo()
      if (e.key === '?' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) setShowShortcuts(s => !s)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSave = useCallback(async () => {
    if (!siteId || !pageId) return
    setSaving(true)
    try {
      await api.put(`/sites/${siteId}/pages/${pageId}`, {
        content: { sections }
      })
      markClean()
      toast.success('Saved!', { duration: 1500 })
    } catch {
      toast.error('Save failed')
    } finally {
      setSaving(false)
    }
  }, [siteId, pageId, sections])

  const handlePublish = async () => {
    await handleSave()
    setPublishing(true)
    try {
      const res = await api.post(`/sites/${siteId}/publish`)
      const slug = res.data?.site?.slug || site?.slug
      const liveUrl = slug ? `${window.location.origin}/s/${slug}` : null
      toast.success(
        liveUrl
          ? (
            <span>
              Site is live! <a href={liveUrl} target="_blank" rel="noopener noreferrer"
                style={{ color: '#818cf8', textDecoration: 'underline' }}>View →</a>
            </span>
          ) as any
          : 'Site published! 🚀',
        { duration: 6000 }
      )
    } catch {
      toast.error('Publish failed')
    } finally {
      setPublishing(false)
    }
  }

  const deviceWidths = { desktop: '100%', tablet: '768px', mobile: '390px' }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--color-surface)' }}>
      {/* Top Toolbar */}
      <div className="flex items-center gap-2 px-4 h-14 flex-shrink-0 z-20"
        style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>

        {/* Left */}
        <div className="flex items-center gap-2 flex-1">
          <button onClick={() => navigate(`/app/cms/${siteId}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <ChevronLeft size={16} /> <span className="hidden sm:inline">{site?.name || 'Back'}</span>
          </button>
          <div className="w-px h-5" style={{ background: 'var(--color-border)' }} />

          {/* Page selector */}
          <select
            value={pageId}
            onChange={e => navigate(`/builder/${siteId}/${e.target.value}`)}
            className="text-sm rounded-lg px-3 py-1.5 outline-none text-slate-200"
            style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
            {pages.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>

          {/* Page URL copy button */}
          {site && page && (
            <button
              onClick={() => {
                const slug = page.is_homepage ? `/s/${site.slug}` : `/s/${site.slug}/${page.slug}`
                const url = `${window.location.origin}${slug}`
                navigator.clipboard.writeText(url)
                toast.success('Page URL copied!', { duration: 2000 })
              }}
              title={`Copy URL: /s/${site.slug}${page.is_homepage ? '' : '/' + page.slug}`}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10"
              style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-3)', maxWidth: 180 }}>
              <Link2 size={11} />
              <span className="truncate hidden md:inline" style={{ maxWidth: 120 }}>
                /s/{site.slug}{page.is_homepage ? '' : `/${page.slug}`}
              </span>
              <Copy size={10} className="flex-shrink-0" />
            </button>
          )}

          {isDirty && (
            <span className="text-xs text-amber-400 px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.1)' }}>
              Unsaved changes
            </span>
          )}
        </div>

        {/* Center — Device toggles */}
        <div className="flex items-center gap-0.5 p-1 rounded-lg" style={{ background: 'var(--color-surface-3)' }}>
          {([['desktop', Monitor], ['tablet', Tablet], ['mobile', Smartphone]] as const).map(([mode, Icon]) => (
            <button key={mode} onClick={() => setDeviceMode(mode)}
              className="p-2 rounded-md transition-all"
              style={deviceMode === mode ? { background: 'var(--color-surface-2)', color: '#818cf8' } : { color: '#64748b' }}>
              <Icon size={16} />
            </button>
          ))}
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="px-2 py-1 text-xs text-slate-400 hover:text-white rounded">−</button>
          <span className="text-xs text-slate-400 w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="px-2 py-1 text-xs text-slate-400 hover:text-white rounded">+</button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          {/* History */}
          <button onClick={undo} disabled={historyIndex <= 0}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all">
            <Undo2 size={16} />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-all">
            <Redo2 size={16} />
          </button>
          <button onClick={() => setShowGrid(!showGrid)}
            className="p-2 rounded-lg transition-all"
            style={showGrid ? { background: 'rgba(99,102,241,0.2)', color: '#818cf8' } : { color: '#64748b' }}>
            <Grid size={16} />
          </button>
          <button
            onClick={() => window.open(`/preview/${siteId}/${pageId}`, '_blank')}
            className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
            title="Preview site">
            <Eye size={16} />
          </button>
          <div className="w-px h-5" style={{ background: 'var(--color-border)' }} />
          <button onClick={handleSave} disabled={saving || !isDirty}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-all"
            style={{ background: 'var(--color-surface-3)', color: isDirty ? '#f1f5f9' : '#64748b', border: '1px solid var(--color-border)' }}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={handlePublish} disabled={publishing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
            <Globe size={14} /> {publishing ? 'Publishing...' : 'Publish'}
          </button>
          <button onClick={() => setShowShortcuts(s => !s)} title="Keyboard shortcuts (?)"
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
            style={showShortcuts ? { color: '#818cf8', background: 'rgba(99,102,241,0.15)' } : {}}>
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      {/* Builder Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel Toggle */}
        <div className="flex flex-col flex-shrink-0" style={{ background: 'var(--color-surface-2)', borderRight: '1px solid var(--color-border)' }}>
          {[
            { key: 'elements', icon: Layers, label: 'Elements' },
            { key: 'design', icon: Settings, label: 'Design', disabled: !selectedId },
            { key: 'ai', icon: Zap, label: 'AI' },
          ].map(({ key, icon: Icon, label, disabled }) => (
            <button key={key} onClick={() => setSidePanel(sidePanel === key ? null : key as SidePanel)}
              disabled={disabled}
              title={label}
              className="p-3 flex flex-col items-center gap-1 transition-all disabled:opacity-30"
              style={sidePanel === key ? { color: '#818cf8', borderRight: '2px solid #6366f1' } : { color: '#64748b' }}>
              <Icon size={18} />
              <span className="text-[9px] font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Slide-out Panel */}
        <AnimatePresence>
          {sidePanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="flex-shrink-0 overflow-hidden flex flex-col"
              style={{ background: 'var(--color-surface-2)', borderRight: '1px solid var(--color-border)' }}>
              <div className="flex-1 overflow-y-auto">
                {sidePanel === 'elements' && <ElementsPanel />}
                {sidePanel === 'design' && selectedId && <DesignPanel />}
                {sidePanel === 'ai' && <AiPanel />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-6" style={{ background: '#0a0a0f' }}>
          <div
            className="relative transition-all duration-300 origin-top"
            style={{
              width: deviceWidths[deviceMode],
              minHeight: '100vh',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              marginBottom: zoom < 100 ? `${-(100 - zoom)}vh` : 0,
            }}>
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none z-10 opacity-20"
                style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            )}
            <BuilderCanvas />
          </div>
        </div>
      </div>
      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={e => { if (e.target === e.currentTarget) setShowShortcuts(false) }}>
            <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }}
              className="rounded-2xl w-full max-w-md overflow-hidden"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div className="flex items-center gap-2">
                  <HelpCircle size={16} className="text-indigo-400" />
                  <h2 className="text-base font-bold text-white">Keyboard Shortcuts</h2>
                </div>
                <button onClick={() => setShowShortcuts(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  <X size={16} />
                </button>
              </div>
              <div className="p-4 space-y-1">
                {([
                  ['Ctrl + S',        'Save page'],
                  ['Ctrl + Z',        'Undo'],
                  ['Ctrl + Y',        'Redo'],
                  ['Ctrl + Shift + Z','Redo (alt)'],
                  ['Delete / Backspace','Delete selected section'],
                  ['Escape',          'Deselect section'],
                  ['?',               'Toggle this shortcuts panel'],
                ] as [string, string][]).map(([key, desc]) => (
                  <div key={key} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'var(--color-surface-3)' }}>
                    <span className="text-sm text-slate-300">{desc}</span>
                    <kbd className="text-xs px-2 py-0.5 rounded font-mono text-indigo-300" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>{key}</kbd>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-4">
                <p className="text-xs text-slate-500">Press <kbd className="text-xs px-1 rounded font-mono" style={{ background: 'var(--color-surface-3)' }}>?</kbd> anytime to toggle this panel.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
