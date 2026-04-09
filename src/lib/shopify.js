import { createStorefrontClient } from '@shopify/hydrogen-react'

// ─── Storefront client ────────────────────────────────────────────────────────
// createStorefrontClient returns helpers that build the correct URL and
// auth headers for every Storefront API request.

const { getStorefrontApiUrl, getPublicTokenHeaders } = createStorefrontClient({
  storeDomain:          import.meta.env.VITE_SHOPIFY_STORE_DOMAIN,
  publicStorefrontToken: import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN,
  storefrontApiVersion: '2024-01',
})

// ─── Low-level fetch helper ───────────────────────────────────────────────────
// All functions below call this. It throws on HTTP errors and surfaces
// GraphQL-level `errors` arrays so callers get a single, consistent
// error type to handle.

async function storefrontFetch({ query, variables = {} }) {
  const response = await fetch(getStorefrontApiUrl(), {
    method:  'POST',
    headers: getPublicTokenHeaders({ contentType: 'json' }),
    body:    JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(
      `Shopify Storefront API responded with ${response.status}: ${response.statusText}`
    )
  }

  const { data, errors } = await response.json()

  if (errors?.length) {
    throw new Error(errors.map((e) => e.message).join('\n'))
  }

  return data
}

// ─── GraphQL fragments ────────────────────────────────────────────────────────
// Keeping fragments at the top makes it easy to update the shape once and
// have it propagate to every query that uses it.

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    title
    handle
    description
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
        }
      }
    }
    variants(first: 10) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
`

// Cart fragment used by createCart, addToCart, and getCheckoutUrl.
// Keeps the returned cart shape consistent across all mutations.
const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
            amountPerQuantity {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              product {
                id
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

// ─── 1. fetchProducts ─────────────────────────────────────────────────────────
// Returns all products (up to `first` count, default 50).
// Each product matches the shape expected by <ProductCard>.

const PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
`

/**
 * Fetch a flat array of products from the Storefront API.
 *
 * @param {number} [first=50] - Max number of products to return
 * @returns {Promise<Array>} Normalized product objects
 */
export async function fetchProducts(first = 50) {
  const data = await storefrontFetch({
    query:     PRODUCTS_QUERY,
    variables: { first },
  })

  return data.products.edges.map(({ node }) => normalizeProduct(node))
}

// ─── 2. fetchProductByHandle ──────────────────────────────────────────────────
// Used on /product/:handle pages. Returns null when the handle doesn't exist
// (lets the page render a 404-style message without throwing).

const PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      ...ProductFields
    }
  }
`

/**
 * Fetch a single product by its URL handle.
 *
 * @param {string} handle - The product's URL slug (e.g. "classic-pistachio-bar")
 * @returns {Promise<Object|null>} Normalized product, or null if not found
 */
export async function fetchProductByHandle(handle) {
  const data = await storefrontFetch({
    query:     PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  })

  if (!data.productByHandle) return null
  return normalizeProduct(data.productByHandle)
}

// ─── 3. createCart ────────────────────────────────────────────────────────────
// Creates an empty Shopify cart and returns the full cart object (including
// checkoutUrl). Pass an initial lines array to pre-populate the cart.

const CREATE_CART_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`

/**
 * Create a new Shopify cart, optionally with initial line items.
 *
 * @param {Array<{merchandiseId: string, quantity: number}>} [lines=[]]
 * @returns {Promise<Object>} Normalized cart object
 */
export async function createCart(lines = []) {
  const data = await storefrontFetch({
    query:     CREATE_CART_MUTATION,
    variables: { input: { lines } },
  })

  const { cart, userErrors } = data.cartCreate

  if (userErrors?.length) {
    throw new Error(userErrors.map((e) => e.message).join('\n'))
  }

  return normalizeCart(cart)
}

// ─── 4. addToCart ─────────────────────────────────────────────────────────────
// Adds one or more lines to an existing cart. The Storefront API merges
// duplicate variant lines automatically (increments quantity).

