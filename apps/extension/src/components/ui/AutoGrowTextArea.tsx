/* ------------------------------------------------------------------ */
/*  Auto-growing textarea (borderless, for inline editing)             */
/* ------------------------------------------------------------------ */

import { useRef, useCallback } from '#imports'

export function AutoGrowTextarea({
  value,
  onChange,
  placeholder,
  className
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const handleInput = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={handleInput}
      placeholder={placeholder}
      className={className}
    />
  )
}
