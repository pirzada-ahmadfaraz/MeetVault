import Link from 'next/link'
import Reveal from './Reveal'

export default function CTASection() {
  return (
    <section className="py-32 sm:py-44">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        <Reveal>
          <p className="eyebrow text-faint mb-7">Ready when you are</p>
          <h2 className="font-display font-light text-5xl sm:text-7xl lg:text-[5.5rem] leading-[0.98] tracking-[-0.025em] max-w-3xl">
            Start a room in <span className="serif-italic">seconds.</span>
          </h2>
          <div className="mt-12 flex items-center gap-8">
            <Link href="/auth/register" className="btn-solid rounded-full px-8 py-4 text-sm">Start a room</Link>
            <Link href="/auth/login" className="btn-line pb-0.5 text-sm">Sign in</Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
