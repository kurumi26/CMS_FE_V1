import type { Section } from '../../../types'
import { Image } from 'lucide-react'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

export default function ImageSection({ section }: Props) {
  const { content, settings } = section
  const pt = settings.paddingTop ?? 40
  const pb = settings.paddingBottom ?? 40

  if (!content.url) {
    return (
      <section style={{ background: settings.background || '#f8fafc', paddingTop: pt, paddingBottom: pb }}>
        <div className="max-w-4xl mx-auto px-6">
          <AnimatedSectionItem index={0}>
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl"
              style={{ border: '2px dashed rgba(99,102,241,0.3)', color: '#94a3b8' }}>
              <Image size={32} />
              <p className="text-sm">Add an image URL in the Content panel</p>
            </div>
          </AnimatedSectionItem>
        </div>
      </section>
    )
  }

  return (
    <section style={{ background: settings.background || '#f8fafc', paddingTop: pt, paddingBottom: pb }}>
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center">
        <AnimatedSectionItem index={0}>
          <img
            src={content.url}
            alt={content.alt || ''}
            className="w-full rounded-2xl object-cover"
            style={{ maxHeight: '600px', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}
          />
        </AnimatedSectionItem>
        {content.caption && (
          <AnimatedSectionItem index={1}>
            <p className="text-sm mt-3 text-center" style={{ color: settings.textColor || '#64748b' }}>
              {content.caption}
            </p>
          </AnimatedSectionItem>
        )}
      </div>
    </section>
  )
}
