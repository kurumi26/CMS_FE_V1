import { useState } from 'react'
import { useBuilderStore } from '../../store/builderStore'
import ContentEditor from './ContentEditor'
import { getDefaultFloatingWidth, isFloatingSection } from '../../utils/sectionPositioning'

const animationOptions = [
  { value: 'none', label: 'None' },
  { value: 'fadeUp', label: 'Fade Up' },
  { value: 'fadeDown', label: 'Fade Down' },
  { value: 'fadeLeft', label: 'Fade Left' },
  { value: 'fadeRight', label: 'Fade Right' },
  { value: 'zoomIn', label: 'Zoom In' },
  { value: 'flipY', label: 'Flip' },
  { value: 'bounce', label: 'Bounce In' },
] as const

export default function DesignPanel() {
  const { sections, selectedId, updateSectionSettings } = useBuilderStore()
  const [tab, setTab] = useState<'content' | 'style'>('content')
  const section = sections.find(s => s.id === selectedId)

  if (!section) {
    return (
      <div className="p-6 text-center" style={{ color: '#64748b' }}>
        <p className="text-sm">Select a section to edit</p>
      </div>
    )
  }

  const s = section.settings
  const set = (key: string, value: any) => updateSectionSettings(section.id, { [key]: value })
  const isFloating = isFloatingSection(section)

  const setPlacementMode = (mode: 'flow' | 'free') => {
    if (mode === 'free') {
      updateSectionSettings(section.id, {
        positionMode: 'free',
        positionX: Number(s.positionX ?? 40),
        positionY: Number(s.positionY ?? (40 + section.order * 96)),
        frameWidth: Number(s.frameWidth ?? getDefaultFloatingWidth(section.type)),
        zIndex: Number(s.zIndex ?? 20),
      })
      return
    }

    updateSectionSettings(section.id, { positionMode: 'flow' })
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {(['content', 'style'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2.5 text-xs font-semibold capitalize tracking-wide transition-colors"
            style={{
              background: tab === t ? 'rgba(99,102,241,0.12)' : 'transparent',
              color: tab === t ? '#818cf8' : '#64748b',
              borderBottom: tab === t ? '2px solid #6366f1' : '2px solid transparent',
              marginBottom: '-1px',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {tab === 'content' && (
        <div className="flex-1 overflow-y-auto">
          <ContentEditor />
        </div>
      )}

      {/* Style Tab */}
      {tab === 'style' && (
    <div className="p-4 h-full overflow-y-auto flex flex-col gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>Section</p>
        <p className="text-sm font-semibold capitalize" style={{ color: '#e2e8f0' }}>{section.type}</p>
      </div>

      {/* Background */}
      <Field label="Background">
        <div className="flex gap-2 items-center">
          <input type="color" value={s.background || '#ffffff'} onChange={e => set('background', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
          <input type="text" value={s.background || ''} onChange={e => set('background', e.target.value)}
            placeholder="#ffffff or gradient"
            className="flex-1 text-sm px-2 py-1.5 rounded border outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
        </div>
      </Field>

      {/* Text Color */}
      <Field label="Text Color">
        <div className="flex gap-2 items-center">
          <input type="color" value={s.textColor || '#1a1a1a'} onChange={e => set('textColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
          <input type="text" value={s.textColor || ''} onChange={e => set('textColor', e.target.value)}
            placeholder="#1a1a1a"
            className="flex-1 text-sm px-2 py-1.5 rounded border outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
        </div>
      </Field>

      {/* Primary Color */}
      <Field label="Primary / Accent">
        <div className="flex gap-2 items-center">
          <input type="color" value={s.primaryColor || '#6366f1'} onChange={e => set('primaryColor', e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
          <input type="text" value={s.primaryColor || ''} onChange={e => set('primaryColor', e.target.value)}
            placeholder="#6366f1"
            className="flex-1 text-sm px-2 py-1.5 rounded border outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
        </div>
      </Field>

      {/* Padding */}
      <Field label="Padding Top (px)">
        <input type="range" min={0} max={200} value={s.paddingTop || 80} onChange={e => set('paddingTop', +e.target.value)}
          className="w-full" />
        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{s.paddingTop || 80}px</p>
      </Field>
      <Field label="Padding Bottom (px)">
        <input type="range" min={0} max={200} value={s.paddingBottom || 80} onChange={e => set('paddingBottom', +e.target.value)}
          className="w-full" />
        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{s.paddingBottom || 80}px</p>
      </Field>

      <Field label="Placement">
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'flow', label: 'Stacked Flow' },
            { value: 'free', label: 'Free Position' },
          ].map(option => (
            <button key={option.value} onClick={() => setPlacementMode(option.value as 'flow' | 'free')}
              className="py-2 rounded text-sm transition-colors"
              style={{ background: (isFloating ? 'free' : 'flow') === option.value ? '#6366f1' : 'rgba(255,255,255,0.06)', color: (isFloating ? 'free' : 'flow') === option.value ? '#fff' : '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
              {option.label}
            </button>
          ))}
        </div>
      </Field>

      {isFloating && (
        <>
          <Field label="Horizontal Position">
            <input type="range" min={0} max={1000} step={4} value={Number(s.positionX ?? 40)} onChange={e => set('positionX', +e.target.value)}
              className="w-full" />
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{Number(s.positionX ?? 40)}px</p>
          </Field>

          <Field label="Vertical Position">
            <input type="range" min={0} max={2400} step={4} value={Number(s.positionY ?? 40)} onChange={e => set('positionY', +e.target.value)}
              className="w-full" />
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{Number(s.positionY ?? 40)}px</p>
          </Field>

          <Field label="Frame Width">
            <input type="range" min={260} max={1100} step={10} value={Number(s.frameWidth ?? getDefaultFloatingWidth(section.type))} onChange={e => set('frameWidth', +e.target.value)}
              className="w-full" />
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{Number(s.frameWidth ?? getDefaultFloatingWidth(section.type))}px</p>
          </Field>

          <Field label="Layer Order">
            <input type="range" min={1} max={50} step={1} value={Number(s.zIndex ?? 20)} onChange={e => set('zIndex', +e.target.value)}
              className="w-full" />
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{Number(s.zIndex ?? 20)}</p>
          </Field>
        </>
      )}

      {/* Layout (hero + about) */}
      {(section.type === 'hero' || section.type === 'about') && (
        <Field label="Layout">
          <div className="flex gap-2">
            {['center', 'left'].map(v => (
              <button key={v} onClick={() => set('layout', v)}
                className="flex-1 py-1.5 rounded text-sm capitalize transition-colors"
                style={{ background: s.layout === v ? '#6366f1' : 'rgba(255,255,255,0.06)', color: s.layout === v ? '#fff' : '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                {v}
              </button>
            ))}
          </div>
        </Field>
      )}

      {section.type === 'navbar' && (
        <>
          <Field label="Menu Position">
            <div className="flex gap-2">
              {['left', 'center', 'right'].map(v => (
                <button key={v} onClick={() => set('navAlignment', v)}
                  className="flex-1 py-1.5 rounded text-sm capitalize transition-colors"
                  style={{ background: (s.navAlignment || 'right') === v ? '#6366f1' : 'rgba(255,255,255,0.06)', color: (s.navAlignment || 'right') === v ? '#fff' : '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {v}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Logo Position">
            <div className="flex gap-2">
              {['left', 'center', 'right'].map(v => (
                <button key={v} onClick={() => set('navLogoPosition', v)}
                  className="flex-1 py-1.5 rounded text-sm capitalize transition-colors"
                  style={{ background: (s.navLogoPosition || 'left') === v ? '#6366f1' : 'rgba(255,255,255,0.06)', color: (s.navLogoPosition || 'left') === v ? '#fff' : '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {v}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Sticky Navbar">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!s.navSticky} onChange={e => set('navSticky', e.target.checked)} className="w-4 h-4" />
              <span className="text-sm" style={{ color: '#94a3b8' }}>Keep navbar at the top while scrolling</span>
            </label>
          </Field>

          <Field label="Navbar Height">
            <input type="range" min={56} max={120} step={2} value={Number(s.navHeight ?? 64)} onChange={e => set('navHeight', +e.target.value)} className="w-full" />
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{Number(s.navHeight ?? 64)}px</p>
          </Field>

          <Field label="Logo Size">
            <input type="range" min={24} max={72} step={2} value={Number(s.navLogoSize ?? 36)} onChange={e => set('navLogoSize', +e.target.value)} className="w-full" />
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{Number(s.navLogoSize ?? 36)}px</p>
          </Field>

          <Field label="Link Spacing">
            <input type="range" min={12} max={48} step={2} value={Number(s.navLinkGap ?? 32)} onChange={e => set('navLinkGap', +e.target.value)} className="w-full" />
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{Number(s.navLinkGap ?? 32)}px</p>
          </Field>

          <Field label="CTA Button Style">
            <div className="grid grid-cols-3 gap-2">
              {['solid', 'outline', 'ghost'].map(v => (
                <button key={v} onClick={() => set('navCtaStyle', v)}
                  className="py-2 rounded text-sm capitalize transition-colors"
                  style={{ background: (s.navCtaStyle || 'solid') === v ? '#6366f1' : 'rgba(255,255,255,0.06)', color: (s.navCtaStyle || 'solid') === v ? '#fff' : '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {v}
                </button>
              ))}
            </div>
          </Field>
        </>
      )}

      {/* Columns (features) */}
      {section.type === 'features' && (
        <Field label="Columns">
          <div className="flex gap-2">
            {[2, 3, 4].map(v => (
              <button key={v} onClick={() => set('columns', v)}
                className="flex-1 py-1.5 rounded text-sm transition-colors"
                style={{ background: s.columns === v ? '#6366f1' : 'rgba(255,255,255,0.06)', color: s.columns === v ? '#fff' : '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                {v}
              </button>
            ))}
          </div>
        </Field>
      )}

      {/* Visibility */}
      <Field label="Visibility">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={!s.hiddenOnMobile} onChange={e => set('hiddenOnMobile', !e.target.checked)}
            className="w-4 h-4" />
          <span className="text-sm" style={{ color: '#94a3b8' }}>Show on Mobile</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer mt-2">
          <input type="checkbox" checked={!s.hiddenOnTablet} onChange={e => set('hiddenOnTablet', !e.target.checked)}
            className="w-4 h-4" />
          <span className="text-sm" style={{ color: '#94a3b8' }}>Show on Tablet</span>
        </label>
      </Field>

      {/* Entrance Animation */}
      <Field label="Entrance Animation">
        <div className="grid grid-cols-2 gap-2">
          {animationOptions.map(option => (
            <button key={option.value} onClick={() => set('animation', option.value)}
              className="py-2 rounded text-sm transition-colors"
              style={{ background: (s.animation || 'none') === option.value ? '#6366f1' : 'rgba(255,255,255,0.06)', color: (s.animation || 'none') === option.value ? '#fff' : '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
              {option.label}
            </button>
          ))}
        </div>
      </Field>

      {s.animation && s.animation !== 'none' && (
        <Field label="Animation Delay (ms)">
          <input type="range" min={0} max={800} step={100} value={s.animationDelay || 0} onChange={e => set('animationDelay', +e.target.value)}
            className="w-full" />
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{s.animationDelay || 0}ms</p>
        </Field>
      )}
    </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>{label}</label>
      {children}
    </div>
  )
}
