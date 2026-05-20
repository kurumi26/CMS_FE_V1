import { useState } from 'react'
import type { Section } from '../../../types'
import { X, ZoomIn } from 'lucide-react'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

export default function GallerySection({ section }: Props) {
  const { content, settings } = section
  const [lightbox, setLightbox] = useState<string | null>(null)
  const images: any[] = content.images || []
  const cols = settings.columns || 3

  const bg = settings.background || '#f8fafc'
  const textColor = settings.textColor || '#1e293b'
  const pt = settings.paddingTop ?? 80
  const pb = settings.paddingBottom ?? 80

  const colsClass: Record<number, string> = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }
  const gridClass = colsClass[cols] || 'grid-cols-3'

  return (
    <section style={{ background: bg, paddingTop: pt, paddingBottom: pb }}>
      <div className="max-w-6xl mx-auto px-6">
        {content.heading && (
          <AnimatedSectionItem index={0}>
            <h2 className="text-3xl font-bold text-center mb-10" style={{ color: textColor }}>
              {content.heading}
            </h2>
          </AnimatedSectionItem>
        )}
        {images.length === 0 ? (
          <AnimatedSectionItem index={1}>
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl gap-3"
              style={{ border: '2px dashed rgba(99,102,241,0.3)', color: '#94a3b8' }}>
              <ZoomIn size={32} />
              <p className="text-sm">Add images in the Content panel</p>
            </div>
          </AnimatedSectionItem>
        ) : (
          <div className={`grid ${gridClass} gap-4`}>
            {images.map((img, i) => (
              <AnimatedSectionItem key={i} index={1 + i}>
                <div className="group relative overflow-hidden rounded-xl cursor-pointer aspect-square"
                  onClick={() => setLightbox(img.url)} style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                  <img src={img.url} alt={img.alt || ''} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }}>
                    {img.caption && <p className="text-white text-xs font-medium">{img.caption}</p>}
                  </div>
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(255,255,255,0.9)' }}>
                    <ZoomIn size={13} style={{ color: '#1e293b' }} />
                  </div>
                </div>
              </AnimatedSectionItem>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.92)' }} onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <X size={20} style={{ color: '#fff' }} />
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-2xl object-contain"
            style={{ maxHeight: '90vh' }} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </section>
  )
}
