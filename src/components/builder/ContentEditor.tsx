import { useState } from 'react'
import { useBuilderStore } from '../../store/builderStore'
import { Plus, Trash2, ChevronUp, ChevronDown, Image, Link2, ExternalLink, Film, X, Search } from 'lucide-react'
import api from '../../services/api'

function decodeHtmlEntities(value: string) {
  if (typeof document === 'undefined') {
    return value
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
  }

  const textarea = document.createElement('textarea')
  textarea.innerHTML = value
  return textarea.value
}

function fromRichText(value: string, multiline = false) {
  if (!value) return ''

  const normalized = value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')

  const decoded = decodeHtmlEntities(normalized).replace(/\u00a0/g, ' ').trim()
  return multiline ? decoded : decoded.replace(/\s*\n+\s*/g, ' ')
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toRichText(value: string, multiline = false) {
  const normalized = value.replace(/\r/g, '').trim()
  if (!normalized) return ''

  if (!multiline) {
    return `<p>${escapeHtml(normalized)}</p>`
  }

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

export default function ContentEditor() {
  const { sections, selectedId, updateSectionContent } = useBuilderStore()
  const section = sections.find(s => s.id === selectedId)
  if (!section) return <div className="p-6 text-center text-sm" style={{ color: '#64748b' }}>Select a section to edit content</div>

  const c = section.content
  const set = (field: string, value: any) => updateSectionContent(section.id, { [field]: value })
  const setDeep = (updates: Record<string, any>) => updateSectionContent(section.id, updates)

  // Helpers for array-based lists
  const listUpdater = (field: string) => ({
    items: (c[field] || []) as any[],
    update: (idx: number, key: string, val: any) => {
      const arr = [...(c[field] || [])]
      arr[idx] = { ...arr[idx], [key]: val }
      set(field, arr)
    },
    add: (template: any) => set(field, [...(c[field] || []), template]),
    remove: (idx: number) => set(field, (c[field] || []).filter((_: any, i: number) => i !== idx)),
    move: (idx: number, dir: -1 | 1) => {
      const arr = [...(c[field] || [])]
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= arr.length) return
      ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
      set(field, arr)
    },
  })

  const t = section.type

  return (
    <div className="p-3 flex flex-col gap-4 overflow-y-auto h-full">
      <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>
        {t} — Content
      </p>

      {/* ── NAVBAR ── */}
      {t === 'navbar' && (
        <>
          <FI label="Brand / Logo Text"><RTI value={c.logo ?? c.brand ?? ''} onChange={v => setDeep({ logo: v, brand: v })} placeholder="Your brand name" /></FI>
          <FI label="Logo Image URL (optional)">
            <ImgInput value={c.logo_image || ''} onChange={v => set('logo_image', v)} />
          </FI>
          <FI label="CTA Button Text"><TI value={c.cta_text || ''} onChange={v => set('cta_text', v)} placeholder="Get Started" /></FI>
          <FI label="CTA Button URL"><TI value={c.cta_url || ''} onChange={v => set('cta_url', v)} placeholder="#" /></FI>
          <FI label="Navigation Links">
            <ListEditor
              items={c.links || []}
              onAdd={() => listUpdater('links').add({ label: 'New Link', url: '#' })}
              renderItem={(item: any, idx: number) => {
                const lu = listUpdater('links')
                return (
                  <div key={idx} className="flex flex-col gap-1.5 p-2 rounded-lg mb-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <ReorderBtns onUp={() => lu.move(idx, -1)} onDown={() => lu.move(idx, 1)} />
                      <button onClick={() => lu.remove(idx)} className="ml-auto p-0.5 text-slate-600 hover:text-red-400"><Trash2 size={11} /></button>
                    </div>
                    <TI value={item.label} onChange={v => lu.update(idx, 'label', v)} placeholder="Label" />
                    <TI value={item.url} onChange={v => lu.update(idx, 'url', v)} placeholder="URL or #anchor" icon={<Link2 size={11} />} />
                  </div>
                )
              }}
            />
          </FI>
        </>
      )}

      {/* ── HERO ── */}
      {t === 'hero' && (
        <>
          <FI label="Heading"><RTAI value={c.heading || ''} onChange={v => set('heading', v)} rows={2} /></FI>
          <FI label="Subheading"><RTAI value={c.subheading || ''} onChange={v => set('subheading', v)} rows={2} /></FI>
          <FI label="Primary Button Text"><TI value={c.cta_text || ''} onChange={v => set('cta_text', v)} placeholder="Get Started" /></FI>
          <FI label="Primary Button URL"><TI value={c.cta_url || ''} onChange={v => set('cta_url', v)} placeholder="#" icon={<Link2 size={11} />} /></FI>
          <FI label="Secondary Button Text"><TI value={c.cta_secondary_text || ''} onChange={v => set('cta_secondary_text', v)} placeholder="Learn More" /></FI>
          <FI label="Background Image URL">
            <ImgInput value={c.background_image || ''} onChange={v => set('background_image', v)} />
          </FI>
        </>
      )}

      {/* ── FEATURES ── */}
      {t === 'features' && (
        <>
          <FI label="Heading"><RTI value={c.heading || ''} onChange={v => set('heading', v)} /></FI>
          <FI label="Subheading"><RTI value={c.subheading || ''} onChange={v => set('subheading', v)} /></FI>
          <FI label="Feature Cards">
            <ListEditor
              items={c.features || []}
              onAdd={() => listUpdater('features').add({ icon: 'Star', title: 'New Feature', desc: 'Description here.' })}
              renderItem={(item: any, idx: number) => {
                const lu = listUpdater('features')
                return (
                  <ItemCard key={idx} onUp={() => lu.move(idx, -1)} onDown={() => lu.move(idx, 1)} onRemove={() => lu.remove(idx)}>
                    <TI value={item.title} onChange={v => lu.update(idx, 'title', v)} placeholder="Feature title" />
                    <TAI value={item.desc} onChange={v => lu.update(idx, 'desc', v)} placeholder="Description" rows={2} />
                  </ItemCard>
                )
              }}
            />
          </FI>
        </>
      )}

      {/* ── ABOUT ── */}
      {t === 'about' && (
        <>
          <FI label="Heading"><RTI value={c.heading || ''} onChange={v => set('heading', v)} /></FI>
          <FI label="Body Text"><RTAI value={c.text || ''} onChange={v => set('text', v)} rows={4} /></FI>
          <FI label="Section Image URL"><ImgInput value={c.image || ''} onChange={v => set('image', v)} /></FI>
          <FI label="Stats">
            <ListEditor
              items={c.stats || []}
              onAdd={() => listUpdater('stats').add({ value: '0+', label: 'Stat' })}
              renderItem={(item: any, idx: number) => {
                const lu = listUpdater('stats')
                return (
                  <ItemCard key={idx} horizontal onUp={() => lu.move(idx, -1)} onDown={() => lu.move(idx, 1)} onRemove={() => lu.remove(idx)}>
                    <TI value={item.value} onChange={v => lu.update(idx, 'value', v)} placeholder="10K+" />
                    <TI value={item.label} onChange={v => lu.update(idx, 'label', v)} placeholder="Customers" />
                  </ItemCard>
                )
              }}
            />
          </FI>
        </>
      )}

      {/* ── TESTIMONIALS ── */}
      {t === 'testimonials' && (
        <>
          <FI label="Heading"><RTI value={c.heading || ''} onChange={v => set('heading', v)} /></FI>
          <FI label="Testimonials">
            <ListEditor
              items={c.testimonials || []}
              onAdd={() => listUpdater('testimonials').add({ name: 'Name', role: 'Role', text: 'Great product!', avatar: '' })}
              renderItem={(item: any, idx: number) => {
                const lu = listUpdater('testimonials')
                return (
                  <ItemCard key={idx} onUp={() => lu.move(idx, -1)} onDown={() => lu.move(idx, 1)} onRemove={() => lu.remove(idx)}>
                    <TI value={item.name} onChange={v => lu.update(idx, 'name', v)} placeholder="Full Name" />
                    <TI value={item.role} onChange={v => lu.update(idx, 'role', v)} placeholder="Title / Role" />
                    <TAI value={item.text} onChange={v => lu.update(idx, 'text', v)} placeholder="Quote..." rows={2} />
                    <ImgInput value={item.avatar || ''} onChange={v => lu.update(idx, 'avatar', v)} compact placeholder="Avatar URL" />
                  </ItemCard>
                )
              }}
            />
          </FI>
        </>
      )}

      {/* ── CONTACT ── */}
      {t === 'contact' && (
        <>
          <FI label="Heading"><RTI value={c.heading || ''} onChange={v => set('heading', v)} /></FI>
          <FI label="Subheading"><RTI value={c.subheading || ''} onChange={v => set('subheading', v)} /></FI>
          <FI label="Email"><TI value={c.email || ''} onChange={v => set('email', v)} placeholder="hello@company.com" /></FI>
          <FI label="Phone"><TI value={c.phone || ''} onChange={v => set('phone', v)} placeholder="+1 555 000 0000" /></FI>
          <FI label="Address"><TI value={c.address || ''} onChange={v => set('address', v)} placeholder="123 Main St" /></FI>
          <FI label="Google Maps Embed URL"><TI value={c.map_embed || ''} onChange={v => set('map_embed', v)} placeholder="https://maps.google.com/..." icon={<ExternalLink size={11} />} /></FI>
        </>
      )}

      {/* ── PRICING ── */}
      {t === 'pricing' && (
        <>
          <FI label="Heading"><RTI value={c.heading || ''} onChange={v => set('heading', v)} /></FI>
          <FI label="Subheading"><RTI value={c.subheading || ''} onChange={v => set('subheading', v)} /></FI>
          <FI label="Plans">
            <ListEditor
              items={c.plans || []}
              onAdd={() => listUpdater('plans').add({ name: 'New Plan', price: '$0', period: '/mo', features: ['Feature 1'], highlighted: false })}
              renderItem={(item: any, idx: number) => {
                const lu = listUpdater('plans')
                return (
                  <ItemCard key={idx} onUp={() => lu.move(idx, -1)} onDown={() => lu.move(idx, 1)} onRemove={() => lu.remove(idx)}>
                    <TI value={item.name} onChange={v => lu.update(idx, 'name', v)} placeholder="Plan name" />
                    <div className="flex gap-1.5">
                      <TI value={item.price} onChange={v => lu.update(idx, 'price', v)} placeholder="$29" />
                      <TI value={item.period} onChange={v => lu.update(idx, 'period', v)} placeholder="/mo" />
                    </div>
                    <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#94a3b8' }}>
                      <input type="checkbox" checked={!!item.highlighted} onChange={e => lu.update(idx, 'highlighted', e.target.checked)} />
                      Featured / Highlighted
                    </label>
                    <p className="text-xs mt-1 mb-1" style={{ color: '#64748b' }}>Features (one per line)</p>
                    <TAI
                      value={(item.features || []).join('\n')}
                      onChange={v => lu.update(idx, 'features', v.split('\n').filter(Boolean))}
                      rows={3} placeholder="Feature 1&#10;Feature 2" />
                  </ItemCard>
                )
              }}
            />
          </FI>
        </>
      )}

      {/* ── CTA ── */}
      {t === 'cta' && (
        <>
          <FI label="Heading"><RTI value={c.heading || ''} onChange={v => set('heading', v)} /></FI>
          <FI label="Subheading"><RTAI value={c.subheading || ''} onChange={v => set('subheading', v)} rows={2} /></FI>
          <FI label="Button Text"><TI value={c.cta_text || ''} onChange={v => set('cta_text', v)} /></FI>
          <FI label="Button URL"><TI value={c.cta_url || ''} onChange={v => set('cta_url', v)} icon={<Link2 size={11} />} /></FI>
          <FI label="Secondary Button Text"><TI value={c.cta_secondary || ''} onChange={v => set('cta_secondary', v)} placeholder="Learn More" /></FI>
          <FI label="Background Image URL"><ImgInput value={c.background_image || ''} onChange={v => set('background_image', v)} /></FI>
        </>
      )}

      {/* ── STATS ── */}
      {t === 'stats' && (
        <>
          <FI label="Heading"><RTI value={c.heading || ''} onChange={v => set('heading', v)} /></FI>
          <FI label="Stats">
            <ListEditor
              items={c.stats || []}
              onAdd={() => listUpdater('stats').add({ value: '0+', label: 'Label' })}
              renderItem={(item: any, idx: number) => {
                const lu = listUpdater('stats')
                return (
                  <ItemCard key={idx} horizontal onUp={() => lu.move(idx, -1)} onDown={() => lu.move(idx, 1)} onRemove={() => lu.remove(idx)}>
                    <TI value={item.value} onChange={v => lu.update(idx, 'value', v)} placeholder="10K+" />
                    <TI value={item.label} onChange={v => lu.update(idx, 'label', v)} placeholder="Happy users" />
                  </ItemCard>
                )
              }}
            />
          </FI>
        </>
      )}

      {/* ── FAQ ── */}
      {t === 'faq' && (
        <>
          <FI label="Heading"><RTI value={c.heading || ''} onChange={v => set('heading', v)} /></FI>
          <FI label="Questions">
            <ListEditor
              items={c.items || []}
              onAdd={() => listUpdater('items').add({ q: 'New question?', a: 'Answer here.' })}
              renderItem={(item: any, idx: number) => {
                const lu = listUpdater('items')
                return (
                  <ItemCard key={idx} onUp={() => lu.move(idx, -1)} onDown={() => lu.move(idx, 1)} onRemove={() => lu.remove(idx)}>
                    <TI value={item.q} onChange={v => lu.update(idx, 'q', v)} placeholder="Question?" />
                    <TAI value={item.a} onChange={v => lu.update(idx, 'a', v)} placeholder="Answer..." rows={2} />
                  </ItemCard>
                )
              }}
            />
          </FI>
        </>
      )}

      {/* ── TEAM ── */}
      {t === 'team' && (
        <>
          <FI label="Heading"><RTI value={c.heading || ''} onChange={v => set('heading', v)} /></FI>
          <FI label="Members">
            <ListEditor
              items={c.members || []}
              onAdd={() => listUpdater('members').add({ name: 'Team Member', role: 'Role', bio: '', avatar: '' })}
              renderItem={(item: any, idx: number) => {
                const lu = listUpdater('members')
                return (
                  <ItemCard key={idx} onUp={() => lu.move(idx, -1)} onDown={() => lu.move(idx, 1)} onRemove={() => lu.remove(idx)}>
                    <TI value={item.name} onChange={v => lu.update(idx, 'name', v)} placeholder="Full Name" />
                    <TI value={item.role} onChange={v => lu.update(idx, 'role', v)} placeholder="Job Title" />
                    <TAI value={item.bio} onChange={v => lu.update(idx, 'bio', v)} placeholder="Short bio..." rows={2} />
                    <ImgInput value={item.avatar || ''} onChange={v => lu.update(idx, 'avatar', v)} compact placeholder="Photo URL" />
                  </ItemCard>
                )
              }}
            />
          </FI>
        </>
      )}

      {/* ── FOOTER ── */}
      {t === 'footer' && (
        <>
          <FI label="Brand Name"><TI value={c.logo || ''} onChange={v => set('logo', v)} /></FI>
          <FI label="Logo Image URL"><ImgInput value={c.logo_image || ''} onChange={v => set('logo_image', v)} /></FI>
          <FI label="Tagline"><TI value={c.tagline || ''} onChange={v => set('tagline', v)} /></FI>
          <FI label="Copyright"><TI value={c.copyright || ''} onChange={v => set('copyright', v)} placeholder="© 2026 Brand." /></FI>
          <FI label="Footer Columns">
            <ListEditor
              items={c.columns || []}
              onAdd={() => listUpdater('columns').add({ title: 'Column', links: [{ label: 'Link', url: '#' }] })}
              renderItem={(col: any, idx: number) => {
                const lu = listUpdater('columns')
                const updateLink = (linkIdx: number, key: string, val: string) => {
                  const cols = [...(c.columns || [])]
                  const links = [...(cols[idx].links || [])]
                  links[linkIdx] = { ...links[linkIdx], [key]: val }
                  cols[idx] = { ...cols[idx], links }
                  set('columns', cols)
                }
                const addLink = () => {
                  const cols = [...(c.columns || [])]
                  cols[idx] = { ...cols[idx], links: [...(cols[idx].links || []), { label: 'New Link', url: '#' }] }
                  set('columns', cols)
                }
                const removeLink = (linkIdx: number) => {
                  const cols = [...(c.columns || [])]
                  cols[idx] = { ...cols[idx], links: (cols[idx].links || []).filter((_: any, i: number) => i !== linkIdx) }
                  set('columns', cols)
                }
                return (
                  <ItemCard key={idx} onUp={() => lu.move(idx, -1)} onDown={() => lu.move(idx, 1)} onRemove={() => lu.remove(idx)}>
                    <TI value={col.title} onChange={v => lu.update(idx, 'title', v)} placeholder="Column title" />
                    {(col.links || []).map((link: any, li: number) => (
                      <div key={li} className="flex gap-1 items-center">
                        <TI value={link.label} onChange={v => updateLink(li, 'label', v)} placeholder="Label" />
                        <TI value={link.url} onChange={v => updateLink(li, 'url', v)} placeholder="URL" />
                        <button onClick={() => removeLink(li)} className="text-slate-600 hover:text-red-400 flex-shrink-0"><Trash2 size={11} /></button>
                      </div>
                    ))}
                    <button onClick={addLink} className="flex items-center gap-1 text-xs mt-1" style={{ color: '#6366f1' }}><Plus size={11} />Add link</button>
                  </ItemCard>
                )
              }}
            />
          </FI>
        </>
      )}

      {/* ── FORM ── */}
      {t === 'form' && (
        <>
          <FI label="Heading"><RTI value={c.heading || ''} onChange={v => set('heading', v)} /></FI>
          <FI label="Subheading"><RTI value={c.subheading || ''} onChange={v => set('subheading', v)} /></FI>
          <FI label="Submit Button Text"><TI value={c.submit_text || ''} onChange={v => set('submit_text', v)} placeholder="Send Message" /></FI>
          <FI label="Form Fields">
            <ListEditor
              items={c.fields || []}
              onAdd={() => listUpdater('fields').add({ type: 'text', label: 'Field', name: `field_${Date.now()}`, placeholder: '', required: false })}
              renderItem={(item: any, idx: number) => {
                const lu = listUpdater('fields')
                return (
                  <ItemCard key={idx} onUp={() => lu.move(idx, -1)} onDown={() => lu.move(idx, 1)} onRemove={() => lu.remove(idx)}>
                    <TI value={item.label} onChange={v => lu.update(idx, 'label', v)} placeholder="Label" />
                    <select value={item.type || 'text'} onChange={e => lu.update(idx, 'type', e.target.value)}
                      className="w-full text-xs rounded px-2 py-1.5 outline-none"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}>
                      {['text', 'email', 'tel', 'number', 'textarea', 'select', 'checkbox'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <TI value={item.placeholder} onChange={v => lu.update(idx, 'placeholder', v)} placeholder="Placeholder text" />
                    <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#94a3b8' }}>
                      <input type="checkbox" checked={!!item.required} onChange={e => lu.update(idx, 'required', e.target.checked)} /> Required
                    </label>
                  </ItemCard>
                )
              }}
            />
          </FI>
        </>
      )}

      {/* ── GALLERY ── */}
      {t === 'gallery' && (
        <>
          <FI label="Heading"><RTI value={c.heading || ''} onChange={v => set('heading', v)} /></FI>
          <FI label="Images">
            <ListEditor
              items={c.images || []}
              onAdd={() => listUpdater('images').add({ url: '', alt: '', caption: '' })}
              renderItem={(item: any, idx: number) => {
                const lu = listUpdater('images')
                return (
                  <ItemCard key={idx} onUp={() => lu.move(idx, -1)} onDown={() => lu.move(idx, 1)} onRemove={() => lu.remove(idx)}>
                    <ImgInput value={item.url} onChange={v => lu.update(idx, 'url', v)} />
                    <TI value={item.alt} onChange={v => lu.update(idx, 'alt', v)} placeholder="Alt text" />
                    <TI value={item.caption} onChange={v => lu.update(idx, 'caption', v)} placeholder="Caption (optional)" />
                  </ItemCard>
                )
              }}
            />
          </FI>
        </>
      )}

      {/* ── VIDEO ── */}
      {t === 'video' && (
        <>
          <FI label="Heading"><RTI value={c.heading || ''} onChange={v => set('heading', v)} /></FI>
          <FI label="Caption / Subtext"><TI value={c.caption || ''} onChange={v => set('caption', v)} /></FI>
          <FI label="Video URL">
            <VideoInput value={c.url || ''} onChange={v => set('url', v)} />
            <p className="text-xs mt-1" style={{ color: '#475569' }}>Paste a YouTube/Vimeo share URL or pick from Media</p>
          </FI>
          <FI label="Autoplay">
            <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#94a3b8' }}>
              <input type="checkbox" checked={!!c.autoplay} onChange={e => set('autoplay', e.target.checked)} /> Enable autoplay (muted)
            </label>
          </FI>
        </>
      )}

      {/* ── HTML ── */}
      {t === 'html' && (
        <FI label="Custom HTML Code">
          <TAI value={c.code || ''} onChange={v => set('code', v)} rows={10} placeholder="<div>Your HTML here</div>" mono />
        </FI>
      )}

      {/* ── SPACER ── */}
      {t === 'spacer' && (
        <FI label="Height (px)">
          <input type="range" min={20} max={400} step={10} value={Number(c.height) || 80}
            onChange={e => set('height', e.target.value)} className="w-full" />
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{c.height || 80}px</p>
        </FI>
      )}

      {/* ── DIVIDER ── */}
      {t === 'divider' && (
        <>
          <FI label="Style">
            <div className="flex gap-2">
              {['line', 'dots', 'wave'].map(s => (
                <button key={s} onClick={() => set('style', s)}
                  className="flex-1 py-1.5 rounded text-xs capitalize"
                  style={{ background: c.style === s ? '#6366f1' : 'rgba(255,255,255,0.05)', color: c.style === s ? '#fff' : '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {s}
                </button>
              ))}
            </div>
          </FI>
          <FI label="Color">
            <div className="flex gap-2 items-center">
              <input type="color" value={c.color || '#e5e7eb'} onChange={e => set('color', e.target.value)} className="w-8 h-8 rounded border-0 cursor-pointer" />
              <TI value={c.color || ''} onChange={v => set('color', v)} placeholder="#e5e7eb" />
            </div>
          </FI>
        </>
      )}

      {/* ── BLOG ── */}
      {t === 'blog' && (
        <>
          <FI label="Heading"><RTI value={c.heading || ''} onChange={v => set('heading', v)} /></FI>
          <FI label="Posts">
            <ListEditor
              items={c.posts || []}
              onAdd={() => listUpdater('posts').add({ title: 'Post Title', excerpt: 'Excerpt...', date: new Date().toISOString().slice(0, 10), image: '' })}
              renderItem={(item: any, idx: number) => {
                const lu = listUpdater('posts')
                return (
                  <ItemCard key={idx} onUp={() => lu.move(idx, -1)} onDown={() => lu.move(idx, 1)} onRemove={() => lu.remove(idx)}>
                    <TI value={item.title} onChange={v => lu.update(idx, 'title', v)} placeholder="Post title" />
                    <TAI value={item.excerpt} onChange={v => lu.update(idx, 'excerpt', v)} placeholder="Excerpt..." rows={2} />
                    <TI value={item.date} onChange={v => lu.update(idx, 'date', v)} placeholder="YYYY-MM-DD" />
                    <ImgInput value={item.image || ''} onChange={v => lu.update(idx, 'image', v)} compact placeholder="Cover image URL" />
                  </ItemCard>
                )
              }}
            />
          </FI>
        </>
      )}

      {/* ── IMAGE ── */}
      {t === 'image' && (
        <>
          <FI label="Image URL"><ImgInput value={c.url || ''} onChange={v => set('url', v)} /></FI>
          <FI label="Alt Text"><TI value={c.alt || ''} onChange={v => set('alt', v)} placeholder="Describe the image" /></FI>
          <FI label="Caption"><TI value={c.caption || ''} onChange={v => set('caption', v)} placeholder="Optional caption" /></FI>
        </>
      )}

      {/* ── TEXT ── */}
      {t === 'text' && (
        <div className="text-xs rounded-lg p-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
          Click directly on the text in the canvas to edit it using the rich text toolbar.
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function FI({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium" style={{ color: '#94a3b8' }}>{label}</label>
      {children}
    </div>
  )
}

function TI({ value, onChange, placeholder, icon, mono }: { value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      {icon && <span style={{ color: '#6366f1' }}>{icon}</span>}
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="flex-1 text-xs px-2 py-1.5 rounded outline-none w-full"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontFamily: mono ? 'monospace' : undefined }} />
    </div>
  )
}

function TAI({ value, onChange, placeholder, rows = 3, mono }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; mono?: boolean }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className="w-full text-xs px-2 py-1.5 rounded outline-none resize-y"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontFamily: mono ? 'monospace' : undefined }} />
  )
}

function RTI({ value, onChange, placeholder, icon }: { value: string; onChange: (v: string) => void; placeholder?: string; icon?: React.ReactNode }) {
  return <TI value={fromRichText(value)} onChange={v => onChange(toRichText(v))} placeholder={placeholder} icon={icon} />
}

function RTAI({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return <TAI value={fromRichText(value, true)} onChange={v => onChange(toRichText(v, true))} placeholder={placeholder} rows={rows} />
}

function ImgInput({ value, onChange, placeholder, compact }: { value: string; onChange: (v: string) => void; placeholder?: string; compact?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Image size={11} style={{ color: '#6366f1', flexShrink: 0 }} />
          <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || 'https://... or browse media'}
            className="flex-1 text-xs px-2 py-1.5 rounded outline-none min-w-0"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
          <button onClick={() => setOpen(true)} title="Browse Media"
            className="flex-shrink-0 px-2 py-1.5 rounded text-xs font-medium transition-colors"
            style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', whiteSpace: 'nowrap' }}>
            Browse
          </button>
        </div>
        {!compact && value && (
          <img src={value} alt="preview" onError={e => (e.currentTarget.style.display = 'none')}
            className="w-full rounded-lg object-cover" style={{ maxHeight: '80px' }} />
        )}
      </div>
      {open && <MediaPickerModal accept="image" onSelect={url => { onChange(url); setOpen(false) }} onClose={() => setOpen(false)} />}
    </>
  )
}

function VideoInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="flex items-center gap-1.5">
        <Film size={11} style={{ color: '#6366f1', flexShrink: 0 }} />
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="YouTube, Vimeo, or MP4 URL"
          className="flex-1 text-xs px-2 py-1.5 rounded outline-none min-w-0"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }} />
        <button onClick={() => setOpen(true)} title="Browse Media"
          className="flex-shrink-0 px-2 py-1.5 rounded text-xs font-medium transition-colors"
          style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', whiteSpace: 'nowrap' }}>
          Browse
        </button>
      </div>
      {open && <MediaPickerModal accept="video" onSelect={url => { onChange(url); setOpen(false) }} onClose={() => setOpen(false)} />}
    </>
  )
}

