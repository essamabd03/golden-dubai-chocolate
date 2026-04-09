import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ShopifyProvider, CartProvider } from '@shopify/hydrogen-react'
import { Toaster } from 'react-hot-toast'

import { CartContextProvider } from './context/CartContext'
import Layout from './components/Layout'

import Home          from './pages/Home'
import Shop          from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart          from './pages/Cart'
import Checkout      from './pages/Checkout'
import NotFound      from './pages/NotFound'

// ─── Shopify config (read from .env) ──────────────────────────────────────────
// Set VITE_SHOPIFY_STORE_DOMAIN and VITE_SHOPIFY_STOREFRONT_TOKEN in your .env
// file before connecting to a live store. See .env.example for reference.
const SHOPIFY_STORE_DOMAIN      = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN      ?? ''
const SHOPIFY_STOREFRONT_TOKEN  = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN  ?? ''
const SHOPIFY_API_VERSION       = '2024-01'

// ─── Provider hierarchy ───────────────────────────────────────────────────────
// 1. ShopifyProvider  — outermost; required by CartProvider and useShop()
// 2. CartProvider     — hydrogen-react; syncs with Storefront API cart
// 3. CartContextProvider — local useReducer; drives UI state (drawer, optimistic items)
// 4. BrowserRouter    — must wrap everything that uses Link / Route / useNavigate
// 5. Layout           — Navbar + Footer + CartDrawer rendered once for all routes

function App() {
  return (
    <ShopifyProvider
      storeDomain={SHOPIFY_STORE_DOMAIN}
      storefrontToken={SHOPIFY_STOREFRONT_TOKEN}
      storefrontApiVersion={SHOPIFY_API_VERSION}
      countryIsoCode="US"
      languageIsoCode="EN"
    >
      <CartProvider>
        <CartContextProvider>
          <BrowserRouter>
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  color: '#1C0A00',
                  background: '#FAF6EF',
                  border: '1px solid #C9933A33',
                },
              }}
            />

            <Layout>
              <Routes>
                <Route path="/"                element={<Home />}          />
                <Route path="/shop"            element={<Shop />}          />
                <Route path="/product/:handle" element={<ProductDetail />} />
                <Route path="/cart"            element={<Cart />}          />
                <Route path="/checkout"        element={<Checkout />}      />
                <Route path="*"               element={<NotFound />}      />
              </Routes>
            </Layout>

          </BrowserRouter>
        </CartContextProvider>
      </CartProvider>
    </ShopifyProvider>
  )
}

export default App
