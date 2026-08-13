import { useEffect, useMemo, useRef, useState } from "react";
import { v23Products, type StorefrontProduct } from "../../data/v23SiteData";
import { loadStorefrontProducts } from "../../lib/storefrontApi";
import { isStorefrontProductAllowedForMarket, marketText, useMarket } from "../../lib/market";
import { V23ProductCard } from "./SiteChrome";
import { trackEvent } from "../../lib/analytics";

export function V23CatalogGrid({
  featuredOnly = false,
  limit,
  showFilters = true,
}: {
  featuredOnly?: boolean;
  limit?: number;
  showFilters?: boolean;
}) {
  const { market, language } = useMarket();
  const [catalog, setCatalog] = useState<StorefrontProduct[]>(v23Products);
  const [filter, setFilter] = useState<"ALL" | "CARE" | "SCENT">("ALL");
  const lastTrackedList = useRef("");
  const filterLabels = {
    ALL: marketText(language, "ALL", "전체"),
    CARE: marketText(language, "CARE", "케어"),
    SCENT: marketText(language, "SCENT", "향"),
  };

  useEffect(() => {
    loadStorefrontProducts().then(setCatalog).catch(() => undefined);
  }, []);

  const filterOptions = useMemo(
    () => (["ALL", "CARE", "SCENT"] as const).filter((item) => item === "ALL" || market.allowedProductCategories.includes(item)),
    [market],
  );

  useEffect(() => {
    if (filter !== "ALL" && !market.allowedProductCategories.includes(filter)) setFilter("ALL");
  }, [filter, market]);

  const visible = useMemo(() => {
    const filtered = catalog.filter(
        (product) =>
          isStorefrontProductAllowedForMarket(product, market) &&
          (!featuredOnly || product.featured !== false) &&
          (filter === "ALL" || product.category === filter),
      );
    return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
  }, [catalog, featuredOnly, filter, limit, market]);

  useEffect(() => {
    const signature = `${market.code}:${filter}:${visible.map((product) => product.slug).join(",")}`;
    if (!visible.length || lastTrackedList.current === signature) return;
    lastTrackedList.current = signature;
    trackEvent("view_item_list", {
      item_list_name: featuredOnly ? "home_featured_products" : "products_catalog",
      filter_value: filter,
      items: visible.map((product, index) => ({
        item_id: product.slug,
        item_name: product.name,
        item_category: product.category,
        index,
        price: product.marketUnitPrices?.[market.code] ?? product.bulkUnitPrice,
        currency: market.currency,
      })),
    });
  }, [featuredOnly, filter, market, visible]);

  return (
    <>
      {showFilters && <div className="v23-filters" role="group" aria-label="Filter products">
        {filterOptions.map((item) => (
          <button key={item} type="button" className={filter === item ? "is-active" : ""} onClick={() => {
            setFilter(item);
            trackEvent("product_filter_select", { filter_name: "category", filter_value: item, item_list_name: featuredOnly ? "home_featured_products" : "products_catalog" });
          }}>
            {filterLabels[item]}
          </button>
        ))}
      </div>}
      <div className="v23-product-grid" key={`${filter}-${market.code}`} aria-live="polite">
        {visible.map((product) => <V23ProductCard product={product} key={product.slug} />)}
      </div>
    </>
  );
}
