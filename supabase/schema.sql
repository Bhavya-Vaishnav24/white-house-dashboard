-- Database Setup Script for WHITE HOUSE CAFE
-- Run this in the Supabase SQL Editor (https://owsgxvgauuecyffiewhn.supabase.co)

-- 1. Create the orders table (exact schema without latitude/longitude columns)
CREATE TABLE IF NOT EXISTS public.orders (
  id bigint generated always as identity primary key,
  customer_name text,
  phone text,
  item_summary text,
  items jsonb,
  subtotal int,
  packaging int default 5,
  total int,
  payment_status text default 'pending',
  order_status text default 'new',
  maps_link text,
  manual_address text,
  created_at timestamp default now()
);

-- 2. Enable Supabase Realtime for the orders table
-- This allows the admin dashboard to receive new orders in real-time
alter publication supabase_realtime add table orders;

-- 3. Enable Row Level Security (RLS)
alter table public.orders enable row level security;

-- 4. Create RLS Policies

-- Policy A: Allow anyone (anonymous customers) to insert orders
create policy "Allow customer insert" on public.orders
  for insert with check (true);

-- Policy B: Allow only the authorized admin (admin@whitehousecafe.com) to read orders
create policy "Allow admin read" on public.orders
  for select using (auth.jwt() ->> 'email' = 'admin@whitehousecafe.com');

-- Policy C: Allow only the authorized admin (admin@whitehousecafe.com) to update order/payment status
create policy "Allow admin update" on public.orders
  for update using (auth.jwt() ->> 'email' = 'admin@whitehousecafe.com')
  with check (auth.jwt() ->> 'email' = 'admin@whitehousecafe.com');

-- Note: In the Supabase Auth console, go to Authentication -> Users -> Add User -> Create User,
-- and create a user with email 'admin@whitehousecafe.com' and a secure password.
