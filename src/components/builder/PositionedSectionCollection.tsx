import type { Section } from '../../types'
import AnimatedSectionRenderer from './AnimatedSectionRenderer'
import { getFloatingCanvasMinHeight, getFloatingStyle, isFloatingSection } from '../../utils/sectionPositioning'

interface Props {
  sections: Section[]
}

export default function PositionedSectionCollection({ sections }: Props) {
  const visibleSections = sections.filter(section => !section.settings?.hidden)
  const flowSections = visibleSections.filter(section => !isFloatingSection(section))
  const floatingSections = visibleSections.filter(isFloatingSection)
  const minHeight = getFloatingCanvasMinHeight(floatingSections)

  return (
    <div className="relative" style={minHeight > 0 ? { minHeight } : undefined}>
      {flowSections.map((section) => (
        <AnimatedSectionRenderer key={section.id} section={section} />
      ))}

      {floatingSections.map((section) => (
        <div key={section.id} style={getFloatingStyle(section)}>
          <AnimatedSectionRenderer section={section} />
        </div>
      ))}
    </div>
  )
}