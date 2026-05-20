import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import FontFamily from '@tiptap/extension-font-family'
import { Extension } from '@tiptap/core'
import { useBuilderStore } from '../../store/builderStore'
import { motion } from 'framer-motion'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, RemoveFormatting, ChevronUp, ChevronDown,
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'

// ── Inline FontSize extension ───────────────────────────────────────────────
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [{
      types: this.options.types,
      attributes: {
        fontSize: {
          default: null,
          parseHTML: (el: HTMLElement) => el.style.fontSize || null,
          renderHTML: (attrs: Record<string, any>) =>
            attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }]
  },
  addCommands() {
    return {
      setFontSize: (s: string) => ({ chain }: any) => chain().setMark('textStyle', { fontSize: s }).run(),
      unsetFontSize: () => ({ chain }: any) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    }
  },
})

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Comic Sans', value: '"Comic Sans MS", cursive' },
]

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96]

// ── Props ───────────────────────────────────────────────────────────────────
interface Props {
  sectionId: string
  field: string
  value: string
  className?: string
  style?: React.CSSProperties
  placeholder?: string
  tag?: string
  multiline?: boolean
}

function hasMeaningfulContent(value?: string | null) {
  if (!value) return false
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .trim().length > 0
}

// ── Public component ────────────────────────────────────────────────────────
export default function EditableText(props: Props) {
  const location = useLocation()
  const isEditable = location.pathname.startsWith('/builder/')

  if (!isEditable) {
    if (!hasMeaningfulContent(props.value)) return null
    return <div className={props.className} style={props.style} dangerouslySetInnerHTML={{ __html: props.value || '' }} />
  }

  return <BuilderEditableText {...props} />
}

