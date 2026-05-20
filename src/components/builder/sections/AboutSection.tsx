import type { Section } from '../../../types'
import EditableText from '../EditableText'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

export default function AboutSection({ section }: Props) {
  const { content, settings } = section
  return (
    <section style={{ background: settings.background || '#ffffff', padding: `${settings.paddingTop || 80}px 0 ${settings.paddingBottom || 80}px` }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '64px', alignItems: 'center', flexWrap: 'wrap' }}>
        {content.image && (
          <AnimatedSectionItem index={0}>
            <div style={{ flex: '0 0 420px', borderRadius: '16px', overflow: 'hidden' }}>
              <img src={content.image} alt="About" style={{ width: '100%', height: '320px', objectFit: 'cover' }} />
            </div>
          </AnimatedSectionItem>
        )}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <AnimatedSectionItem index={1}>
            <EditableText sectionId={section.id} field="heading" value={content.heading}
              className="font-bold mb-4" style={{ fontSize: '2.25rem', color: settings.textColor || '#1a1a1a' }} placeholder="About Us" />
          </AnimatedSectionItem>
          <AnimatedSectionItem index={2}>
            <EditableText sectionId={section.id} field="text" value={content.text}
              className="leading-relaxed mb-8" style={{ fontSize: '1.05rem', color: '#6b7280' }} placeholder="Tell your story..." />
          </AnimatedSectionItem>
          {content.stats && (
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              {content.stats.map((s: any, i: number) => (
                <AnimatedSectionItem key={i} index={3 + i}>
                  <div>
                    <p style={{ fontSize: '2rem', fontWeight: '800', color: settings.primaryColor || '#6366f1' }}>{s.value}</p>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>{s.label}</p>
                  </div>
                </AnimatedSectionItem>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
