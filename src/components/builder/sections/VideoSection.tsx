import type { Section } from '../../../types'
import { Play } from 'lucide-react'
import { AnimatedSectionItem } from '../SectionAnimation'

interface Props { section: Section }

function parseVideoEmbed(url: string): { src: string; isIframe: boolean } | null {
  if (!url) return null
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (ytMatch) {
    return { src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`, isIframe: true }
  }
  // Vimeo
  const vmMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vmMatch) {
    return { src: `https://player.vimeo.com/video/${vmMatch[1]}?dnt=1`, isIframe: true }
  }
  // Direct video file
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return { src: url, isIframe: false }
  }
  // Fallback: treat as iframe embed
  return { src: url, isIframe: true }
}

export default function VideoSection({ section }: Props) {
  const { content, settings } = section
  const bg = settings.background || '#0f172a'
  const textColor = settings.textColor || '#f1f5f9'
  const pt = settings.paddingTop ?? 80
  const pb = settings.paddingBottom ?? 80

  const embed = parseVideoEmbed(content.url || '')

  return (
    <section style={{ background: bg, paddingTop: pt, paddingBottom: pb }}>
      <div className="max-w-4xl mx-auto px-6">
        {content.heading && (
          <AnimatedSectionItem index={0}>
            <h2 className="text-3xl font-bold text-center mb-4" style={{ color: textColor }}>
              {content.heading}
            </h2>
          </AnimatedSectionItem>
        )}
        {content.caption && (
          <AnimatedSectionItem index={1}>
            <p className="text-center mb-8 text-base" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {content.caption}
            </p>
          </AnimatedSectionItem>
        )}

        <AnimatedSectionItem index={2}>
          <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.5)', paddingBottom: '56.25%', height: 0 }}>
            {!embed ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(255,255,255,0.1)' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.2)', border: '2px solid rgba(99,102,241,0.4)' }}>
                  <Play size={24} style={{ color: '#818cf8', marginLeft: 3 }} />
                </div>
                <p className="text-sm" style={{ color: '#64748b' }}>Paste a video URL in the Content panel</p>
              </div>
            ) : embed.isIframe ? (
              <iframe
                src={embed.src}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            ) : (
              <video
                src={embed.src}
                className="absolute inset-0 w-full h-full object-cover"
                controls
                autoPlay={content.autoplay}
                muted={content.autoplay}
                loop={content.autoplay}
              />
            )}
          </div>
        </AnimatedSectionItem>
      </div>
    </section>
  )
}
