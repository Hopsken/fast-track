interface AdfTextNode {
  type: 'text'
  text: string
}

interface AdfParagraphNode {
  type: 'paragraph'
  content: AdfTextNode[]
}

interface AdfDoc {
  type: 'doc'
  version: 1
  content: AdfParagraphNode[]
}

/** Plain text → ADF document. Splits on newlines into separate paragraphs. */
export function textToAdf(text: string): AdfDoc {
  const lines = text.split('\n')
  const content: AdfParagraphNode[] = lines.map((line) => ({
    type: 'paragraph',
    content: line.length > 0 ? [{ type: 'text', text: line }] : []
  }))
  return { type: 'doc', version: 1, content }
}

/** ADF document → plain text. Returns null for non-ADF input. */
export function adfToText(doc: unknown): string | null {
  if (
    typeof doc !== 'object' ||
    doc === null ||
    (doc as AdfDoc).type !== 'doc' ||
    !Array.isArray((doc as AdfDoc).content)
  ) {
    return null
  }

  return (doc as AdfDoc).content
    .map((node) => {
      if (!Array.isArray(node.content)) return ''
      return node.content
        .filter((child) => child.type === 'text')
        .map((child) => child.text)
        .join('')
    })
    .join('\n')
}
