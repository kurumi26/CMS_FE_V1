export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  bio?: string
  role?: string
  created_at: string
}

export interface Site {
  id: number
  user_id: number
  team_id?: number
  name: string
  slug: string
  description?: string
  domain?: string
  thumbnail?: string
  status: 'draft' | 'published' | 'archived'
  settings?: Record<string, any>
  seo?: Record<string, any>
  branding?: Record<string, any>
  pages?: Page[]
  pages_count?: number
  created_at: string
  updated_at: string
}

export interface Page {
  id: number
  site_id: number
  parent_id?: number
  title: string
  slug: string
  content?: PageContent
  meta_title?: string
  meta_description?: string
  og_image?: string
  status: 'draft' | 'published'
  order: number
  is_homepage: boolean
  created_at: string
  updated_at: string
}

export interface PageContent {
  sections: Section[]
}

export interface Section {
  id: string
  type: SectionType
  order: number
  content: Record<string, any>
  settings: SectionSettings
}

export type SectionType =
  | 'hero'
  | 'features'
  | 'about'
  | 'testimonials'
  | 'contact'
  | 'gallery'
  | 'pricing'
  | 'cta'
  | 'text'
  | 'image'
  | 'video'
  | 'divider'
  | 'spacer'
  | 'html'
  | 'navbar'
  | 'footer'
  | 'blog'
  | 'team'
  | 'stats'
  | 'faq'
  | 'form'

export interface SectionSettings {
  background?: string
  primaryColor?: string
  textColor?: string
  positionMode?: 'flow' | 'free' | string
  positionX?: number
  positionY?: number
  frameWidth?: number | string
  frameHeight?: number | string
  zIndex?: number
  paddingTop?: number | string
  paddingBottom?: number | string
  paddingLeft?: number | string
  paddingRight?: number | string
  marginTop?: number | string
  marginBottom?: number | string
  maxWidth?: number | string
  borderRadius?: string
  columns?: number
  layout?: string
  navAlignment?: 'left' | 'center' | 'right' | string
  navLogoPosition?: 'left' | 'center' | 'right' | string
  navSticky?: boolean
  navHeight?: number
  navLogoSize?: number
  navLinkGap?: number
  navCtaStyle?: 'solid' | 'outline' | 'ghost' | string
  minHeight?: number | string
  frameHeightFixed?: boolean
  animation?: string
  animationDelay?: number
  hidden?: boolean
  hiddenMobile?: boolean
  hiddenTablet?: boolean
  hiddenOnMobile?: boolean
  hiddenOnTablet?: boolean
}

export interface Template {
  id: number
  name: string
  slug: string
  description?: string
  thumbnail?: string
  category: string
  content: PageContent
  settings?: Record<string, any>
  is_premium: boolean
  is_active: boolean
  use_count: number
}

export interface Media {
  id: number
  user_id: number
  site_id?: number
  name: string
  original_name: string
  path: string
  url: string
  mime_type: string
  type: 'image' | 'video' | 'audio' | 'document'
  size: number
  width?: number
  height?: number
  alt?: string
  alt_text?: string
  file_name?: string
  created_at: string
}

export interface Team {
  id: number
  owner_id: number
  name: string
  slug: string
  description?: string
  logo?: string
  members?: TeamMember[]
  members_count?: number
}

export interface TeamMember extends User {
  pivot: { role: 'admin' | 'editor' | 'viewer' }
}

export interface PageVersion {
  id: number
  page_id: number
  user_id: number
  content: PageContent
  label?: string
  user?: User
  created_at: string
}

export interface AnalyticsOverview {
  total_views: number
  unique_visitors: number
  today_views: number
  yesterday_views: number
  by_day: { date: string; views: number }[]
  top_pages: { page_slug: string; views: number }[]
  devices: { device: string; count: number }[]
}
