import type { Section } from '../../../types'
import EditableText from '../EditableText'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

export default function PricingSection({ section }: Props) {
  const { content, settings } = section
  const plans: any[] = content.plans || []
  return (
    <section style={{ background: settings.background || '#ffffff', padding: `${settings.paddingTop || 80}px 0 ${settings.paddingBottom || 80}px` }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <AnimatedSectionItem index={0}>
            <EditableText sectionId={section.id} field="heading" value={content.heading}
              className="font-bold mb-3" style={{ fontSize: '2.25rem', color: settings.textColor || '#1a1a1a' }} placeholder="Pricing" />
          </AnimatedSectionItem>
          <AnimatedSectionItem index={1}>
            <EditableText sectionId={section.id} field="subheading" value={content.subheading}
              style={{ fontSize: '1.1rem', color: '#6b7280' }} placeholder="Choose your plan" />
          </AnimatedSectionItem>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${plans.length}, 1fr)`, gap: '24px', alignItems: 'start' }}>
          {plans.map((plan: any, i: number) => (
            <AnimatedSectionItem key={i} index={2 + i}>
              <div style={{ borderRadius: '20px', padding: plan.highlighted ? '32px' : '28px', border: plan.highlighted ? `2px solid ${settings.primaryColor || '#6366f1'}` : '1px solid #e5e7eb', background: plan.highlighted ? (settings.primaryColor || '#6366f1') : '#ffffff', boxShadow: plan.highlighted ? '0 20px 60px rgba(99,102,241,0.25)' : 'none', transform: plan.highlighted ? 'scale(1.02)' : 'none' }}>
                {plan.highlighted && <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ffffff', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Most Popular</p>}
                <h3 style={{ fontWeight: '700', fontSize: '1.25rem', color: plan.highlighted ? '#ffffff' : '#1a1a1a', marginBottom: '8px' }}>{plan.name}</h3>
                <p style={{ fontWeight: '800', fontSize: '2.5rem', color: plan.highlighted ? '#ffffff' : '#1a1a1a', marginBottom: '4px' }}>{plan.price}<span style={{ fontSize: '1rem', fontWeight: '500', opacity: 0.7 }}>{plan.period}</span></p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '24px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(plan.features || []).map((f: string, j: number) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: plan.highlighted ? '#ffffffcc' : '#374151', fontSize: '0.95rem' }}>
                      <span style={{ color: plan.highlighted ? '#ffffff' : (settings.primaryColor || '#6366f1'), fontWeight: 'bold' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="#" style={{ display: 'block', textAlign: 'center', padding: '12px', borderRadius: '10px', fontWeight: '600', textDecoration: 'none', background: plan.highlighted ? '#ffffff' : (settings.primaryColor || '#6366f1'), color: plan.highlighted ? (settings.primaryColor || '#6366f1') : '#ffffff' }}>
                  Get Started
                </a>
              </div>
            </AnimatedSectionItem>
          ))}
        </div>
      </div>
    </section>
  )
}
