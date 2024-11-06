create table usage_limits (
    id uuid references auth.users not null primary key,
    free_count integer,
    monthly_count integer
);

alter table product_limits enable row level security;
create policy "Allow public read-only access." on product_limits for select using (true);