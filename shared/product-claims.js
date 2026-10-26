// The manufacturer's Korean and English material disagree on the cleansing water's pH, so the figure is not repeated
// in new crawler-facing output (server HTML, product structured data) until it is checked.
export const withoutUnverifiedPh = (slug, text) => (slug === 'cleansing-water' && typeof text === 'string'
  ? text.replace(/\s*\bpH\s*\d+(?:\.\d+)?\b/gi, '').replace(/\s{2,}/g, ' ').trim() : text);
