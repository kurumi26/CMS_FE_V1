import { useState } from 'react'
import { Sparkles, Loader2, Wand2 } from 'lucide-react'
import api from '../../services/api'
import { useBuilderStore } from '../../store/builderStore'
import toast from 'react-hot-toast'
import type { Section } from '../../types'

const TYPES = ['section', 'content', 'seo', 'website'] as const

function normalizeSections(payload: any): any[] {
  const raw = payload?.sections
    || payload?.result?.sections
    || (payload?.type === 'section' && payload?.result && !Array.isArray(payload.result) ? [payload.result] : [])

  if (!Array.isArray(raw)) return []

  return raw
    .filter((section) => section && typeof section === 'object')
    .map((section, index) => ({
      id: typeof section.id === 'string' ? section.id : crypto.randomUUID(),
      type: typeof section.type === 'string' ? section.type : 'text',
      order: typeof section.order === 'number' ? section.order : index,
      content: section.content && typeof section.content === 'object' ? section.content : {},
      settings: section.settings && typeof section.settings === 'object' ? section.settings : {},
    }))
}

function normalizeSeo(payload: any) {
  return {
    title: payload?.title || payload?.meta_title || payload?.result?.title || payload?.result?.meta_title || '',
    description: payload?.description || payload?.meta_description || payload?.result?.description || payload?.result?.meta_description || '',
    keywords: Array.isArray(payload?.keywords || payload?.result?.keywords)
      ? (payload?.keywords || payload?.result?.keywords).join(', ')
      : (payload?.keywords || payload?.result?.keywords || ''),
  }
}

function normalizeGeneratedContent(payload: any) {
  const generatedSection = normalizeSections({ sections: payload?.section ? [payload.section] : [] })[0] || null
  const rawContent = payload?.content?.content && typeof payload.content.content === 'object'
    ? payload.content.content
    : payload?.content && typeof payload.content === 'object' && !Array.isArray(payload.content)
      ? payload.content
      : payload?.result?.content && typeof payload.result.content === 'object'
        ? payload.result.content
        : payload?.result && typeof payload.result === 'object' && !Array.isArray(payload.result)
          ? payload.result
          : generatedSection?.content || null

  return {
    content: rawContent && typeof rawContent === 'object' && !Array.isArray(rawContent) ? rawContent : null,
    generatedSection,
    suggestedSectionType: payload?.suggested_section_type || generatedSection?.type || null,
  }
}

