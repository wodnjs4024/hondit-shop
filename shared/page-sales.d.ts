export function sgTerms(product: {slug?:string;apiSlug?:string}): {unitMinor:number;moq:number;step:number}|null;
export function cleanProductUsage(lines?:string[]):string[];
export function sgCheckoutNeedsInquiry(lines: Array<{product:{slug?:string;apiSlug?:string};quantity?:number;packCount?:number;totalUnits?:number}>, marketCode:string):boolean;
