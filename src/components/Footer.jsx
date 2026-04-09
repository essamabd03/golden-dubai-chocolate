export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-primary text-background/80 font-body mt-auto">

      {/* Warm top divider stripe */}
      <div
        className="h-1 w-full"
        style={{ background: 'linear-gradient(90deg, #C9933A 0%, #8B5E1A 50%, #C9933A 100%)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-start md:justify-between gap-8">

        {/* Brand column */}
        <div className="max-w-xs">
          <p className="font-heading text-accent-light text-xl mb-1">
            Golden Dubai Chocolate
          </p>
          <p className="text-sm leading-relaxed opacity-70 mb-4">
            Handcrafted with love. Pistachio kataifi Dubai-style bars, made
            fresh in small batches for local pickup.
          </p>
          {/* Social links */}
          <div className="flex gap-5">
            <a
              href="#"
              aria-label="Instagram"
              className="text-sm opacity-60 hover:opacity-100 hover:text-accent-light transition-all duration-150 hover:scale-105"
            >
              Instagram
            </a>
            <a
              href="#"
              aria-label="TikTok"
              className="text-sm opacity-60 hover:opacity-100 hover:text-accent-light transition-all duration-150 hover:scale-105"
            >
              TikTok
            </a>
          </div>
        </div>

        {/* Right: pickup note + contact */}
        <div className="flex flex-col gap-3">
          {/* Pickup location note */}
          <div className="flex items-start gap-2.5">
            <span className="text-accent mt-0.5" aria-hidden="true">📍</span>
            <p className="text-sm opacity-70 leading-relaxed max-w-xs">
              Pickup location provided after order confirmation.
            </p>
          </div>

          {/* Contact */}
          <div className="flex items-start gap-2.5">
            <span className="text-accent mt-0.5" aria-hidden="true">✉️</span>
            <p className="text-sm opacity-70">
              Questions?{' '}
              <a
                href="mailto:hello@goldendubai.com"
                className="underline underline-offset-2 hover:text-accent-light hover:opacity-100 transition-colors"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10 text-center py-4 text-xs opacity-40">
        &copy; {year} Golden Dubai Chocolate. All rights reserved.
      </div>
    </footer>
  )
}
