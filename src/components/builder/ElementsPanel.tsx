import { useBuilderStore } from '../../store/builderStore'
import type { SectionSettings, SectionType } from '../../types'
import {
  Layout, Type, Code2, Navigation,
  Star, Users, Grid, DollarSign, BarChart2, HelpCircle, Phone,
  Mail, Minus, ArrowUpDown, PenSquare, Rss, Image, Video, Play
} from 'lucide-react'
import { isFloatingSection } from '../../utils/sectionPositioning'

type LibraryItem = {
  type: SectionType
  label: string
  icon: any
  desc: string
  defaultPlacement?: 'auto' | 'free'
  content?: Record<string, any>
  settings?: Partial<SectionSettings>
}

const categories: Array<{ label: string; items: LibraryItem[] }> = [
  {
    label: 'Blocks',
    items: [
      {
        type: 'text',
        label: 'Heading Block',
        icon: Type,
        desc: 'Single movable headline block',
        defaultPlacement: 'free',
        content: { content: '<h2>Headline block</h2><p>Short supporting text that you can edit directly on the canvas.</p>' },
        settings: { frameWidth: 420, maxWidth: 420, paddingTop: 24, paddingBottom: 24, background: '#ffffff' },
      },
      {
        type: 'text',
        label: 'Copy Block',
        icon: Code2,
        desc: 'Compact paragraph block',
        defaultPlacement: 'free',
        content: { content: '<p>Use this movable text block for details, notes, pricing blurbs, or short descriptions.</p>' },
        settings: { frameWidth: 360, maxWidth: 360, paddingTop: 20, paddingBottom: 20, background: '#ffffff' },
      },
      {
        type: 'image',
        label: 'Image Block',
        icon: Image,
        desc: 'Single repositionable image card',
        defaultPlacement: 'free',
        content: { caption: 'Image caption' },
        settings: { frameWidth: 360, paddingTop: 18, paddingBottom: 18, background: '#f8fafc' },
      },
      {
        type: 'video',
        label: 'Video Block',
        icon: Play,
        desc: 'Movable video card',
        defaultPlacement: 'free',
        content: { heading: 'Video block', caption: 'Add a YouTube, Vimeo, or MP4 URL in Content.' },
        settings: { frameWidth: 460, paddingTop: 20, paddingBottom: 20, background: '#0f172a' },
      },
      {
        type: 'stats',
        label: 'Stat Block',
        icon: BarChart2,
        desc: 'Single floating stat tile',
        defaultPlacement: 'free',
        content: { heading: '', stats: [{ value: '42%', label: 'Conversion lift' }] },
        settings: { frameWidth: 300, paddingTop: 24, paddingBottom: 24, background: '#111827', textColor: '#f8fafc' },
      },
    ],
  },
  {
    label: 'Layout',
    items: [
      { type: 'hero', label: 'Hero', icon: Layout, desc: 'Full hero section', defaultPlacement: 'auto' },
      { type: 'features', label: 'Features', icon: Star, desc: 'Feature grid', defaultPlacement: 'auto' },
      { type: 'about', label: 'About', icon: Users, desc: 'About section', defaultPlacement: 'auto' },
      { type: 'cta', label: 'Call to Action', icon: PenSquare, desc: 'CTA banner', defaultPlacement: 'auto' },
    ],
  },
  {
    label: 'Content',
    items: [
      { type: 'text', label: 'Text Block', icon: Type, desc: 'Rich text area', defaultPlacement: 'auto' },
      { type: 'stats', label: 'Stats', icon: BarChart2, desc: 'Numbers & stats', defaultPlacement: 'auto' },
      { type: 'image', label: 'Image', icon: Image, desc: 'Single image', defaultPlacement: 'auto' },
      { type: 'video', label: 'Video', icon: Play, desc: 'YouTube/Vimeo/MP4', defaultPlacement: 'auto' },
      { type: 'gallery', label: 'Gallery', icon: Grid, desc: 'Image gallery', defaultPlacement: 'auto' },
      { type: 'blog', label: 'Blog Posts', icon: Rss, desc: 'Blog grid', defaultPlacement: 'auto' },
    ],
  },
  {
    label: 'Navigation',
    items: [
      { type: 'navbar', label: 'Navbar', icon: Navigation, desc: 'Top navigation', defaultPlacement: 'auto' },
      { type: 'footer', label: 'Footer', icon: Navigation, desc: 'Page footer', defaultPlacement: 'auto' },
    ],
  },
  {
    label: 'Social',
    items: [
      { type: 'testimonials', label: 'Testimonials', icon: Star, desc: 'Quotes grid', defaultPlacement: 'auto' },
      { type: 'team', label: 'Team', icon: Users, desc: 'Team member grid', defaultPlacement: 'auto' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { type: 'pricing', label: 'Pricing', icon: DollarSign, desc: 'Pricing plans', defaultPlacement: 'auto' },
      { type: 'faq', label: 'FAQ', icon: HelpCircle, desc: 'Q&A accordion', defaultPlacement: 'auto' },
      { type: 'contact', label: 'Contact', icon: Phone, desc: 'Contact info', defaultPlacement: 'auto' },
      { type: 'form', label: 'Form', icon: Mail, desc: 'Contact form', defaultPlacement: 'auto' },
    ],
  },
  {
    label: 'Utility',
    items: [
      { type: 'divider', label: 'Divider', icon: Minus, desc: 'Horizontal rule', defaultPlacement: 'auto' },
      { type: 'spacer', label: 'Spacer', icon: ArrowUpDown, desc: 'Blank space', defaultPlacement: 'auto' },
      { type: 'html', label: 'HTML Embed', icon: Code2, desc: 'Custom HTML', defaultPlacement: 'auto' },
    ],
  },
]

export default function ElementsPanel() {
  const { addSection, addFloatingSection, inheritedSections, sections } = useBuilderStore()
  const hasInheritedNav = inheritedSections.length > 0
  const floatingCount = sections.filter(isFloatingSection).length

  const handleDragStart = (event: React.DragEvent<HTMLButtonElement>, item: LibraryItem) => {
    const payload = JSON.stringify({
      type: item.type,
      defaultPlacement: item.defaultPlacement || 'auto',
      content: item.content,
      settings: item.settings,
    })

    event.dataTransfer.setData('application/jaycms-builder-item', payload)
    event.dataTransfer.setData('application/jaycms-section-type', item.type)
    event.dataTransfer.effectAllowed = 'copyMove'
  }

  const addItem = (item: LibraryItem) => {
    if (item.defaultPlacement === 'free') {
      const offset = (floatingCount % 6) * 28
      addFloatingSection(item.type, 56 + offset, 56 + offset, {
        content: item.content,
        settings: item.settings,
      })
      return
    }

    addSection(item.type)
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#6b7280' }}>Add Section</p>

      <div className="mb-4 px-3 py-2.5 rounded-lg text-xs"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
        Drag to blank canvas space for free placement. The new block items always stay floating, can be repositioned, and can be resized with the mouse after you drop them.
      </div>

      {/* Show note when navbar is inherited from homepage */}
      {hasInheritedNav && (
        <div className="mb-4 px-3 py-2.5 rounded-lg text-xs"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
          🔒 Navbar is shared from the Homepage — go to Homepage to edit it.
        </div>
      )}

      {categories.map(cat => (
        <div key={cat.label} className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>{cat.label}</p>
          <div className="flex flex-col gap-1">
            {cat.items
              .filter(item => !(hasInheritedNav && item.type === 'navbar'))
              .map(item => {
              const Icon = item.icon
              return (
                <button
                  key={`${item.type}-${item.label}`}
                  draggable
                  onDragStart={(event) => handleDragStart(event, item)}
                  onClick={() => addItem(item)}
                  className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5 group cursor-grab active:cursor-grabbing">
                  <div className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.12)' }}>
                    <Icon size={15} style={{ color: '#818cf8' }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>{item.label}</p>
                    <p className="text-xs" style={{ color: '#64748b' }}>{item.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
