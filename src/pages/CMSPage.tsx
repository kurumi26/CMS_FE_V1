import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import type { Site, Page } from '../types'
import { Plus, Pencil, Globe, Trash2, FileText, Sparkles, Save } from 'lucide-react'
import toast from 'react-hot-toast'

type SiteSeoForm = {
  title: string
  description: string
  keywords: string
  ogImage: string
}

type SiteSettingsForm = {
  font: string
  colorScheme: string
  primaryColor: string
}

const emptySeoForm: SiteSeoForm = {
  title: '',
  description: '',
  keywords: '',
  ogImage: '',
}

const emptySettingsForm: SiteSettingsForm = {
  font: 'Inter',
  colorScheme: 'dark',
  primaryColor: '#6366f1',
}

function normalizeSeoForm(seo?: Record<string, any> | null): SiteSeoForm {
  return {
    title: seo?.title || seo?.meta_title || '',
    description: seo?.description || seo?.meta_description || '',
    keywords: Array.isArray(seo?.keywords) ? seo.keywords.join(', ') : (seo?.keywords || ''),
    ogImage: seo?.ogImage || seo?.og_image || '',
  }
}

function normalizeSettingsForm(site?: Site | null): SiteSettingsForm {
  return {
    font: site?.settings?.font || site?.branding?.fontFamily || 'Inter',
    colorScheme: site?.settings?.colorScheme || 'dark',
    primaryColor: site?.branding?.primaryColor || '#6366f1',
  }
}

