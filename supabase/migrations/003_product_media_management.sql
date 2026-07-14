alter table public.products
  add column if not exists gallery_images text[] default '{}',
  add column if not exists detail_images text[] default '{}',
  add column if not exists detail_highlights text[] default '{}',
  add column if not exists detail_how_to_use text[] default '{}';

