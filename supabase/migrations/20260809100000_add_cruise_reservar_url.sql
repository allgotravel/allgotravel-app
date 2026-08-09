-- AllGo Travel App — Botón "Reservar" para cruceros.
-- Añade la URL de reserva por naviera (por ahora el sitio oficial;
-- reemplazar por enlaces de afiliado cuando estén los programas activos).

alter table cruise_accessibility_policies add column if not exists url_reserva text;

update cruise_accessibility_policies set url_reserva = 'https://www.royalcaribbean.com'   where cruise_slug = 'royal-caribbean';
update cruise_accessibility_policies set url_reserva = 'https://www.carnival.com'          where cruise_slug = 'carnival';
update cruise_accessibility_policies set url_reserva = 'https://www.ncl.com'               where cruise_slug = 'ncl';
update cruise_accessibility_policies set url_reserva = 'https://www.msccruises.com'        where cruise_slug = 'msc';
update cruise_accessibility_policies set url_reserva = 'https://www.princess.com'          where cruise_slug = 'princess';
update cruise_accessibility_policies set url_reserva = 'https://www.celebritycruises.com'  where cruise_slug = 'celebrity';
update cruise_accessibility_policies set url_reserva = 'https://disneycruise.disney.go.com' where cruise_slug = 'disney';
update cruise_accessibility_policies set url_reserva = 'https://www.hollandamerica.com'    where cruise_slug = 'holland-america';
