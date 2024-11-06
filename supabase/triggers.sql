CREATE OR REPLACE FUNCTION public.check_usage_limits()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.free_count < 0 OR NEW.monthly_count < 0 THEN
        RAISE EXCEPTION 'Limits reached';
    END IF;
    RETURN NEW;
END;
$$ language plpgsql security definer;

CREATE OR REPLACE TRIGGER check_column_values_trigger
BEFORE UPDATE ON public.usage_limits
FOR EACH ROW
EXECUTE FUNCTION public.check_usage_limits();


create or replace function public.usage_tick(current_user_id uuid)
returns void as $$
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
$$ language plpgsql security definer;