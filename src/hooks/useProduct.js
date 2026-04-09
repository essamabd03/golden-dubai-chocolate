import { useState, useEffect } from 'react'
import { fetchProductByHandle } from '../lib/shopify'

/**
 * Fetch a single product by its URL handle from the Shopify Storefront API.
 *
 * @param {string} handle - The product's URL slug (e.g. "classic-pistachio-bar")
 * @returns {{ product: Object|null, isLoading: boolean, error: string|null }}
 */
export function useProduct(handle) {
  const [product, setProduct]     = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    if (!handle) return

    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      setProduct(null)

      try {
        const data = await fetchProductByHandle(handle)
        if (!cancelled) {
          if (!data) setError('Product not found.')
          else setProduct(data)
        }
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Failed to load product.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    return () => { cancelled = true }
  }, [handle])

  return { product, isLoading, error }
}
