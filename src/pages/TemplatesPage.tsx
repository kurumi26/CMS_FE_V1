import { useEffect, useState } from 'react'
import api from '../services/api'
import { Search, Star, Zap, Loader2, Eye, Heart, TrendingUp, X, Layout } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Template, Section } from '../types'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Section wireframe config ───────────────────────────────────────────────
const SECTION_DEFS: Record<string, { bg: string; h: number; dark?: boolean }> = {
  navbar:       { bg: '#1e293b', h: 7,  dark: true },
  hero:         { bg: '#6366f1', h: 26, dark: true },
  features:     { bg: '#f1f5f9', h: 20 },
  about:        { bg: '#ffffff', h: 20 },
  cta:          { bg: '#7c3aed', h: 16, dark: true },
  contact:      { bg: '#f8f9fa', h: 20 },
  form:         { bg: '#ffffff', h: 22 },
  testimonials: { bg: '#f8f9fa', h: 18 },
  pricing:      { bg: '#ffffff', h: 24 },
  team:         { bg: '#f8f9fa', h: 20 },
  faq:          { bg: '#ffffff', h: 18 },
  stats:        { bg: '#1a1a2e', h: 12, dark: true },
  gallery:      { bg: '#f1f5f9', h: 20 },
  footer:       { bg: '#1a1a2e', h: 10, dark: true },
  text:         { bg: '#ffffff', h: 12 },
  image:        { bg: '#f1f5f9', h: 18 },
  video:        { bg: '#0f172a', h: 18, dark: true },
  divider:      { bg: '#f8f9fa', h: 3  },
  spacer:       { bg: '#ffffff', h: 4  },
  blog:         { bg: '#f8f9fa', h: 20 },
  html:         { bg: '#1e293b', h: 14, dark: true },
}

const GRID_TYPES = new Set(['features', 'pricing', 'team', 'testimonials', 'gallery', 'blog'])

