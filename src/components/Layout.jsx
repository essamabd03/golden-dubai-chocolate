import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import CartDrawer from './CartDrawer'
import { useCartContext } from '../context/CartContext'

// ─── Mobile floating "View Cart" button ────────────────────────────────────────
// Appears on mobile only when at least one item is in the cart.
// Hidden on /cart and /checkout so it doesn't compete with the page CTA.
function FloatingCartButton() {
  const { totalCount, totalPrice } = useCartContext()
  const { pathname } = useLocation()

  const hidden = pathname === '/cart' || pathname === '/checkout'

  return (
    <AnimatePresence>
      {totalCount > 0 && !hidden && (
        <motion.div
          key="floating-cart"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40"
        >
          <Link
            to="/cart"
            className="flex items-center gap-3 bg-primary hover:bg-primary-dark text-background font-body font-semibold px-5 py-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            {/* Cart icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-5 h-5 flex-shrink-0"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>

            <span>
              View Cart
              <span className="ml-1.5 font-normal text-background/70 text-sm">
                ({totalCount})
              </span>
            </span>

            {/* Price pill */}
            <span className="bg-accent text-background text-xs font-bold px-2.5 py-1 rounded-full tabular-nums">
              ${totalPrice.toFixed(2)}
            </span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Layout ────────────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      {/* CartDrawer overlays all page content */}
      <CartDrawer />

      {/* Mobile floating cart button */}
      <FloatingCartButton />
    </div>
  )
}