function MediaPickerModal({ accept, onSelect, onClose }: { accept: 'image' | 'video' | 'any'; onSelect: (url: string) => void; onClose: () => void }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useState(() => {
    api.get('/media').then(({ data }) => {
      setItems(data.data || data)
    }).finally(() => setLoading(false))
  })

  const filtered = items.filter(item => {
    const nameMatch = (item.original_name || item.name || '').toLowerCase().includes(search.toLowerCase())
    const typeMatch = accept === 'any' || item.type === accept
    return nameMatch && typeMatch
  })

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', maxHeight: '80vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <p className="font-semibold text-white text-sm">
            {accept === 'image' ? 'Choose Image' : accept === 'video' ? 'Choose Video' : 'Choose Media'}
          </p>
          <button onClick={onClose} className="p-1 rounded text-slate-500 hover:text-white"><X size={16} /></button>
        </div>
        {/* Search */}
        <div className="px-4 py-3 flex-shrink-0 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
            <Search size={13} className="text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search media..."
              className="flex-1 outline-none text-sm bg-transparent text-slate-200 placeholder-slate-500" />
          </div>
        </div>
        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-lg animate-pulse" style={{ background: 'var(--color-surface-3)' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <Image size={36} style={{ color: '#334155' }} />
              <p className="text-sm text-slate-500">{search ? 'No results' : `No ${accept === 'any' ? 'media' : accept + 's'} in your library yet`}</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {filtered.map(item => (
                <button key={item.id} onClick={() => onSelect(item.url)}
                  className="group relative aspect-square rounded-lg overflow-hidden transition-all hover:scale-105 hover:ring-2 hover:ring-indigo-500"
                  style={{ background: 'var(--color-surface-3)' }}>
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.original_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                      <Film size={20} style={{ color: '#6366f1' }} />
                      <span className="text-[9px] text-slate-400 px-1 truncate w-full text-center">{item.original_name}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    style={{ background: 'rgba(99,102,241,0.5)' }}>
                    <span className="text-white text-xs font-semibold">Select</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ListEditor({ items, onAdd, renderItem }: { items: any[]; onAdd: () => void; renderItem: (item: any, idx: number) => React.ReactNode }) {
  return (
    <div>
      {items.map((item, idx) => renderItem(item, idx))}
      <button onClick={onAdd}
        className="flex items-center gap-1.5 w-full py-1.5 px-2 rounded text-xs mt-1 transition-colors"
        style={{ border: '1px dashed rgba(99,102,241,0.4)', color: '#818cf8' }}>
        <Plus size={12} /> Add item
      </button>
    </div>
  )
}

function ItemCard({ children, onUp, onDown, onRemove, horizontal }: { children: React.ReactNode; onUp: () => void; onDown: () => void; onRemove: () => void; horizontal?: boolean }) {
  return (
    <div className="rounded-lg p-2 mb-1.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-1 mb-1.5">
        <ReorderBtns onUp={onUp} onDown={onDown} />
        <button onClick={onRemove} className="ml-auto p-0.5 text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={11} /></button>
      </div>
      <div className={`flex ${horizontal ? 'flex-row gap-1.5' : 'flex-col gap-1.5'}`}>{children}</div>
    </div>
  )
}

function ReorderBtns({ onUp, onDown }: { onUp: () => void; onDown: () => void }) {
  return (
    <div className="flex gap-0.5">
      <button onClick={onUp} className="p-0.5 text-slate-600 hover:text-slate-300 transition-colors"><ChevronUp size={11} /></button>
      <button onClick={onDown} className="p-0.5 text-slate-600 hover:text-slate-300 transition-colors"><ChevronDown size={11} /></button>
    </div>
  )
}
