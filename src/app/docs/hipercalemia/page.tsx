import fs from 'fs'
import path from 'path'
import React from 'react'
import DocViewer from './DocViewer'

export const runtime = 'nodejs'
export const dynamic = 'force-static'

export default function Page() {
  const docsDir = path.resolve(process.cwd(), 'docs')
  let docs: { id: string; title: string; markdown: string }[] = []

  try {
    const files = fs.readdirSync(docsDir).filter(f => f.startsWith('fluxograma-') && f.endsWith('.md'))
    docs = files.map(file => {
      const md = fs.readFileSync(path.join(docsDir, file), 'utf8')
      const id = file.replace(/^fluxograma-/, '').replace(/\.md$/, '')
      const titleBase = id.replace(/-/g, ' ')
      const title = `🧪 ${titleBase.charAt(0).toUpperCase()}${titleBase.slice(1)}`
      return { id, title, markdown: md }
    })
  } catch {
    docs = [{ id: 'hipercalemia', title: '🧪 Hipercalemia', markdown: 'Documento não encontrado.' }]
  }

  return <DocViewer docs={docs} />
}
