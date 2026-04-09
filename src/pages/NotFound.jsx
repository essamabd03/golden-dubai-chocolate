import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      {/* Big decorative number */}
      <p className="font-heading text-[120px] leading-none text-accent/20 select-none">
        404
      </p>

      <h1 className="font-heading text-primary text-3xl md:text-4xl mt-2 mb-4">
        Page Not Found
      </h1>

      <p className="font-body text-text/60 mb-10">
        Looks like this page melted away. Let's get you back on track.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/"
          className="inline-block bg-primary hover:bg-primary-dark text-background font-body font-semibold px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
        >
          Go Home
        </Link>
        <Link
          to="/shop"
          className="inline-block border-2 border-accent text-accent hover:bg-accent hover:text-background font-body font-semibold px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
        >
          Browse Shop
        </Link>
      </div>
    </div>
  )
}
