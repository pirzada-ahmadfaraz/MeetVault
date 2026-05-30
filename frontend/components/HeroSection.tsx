import Link from 'next/link'
import {
  MicrophoneIcon,
  VideoCameraIcon,
  ComputerDesktopIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'

const SPEAKERS = [
  { initials: 'MT', label: 'Marcus' },
  { initials: 'AR', label: 'Aisha' },
  { initials: 'JL', label: 'Jonas' },
]

export default function HeroSection() {
  return (
    <section className="relative pt-44 pb-28">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        {/* headline */}
        <h1 className="font-display font-light tracking-[-0.02em] text-fg text-[2.9rem] leading-[1.04] sm:text-6xl lg:text-[5rem] lg:leading-[0.98]">
          <span className="block reveal-load" style={{ animationDelay: '120ms' }}>A video room that</span>
          <span className="block reveal-load" style={{ animationDelay: '210ms' }}>
            gets <span className="serif-italic">out of the way.</span>
          </span>
        </h1>

        {/* sub */}
        <p className="mt-9 max-w-xl text-lg text-muted leading-relaxed reveal-load" style={{ animationDelay: '320ms' }}>
          HD video, screen share and chat — stripped back to what matters, and nothing else.
        </p>

        {/* actions */}
        <div className="mt-10 flex items-center gap-7 reveal-load" style={{ animationDelay: '400ms' }}>
          <Link href="/auth/register" className="btn-solid rounded-full px-7 py-3.5 text-sm">
            Start a room
          </Link>
          <Link href="/auth/login" className="btn-line pb-0.5 text-sm">
            Sign in
          </Link>
        </div>
      </div>

      {/* product frame */}
      <div className="mt-24 max-w-6xl mx-auto px-5 sm:px-6">
        <div className="reveal-load" style={{ animationDelay: '520ms' }}>
          <div className="panel rounded-[1.4rem] p-2.5 sm:p-3">
            <div className="relative aspect-[16/9] rounded-[1rem] overflow-hidden bg-[#0d0d0f]">
              {/* layout: main speaker + filmstrip */}
              <div className="absolute inset-0 grid grid-cols-1 sm:grid-cols-[1fr_clamp(120px,22%,200px)] gap-2.5 p-2.5">
                {/* main */}
                <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-950 hidden sm:flex items-center justify-center">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/12 text-fg/70 font-display text-2xl">SK</span>
                  {/* rec */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full rounded-full bg-[#ff4d52] opacity-60 rec-blink" /><span className="relative h-1.5 w-1.5 rounded-full bg-[#ff4d52]" /></span>
                    <span className="eyebrow text-[0.5rem] text-white/55">Rec · 14:32</span>
                  </div>
                  <span className="absolute bottom-3.5 left-3.5 text-[0.7rem] text-white/70">Sarah Kelly</span>
                </div>

                {/* filmstrip */}
                <div className="grid grid-rows-3 gap-2.5">
                  {SPEAKERS.map((s) => (
                    <div key={s.initials} className="relative rounded-xl overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-fg/60 font-display text-sm">{s.initials}</span>
                      <span className="absolute bottom-2 left-2.5 text-[0.6rem] text-white/55">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* control bar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md px-2 py-1.5">
                {[MicrophoneIcon, VideoCameraIcon, ComputerDesktopIcon, ChatBubbleLeftRightIcon].map((Icon, i) => (
                  <span key={i} className="h-8 w-8 rounded-full flex items-center justify-center text-white/65 hover:text-white transition-colors">
                    <Icon className="w-4 h-4" />
                  </span>
                ))}
                <span className="ml-1 h-8 px-3.5 rounded-full bg-[#ff4d52] text-white text-[0.7rem] font-medium flex items-center">Leave</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
