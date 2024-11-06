select cron.unschedule('update-monthly-limits');

SELECT cron.schedule(
    'update-monthly-limits',
    '0 0 1 * *',
    $$
    WITH price_id_pro_prod_is AS (
        SELECT prices.id AS price_id, products.id AS product_id
        FROM public.products LEFT JOIN public.prices ON products.id = prices.product_id
        WHERE products.id = 'prod_R64u7dvMxJPE3G' -- 'Pro'
    ),
    price_id_pro_montly_limit AS (
        SELECT p2p.price_id, pl.monthly_limit
        FROM price_id_2_prod_is p2p
        LEFT JOIN public.product_limits pl ON p2p.product_id = pl.id
    ),
    to_update AS (
        SELECT s.user_id, p.monthly_count
        FROM public.subscriptions s
        LEFT JOIN price_id_pro_montly_limit p ON s.price_id = p.price_id
        WHERE s.status = 'active'
    )
    UPDATE public.usage_limits ul
    SET monthly_count = u.monthly_limit
    FROM to_update u
    WHERE ul.id = u.user_id;

    -- set to zero for those who doesn't have subscription

    UPDATE public.usage_limits AS sl
    SET monthly_limit = 0
    WHERE NOT EXISTS (
        SELECT
        FROM public.subscriptions s
        WHERE s.status = 'active' AND s.user_id = sl.id
    );
    $$
);