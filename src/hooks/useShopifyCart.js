import { useCallback, useRef } from 'react'
import { createCart, addToCart } from '../lib/shopify'

// localStorage key for persisting the Shopify cart ID across page refreshes
const CART_ID_KEY = 'gdc_shopify_cart_id'

/**
 * Low-level hook that manages the Shopify cart lifecycle.
 *
 * Responsibilities:
 *   - Create a Shopify cart on first item add (lazy — no cart until needed)
 *   - Persist the cartId in localStorage so it survives page refreshes
 *   - Return a stable `syncAddToCart` function that CartContext calls
 *     after every optimistic ADD_ITEM dispatch
 *
 * This hook does NOT manage any React state itself — it works as a side-effect
 * layer on top of CartContext. The cartId is stored in a ref so it never
 * triggers re-renders.
 *
 * @param {function} onCartReady - Called with the normalized cart object
 *   whenever a cart is created or updated. CartContext uses this to store
 *   cartId + checkoutUrl in its state.
 */
export function useShopifyCart({ onCartReady }) {
  // Ref so reads/writes never cause re-renders
  const cartIdRef = useRef(localStorage.getItem(CART_ID_KEY) ?? null)

  /**
   * Sync a single variant add to the Shopify Storefront API.
   * Creates the cart on the very first call, then reuses the same cart.
   *
   * @param {string} variantId - Shopify variant GID
   * @param {number} quantity
   */
  const syncAddToCart = useCallback(async (variantId, quantity = 1) => {
    try {
      let cart

      if (!cartIdRef.current) {
        // First item ever — create a fresh cart with this line pre-populated
        cart = await createCart([{ merchandiseId: variantId, quantity }])
        cartIdRef.current = cart.id
        localStorage.setItem(CART_ID_KEY, cart.id)
      } else {
        // Cart already exists — add to it
        cart = await addToCart(cartIdRef.current, variantId, quantity)
      }

      onCartReady(cart)
    } catch (err) {
      // Don't crash the UI — the optimistic local state is still intact.
      // The user can still browse; they'll see an error at checkout if needed.
      console.error('[useShopifyCart] Failed to sync cart with Shopify:', err.message)
    }
  }, [onCartReady])

  /**
   * Clear the persisted cart ID (call this after a successful order or
   * when the user explicitly clears their cart).
   */
  const clearShopifyCart = useCallback(() => {
    cartIdRef.current = null
    localStorage.removeItem(CART_ID_KEY)
  }, [])

  return { syncAddToCart, clearShopifyCart }
}
