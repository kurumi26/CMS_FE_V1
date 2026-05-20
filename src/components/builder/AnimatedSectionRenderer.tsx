import { motion } from 'framer-motion'
import type { Section } from '../../types'
import SectionRenderer from './SectionRenderer'
import { ANIMATION_VARIANTS, SectionAnimationProvider, supportsElementAnimation } from './SectionAnimation'

interface Props {
  section: Section
}

export default function AnimatedSectionRenderer({ section }: Props) {
  const animation = section.settings?.animation
  const content = (
    <SectionAnimationProvider section={section}>
      <SectionRenderer section={section} />
    </SectionAnimationProvider>
  )

  if (animation && animation !== 'none' && ANIMATION_VARIANTS[animation]) {
    if (supportsElementAnimation(section.type)) return content

    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        variants={ANIMATION_VARIANTS[animation]}
        transition={{ duration: 0.55, delay: (section.settings.animationDelay || 0) / 1000, ease: 'easeOut' }}
      >
        {content}
      </motion.div>
    )
  }

  return content
}
