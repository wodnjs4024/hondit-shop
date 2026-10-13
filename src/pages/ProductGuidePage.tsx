import {useState} from "react";
import { Link, useParams } from "react-router-dom";
import { V23Page } from "../components/v23/SiteChrome";
import { v23Products } from "../data/v23SiteData";
import { productFacts } from "../data/productFacts";
import { ProductCare } from "../components/ProductFactsDisplay";
import { marketProductText, marketText, useMarket } from "../lib/market";
import { cleanProductUsage } from "../../shared/page-sales.js";
import { NotFoundPage } from "./NotFoundPage";
export function ProductGuidePage() {
  const { productId } = useParams();
  const [shareStatus,setShareStatus]=useState("");
  const p = v23Products.find((p) => p.slug === productId);
  const { language, market } = useMarket();
  const t = (s: string) => marketText(language, s);
  if (!p) return <NotFoundPage />;
  const facts = productFacts(p.slug);
  return (
    <V23Page>
      <main className="product-guide-page">
        <header>
          <p className="v23-eyebrow">{t("Product care & follow-up")}</p>
          <h1>{marketProductText(language, p.name)}</h1>
          <p>
            {marketProductText(language, facts?.description || p.description)}
          </p>
        </header>
        <img
          src={p.image}
          alt={marketProductText(language, p.name)}
          width="480"
          height="480"
        />
        <button type="button" onClick={async()=>{const url=new URL('/guide/'+p.slug,window.location.origin);url.searchParams.set('market',market.code);url.searchParams.set('lang',language);try{if(navigator.share)await navigator.share({title:marketProductText(language,p.name),url:url.href});else {await navigator.clipboard.writeText(url.href);setShareStatus('Copied.')}}catch(issue){if((issue as Error).name!=='AbortError')setShareStatus('Copy unavailable. Select the text below to copy.')}}}>{t("Share this product guide")}</button><p role="status">{t(shareStatus)}</p>{shareStatus.startsWith('Copy unavailable')&&<p>{window.location.origin+'/guide/'+p.slug+'?market='+market.code+'&lang='+language}</p>}
        <h2>{t("HOW TO USE")}</h2>
        <ol>
          {cleanProductUsage(p.howTo).map((s) => (
            <li key={s}>{marketProductText(language, s)}</li>
          ))}
        </ol>
        <ProductCare slug={p.slug} />
        <p>
          {t(
            "Reorders require a new check of current prices, availability and delivery conditions.",
          )}
        </p>
        <Link
          to={`/contact?product=${p.slug}&market=${market.code}&lang=${language}&reason=product`}
        >
          {t("Reorder consultation")} →
        </Link>
      </main>
    </V23Page>
  );
}
