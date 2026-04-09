import { useState, useEffect } from 'react'

// ─── ZIP validation ────────────────────────────────────────────────────────────
// Accepts exactly 5 US digits (e.g. "77001"). We allow the user to type freely
// and only show an error once they've touched the field and left it, or tried
// to submit with an invalid value.
const US_ZIP_RE = /^\d{5}$/

/**
 * LocalPickupSelector
 *
 * Props:
 *   onConfirm  (fn) — called with { isLocalPickup: true, zipCode } when confirmed
 *   onClear    (fn) — called with { isLocalPickup: false, zipCode: '' } when cleared
 *   isConfirmed (bool) — controlled: true when pickup is already stored in context
 *   zipCode     (string) — controlled: current stored ZIP code
 */
export default function LocalPickupSelector({
  onConfirm,
  onClear,
  isConfirmed = false,
  zipCode:     storedZip = '',
}) {
  const [zip,          setZip]          = useState(storedZip)
  const [agreed,       setAgreed]       = useState(isConfirmed)
  const [zipTouched,   setZipTouched]   = useState(false)

  // Stay in sync if parent resets (e.g. cart cleared)
  useEffect(() => {
    setZip(storedZip)
    setAgreed(isConfirmed)
    setZipTouched(false)
  }, [storedZip, isConfirmed])

  const zipValid   = US_ZIP_RE.test(zip.trim())
  const zipError   = zipTouched && zip.trim().length > 0 && !zipValid
  const canConfirm = zipValid && agreed && !isConfirmed

  function handleZipChange(e) {
    // Only allow digits, max 5
    const val = e.target.value.replace(/\D/g, '').slice(0, 5)
    setZip(val)
  }

  function handleConfirm(e) {
    e.preventDefault()
    if (!canConfirm) return
    onConfirm?.({ isLocalPickup: true, zipCode: zip.trim() })
  }

  function handleClear() {
    setZip('')
    setAgreed(false)
    setZipTouched(false)
    onClear?.({ isLocalPickup: false, zipCode: '' })
  }

  // ── Confirmed state — show green badge ─────────────────────────────────────
  if (isConfirmed) {
    return (
      <div className="border border-green-200 rounded-xl p-5 bg-green-50 flex items-start gap-3">
        {/* Green checkmark circle */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="white"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div className="flex-1">
          <p className="font-body font-semibold text-green-800 text-sm">
            Local Pickup Selected
          </p>
          <p className="font-body text-green-700 text-xs mt-0.5">
            ZIP: {storedZip} — Location details sent after order is placed.
          </p>
        </div>

        <button
          onClick={handleClear}
          className="font-body text-xs text-green-600 hover:text-green-800 underline underline-offset-2 flex-shrink-0 mt-0.5 transition-colors"
        >
          Change
        </button>
      </div>
    )
  }

  // ── Form state ─────────────────────────────────────────────────────────────
  return (
    <div className="border border-accent/30 rounded-xl p-5 bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg" aria-hidden="true">📍</span>
        <h3 className="font-heading text-primary text-lg">Local Pickup</h3>
      </div>

      <form onSubmit={handleConfirm} noValidate className="space-y-4">

        {/* ZIP code field */}
        <div>
          <label
            htmlFor="pickup-zip"
            className="block font-body text-sm font-medium text-text mb-1"
          >
            Your ZIP Code
            <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>
          </label>
          <input
            id="pickup-zip"
            type="text"
            inputMode="numeric"
            value={zip}
            onChange={handleZipChange}
            onBlur={() => setZipTouched(true)}
            placeholder="e.g. 77001"
            maxLength={5}
            aria-describedby={zipError ? 'zip-error' : undefined}
            className={`
              w-full border rounded-lg px-4 py-2.5 font-body text-text bg-white
              focus:outline-none focus:ring-2 transition-colors
              ${zipError
                ? 'border-red-400 focus:ring-red-200'
                : zipValid
                  ? 'border-green-400 focus:ring-green-200'
                  : 'border-accent/40 focus:ring-accent/30'
              }
            `}
          />
          {zipError && (
            <p id="zip-error" className="font-body text-xs text-red-500 mt-1">
              Please enter a valid 5-digit US ZIP code.
            </p>
          )}
          {zipValid && (
            <p className="font-body text-xs text-green-600 mt-1">
              Looks good!
            </p>
          )}
        </div>

        {/* Agreement checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-accent flex-shrink-0"
          />
          <span className="font-body text-sm text-text/80 group-hover:text-text leading-relaxed transition-colors">
            I understand the pickup location will be provided after purchase, and
            I agree to collect my order within the specified pickup window.
          </span>
        </label>

        {/* Confirm button */}
        <button
          type="submit"
          disabled={!canConfirm}
          className="w-full bg-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark text-background font-body font-semibold py-2.5 rounded-lg text-sm transition-colors duration-200"
        >
          Confirm Pickup
        </button>
      </form>
    </div>
  )
}
