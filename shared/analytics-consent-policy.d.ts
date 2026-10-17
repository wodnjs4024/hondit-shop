export const CONSENT_VERSION:string;
export const CONSENT_MAX_AGE_MS:number;
export function consentDecision(input:{state?:unknown;version?:unknown;grantedAt?:unknown},now?:number,occurredAt?:string|number):{allowed:boolean;reason:string|null};
export function contextConsentDecision(context?:Record<string,unknown>,now?:number,occurredAt?:string|number):{allowed:boolean;reason:string|null};
