import { useEffect, useRef } from 'react'
import { motion, useDragControls, type PanInfo } from 'framer-motion'
import { clsx } from 'clsx'
import { GripVertical, Copy, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Section } from '../../types'
import { useBuilderStore } from '../../store/builderStore'
import AnimatedSectionRenderer from './AnimatedSectionRenderer'
import { getFloatingStyle, getFloatingWidth, getFloatingHeight } from '../../utils/sectionPositioning'

interface Props {
  section: Section
}

export default function FloatingSectionBlock({ section }: Props) {
  const {
    selectedId,
    selectSection,
    duplicateSection,
    removeSection,
    updateSectionSettings,
    zoom,
  } = useBuilderStore()

  const isSelected = selectedId === section.id
  const isHidden = section.settings?.hidden
  const dragControls = useDragControls()
  const frameRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const lastMeasuredHeight = useRef<number>(Number(section.settings?.frameHeight ?? 0))
  const resizeSession = useRef<null | {
    direction: 'right' | 'left' | 'corner' | 'bottom' | 'bottom-left' | 'bottom-right'
    startPointerX: number
    startPointerY: number
    startWidth: number
    startHeight: number
    startPositionX: number
  }>(null)

  useEffect(() => {
    if (!contentRef.current || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return

      const nextHeight = Math.max(120, Math.round(entry.contentRect.height))
      if (Math.abs(nextHeight - lastMeasuredHeight.current) < 6) return

      lastMeasuredHeight.current = nextHeight
      updateSectionSettings(section.id, { frameHeight: nextHeight })
    })

    observer.observe(contentRef.current)

    return () => observer.disconnect()
  }, [section.id, updateSectionSettings])

  const startResize = (direction: 'right' | 'left' | 'corner' | 'bottom' | 'bottom-left' | 'bottom-right', event: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    selectSection(section.id)

    const currentHeight = frameRef.current?.offsetHeight || getFloatingHeight(section)

    resizeSession.current = {
      direction,
      startPointerX: event.clientX,
      startPointerY: event.clientY,
      startWidth: getFloatingWidth(section),
      startHeight: currentHeight,
      startPositionX: Number(section.settings?.positionX ?? 32),
    }

    const handlePointerMove = (moveEvent: MouseEvent) => {
      const session = resizeSession.current
      if (!session) return

      const scale = Math.max(0.5, zoom / 100)
      const deltaX = (moveEvent.clientX - session.startPointerX) / scale
      const deltaY = (moveEvent.clientY - session.startPointerY) / scale
      const canvasWidth = document.getElementById('builder-canvas')?.clientWidth
        || frameRef.current?.closest('#builder-canvas')?.clientWidth
        || 1440

      if (session.direction === 'left' || session.direction === 'bottom-left') {
        const rightEdge = session.startPositionX + session.startWidth
        const maxWidth = Math.max(260, rightEdge)
        const nextWidth = Math.min(Math.max(Math.round(session.startWidth - deltaX), 260), maxWidth)
        const nextX = Math.max(0, Math.round(rightEdge - nextWidth))
        const updates: Record<string, any> = { frameWidth: nextWidth, positionX: nextX }
        if (session.direction === 'bottom-left') {
          updates.frameHeight = Math.max(80, Math.round(session.startHeight + deltaY))
          updates.frameHeightFixed = true
        }
        updateSectionSettings(section.id, updates)
        return
      }

      if (session.direction === 'bottom') {
        updateSectionSettings(section.id, {
          frameHeight: Math.max(80, Math.round(session.startHeight + deltaY)),
          frameHeightFixed: true,
        })
        return
      }

      // right, corner, bottom-right
      const maxWidth = Math.max(260, canvasWidth - session.startPositionX - 16)
      const nextWidth = Math.min(Math.max(Math.round(session.startWidth + deltaX), 260), maxWidth)
      const updates: Record<string, any> = { frameWidth: nextWidth }
      if (session.direction === 'corner' || session.direction === 'bottom-right') {
        updates.frameHeight = Math.max(80, Math.round(session.startHeight + deltaY))
        updates.frameHeightFixed = true
      }
      updateSectionSettings(section.id, updates)
    }

    const stopResize = () => {
      resizeSession.current = null
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', stopResize)
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', stopResize)
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const currentX = Number(section.settings?.positionX ?? 32)
    const currentY = Number(section.settings?.positionY ?? 32)

    updateSectionSettings(section.id, {
      positionX: Math.max(0, Math.round(currentX + info.offset.x)),
      positionY: Math.max(0, Math.round(currentY + info.offset.y)),
    })
  }

  const fixedHeight = section.settings?.frameHeightFixed
    ? Number(section.settings?.frameHeight ?? 320)
    : undefined

  return (
    <motion.div
      drag
      dragListener={false}
      dragMomentum={false}
      dragControls={dragControls}
      onDragStart={() => selectSection(section.id)}
      onDragEnd={handleDragEnd}
      onClick={() => selectSection(section.id)}
      className={clsx('group absolute pointer-events-auto', { 'opacity-40': isHidden })}
      style={getFloatingStyle(section)}
    >
      {/* GrapesJS-style full-width drag handle bar */}
      <div
        className={clsx(
          'absolute left-0 right-0 z-30 flex items-center gap-1 px-2 select-none transition-opacity rounded-t-xl',
          isSelected || isHidden ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}
        style={{
          top: -36,
          height: 34,
          background: isSelected ? '#6366f1' : 'rgba(99,102,241,0.8)',
          backdropFilter: 'blur(8px)',
          cursor: 'grab',
        }}
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest('button')) return
          event.stopPropagation()
          dragControls.start(event)
        }}
      >
        <GripVertical size={13} style={{ color: 'rgba(255,255,255,0.7)', flexShrink: 0 }} />
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', fontWeight: 700, flex: 1, textTransform: 'uppercase', letterSpacing: '0.06em', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {section.type}
        </span>
        <button onClick={e => { e.stopPropagation(); updateSectionSettings(section.id, { hidden: !isHidden }) }}
          className="p-1 rounded hover:bg-white/20 transition-colors" title={isHidden ? 'Show' : 'Hide'}
          style={{ color: 'rgba(255,255,255,0.75)' }}>
          {isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
        <button onClick={e => { e.stopPropagation(); duplicateSection(section.id) }}
          className="p-1 rounded hover:bg-white/20 transition-colors" title="Duplicate"
          style={{ color: 'rgba(255,255,255,0.75)' }}>
          <Copy size={12} />
        </button>
        <button onClick={e => { e.stopPropagation(); removeSection(section.id) }}
          className="p-1 rounded hover:bg-red-500/50 transition-colors" title="Delete"
          style={{ color: 'rgba(255,255,255,0.75)' }}>
          <Trash2 size={12} />
        </button>
      </div>

      {/* Selection outline */}
      {isSelected && (
        <div className="absolute pointer-events-none z-10 rounded-b-xl rounded-tr-xl"
          style={{ inset: 0, outline: '2px solid #6366f1', outlineOffset: '0px' }} />
      )}

      {/* Left resize handle */}
      <div
        onMouseDown={(e) => startResize('left', e)}
        className={clsx('absolute top-1/2 z-30 -translate-y-1/2 transition-opacity', isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-80')}
        style={{ left: -6, width: 12, height: 48, background: '#6366f1', border: '2px solid white', borderRadius: 6, cursor: 'ew-resize', boxShadow: '0 4px 12px rgba(99,102,241,0.5)' }}
        title="Resize width"
      />
      {/* Right resize handle */}
      <div
        onMouseDown={(e) => startResize('right', e)}
        className={clsx('absolute top-1/2 z-30 -translate-y-1/2 transition-opacity', isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-80')}
        style={{ right: -6, width: 12, height: 48, background: '#6366f1', border: '2px solid white', borderRadius: 6, cursor: 'ew-resize', boxShadow: '0 4px 12px rgba(99,102,241,0.5)' }}
        title="Resize width"
      />
      {/* Bottom-center resize handle */}
      <div
        onMouseDown={(e) => startResize('bottom', e)}
        className={clsx('absolute left-1/2 z-30 -translate-x-1/2 transition-opacity', isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-80')}
        style={{ bottom: -6, width: 48, height: 12, background: '#6366f1', border: '2px solid white', borderRadius: 6, cursor: 's-resize', boxShadow: '0 4px 12px rgba(99,102,241,0.5)' }}
        title="Resize height"
      />
      {/* Bottom-left corner */}
      <div
        onMouseDown={(e) => startResize('bottom-left', e)}
        className={clsx('absolute z-30 transition-opacity', isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-80')}
        style={{ bottom: -8, left: -8, width: 16, height: 16, background: '#6366f1', border: '2px solid white', borderRadius: '50%', cursor: 'sw-resize', boxShadow: '0 4px 12px rgba(99,102,241,0.5)' }}
        title="Resize"
      />
      {/* Bottom-right corner */}
      <div
        onMouseDown={(e) => startResize('bottom-right', e)}
        className={clsx('absolute z-30 transition-opacity', isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-80')}
        style={{ bottom: -8, right: -8, width: 16, height: 16, background: '#6366f1', border: '2px solid white', borderRadius: '50%', cursor: 'se-resize', boxShadow: '0 4px 12px rgba(99,102,241,0.5)' }}
        title="Resize"
      />

      <div ref={frameRef} style={{ boxShadow: '0 20px 60px rgba(15, 23, 42, 0.18)', borderRadius: '0 0 12px 12px' }}>
        <div
          ref={contentRef}
          style={{
            borderRadius: '0 0 12px 12px',
            overflow: fixedHeight ? 'hidden' : 'visible',
            height: fixedHeight ? `${fixedHeight}px` : undefined,
          }}
        >
          <AnimatedSectionRenderer section={section} />
        </div>
      </div>
    </motion.div>
  )
}
