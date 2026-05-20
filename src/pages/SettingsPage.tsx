import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import api from '../services/api'
import { motion } from 'framer-motion'
import {
  User, Lock, Bell, Palette, ShieldAlert,
  Eye, EyeOff, Check, Monitor, Moon, Sun,
  Mail, Globe, Zap, Save, Minimize2, Maximize2,
  Activity, Type
} from 'lucide-react'
import {
  ACCENT_OPTIONS, THEME_OPTIONS,
  applyAccent, applyTheme, applyDensity, applyReducedMotion
} from '../utils/appearance'

type Tab = 'profile' | 'security' | 'notifications' | 'appearance'

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'profile',       label: 'Profile',       icon: User       },
  { key: 'security',      label: 'Security',       icon: Lock       },
  { key: 'notifications', label: 'Notifications',  icon: Bell       },
  { key: 'appearance',    label: 'Appearance',     icon: Palette    },
]

// ─── Reusable input ──────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  )
}

function DarkInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-200 outline-none transition-all focus:ring-1 focus:ring-indigo-500"
      style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)', ...props.style as React.CSSProperties }} />
  )
}

function DarkTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props}
      className="w-full px-3 py-2.5 rounded-lg text-sm text-slate-200 outline-none resize-none transition-all focus:ring-1 focus:ring-indigo-500"
      style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }} />
  )
}

// ─── Password field with show/hide ───────────────────────────────────────────
function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <DarkInput type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={{ paddingRight: 40 }} />
      <button type="button" onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  )
}

