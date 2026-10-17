export type Touch={captured_at:number;landing_page:string;referrer:string;utm_source:string;utm_medium:string;utm_campaign?:string;utm_content?:string;utm_term?:string;community_id?:string;link_id?:string};
export function createAttributionStore(options?:{storage?:()=>Storage|undefined;now?:()=>number}):{
 capture(input:{url:string;referrer?:string;short?:unknown}):Touch|null;
 persist():void;clear():void;current():Touch|null;checkout():Record<string,string>;entry():Touch|null;
 snapshot():{version:number;first:Touch|null;last:Touch|null;legacy:Touch|null};
};

export function cleanCheckoutAttribution(input?:unknown):Record<string,string>;
