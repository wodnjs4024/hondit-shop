export function publicRetryContext(note?:string):{language?:string;purpose?:string;fulfillment?:string;condition?:Record<string,any>};
export function orderRetry(order:any,products:any[]|null):{href:string|null;reason:string;knownParams:string};
