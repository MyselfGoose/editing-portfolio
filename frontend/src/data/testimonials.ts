/**
 * Honest social proof quotes only.
 * Leave empty until real, attributed client quotes are available.
 * UI must render nothing when this list is empty — never invent quotes.
 */
export interface Testimonial {
  readonly quote: string;
  readonly attribution: string;
  readonly role?: string;
}

export const testimonials: ReadonlyArray<Testimonial> = [];

export function getPublishableTestimonials(): ReadonlyArray<Testimonial> {
  return testimonials.filter(
    (entry) =>
      entry.quote.trim().length > 0 && entry.attribution.trim().length > 0,
  );
}
