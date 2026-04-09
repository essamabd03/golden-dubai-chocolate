import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useCartContext } from '../context/CartContext'

export default function Navbar() {
  const { totalCount, toggleDrawer } = useCartContext()
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [scrolled,   setScrolled]   = useState(false)

  // Add drop shadow once user scrolls past 10px
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinkClass = ({ isActive }) =>
    `font-body text-sm font-medium transition-colors ${
      isActive ? 'text-accent' : 'text-background/80 hover:text-accent-light'
    }`

  const mobileNavLinkClass = ({ isActive }) =>
    `font-body text-lg font-medium transition-colors block py-3 border-b border-background/10 ${
      isActive ? 'text-accent' : 'text-background/80 hover:text-accent-light'
    }`

  function closeMenu() { setMenuOpen(false) }

  return (
    <header
      className={`sticky top-0 z-30 bg-primary transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_4px_24px_rgba(0,0,0,0.35)]' : 'shadow-none'
      }`}
    >
      <nav
        className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="font-heading text-accent-light text-lg md:text-xl whitespace-nowrap"
        >
          Golden Dubai Chocolate
        </Link>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
          <li><NavLink to="/" end className={navLinkClass}>Home</NavLink></li>
          <li><NavLink to="/shop" className={navLinkClass}>Shop</NavLink></li>
          <li><NavLink to="/cart" className={navLinkClass}>Cart</NavLink></li>
        </ul>

        {/* Right side — cart icon + hamburger */}
        <div className="flex items-center gap-4">

          {/* Cart icon */}
          <button
            onClick={() => toggleDrawer(true)}
            aria-label={`Open cart, ${totalCount} item${totalCount !== 1 ? 's' : ''}`}
            className="relative text-background/80 hover:text-accent-light transition-colors hover:scale-110 active:scale-95 duration-150"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            {totalCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -top-1.5 -right-1.5 bg-accent text-background text-[10px] font-body font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-0.5 leading-none"
              >
                {totalCount > 99 ? '99+' : totalCount}
              </span>
            )}
          </button>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="md:hidden flex flex-col justify-center gap-1.5 w-7 h-7 text-background/80 hover:text-accent-light transition-colors"
          >
            <span
              className={`block h-0.5 w-full bg-current rounded transition-transform duration-200 origin-center ${
                menuOpen ? 'translate-y-2 rotate-45' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-current rounded transition-opacity duration-200 ${
                menuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`block h-0.5 w-full bg-current rounded transition-transform duration-200 origin-center ${
                menuOpen ? '-translate-y-2 -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-primary border-t border-background/10"
          >
            <ul className="max-w-7xl mx-auto px-6 py-2 list-none m-0">
              <li>
                <NavLink to="/" end className={mobileNavLinkClass} onClick={closeMenu}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/shop" className={mobileNavLinkClass} onClick={closeMenu}>
                  Shop
                </NavLink>
              </li>
              <li>
                <NavLink to="/cart" className={mobileNavLinkClass} onClick={closeMenu}>
                  Cart
                </NavLink>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
