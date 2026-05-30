import Link from 'next/link'
import BrandMark from './BrandMark'

const navigation = {
  product: [
    { name: 'Features', href: '#features' },
    { name: 'Sign Up', href: '/auth/register' },
    { name: 'Sign In', href: '/auth/login' },
  ],
  legal: [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-6">
            <BrandMark href="/" />
            <p className="text-muted mt-5 max-w-xs text-sm leading-relaxed">
              A quieter way to meet — HD video, screen share and chat, stripped back to what matters.
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="eyebrow text-faint mb-5 text-[0.58rem]">Product</h3>
            <ul className="space-y-3.5">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-muted hover:text-fg transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="eyebrow text-faint mb-5 text-[0.58rem]">Legal</h3>
            <ul className="space-y-3.5">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm text-muted hover:text-fg transition-colors">{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-7 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-faint">© 2025 Ahmad Faraz</p>
          <p className="text-xs text-faint">Built with Next.js &amp; WebRTC</p>
        </div>
      </div>
    </footer>
  )
}
