-- Handle new subscription
create or replace function public.handle_new_subscription()
returns trigger as $$
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
    SET monthly_count = nc.monthly_limit
    FROM new_counts AS nc
    WHERE sl.id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;
create or replace trigger on_new_subscription
  after insert on public.subscriptions
  for each row execute procedure public.handle_new_subscription();
 