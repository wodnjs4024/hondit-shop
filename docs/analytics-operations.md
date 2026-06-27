# hondit analytics operations

This site is designed to be used as the Instagram bio landing page for hondit.

## 1. Publish the website

Recommended production URL:

```text
https://hondit-shop.vercel.app
```

If the final Vercel URL changes, update these files:

- `index.html`
- `src/data/siteData.ts`

## 2. Create GA4 property

Create a Google Analytics 4 property and Web data stream for the final website domain.

Copy the Measurement ID. It looks like this:

```text
G-XXXXXXXXXX
```

## 3. Add GA4 ID to Vercel

In Vercel project settings, add this environment variable:

```text
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

After adding it, redeploy the site.

## 4. Instagram bio URL

Use this URL in Instagram bio:

```text
https://hondit-shop.vercel.app/?utm_source=instagram&utm_medium=bio&utm_campaign=instagram_bio_launch
```

Optional campaign variants:

```text
https://hondit-shop.vercel.app/?utm_source=instagram&utm_medium=bio&utm_campaign=instagram_bio_launch&utm_content=profile
https://hondit-shop.vercel.app/?utm_source=instagram&utm_medium=story&utm_campaign=instagram_story_launch
https://hondit-shop.vercel.app/jeju?utm_source=instagram&utm_medium=bio&utm_campaign=jeju_story
```

## 5. Events tracked

Product clicks:

- `shopee_foam_oil_click`
- `shopee_foaming_cleanser_click`
- `shopee_cleansing_water_click`
- `shopee_diffuser_500_click`
- `shopee_diffuser_350_click`

Store and social clicks:

- `shopee_shop_all_click`
- `instagram_profile_click`

Site behavior:

- `nav_jeju_click`
- `jeju_preview_click`
- `find_ritual_select`
- `faq_open`
- `section_nav_click`

Each click event includes:

- `traffic_source`
- `traffic_medium`
- `traffic_campaign`
- `traffic_content`
- `traffic_term`
- `landing_page`
- `referrer`
- `product_name`, when product-specific
- `destination_url`
- `button_location`
- `click_target`

## 6. GA4 reports to check

Use these GA4 areas first:

- Realtime: confirm clicks after testing from your phone.
- Reports > Acquisition > Traffic acquisition: check `instagram / bio`.
- Reports > Engagement > Events: compare product click events.
- Explore > Free form: create a table with event name, traffic source, campaign, product name, and event count.

## 7. Suggested weekly dashboard

Track these numbers weekly:

- Instagram bio visitors
- Total Shopee clicks
- Product click ranking
- Shopee click rate: Shopee clicks / landing page visitors
- Jeju page visits
- Jeju preview clicks
- FAQ opens

## 8. Important limitation

GA4 can track visits to this site and outbound clicks to Shopee. It cannot confirm completed Shopee purchases unless Shopee provides seller-side attribution or campaign reporting.
