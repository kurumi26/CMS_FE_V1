import type { Section } from '../../../types'
import EditableText from '../EditableText'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

export default function FormSection({ section }: Props) {
  const { content, settings } = section
  const fields: any[] = content.fields || []
  const [values, setValues] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Form submitted! (preview only)')
    setValues({})
  }

  return (
    <section style={{ background: settings.background || '#f8f9fa', padding: `${settings.paddingTop || 80}px 0` }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <AnimatedSectionItem index={0}>
            <EditableText sectionId={section.id} field="heading" value={content.heading}
              className="font-bold mb-2" style={{ fontSize: '2rem', color: settings.textColor || '#1a1a1a' }} placeholder="Contact Us" />
          </AnimatedSectionItem>
          {content.subheading && (
            <AnimatedSectionItem index={1}>
              <EditableText sectionId={section.id} field="subheading" value={content.subheading}
                style={{ color: '#6b7280' }} placeholder="Subtitle" />
            </AnimatedSectionItem>
          )}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {fields.map((f: any, i: number) => (
            <AnimatedSectionItem key={i} index={2 + i}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', color: '#374151', fontSize: '0.9rem', marginBottom: '6px' }}>{f.label}{f.required && ' *'}</label>
                {f.type === 'textarea'
                  ? <textarea rows={4} value={values[f.name] || ''} onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))}
                      placeholder={f.placeholder} required={f.required}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', resize: 'vertical', outline: 'none', background: '#fff' }} />
                  : <input type={f.type || 'text'} value={values[f.name] || ''} onChange={e => setValues(v => ({ ...v, [f.name]: e.target.value }))}
                      placeholder={f.placeholder} required={f.required}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', background: '#fff' }} />
                }
              </div>
            </AnimatedSectionItem>
          ))}
          <AnimatedSectionItem index={2 + fields.length}>
            <button type="submit" style={{ background: settings.primaryColor || '#6366f1', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '1rem', border: 'none', cursor: 'pointer' }}>
              {content.submit_text || 'Submit'}
            </button>
          </AnimatedSectionItem>
        </form>
      </div>
    </section>
  )
}
