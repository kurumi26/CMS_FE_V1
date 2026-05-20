import type { Section } from '../../../types'

interface Props { section: Section }

export default function DividerSection({ section }: Props) {
  const { settings, content } = section
  const style = content.style || 'line'
  return (
    <div style={{ padding: `${settings.paddingTop || 24}px 0 ${settings.paddingBottom || 24}px`, background: settings.background || 'transparent' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        {style === 'line' && <hr style={{ border: 'none', borderTop: `${content.thickness || 1}px solid ${content.color || '#e5e7eb'}` }} />}
        {style === 'dots' && <div style={{ textAlign: 'center', color: content.color || '#d1d5db', letterSpacing: '0.5em', fontSize: '1.5rem' }}>• • •</div>}
        {style === 'wave' && <div style={{ height: '30px', background: `url("data:image/svg+xml,%3Csvg...%3C/svg%3E")` }} />}
      </div>
    </div>
  )
}
