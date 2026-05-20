import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Section, SectionSettings, SectionType } from '../types'
import { v4 as uuid } from 'uuid'
import { getDefaultFloatingSettings } from '../utils/sectionPositioning'

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

interface BuilderState {
  sections: Section[]
  inheritedSections: Section[]   // navbar sections from homepage (shown read-only on sub-pages)
  selectedId: string | null
  deviceMode: DeviceMode
  isDirty: boolean
  showGrid: boolean
  zoom: number
  history: Section[][]
  historyIndex: number

  setSections: (sections: Section[]) => void
  replaceSections: (sections: Section[]) => void
  setInheritedSections: (sections: Section[]) => void
  addSection: (type: string, afterId?: string, overrides?: SectionOverrides) => void
  addFloatingSection: (type: SectionType, x: number, y: number, overrides?: SectionOverrides) => void
  duplicateSection: (id: string) => void
  removeSection: (id: string) => void
  reorderSections: (sections: Section[]) => void
  updateSectionContent: (id: string, content: Record<string, any>) => void
  updateSectionSettings: (id: string, settings: Partial<SectionSettings>) => void
  selectSection: (id: string | null) => void
  setDeviceMode: (mode: DeviceMode) => void
  setShowGrid: (v: boolean) => void
  setZoom: (z: number) => void
  markClean: () => void
  undo: () => void
  redo: () => void
}

interface SectionOverrides {
  content?: Record<string, any>
  settings?: Partial<SectionSettings>
}

const defaultContent: Record<string, any> = {
  hero:         { heading: 'Your Amazing Headline', subheading: 'A compelling subheadline that drives action.', cta_text: 'Get Started', cta_url: '#', cta_secondary_text: 'Learn More' },
  features:     { heading: 'Our Features', subheading: 'Everything you need to succeed', features: [{ icon: 'Zap', title: 'Feature One', desc: 'A short description.' }, { icon: 'Shield', title: 'Feature Two', desc: 'A short description.' }, { icon: 'Star', title: 'Feature Three', desc: 'A short description.' }] },
  about:        { heading: 'About Us', text: 'Tell your story here. Who are you, what do you do, and why does it matter?', image: '', stats: [{ value: '10K+', label: 'Customers' }, { value: '99%', label: 'Satisfaction' }] },
  testimonials: { heading: 'What Our Customers Say', testimonials: [{ name: 'Jane Doe', role: 'CEO', text: 'This product changed our business completely!', avatar: '' }, { name: 'John Smith', role: 'Designer', text: 'The best tool I\'ve ever used.', avatar: '' }] },
  contact:      { heading: 'Get In Touch', subheading: 'We\'d love to hear from you.', email: 'hello@company.com', phone: '+1 (555) 000-0000', address: '123 Main St, City, Country' },
  gallery:      { heading: 'Our Gallery', images: [] },
  pricing:      { heading: 'Simple Pricing', subheading: 'Choose the plan that works for you', plans: [{ name: 'Free', price: '$0', period: '/mo', features: ['5 Projects', 'Basic Support', '1GB Storage'], highlighted: false }, { name: 'Pro', price: '$29', period: '/mo', features: ['Unlimited Projects', 'Priority Support', '50GB Storage', 'AI Features'], highlighted: true }, { name: 'Enterprise', price: '$99', period: '/mo', features: ['Everything in Pro', 'Custom Domain', 'Dedicated Support', 'SSO'], highlighted: false }] },
  cta:          { heading: 'Ready to Get Started?', subheading: 'Join thousands of satisfied customers today.', cta_text: 'Start for Free', cta_url: '#', cta_secondary: 'Learn More' },
  text:         { content: '<p>Add your text content here. Click to edit.</p>' },
  stats:        { heading: 'Numbers That Speak', stats: [{ value: '10,000+', label: 'Happy Customers' }, { value: '99.9%', label: 'Uptime' }, { value: '50+', label: 'Countries' }, { value: '24/7', label: 'Support' }] },
  faq:          { heading: 'Frequently Asked Questions', items: [{ q: 'What is this platform?', a: 'It\'s the most powerful visual website builder powered by AI.' }, { q: 'Do I need coding skills?', a: 'No! Everything is visual and beginner-friendly.' }, { q: 'Can I use my own domain?', a: 'Yes, you can connect any custom domain.' }] },
  team:         { heading: 'Meet Our Team', members: [{ name: 'Alex Johnson', role: 'CEO & Co-founder', bio: 'Visionary leader with 15 years of experience.', avatar: '' }, { name: 'Maria Garcia', role: 'Head of Design', bio: 'Award-winning designer passionate about UX.', avatar: '' }] },
  navbar:       { logo: '', links: [{ label: 'Home', url: '#' }, { label: 'About', url: '#about' }, { label: 'Services', url: '#services' }, { label: 'Contact', url: '#contact' }], cta_text: 'Get Started', cta_url: '#' },
  footer:       { logo: 'My Brand', tagline: 'Building the future together.', columns: [{ title: 'Company', links: [{ label: 'About', url: '#' }, { label: 'Careers', url: '#' }] }, { title: 'Product', links: [{ label: 'Features', url: '#' }, { label: 'Pricing', url: '#' }] }], copyright: '© 2026 My Brand. All rights reserved.' },
  divider:      { style: 'line', color: '#e5e7eb' },
  spacer:       { height: '80' },
  form:         { heading: 'Contact Us', fields: [{ type: 'text', label: 'Name', placeholder: 'Your name', required: true }, { type: 'email', label: 'Email', placeholder: 'your@email.com', required: true }, { type: 'textarea', label: 'Message', placeholder: 'Your message...', required: false }], submit_text: 'Send Message' },
  html:         { code: '<div style="padding: 40px; text-align: center;"><h2>Custom HTML Block</h2><p>Add your custom HTML here.</p></div>' },
  image:        { url: '', alt: '', caption: '' },
  video:        { url: '', type: 'youtube', heading: 'Watch Our Story', autoplay: false },
  blog:         { heading: 'Latest Articles', posts: [{ title: 'Post Title One', excerpt: 'A short excerpt from the blog post...', date: '2026-01-01', image: '' }, { title: 'Post Title Two', excerpt: 'Another interesting excerpt here.', date: '2026-01-05', image: '' }] },
}

