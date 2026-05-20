import { createContext, useContext } from 'react'
import { motion, type Variants } from 'framer-motion'
import type { Section, SectionType } from '../../types'

export const ANIMATION_VARIANTS: Record<string, Variants> = {
  fadeUp: { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
  fadeDown: { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
  fadeLeft: { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
  fadeRight: { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } },
  zoomIn: { hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1 } },
  flipY: { hidden: { opacity: 0, rotateX: 90 }, visible: { opacity: 1, rotateX: 0 } },
  bounce: { hidden: { opacity: 0, scale: 0.3 }, visible: { opacity: 1, scale: 1, transition: { type: 'spring', bounce: 0.5 } } },
}

const ELEMENT_ANIMATED_SECTION_TYPES = new Set<SectionType>([
  'hero',
  'text',
  'features',
  'about',
  'testimonials',
  'contact',
  'pricing',
  'cta',
  'image',
  'video',
  'navbar',
  'footer',
  'team',
  'stats',
  'faq',
  'form',
  'gallery',
  'blog',
])

interface SectionAnimationContextValue {
  animation?: string
  delayMs: number
  enabled: boolean
}

const SectionAnimationContext = createContext<SectionAnimationContextValue>({
  animation: 'none',
  delayMs: 0,
  enabled: false,
})

export function supportsElementAnimation(sectionType: SectionType) {
  return ELEMENT_ANIMATED_SECTION_TYPES.has(sectionType)
}

export function SectionAnimationProvider({ section, children }: { section: Section; children: React.ReactNode }) {
  const animation = section.settings?.animation
  const enabled = !!animation && animation !== 'none' && !!ANIMATION_VARIANTS[animation]

  return (
    <SectionAnimationContext.Provider
      value={{
        animation,
        delayMs: section.settings?.animationDelay || 0,
        enabled,
      }}
    >
      {children}
    </SectionAnimationContext.Provider>
  )
}

export function AnimatedSectionItem({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
  const { animation, delayMs, enabled } = useContext(SectionAnimationContext)

  if (!enabled || !animation) return <>{children}</>

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={ANIMATION_VARIANTS[animation]}
      transition={{ duration: 0.55, delay: (delayMs + index * 120) / 1000, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
