export const purchasePurposes:string[];
export const purposeLabels:Record<string,string>;
export function purchaseContext(input?:{fulfillment?:string;purpose?:string}):{fulfillment:string;purpose:string};
export function purchaseRoute(lines:{product:any;quantity:number}[],marketCode:string):'direct'|'consultation'|'confirmation';
