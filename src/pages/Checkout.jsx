import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCartContext } from '../context/CartContext'

// This page redirects the user to the Shopify-hosted checkout.
// The checkoutUrl comes from CartContext (set when the Shopify cart was created).
// Shopify's checkout handles shipping, taxes, and payment automatically.

export default function Checkout() {
  const { checkoutUrl, isSyncing, items } = useCartContext()

  useEffect(() => {
    // Redirect as soon as we have a valid URL and the cart is done syncing
    if (checkoutUrl && !isSyncing) {
      window.location.href = checkoutUrl
    }
  }, [checkoutUrl, isSyncing])

  const isEmpty     = items.length === 0
  const isReady     = Boolean(checkoutUrl) && !isSyncing
  const isWaiting   = isSyncing || (!checkoutUrl && !isEmpty)

  return (
    <div className="max-w-xl mx-auto px-6 py-20 text-center">
      <h1 className="font-heading text-primary text-3xl mb-4">Checkout</h1>

      {/* Empty cart */}
      {isEmpty && !isSyncing && (
        <>
          <p className="font-body text-text/60 mb-8">
            Your cart is empty. Add some chocolates before checking out.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-accent hover:bg-accent-dark text-background font-body font-semibold px-8 py-3 rounded-full transition-colors"
          >
            Browse Products
          </Link>
        </>
      )}

      {/* Syncing / creating cart */}
      {isWaiting && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-text/60">Preparing your cart…</p>
        </div>
      )}

      {/* Redirecting */}
      {isReady && (
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-text/60">
            Redirecting you to secure checkout…
          </p>
          {/* Fallback manual link in case the redirect is blocked */}
          <a
            href={checkoutUrl}
            className="font-body text-sm text-accent underline underline-offset-2 hover:text-accent-dark"
          >
            Click here if you are not redirected
          </a>
        </div>
      )}
    </div>
  )
}
