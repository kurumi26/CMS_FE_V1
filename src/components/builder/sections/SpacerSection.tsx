import type { Section } from '../../../types'

interface Props { section: Section }

export default function SpacerSection({ section }: Props) {
  const height = Number(section.content.height) || 80
  return <div style={{ height }} aria-hidden="true" />
}
