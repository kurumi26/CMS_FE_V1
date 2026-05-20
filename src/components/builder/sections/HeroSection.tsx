import type { Section } from '../../../types'
import EditableText from '../EditableText'
import { useBuilderStore } from '../../../store/builderStore'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

export default function HeroSection({ section }: Props) {
  const { content, settings } = section

  const hasBgImage = !!(content.background_image)
  const bgStyle: React.CSSProperties = hasBgImage
    ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${content.background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : settings.background === 'gradient'
      ? { background: `linear-gradient(135deg, ${settings.primaryColor || '#6366f1'} 0%, ${settings.primaryColor ? settings.primaryColor + 'aa' : '#7c3aed'} 100%)` }
      : { background: settings.background || '#ffffff' }

  const minH = settings.minHeight || 460

  return (
    <section style={{ ...bgStyle, paddingTop: `${settings.paddingTop || 80}px`, paddingBottom: `${settings.paddingBottom || 80}px`, minHeight: `${minH}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ maxWidth: settings.maxWidth || '1100px', margin: '0 auto', padding: '0 24px', textAlign: settings.layout === 'left' ? 'left' : 'center' }}>
        <AnimatedSectionItem index={0}>
          <EditableText
            sectionId={section.id} field="heading" value={content.heading}
            className="font-black leading-tight mb-4"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: settings.textColor || '#ffffff' }}
            placeholder="Your Amazing Headline"
          />
        </AnimatedSectionItem>
        <AnimatedSectionItem index={1}>
          <EditableText
            sectionId={section.id} field="subheading" value={content.subheading}
            className="mb-8 max-w-2xl mx-auto leading-relaxed"
            style={{ fontSize: '1.25rem', color: settings.textColor ? settings.textColor + 'cc' : '#ffffffcc' }}
            placeholder="A compelling subheadline that drives action."
          />
        </AnimatedSectionItem>
        {(content.cta_text || content.cta_secondary_text) && (
          <AnimatedSectionItem index={2}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: settings.layout === 'left' ? 'flex-start' : 'center', flexWrap: 'wrap' }}>
              {content.cta_text && (
                <a href={content.cta_url || '#'}
                  style={{ background: '#ffffff', color: settings.primaryColor || '#6366f1', padding: '14px 32px', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', textDecoration: 'none', display: 'inline-block' }}>
                  {content.cta_text}
                </a>
              )}
              {content.cta_secondary_text && (
                <a href="#"
                  style={{ background: 'transparent', color: settings.textColor || '#ffffff', padding: '14px 32px', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', textDecoration: 'none', display: 'inline-block', border: '2px solid rgba(255,255,255,0.3)' }}>
                  {content.cta_secondary_text}
                </a>
              )}
            </div>
          </AnimatedSectionItem>
        )}
      </div>
    </section>
  )
}
