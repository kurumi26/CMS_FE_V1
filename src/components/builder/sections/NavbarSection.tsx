import type { Section } from '../../../types'
import { Link } from 'react-router-dom'
import EditableText from '../EditableText'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

/** Convert a URL to a relative path if it points to the same origin.
 *  Returns { isLocal, to } so <Link> or <a> can be chosen accordingly. */
function toPath(url: string): { isLocal: boolean; to: string } {
  if (!url) return { isLocal: false, to: '#' }
  if (url.startsWith('/')) return { isLocal: true, to: url }
  if (url.startsWith('#')) return { isLocal: false, to: url }
  try {
    const u = new URL(url)
    if (u.origin === window.location.origin)
      return { isLocal: true, to: u.pathname + u.search + u.hash }
  } catch {}
  return { isLocal: false, to: url }
}

export default function NavbarSection({ section }: Props) {
  const { content, settings } = section
  const links: any[] = content.links || []
  const brandText = typeof content.logo === 'string'
    ? content.logo
    : (typeof content.brand === 'string' ? content.brand : '')
  const menuPosition = settings.navAlignment === 'left'
    ? 'left'
    : settings.navAlignment === 'center'
      ? 'center'
      : 'right'
  const logoPosition = settings.navLogoPosition === 'center'
    ? 'center'
    : settings.navLogoPosition === 'right'
      ? 'right'
      : 'left'
  const navHeight = Number(settings.navHeight ?? 64)
  const logoSize = Number(settings.navLogoSize ?? 36)
  const linkGap = Number(settings.navLinkGap ?? 32)
  const sameSlot = logoPosition === menuPosition

  const justify = (position: 'left' | 'center' | 'right') => {
    if (position === 'left') return 'flex-start'
    if (position === 'center') return 'center'
    return 'flex-end'
  }

  const ctaStyle: React.CSSProperties = settings.navCtaStyle === 'outline'
    ? {
        background: 'transparent',
        color: settings.primaryColor || '#6366f1',
        border: `1px solid ${settings.primaryColor || '#6366f1'}`,
      }
    : settings.navCtaStyle === 'ghost'
      ? {
          background: 'transparent',
          color: settings.primaryColor || '#6366f1',
          border: '1px solid transparent',
        }
      : {
          background: settings.primaryColor || '#6366f1',
          color: '#ffffff',
          border: '1px solid transparent',
        }

  const linkStyle: React.CSSProperties = {
    color: '#374151', textDecoration: 'none', fontWeight: '500',
    fontSize: '0.95rem', transition: 'color 0.2s',
  }

  const brandNode = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {content.logo_image && <AnimatedSectionItem index={0}>
        <img
          src={content.logo_image}
          alt={brandText || 'Logo'}
          style={{ height: `${logoSize}px`, width: 'auto', objectFit: 'contain' }}
        />
      </AnimatedSectionItem>}
      {brandText && <AnimatedSectionItem index={1}>
        <EditableText
          sectionId={section.id}
          field="logo"
          value={brandText}
          className="font-extrabold"
          style={{ fontSize: '1.25rem', color: settings.primaryColor || '#6366f1', whiteSpace: 'nowrap' }}
          placeholder="Brand"
        />
      </AnimatedSectionItem>}
    </div>
  )

  const menuNode = (
    <div style={{ display: 'flex', gap: `${linkGap}px`, alignItems: 'center', justifyContent: justify(menuPosition), flexWrap: 'wrap' }}>
      {links.map((l: any, i: number) => {
        const { isLocal, to } = toPath(l.url || '')
        if (isLocal) {
          return <AnimatedSectionItem key={i} index={2 + i}><Link to={to} style={linkStyle}>{l.label}</Link></AnimatedSectionItem>
        }
        return <AnimatedSectionItem key={i} index={2 + i}><a href={to} style={linkStyle}>{l.label}</a></AnimatedSectionItem>
      })}
      {(content.cta_text || content.cta) && (
        <AnimatedSectionItem index={2 + links.length}>
          <a href={content.cta_url || '#'} style={{ ...ctaStyle, padding: '8px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' }}>
            {content.cta_text || content.cta}
          </a>
        </AnimatedSectionItem>
      )}
    </div>
  )

  const containerStyle: React.CSSProperties = sameSlot
    ? {
        display: 'flex',
        alignItems: 'center',
        justifyContent: justify(menuPosition),
        gap: '24px',
        flexWrap: 'wrap',
        minHeight: `${navHeight}px`,
      }
    : {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
        alignItems: 'center',
        gap: '24px',
        minHeight: `${navHeight}px`,
      }

  const slotStyle = (position: 'left' | 'center' | 'right'): React.CSSProperties => {
    if (sameSlot) {
      return { display: 'contents' }
    }

    return {
      gridColumn: position === 'left' ? '1' : position === 'center' ? '2' : '3',
      justifySelf: position === 'left' ? 'start' : position === 'center' ? 'center' : 'end',
      minWidth: 0,
    }
  }

  return (
    <nav style={{ background: settings.background || '#ffffff', borderBottom: '1px solid #f0f0f0', position: settings.navSticky ? 'sticky' : 'relative', top: settings.navSticky ? 0 : undefined, zIndex: settings.navSticky ? 40 : 5 }}>
      <div style={{ maxWidth: settings.maxWidth || '1100px', margin: '0 auto', padding: '0 24px', ...containerStyle }}>
        <div style={slotStyle(logoPosition)}>
          {brandNode}
        </div>
        <div style={slotStyle(menuPosition)}>
          {menuNode}
        </div>
      </div>
    </nav>
  )
}
