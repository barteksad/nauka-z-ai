

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."pricing_plan_interval" AS ENUM (
    'day',
    'week',
    'month',
    'year'
);


ALTER TYPE "public"."pricing_plan_interval" OWNER TO "postgres";


CREATE TYPE "public"."pricing_type" AS ENUM (
    'one_time',
    'recurring'
);


ALTER TYPE "public"."pricing_type" OWNER TO "postgres";


CREATE TYPE "public"."subscription_status" AS ENUM (
    'trialing',
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'unpaid',
    'paused'
);


ALTER TYPE "public"."subscription_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_usage_limits"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF NEW.free_count < 0 AND NEW.monthly_count < 0 THEN
        RAISE EXCEPTION 'Limits reached';
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."check_usage_limits"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_subscription"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  if new.status = 'active' then
    with new_counts as (
      select monthly_limit
      from public.product_limits
      where id = (
        select product_id
        from public.prices
        where id = new.price_id
      )
    )
    UPDATE public.usage_limits AS sl
    SET free_count = 20,
        monthly_count = nc.monthly_limit
    FROM new_counts AS nc
    WHERE sl.id = new.user_id;
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_subscription"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.users (id) values (new.id);
  insert into public.usage_limits (id) values (new.id);
  return new;
end;
$$;


CREATE OR REPLACE FUNCTION "public"."usage_tick"("current_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
    if exists (select * from admins WHERE id = auth.uid()) then
        return;
    end if;
    -- Common Table Expressions (CTE) definition
    WITH price_id_pro_prod_is AS (
        SELECT prices.id AS price_id, products.id AS product_id
        FROM public.products
        LEFT JOIN public.prices ON products.id = prices.product_id
        -- WHERE products.id = 'prod_R64u7dvMxJPE3G' -- 'Pro'
    ),
    to_update AS (
        SELECT users.id as user_id, COALESCE(price_id_pro_prod_is.product_id, 'free_tier') as product_id
        FROM public.users
        LEFT JOIN public.subscriptions s ON s.user_id = users.id
        LEFT JOIN price_id_pro_prod_is ON s.price_id = price_id_pro_prod_is.price_id
        WHERE coalesce(s.status, 'active') = 'active' AND users.id = current_user_id
    )
    UPDATE public.usage_limits sl
    SET monthly_count = CASE
                        WHEN EXISTS (SELECT 1 FROM to_update WHERE to_update.product_id = 'prod_Pbk91tVj9wVW9K') THEN monthly_count - 1
                        ELSE monthly_count
                    END,
        free_count = CASE
                        WHEN EXISTS (SELECT 1 FROM to_update WHERE to_update.product_id = 'free_tier') THEN 
                            free_count - 1
                        ELSE free_count
                    END
    FROM to_update u
    WHERE sl.id = u.user_id;

    return;
end;
$$;


ALTER FUNCTION "public"."usage_tick"("current_user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admins" (
    "id" "uuid" NOT NULL
);


ALTER TABLE "public"."admins" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" NOT NULL,
    "stripe_customer_id" "text"
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prices" (
    "id" "text" NOT NULL,
    "product_id" "text",
    "active" boolean,
    "description" "text",
    "unit_amount" bigint,
    "currency" "text",
    "type" "public"."pricing_type",
    "interval" "public"."pricing_plan_interval",
    "interval_count" integer,
    "trial_period_days" integer,
    "metadata" "jsonb",
    CONSTRAINT "prices_currency_check" CHECK (("char_length"("currency") = 3))
);


ALTER TABLE "public"."prices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_limits" (
    "id" "text" NOT NULL,
    "monthly_limit" integer
);


ALTER TABLE "public"."product_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "text" NOT NULL,
    "active" boolean,
    "name" "text",
    "description" "text",
    "image" "text",
    "metadata" "jsonb"
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "public"."subscription_status",
    "metadata" "jsonb",
    "price_id" "text",
    "quantity" integer,
    "cancel_at_period_end" boolean,
    "created" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "current_period_start" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "current_period_end" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "ended_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "cancel_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "canceled_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "trial_start" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "trial_end" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_limits" (
    "id" "uuid" NOT NULL,
    "free_count" integer,
    "monthly_count" integer
);


ALTER TABLE "public"."usage_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "billing_address" "jsonb",
    "payment_method" "jsonb"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prices"
    ADD CONSTRAINT "prices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_limits"
    ADD CONSTRAINT "product_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usage_limits"
    ADD CONSTRAINT "usage_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "check_column_values_trigger" BEFORE UPDATE ON "public"."usage_limits" FOR EACH ROW EXECUTE FUNCTION "public"."check_usage_limits"();



CREATE OR REPLACE TRIGGER "on_new_subscription" AFTER INSERT ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_subscription"();



ALTER TABLE ONLY "public"."admins"
    ADD CONSTRAINT "admins_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."prices"
    ADD CONSTRAINT "prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_price_id_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."prices"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."usage_limits"
    ADD CONSTRAINT "usage_limits_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



CREATE POLICY "Allow public read-only access." ON "public"."prices" FOR SELECT USING (true);



CREATE POLICY "Allow public read-only access." ON "public"."product_limits" FOR SELECT USING (true);



CREATE POLICY "Allow public read-only access." ON "public"."products" FOR SELECT USING (true);



CREATE POLICY "Allow public read-only access." ON "public"."usage_limits" FOR SELECT USING (true);



CREATE POLICY "Can only view own subs data." ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Can update own user data." ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Can view own user data." ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."admins" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."admins" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usage_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."prices";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."products";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";









































































































































































































GRANT ALL ON FUNCTION "public"."check_usage_limits"() TO "anon";
GRANT ALL ON FUNCTION "public"."check_usage_limits"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_usage_limits"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_subscription"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_subscription"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_subscription"() TO "service_role";



GRANT ALL ON FUNCTION "public"."usage_tick"("current_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."usage_tick"("current_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."usage_tick"("current_user_id" "uuid") TO "service_role";
























GRANT ALL ON TABLE "public"."admins" TO "anon";
GRANT ALL ON TABLE "public"."admins" TO "authenticated";
GRANT ALL ON TABLE "public"."admins" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."prices" TO "anon";
GRANT ALL ON TABLE "public"."prices" TO "authenticated";
GRANT ALL ON TABLE "public"."prices" TO "service_role";



GRANT ALL ON TABLE "public"."product_limits" TO "anon";
GRANT ALL ON TABLE "public"."product_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."product_limits" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."usage_limits" TO "anon";
GRANT ALL ON TABLE "public"."usage_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_limits" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
