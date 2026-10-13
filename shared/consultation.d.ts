export function consultationContext(params:URLSearchParams,products:readonly any[],defaultMarket?:string,defaultLanguage?:string):{purpose:string;fulfillment:string;product?:{slug:string;name:string};quantity?:number;market:string;language:string;reason:string};
export function consultationBody(input:{lines?:{name:string;quantity?:number}[];market:string;language:string;reason?:string;business?:string;purpose?:string;timing?:string;additional?:string}):string;
export function consultationMailto(email:string,body:string):string;
