export const campaignKeys:string[];export const productIds:string[];export const marketIds:string[];export const languageIds:string[];
export function publicToken(value:unknown,max?:number):string;
export function safePath(path?:string):string;
export function functionalParams(input?:string|URLSearchParams):URLSearchParams;
export function safeLanding(input:string):string;
export function safeReferrer(input:string,origin?:string):string;
export function safeEventParams(input?:Record<string,unknown>):Record<string,unknown>;
export function analyticsTarget(env:Record<string,unknown>,hostname:string):string;
