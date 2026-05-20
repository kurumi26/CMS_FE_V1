import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBuilderStore } from '../../store/builderStore'
import { GripVertical, Copy, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Settings } from 'lucide-react'
import type { Section } from '../../types'
import { clsx } from 'clsx'
import AnimatedSectionRenderer from './AnimatedSectionRenderer'

interface Props {
  section: Section
  externalDropActive?: boolean
  onExternalDragOver?: (event: React.DragEvent<HTMLDivElement>, sectionId: string) => void
  onExternalDrop?: (event: React.DragEvent<HTMLDivElement>, sectionId: string) => void
}

export default function SectionBlock({ section, externalDropActive = false, onExternalDragOver, onExternalDrop }: Props) {
  const { selectedId, selectSection, duplicateSection, removeSection, updateSectionSettings, sections, reorderSections } = useBuilderStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const isSelected = selectedId === section.id
  const isHidden = section.settings?.hidden

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  }

  const toggleHide = (e: React.MouseEvent) => {
    e.stopPropagation()
    updateSectionSettings(section.id, { hidden: !isHidden })
  }

  const moveUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    const idx = sections.findIndex(s => s.id === section.id)
    if (idx > 0) {
      const arr = [...sections]
      ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
      reorderSections(arr)
    }
  }

  const moveDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    const idx = sections.findIndex(s => s.id === section.id)
    if (idx < sections.length - 1) {
      const arr = [...sections]
      ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
      reorderSections(arr)
    }
  }

  return (
    <div ref={setNodeRef} style={style} className={clsx('section-block group relative', { 'opacity-40': isHidden })}
      onDragOver={event => onExternalDragOver?.(event, section.id)}
      onDrop={event => onExternalDrop?.(event, section.id)}
      onClick={() => selectSection(section.id)}>

      {/* Selection outline */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ outline: '2px solid #6366f1', outlineOffset: '-1px' }} />
      )}

      {externalDropActive && (
        <div className="absolute inset-x-6 -bottom-3 z-30 pointer-events-none flex justify-center">
          <div className="px-3 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: 'rgba(99,102,241,0.95)', color: '#fff', boxShadow: '0 10px 30px rgba(79,70,229,0.25)' }}>
            Drop here to insert after this section
          </div>
        </div>
      )}

      {/* Section actions bar */}
      <div className={clsx(
        'section-actions absolute top-2 right-2 z-20 flex items-center gap-1 rounded-lg px-1 py-1',
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      )} style={{ background: 'rgba(15,15,20,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Drag handle */}
        <div {...attributes} {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 rounded">
          <GripVertical size={14} />
        </div>

        <div className="w-px h-4 bg-white/10" />

        <button onClick={moveUp} className="p-1 text-slate-500 hover:text-slate-300 rounded" title="Move up"><ChevronUp size={14} /></button>
        <button onClick={moveDown} className="p-1 text-slate-500 hover:text-slate-300 rounded" title="Move down"><ChevronDown size={14} /></button>
        <button onClick={e => { e.stopPropagation(); selectSection(section.id) }}
          className="p-1 text-slate-500 hover:text-indigo-400 rounded" title="Design">
          <Settings size={14} />
        </button>
        <button onClick={toggleHide} className="p-1 text-slate-500 hover:text-slate-300 rounded" title={isHidden ? 'Show' : 'Hide'}>
          {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button onClick={e => { e.stopPropagation(); duplicateSection(section.id) }}
          className="p-1 text-slate-500 hover:text-blue-400 rounded" title="Duplicate">
          <Copy size={14} />
        </button>
        <button onClick={e => { e.stopPropagation(); removeSection(section.id) }}
          className="p-1 text-slate-500 hover:text-red-400 rounded" title="Delete">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Section type badge */}
      <div className={clsx('absolute top-2 left-2 z-20 text-[10px] font-semibold px-2 py-0.5 rounded',
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      )} style={{ background: '#6366f1', color: 'white', transition: 'opacity 0.15s' }}>
        {section.type}
      </div>

      {/* Add section after button */}
      <AddSectionButton sectionId={section.id} />

      <AnimatedSectionRenderer section={section} />
    </div>
  )
}

function AddSectionButton({ sectionId }: { sectionId: string }) {
  const { addSection } = useBuilderStore()

  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={e => { e.stopPropagation(); addSection('text', sectionId) }}
        className="flex items-center justify-center w-6 h-6 rounded-full text-white shadow-lg transition-all hover:scale-110"
        style={{ background: '#6366f1' }}>
        <span className="text-sm font-bold leading-none">+</span>
      </button>
    </div>
  )
}
