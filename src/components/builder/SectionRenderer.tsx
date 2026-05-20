import type { Section } from '../../types'
import HeroSection from './sections/HeroSection'
import FeaturesSection from './sections/FeaturesSection'
import AboutSection from './sections/AboutSection'
import TestimonialsSection from './sections/TestimonialsSection'
import ContactSection from './sections/ContactSection'
import PricingSection from './sections/PricingSection'
import CtaSection from './sections/CtaSection'
import TextSection from './sections/TextSection'
import StatsSection from './sections/StatsSection'
import FaqSection from './sections/FaqSection'
import TeamSection from './sections/TeamSection'
import NavbarSection from './sections/NavbarSection'
import FooterSection from './sections/FooterSection'
import DividerSection from './sections/DividerSection'
import FormSection from './sections/FormSection'
import GallerySection from './sections/GallerySection'
import VideoSection from './sections/VideoSection'
import SpacerSection from './sections/SpacerSection'
import HtmlSection from './sections/HtmlSection'
import ImageSection from './sections/ImageSection'

interface Props {
  section: Section
}

export default function SectionRenderer({ section }: Props) {
  const map: Record<string, React.ComponentType<{ section: Section }>> = {
    hero:         HeroSection,
    features:     FeaturesSection,
    about:        AboutSection,
    testimonials: TestimonialsSection,
    contact:      ContactSection,
    pricing:      PricingSection,
    cta:          CtaSection,
    text:         TextSection,
    stats:        StatsSection,
    faq:          FaqSection,
    team:         TeamSection,
    navbar:       NavbarSection,
    footer:       FooterSection,
    divider:      DividerSection,
    form:         FormSection,
    gallery:      GallerySection,
    video:        VideoSection,
    spacer:       SpacerSection,
    html:         HtmlSection,
    image:        ImageSection,
    blog:         FeaturesSection, // placeholder until BlogSection is created
  }

  const Component = map[section.type]
  if (!Component) {
    return (
      <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200">
        Unknown section type: <strong>{section.type}</strong>
      </div>
    )
  }
  return <Component section={section} />
}
