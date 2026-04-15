
CREATE OR REPLACE FUNCTION public.complete_hospital_registration(
  _user_id uuid,
  _hospital_id uuid,
  _full_name text,
  _phone text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update profile with hospital_id
  UPDATE public.profiles
  SET hospital_id = _hospital_id,
      full_name = _full_name,
      phone = _phone,
      updated_at = now()
  WHERE user_id = _user_id;

  -- Insert hospital_admin role
  INSERT INTO public.user_roles (user_id, hospital_id, role)
  VALUES (_user_id, _hospital_id, 'hospital_admin')
  ON CONFLICT DO NOTHING;
END;
$$;
