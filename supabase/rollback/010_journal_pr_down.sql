-- Rollback for 010_journal_pr.sql. Drops ONLY the Journal/PR tables created by 010.
-- Run the export in docs/journal-pr-system.md ("백업") first if any article or outreach row should be kept.
drop table if exists public.journal_distributions;
drop table if exists public.journal_publish_log;
drop table if exists public.pr_outreach;
drop table if exists public.journal_articles;
drop function if exists public.journal_articles_guard();
notify pgrst, 'reload schema';
