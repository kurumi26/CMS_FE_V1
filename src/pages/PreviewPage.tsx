import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'
import type { Section, Site, Page } from '../types'
import PositionedSectionCollection from '../components/builder/PositionedSectionCollection'

export default function PreviewPage() {
  const { siteId, pageId } = useParams<{ siteId: string; pageId: string }>()
  const [sections, setSections] = useState<Section[]>([])
  const [site, setSite] = useState<Site | null>(null)
  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!siteId || !pageId) return
    Promise.all([
      api.get(`/sites/${siteId}`),
      api.get(`/sites/${siteId}/pages/${pageId}`),
    ]).then(([sRes, pRes]) => {
      setSite(sRes.data)
      setPage(pRes.data)
      setSections(pRes.data.content?.sections || [])
    }).finally(() => setLoading(false))
  }, [siteId, pageId])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f0f16' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Loading preview…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!sections.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8f9fa' }}>
        <div style={{ textAlign: 'center', color: '#9ca3af' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>No sections yet</p>
          <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Add sections in the builder to see the preview.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Preview bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', height: '44px', background: 'rgba(15,15,22,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '500' }}>PREVIEW</span>
          {site && <span style={{ color: '#475569', fontSize: '0.8rem' }}>— {site.name}</span>}
          {page && <span style={{ color: '#475569', fontSize: '0.8rem' }}>/ {page.title}</span>}
        </div>
        <button onClick={() => window.close()}
          style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
          Close
        </button>
      </div>

      {/* Page content */}
      <div style={{ paddingTop: '44px' }}>
        <PositionedSectionCollection sections={sections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))} />
      </div>
    </>
  )
}
