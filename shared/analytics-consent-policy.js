// Browser and server use the same policy. A grant is not renewed by collecting an ID.
export const CONSENT_VERSION = '2026-10-17-v1';
export const CONSENT_MAX_AGE_MS = 180 * 86400000;
export function consentDecision({state, version, grantedAt}, now = Date.now(), occurredAt) {
  if (state !== 'granted') return {allowed:false, reason:'consent_not_granted'};
  if (version !== CONSENT_VERSION) return {allowed:false, reason:'consent_policy_mismatch'};
  const at = typeof grantedAt === 'number' ? grantedAt : typeof grantedAt === 'string' ? Date.parse(grantedAt) : NaN;
  if (!Number.isFinite(at) || at <= 0 || at > now) return {allowed:false, reason:'consent_time_missing_or_invalid'};
  if (now - at >= CONSENT_MAX_AGE_MS) return {allowed:false, reason:'consent_expired'};
  if (occurredAt !== undefined) {
    const eventAt = typeof occurredAt === 'number' ? occurredAt : Date.parse(occurredAt);
    if (!Number.isFinite(eventAt) || eventAt < at || eventAt > now) return {allowed:false, reason:'event_outside_consent'};
  }
  return {allowed:true, reason:null};
}
export function contextConsentDecision(context = {}, now = Date.now(), occurredAt) {
  return consentDecision({state:context.consent_state === 'granted' ? context.consent : context.consent_state, version:context.consent_version, grantedAt:context.consent_granted_at}, now, occurredAt);
}
