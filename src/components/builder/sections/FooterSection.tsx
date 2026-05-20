import type { Section } from '../../../types'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

export default function FooterSection({ section }: Props) {
  const { content, settings } = section
  return (
    <footer style={{ background: settings.background || '#1a1a2e', padding: '48px 0 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px', marginBottom: '48px' }}>
          <AnimatedSectionItem index={0}>
            <div style={{ maxWidth: '280px' }}>
              {(content.logo_image) && <img src={content.logo_image} alt={content.logo || content.brand || 'Logo'} style={{ height: '36px', objectFit: 'contain', marginBottom: '10px' }} />}
              <p style={{ fontWeight: '800', fontSize: '1.25rem', color: settings.primaryColor || '#6366f1', marginBottom: '12px' }}>{content.logo || content.brand || 'Brand'}</p>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.6' }}>{content.tagline || content.description || ''}</p>
            </div>
          </AnimatedSectionItem>
          {(content.columns || []).map((col: any, i: number) => (
            <AnimatedSectionItem key={i} index={1 + i}>
              <div>
                <p style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.9rem', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col.title}</p>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(col.links || []).map((l: any, j: number) => (
                    <li key={j}><a href={l.url || '#'} style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>{l.label}</a></li>
                  ))}
                </ul>
              </div>
            </AnimatedSectionItem>
          ))}
        </div>
        <AnimatedSectionItem index={1 + (content.columns || []).length}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{content.copyright || `© ${new Date().getFullYear()} All rights reserved.`}</p>
          </div>
        </AnimatedSectionItem>
      </div>
    </footer>
  )
}
