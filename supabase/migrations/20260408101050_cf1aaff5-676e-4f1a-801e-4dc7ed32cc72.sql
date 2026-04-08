
-- Drop the overly permissive policy
DROP POLICY "Anyone can create a hospital on signup" ON public.hospitals;

-- Replace with a scoped insert policy
CREATE POLICY "Authenticated users can create hospitals" ON public.hospitals
  FOR INSERT TO authenticated
  WITH CHECK (is_active = true);
