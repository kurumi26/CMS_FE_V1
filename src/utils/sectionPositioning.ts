import type { Section, SectionType } from '../types'

const DEFAULT_FLOATING_WIDTHS: Record<SectionType, number> = {
  hero: 920,
  features: 860,
  about: 760,
  testimonials: 760,
  contact: 700,
  gallery: 820,
  pricing: 920,
  cta: 760,
  text: 700,
  image: 520,
  video: 760,
  divider: 760,
  spacer: 420,
  html: 760,
  navbar: 980,
  footer: 980,
  blog: 840,
  team: 840,
  stats: 760,
  faq: 760,
  form: 720,
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function isFloatingSection(section: Section) {
  return section.settings?.positionMode === 'free'
}

export function getDefaultFloatingWidth(type: SectionType) {
  return DEFAULT_FLOATING_WIDTHS[type] || 720
}

export function getFloatingX(section: Section) {
  return Math.max(0, Number(section.settings?.positionX ?? 32))
}

export function getFloatingY(section: Section) {
  return Math.max(0, Number(section.settings?.positionY ?? 32))
}

export function getFloatingWidth(section: Section) {
  return clamp(Number(section.settings?.frameWidth ?? getDefaultFloatingWidth(section.type)), 260, 1100)
}

export function getFloatingHeight(section: Section) {
  return Math.max(120, Number(section.settings?.frameHeight ?? 320))
}

export function getFloatingStyle(section: Section): React.CSSProperties {
  return {
    position: 'absolute',
    left: getFloatingX(section),
    top: getFloatingY(section),
    width: getFloatingWidth(section),
    zIndex: Number(section.settings?.zIndex ?? 20),
  }
}

export function getFloatingCanvasMinHeight(sections: Section[]) {
  if (sections.length === 0) return 0

  return sections.reduce((maxHeight, section) => {
    return Math.max(maxHeight, getFloatingY(section) + getFloatingHeight(section) + 96)
  }, 900)
}

export function getDefaultFloatingSettings(type: SectionType, x = 32, y = 32) {
  return {
    positionMode: 'free',
    positionX: Math.max(0, Math.round(x)),
    positionY: Math.max(0, Math.round(y)),
    frameWidth: getDefaultFloatingWidth(type),
    frameHeight: 320,
    zIndex: 20,
  }
}