insert into public.products (
  id, slug, name, category, volume_label, short_description, description, image_url,
  unit_price_sgd, pack_quantity, pack_price_sgd, unit_weight_kg, inventory_packs,
  active, purchase_enabled, sort_order, features, usage
) values
('foam-oil', 'foam-oil', 'J''essence Vegan Foam Oil', 'cleansing', '150ml', 'One-step cleansing for makeup and sunscreen routines.', 'A gentle vegan foam oil selected for daily cleansing routines in warm Singapore weather.', '/images/foam-oil.png', 8.50, 30, 255.00, 0.180, 20, true, true, 10, array['Vegan cleansing', 'Milky oil texture', 'Daily sunscreen removal'], array['Order by 30-unit pack', 'Singapore EMS included']),
('foaming-cleanser', 'foaming-cleanser', 'J''essence Vegan Foaming Cleanser', 'cleansing', '200ml', 'Soft daily face wash for a clean, comfortable finish.', 'A soft foaming cleanser for everyday wash routines, selected for simple and clear skin care.', '/images/foaming-cleanser.png', 8.50, 30, 255.00, 0.230, 20, true, true, 20, array['Soft foam', 'Daily wash', 'Vegan care'], array['Order by 30-unit pack', 'Singapore EMS included']),
('cleansing-water', 'cleansing-water', 'J''essence Vegan Cleansing Water', 'cleansing', '300ml', 'Light cleansing water for quick reset moments.', 'A lightweight cleansing water for light makeup, sunscreen residue and quick daily cleansing.', '/images/cleansing-water.png', 8.50, 30, 255.00, 0.340, 20, true, true, 30, array['Light finish', 'Cotton pad routine', 'Daily reset'], array['Order by 30-unit pack', 'Singapore EMS included']),
('diffuser-350g', 'diffuser-350g', 'Volcanic Stone Diffuser', 'diffuser', '350g', 'Compact volcanic stone scent object for smaller corners.', 'A compact Jeju volcanic stone diffuser with citrus oil, suited for desks, shelves and personal spaces.', '/images/diffuser-350g.png', 21.00, 20, 420.00, 0.480, 12, true, true, 40, array['Jeju volcanic stone', 'Citrus oil', 'Small spaces'], array['Order by 20-unit pack', 'Singapore EMS included']),
('diffuser-500g', 'diffuser-500g', 'Volcanic Stone Diffuser', 'diffuser', '500g', 'Fuller volcanic stone diffuser for rooms and shared spaces.', 'A larger Jeju volcanic stone diffuser with citrus oil, suited for bedrooms, bathrooms and shared spaces.', '/images/diffuser-500g.png', 46.00, 20, 920.00, 0.680, 10, true, true, 50, array['Jeju volcanic stone', 'Citrus oil', 'Rooms and shared spaces'], array['Order by 20-unit pack', 'Singapore EMS included'])
on conflict (id) do update set
  unit_price_sgd = excluded.unit_price_sgd,
  pack_quantity = excluded.pack_quantity,
  pack_price_sgd = excluded.pack_price_sgd,
  inventory_packs = excluded.inventory_packs,
  active = excluded.active,
  purchase_enabled = excluded.purchase_enabled,
  updated_at = now();
