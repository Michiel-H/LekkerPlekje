-- Fix infinite recursion by dropping existing policies on users and locations
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
    END LOOP;
    
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'locations' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.locations', pol.policyname);
    END LOOP;
END
$$;

-- Create a helper function to get user role securely without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT role::text FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Recreate safe policies for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (id = auth.uid());

-- Recreate safe policies for locations
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Users can insert locations" ON public.locations FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Users can update own locations" ON public.locations FOR UPDATE USING (auth.uid() = submitted_by);
CREATE POLICY "Admins can update any location" ON public.locations FOR UPDATE USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Admins can delete any location" ON public.locations FOR DELETE USING (public.get_user_role() IN ('admin', 'superadmin'));

-- Recreate safe policies for location_tags just in case
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'location_tags' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.location_tags', pol.policyname);
    END LOOP;
END
$$;

ALTER TABLE public.location_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access for location_tags" ON public.location_tags FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert location_tags" ON public.location_tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update location_tags" ON public.location_tags FOR UPDATE USING (public.get_user_role() IN ('admin', 'superadmin'));
CREATE POLICY "Admins can delete location_tags" ON public.location_tags FOR DELETE USING (public.get_user_role() IN ('admin', 'superadmin'));
