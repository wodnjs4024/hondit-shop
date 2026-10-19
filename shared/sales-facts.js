// The only sales facts the AI assistant may use. Built from the same checkout rules the server charges with,
// so every price, MOQ and payment route it quotes is exactly what the shop would do today.
import { termsFor } from './market-overrides.js';
import { paypalCurrencyDigits } from './checkout-terms.js';

export const marketNames = { SG: 'Singapore', HK: 'Hong Kong', MO: 'Macau', TW: 'Taiwan', JP: 'Japan', TH: 'Thailand', MY: 'Malaysia', BN: 'Brunei' };
const sold = { SG: ['cleansing', 'diffuser'], HK: ['cleansing', 'diffuser'], MO: ['cleansing', 'diffuser'], TW: ['diffuser'], JP: ['diffuser'], TH: ['diffuser'], MY: ['diffuser'], BN: ['diffuser'] };

function money(minor, digits, currency) {
  if (minor === null || minor === undefined) return null;
  return `${(minor / 10 ** digits).toFixed(digits)} ${currency}`;
}

function line(product, market, quantity) {
  const d = termsFor(product, market, quantity);
  const digits = d.status === 'direct' ? paypalCurrencyDigits(d.billingCurrency) : d.referenceDigits;
  const unit = money(d.status === 'direct' ? d.unitMinor : d.referenceUnitMinor, digits, d.status === 'direct' ? d.billingCurrency : d.displayCurrency);
  return { decision: d, unit };
}

/* Plain-text facts for one market, or all markets. */
export function salesFacts(products, onlyMarket) {
  const out = [
    'COMPANY: HONDIT ships Jeju (Korea) volcanic-stone diffusers and vegan cleansers by EMS from Korea.',
    'TAX: import tax, duties and customs fees are not included and are paid by the recipient.',
    'PAYMENT: direct orders are paid by PayPal (PayPal balance or card through PayPal) on the product page: choose quantity, enter delivery details, pay.',
    'ORDER STATUS: customers use the link in their order email, or contact the team. The assistant cannot see orders.',
    'CONTACT: contact form at /contact (also for quotes, custom quantities, mixed products, wholesale terms).',
    'NOT KNOWN (never guess; offer to have the team confirm): delivery days, stock dates, discounts, custom logos or packaging, certificates, ingredients beyond the product text, samples other than the 10-unit diffuser trial.',
  ];
  for (const product of products) {
    out.push(`PRODUCT ${product.slug}: ${product.name} ${product.volumeLabel || ''}. ${product.description || product.shortDescription || ''} Features: ${(product.features || []).join(', ')}. Page: /products/${product.slug}`);
  }
  for (const market of Object.keys(marketNames)) {
    if (onlyMarket && market !== onlyMarket) continue;
    out.push(`MARKET ${market} (${marketNames[market]}):`);
    for (const product of products) {
      if (!sold[market].includes(product.category) || product.status === 'draft' || product.status === 'hidden') {
        continue;
      }
      if (product.markets?.[market] === 'hidden') continue;
      const diffuser = product.category === 'diffuser';
      const minimum = diffuser ? 20 : 30;
      const general = line(product, market, minimum);
      const d = general.decision;
      if (d.status === 'unavailable' && d.reason !== 'quantity_condition_scope') {
        out.push(`- ${product.slug}: not available in this market right now.`);
        continue;
      }
      const route = d.status === 'direct'
        ? `pay directly by PayPal, EMS delivery included${diffuser ? `, any quantity from ${minimum} to 9999` : `, exactly ${minimum} units per order (other quantities by quote)`}`
        : 'quote only: use /contact; the team confirms the total before payment';
      out.push(`- ${product.slug}: ${general.unit ? `${general.unit} per unit` : 'price on request'}, minimum ${minimum} units, ${route}. Link: /products/${product.slug}?market=${market}`);
      if (diffuser) {
        const trial = line(product, market, 10);
        if (trial.unit) out.push(trial.decision.status === 'direct'
          ? `  10-unit trial order: ${trial.unit} per unit, pay directly by PayPal, delivery included.`
          : `  10-unit trial order: reference ${trial.unit} per unit, quote only (team confirms the final amount first).`);
      }
    }
  }
  return out.join('\n');
}
