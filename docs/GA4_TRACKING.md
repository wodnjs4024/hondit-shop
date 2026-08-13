# hondit GA4 tracking plan

Measurement ID: `G-FKMMTFM45C`

## Common event parameters

Every custom and recommended event includes:

- `market_code`: SG, HK, TW or JP
- `market_country`: Singapore, Hong Kong, Taiwan or Japan
- `currency`: SGD, HKD, TWD or JPY
- `display_language`: selected storefront language
- `page_type`: semantic page group
- campaign attribution and landing page fields

## Event taxonomy

| Event | Meaning |
| --- | --- |
| `page_view` | SPA route viewed |
| `view_item_list` | Product list shown on home or Products |
| `select_item` | Product, purchase route or bulk product selected |
| `view_item` | Product detail or bulk checkout detail viewed |
| `product_filter_select` | Product category filter selected |
| `navigation_click` | Internal navigation or CTA selected |
| `outbound_click` | Shopee, Instagram or another external destination selected |
| `market_change` | Storefront destination market changed |
| `language_change` | Display language changed |
| `map_stage_select` | Asia, Korea or Jeju map stage selected |
| `map_place_select` | A Jeju place selected |
| `campaign_landing` | UTM campaign landing recorded |
| `submit_inquiry` | Contact form successfully saved |
| `begin_checkout` | Valid bulk order begins PayPal checkout |
| `checkout_cancel` | PayPal approval cancelled |
| `checkout_error` | PayPal widget or checkout error |
| `purchase` | Captured order confirmation loaded |

## GA4 configuration

Event-scoped custom dimensions:

- Market code → `market_code`
- Market country → `market_country`
- Display language → `display_language`
- Page type → `page_type`

Key events:

- `begin_checkout`
- `purchase`
- `submit_inquiry`

Do not mark navigation, filters, outbound clicks or map exploration as key events.
