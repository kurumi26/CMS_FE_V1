import type { Section } from '../../../types'
import { Code2 } from 'lucide-react'

interface Props { section: Section }

export default function HtmlSection({ section }: Props) {
  const { content } = section
  if (!content.code) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: '#64748b' }}>
        <Code2 size={28} />
        <p className="text-sm">Add HTML code in the Content panel</p>
      </div>
    )
  }
  return (
    <div
      className="w-full"
      dangerouslySetInnerHTML={{ __html: content.code }}
    />
  )
}
