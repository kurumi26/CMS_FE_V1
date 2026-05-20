import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import PositionedSectionCollection from '../components/builder/PositionedSectionCollection'
import type { Section } from '../types'

// Plain axios instance — no auth token, no login redirect interceptor
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { Accept: 'application/json' },
})

interface PublicPage {
  id: number
  title: string
  slug: string
  content: { sections: Section[] }
  is_homepage: boolean
  meta_title?: string
  meta_description?: string
}

interface PublicSite {
  id: number
  name: string
  slug: string
  description?: string
  branding?: { primaryColor?: string; fontFamily?: string }
  seo?: { title?: string; description?: string; meta_title?: string; meta_description?: string }
}

export default function PublicSitePage() {
  const { slug, pageSlug } = useParams<{ slug: string; pageSlug?: string }>()
  const [site, setSite] = useState<PublicSite | null>(null)
  const [pages, setPages] = useState<PublicPage[]>([])
  const [activePage, setActivePage] = useState<PublicPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    publicApi.get(`/public/sites/${slug}`)
      .then(({ data }) => {
        setSite(data.site)
        const pageList: PublicPage[] = data.pages || []
        setPages(pageList)
        const homepage = pageList.find(p => p.is_homepage) || pageList[0]
        if (pageSlug) {
          const found = pageList.find(p => p.slug === pageSlug)
          setActivePage(found || homepage || null)
        } else {
          setActivePage(homepage || null)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug, pageSlug])

  // Update document title
  useEffect(() => {
    const title = activePage?.meta_title || site?.seo?.title || site?.seo?.meta_title || site?.name
    const description = activePage?.meta_description || site?.seo?.description || site?.seo?.meta_description || site?.description

    if (title) {
      document.title = title
    }

    if (description) {
      let tag = document.querySelector('meta[name="description"]')

      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        document.head.appendChild(tag)
      }

      tag.setAttribute('content', description)
    }
  }, [activePage, site])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading site...</p>
        </div>
      </div>
    )
  }

  if (notFound || !site) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center p-8 bg-white">
        <div className="text-7xl">🚧</div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Site Not Found</h1>
          <p className="text-slate-500 max-w-sm mx-auto">
            This site doesn't exist or hasn't been published yet. Check the URL and try again.
          </p>
        </div>
        <a href="/" className="px-6 py-3 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
          Go Home
        </a>
      </div>
    )
  }

  const sections: Section[] = activePage?.content?.sections || []

  // Collect navbar sections from the homepage to share across all pages
  const homepage = pages.find(p => p.is_homepage)
  const homepageNavSections: Section[] =
    (!activePage?.is_homepage && homepage?.content?.sections)
      ? homepage.content.sections.filter(s => s.type === 'navbar')
      : []

  // If this page already has its own navbar don't double-render the homepage one
  const pageHasOwnNav = sections.some(s => s.type === 'navbar')
  const inheritedNavSections = pageHasOwnNav ? [] : homepageNavSections

  const sectionsToRender = [...inheritedNavSections, ...sections]
  const hasNav = sectionsToRender.some(s => s.type === 'navbar')

  return (
    <div className="min-h-screen bg-white">
      {/* Render all sections (inherited navbar first, then page content) */}
      <PositionedSectionCollection sections={sectionsToRender} />

      {/* Empty published site fallback */}
      {sectionsToRender.length === 0 && (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center p-8 bg-white">
          <div className="text-7xl">🚀</div>
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-3">{site.name}</h1>
            {site.description && <p className="text-lg text-slate-500 max-w-md mx-auto">{site.description}</p>}
          </div>
          <p className="text-slate-400 text-sm">This site is live but has no content yet.</p>
        </div>
      )}

      {/* Multi-page nav (only if no navbar section present and multiple pages exist) */}
      {!hasNav && pages.length > 1 && (
        <nav className="fixed top-0 left-0 right-0 z-40 flex items-center gap-1 px-6 py-3"
          style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', boxShadow: '0 1px 0 rgba(0,0,0,0.08)' }}>
          <span className="font-bold text-slate-800 mr-4 text-sm">{site.name}</span>
          {pages.map(p => (
            <Link key={p.id}
              to={p.is_homepage ? `/s/${site.slug}` : `/s/${site.slug}/${p.slug}`}
              className="px-3 py-1.5 rounded-lg text-sm transition-colors"
              style={{
                background: activePage?.id === p.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: activePage?.id === p.id ? '#6366f1' : '#64748b',
                fontWeight: activePage?.id === p.id ? '600' : '400',
              }}>
              {p.title}
            </Link>
          ))}
        </nav>
      )}

      {/* JayCMS attribution badge */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg"
          style={{ background: 'rgba(15,23,42,0.85)', color: '#94a3b8', backdropFilter: 'blur(8px)' }}>
          ⚡ Built with JayCMS
        </div>
      </div>
    </div>
  )
}
