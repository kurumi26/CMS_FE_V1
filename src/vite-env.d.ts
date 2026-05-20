/// <reference types="vite/client" />

// Silence TS2882 — Vite handles CSS imports at build time
declare module '*.css' {
  const content: string
  export default content
}
