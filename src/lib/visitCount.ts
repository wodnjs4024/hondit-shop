import { visitCountEvent } from '../../shared/visit-count.js';
type VaQueue = ((...args: unknown[]) => void) & { q?: unknown[] };
declare global { interface Window { va?: VaQueue; vaq?: unknown[] } }

/** Loads Vercel Web Analytics on the deployed site. Does nothing until Web Analytics is enabled for the project. */
export function initVisitCount() {
  if (typeof window === 'undefined' || !/\.vercel\.app$|^hondit/.test(window.location.hostname)) return;
  if (document.querySelector('script[data-visit-count]')) return;
  window.va = window.va || function (...args: unknown[]) { (window.vaq = window.vaq || []).push(args); };
  window.va('beforeSend', visitCountEvent);
  const script = document.createElement('script');
  script.src = '/_vercel/insights/script.js';
  script.defer = true;
  script.dataset.visitCount = '';
  document.head.appendChild(script);
}
