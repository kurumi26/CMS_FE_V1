import type { Section } from '../../../types'
import EditableText from '../EditableText'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

export default function ContactSection({ section }: Props) {
  const { content, settings } = section
  return (
    <section style={{ background: settings.background || '#f8f9fa', padding: `${settings.paddingTop || 80}px 0 ${settings.paddingBottom || 80}px` }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <AnimatedSectionItem index={0}>
          <EditableText sectionId={section.id} field="heading" value={content.heading}
            className="font-bold mb-3" style={{ fontSize: '2.25rem', color: settings.textColor || '#1a1a1a' }} placeholder="Get In Touch" />
        </AnimatedSectionItem>
        <AnimatedSectionItem index={1}>
          <EditableText sectionId={section.id} field="subheading" value={content.subheading}
            className="mb-8" style={{ fontSize: '1.1rem', color: '#6b7280' }} placeholder="We'd love to hear from you." />
        </AnimatedSectionItem>
        <AnimatedSectionItem index={2}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            {content.email && <a href={`mailto:${content.email}`} style={{ color: settings.primaryColor || '#6366f1', fontWeight: '600', fontSize: '1rem' }}>{content.email}</a>}
            {content.phone && <p style={{ color: '#374151' }}>{content.phone}</p>}
            {content.address && <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>{content.address}</p>}
          </div>
        </AnimatedSectionItem>
      </div>
    </section>
  )
}
