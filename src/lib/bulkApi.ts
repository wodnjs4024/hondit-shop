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

const legacyMediaBySlug: Record<string, Pick<BulkProduct, "imageUrl" | "galleryImages" | "detailImages">> = {
  "foam-oil": {
    imageUrl: "/images/foam-oil.png",
    galleryImages: ["/images/foam-oil.png", "/images/foam-oil-texture.png", "/images/jeju-clear-water.png", "/images/cleansing-water-use.png"],
    detailImages: ["/images/foam-oil-texture.png", "/images/cleansing-water-use.png", "/images/jeju-clear-water.png"],
  },
  "foaming-cleanser": {
    imageUrl: "/images/foaming-cleanser.png",
    galleryImages: ["/images/foaming-cleanser.png", "/images/cleansing-foam-texture.png", "/images/jeju-sea-detail.png", "/images/foam-oil-texture.png"],
    detailImages: ["/images/cleansing-foam-texture.png", "/images/jeju-sea-detail.png", "/images/jeju-clear-water.png"],
  },
  "cleansing-water": {
    imageUrl: "/images/cleansing-water.png",
    galleryImages: ["/images/cleansing-water.png", "/images/cleansing-water-use.png", "/images/jeju-clear-water.png", "/images/jeju-sea-detail.png"],
    detailImages: ["/images/cleansing-water-use.png", "/images/jeju-clear-water.png", "/images/jeju-sea-detail.png"],
  },
  "diffuser-350g": {
    imageUrl: "/images/diffuser-350g.png",
    galleryImages: ["/images/diffuser-350g.png", "/images/jeju-volcanic-rock.png", "/images/jeju-stone-detail.png", "/images/jeju-sea-stone.png"],
    detailImages: ["/images/jeju-volcanic-rock.png", "/images/jeju-stone-detail.png", "/images/jeju-sea-stone.png"],
  },
  "diffuser-500g": {
    imageUrl: "/images/diffuser-500g.png",
    galleryImages: ["/images/diffuser-500g.png", "/images/jeju-volcanic-rock.png", "/images/jeju-stone-detail.png", "/images/jeju-sea-stone.png"],
    detailImages: ["/images/jeju-volcanic-rock.png", "/images/jeju-stone-detail.png", "/images/jeju-sea-stone.png"],
  },
};

function sameList(a: string[] = [], b: string[] = []) {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function withUpdatedDefaultMedia(product: BulkProduct) {
  const currentDefault = bulkProducts.find((item) => item.slug === product.slug);
  const legacy = legacyMediaBySlug[product.slug];
  if (!currentDefault || !legacy) return product;

  return {
    ...product,
    imageUrl: !product.imageUrl || product.imageUrl === legacy.imageUrl ? currentDefault.imageUrl : product.imageUrl,
    galleryImages:
      !product.galleryImages?.length || sameList(product.galleryImages, legacy.galleryImages)
        ? currentDefault.galleryImages
        : product.galleryImages,
    detailImages:
      !product.detailImages?.length || sameList(product.detailImages, legacy.detailImages)
        ? currentDefault.detailImages
        : product.detailImages,
  };
}

export async function fetchBulkProducts(): Promise<BulkProduct[]> {
  try {
    const response = await fetch("/api/products");
    const data = await parseJson<{ products: BulkProduct[] }>(response);
    return Array.isArray(data.products) ? data.products.map(withUpdatedDefaultMedia) : bulkProducts;
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