// ── Builder-only editor ─────────────────────────────────────────────────────
function BuilderEditableText({ sectionId, field, value, className, style, placeholder }: Props) {
  const { updateSectionContent } = useBuilderStore()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const toolbarRef = useRef<HTMLDivElement | null>(null)
  const [fontSizeInput, setFontSizeInput] = useState('')
  const [isEditorFocused, setIsEditorFocused] = useState(false)
  const [isToolbarFocused, setIsToolbarFocused] = useState(false)
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number; width: number } | null>(null)

  const updateToolbarPosition = useCallback(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || typeof window === 'undefined') return

    const rect = wrapper.getBoundingClientRect()
    const width = Math.min(780, window.innerWidth - 16)
    const left = Math.min(
      Math.max(rect.left + rect.width / 2 - width / 2, 8),
      window.innerWidth - width - 8,
    )
    const top = rect.top >= 76 ? rect.top - 56 : rect.bottom + 10

    setToolbarPos({ top, left, width })
  }, [])

  const closeToolbar = useCallback(() => {
    setIsEditorFocused(false)
    setIsToolbarFocused(false)
    setToolbarPos(null)
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontSize,
      FontFamily,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: placeholder || 'Click to edit...' }),
    ],
    content: value || '',
    onFocus: () => {
      setIsEditorFocused(true)
      updateToolbarPosition()
    },
    onBlur: () => {
      window.setTimeout(() => {
        const activeElement = document.activeElement
        const toolbarHasFocus = !!(toolbarRef.current && activeElement && toolbarRef.current.contains(activeElement))
        if (!toolbarHasFocus) closeToolbar()
      }, 0)
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      updateSectionContent(sectionId, { [field]: hasMeaningfulContent(html) ? html : '' })
    },
    editorProps: { attributes: { class: 'outline-none min-w-0 cursor-text' } },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value || '')
  }, [editor, value])

  // Keep font-size input in sync with selection
  useEffect(() => {
    if (!editor) return
    const update = () => {
      const fs = editor.getAttributes('textStyle').fontSize || ''
      setFontSizeInput(fs ? String(parseInt(fs)) : '')
      if (isEditorFocused || isToolbarFocused) updateToolbarPosition()
    }
    editor.on('selectionUpdate', update)
    editor.on('update', update)
    return () => { editor.off('selectionUpdate', update); editor.off('update', update) }
  }, [editor, isEditorFocused, isToolbarFocused, updateToolbarPosition])

  useEffect(() => {
    if (!isEditorFocused && !isToolbarFocused) return

    updateToolbarPosition()
    window.addEventListener('scroll', updateToolbarPosition, true)
    window.addEventListener('resize', updateToolbarPosition)

    return () => {
      window.removeEventListener('scroll', updateToolbarPosition, true)
      window.removeEventListener('resize', updateToolbarPosition)
    }
  }, [isEditorFocused, isToolbarFocused, updateToolbarPosition])

  // ── helpers ───────────────────────────────────────────────────────────────
  const currentFontSize = () => {
    const fs = editor?.getAttributes('textStyle').fontSize
    return fs ? parseInt(fs) : null
  }

  const applyFontSize = (px: number) => {
    const clamped = Math.min(Math.max(px, 6), 200)
    editor?.chain().focus().setMark('textStyle', { fontSize: `${clamped}px` }).run()
    setFontSizeInput(String(clamped))
  }

  const bumpFontSize = (delta: number) => {
    const cur = currentFontSize() ?? 16
    applyFontSize(cur + delta)
  }

  const currentFamily = () => editor?.getAttributes('textStyle').fontFamily || ''
  const currentColor = () => editor?.getAttributes('textStyle').color || '#000000'
  const currentHighlight = () => editor?.getAttributes('highlight').color || '#ffff00'

  // ── toolbar portal ────────────────────────────────────────────────────────
  const showToolbar = (isEditorFocused || isToolbarFocused) && toolbarPos

  const toolbar = showToolbar && typeof document !== 'undefined'
    ? createPortal(
      <div
        style={{
          position: 'fixed',
          top: toolbarPos.top,
          left: toolbarPos.left,
          zIndex: 9999,
          width: toolbarPos.width,
          pointerEvents: 'none',
        }}
      >
        <motion.div
          ref={toolbarRef}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.12 }}
          onPointerDown={() => setIsToolbarFocused(true)}
          onFocusCapture={() => setIsToolbarFocused(true)}
          onBlurCapture={() => {
            window.setTimeout(() => {
              const activeElement = document.activeElement
              const toolbarHasFocus = !!(toolbarRef.current && activeElement && toolbarRef.current.contains(activeElement))
              if (!toolbarHasFocus && !editor?.isFocused) closeToolbar()
            }, 0)
          }}
          className="flex flex-wrap items-center gap-px rounded-xl shadow-2xl px-2 py-1.5"
          style={{
            width: '100%',
            background: '#ffffff',
            border: '1px solid #d1d5db',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            pointerEvents: 'auto',
          }}
        >
        {/* Font family */}
        <select
          value={currentFamily()}
          onMouseDown={() => setIsToolbarFocused(true)}
          onChange={e => {
            if (e.target.value) editor?.chain().focus().setFontFamily(e.target.value).run()
            else editor?.chain().focus().unsetFontFamily().run()
          }}
          style={{
            fontSize: 12, padding: '2px 4px', borderRadius: 4, border: '1px solid #d1d5db',
            background: '#f9fafb', color: '#111827', cursor: 'pointer', maxWidth: 110, minWidth: 80,
          }}
        >
          {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <Sep />

        {/* Font size input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <input
            type="number"
            min={6} max={200}
            value={fontSizeInput}
            onMouseDown={() => setIsToolbarFocused(true)}
            onChange={e => setFontSizeInput(e.target.value)}
            onBlur={e => { const v = parseInt(e.target.value); if (!isNaN(v)) applyFontSize(v) }}
            onKeyDown={e => { if (e.key === 'Enter') { const v = parseInt(fontSizeInput); if (!isNaN(v)) applyFontSize(v) } }}
            placeholder="–"
            style={{
              width: 38, textAlign: 'center', fontSize: 12, padding: '2px 2px',
              border: '1px solid #d1d5db', borderRadius: 4, background: '#f9fafb', color: '#111827', outline: 'none',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <button onMouseDown={e => { e.preventDefault(); bumpFontSize(1) }}
              style={{ height: 12, width: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d1d5db', borderRadius: '3px 3px 0 0', background: '#f3f4f6', cursor: 'pointer', padding: 0 }}>
              <ChevronUp size={9} style={{ color: '#374151' }} />
            </button>
            <button onMouseDown={e => { e.preventDefault(); bumpFontSize(-1) }}
              style={{ height: 12, width: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d1d5db', borderTop: 'none', borderRadius: '0 0 3px 3px', background: '#f3f4f6', cursor: 'pointer', padding: 0 }}>
              <ChevronDown size={9} style={{ color: '#374151' }} />
            </button>
          </div>
        </div>

        <Sep />

        {/* B I U S */}
        <Btn label="B" active={!!editor?.isActive('bold')} bold onClick={() => editor?.chain().focus().toggleBold().run()} />
        <Btn label="I" active={!!editor?.isActive('italic')} italic onClick={() => editor?.chain().focus().toggleItalic().run()} />
        <Btn label="U" active={!!editor?.isActive('underline')} underline onClick={() => editor?.chain().focus().toggleUnderline().run()} />
        <Btn label="S" active={!!editor?.isActive('strike')} strike onClick={() => editor?.chain().focus().toggleStrike().run()} />

        <Sep />

        {/* Text color */}
        <ColorBtn
          label="A"
          barColor={currentColor()}
          title="Text color"
          onOpen={() => setIsToolbarFocused(true)}
          onColor={c => editor?.chain().focus().setColor(c).run()}
        />
        {/* Highlight color */}
        <ColorBtn
          label="A"
          barColor={currentHighlight()}
          title="Highlight"
          highlightBar
          onOpen={() => setIsToolbarFocused(true)}
          onColor={c => editor?.chain().focus().toggleHighlight({ color: c }).run()}
        />

        <Sep />

        {/* Alignment */}
        <IconBtn icon={AlignLeft} active={!!editor?.isActive({ textAlign: 'left' })} onClick={() => editor?.chain().focus().setTextAlign('left').run()} />
        <IconBtn icon={AlignCenter} active={!!editor?.isActive({ textAlign: 'center' })} onClick={() => editor?.chain().focus().setTextAlign('center').run()} />
        <IconBtn icon={AlignRight} active={!!editor?.isActive({ textAlign: 'right' })} onClick={() => editor?.chain().focus().setTextAlign('right').run()} />
        <IconBtn icon={AlignJustify} active={!!editor?.isActive({ textAlign: 'justify' })} onClick={() => editor?.chain().focus().setTextAlign('justify').run()} />

        <Sep />

        {/* Lists */}
        <IconBtn icon={List} active={!!editor?.isActive('bulletList')} onClick={() => editor?.chain().focus().toggleBulletList().run()} />
        <IconBtn icon={ListOrdered} active={!!editor?.isActive('orderedList')} onClick={() => editor?.chain().focus().toggleOrderedList().run()} />

        <Sep />

        {/* Clear formatting */}
        <IconBtn icon={RemoveFormatting} active={false} onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear formatting" />
        </motion.div>
      </div>,
      document.body
    )
    : null

  return (
    <div ref={wrapperRef} className="relative group/text">
      {toolbar}
      <EditorContent editor={editor} className={className} style={style} />
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Sep() {
  return <div style={{ width: 1, height: 20, background: '#e5e7eb', margin: '0 3px', flexShrink: 0 }} />
}

function Btn({ label, active, bold, italic, underline, strike, onClick }:
  { label: string; active: boolean; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; onClick: () => void }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick() }}
      style={{
        fontWeight: bold ? 700 : 400,
        fontStyle: italic ? 'italic' : undefined,
        textDecoration: underline ? 'underline' : strike ? 'line-through' : undefined,
        fontSize: 13,
        minWidth: 24,
        height: 26,
        padding: '0 4px',
        borderRadius: 4,
        border: '1px solid transparent',
        cursor: 'pointer',
        background: active ? '#e0e7ff' : 'transparent',
        color: active ? '#4338ca' : '#1f2937',
        transition: 'background 0.1s',
      }}
    >{label}</button>
  )
}

