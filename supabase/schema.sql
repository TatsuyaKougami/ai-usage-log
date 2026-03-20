create table logs (
  id uuid primary key default gen_random_uuid(),
  tool text not null,
  task text not null,
  time_saved int not null,
  date text not null
);

alter table logs enable row level security;

create policy "allow select" on logs for select using (true);
create policy "allow insert" on logs for insert with check (true);
