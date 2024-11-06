create table product_limits (
    id text  primary key,
    monthly_limit integer
);

alter table product_limits enable row level security;
create policy "Allow public read-only access." on product_limits for select using (true);

insert into product_limits (id, monthly_limit) values ('prod_R64u7dvMxJPE3G', 200);