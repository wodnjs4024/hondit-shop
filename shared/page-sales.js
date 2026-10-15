// Page-only release: no database schema dependency. Other markets retain legacy prices.
const sg = Object.freeze({ 'foam-oil': [890,30], 'foaming-cleanser': [890,30], 'cleansing-water': [890,30], 'diffuser-350g': [2100,20], 'diffuser-500g': [4600,20] });
export function sgTerms(product) { const value=sg[product?.apiSlug || product?.slug]; return value ? { unitMinor:value[0], moq:value[1], step:10 } : null; }
export function cleanProductUsage(lines = []) {
  return lines.filter(line => typeof line === 'string' && !/(singapore|ems|shipping|delivery|freight|moq|minimum.{0,20}(order|quantity)|\bpack(s)?\b|\b(sgd|hkd|jpy|s\$)\b|배송|최소.{0,10}(주문|수량)|팩\s*단위|送料|配送|起订|起訂)/i.test(line));
}
export function sgCheckoutNeedsInquiry(lines, marketCode) {
  if (marketCode !== 'SG') return false;
  const known=lines.filter(line => sgTerms(line.product));
  return known.length > 0 && (lines.length !== 1 || known.some(line => {
    const quantity=Number(line.quantity ?? line.packCount ?? line.totalUnits);
    const sku=line.product.apiSlug||line.product.slug;
    if (['diffuser-350g','diffuser-500g'].includes(sku)) {
      return !Number.isSafeInteger(quantity) || !(quantity===10 || quantity>=20 && quantity<=9999);
    }
    return quantity!==sgTerms(line.product).moq;
  }));
}
