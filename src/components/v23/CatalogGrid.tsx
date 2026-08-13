import { useEffect, useMemo, useState } from "react";
import { v23Products, type StorefrontProduct } from "../../data/v23SiteData";
import { loadStorefrontProducts } from "../../lib/storefrontApi";
import { isStorefrontProductAllowedForMarket, marketText, useMarket } from "../../lib/market";
import { V23ProductCard } from "./SiteChrome";

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

  return (
    <>
      {showFilters && <div className="v23-filters" role="group" aria-label="Filter products">
        {filterOptions.map((item) => (
          <button key={item} type="button" className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>
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
