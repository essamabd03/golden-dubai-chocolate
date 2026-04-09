import { AnimatePresence, motion } from 'framer-motion'
import { useCartContext } from '../context/CartContext'

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    totalPrice,
    totalCount,
    checkoutUrl,
    isSyncing,
    removeItem,
    updateQty,
    toggleDrawer,
  } = useCartContext()

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-primary/50 backdrop-blur-sm"
            onClick={() => toggleDrawer(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.aside
            key="cart-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-background shadow-2xl flex flex-col"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-accent/20">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-primary text-xl">
                  Cart ({totalCount})
                </h2>
                {/* Syncing spinner — visible while Shopify API call is in-flight */}
                {isSyncing && (
                  <div
                    className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"
                    aria-label="Syncing with store…"
                  />
                )}
              </div>
              <button
                onClick={() => toggleDrawer(false)}
                aria-label="Close cart"
                className="text-primary hover:text-accent transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <p className="font-body text-text/60 text-sm text-center mt-12">
                  Your cart is empty.
                </p>
              ) : (
                items.map((item) => (
                  <div key={item.variantId} className="flex gap-4 items-start">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-primary font-medium text-sm leading-snug truncate">
                        {item.title}
                      </p>
                      <p className="font-body text-accent-dark text-sm mt-0.5">
                        ${parseFloat(item.price ?? 0).toFixed(2)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQty(item.variantId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="w-6 h-6 rounded-full border border-accent/40 text-primary hover:bg-accent/10 text-sm flex items-center justify-center transition-colors"
                        >
                          –
                        </button>
                        <span className="font-body text-sm text-text w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.variantId, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="w-6 h-6 rounded-full border border-accent/40 text-primary hover:bg-accent/10 text-sm flex items-center justify-center transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.variantId)}
                      aria-label={`Remove ${item.title}`}
                      className="text-text/40 hover:text-red-500 transition-colors text-sm flex-shrink-0 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer — subtotal + checkout CTA */}
            {items.length > 0 && (
              <div className="border-t border-accent/20 px-6 py-4 space-y-3">
                <div className="flex justify-between font-body text-primary font-semibold">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                {checkoutUrl ? (
                  /* Real Shopify checkout URL — external link, bypasses React Router */
                  <a
                    href={checkoutUrl}
                    className="block w-full bg-accent hover:bg-accent-dark text-background font-body font-semibold py-3 rounded-lg text-center transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  >
                    Go to Checkout
                  </a>
                ) : (
                  /* Still awaiting Shopify cart creation */
                  <button
                    disabled
                    className="w-full bg-accent/50 text-background font-body font-semibold py-3 rounded-lg text-center cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                    Preparing checkout…
                  </button>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
