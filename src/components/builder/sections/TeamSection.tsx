import type { Section } from '../../../types'
import EditableText from '../EditableText'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

export default function TeamSection({ section }: Props) {
  const { content, settings } = section
  const members: any[] = content.members || []
  return (
    <section style={{ background: settings.background || '#f8f9fa', padding: `${settings.paddingTop || 80}px 0` }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
        <AnimatedSectionItem index={0}>
          <EditableText sectionId={section.id} field="heading" value={content.heading}
            className="font-bold mb-12" style={{ fontSize: '2.25rem', color: settings.textColor || '#1a1a1a' }} placeholder="Meet the Team" />
        </AnimatedSectionItem>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
          {members.map((m: any, i: number) => (
            <AnimatedSectionItem key={i} index={1 + i}>
              <div>
                <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontWeight: '800', fontSize: '1.5rem' }}>
                  {m.name?.[0]?.toUpperCase()}
                </div>
                <h3 style={{ fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>{m.name}</h3>
                <p style={{ color: settings.primaryColor || '#6366f1', fontSize: '0.9rem', fontWeight: '500', marginBottom: '8px' }}>{m.role}</p>
                {m.bio && <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{m.bio}</p>}
              </div>
            </AnimatedSectionItem>
          ))}
        </div>
      </div>
    </section>
  )
}