function labelizeSectionType(type?: string | null) {
  return (type || 'content')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function toPlainText(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function canApplyToSection(selectedSection: Section | null, suggestedSectionType: string | null, content: Record<string, any> | null) {
  if (!selectedSection || !content) return false
  if (suggestedSectionType && selectedSection.type === suggestedSectionType) return true

  const existingKeys = Object.keys(selectedSection.content || {})
  const incomingKeys = Object.keys(content)

  return incomingKeys.some((key) => existingKeys.includes(key))
}

function summarizeGeneratedContent(sectionType: string | null, content: Record<string, any> | null, action: 'applied' | 'created' | 'drafted') {
  const sectionLabel = labelizeSectionType(sectionType)
  const prefix = action === 'created'
    ? `Created a ${sectionLabel} section and applied the draft.`
    : action === 'applied'
      ? `Applied the draft to the ${sectionLabel} section.`
      : `Drafted ${sectionLabel} content.`

  if (!content) return prefix

  const listSummary = [
    Array.isArray(content.links) ? `${content.links.length} navigation links ready.` : null,
    Array.isArray(content.features) ? `${content.features.length} feature cards ready.` : null,
    Array.isArray(content.items) ? `${content.items.length} FAQ items ready.` : null,
    Array.isArray(content.plans) ? `${content.plans.length} pricing plans ready.` : null,
    Array.isArray(content.members) ? `${content.members.length} team members ready.` : null,
    Array.isArray(content.stats) ? `${content.stats.length} stats ready.` : null,
    Array.isArray(content.posts) ? `${content.posts.length} blog posts ready.` : null,
    Array.isArray(content.images) ? `${content.images.length} gallery images prepared.` : null,
  ].filter(Boolean)

  const textSummary = [
    content.heading,
    content.title,
    content.logo,
    content.tagline,
    content.subheading,
    content.text,
    content.caption,
    content.content,
  ]
    .map(toPlainText)
    .filter(Boolean)

  return [prefix, ...textSummary.slice(0, 2), ...listSummary.slice(0, 2)].join('\n\n')
}

function buildAiPrompt(type: string, prompt: string, selectedSection: Section | null, sections: Section[]) {
  if (type === 'content' && selectedSection) {
    const currentKeys = Object.keys(selectedSection.content || {})

    return [
      `User request: ${prompt}`,
      `Selected section type: ${selectedSection.type}`,
      currentKeys.length > 0 ? `Selected section fields: ${currentKeys.join(', ')}` : null,
      'Instruction: update this selected section unless the request explicitly asks for a different section type.',
      `Current selected section content: ${JSON.stringify(selectedSection.content)}`,
      `Existing page sections: ${sections.map(section => section.type).join(', ') || 'none'}`,
    ].filter(Boolean).join('\n\n')
  }

  return [
    `User request: ${prompt}`,
    `Current page sections: ${sections.map(section => section.type).join(', ') || 'none'}`,
  ].join('\n\n')
}

export default function AiPanel() {
  const [prompt, setPrompt] = useState('')
  const [type, setType] = useState<string>('section')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const { sections, selectedId, replaceSections, updateSectionContent, selectSection } = useBuilderStore()

  const selectedSection = sections.find(section => section.id === selectedId) || null

  const generate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const requestPrompt = buildAiPrompt(type, prompt, selectedSection, sections)

      const { data } = await api.post('/ai/generate', {
        type,
        prompt: requestPrompt,
        context: {
          selected_section: selectedSection ? { type: selectedSection.type, content: selectedSection.content } : null,
          selected_fields: selectedSection ? Object.keys(selectedSection.content || {}) : [],
          section_types: sections.map(section => section.type),
          section_count: sections.length,
          original_request: prompt,
        },
      })

      const generatedSections = normalizeSections(data)

      if (type === 'section' && generatedSections.length > 0) {
        const nextSections = [
          ...sections,
          ...generatedSections.map((section, index) => ({ ...section, order: sections.length + index })),
        ]
        replaceSections(nextSections)
        selectSection(generatedSections[0]?.id || null)
        setResult(`Added ${generatedSections.length} section${generatedSections.length === 1 ? '' : 's'} to the page.`)
        toast.success(data.mock ? 'Section drafted locally.' : 'Section added to canvas!')
      } else if (type === 'website' && generatedSections.length > 0) {
        replaceSections(generatedSections.map((section, index) => ({ ...section, order: index })))
        selectSection(generatedSections[0]?.id || null)
        setResult(`Built a ${generatedSections.length}-section page draft and applied it to the canvas.`)
        toast.success(data.mock ? 'Website generated locally.' : 'Website generated!')
      } else if (type === 'content') {
        const { content: generatedContent, generatedSection, suggestedSectionType } = normalizeGeneratedContent(data)

        if (generatedContent && canApplyToSection(selectedSection, suggestedSectionType, generatedContent) && selectedId) {
          updateSectionContent(selectedId, generatedContent)
          setResult(summarizeGeneratedContent(selectedSection?.type || suggestedSectionType, generatedContent, 'applied'))
          toast.success(data.mock ? 'Content drafted and applied locally.' : 'Content applied to selected section!')
        } else if (generatedSection) {
          const insertionIndex = selectedSection
            ? Math.max(sections.findIndex(section => section.id === selectedSection.id), 0) + 1
            : sections.length
          const nextSections = [...sections]

          nextSections.splice(insertionIndex, 0, generatedSection)
          replaceSections(nextSections)
          selectSection(generatedSection.id)
          setResult(summarizeGeneratedContent(generatedSection.type, generatedSection.content, 'created'))
          toast.success(data.mock ? 'Content drafted and added to the page locally.' : 'Generated content added to the page!')
        } else {
          setResult(summarizeGeneratedContent(suggestedSectionType, generatedContent, 'drafted'))
          toast.success(data.mock ? 'Content drafted locally.' : 'Content generated!')
        }
      } else if (type === 'seo') {
        const seo = normalizeSeo(data)
        setResult([
          seo.title ? `Title: ${seo.title}` : null,
          seo.description ? `Description: ${seo.description}` : null,
          seo.keywords ? `Keywords: ${seo.keywords}` : null,
        ].filter(Boolean).join('\n\n'))
        toast.success(data.mock ? 'SEO drafted locally.' : 'SEO generated!')
      } else {
        setResult('The draft is ready.')
      }
    } catch {
      toast.error('AI generation failed')
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'Create a hero section for a SaaS product',
    'Write compelling features for a project management app',
    'Generate FAQ for an e-commerce store',
    'Create pricing section with 3 tiers',
  ]

  return (
    <div className="p-4 h-full overflow-y-auto flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} style={{ color: '#818cf8' }} />
        <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>AI Generator</p>
      </div>

      {/* Type */}
      <div>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94a3b8' }}>Generate</label>
        <div className="flex flex-wrap gap-1.5">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className="px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors"
              style={{ background: type === t ? '#6366f1' : 'rgba(255,255,255,0.06)', color: type === t ? '#fff' : '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt */}
      <div>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: '#94a3b8' }}>Describe what you need</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={4}
          placeholder="e.g. A hero section for a fitness app with bold typography..."
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate() }}
          className="w-full text-sm px-3 py-2.5 rounded-lg resize-none outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}
        />
        {type === 'content' && !selectedId && (
          <p className="text-xs mt-2" style={{ color: '#64748b' }}>
            Select a section first if you want the generated content applied automatically.
          </p>
        )}
        {type === 'content' && selectedSection && (
          <p className="text-xs mt-2" style={{ color: '#818cf8' }}>
            AI is targeting the selected {selectedSection.type} section and will keep that section type unless you clearly ask for a different one.
          </p>
        )}
      </div>

      <button onClick={generate} disabled={loading || !prompt.trim()}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
        style={{ background: loading || !prompt.trim() ? 'rgba(99,102,241,0.4)' : '#6366f1', color: '#fff', cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer' }}>
        {loading ? <><Loader2 size={14} className="animate-spin" /> Generating...</> : <><Wand2 size={14} /> Generate</>}
      </button>

      {/* Result */}
      {result && (
        <div className="rounded-lg p-3 text-xs leading-6" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#c7d2fe', whiteSpace: 'pre-wrap' }}>
          {result}
        </div>
      )}

      {/* Suggestions */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: '#64748b' }}>Quick prompts</p>
        <div className="flex flex-col gap-1.5">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setPrompt(s)}
              className="text-left text-xs px-3 py-2 rounded-lg transition-colors"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#94a3b8' }}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
