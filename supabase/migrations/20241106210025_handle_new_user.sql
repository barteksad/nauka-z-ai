create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id) values (new.id);
  insert into public.usage_limits (id, free_count) values (new.id, 20);
  return new;
end;
$$ language plpgsql security definer;