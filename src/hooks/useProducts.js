import { useState, useEffect } from 'react'
import { fetchProducts } from '../lib/shopify'

/**
 * Fetch all products from the Shopify Storefront API.
 *
 * @param {number} [first=50] - Max number of products to return
 * @returns {{ products: Array, isLoading: boolean, error: string|null }}
 */
export function useProducts(first = 50) {
  const [products, setProducts]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const data = await fetchProducts(first)
        if (!cancelled) setProducts(data)
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Failed to load products.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()

    // Cleanup: if the component unmounts mid-fetch, discard the result
    return () => { cancelled = true }
  }, [first])

  return { products, isLoading, error }
}
