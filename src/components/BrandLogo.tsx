import { useState } from 'react'

type BrandLogoProps = {
  size: number
  alt?: string
  className?: string
}

export default function BrandLogo({ size, alt = 'Jay CMS logo', className }: BrandLogoProps) {
  const [src, setSrc] = useState('/logo.png')
  const [broken, setBroken] = useState(false)

  if (broken) {
    return (
      <div
        aria-label={alt}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: Math.max(8, Math.round(size * 0.22)),
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.max(12, Math.round(size * 0.34)),
          fontWeight: 800,
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        C
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0 }}
      onError={() => {
        if (src !== '/favicon.svg') {
          setSrc('/favicon.svg')
          return
        }
        setBroken(true)
      }}
    />
  )
}