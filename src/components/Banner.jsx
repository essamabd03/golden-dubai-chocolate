import { Link } from 'react-router-dom'

// TODO: Replace placeholder gradient with actual hero image when asset is ready.
// Props:
//   title    (string)        — main headline
//   subtitle (string)        — supporting copy
//   image    (string | null) — background image URL
//   ctaText  (string)        — call-to-action button label
//   ctaLink  (string)        — react-router path for the CTA

export default function Banner({ title, subtitle, image, ctaText, ctaLink }) {
  return (
    <section
      className="relative w-full min-h-[520px] flex items-center justify-center overflow-hidden bg-primary"
      style={
        image
          ? {
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : {}
      }
    >
      {/* Overlay — darkens image so text stays legible */}
      <div className="absolute inset-0 bg-primary/60" aria-hidden="true" />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {title && (
          <h1 className="font-heading text-4xl md:text-6xl text-accent-light mb-4 leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="font-body text-background text-lg md:text-xl mb-8 opacity-90">
            {subtitle}
          </p>
        )}
        {ctaText && ctaLink && (
          <Link
            to={ctaLink}
            className="inline-block bg-accent hover:bg-accent-dark text-background font-body font-semibold px-8 py-3 rounded-full transition-colors duration-200"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </section>
  )
}