export default function CMSPage() {
  const { siteId } = useParams<{ siteId: string }>()
  const navigate = useNavigate()
  const [site, setSite] = useState<Site | null>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pages' | 'settings' | 'seo'>('pages')
  const [newPageTitle, setNewPageTitle] = useState('')
  const [creating, setCreating] = useState(false)
  const [siteName, setSiteName] = useState('')
  const [siteDescription, setSiteDescription] = useState('')
  const [siteDomain, setSiteDomain] = useState('')
  const [settingsForm, setSettingsForm] = useState<SiteSettingsForm>(emptySettingsForm)
  const [seoForm, setSeoForm] = useState<SiteSeoForm>(emptySeoForm)
  const [savingSettings, setSavingSettings] = useState(false)
  const [savingSeo, setSavingSeo] = useState(false)
  const [generatingSeo, setGeneratingSeo] = useState(false)

  const load = async () => {
    if (!siteId) return
    setLoading(true)
    try {
      const [siteRes, pagesRes] = await Promise.all([
        api.get(`/sites/${siteId}`),
        api.get(`/sites/${siteId}/pages`),
      ])

      const siteData: Site = siteRes.data
      setSite(siteData)
      setSiteName(siteData.name)
      setSiteDescription(siteData.description || '')
      setSiteDomain(siteData.domain || '')
      setSettingsForm(normalizeSettingsForm(siteData))
      setSeoForm(normalizeSeoForm(siteData.seo))
      setPages(Array.isArray(pagesRes.data?.data) ? pagesRes.data.data : pagesRes.data)
    } catch {
      toast.error('Failed to load site')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [siteId])

  const createPage = async () => {
    if (!newPageTitle.trim()) return
    setCreating(true)
    try {
      const { data } = await api.post(`/sites/${siteId}/pages`, { title: newPageTitle, status: 'draft' })
      setPages(p => [...p, data])
      setNewPageTitle('')
      toast.success('Page created!')
    } catch { toast.error('Failed') }
    finally { setCreating(false) }
  }

  const deletePage = async (id: number) => {
    if (!confirm('Delete this page?')) return
    try {
      await api.delete(`/sites/${siteId}/pages/${id}`)
      setPages(p => p.filter(x => x.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete page')
    }
  }

  const publish = async () => {
    try {
      const { data } = await api.post(`/sites/${siteId}/publish`)
      toast.success('Site published!')
      setSite(data.site || (site ? { ...site, status: 'published' } : site))
    } catch {
      toast.error('Failed to publish site')
    }
  }

  const saveSiteSettings = async () => {
    if (!siteId) return
    setSavingSettings(true)
    try {
      const { data } = await api.put(`/sites/${siteId}`, {
        name: siteName,
        description: siteDescription,
        domain: siteDomain || null,
        settings: {
          font: settingsForm.font,
          colorScheme: settingsForm.colorScheme,
        },
        branding: {
          primaryColor: settingsForm.primaryColor,
          fontFamily: settingsForm.font,
        },
      })
      setSite(data)
      setSettingsForm(normalizeSettingsForm(data))
      toast.success('Settings saved!')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  const saveSeo = async () => {
    if (!siteId) return
    setSavingSeo(true)

    try {
      const keywords = seoForm.keywords
        .split(',')
        .map(keyword => keyword.trim())
        .filter(Boolean)

      const payload = {
        title: seoForm.title,
        description: seoForm.description,
        meta_title: seoForm.title,
        meta_description: seoForm.description,
        keywords,
        ogImage: seoForm.ogImage,
        og_image: seoForm.ogImage,
      }

      const { data } = await api.put(`/sites/${siteId}`, { seo: payload })
      setSite(data)
      setSeoForm(normalizeSeoForm(data.seo))
      toast.success('SEO saved!')
    } catch {
      toast.error('Failed to save SEO')
    } finally {
      setSavingSeo(false)
    }
  }

  const generateSeo = async () => {
    if (!siteName.trim()) {
      toast.error('Add a site name first')
      return
    }

    setGeneratingSeo(true)
    try {
      const { data } = await api.post('/ai/generate', {
        type: 'seo',
        prompt: `Generate SEO metadata for a website named "${siteName}". Description: "${siteDescription || 'No description provided.'}". Pages: ${pages.map(page => page.title).join(', ') || 'Homepage'}.`,
        context: {
          site_name: siteName,
          description: siteDescription,
          pages: pages.map(page => ({ title: page.title, slug: page.slug, status: page.status })),
        },
      })

      const generated = normalizeSeoForm(data.result || data)

      setSeoForm(current => ({
        title: generated.title || current.title,
        description: generated.description || current.description,
        keywords: generated.keywords || current.keywords,
        ogImage: generated.ogImage || current.ogImage,
      }))

      toast.success(data.mock ? 'SEO draft generated locally.' : 'SEO generated!')
    } catch {
      toast.error('Failed to generate SEO')
    } finally {
      setGeneratingSeo(false)
    }
  }

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6" style={{ color: 'var(--color-text)' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ color: '#f8fafc' }}>{site?.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${site?.status === 'published' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
              {site?.status || 'draft'}
            </span>
            <span className="text-sm" style={{ color: '#64748b' }}>
              /s/{site?.slug}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={publish}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
            style={{ background: '#10b981' }}>
            <Globe size={15} /> Publish
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
        {(['pages', 'settings', 'seo'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors"
            style={{
              background: tab === t ? 'var(--color-surface-3)' : 'transparent',
              color: tab === t ? '#f8fafc' : '#94a3b8',
              boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.25)' : 'none',
            }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'pages' && (
        <div className="space-y-3">
          {/* Create page */}
          <div className="flex gap-3 mb-5">
            <input value={newPageTitle} onChange={e => setNewPageTitle(e.target.value)} placeholder="New page title..."
              className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: '#f8fafc' }} />
            <button onClick={createPage} disabled={creating || !newPageTitle.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
              style={{ background: '#6366f1' }}>
              <Plus size={15} /> Add Page
            </button>
          </div>

          {pages.map(page => (
            <div key={page.id} className="rounded-xl px-4 py-3.5 flex items-center justify-between shadow-sm transition-shadow"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-slate-400" />
                <div>
                  <p className="font-medium text-sm" style={{ color: '#f8fafc' }}>{page.title}</p>
                  <p className="text-xs" style={{ color: '#64748b' }}>/{page.slug}</p>
                </div>
                {page.is_homepage && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#e0e7ff', color: '#4338ca' }}>Home</span>
                )}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${page.status === 'published' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {page.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => navigate(`/builder/${siteId}/${page.id}`)}
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-colors" title="Edit">
                  <Pencil size={14} />
                </button>
                {!page.is_homepage && (
                  <button onClick={() => deletePage(page.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div className="rounded-2xl shadow-sm p-6 space-y-5" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
          <div>
            <p className="text-lg font-semibold" style={{ color: '#f8fafc' }}>Site Settings</p>
            <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Update your site identity, branding, and publishing details.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#cbd5e1' }}>Site Name</label>
            <input value={siteName} onChange={e => setSiteName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', color: '#f8fafc' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#cbd5e1' }}>Site Description</label>
            <textarea value={siteDescription} onChange={e => setSiteDescription(e.target.value)} rows={4}
              placeholder="Short summary for visitors and search engines"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', color: '#f8fafc' }} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#cbd5e1' }}>Custom Domain</label>
            <input value={siteDomain} onChange={e => setSiteDomain(e.target.value)} placeholder="yourdomain.com"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', color: '#f8fafc' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#cbd5e1' }}>Primary Color</label>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
                <input
                  type="color"
                  value={settingsForm.primaryColor}
                  onChange={e => setSettingsForm(current => ({ ...current, primaryColor: e.target.value }))}
                  className="h-8 w-10 rounded border-0 bg-transparent"
                />
                <span className="text-sm" style={{ color: '#f8fafc' }}>{settingsForm.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#cbd5e1' }}>Font</label>
              <select
                value={settingsForm.font}
                onChange={e => setSettingsForm(current => ({ ...current, font: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', color: '#f8fafc' }}>
                {['Inter', 'Poppins', 'Manrope', 'Space Grotesk'].map(font => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#cbd5e1' }}>Color Scheme</label>
              <select
                value={settingsForm.colorScheme}
                onChange={e => setSettingsForm(current => ({ ...current, colorScheme: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', color: '#f8fafc' }}>
                {['dark', 'light', 'system'].map(scheme => (
                  <option key={scheme} value={scheme}>{scheme}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={saveSiteSettings} disabled={savingSettings}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold"
            style={{ background: '#6366f1' }}>
            <Save size={15} /> {savingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}

      {tab === 'seo' && (
        <div className="rounded-2xl shadow-sm p-6 space-y-5" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="text-lg font-semibold" style={{ color: '#f8fafc' }}>Site SEO</p>
              <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>Control the title and description used on your public site. You can generate a draft even without an external AI key.</p>
            </div>
            <button onClick={generateSeo} disabled={generatingSeo}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: generatingSeo ? '#4f46e5aa' : '#4f46e5' }}>
              <Sparkles size={15} /> {generatingSeo ? 'Generating...' : 'Generate With AI'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#cbd5e1' }}>SEO Title</label>
            <input value={seoForm.title} onChange={e => setSeoForm(current => ({ ...current, title: e.target.value }))}
              placeholder="Concise title for search results"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', color: '#f8fafc' }} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#cbd5e1' }}>SEO Description</label>
            <textarea value={seoForm.description} onChange={e => setSeoForm(current => ({ ...current, description: e.target.value }))} rows={4}
              placeholder="Describe what visitors should expect from this website"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
              style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', color: '#f8fafc' }} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#cbd5e1' }}>Keywords</label>
              <input value={seoForm.keywords} onChange={e => setSeoForm(current => ({ ...current, keywords: e.target.value }))}
                placeholder="saas, website builder, cms"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', color: '#f8fafc' }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#cbd5e1' }}>Social Image URL</label>
              <input value={seoForm.ogImage} onChange={e => setSeoForm(current => ({ ...current, ogImage: e.target.value }))}
                placeholder="https://example.com/og-image.jpg"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', color: '#f8fafc' }} />
            </div>
          </div>

          <button onClick={saveSeo} disabled={savingSeo}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold"
            style={{ background: '#6366f1' }}>
            <Save size={15} /> {savingSeo ? 'Saving...' : 'Save SEO'}
          </button>
        </div>
      )}
    </div>
  )
}
