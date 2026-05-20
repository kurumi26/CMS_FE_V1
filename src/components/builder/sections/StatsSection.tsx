import type { Section } from '../../../types'
import EditableText from '../EditableText'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

export default function StatsSection({ section }: Props) {
  const { content, settings } = section
  const stats: any[] = content.stats || []
  return (
    <section style={{ background: settings.background || '#1a1a2e', padding: `${settings.paddingTop || 80}px 0` }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        {content.heading && (
          <AnimatedSectionItem index={0}>
            <EditableText sectionId={section.id} field="heading" value={content.heading}
              className="font-bold mb-12" style={{ fontSize: '2rem', color: settings.textColor || '#ffffff' }} placeholder="Our Numbers" />
          </AnimatedSectionItem>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: '24px' }}>
          {stats.map((s: any, i: number) => (
            <AnimatedSectionItem key={i} index={1 + i}>
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '3rem', fontWeight: '900', color: settings.primaryColor || '#6366f1', marginBottom: '8px' }}>{s.value}</p>
                <p style={{ color: settings.textColor ? settings.textColor + 'bb' : '#9ca3af', fontSize: '1rem', fontWeight: '500' }}>{s.label}</p>
              </div>
            </AnimatedSectionItem>
          ))}
        </div>
      </div>
    </section>
  )
}
