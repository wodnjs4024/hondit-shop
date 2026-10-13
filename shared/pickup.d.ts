export const pickupConfig:{fulfillment:string;sku:string;referenceCurrency:string;unitAmount:number;min:number;max:number;operationsApproved:boolean;reservationsEnabled:boolean;paymentEnabled:boolean;billingCurrency:null;billingUnitAmount:null;dates:string[];timeSlots:string[];locations:string[]};
export function pickupAmount(quantity:number):number;
export function transitionPickup(record:any,action:string,context?:any):any;