function IconBtn({ icon: Icon, active, onClick, title }: { icon: any; active: boolean; onClick: () => void; title?: string }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={title}
      style={{
        width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 4, border: '1px solid transparent', cursor: 'pointer',
        background: active ? '#e0e7ff' : 'transparent',
        color: active ? '#4338ca' : '#374151',
        transition: 'background 0.1s',
      }}
    >
      <Icon size={13} />
    </button>
  )
}

function ColorBtn({ label, barColor, title, highlightBar, onColor, onOpen }:
  { label: string; barColor: string; title: string; highlightBar?: boolean; onColor: (c: string) => void; onOpen: () => void }) {
  return (
    <label title={title} style={{ position: 'relative', cursor: 'pointer', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', width: 26, userSelect: 'none' }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', lineHeight: 1.4, fontFamily: 'Arial, sans-serif' }}>{label}</span>
      <div style={{
        width: 20, height: 4, borderRadius: 2,
        background: highlightBar ? barColor : 'transparent',
        borderBottom: highlightBar ? undefined : `3px solid ${barColor}`,
        marginTop: 1,
      }} />
      <input
        type="color"
        value={barColor}
        onMouseDown={onOpen}
        onChange={e => onColor(e.target.value)}
        style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', top: 0, left: 0 }}
      />
    </label>
  )
}

