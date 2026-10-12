export type Shipping={name:string;line1:string;line2:string;city:string;postal:string;country:string};
export function postalRequired(country:string):boolean;
export function normalizeShipping(body:Record<string,unknown>,market:{countryCode:string}):Shipping;
export function shippingFromOrder(order:Record<string,any>):Shipping;
export function paypalShipping(s:Shipping):any;
export function assertShippingMatches(order:Record<string,any>,paypalOrder:any):void;
