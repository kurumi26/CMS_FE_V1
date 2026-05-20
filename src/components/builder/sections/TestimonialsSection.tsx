import type { Section } from '../../../types'
import EditableText from '../EditableText'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

export default function TestimonialsSection({ section }: Props) {
  const { content, settings } = section
  const testimonials: any[] = content.testimonials || []
  return (
    <section style={{ background: settings.background || '#f8f9fa', padding: `${settings.paddingTop || 80}px 0 ${settings.paddingBottom || 80}px` }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <AnimatedSectionItem index={0}>
            <EditableText sectionId={section.id} field="heading" value={content.heading}
              className="font-bold" style={{ fontSize: '2.25rem', color: settings.textColor || '#1a1a1a' }} placeholder="What People Say" />
          </AnimatedSectionItem>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {testimonials.map((t: any, i: number) => (
            <AnimatedSectionItem key={i} index={1 + i}>
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
                <p style={{ color: '#374151', fontSize: '1rem', lineHeight: '1.7', marginBottom: '20px', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.9rem', flexShrink: 0 }}>
                    {t.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '0.95rem' }}>{t.name}</p>
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            </AnimatedSectionItem>
          ))}
        </div>
      </div>
    </section>
  )
}
