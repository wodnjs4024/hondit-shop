-- Pins the search_path of the Journal approval guard (Supabase linter: function_search_path_mutable).
-- The function only uses built-ins (now, coalesce, jsonb ->>), which resolve from pg_catalog with an empty path.
-- Safe to run more than once; changes no data and no behaviour.
alter function public.journal_articles_guard() set search_path = '';