const ADD_TO_CART_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`

/**
 * Add a variant to an existing cart.
 *
 * @param {string} cartId    - Shopify cart GID (e.g. "gid://shopify/Cart/abc123")
 * @param {string} variantId - Shopify variant GID
 * @param {number} [quantity=1]
 * @returns {Promise<Object>} Updated, normalized cart object
 */
export async function addToCart(cartId, variantId, quantity = 1) {
  const data = await storefrontFetch({
    query:     ADD_TO_CART_MUTATION,
    variables: {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    },
  })

  const { cart, userErrors } = data.cartLinesAdd

  if (userErrors?.length) {
    throw new Error(userErrors.map((e) => e.message).join('\n'))
  }

  return normalizeCart(cart)
}

// ─── 5. cartNoteUpdate ────────────────────────────────────────────────────────
// Attaches a free-text note to an existing Shopify cart (visible in the
// Shopify admin order view). Used to flag local-pickup orders with the
// customer's ZIP code so staff know to arrange collection.

const CART_NOTE_UPDATE_MUTATION = `
  mutation CartNoteUpdate($cartId: ID!, $note: String!) {
    cartNoteUpdate(cartId: $cartId, note: $note) {
      cart {
        id
        note
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`

/**
 * Attach a note to an existing Shopify cart.
 *
 * @param {string} cartId - Shopify cart GID
 * @param {string} note   - Free-text note (shown in admin order view)
 * @returns {Promise<void>}
 */
export async function cartNoteUpdate(cartId, note) {
  const data = await storefrontFetch({
    query:     CART_NOTE_UPDATE_MUTATION,
    variables: { cartId, note },
  })

  const { userErrors } = data.cartNoteUpdate

  if (userErrors?.length) {
    throw new Error(userErrors.map((e) => e.message).join('\n'))
  }
}

// ─── 6. getCheckoutUrl ────────────────────────────────────────────────────────
// Retrieves the Shopify-hosted checkout URL for a cart. The checkout page
// handles shipping rates, taxes, and payment automatically.
// Use this to redirect the customer out of the React app to Shopify checkout.

const CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
    }
  }
`

/**
 * Get the Shopify-hosted checkout URL for a given cart.
 *
 * @param {string} cartId - Shopify cart GID
 * @returns {Promise<string>} The checkout URL (on checkout.shopify.com)
 */
export async function getCheckoutUrl(cartId) {
  const data = await storefrontFetch({
    query:     CART_QUERY,
    variables: { cartId },
  })

  if (!data.cart) {
    throw new Error(`Cart not found: ${cartId}`)
  }

  return data.cart.checkoutUrl
}

// ─── Normalizers ──────────────────────────────────────────────────────────────
// These flatten the Storefront API's edge/node connection pattern into plain
// arrays that are easier to work with in React components.

/**
 * Flatten a Storefront API Product node into a plain object.
 * Output matches the prop shape expected by <ProductCard> and <ProductDetail>.
 */
function normalizeProduct(node) {
  const allImages  = (node.images?.edges ?? []).map(({ node: img }) => ({
    url:     img.url,
    altText: img.altText ?? node.title,
  }))
  const firstImage = allImages[0] ?? null

  return {
    id:           node.id,
    title:        node.title,
    handle:       node.handle,
    description:  node.description,
    price:        node.priceRange?.minVariantPrice?.amount ?? '0',
    currencyCode: node.priceRange?.minVariantPrice?.currencyCode ?? 'USD',
    image:        firstImage?.url    ?? null,
    imageAlt:     firstImage?.altText ?? node.title,
    images:       allImages,
    variants:     (node.variants?.edges ?? []).map(({ node: v }) => ({
      id:               v.id,
      title:            v.title,
      availableForSale: v.availableForSale,
      price:            v.price?.amount ?? '0',
      currencyCode:     v.price?.currencyCode ?? 'USD',
    })),
  }
}

/**
 * Flatten a Storefront API Cart node into a plain object.
 * Output matches the shape used by CartContext and <CartDrawer>.
 */
function normalizeCart(cart) {
  return {
    id:          cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalQuantity: cart.totalQuantity,
    cost: {
      subtotal: cart.cost?.subtotalAmount?.amount   ?? '0',
      total:    cart.cost?.totalAmount?.amount      ?? '0',
      currencyCode: cart.cost?.totalAmount?.currencyCode ?? 'USD',
    },
    lines: (cart.lines?.edges ?? []).map(({ node: line }) => {
      const variant = line.merchandise
      const product = variant?.product
      const image   = product?.images?.edges?.[0]?.node ?? null

      return {
        lineId:      line.id,
        quantity:    line.quantity,
        variantId:   variant?.id    ?? null,
        variantTitle: variant?.title ?? null,
        price:       variant?.price?.amount      ?? '0',
        currencyCode: variant?.price?.currencyCode ?? 'USD',
        lineTotal:   line.cost?.totalAmount?.amount ?? '0',
        productId:   product?.id     ?? null,
        title:       product?.title  ?? null,
        handle:      product?.handle ?? null,
        image:       image?.url      ?? null,
        imageAlt:    image?.altText  ?? product?.title ?? null,
      }
    }),
  }
}
