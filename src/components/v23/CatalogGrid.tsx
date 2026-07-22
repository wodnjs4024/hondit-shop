import { useEffect, useMemo, useState } from "react";
import { v23Products, type StorefrontProduct } from "../../data/v23SiteData";
import { loadStorefrontProducts } from "../../lib/storefrontApi";
import { V23ProductCard } from "./SiteChrome";

export function V23CatalogGrid({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const [catalog, setCatalog] = useState<StorefrontProduct[]>(v23Products);
  const [filter, setFilter] = useState<"ALL" | "CARE" | "SCENT">("ALL");

  useEffect(() => {
    loadStorefrontProducts().then(setCatalog).catch(() => undefined);
  }, []);

  const visible = useMemo(
    () => catalog.filter((product) => (!featuredOnly || product.featured !== false) && (filter === "ALL" || product.category === filter)),
    [catalog, featuredOnly, filter],
  );

  return (
    <>
      <div className="v23-filters" role="group" aria-label="Filter products">
        {(["ALL", "CARE", "SCENT"] as const).map((item) => (
          <button key={item} type="button" className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="v23-product-grid">
        {visible.map((product) => <V23ProductCard product={product} key={product.slug} />)}
      </div>
    </>
  );
}
