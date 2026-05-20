import { useState } from 'react'
import type { Section } from '../../../types'
import EditableText from '../EditableText'
import { AnimatedSectionItem } from '../SectionAnimation'
import { ChevronDown } from 'lucide-react'

interface Props { section: Section }

export default function FaqSection({ section }: Props) {
  const { content, settings } = section
  const faqs: any[] = content.items || content.faqs || []
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  return (
    <section style={{ background: settings.background || '#ffffff', padding: `${settings.paddingTop || 80}px 0` }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <AnimatedSectionItem index={0}>
            <EditableText sectionId={section.id} field="heading" value={content.heading}
              className="font-bold" style={{ fontSize: '2.25rem', color: settings.textColor || '#1a1a1a' }} placeholder="Frequently Asked Questions" />
          </AnimatedSectionItem>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq: any, i: number) => (
            <AnimatedSectionItem key={i} index={1 + i}>
              <div style={{ borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', background: '#fff', cursor: 'pointer', border: 'none', textAlign: 'left' }}>
                  <span style={{ fontWeight: '600', color: '#1a1a1a', fontSize: '1rem' }}>{faq.q}</span>
                  <ChevronDown size={18} style={{ color: '#9ca3af', transform: openIdx === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openIdx === i && (
                  <div style={{ padding: '4px 20px 18px', color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.7' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            </AnimatedSectionItem>
          ))}
        </div>
      </div>
    </section>
  )
}
