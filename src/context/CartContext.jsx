import { createContext, useContext, useReducer, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useShopifyCart } from '../hooks/useShopifyCart'
import { cartNoteUpdate } from '../lib/shopify'

// ─── Item shape ────────────────────────────────────────────────────────────────
// { id, variantId, handle, title, price, quantity, image }

// ─── Action types ──────────────────────────────────────────────────────────────
export const CART_ACTIONS = {
  ADD_ITEM:         'ADD_ITEM',
  REMOVE_ITEM:      'REMOVE_ITEM',
  UPDATE_QUANTITY:  'UPDATE_QUANTITY',
  CLEAR_CART:       'CLEAR_CART',
  TOGGLE_DRAWER:    'TOGGLE_DRAWER',
  SET_SHOPIFY_CART: 'SET_SHOPIFY_CART',
  SET_PICKUP:       'SET_PICKUP',
}

// ─── Initial state ─────────────────────────────────────────────────────────────
const initialState = {
  items:         [],
  isDrawerOpen:  false,
  cartId:        null,
  checkoutUrl:   null,
  isSyncing:     false,
  isLocalPickup: false,
  zipCode:       '',
}

// ─── Reducer ───────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {

    case CART_ACTIONS.ADD_ITEM: {
      const existing = state.items.find(
        (item) => item.variantId === action.payload.variantId
      )
      if (existing) {
        return {
          ...state,
          isSyncing: true,
          items: state.items.map((item) =>
            item.variantId === action.payload.variantId
              ? { ...item, quantity: item.quantity + (action.payload.quantity ?? 1) }
              : item
          ),
        }
      }
      return {
        ...state,
        isSyncing: true,
        items: [
          ...state.items,
          { ...action.payload, quantity: action.payload.quantity ?? 1 },
        ],
      }
    }

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(
          (item) => item.variantId !== action.payload.variantId
        ),
      }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { variantId, quantity } = action.payload
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((item) => item.variantId !== variantId),
        }
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item
        ),
      }
    }

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items:         [],
        cartId:        null,
        checkoutUrl:   null,
        isSyncing:     false,
        isLocalPickup: false,
        zipCode:       '',
      }

    case CART_ACTIONS.SET_PICKUP:
      return {
        ...state,
        isLocalPickup: Boolean(action.payload.isLocalPickup),
        zipCode:       action.payload.zipCode ?? '',
      }

    case CART_ACTIONS.TOGGLE_DRAWER:
      return {
        ...state,
        isDrawerOpen:
          action.payload !== undefined ? Boolean(action.payload) : !state.isDrawerOpen,
      }

    case CART_ACTIONS.SET_SHOPIFY_CART:
      return {
        ...state,
        isSyncing:   false,
        cartId:      action.payload.id,
        checkoutUrl: action.payload.checkoutUrl,
      }

    default:
      return state
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────
export const CartContext = createContext(null)

// ─── Provider ──────────────────────────────────────────────────────────────────
export function CartContextProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const handleCartReady = useCallback((cart) => {
    dispatch({ type: CART_ACTIONS.SET_SHOPIFY_CART, payload: cart })
  }, [])

  const { syncAddToCart, clearShopifyCart } = useShopifyCart({
    onCartReady: handleCartReady,
  })

  // ── Derived values ─────────────────────────────────────────────────────────
  const totalCount = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = state.items.reduce(
    (sum, item) => sum + parseFloat(item.price ?? 0) * item.quantity,
    0
  )

  // ── Dispatch helpers ───────────────────────────────────────────────────────
  const addItem = useCallback((item) => {
    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: item })
    syncAddToCart(item.variantId, item.quantity ?? 1)

    // Toast notification — short name if title is long
    const name = item.title?.length > 30
      ? item.title.slice(0, 30) + '…'
      : (item.title ?? 'Item')
    toast.success(`${name} added to cart!`, {
      icon: '🍫',
      duration: 2500,
    })
  }, [syncAddToCart])

  const removeItem = useCallback((variantId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { variantId } })
    toast('Item removed from cart', { icon: '🗑️', duration: 2000 })
  }, [])

  const updateQty = useCallback(
    (variantId, quantity) =>
      dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { variantId, quantity } }),
    []
  )

  const clearCart = useCallback(() => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART })
    clearShopifyCart()
    toast('Cart cleared', { icon: '🗑️', duration: 2000 })
  }, [clearShopifyCart])

  const toggleDrawer = useCallback(
    (forceOpen) =>
      dispatch({ type: CART_ACTIONS.TOGGLE_DRAWER, payload: forceOpen }),
    []
  )

  // ── Pickup selection ───────────────────────────────────────────────────────
  // Stores the pickup choice locally and, if a Shopify cart already exists,
  // fires a cartNoteUpdate in the background so the order note is visible in
  // the Shopify admin without blocking the UI.
  const setPickup = useCallback(
    ({ isLocalPickup, zipCode }) => {
      dispatch({
        type:    CART_ACTIONS.SET_PICKUP,
        payload: { isLocalPickup, zipCode },
      })

      // Fire-and-forget: attach the pickup note to the Shopify cart if one exists.
      if (isLocalPickup && state.cartId) {
        const note = `LOCAL PICKUP - ZIP: ${zipCode}`
        cartNoteUpdate(state.cartId, note).catch((err) =>
          console.error('[CartContext] cartNoteUpdate failed:', err)
        )
      }
    },
    [state.cartId]
  )

  const value = {
    items:         state.items,
    isDrawerOpen:  state.isDrawerOpen,
    cartId:        state.cartId,
    checkoutUrl:   state.checkoutUrl,
    isSyncing:     state.isSyncing,
    isLocalPickup: state.isLocalPickup,
    zipCode:       state.zipCode,
    totalCount,
    totalPrice,
    addItem,
    removeItem,
    updateQty,
    clearCart,
    toggleDrawer,
    setPickup,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
export function useCartContext() {
  const ctx = useContext(CartContext)
  if (ctx === null) {
    throw new Error('useCartContext must be used inside <CartContextProvider>')
  }
  return ctx
}
