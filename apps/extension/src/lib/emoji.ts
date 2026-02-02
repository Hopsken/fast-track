// Extract leading emoji and also return the remaining (cluttered) string.
export function extractLeadingEmoji(str: string) {
  if (typeof str !== 'string') return { emoji: '', rest: '' }

  const re =
    /^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|\p{Emoji_Modifier}|\u20E3)*)/u

  const m = str.match(re)
  const emoji = m?.[1] ?? ''
  const rest = emoji ? str.slice(emoji.length) : str

  return { emoji, rest }
}

// Boolean helper
export function startsWithEmoji(str: string) {
  return extractLeadingEmoji(str).emoji !== ''
}
