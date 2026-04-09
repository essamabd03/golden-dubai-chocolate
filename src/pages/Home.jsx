import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import HeroBanner from '../components/HeroBanner'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../hooks/useProducts'

// ─── Value props ───────────────────────────────────────────────────────────────
const VALUE_PROPS = [
  {
    icon: '🍫',
    label: 'Handcrafted',
    desc:  'Made fresh in small batches with premium ingredients.',
  },
  {
    icon: '📍',
    label: 'Local Pickup',
    desc:  'Order online, collect at your convenience.',
  },
  {
    icon: '🎁',
    label: 'Gift Ready',
    desc:  'Luxury packaging included on every order.',
  },
]

// ─── Stagger animation variants ────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

export default function Home() {
  // 4 featured products for the 2×2 grid
  const { products, isLoading, error } = useProducts(4)

  return (
    <div>
      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <HeroBanner />

      {/* ── Value proposition strip ─────────────────────────────────────────── */}
      <section className="bg-primary text-background">
        <div className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-background/10">
          {VALUE_PROPS.map(({ icon, label, desc }) => (
            <div key={label} className="flex flex-col items-center text-center px-6 py-4 sm:py-0">
              <span className="text-2xl mb-2" aria-hidden="true">{icon}</span>
              <p className="font-heading text-accent-light text-base mb-1">{label}</p>
              <p className="font-body text-background/60 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured products ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-20">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="font-heading text-primary text-3xl md:text-4xl mb-2">
              Our Bestsellers
            </h2>
            <p className="font-body text-text/60 max-w-md">
              Locally handcrafted in small batches — order yours today.
            </p>
          </div>
          <Link
            to="/shop"
            className="self-start sm:self-auto shrink-0 font-body text-sm text-accent hover:text-accent-dark font-semibold underline underline-offset-4 transition-colors"
          >
            View all →
          </Link>
        </div>

        {/* Loading — 2×2 skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-primary/5 animate-pulse border border-accent/10"
                style={{ aspectRatio: '3 / 4' }}
                aria-hidden="true"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <p className="text-center font-body text-red-500">{error}</p>
        )}

        {/* 2×2 product grid */}
        {!isLoading && !error && products.length > 0 && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            {products.map((product) => (
              <motion.div key={product.id} variants={cardVariants}>
                <ProductCard
                  id={product.id}
                  handle={product.handle}
                  title={product.title}
                  price={product.price}
                  image={product.image}
                  imageAlt={product.imageAlt}
                  variants={product.variants}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* No products */}
        {!isLoading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <p className="font-body text-text/50 mb-6">
              No products yet — check back soon!
            </p>
            <p className="font-body text-text/30 text-sm">
              Add products in your Shopify admin to see them here.
            </p>
          </div>
        )}
      </section>

      {/* ── Story / brand strip ──────────────────────────────────────────────── */}
      <section
        className="relative py-20 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1C0A00 0%, #3B1A08 60%, #5C2D0E 100%)' }}
      >
        {/* Decorative blurred orbs */}
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: '#C9933A' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-3xl"
          style={{ background: '#D9A95A' }}
          aria-hidden="true"
        />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <p className="font-heading text-accent-light text-xs tracking-[0.3em] uppercase mb-4">
            Our Story
          </p>
          <h2 className="font-heading text-background text-3xl md:text-4xl mb-6 leading-snug">
            Every piece is a labour of love.
          </h2>
          <p className="font-body text-background/70 text-base md:text-lg leading-relaxed mb-8">
            We make each chocolate by hand using traditional Dubai techniques — layering crispy
            kataifi pastry with smooth pistachio cream and enrobing it all in premium chocolate.
            Available exclusively for local pickup so you always get it fresh.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-accent hover:bg-accent-dark text-background font-body font-semibold px-10 py-3 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
          >
            Shop the Collection
          </Link>
        </div>
      </section>
    </div>
  )
}
