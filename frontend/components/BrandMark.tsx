import Link from 'next/link'

/* Camera-aperture lens mark */
export function Aperture({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="14.31" y1="8" x2="20.05" y2="17.94" />
      <line x1="9.69" y1="8" x2="21.17" y2="8" />
      <line x1="7.38" y1="12" x2="13.12" y2="2.06" />
      <line x1="9.69" y1="16" x2="3.95" y2="6.06" />
      <line x1="14.31" y1="16" x2="2.83" y2="16" />
      <line x1="16.62" y1="12" x2="10.88" y2="21.94" />
    </svg>
  )
}

export default function BrandMark({
  href = '/',
  wordmark = true,
  size = 'md',
}: {
  href?: string | null
  wordmark?: boolean
  size?: 'sm' | 'md'
}) {
  const ap = size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'

  const inner = (
    <span className="flex items-center gap-2.5 group">
      <span className={`text-fg/85 group-hover:rotate-90 transition-transform duration-500`}>
        <Aperture className={ap} />
      </span>
      {wordmark && (
        <span className="text-fg text-[1.05rem] font-semibold tracking-tight leading-none">
          MeetVault
        </span>
      )}
    </span>
  )

  if (href === null) return inner
  return <Link href={href}>{inner}</Link>
}
