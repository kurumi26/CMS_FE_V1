import type { Section } from '../../../types'
import EditableText from '../EditableText'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

export default function CtaSection({ section }: Props) {
  const { content, settings } = section
  const bgStyle = settings.background === 'gradient'
    ? { background: `linear-gradient(135deg, ${settings.primaryColor || '#6366f1'}, #7c3aed)` }
    : { background: settings.background || '#6366f1' }
  return (
    <section style={{ ...bgStyle, padding: `${settings.paddingTop || 80}px 0 ${settings.paddingBottom || 80}px` }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <AnimatedSectionItem index={0}>
          <EditableText sectionId={section.id} field="heading" value={content.heading}
            className="font-black mb-4" style={{ fontSize: '2.5rem', color: settings.textColor || '#ffffff' }} placeholder="Ready to Get Started?" />
        </AnimatedSectionItem>
        <AnimatedSectionItem index={1}>
          <EditableText sectionId={section.id} field="subheading" value={content.subheading}
            className="mb-8" style={{ fontSize: '1.2rem', color: settings.textColor ? settings.textColor + 'cc' : '#ffffffcc' }} placeholder="Subtitle" />
        </AnimatedSectionItem>
        <AnimatedSectionItem index={2}>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={content.cta_url || '#'}
              style={{ background: '#ffffff', color: settings.primaryColor || '#6366f1', padding: '14px 36px', borderRadius: '10px', fontWeight: '700', fontSize: '1rem', textDecoration: 'none' }}>
              {content.cta_text || 'Get Started'}
            </a>
            {content.cta_secondary && (
              <a href="#" style={{ background: 'transparent', color: '#ffffff', padding: '14px 36px', borderRadius: '10px', fontWeight: '600', fontSize: '1rem', textDecoration: 'none', border: '2px solid rgba(255,255,255,0.4)' }}>
                {content.cta_secondary}
              </a>
            )}
          </div>
        </AnimatedSectionItem>
      </div>
    </section>
  )
}
