-- ─────────────────────────────────────────────────────────────
-- AllGo Travel App — Función nueva: Cruceros accesibles
-- Espeja el patrón de airlines / service_animal_policies.
-- Datos verificados (agosto 2026). Regla de oro: nunca inventar;
-- cada política lleva fuente oficial y fecha de verificación.
-- ─────────────────────────────────────────────────────────────

create table if not exists cruise_lines (
  id serial primary key,
  priority int,
  name text not null,
  slug text not null unique,
  region text,
  status text default 'verificada'
);

create table if not exists cruise_accessibility_policies (
  cruise_slug text primary key references cruise_lines(slug) on delete cascade,
  acepta_perro_servicio text,
  acepta_esa text,
  aviso_previo text,
  documentos text,
  prueba_obligatoria text,
  areas_alivio text,
  contacto_accesibilidad text,
  camarotes_accesibles text,
  notas text,
  url_fuente text,
  fecha_verificacion text
);

alter table cruise_lines enable row level security;
alter table cruise_accessibility_policies enable row level security;

-- Datos de referencia (no sensibles): lectura pública, escritura solo service role.
drop policy if exists "cruise_lines service role" on cruise_lines;
create policy "cruise_lines service role" on cruise_lines for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
drop policy if exists "cruise_lines read" on cruise_lines;
create policy "cruise_lines read" on cruise_lines for select using (true);

drop policy if exists "cruise_policies service role" on cruise_accessibility_policies;
create policy "cruise_policies service role" on cruise_accessibility_policies for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
drop policy if exists "cruise_policies read" on cruise_accessibility_policies;
create policy "cruise_policies read" on cruise_accessibility_policies for select using (true);

-- ── Navieras (por popularidad) ───────────────────────────────
insert into cruise_lines (priority, name, slug, region) values
  (1, 'Royal Caribbean', 'royal-caribbean', 'Global'),
  (2, 'Carnival Cruise Line', 'carnival', 'Global'),
  (3, 'Norwegian Cruise Line (NCL)', 'ncl', 'Global'),
  (4, 'MSC Cruises', 'msc', 'Global'),
  (5, 'Princess Cruises', 'princess', 'Global'),
  (6, 'Celebrity Cruises', 'celebrity', 'Global'),
  (7, 'Disney Cruise Line', 'disney', 'Global'),
  (8, 'Holland America Line', 'holland-america', 'Global')
on conflict (slug) do nothing;