const defaultSettings: Partial<SectionSettings> = {
  background:    '#ffffff',
  textColor:     '#1a1a1a',
  primaryColor:  '#6366f1',
  paddingTop:    '80',
  paddingBottom: '80',
}

function pushHistory(state: BuilderState) {
  const history = [...state.history.slice(0, state.historyIndex + 1), [...state.sections]]
  return { history, historyIndex: history.length - 1 }
}

function normalizeSections(sections: Section[]) {
  return sections.map((section, index) => ({ ...section, order: index }))
}

function createSection(type: SectionType, overrides: SectionOverrides = {}): Section {
  return {
    id: uuid(),
    type,
    order: 0,
    content: { ...(defaultContent[type] || {}), ...(overrides.content || {}) },
    settings: { ...defaultSettings, ...(overrides.settings || {}) },
  }
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      sections: [],
      inheritedSections: [],
      selectedId: null,
      deviceMode: 'desktop',
      isDirty: false,
      showGrid: false,
      zoom: 100,
      history: [[]],
      historyIndex: 0,

      setSections: (sections) => {
        const normalized = normalizeSections(sections)
        set({ sections: normalized, isDirty: false, selectedId: null, history: [normalized], historyIndex: 0 })
      },

      replaceSections: (sections) => {
        const normalized = normalizeSections(sections)
        set((state) => ({
          sections: normalized,
          isDirty: true,
          selectedId: normalized.some(section => section.id === state.selectedId)
            ? state.selectedId
            : (normalized[0]?.id ?? null),
          history: [...state.history.slice(0, state.historyIndex + 1), normalized],
          historyIndex: state.historyIndex + 1,
        }))
      },

      setInheritedSections: (sections) => set({ inheritedSections: sections }),

      addSection: (type, afterId, overrides) => {
        const newSection = createSection(type as SectionType, overrides)
        set((state) => {
          let updated = [...state.sections]
          if (afterId) {
            const idx = updated.findIndex(s => s.id === afterId)
            updated.splice(idx + 1, 0, newSection)
          } else {
            updated.push(newSection)
          }
          updated = normalizeSections(updated)
          const h = pushHistory(state as BuilderState)
          return { sections: updated, isDirty: true, selectedId: newSection.id, ...h }
        })
      },

      addFloatingSection: (type, x, y, overrides) => {
        const newSection = createSection(type, {
          ...overrides,
          settings: { ...getDefaultFloatingSettings(type, x, y), ...(overrides?.settings || {}) },
        })

        set((state) => {
          const updated = normalizeSections([...state.sections, newSection])
          const h = pushHistory(state as BuilderState)
          return { sections: updated, isDirty: true, selectedId: newSection.id, ...h }
        })
      },

      duplicateSection: (id) => {
        set((state) => {
          const idx = state.sections.findIndex(s => s.id === id)
          if (idx === -1) return {}
          const copy = { ...state.sections[idx], id: uuid() }
          const updated = [...state.sections]
          updated.splice(idx + 1, 0, copy)
          const h = pushHistory(state as BuilderState)
          return { sections: normalizeSections(updated), isDirty: true, ...h }
        })
      },

      removeSection: (id) => {
        set((state) => {
          const updated = normalizeSections(state.sections.filter(s => s.id !== id))
          const h = pushHistory(state as BuilderState)
          return { sections: updated, isDirty: true, selectedId: null, ...h }
        })
      },

      reorderSections: (sections) => {
        const h = pushHistory(get() as BuilderState)
        set({ sections: normalizeSections(sections), isDirty: true, ...h })
      },

      updateSectionContent: (id, content) => {
        set((state) => ({
          sections: state.sections.map(s => s.id === id ? { ...s, content: { ...s.content, ...content } } : s),
          isDirty: true,
        }))
      },

      updateSectionSettings: (id, settings) => {
        set((state) => ({
          sections: state.sections.map(s => s.id === id ? { ...s, settings: { ...s.settings, ...settings } } : s),
          isDirty: true,
        }))
      },

      selectSection: (id) => set({ selectedId: id }),
      setDeviceMode: (deviceMode) => set({ deviceMode }),
      setShowGrid: (showGrid) => set({ showGrid }),
      setZoom: (zoom) => set({ zoom }),
      markClean: () => set({ isDirty: false }),

      undo: () => {
        const { historyIndex, history } = get()
        if (historyIndex <= 0) return
        const newIndex = historyIndex - 1
        set({ sections: history[newIndex], historyIndex: newIndex, isDirty: true })
      },

      redo: () => {
        const { historyIndex, history } = get()
        if (historyIndex >= history.length - 1) return
        const newIndex = historyIndex + 1
        set({ sections: history[newIndex], historyIndex: newIndex, isDirty: true })
      },
    }),
    { name: 'jay_builder', partialize: () => ({}) }
  )
)