// ─── Toggle ──────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
      style={{ background: checked ? '#6366f1' : 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
      <span className="absolute top-0.5 transition-all w-4 h-4 rounded-full bg-white shadow"
        style={{ left: checked ? 20 : 2 }} />
    </button>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
      <div>
        <h2 className="font-semibold text-white">{title}</h2>
        {desc && <p className="text-sm text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore()
  const [tab, setTab] = useState<Tab>('profile')

  // Profile
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [saving, setSaving] = useState(false)

  // Security
  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [conPw, setConPw] = useState('')
  const [changingPw, setChangingPw] = useState(false)

  // Notifications — stored in localStorage
  const [notifs, setNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('jaycms.notifs') || '{}') }
    catch { return {} }
  })
  const setNotif = (key: string, val: boolean) => {
    const next = { ...notifs, [key]: val }
    setNotifs(next)
    localStorage.setItem('jaycms.notifs', JSON.stringify(next))
  }

  // Appearance — live-applied via CSS vars, persisted in localStorage
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('jaycms.accent') || '#6366f1')
  const [appTheme,    setAppTheme]    = useState(() => localStorage.getItem('jaycms.theme') || 'dark')
  const [density,     setDensity]     = useState(() => localStorage.getItem('jaycms.density') || 'comfortable')
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('jaycms.reducedMotion') === 'true')

  const handleAccent = (color: string) => {
    setAccentColor(color)
    localStorage.setItem('jaycms.accent', color)
    applyAccent(color)
    toast.success('Accent color applied!')
  }
  const handleTheme = (key: string) => {
    setAppTheme(key)
    localStorage.setItem('jaycms.theme', key)
    applyTheme(key)
    toast.success('Theme applied!')
  }
  const handleDensity = (key: string) => {
    setDensity(key)
    localStorage.setItem('jaycms.density', key)
    applyDensity(key)
    toast.success(`${key === 'compact' ? 'Compact' : 'Comfortable'} density applied!`)
  }
  const handleReducedMotion = (val: boolean) => {
    setReducedMotion(val)
    localStorage.setItem('jaycms.reducedMotion', String(val))
    applyReducedMotion(val)
  }

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      await updateProfile({ name, bio })
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!curPw) { toast.error('Enter current password'); return }
    if (newPw.length < 8) { toast.error('New password must be at least 8 characters'); return }
    if (newPw !== conPw) { toast.error('Passwords do not match'); return }
    setChangingPw(true)
    try {
      await api.post('/auth/change-password', {
        current_password: curPw,
        new_password: newPw,
        new_password_confirmation: conPw,
      })
      toast.success('Password changed!')
      setCurPw(''); setNewPw(''); setConPw('')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally { setChangingPw(false) }
  }

  const ACCENT_COLORS = ACCENT_OPTIONS

  return (
    <div className="flex h-full" style={{ background: 'var(--color-surface)' }}>
      {/* Left nav */}
      <div className="w-52 flex-shrink-0 p-4 space-y-1" style={{ borderRight: '1px solid var(--color-border)' }}>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 px-3 pb-2">Settings</p>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
            style={tab === key
              ? { background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderLeft: '2px solid #6366f1' }
              : { color: '#64748b' }}>
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 max-w-2xl">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
          className="space-y-6">

          {/* ── Profile ── */}
          {tab === 'profile' && (
            <>
              <div>
                <h1 className="text-xl font-bold text-white">Profile</h1>
                <p className="text-sm text-slate-500 mt-0.5">Your public profile information</p>
              </div>

              <Card title="Personal Info" desc="Your name and bio shown across the platform">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 select-none"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, #7c3aed)` }}>
                    {(user?.name?.[0] || '?').toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user?.name}</p>
                    <p className="text-sm text-slate-400">{user?.email}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>

                <form onSubmit={saveProfile} className="space-y-4">
                  <Field label="Full Name">
                    <DarkInput value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                  </Field>
                  <Field label="Bio" hint="Brief description shown on your profile">
                    <DarkTextarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself..." />
                  </Field>
                  <div className="flex items-center gap-3">
                    <Field label="Email address">
                      <DarkInput value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                    </Field>
                  </div>
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-all"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                    <Save size={14} />
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>
              </Card>
            </>
          )}

          {/* ── Security ── */}
          {tab === 'security' && (
            <>
              <div>
                <h1 className="text-xl font-bold text-white">Security</h1>
                <p className="text-sm text-slate-500 mt-0.5">Manage your password and account security</p>
              </div>

              <Card title="Change Password" desc="Use a strong, unique password">
                <form onSubmit={changePassword} className="space-y-4">
                  <Field label="Current Password">
                    <PasswordInput value={curPw} onChange={setCurPw} placeholder="Enter current password" />
                  </Field>
                  <Field label="New Password" hint="Must be at least 8 characters">
                    <PasswordInput value={newPw} onChange={setNewPw} placeholder="Enter new password" />
                  </Field>
                  <Field label="Confirm New Password">
                    <PasswordInput value={conPw} onChange={setConPw} placeholder="Re-enter new password" />
                  </Field>

                  {/* Strength indicator */}
                  {newPw.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-1 flex-1 rounded-full transition-colors"
                            style={{ background: newPw.length >= i * 2 ? (newPw.length >= 8 ? '#10b981' : '#f59e0b') : 'var(--color-surface-3)' }} />
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: newPw.length >= 8 ? '#10b981' : '#f59e0b' }}>
                        {newPw.length < 4 ? 'Too short' : newPw.length < 8 ? 'Weak' : newPw.length < 12 ? 'Good' : 'Strong'}
                      </p>
                    </div>
                  )}

                  <button type="submit" disabled={changingPw}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 transition-all"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                    <Lock size={14} />
                    {changingPw ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </Card>

              <Card title="Account Info" desc="Your account details">
                <div className="space-y-3">
                  {[
                    { label: 'Account ID',    value: `#${user?.id || '—'}` },
                    { label: 'Role',          value: user?.role || 'user' },
                    { label: 'Account Email', value: user?.email || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ background: 'var(--color-surface-3)' }}>
                      <span className="text-sm text-slate-400">{label}</span>
                      <span className="text-sm font-medium text-white capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="rounded-2xl p-6 space-y-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-red-400" />
                  <h2 className="font-semibold text-red-400">Danger Zone</h2>
                </div>
                <p className="text-sm text-slate-400">To permanently delete your account and all associated data, contact support. This action is irreversible.</p>
                <button className="px-4 py-2 rounded-lg text-sm font-semibold text-red-400 transition-all"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                  onClick={() => toast('Contact support to delete your account.', { icon: '⚠️' })}>
                  Delete Account
                </button>
              </div>
            </>
          )}

          {/* ── Notifications ── */}
          {tab === 'notifications' && (
            <>
              <div>
                <h1 className="text-xl font-bold text-white">Notifications</h1>
                <p className="text-sm text-slate-500 mt-0.5">Choose what you want to be notified about</p>
              </div>

              <Card title="Email Notifications" desc="Manage the emails you receive from Jay CMS">
                {([
                  { key: 'email_team_invite',   icon: Mail,  label: 'Team invitations',     desc: 'When someone adds you to a team' },
                  { key: 'email_site_published', icon: Globe, label: 'Site published',        desc: 'When your site goes live' },
                  { key: 'email_site_analytics', icon: Zap,  label: 'Weekly analytics digest', desc: 'Summary of your site performance' },
                ] as const).map(({ key, icon: Icon, label, desc }) => (
                  <div key={key} className="flex items-center justify-between gap-4 py-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg mt-0.5" style={{ background: 'var(--color-surface-3)' }}>
                        <Icon size={14} className="text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{label}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                    </div>
                    <Toggle checked={notifs[key] ?? true} onChange={v => setNotif(key, v)} />
                  </div>
                ))}
              </Card>

              <Card title="In-App Notifications" desc="Notifications shown inside the dashboard">
                {([
                  { key: 'app_save_success', label: 'Save confirmations', desc: 'Show toast when page is saved' },
                  { key: 'app_autosave',     label: 'Auto-save reminders', desc: 'Remind about unsaved changes' },
                  { key: 'app_tips',         label: 'Tips & suggestions',  desc: 'Helpful hints while building' },
                ] as const).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between gap-4 py-2">
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </div>
                    <Toggle checked={notifs[key] ?? true} onChange={v => setNotif(key, v)} />
                  </div>
                ))}
              </Card>
            </>
          )}

          {/* ── Appearance ── */}
          {tab === 'appearance' && (
            <>
              <div>
                <h1 className="text-xl font-bold text-white">Appearance</h1>
                <p className="text-sm text-slate-500 mt-0.5">Customize how Jay CMS looks for you</p>
              </div>

              {/* Accent Color */}
              <Card title="Accent Color" desc="Applied instantly across buttons, highlights and glows">
                <div className="flex flex-wrap gap-3 mb-3">
                  {ACCENT_COLORS.map(({ label, color }) => (
                    <button key={color} onClick={() => handleAccent(color)} title={label}
                      className="relative w-11 h-11 rounded-full transition-all hover:scale-110 flex items-center justify-center"
                      style={{
                        background: color,
                        boxShadow: accentColor === color ? `0 0 0 3px var(--color-surface-2), 0 0 0 5px ${color}` : 'none',
                        transform: accentColor === color ? 'scale(1.15)' : undefined,
                      }}>
                      {accentColor === color && <Check size={16} className="text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
                {/* Live preview strip */}
                <div className="flex items-center gap-3 p-3 rounded-xl mt-1" style={{ background: 'var(--color-surface-3)' }}>
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--color-primary)' }} />
                  <button className="text-xs px-3 py-1.5 rounded-lg text-white font-semibold" style={{ background: 'var(--color-primary)' }}>
                    Button
                  </button>
                  <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: 'var(--color-primary)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                    {ACCENT_COLORS.find(c => c.color === accentColor)?.label ?? 'Custom'}
                  </span>
                </div>
              </Card>

              {/* App Theme */}
              <Card title="App Theme" desc="Changes the surface colors throughout the dashboard">
                <div className="grid grid-cols-3 gap-3">
                  {THEME_OPTIONS.map(opt => (
                    <button key={opt.key} onClick={() => handleTheme(opt.key)}
                      className="relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                      style={appTheme === opt.key
                        ? { background: 'rgba(var(--color-primary-rgb),0.15)', border: '1px solid rgba(var(--color-primary-rgb),0.4)' }
                        : { background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
                      {/* Mini theme preview */}
                      <div className="w-full h-12 rounded-lg overflow-hidden flex flex-col gap-0.5 p-1.5" style={{ background: opt.s1 }}>
                        <div className="h-2 rounded w-3/4" style={{ background: opt.s2 }} />
                        <div className="flex gap-1 flex-1">
                          <div className="w-5 rounded" style={{ background: opt.s2 }} />
                          <div className="flex-1 rounded" style={{ background: opt.s3 }} />
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-white">{opt.label}</p>
                      <p className="text-[10px] text-slate-500 text-center leading-tight">{opt.desc}</p>
                      {appTheme === opt.key && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--color-primary)' }}>
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Interface Density */}
              <Card title="Interface Density" desc="Control how compact the dashboard looks">
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { key: 'comfortable', label: 'Comfortable', desc: 'More spacing, easier to read', icon: Maximize2 },
                    { key: 'compact',     label: 'Compact',     desc: 'Tighter layout, more content', icon: Minimize2 },
                  ] as const).map(({ key, label, desc, icon: Icon }) => (
                    <button key={key} onClick={() => handleDensity(key)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left"
                      style={density === key
                        ? { background: 'rgba(var(--color-primary-rgb),0.15)', border: '1px solid rgba(var(--color-primary-rgb),0.35)' }
                        : { background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
                      <Icon size={18} style={{ color: density === key ? 'var(--color-primary)' : '#64748b' }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{label}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                      {density === key && <Check size={13} style={{ color: 'var(--color-primary)' }} />}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Builder Canvas */}
              <Card title="Builder Canvas Theme" desc="Default background for the page builder canvas">
                <div className="flex flex-col gap-2">
                  {([
                    { key: 'dark',  icon: Moon,    label: 'Dark canvas',  bg: '#08080f', preview: '#1a1a2e' },
                    { key: 'light', icon: Sun,     label: 'Light canvas', bg: '#f8fafc', preview: '#e2e8f0' },
                    { key: 'grid',  icon: Monitor, label: 'Grid canvas',  bg: '#0d0d17', preview: '#1a1a2a' },
                  ] as const).map(({ key, icon: Icon, label, bg, preview }) => {
                    const saved = localStorage.getItem('jaycms.canvas') || 'dark'
                    return (
                      <button key={key} onClick={() => { localStorage.setItem('jaycms.canvas', key); toast.success(`${label} saved`) }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                        style={saved === key
                          ? { background: 'rgba(var(--color-primary-rgb),0.15)', border: '1px solid rgba(var(--color-primary-rgb),0.35)' }
                          : { background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
                        <div className="w-10 h-7 rounded-lg flex-shrink-0 overflow-hidden border border-white/10" style={{ background: bg }}>
                          <div className="h-full flex gap-0.5 p-0.5">
                            <div className="w-3 rounded-sm" style={{ background: preview }} />
                            <div className="flex-1 rounded-sm" style={{ background: preview, opacity: 0.5 }} />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-white flex-1">{label}</span>
                        {saved === key && <Check size={13} style={{ color: 'var(--color-primary)' }} />}
                      </button>
                    )
                  })}
                </div>
              </Card>

              {/* Accessibility */}
              <Card title="Accessibility" desc="Make Jay CMS work better for your needs">
                <div className="flex items-center justify-between gap-4 py-2">
                  <div className="flex items-center gap-3">
                    <Activity size={16} className="text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Reduce motion</p>
                      <p className="text-xs text-slate-500">Disable animations and transitions throughout the app</p>
                    </div>
                  </div>
                  <Toggle checked={reducedMotion} onChange={v => handleReducedMotion(v)} />
                </div>
              </Card>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
