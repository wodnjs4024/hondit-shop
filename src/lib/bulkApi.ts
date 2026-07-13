import { bulkProducts, type BulkProduct } from "../data/bulkProducts";

export type CheckoutItem = {
  slug: string;
  packCount: number;
};

export type CheckoutPayload = {
  orderType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  companyName?: string;
  countryCode: "SG";
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  customerNote?: string;
  attribution?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    landing_page?: string;
    referrer?: string;
  };
  cart: CheckoutItem[];
};

export type PublicOrder = {
  order_number: string;
  payment_status: string;
  order_status: string;
  payment_failure_reason?: string | null;
  paypal_order_id?: string | null;
  created_at?: string;
  updated_at?: string | null;
  total_units: number;
  total_packs: number;
  total_sgd: number;
  currency: "SGD";
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  country_code?: string;
  address_line_1?: string;
  address_line_2?: string | null;
  city?: string;
  postal_code?: string;
  items: Array<{
    product_name_snapshot: string;
    product_slug?: string;
    volume_snapshot: string;
    pack_count: number;
    total_units: number;
    line_total_sgd: number;
  }>;
};

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export async function fetchBulkProducts(): Promise<BulkProduct[]> {
  try {
    const response = await fetch("/api/products");
    const data = await parseJson<{ products: BulkProduct[] }>(response);
    return Array.isArray(data.products) ? data.products : bulkProducts;
  } catch {
    return bulkProducts;
  }
}

export async function createPayPalOrder(payload: CheckoutPayload) {
  const response = await fetch("/api/paypal/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson<{ paypalOrderId: string; orderNumber: string }>(response);
}

export async function capturePayPalOrder(paypalOrderId: string, orderNumber: string) {
  const response = await fetch("/api/paypal/capture-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paypalOrderId, orderNumber }),
  });
  return parseJson<{ orderNumber: string }>(response);
}

export async function updatePaymentAttempt(payload: {
  orderNumber: string;
  paypalOrderId?: string;
  status: "payment_failed" | "payment_cancelled";
  reason?: string;
}) {
  const response = await fetch("/api/paypal/update-attempt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJson<{ orderNumber: string; status: string }>(response);
}

export async function fetchPublicOrder(orderNumber: string) {
  const response = await fetch(`/api/orders/public/${encodeURIComponent(orderNumber)}`);
  return parseJson<{ order: PublicOrder }>(response);
}

export function getAdminToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("hondit_admin_token") || "";
}

export function setAdminToken(token: string) {
  window.localStorage.setItem("hondit_admin_token", token);
}

export function clearAdminToken() {
  window.localStorage.removeItem("hondit_admin_token");
}

export async function adminFetch<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAdminToken()}`,
      ...(options.headers || {}),
    },
  });
  return parseJson<T>(response);
}

export async function loginAdmin(email: string, password: string) {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJson<{ accessToken: string }>(response);
  setAdminToken(data.accessToken);
  return data;
}