-- ── Políticas verificadas ────────────────────────────────────
insert into cruise_accessibility_policies
  (cruise_slug, acepta_perro_servicio, acepta_esa, aviso_previo, documentos, prueba_obligatoria, areas_alivio, contacto_accesibilidad, camarotes_accesibles, notas, url_fuente, fecha_verificacion) values
  ('royal-caribbean',
   'Sí — perros de servicio entrenados, en todos los barcos',
   'No',
   'Avisar al reservar',
   'La prueba (ID, arnés, tags) ayuda pero no es obligatoria',
   'No',
   'Sí — áreas de 4×4 pies con mantillo de ciprés a bordo',
   'royalcaribbean.com (Accessible cruising)',
   'Sí — puertas de 23", radio de giro de 5 pies, duchas roll-in; sillas gratis para embarcar/desembarcar; elevadores de piscina',
   'Para volver a EE.UU. aplica la regla del CDC (microchip, mínimo 6 meses, CDC Dog Import Form). Subir al barco no garantiza poder bajar en cada puerto.',
   'https://www.royalcaribbean.com/experience/accessible-cruising/service-animals',
   '2026-08-08'),
  ('carnival',
   'Sí — solo perros de trabajo entrenados',
   'No',
   'Avisar al reservar',
   'El perro debe ir "en uniforme" (chaleco, arnés, tag o ID)',
   'Recomendada (identificación del perro)',
   'Sí — coordinar con la naviera',
   'access@carnival.com · 1-800-438-6744 (Guest Access)',
   'Sí — sección de movilidad con medidas por camarote; rentas con Scootaround',
   'No en muebles, piscinas ni saunas; permitido en las demás áreas públicas. Aplica regla del CDC para reentrada a EE.UU.',
   'https://www.carnival.com/about-carnival/special-needs/service-dogs',
   '2026-08-08'),
  ('ncl',
   'Sí — perros de servicio entrenados (ADA)',
   'No',
   'Reservar con al menos 2 semanas de anticipación',
   'Vacunas al día (incl. rabia) + certificado USDA o de Salud Internacional',
   'Sí — documentación de vacunas obligatoria',
   'Sí — caja de alivio incluida',
   'The Access Desk · 866-584-9756 (90 días intérpretes / 45 días otras necesidades)',
   'Sí — cuestionario de accesibilidad; el dueño lleva comida, medicina y chaleco salvavidas del perro',
   'Aplica regla del CDC para reentrada a EE.UU. Verificar cada puerto del itinerario.',
   'https://www.ncl.com/cruise-preparation/accessibility/service-animals',
   '2026-08-08'),
  ('msc',
   'Sí — perros guía / de servicio con documentos',
   'No',
   'Notificar al menos 60 días antes de zarpar',
   'Vacunas al día; puertos de EE.UU. exigen requisitos del US DOT; cumplir normas de la UE si aplica',
   'Sí — documentación obligatoria',
   'Coordinar con la naviera',
   'msccruises.com (Accessibility & Medical form)',
   'Sí — camarotes accesibles en toda la flota',
   'Aplica regla del CDC para reentrada a EE.UU.',
   'https://www.msccruises.com/int/manage-booking/accessibility-medical',
   '2026-08-08'),
  ('princess',
   'Sí — animales de servicio entrenados (ADA)',
   'No',
   'Requiere aprobación previa',
   'Escribir a la oficina de accesibilidad antes del viaje',
   'Sí — aprobación previa',
   'Sí — área de alivio en cubierta exterior',
   'AccessOfficePrincess@princesscruises.com',
   'Sí — programa "Accessibility at Sea"',
   'Las reglas de puerto varían; en algunos el animal no puede bajar. Aplica regla del CDC.',
   'https://www.princess.com/accessibility-at-sea',
   '2026-08-08'),
  ('celebrity',
   'Sí — en todos los barcos, excepto itinerarios a Reino Unido (regla DEFRA)',
   'No',
   'Avisar al reservar',
   'La prueba ayuda pero no es obligatoria',
   'No',
   'Sí — áreas de 4×4 pies con mantillo de ciprés (compartidas)',
   'celebritycruises.com (Special needs)',
   'Sí — camarotes accesibles',
   'No admite perro de servicio en itinerarios a Reino Unido (DEFRA). Aplica regla del CDC para reentrada a EE.UU.',
   'https://www.celebritycruises.com/special-needs/service-animals',
   '2026-08-08'),
  ('disney',
   'Sí — perros de servicio entrenados, en casi todo el barco',
   'No',
   'Notificar al menos 60 días antes de zarpar',
   'Permisos de importación de cada país que lo exija (responsabilidad del dueño)',
   'Con correa y bajo control en todo momento',
   'Sí',
   'Disney Cruise Line — Servicios de accesibilidad (confirmar en la página oficial)',
   'Permitido en comedores y teatros; no en piscinas ni zonas de chapoteo',
   'El dueño se encarga de la comida y el cuidado del perro. Aplica regla del CDC para reentrada a EE.UU.',
   'https://disneycruise.disney.go.com',
   '2026-08-08'),
  ('holland-america',
   'Sí — solo animales de servicio (no mascotas ni de terapia/compañía)',
   'No',
   'Formulario SRI al reservar o mínimo 45 días antes',
   'Vacunas al día enviadas al Depto. de Accesibilidad',
   'Sí — documentación de vacunas obligatoria',
   'Sí — con aviso previo se habilita un área de alivio',
   'hollandamerica.com (Guest Accessibility Department)',
   'Sí — formulario de requisitos especiales al reservar',
   'Aplica regla del CDC para reentrada a EE.UU.',
   'https://www.hollandamerica.com/en/us/faq/accessibility/are-service-animals-permitted-on-board',
   '2026-08-08')
on conflict (cruise_slug) do nothing;
