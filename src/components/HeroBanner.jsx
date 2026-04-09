import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Default slides ────────────────────────────────────────────────────────────
// Each slide can have an optional `image` URL. When no image is supplied,
// a rich chocolate-toned CSS gradient is rendered instead so the banner
// always looks great even before real photography is uploaded.

const GRADIENT_SLIDES = [
  {
    id:       1,
    image:    null,
    gradient: 'linear-gradient(135deg, #1C0A00 0%, #3B1A08 40%, #5C2D0E 70%, #C9933A 100%)',
    headline: 'Handcrafted Chocolate.\nMade with Love.',
    sub:      'Premium Dubai-style chocolate with pistachio & kataifi — available for local pickup.',
    cta:      'Shop Now',
    ctaLink:  '/shop',
  },
  {
    id:       2,
    image:    null,
    gradient: 'linear-gradient(135deg, #3B1A08 0%, #C9933A 50%, #D9A95A 100%)',
    headline: 'Gift the Golden\nExperience.',
    sub:      'Luxury packaging included on every order. Perfect for any occasion.',
    cta:      'Browse Gifts',
    ctaLink:  '/shop',
  },
  {
    id:       3,
    image:    null,
    gradient: 'linear-gradient(135deg, #210E04 0%, #3B1A08 30%, #A87728 80%, #FAF6EF 100%)',
    headline: 'Small Batches.\nBig Flavour.',
    sub:      'Every piece handmade fresh to order. Pickup available daily.',
    cta:      'Order Today',
    ctaLink:  '/shop',
  },
]

const SLIDE_DURATION = 5000 // ms between auto-advances

/**
 * HeroBanner — full-width auto-rotating banner.
 *
 * Props:
 *   slides (array, optional) — override the default GRADIENT_SLIDES.
 *     Each slide: { id, image?, gradient?, headline, sub, cta, ctaLink }
 *   interval (number, optional) — ms between slides, default 5000.
 */
export default function HeroBanner({ slides = GRADIENT_SLIDES, interval = SLIDE_DURATION }) {
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)

  // Auto-advance
  useEffect(() => {
    if (paused || slides.length <= 1) return
    const id = setInterval(() => {
      setCurrent((i) => (i + 1) % slides.length)
    }, interval)
    return () => clearInterval(id)
  }, [paused, slides.length, interval])

  const slide = slides[current]

  return (
    <section
      className="relative w-full min-h-[560px] md:min-h-[640px] flex items-center justify-center overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured banner"
    >
      {/* ── Slide backgrounds ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={
            slide.image
              ? {
                  backgroundImage:    `url(${slide.image})`,
                  backgroundSize:     'cover',
                  backgroundPosition: 'center',
                }
              : { background: slide.gradient }
          }
          aria-hidden="true"
        />
      </AnimatePresence>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />

      {/* ── Slide text ── */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${slide.id}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
          >
            <h1 className="font-heading text-4xl md:text-6xl text-accent-light leading-tight mb-5 whitespace-pre-line drop-shadow-md">
              {slide.headline}
            </h1>
            <p className="font-body text-background/90 text-base md:text-xl mb-8 max-w-xl mx-auto">
              {slide.sub}
            </p>
            <Link
              to={slide.ctaLink}
              className="inline-block bg-accent hover:bg-accent-dark text-background font-body font-semibold px-10 py-3 rounded-full transition-colors duration-200 shadow-lg"
            >
              {slide.cta}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Dot indicators ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'bg-accent w-6'
                  : 'bg-background/50 hover:bg-background/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* ── Prev / Next arrows ── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((i) => (i - 1 + slides.length) % slides.length)}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-background flex items-center justify-center transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrent((i) => (i + 1) % slides.length)}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-background flex items-center justify-center transition-colors"
          >
            ›
          </button>
        </>
      )}
    </section>
  )
}