function SectionStripe({ s, pct }: { s: Section; pct: number }) {
  const def = SECTION_DEFS[s.type] || { bg: '#f1f5f9', h: 14 }
  const lc = def.dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.10)'
  const centered = s.type === 'hero' || s.type === 'cta'
  return (
    <div style={{ height: `${pct}%`, minHeight: 3, background: def.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '3% 10%', gap: 4, flexShrink: 0, overflow: 'hidden' }}>
      {/* Primary line */}
      <div style={{ height: 2, background: lc, borderRadius: 2, width: centered ? '52%' : '65%', alignSelf: centered ? 'center' : 'flex-start' }} />
      {/* Secondary line */}
      {pct > 6 && s.type !== 'divider' && s.type !== 'spacer' && (
        <div style={{ height: 1.5, background: lc, borderRadius: 2, width: centered ? '34%' : '44%', alignSelf: centered ? 'center' : 'flex-start', opacity: 0.55 }} />
      )}
      {/* Card grid */}
      {pct > 10 && GRID_TYPES.has(s.type) && (
        <div style={{ display: 'flex', gap: '6%', marginTop: 2 }}>
          {[0, 1, 2].map(j => (
            <div key={j} style={{ flex: 1, height: 9, background: lc, borderRadius: 3, opacity: 0.45 }} />
          ))}
        </div>
      )}
      {/* Two-column about */}
      {pct > 10 && s.type === 'about' && (
        <div style={{ display: 'flex', gap: '8%', marginTop: 2 }}>
          <div style={{ flex: 1, height: 14, background: lc, borderRadius: 3, opacity: 0.35 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {[0, 1].map(j => <div key={j} style={{ height: 2, background: lc, borderRadius: 2, opacity: 0.45 }} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function TemplateThumbnail({ template }: { template: Template }) {
  if (template.thumbnail) {
    return <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
  }
  const sections = template.content?.sections || []
  if (sections.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
        <Zap size={48} className="text-white opacity-30" />
      </div>
    )
  }
  const visible = sections.slice(0, 8)
  const total = visible.reduce((a, s) => a + (SECTION_DEFS[s.type]?.h ?? 14), 0)
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {visible.map((s, i) => (
        <SectionStripe key={i} s={s} pct={((SECTION_DEFS[s.type]?.h ?? 14) / total) * 100} />
      ))}
    </div>
  )
}

// ─── Preview Modal ───────────────────────────────────────────────────────────
function PreviewModal({ template, onClose, onUse, using }: {
  template: Template
  onClose: () => void
  onUse: () => void
  using: boolean
}) {
  const sections = template.content?.sections || []
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        className="relative flex flex-col rounded-2xl overflow-hidden w-full max-w-3xl"
        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <h2 className="text-lg font-bold text-white">{template.name}</h2>
            {template.description && <p className="text-sm text-slate-400 mt-0.5">{template.description}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0" style={{ overflow: 'hidden' }}>
          {/* Scaled page preview */}
          <div className="flex-1 overflow-hidden relative" style={{ background: '#08080f', minWidth: 0 }}>
            <div className="absolute inset-4 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
              <TemplateThumbnail template={template} />
            </div>
          </div>

          {/* Sidebar — section list */}
          <div className="w-60 flex-shrink-0 overflow-y-auto p-4 space-y-4" style={{ borderLeft: '1px solid var(--color-border)' }}>
            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5">
              {template.category && (
                <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>{template.category}</span>
              )}
              {template.is_premium && (
                <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: '#f59e0b', color: '#fff' }}>
                  <Star size={9} /> Pro
                </span>
              )}
              {template.use_count > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                  <TrendingUp size={9} /> {template.use_count.toLocaleString()}
                </span>
              )}
            </div>

            {/* Section list */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Sections ({sections.length})
              </p>
              <div className="space-y-1">
                {sections.map((s, i) => {
                  const def = SECTION_DEFS[s.type]
                  const dotColor = def
                    ? def.dark ? def.bg : (def.bg === '#ffffff' || def.bg === '#f8f9fa' || def.bg === '#f1f5f9' ? '#94a3b8' : def.bg)
                    : '#94a3b8'
                  return (
                    <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg" style={{ background: 'var(--color-surface-3)' }}>
                      <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: dotColor }} />
                      <span className="text-xs capitalize text-slate-300">{s.type}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all"
            style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
            Close
          </button>
          <button onClick={onUse} disabled={using}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
            {using ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            Use This Template
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Page Component ──────────────────────────────────────────────────────────
export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [cat, setCat] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState<number | null>(null)
  const [preview, setPreview] = useState<Template | null>(null)
  const [favorites, setFavorites] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('jaycms.favTemplates') || '[]')) }
    catch { return new Set() }
  })
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/templates', { params: { category: cat, search } }),
      api.get('/templates/categories'),
    ]).then(([t, c]) => {
      setTemplates(t.data.data || t.data)
      setCategories(c.data)
    }).finally(() => setLoading(false))
  }, [cat, search])

  const toggleFav = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem('jaycms.favTemplates', JSON.stringify([...next]))
      return next
    })
  }

  const applyTemplate = async (template: Template) => {
    setCreating(template.id)
    try {
      const { data } = await api.post('/sites', { name: template.name, template_id: template.id })
      toast.success('Site created from template!')
      navigate(`/builder/${data.id}/${data.homepage_id || ''}`)
    } catch { toast.error('Failed to create site') }
    finally { setCreating(null) }
  }

  const displayedTemplates = cat === '__favs__'
    ? templates.filter(t => favorites.has(t.id))
    : templates

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Templates</h1>
        <p className="text-slate-400 text-sm mt-1">Start your site from a professionally designed template.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[180px]"
          style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
          <Search size={15} className="text-slate-500 flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search templates..."
            className="outline-none text-sm bg-transparent text-slate-200 placeholder-slate-500 w-full" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCat('')}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{ background: cat === '' ? '#6366f1' : 'var(--color-surface-2)', color: cat === '' ? '#fff' : '#94a3b8', border: '1px solid var(--color-border)' }}>
            All
          </button>
          {favorites.size > 0 && (
            <button onClick={() => setCat('__favs__')}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
              style={{ background: cat === '__favs__' ? '#f59e0b' : 'var(--color-surface-2)', color: cat === '__favs__' ? '#fff' : '#94a3b8', border: '1px solid var(--color-border)' }}>
              <Heart size={11} /> Favorites
            </button>
          )}
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize"
              style={{ background: cat === c ? '#6366f1' : 'var(--color-surface-2)', color: cat === c ? '#fff' : '#94a3b8', border: '1px solid var(--color-border)' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: 'var(--color-surface-2)' }}>
              <div className="h-48" style={{ background: 'var(--color-surface-3)' }} />
              <div className="p-4 space-y-2">
                <div className="h-4 rounded w-2/3" style={{ background: 'var(--color-surface-3)' }} />
                <div className="h-3 rounded w-full" style={{ background: 'var(--color-surface-3)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : displayedTemplates.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          {cat === '__favs__' ? 'No favorites yet — click the ♥ on any template to save it.' : 'No templates found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTemplates.map(t => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden group cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
              onClick={() => setPreview(t)}>

              {/* Thumbnail */}
              <div className="relative h-48 overflow-hidden">
                <TemplateThumbnail template={t} />

                {/* Pro badge */}
                {t.is_premium && (
                  <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold z-10"
                    style={{ background: '#f59e0b', color: '#fff' }}>
                    <Star size={9} /> Pro
                  </span>
                )}
                {/* Use count */}
                {t.use_count > 0 && (
                  <span className="absolute top-3 right-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs z-10"
                    style={{ background: 'rgba(0,0,0,0.55)', color: '#94a3b8', backdropFilter: 'blur(4px)' }}>
                    <TrendingUp size={9} /> {t.use_count.toLocaleString()}
                  </span>
                )}
                {/* Favorite button */}
                <button onClick={e => toggleFav(t.id, e)}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full z-10 transition-all hover:scale-110"
                  style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                  <Heart size={13} fill={favorites.has(t.id) ? '#ef4444' : 'none'}
                    className={favorites.has(t.id) ? 'text-red-400' : 'text-slate-400'} />
                </button>

                {/* Hover overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"
                  style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}>
                  <button onClick={e => { e.stopPropagation(); setPreview(t) }}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5 hover:scale-105 transition-transform"
                    style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    <Eye size={14} /> Preview
                  </button>
                  <button onClick={e => { e.stopPropagation(); applyTemplate(t) }} disabled={creating === t.id}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 hover:scale-105 transition-transform"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                    {creating === t.id ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                    Use
                  </button>
                </div>
              </div>

              {/* Card info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate">{t.name}</h3>
                    {t.description && <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>}
                  </div>
                  {t.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full capitalize flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>{t.category}</span>
                  )}
                </div>
                {(t.content?.sections?.length ?? 0) > 0 && (
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <Layout size={10} /> {t.content.sections.length} sections
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <PreviewModal
            template={preview}
            onClose={() => setPreview(null)}
            onUse={() => applyTemplate(preview)}
            using={creating === preview.id}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
