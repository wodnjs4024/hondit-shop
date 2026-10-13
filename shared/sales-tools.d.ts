export function currencyDigits(currency: string): number;
export function parseMinor(
  value: string | number,
  currency: string,
): number | null;
export function validQuantity(value: string | number): boolean;
export function reviewAmount(
  unit: string | number,
  quantity: string | number,
  currency: string,
): { unitMinor: number; totalMinor: number; digits: number } | null;
export function allocateQuantity(
  total: string | number,
  display?: number,
  reserve?: number,
): { display: number; sale: number; reserve: number; total: number } | null;
export function resaleDifference(
  salePrice: string | number,
  unitMinor: number,
  saleQuantity: number,
  currency: string,
): { unitMinor: number; totalMinor: number } | null;
export function reviewCheckout(
  product: any,
  quantity: string | number,
  marketCode: string,
): boolean;
export function selectionUrl(
  path: string,
  input: {
    slug: string;
    quantity: string | number;
    market: string;
    language: string;
    reason?: string; purpose?:string;
  },
): string;
