// ─── Appearance Settings ──────────────────────────────────────────────────────
// Centralizes all appearance-related logic so settings are applied both on
// startup (from localStorage) and immediately when the user changes them.

export interface AccentOption {
  label: string
  color: string
  dark: string
  gradient: string
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { label: 'Indigo',  color: '#6366f1', dark: '#4f46e5', gradient: '#6366f1,#4f46e5' },
  { label: 'Violet',  color: '#8b5cf6', dark: '#7c3aed', gradient: '#8b5cf6,#7c3aed' },
  { label: 'Pink',    color: '#ec4899', dark: '#db2777', gradient: '#ec4899,#db2777' },
  { label: 'Cyan',    color: '#06b6d4', dark: '#0891b2', gradient: '#06b6d4,#0891b2' },
  { label: 'Emerald', color: '#10b981', dark: '#059669', gradient: '#10b981,#059669' },
  { label: 'Amber',   color: '#f59e0b', dark: '#d97706', gradient: '#f59e0b,#d97706' },
]

export interface ThemeOption {
  key: string
  label: string
  desc: string
  s1: string; s2: string; s3: string; border: string
}

export const THEME_OPTIONS: ThemeOption[] = [
  { key: 'dark',   label: 'Dark',   desc: 'Classic dark theme',  s1: '#0f0f14', s2: '#16161d', s3: '#1e1e28', border: 'rgba(255,255,255,0.08)' },
  { key: 'amoled', label: 'AMOLED', desc: 'True black for OLED', s1: '#000000', s2: '#0a0a0a', s3: '#111118', border: 'rgba(255,255,255,0.06)' },
  { key: 'dim',    label: 'Dim',    desc: 'Softer dark for eyes', s1: '#1a1a24', s2: '#22222e', s3: '#2a2a38', border: 'rgba(255,255,255,0.10)' },
]

// Apply accent color as CSS custom properties
export function applyAccent(color: string) {
  const opt = ACCENT_OPTIONS.find(o => o.color === color) ?? ACCENT_OPTIONS[0]
  const r = document.documentElement
  r.style.setProperty('--color-primary', opt.color)
  r.style.setProperty('--color-primary-dark', opt.dark)
  r.style.setProperty('--color-primary-gradient', `linear-gradient(135deg, ${opt.color}, ${opt.dark})`)
  // Update rgba shadow helper (used by glows)
  const hex = opt.color.replace('#', '')
  const ri = parseInt(hex.substring(0, 2), 16)
  const gi = parseInt(hex.substring(2, 4), 16)
  const bi = parseInt(hex.substring(4, 6), 16)
  r.style.setProperty('--color-primary-rgb', `${ri},${gi},${bi}`)
}

// Apply surface theme (dark / amoled / dim)
export function applyTheme(key: string) {
  const opt = THEME_OPTIONS.find(o => o.key === key) ?? THEME_OPTIONS[0]
  const r = document.documentElement
  r.style.setProperty('--color-surface',   opt.s1)
  r.style.setProperty('--color-surface-2', opt.s2)
  r.style.setProperty('--color-surface-3', opt.s3)
  r.style.setProperty('--color-border',    opt.border)
  document.body.style.background = opt.s1
}

// Apply compact / comfortable density
export function applyDensity(density: string) {
  document.body.classList.remove('density-comfortable', 'density-compact')
  document.body.classList.add(density === 'compact' ? 'density-compact' : 'density-comfortable')
}

// Apply reduced-motion preference
export function applyReducedMotion(enabled: boolean) {
  document.documentElement.setAttribute('data-reduced-motion', enabled ? 'true' : 'false')
}

// Apply every setting from localStorage — call this once on startup
export function applyAllSettings() {
  applyAccent(localStorage.getItem('jaycms.accent') ?? '#6366f1')
  applyTheme(localStorage.getItem('jaycms.theme') ?? 'dark')
  applyDensity(localStorage.getItem('jaycms.density') ?? 'comfortable')
  applyReducedMotion(localStorage.getItem('jaycms.reducedMotion') === 'true')
}
