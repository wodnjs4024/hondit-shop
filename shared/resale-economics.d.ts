export type ResaleTerms={unitMinor:number;quantity:number;currency:string;totalMinor:number;moq:number};
export function approvedResaleTerms(product:any,market:string,quantity:string|number):ResaleTerms|null;
export function resaleEconomics(terms:ResaleTerms|null,input:Record<string,string>):null|{price:number;inbound:number;selling:number;fixed:number;discount:number;revenue:number;purchase:number;initial:number;unitDifference:number;totalDifference:number;margin:number|null;recovery:number|null;exceedsQuantity:boolean;digits:number};
