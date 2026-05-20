import type { Section } from '../../../types'
import EditableText from '../EditableText'
import { AnimatedSectionItem } from '../SectionAnimation'
import { Zap, Shield, Star, Brain, Smartphone, Users, BarChart2, Globe, Lock, Cloud, Cpu, Briefcase, TrendingUp, Code2, Palette, Truck, RotateCcw, CreditCard, Music, Utensils, Wine } from 'lucide-react'

interface Props { section: Section }

const iconMap: Record<string, any> = { Zap, Shield, Star, Brain, Smartphone, Users, BarChart2, Globe, Lock, Cloud, Cpu, Briefcase, TrendingUp, Code2, Palette, Truck, RotateCcw, CreditCard, Music, Utensils, Wine }

export default function FeaturesSection({ section }: Props) {
  const { content, settings } = section
  const cols = settings.columns || 3
  const features: any[] = content.features || []

  return (
    <section style={{ background: settings.background || '#f8f9fa', padding: `${settings.paddingTop || 80}px 0 ${settings.paddingBottom || 80}px` }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <AnimatedSectionItem index={0}>
            <EditableText sectionId={section.id} field="heading" value={content.heading}
              className="font-bold mb-3" style={{ fontSize: '2.25rem', color: settings.textColor || '#1a1a1a' }} placeholder="Our Features" />
          </AnimatedSectionItem>
          {content.subheading && (
            <AnimatedSectionItem index={1}>
              <EditableText sectionId={section.id} field="subheading" value={content.subheading}
                className="max-w-xl mx-auto" style={{ fontSize: '1.1rem', color: '#6b7280' }} placeholder="Subtitle" />
            </AnimatedSectionItem>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(cols, features.length || cols)}, 1fr)`, gap: '24px' }}>
          {features.map((f: any, i: number) => {
            const Icon = iconMap[f.icon] || Star
            return (
              <AnimatedSectionItem key={i} index={2 + i}>
                <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <Icon size={22} style={{ color: settings.primaryColor || '#6366f1' }} />
                  </div>
                  <h3 style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.6' }}>{f.desc}</p>
                </div>
              </AnimatedSectionItem>
            )
          })}
        </div>
      </div>
    </section>
  )
}
