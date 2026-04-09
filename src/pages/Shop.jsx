import { motion } from 'framer-motion'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'

// ─── Animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren:   0.05,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

// ─── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-accent/10 bg-background animate-pulse">
      <div className="bg-primary/5" style={{ aspectRatio: '4 / 3' }} />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-primary/5 rounded w-3/4" />
        <div className="h-3 bg-primary/5 rounded w-1/2" />
        <div className="h-9 bg-primary/5 rounded-lg mt-4" />
      </div>
    </div>
  )
}

export default function Shop() {
  const { products, isLoading, error } = useProducts(50)

  return (
    <div className="min-h-screen">

      {/* ── Page header ───────────────────────────────────────────────────────── */}
      <div
        className="py-12 md:py-16 px-6 text-center"
        style={{ background: 'linear-gradient(180deg, #FAF6EF 0%, #FFF8F0 100%)' }}
      >
        <p className="font-heading text-accent text-xs tracking-[0.3em] uppercase mb-3">
          Handcrafted in small batches
        </p>
        <h1 className="font-heading text-primary text-4xl md:text-5xl mb-3">
          Our Collection
        </h1>
        <p className="font-body text-text/60 max-w-md mx-auto">
          Every piece made fresh to order. Available for local pickup only.
        </p>
      </div>

      {/* ── Product grid ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-24">
            <p className="font-body text-red-500 mb-2 font-medium">
              Could not load products.
            </p>
            <p className="font-body text-text/40 text-sm">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && products.length === 0 && (
          <div className="text-center py-24">
            <p className="font-heading text-primary/30 text-6xl mb-4">🍫</p>
            <p className="font-body text-text/50 mb-2">No products yet.</p>
            <p className="font-body text-text/30 text-sm">
              Add products in your Shopify admin and they'll appear here instantly.
            </p>
          </div>
        )}

        {/* Staggered product grid */}
        {!isLoading && !error && products.length > 0 && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
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

        {/* Product count footer */}
        {!isLoading && !error && products.length > 0 && (
          <p className="font-body text-text/30 text-xs text-center mt-10">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  )
}
