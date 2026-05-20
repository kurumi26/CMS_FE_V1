import type { Section } from '../../../types'
import EditableText from '../EditableText'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

export default function TextSection({ section }: Props) {
  return (
    <section style={{ background: section.settings.background || '#ffffff', padding: `${section.settings.paddingTop || 60}px 0` }}>
      <div style={{ maxWidth: section.settings.maxWidth || '800px', margin: '0 auto', padding: '0 24px', color: section.settings.textColor || '#374151', lineHeight: '1.7', fontSize: '1.05rem' }}>
        <AnimatedSectionItem index={0}>
          <EditableText sectionId={section.id} field="content" value={section.content.content} placeholder="Click to add text..." />
        </AnimatedSectionItem>
      </div>
    </section>
  )
}
