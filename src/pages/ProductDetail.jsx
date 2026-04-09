import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useProduct } from '../hooks/useProduct'
import { useCartContext } from '../context/CartContext'

// ─── Image gallery ────────────────────────────────────────────────────────────
function ImageGallery({ images = [], title }) {
  const [activeIdx,  setActiveIdx]  = useState(0)
  const [direction,  setDirection]  = useState(1)    // 1 = forward, -1 = backward
  const [mainLoaded, setMainLoaded] = useState(false)

  const hasThumbs = images.length > 1

  function goTo(idx) {
    setDirection(idx > activeIdx ? 1 : -1)
    setActiveIdx(idx)
    setMainLoaded(false)
  }

  const active = images[activeIdx] ?? null

  const variants = {
    enter:  (dir) => ({ opacity: 0, x: dir * 30 }),
    center: { opacity: 1, x: 0 },
    exit:   (dir) => ({ opacity: 0, x: dir * -30 }),
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div
        className={`relative rounded-2xl overflow-hidden border border-accent/10 ${
          mainLoaded ? 'bg-transparent' : 'bg-primary/5 animate-pulse'
        }`}
        style={{ aspectRatio: '1 / 1' }}
      >
        {active ? (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.img
              key={activeIdx}
              src={active.url}
              alt={active.altText ?? title}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              onLoad={() => setMainLoaded(true)}
              className="w-full h-full object-cover absolute inset-0"
            />
          </AnimatePresence>
        ) : (
          /* No image placeholder */
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3B1A08 0%, #C9933A 100%)' }}
          >
            <span className="font-heading text-accent-light/50 text-sm tracking-widest uppercase">
              Golden Dubai
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {hasThumbs && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent ${
                idx === activeIdx
                  ? 'border-accent shadow-md scale-105'
                  : 'border-accent/20 hover:border-accent/50 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={img.altText ?? title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Product detail page ──────────────────────────────────────────────────────
export default function ProductDetail() {
  const { handle } = useParams()
  const { product, isLoading, error } = useProduct(handle)
  const { addItem, toggleDrawer } = useCartContext()

  const [selectedVariant,  setSelectedVariant]  = useState(null)
  const [quantity,         setQuantity]          = useState(1)
  const [addedFeedback,    setAddedFeedback]     = useState(false)

  // Resolve selected variant (default = first available)
  function getVariant() {
    if (!product) return null
    if (selectedVariant) return selectedVariant
    return product.variants.find((v) => v.availableForSale) ?? product.variants[0]
  }

  function handleAddToCart() {
    const variant = getVariant()
    if (!variant) return
    for (let i = 0; i < quantity; i++) {
      addItem({
        id:        product.id,
        variantId: variant.id,
        handle:    product.handle,
        title:     product.title,
        price:     variant.price,
        image:     product.image,
        quantity:  1,
      })
    }
    toggleDrawer(true)
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 2000)
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="aspect-square rounded-2xl bg-primary/5 animate-pulse border border-accent/10" />
          <div className="flex flex-col gap-4 pt-2">
            <div className="h-5 w-24 bg-primary/5 animate-pulse rounded" />
            <div className="h-10 w-3/4 bg-primary/5 animate-pulse rounded-lg" />
            <div className="h-8 w-1/4 bg-primary/5 animate-pulse rounded-lg" />
            <div className="h-4 w-full bg-primary/5 animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-primary/5 animate-pulse rounded" />
            <div className="h-4 w-4/6 bg-primary/5 animate-pulse rounded" />
            <div className="h-12 w-full bg-primary/10 animate-pulse rounded-lg mt-4" />
          </div>
        </div>
      </div>
    )
  }

  // ── Error / not found ──────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <h1 className="font-heading text-primary text-3xl mb-4">
          Product Not Found
        </h1>
        <p className="font-body text-text/50 mb-8">
          {error ?? "We couldn't find this product. It may have been removed."}
        </p>
        <Link
          to="/shop"
          className="inline-block bg-accent hover:bg-accent-dark text-background font-body font-semibold px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg"
        >
          Back to Shop
        </Link>
      </div>
    )
  }

  // ── Resolved data ──────────────────────────────────────────────────────────
  const activeVariant  = getVariant()
  const isAvailable    = activeVariant?.availableForSale ?? false
  const hasVariants    = product.variants.length > 1
  const displayPrice   = activeVariant?.price ?? product.price
  const images         = product.images?.length ? product.images : (
    product.image ? [{ url: product.image, altText: product.imageAlt }] : []
  )

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

      {/* Breadcrumb */}
      <Link
        to="/shop"
        className="font-body text-sm text-accent hover:text-accent-dark transition-colors inline-block mb-6"
      >
        ← Back to shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

        {/* ── Left: image gallery ─────────────────────────────────────────── */}
        <ImageGallery images={images} title={product.title} />

        {/* ── Right: product info ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Title */}
          <h1 className="font-heading text-primary text-3xl md:text-4xl leading-tight">
            {product.title}
          </h1>

          {/* Price */}
          <p className="font-body text-accent-dark font-semibold text-2xl tabular-nums">
            ${parseFloat(displayPrice ?? 0).toFixed(2)}{' '}
            <span className="text-sm font-normal text-text/40">
              {activeVariant?.currencyCode ?? product.currencyCode}
            </span>
          </p>

          {/* Description */}
          {product.description && (
            <p className="font-body text-text/70 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Availability badge */}
          <span
            className={`inline-flex items-center gap-1.5 font-body text-sm font-medium w-fit px-3 py-1 rounded-full ${
              isAvailable
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}
              aria-hidden="true"
            />
            {isAvailable ? 'In stock' : 'Out of stock'}
          </span>

          {/* Variant selector (size) */}
          {hasVariants && (
            <div>
              <p className="font-body text-sm font-medium text-text mb-2">
                Size / Option
              </p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected    = (selectedVariant?.id ?? activeVariant?.id) === v.id
                  const isUnavailable = !v.availableForSale
                  return (
                    <button
                      key={v.id}
                      onClick={() => !isUnavailable && setSelectedVariant(v)}
                      disabled={isUnavailable}
                      title={isUnavailable ? `${v.title} — out of stock` : v.title}
                      className={`
                        px-4 py-2 rounded-lg text-sm font-body font-medium border transition-all duration-150
                        ${isSelected
                          ? 'bg-primary text-background border-primary shadow-sm'
                          : isUnavailable
                            ? 'bg-transparent text-text/30 border-accent/10 cursor-not-allowed line-through'
                            : 'bg-transparent text-primary border-accent/30 hover:border-accent hover:shadow-sm'
                        }
                      `}
                    >
                      {v.title}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div>
            <p className="font-body text-sm font-medium text-text mb-2">Quantity</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-10 h-10 rounded-full border border-accent/30 hover:bg-accent/10 hover:scale-105 font-body text-xl flex items-center justify-center transition-all duration-150 leading-none"
              >
                –
              </button>
              <span className="font-body text-primary text-lg w-8 text-center tabular-nums select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="w-10 h-10 rounded-full border border-accent/30 hover:bg-accent/10 hover:scale-105 font-body text-xl flex items-center justify-center transition-all duration-150 leading-none"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`
              w-full font-body font-semibold py-3.5 rounded-xl text-base transition-all duration-200
              ${isAvailable
                ? addedFeedback
                  ? 'bg-green-600 text-white scale-[0.99]'
                  : 'bg-primary hover:bg-primary-dark text-background hover:scale-[1.02] hover:shadow-lg active:scale-[0.99]'
                : 'bg-primary/30 text-background/50 cursor-not-allowed'
              }
            `}
          >
            {!isAvailable
              ? 'Out of Stock'
              : addedFeedback
                ? '✓ Added to Cart!'
                : `Add to Cart — $${(parseFloat(displayPrice ?? 0) * quantity).toFixed(2)}`
            }
          </button>

          {/* Pickup note */}
          <p className="font-body text-xs text-text/50 border border-accent/20 rounded-xl px-4 py-3 bg-accent/5 leading-relaxed">
            🏪 <strong>Local pickup only.</strong> Pickup location and window details
            will be provided after your order is confirmed.
          </p>

        </div>
      </div>

      {/* ── About This Chocolate ────────────────────────────────────────────── */}
      <section className="mt-16 border-t border-accent/10 pt-12">
        <div className="max-w-2xl">
          <p className="font-body text-accent text-xs tracking-widest uppercase mb-3">
            Craftsmanship
          </p>
          <h2 className="font-heading text-primary text-2xl md:text-3xl mb-4">
            About This Chocolate
          </h2>
          <p className="font-body text-text/70 leading-relaxed mb-4">
            Every bar is handcrafted in small batches using the finest Belgian chocolate,
            layered with golden kataifi pastry and roasted pistachios — the authentic
            Dubai-style combination that's taken the world by storm.
          </p>
          <p className="font-body text-text/60 leading-relaxed">
            We use no preservatives and no artificial flavors. Each piece is made to order
            and best enjoyed within two weeks. Store in a cool, dry place away from
            direct sunlight.
          </p>
        </div>
      </section>

    </div>
  )
}
