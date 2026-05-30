'use client'

import CountUp from './CountUp'
import Reveal from './Reveal'

const STATS = [
  { value: <CountUp to={42} suffix="ms" />, label: 'Median latency' },
  { value: <CountUp to={60} suffix="fps" />, label: 'Video & screen' },
  { value: <CountUp to={99.9} decimals={1} suffix="%" />, label: 'Uptime' },
  { value: <CountUp to={256} suffix="-bit" />, label: 'Encryption' },
]

export default function StatsSection() {
  return (
    <section className="border-y border-white/10">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-16 grid grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6">
        {STATS.map((s, i) => (
          <Reveal key={i} delay={i * 80}>
            <div className="font-display font-light text-4xl sm:text-5xl tracking-tight tabular-nums">{s.value}</div>
            <div className="eyebrow text-faint mt-3 text-[0.58rem]">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
