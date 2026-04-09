import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useCartContext } from '../context/CartContext'

/**
 * ProductCard
 *
 * Props:
 *   id        (string)        — Shopify product GID
 *   handle    (string)        — URL slug
 *   title     (string)        — product name
 *   price     (string)        — starting price (min variant price)
 *   image     (string | null) — product image URL
 *   imageAlt  (string)        — alt text
 *   variants  (array)         — [{ id, title, price, availableForSale }]
 */
export default function ProductCard({
  id,
  handle,
  title,
  price,
  image,
  imageAlt,
  variants = [],
}) {
  const { addItem, toggleDrawer } = useCartContext()

  // Default to first available variant, or just first if none available
  const firstAvailable = variants.find((v) => v.availableForSale) ?? variants[0]
  const [selectedVariant, setSelectedVariant] = useState(firstAvailable ?? null)
  const [imgLoaded, setImgLoaded] = useState(false)

  const isAvailable = selectedVariant?.availableForSale ?? false
  const displayPrice = selectedVariant?.price ?? price
  const hasVariantChoice = variants.length > 1

  function handleAddToCart() {
    if (!selectedVariant) return
    addItem({
      id,
      variantId: selectedVariant.id,
      handle,
      title,
      price:     selectedVariant.price,
      image,
      quantity:  1,
    })
    toggleDrawer(true)
  }

  return (
    <article className="group flex flex-col bg-background rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-accent/10">

      {/* Product image */}
      <Link
        to={`/product/${handle}`}
        className={`block overflow-hidden relative ${imgLoaded ? 'bg-transparent' : 'bg-primary/5 animate-pulse'}`}
        aria-label={`View ${title}`}
        style={{ aspectRatio: '4 / 3' }}
      >
        {image ? (
          <img
            src={image}
            alt={imageAlt ?? title}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />
        ) : (
          /* Chocolate gradient placeholder */
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #3B1A08 0%, #C9933A 100%)',
            }}
          >
            <span className="font-heading text-accent-light/60 text-xs tracking-widest uppercase">
              Golden Dubai
            </span>
          </div>
        )}
      </Link>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Title */}
        <Link to={`/product/${handle}`}>
          <h2 className="font-heading text-primary text-base md:text-lg leading-snug line-clamp-2 hover:text-accent transition-colors">
            {title ?? 'Untitled Product'}
          </h2>
        </Link>

        {/* Variant selector — only shown when product has multiple variants */}
        {hasVariantChoice && (
          <div className="flex flex-wrap gap-1.5">
            {variants.map((v) => {
              const isSelected = selectedVariant?.id === v.id
              const isUnavailable = !v.availableForSale
              return (
                <button
                  key={v.id}
                  onClick={() => !isUnavailable && setSelectedVariant(v)}
                  disabled={isUnavailable}
                  title={isUnavailable ? `${v.title} — out of stock` : v.title}
                  className={`
                    relative px-2.5 py-1 rounded-md text-xs font-body font-medium border transition-all duration-150
                    ${isSelected
                      ? 'bg-primary text-background border-primary'
                      : isUnavailable
                        ? 'bg-transparent text-text/30 border-accent/10 cursor-not-allowed line-through'
                        : 'bg-transparent text-primary border-accent/30 hover:border-accent'
                    }
                  `}
                >
                  {v.title}
                </button>
              )
            })}
          </div>
        )}

        {/* Price */}
        <p className="font-body text-accent-dark font-semibold text-base">
          {displayPrice
            ? `$${parseFloat(displayPrice).toFixed(2)}`
            : '—'}
          {hasVariantChoice && (
            <span className="font-body text-text/40 font-normal text-xs ml-1">
              / {selectedVariant?.title}
            </span>
          )}
        </p>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className="mt-auto w-full bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-background font-body font-semibold py-2.5 rounded-lg text-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
        >
          {isAvailable ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </article>
  )
}
