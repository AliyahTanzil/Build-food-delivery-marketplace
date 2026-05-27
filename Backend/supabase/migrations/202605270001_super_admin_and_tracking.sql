-- Add super-admin to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super-admin';

-- Create helper for super-admin check
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super-admin');
$$;

-- Update is_admin to include super-admin permissions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super-admin'));
$$;

-- Create delivery_locations table for live tracking
CREATE TABLE IF NOT EXISTS public.delivery_locations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id uuid NOT NULL REFERENCES public.deliveries(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  latitude numeric(10, 7) NOT NULL,
  longitude numeric(10, 7) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on delivery_locations
ALTER TABLE public.delivery_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for delivery_locations
CREATE POLICY "delivery_locations_select_parties" ON public.delivery_locations
  FOR SELECT USING (
    public.is_admin() 
    OR driver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.deliveries d
      JOIN public.orders o ON o.id = d.order_id
      WHERE d.id = delivery_id AND (o.customer_id = auth.uid() OR public.is_seller_owner(o.seller_id))
    )
  );

CREATE POLICY "delivery_locations_insert_driver" ON public.delivery_locations
  FOR INSERT WITH CHECK (
    driver_id = auth.uid() AND public.is_driver()
  );

-- Enable Realtime for delivery_locations and deliveries
-- Note: publication 'supabase_realtime' must already exist (it usually does by default)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_locations;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON TABLE public.delivery_locations IS 'Stores real-time coordinate updates for active deliveries.';
