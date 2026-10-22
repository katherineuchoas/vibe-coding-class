-- This helper is SECURITY DEFINER and is not part of the public website API.
-- Keep it unavailable to browser roles while preserving owner/internal use.
-- The function may exist in the live project outside the checked-in migrations,
-- so skip safely on fresh databases where it has not been created.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$$;
