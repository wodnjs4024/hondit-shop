import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  reviewAmount,
  allocateQuantity,
  resaleDifference,
  parseMinor,
  reviewCheckout,
  selectionUrl,
} from "../shared/sales-tools.js";
import { salesToolsCopy } from "../shared/sales-tools-copy.js";
import {
  consultationBody,
  consultationMailto,
} from "../shared/consultation.js";
const read = (p) =>
  fs.readFileSync(new URL("../" + p, import.meta.url), "utf8");
test("review arithmetic uses currency precision and rejects malformed inputs", () => {
  assert.equal(reviewAmount("8.90", 30, "SGD").totalMinor, 26700);
  assert.equal(reviewAmount(21, 20, "SGD").totalMinor, 42000);
  assert.equal(reviewAmount(46, 20, "SGD").totalMinor, 92000);
  assert.deepEqual(reviewAmount(2400, 20, "JPY"), {
    unitMinor: 2400,
    totalMinor: 48000,
    digits: 0,
  });
  assert.equal(reviewAmount("2700", 20, "JPY").totalMinor, 54000);
  for (const q of ["0", "-1", "2.5", "NaN", "10000", "1e2"])
    assert.equal(reviewAmount("8.90", q, "SGD"), null);
  for (const amount of ["-1", "1.001", "Infinity", "1e2", ""])
    assert.equal(parseMinor(amount, "SGD"), null);
  assert.equal(parseMinor("2400.50", "JPY"), null);
});
test("display, sale and reserve always sum to the selected quantity", () => {
  for (let total = 1; total <= 9999; total += 137) {
    for (const [display, reserve] of [
      [0, 0],
      [1, 2],
      [9999, 9999],
      [-4, Infinity],
      [3.7, 6.5],
    ]) {
      const a = allocateQuantity(total, display, reserve);
      assert.equal(a.display + a.sale + a.reserve, total);
      for (const n of [a.display, a.sale, a.reserve])
        assert.ok(Number.isInteger(n) && n >= 0);
    }
  }
  assert.equal(allocateQuantity("1.5"), null);
});
test("resale is a signed simple difference for sale allocation only", () => {
  assert.deepEqual(resaleDifference("30.00", 2100, 15, "SGD"), {
    unitMinor: 900,
    totalMinor: 13500,
  });
  assert.deepEqual(resaleDifference("10.00", 2100, 15, "SGD"), {
    unitMinor: -1100,
    totalMinor: -16500,
  });
  assert.deepEqual(resaleDifference("3000", 2400, 15, "JPY"), {
    unitMinor: 600,
    totalMinor: 9000,
  });
  assert.equal(resaleDifference("-30", 2100, 15, "SGD"), null);
  assert.equal(resaleDifference("30", 2100, -1, "SGD"), null);
});
test("SG review permits delivered diffuser 20+ and preserves cleansing MOQ and mix restrictions", () => {
  for (const [slug, moq] of [
    ["foam-oil", 30],
    ["foaming-cleanser", 30],
    ["cleansing-water", 30],
    ["diffuser-350g", 20],
    ["diffuser-500g", 20],
  ]) {
    assert.equal(reviewCheckout({ slug }, moq, "SG"), true);
    assert.equal(reviewCheckout({ slug }, moq + 10, "SG"), true);
    assert.equal(reviewCheckout({ slug }, moq + 5, "SG"), slug.startsWith("diffuser-"));
    assert.equal(reviewCheckout({ slug }, moq - 1, "SG"), false);
  }
  assert.equal(reviewCheckout({ slug: "cleansing-mix" }, 30, "SG"), false);
});
test("consultation retains selection and review disclaimer without submitting", () => {
  const url = new URL(
    selectionUrl("/contact", {
      slug: "diffuser-350g",
      quantity: 23,
      market: "JP",
      language: "ja",
      reason: "quantity",
    }),
    "https://example.test",
  );
  assert.equal(url.searchParams.get("quantity"), "23");
  assert.equal(url.searchParams.get("market"), "JP");
  const body = consultationBody({
    lines: [{ name: "Volcanic Diffuser 350g", quantity: 23 }],
    market: "JP",
    language: "en",
    purpose: "Resale",
    reason: "partner",
    additional: "Review only — not a confirmed quotation or purchase order.",
  });
  assert.match(body, /23/);
  assert.match(body, /Resale/);
  assert.match(body, /not a confirmed quotation/);
  assert.equal(
    new URL(consultationMailto("example@example.test", body)).searchParams.get(
      "body",
    ),
    body,
  );
});
test("all new operational text has five non-English translations", () => {
  for (const [en, copy] of Object.entries(salesToolsCopy))
    for (const lang of ["ko", "zh-HK", "ja", "ms", "th"])
      assert.ok(copy[lang] && copy[lang] !== en, `${lang}: ${en}`);
});
test("published stockists have sources and no fabricated photos, inventory or coordinates", () => {
  const publicRows = JSON.parse(read("src/data/jejuStockists.json"));
  const audit = JSON.parse(read("docs/sources/stockist-verification.json"));
  assert.equal(audit.length, 16);
  assert.equal(new Set(audit.map((r) => r.id)).size, 16);
  assert.ok(publicRows.length > 0 && publicRows.length < 16);
  for (const s of publicRows) {
    assert.equal(s.published, true);
    assert.equal(s.photo, null);
    assert.equal(s.stockStatus, "unconfirmed");
    assert.ok(s.locationSourceUrl);
    assert.equal(s.checkedOn, "2026-10-13");
    if (s.lat !== null) {
      assert.ok(s.lat > 33 && s.lat < 34);
      assert.ok(s.lon > 126 && s.lon < 127.1);
    }
  }
  assert.equal(
    publicRows.some((s) => s.id === "shinhwa"),
    false,
  );
});
test("official container and 500g dimensions stay separate from prices", () => {
  const facts = read("src/data/productFacts.ts");
  assert.match(facts, /75 × 100 × 75 mm/);
  assert.match(facts, /100 × 105 × 100 mm/);
  assert.match(facts, /Glass vessel/);
  assert.match(facts, /Jeju onggi pottery/);
  assert.doesNotMatch(facts, /20000|50000|2700|2400/);
});
test("sales card and partner guide contain no wholesale price or checkout", () => {
  const business = read("src/components/BusinessPlanner.tsx");
  const card = business.match(/<article\s+className="store-sales-card"[\s\S]+?<\/article>/)?.[0];
  assert.ok(card);
  assert.doesNotMatch(
    card,
    /getMarketUnitPrice|totalMinor|bulk-orders|PayPal|mailto:|QR/,
  );
  const guide = read("src/pages/PartnerGuidePage.tsx");
  assert.doesNotMatch(guide, /bulk-orders|formatCurrency|getMarketUnitPrice/);
  assert.match(read("src/styles/sales-tools.css"), /@media print/);
  assert.match(business, /window\.print\(\)/);
});
test("new routes preserve old routes and campaign attribution without migrations", () => {
  const app = read("src/App.tsx");
  for (const route of [
    "/jeju/stores",
    "/guide/:productId",
    "/partners/:slug",
    "/bulk-orders/:slug",
    "/sg/ig",
    "/jp/c01",
  ])
    assert.ok(app.includes(route));
  assert.match(app, /utm_source/);
  assert.doesNotMatch(
    read("src/components/BusinessPlanner.tsx"),
    /sales_conditions|\/api\/quotes|POST/,
  );
});
