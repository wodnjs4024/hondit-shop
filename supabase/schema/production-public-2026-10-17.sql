-- Production public schema as of 2026-10-17 (structure only, no rows), dumped read-only with pg_dump 18.6 from PostgreSQL 17.6.
-- Real starting point for staging and future migrations; repo migrations 003/004 were never applied in production.
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

-- CREATE SCHEMA public;  (exists in every Supabase project)


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_profiles (
    user_id uuid NOT NULL,
    email text NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.admin_profiles OWNER TO postgres;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id text,
    product_slug text NOT NULL,
    product_name_snapshot text NOT NULL,
    volume_snapshot text NOT NULL,
    unit_price_sgd_snapshot numeric(10,2) NOT NULL,
    pack_quantity_snapshot integer NOT NULL,
    pack_price_sgd_snapshot numeric(10,2) NOT NULL,
    pack_count integer NOT NULL,
    total_units integer NOT NULL,
    line_total_sgd numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    previous_status text,
    new_status text NOT NULL,
    changed_by uuid,
    note text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.order_status_history OWNER TO postgres;

--
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number text NOT NULL,
    order_type text NOT NULL,
    customer_name text NOT NULL,
    customer_email text NOT NULL,
    customer_phone text NOT NULL,
    company_name text,
    country_code text DEFAULT 'SG'::text NOT NULL,
    address_line_1 text NOT NULL,
    address_line_2 text,
    city text NOT NULL,
    postal_code text NOT NULL,
    customer_note text,
    internal_note text,
    currency text DEFAULT 'SGD'::text NOT NULL,
    total_packs integer NOT NULL,
    total_units integer NOT NULL,
    total_sgd numeric(10,2) NOT NULL,
    shipping_included boolean DEFAULT true,
    payment_provider text DEFAULT 'paypal'::text,
    payment_status text DEFAULT 'pending'::text NOT NULL,
    order_status text DEFAULT 'pending_payment'::text NOT NULL,
    paypal_order_id text,
    paypal_capture_id text,
    paypal_payer_id text,
    tracking_carrier text,
    tracking_number text,
    paid_at timestamp with time zone,
    shipped_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    shipping_note text,
    cancellation_reason text,
    refund_reason text,
    refunded_at timestamp with time zone,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    landing_page text,
    referrer text
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Name: payment_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    provider text DEFAULT 'paypal'::text NOT NULL,
    provider_event_id text,
    event_type text NOT NULL,
    paypal_order_id text,
    paypal_capture_id text,
    amount_sgd numeric(10,2),
    currency text,
    verified boolean DEFAULT false,
    raw_payload jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.payment_events OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    volume_label text NOT NULL,
    short_description text NOT NULL,
    description text NOT NULL,
    image_url text NOT NULL,
    unit_price_sgd numeric(10,2) NOT NULL,
    pack_quantity integer NOT NULL,
    pack_price_sgd numeric(10,2) NOT NULL,
    unit_weight_kg numeric(10,3) DEFAULT 0,
    inventory_packs integer DEFAULT 0,
    active boolean DEFAULT true,
    purchase_enabled boolean DEFAULT true,
    sort_order integer DEFAULT 100,
    features text[] DEFAULT '{}'::text[],
    usage text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT products_category_check CHECK ((category = ANY (ARRAY['cleansing'::text, 'diffuser'::text])))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    product_id text,
    product_slug text NOT NULL,
    product_name_snapshot text NOT NULL,
    order_number text NOT NULL,
    customer_email text NOT NULL,
    display_name text NOT NULL,
    rating integer NOT NULL,
    title text,
    body text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_note text,
    submitted_at timestamp with time zone DEFAULT now(),
    approved_at timestamp with time zone,
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5))),
    CONSTRAINT reviews_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'hidden'::text, 'deleted'::text])))
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_settings (
    id integer DEFAULT 1 NOT NULL,
    legal_business_name text,
    business_registration_number text,
    business_address text,
    customer_service_email text,
    paypal_mode text DEFAULT 'sandbox'::text,
    checkout_enabled boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.site_settings OWNER TO postgres;

--
-- Name: admin_profiles admin_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_profiles
    ADD CONSTRAINT admin_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);


--
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: payment_events payment_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_events
    ADD CONSTRAINT payment_events_pkey PRIMARY KEY (id);


--
-- Name: payment_events payment_events_provider_event_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_events
    ADD CONSTRAINT payment_events_provider_event_id_key UNIQUE (provider_event_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_slug_key UNIQUE (slug);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: order_items_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX order_items_order_id_idx ON public.order_items USING btree (order_id);


--
-- Name: orders_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_created_at_idx ON public.orders USING btree (created_at DESC);


--
-- Name: orders_order_number_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX orders_order_number_idx ON public.orders USING btree (order_number);


--
-- Name: payment_events_order_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX payment_events_order_id_idx ON public.payment_events USING btree (order_id);


--
-- Name: reviews_product_slug_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reviews_product_slug_idx ON public.reviews USING btree (product_slug);


--
-- Name: reviews_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reviews_status_idx ON public.reviews USING btree (status);


--
-- Name: reviews_submitted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reviews_submitted_at_idx ON public.reviews USING btree (submitted_at DESC);


--
-- Name: admin_profiles admin_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_profiles
    ADD CONSTRAINT admin_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: payment_events payment_events_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_events
    ADD CONSTRAINT payment_events_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: admin_profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_profiles admins read admin profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "admins read admin profiles" ON public.admin_profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: order_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

--
-- Name: order_status_history; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

--
-- Name: orders; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: products public active products; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "public active products" ON public.products FOR SELECT USING (((active = true) AND (purchase_enabled = true)));


--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: site_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: TABLE admin_profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.admin_profiles TO anon;
GRANT ALL ON TABLE public.admin_profiles TO authenticated;
GRANT ALL ON TABLE public.admin_profiles TO service_role;


--
-- Name: TABLE order_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_items TO anon;
GRANT ALL ON TABLE public.order_items TO authenticated;
GRANT ALL ON TABLE public.order_items TO service_role;


--
-- Name: TABLE order_status_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.order_status_history TO anon;
GRANT ALL ON TABLE public.order_status_history TO authenticated;
GRANT ALL ON TABLE public.order_status_history TO service_role;


--
-- Name: TABLE orders; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.orders TO anon;
GRANT ALL ON TABLE public.orders TO authenticated;
GRANT ALL ON TABLE public.orders TO service_role;


--
-- Name: TABLE payment_events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.payment_events TO anon;
GRANT ALL ON TABLE public.payment_events TO authenticated;
GRANT ALL ON TABLE public.payment_events TO service_role;


--
-- Name: TABLE products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;


--
-- Name: TABLE reviews; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.reviews TO anon;
GRANT ALL ON TABLE public.reviews TO authenticated;
GRANT ALL ON TABLE public.reviews TO service_role;


--
-- Name: TABLE site_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.site_settings TO anon;
GRANT ALL ON TABLE public.site_settings TO authenticated;
GRANT ALL ON TABLE public.site_settings TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- PostgreSQL database dump complete
--


