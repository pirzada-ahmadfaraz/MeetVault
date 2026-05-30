import Reveal from './Reveal'

const FEATURES = [
  { n: '01', title: 'HD video', body: 'Multi-party calls that stay crisp and in sync, even when the room fills up.' },
  { n: '02', title: 'Screen share', body: 'Present a tab, a window, or your whole screen — smooth, at full resolution.' },
  { n: '03', title: 'Live chat', body: 'Message, react and reply alongside the call, without breaking the conversation.' },
  { n: '04', title: 'Recording', body: 'Capture the session and pick up the details you missed, exactly as they happened.' },
  { n: '05', title: 'Private rooms', body: 'Authenticated, password-optional rooms. Your meeting stays yours.' },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 sm:py-40">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        <Reveal className="mb-16 sm:mb-24 max-w-2xl">
          <p className="eyebrow text-faint mb-6">What's inside</p>
          <h2 className="font-display font-light text-4xl sm:text-6xl leading-[1.05] tracking-[-0.02em]">
            Everything you need.
            <br />
            <span className="serif-italic text-muted">Nothing you don't.</span>
          </h2>
        </Reveal>

        <div>
          {FEATURES.map((f, i) => (
            <Reveal key={f.n} delay={i * 70}>
              <div className="group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-8 items-baseline border-t border-white/10 py-9 sm:py-11">
                <div className="md:col-span-2 font-display italic text-2xl text-faint">{f.n}</div>
                <h3 className="md:col-span-3 text-xl sm:text-2xl font-medium tracking-tight transition-transform duration-500 group-hover:translate-x-1">{f.title}</h3>
                <p className="md:col-span-7 text-muted leading-relaxed max-w-xl">{f.body}</p>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-white/10" />
        </div>
      </div>
    </section>
  )
}
