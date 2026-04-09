import { Link } from 'react-router-dom'
import { useCartContext } from '../context/CartContext'
import LocalPickupSelector from '../components/LocalPickupSelector'

// ─── Empty cart state ──────────────────────────────────────────────────────────
function EmptyCart() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <p className="font-heading text-primary/20 text-8xl mb-6" aria-hidden="true">
        🛒
      </p>
      <h1 className="font-heading text-primary text-3xl mb-3">Your cart is empty</h1>
      <p className="font-body text-text/50 mb-10">
        Add some handcrafted chocolates and come back here!
      </p>
      <Link
        to="/shop"
        className="inline-block bg-accent hover:bg-accent-dark text-background font-body font-semibold px-10 py-3 rounded-full transition-colors"
      >
        Browse Products
      </Link>
    </div>
  )
}

// ─── Quantity control button ───────────────────────────────────────────────────
function QtyButton({ onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="w-8 h-8 rounded-full border border-accent/30 hover:bg-accent/10 font-body text-lg flex items-center justify-center transition-colors leading-none"
    >
      {children}
    </button>
  )
}

// ─── Cart page ────────────────────────────────────────────────────────────────
export default function Cart() {
  const {
    items,
    totalPrice,
    totalCount,
    removeItem,
    updateQty,
    clearCart,
    checkoutUrl,
    isSyncing,
    isLocalPickup,
    zipCode,
    setPickup,
  } = useCartContext()

  if (items.length === 0) {
    return <EmptyCart />
  }

  // ── Handlers wired to CartContext.setPickup ─────────────────────────────────
  function handlePickupConfirm({ isLocalPickup, zipCode }) {
    setPickup({ isLocalPickup, zipCode })
  }

  function handlePickupClear({ isLocalPickup, zipCode }) {
    setPickup({ isLocalPickup, zipCode })
  }

  // ── Checkout redirect ───────────────────────────────────────────────────────
  // If a real Shopify checkoutUrl exists we send the user directly there.
  // While the cart is still being synced we show a disabled spinner button.
  function handleCheckout() {
    if (checkoutUrl) {
      window.location.href = checkoutUrl
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-primary text-3xl md:text-4xl">
          Your Cart{' '}
          <span className="text-primary/40 text-2xl">({totalCount})</span>
        </h1>
        <button
          onClick={clearCart}
          className="font-body text-sm text-text/40 hover:text-red-500 transition-colors"
        >
          Clear cart
        </button>
      </div>

      {/* ── Two-column layout on md+ ───────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── Left: line items + pickup selector ────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Line items */}
          {items.map((item) => (
            <div
              key={item.variantId}
              className="flex gap-4 items-center p-4 border border-accent/10 rounded-2xl bg-white shadow-sm"
            >
              {/* Image */}
              <Link
                to={`/product/${item.handle}`}
                className="flex-shrink-0"
                aria-label={`View ${item.title}`}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-xl"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #3B1A08 0%, #C9933A 100%)' }}
                    aria-hidden="true"
                  >
                    <span className="font-heading text-accent-light/60 text-[9px] tracking-widest uppercase text-center px-1">
                      Golden Dubai
                    </span>
                  </div>
                )}
              </Link>

              {/* Title + variant + unit price */}
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.handle}`}>
                  <p className="font-body text-primary font-medium hover:text-accent transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                </Link>
                {item.variantTitle && item.variantTitle !== 'Default Title' && (
                  <p className="font-body text-text/40 text-xs mt-0.5">
                    {item.variantTitle}
                  </p>
                )}
                <p className="font-body text-accent-dark text-sm mt-1">
                  ${parseFloat(item.price ?? 0).toFixed(2)} each
                </p>
              </div>

              {/* Qty controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <QtyButton
                  onClick={() => updateQty(item.variantId, item.quantity - 1)}
                  label="Decrease quantity"
                >
                  –
                </QtyButton>
                <span className="font-body text-text w-6 text-center select-none tabular-nums">
                  {item.quantity}
                </span>
                <QtyButton
                  onClick={() => updateQty(item.variantId, item.quantity + 1)}
                  label="Increase quantity"
                >
                  +
                </QtyButton>
              </div>

              {/* Line total */}
              <p className="font-body text-primary font-semibold min-w-[64px] text-right flex-shrink-0 tabular-nums">
                ${(parseFloat(item.price ?? 0) * item.quantity).toFixed(2)}
              </p>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.variantId)}
                aria-label={`Remove ${item.title}`}
                className="text-text/30 hover:text-red-500 transition-colors text-xl leading-none flex-shrink-0"
              >
                &times;
              </button>
            </div>
          ))}

          {/* Local Pickup Selector */}
          <div className="pt-2">
            <LocalPickupSelector
              onConfirm={handlePickupConfirm}
              onClear={handlePickupClear}
              isConfirmed={isLocalPickup}
              zipCode={zipCode}
            />
          </div>
        </div>

        {/* ── Right: order summary ────────────────────────────────────────────── */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="border border-accent/15 rounded-2xl p-6 bg-white shadow-sm sticky top-24">
            <h2 className="font-heading text-primary text-xl mb-5">Order Summary</h2>

            {/* Subtotal */}
            <div className="flex justify-between font-body text-text mb-3">
              <span>Subtotal</span>
              <span className="font-medium tabular-nums">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Shipping */}
            <div className="flex justify-between font-body text-text mb-5">
              <span>Shipping</span>
              {isLocalPickup ? (
                <span className="font-semibold text-green-600">FREE</span>
              ) : (
                <span className="text-text/50 text-sm">Calculated at checkout</span>
              )}
            </div>

            {/* Pickup note */}
            {isLocalPickup && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-5">
                <p className="font-body text-green-700 text-xs leading-relaxed">
                  📍 Local pickup selected · ZIP {zipCode}
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-accent/10 mb-5" />

            {/* Total */}
            <div className="flex justify-between font-heading text-primary text-lg mb-6">
              <span>Total</span>
              <span className="tabular-nums">${totalPrice.toFixed(2)}</span>
            </div>

            {/* Checkout CTA */}
            {isSyncing ? (
              /* Cart is still syncing with Shopify — show spinner */
              <button
                disabled
                className="w-full bg-accent/60 cursor-not-allowed text-background font-body font-semibold py-3 rounded-full flex items-center justify-center gap-2"
              >
                <svg
                  className="animate-spin w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12" cy="12" r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Preparing checkout…
              </button>
            ) : checkoutUrl ? (
              /* Real Shopify checkout URL available */
              <button
                onClick={handleCheckout}
                className="w-full bg-accent hover:bg-accent-dark text-background font-body font-semibold py-3 rounded-full transition-colors duration-200"
              >
                Proceed to Checkout →
              </button>
            ) : (
              /* Fallback: route through our /checkout page */
              <Link
                to="/checkout"
                className="block w-full text-center bg-accent hover:bg-accent-dark text-background font-body font-semibold py-3 rounded-full transition-colors duration-200"
              >
                Proceed to Checkout →
              </Link>
            )}

            {/* Continue shopping */}
            <Link
              to="/shop"
              className="block text-center font-body text-sm text-accent hover:text-accent-dark underline underline-offset-4 mt-4 transition-colors"
            >
              ← Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
