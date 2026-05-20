import { useState } from 'react'
import { useBuilderStore } from '../../store/builderStore'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import SectionBlock from './SectionBlock'
import FloatingSectionBlock from './FloatingSectionBlock'
import SectionRenderer from './SectionRenderer'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getDefaultFloatingWidth, getFloatingCanvasMinHeight, isFloatingSection } from '../../utils/sectionPositioning'
import type { SectionSettings, SectionType } from '../../types'

type DraggedBuilderItem = {
  type: SectionType
  defaultPlacement?: 'auto' | 'free'
  content?: Record<string, any>
  settings?: Partial<SectionSettings>
}

export default function BuilderCanvas() {
  const { sections, inheritedSections, reorderSections, addSection, addFloatingSection, zoom, selectSection } = useBuilderStore()
  const [dropAfterId, setDropAfterId] = useState<string | null>(null)
  const [canvasDropActive, setCanvasDropActive] = useState(false)

  const flowSections = sections.filter(section => !isFloatingSection(section))
  const floatingSections = sections.filter(isFloatingSection)
  const floatingCanvasMinHeight = getFloatingCanvasMinHeight(floatingSections)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  const getDraggedItem = (event: React.DragEvent): DraggedBuilderItem | null => {
    const rawItem = event.dataTransfer.getData('application/jaycms-builder-item')
    if (rawItem) {
      try {
        return JSON.parse(rawItem) as DraggedBuilderItem
      } catch {
        return null
      }
    }

    const legacyType = event.dataTransfer.getData('application/jaycms-section-type')
    return legacyType ? { type: legacyType as SectionType, defaultPlacement: 'auto' } : null
  }

  const handleExternalDragOver = (event: React.DragEvent, afterId?: string) => {
    const draggedItem = getDraggedItem(event)
    if (!draggedItem) return
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'copy'
    setCanvasDropActive(true)
    setDropAfterId(afterId ?? null)
  }

  const clearExternalDropState = () => {
    setCanvasDropActive(false)
    setDropAfterId(null)
  }

  const handleExternalDrop = (event: React.DragEvent, afterId?: string) => {
    const draggedItem = getDraggedItem(event)
    if (!draggedItem) return

    event.preventDefault()
    event.stopPropagation()

    if (afterId && draggedItem.defaultPlacement !== 'free') {
      addSection(draggedItem.type, afterId, {
        content: draggedItem.content,
        settings: draggedItem.settings,
      })
    } else {
      const canvasRect = document.getElementById('builder-canvas')?.getBoundingClientRect()
      const rect = canvasRect || event.currentTarget.getBoundingClientRect()
      const scale = zoom / 100
      const frameWidth = Number(draggedItem.settings?.frameWidth ?? getDefaultFloatingWidth(draggedItem.type))
      const x = ((event.clientX - rect.left) / scale) - (frameWidth / 2)
      const y = ((event.clientY - rect.top) / scale) - 36

      addFloatingSection(draggedItem.type, x, y, {
        content: draggedItem.content,
        settings: draggedItem.settings,
      })
    }

    clearExternalDropState()
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = flowSections.findIndex(s => s.id === active.id)
    const newIdx = flowSections.findIndex(s => s.id === over.id)
    if (oldIdx === -1 || newIdx === -1) return

    const reorderedFlow = arrayMove(flowSections, oldIdx, newIdx)
    const nextSections = [...reorderedFlow, ...floatingSections]
    reorderSections(nextSections)
  }

  return (
    <div className="min-h-screen bg-white relative" id="builder-canvas"
      style={floatingCanvasMinHeight > 0 ? { minHeight: Math.max(floatingCanvasMinHeight, 900) } : undefined}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) selectSection(null)
      }}
      onDragOver={event => handleExternalDragOver(event)}
      onDrop={event => handleExternalDrop(event)}
      onDragLeave={(event) => {
        const nextTarget = event.relatedTarget as Node | null
        if (nextTarget && event.currentTarget.contains(nextTarget)) return
        if (canvasDropActive) clearExternalDropState()
      }}>

      {canvasDropActive && sections.length === 0 && (
        <div className="absolute inset-8 z-20 rounded-3xl border-2 border-dashed flex items-center justify-center pointer-events-none"
          style={{ borderColor: 'rgba(99,102,241,0.45)', background: 'rgba(99,102,241,0.04)', color: '#6366f1' }}>
          <div className="text-center px-6">
            <p className="text-sm font-semibold">Drop the element here to add it to the page</p>
            <p className="text-xs mt-2" style={{ color: '#818cf8' }}>Drop on blank space for free placement, or drop over a section to insert it into the stacked flow.</p>
          </div>
        </div>
      )}

      {/* Inherited navbar from homepage (read-only) */}
      {inheritedSections.length > 0 && (
        <div className="relative" style={{ outline: '2px dashed rgba(99,102,241,0.4)' }}>
          {inheritedSections.map(section => (
            <SectionRenderer key={`inherited-${section.id}`} section={section} />
          ))}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold pointer-events-none"
            style={{ background: 'rgba(99,102,241,0.9)', color: '#fff', backdropFilter: 'blur(4px)' }}>
            🔒 Shared Navbar — edit on Homepage
          </div>
          {/* Click blocker overlay */}
          <div className="absolute inset-0 z-[5] cursor-not-allowed" title="This navbar is inherited from the Homepage. Edit it there." />
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={flowSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {flowSections.map(section => (
              <SectionBlock
                key={section.id}
                section={section}
                externalDropActive={canvasDropActive && dropAfterId === section.id}
                onExternalDragOver={handleExternalDragOver}
                onExternalDrop={handleExternalDrop}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      {floatingSections.length > 0 && (
        <div className="absolute inset-0 z-[15] pointer-events-none">
          {floatingSections.map(section => (
            <FloatingSectionBlock key={section.id} section={section} />
          ))}
        </div>
      )}

      {/* Add Section Button */}
      <div className="flex justify-center py-8">
        <button
          onClick={() => addSection('hero')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px dashed rgba(99,102,241,0.3)' }}>
          <Plus size={16} /> Add Section
        </button>
      </div>
    </div>
  )
}
