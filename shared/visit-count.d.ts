export function visitCountUrl(href: string): string | null;
export function visitCountEvent<T extends { url: string }>(event: T): T | null;
