type ADFNode = {
  type?: string
  text?: string
  content?: ADFNode[]
}

function toPlainTextFromNode(node: ADFNode | undefined): string {
  if (!node) return ''

  const content = node.content ?? []
  const childrenText = () => content.map(toPlainTextFromNode).join('')

  switch (node.type) {
    case 'text':
      return node.text ?? ''
    case 'hardBreak':
      return '\n'
    case 'paragraph':
    case 'heading':
    case 'blockquote': {
      const text = childrenText().trim()
      return text ? `${text}\n` : ''
    }
    case 'codeBlock': {
      const text = childrenText().trimEnd()
      return text ? `${text}\n` : ''
    }
    case 'bulletList': {
      const items = content
        .map((n) => toPlainTextFromNode(n).trim())
        .filter(Boolean)
        .map((t) => `- ${t}`)
      return items.length ? `${items.join('\n')}\n` : ''
    }
    case 'orderedList': {
      const items = content
        .map((n) => toPlainTextFromNode(n).trim())
        .filter(Boolean)
        .map((t, idx) => `${idx + 1}. ${t}`)
      return items.length ? `${items.join('\n')}\n` : ''
    }
    case 'listItem': {
      // listItem usually contains paragraph nodes
      return childrenText().replace(/\n+/g, ' ').trim() + '\n'
    }
    default:
      return childrenText()
  }
}

/**
 * Convert Atlassian Document Format (ADF) into a human-readable plain text.
 *
 * This is intentionally lossy and only used for list previews.
 */
export function adfToPlainText(adf: unknown): string {
  if (!adf || typeof adf !== 'object') return ''

  const root = adf as ADFNode
  const text = toPlainTextFromNode(root)

  return text.replace(/\n{3,}/g, '\n\n').trim()
}
