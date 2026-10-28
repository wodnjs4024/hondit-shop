export type StonejejuPack={sku:string;market:string;quantity:number;currency:string;digits:number;totalMinor:number;priceApproval:string;version:string;shippingIncluded:boolean;tax:string;checkoutEnabled:boolean;verification:string;billingCurrency:string|null};
export const stonejejuPacks:readonly StonejejuPack[];
export const packQuantities:readonly number[];
export const packLabels:Readonly<Record<number,string>>;
export function stonejejuPack(product:any,market:string,quantity:string|number):StonejejuPack|null;
