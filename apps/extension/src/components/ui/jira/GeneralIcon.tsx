interface GeneralIconProps {
  iconUrl: string
  alt: string
  rounded?: boolean
  size?: string
  className?: string
}

export function GeneralIcon({
  iconUrl,
  alt,
  rounded,
  size = '1rem',
  className = ''
}: GeneralIconProps) {
  return (
    <div className={className}>
      <img
        alt={alt}
        src={iconUrl}
        className={rounded ? 'rounded-full' : 'rounded'}
        style={{ width: size, height: size }}
        title={alt}
      />
    </div>
  )
}
