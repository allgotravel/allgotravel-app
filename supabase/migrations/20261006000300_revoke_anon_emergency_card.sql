-- APPLY ONLY AFTER branch seguridad-oct is deployed to production.
-- From then on /e/<token> reads the card on the server with the service key, so the
-- public (anon) key no longer needs to call this function.
revoke execute on function public.get_emergency_card(text) from anon;
