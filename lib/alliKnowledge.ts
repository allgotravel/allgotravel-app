// Conocimiento verificado de AllGo para temas de movilidad / silla de ruedas
// que NO dependen de una aerolínea concreta (marcos generales y estables).
// Alli puede usarlo como FUENTE CONFIABLE (no como "conocimiento general del
// modelo"), citando "conocimiento verificado de AllGo" + la fecha + la norma
// de fondo. Para políticas de una aerolínea o crucero específico, Alli SIEMPRE
// usa las herramientas lookup_airline_policy / lookup_cruise_policy.
//
// Última verificación: 30 de agosto de 2026.
// Para ampliar: añade secciones aquí (p. ej. taxis de otros países) y se
// integran solas al prompt de Alli.

export const MOBILITY_TRAVEL_KB = `
## CONOCIMIENTO VERIFICADO DE ALLGO — MOVILIDAD Y SILLA DE RUEDAS
(Última verificación: 30 de agosto de 2026. Son marcos generales y estables,
NO políticas de una aerolínea concreta. Para datos por aerolínea usa SIEMPRE la
herramienta lookup_airline_policy. Recuérdale a la persona confirmar los
detalles finos —vatios-hora exactos de la batería, tarifas por ciudad— con su
aerolínea o el operador local, porque pueden variar.)

### A) Volar con silla de ruedas eléctrica (powerchair)
- Batería: identifica el tipo. Las baterías secas / no derramables (gel, AGM)
  normalmente viajan instaladas en la silla. Las de litio muchas veces deben
  retirarse y llevarse en cabina con los terminales protegidos, y suele haber un
  límite de vatios-hora (a menudo hasta 300 Wh con aprobación de la aerolínea).
  El pasajero debe conocer marca/modelo/tipo de batería y avisar a la aerolínea
  al reservar.
- Llama al equipo de asistencia especial / médica de la aerolínea al reservar
  (no a la línea general). Da dimensiones (largo × ancho × alto), peso y tipo de
  batería. Pide asistencia hasta la puerta del avión y una silla de pasillo para
  abordar.
- Documentos: lleva el certificado de la batería y la ficha técnica de la silla
  (el fabricante los provee; por ejemplo Permobil en su página de "Travel
  Support"). Imprime dos copias: una para la aerolínea y otra pegada a la silla.
- Protección: pon la silla en modo libre (freewheel) y apaga el interruptor para
  que la muevan sin conducirla. Si el joystick no se puede quitar, gíralo hacia
  adentro y envuélvelo con plástico de burbujas o espuma. Retira piezas sueltas
  (cojín, cabezal, reposabrazos) y llévalas en cabina.
- Facturación en la puerta del avión (gate-check), NO en el mostrador: así la
  conservas hasta el último momento y la recibes en la puerta al llegar.
- Al llegar: revisa la silla en la puerta del avión ANTES de aceptarla; toma
  fotos/vídeo con fecha antes de entregarla.

### B) Si la aerolínea daña o pierde tu silla de ruedas
- Reporta el daño de inmediato y presenta un informe escrito (PIR) ANTES de
  salir del aeropuerto. No te vayas sin dejarlo por escrito.
- Vuelos dentro de EE.UU. (norma DOT / ACAA, 14 CFR Part 382): la aerolínea debe
  reparar o reemplazar el dispositivo a su valor original y facilitarte una silla
  de préstamo mientras tanto.
- Vuelos internacionales (Convenio de Montreal): la responsabilidad de la
  aerolínea por el equipaje está topada y suele ser MUY inferior al valor real de
  una silla eléctrica. Por eso, al facturar, conviene hacer una "declaración
  especial de interés" indicando el valor de la silla para elevar ese tope
  (Art. 22 del Convenio).
- Alli puede citar la norma, pero NO da consejo legal sobre el caso concreto:
  sugiere confirmar con la aerolínea o con un profesional.

### C) Transporte terrestre accesible (taxis)
- Principio general: en muchos países los taxis adaptados están regulados y no
  pueden cobrar un recargo por la rampa o la silla. Conviene reservar con
  antelación para no esperar y para fijar el precio.
- ESPAÑA — "Eurotaxi": el taxi adaptado cobra LA MISMA tarifa regulada que un
  taxi normal; NO hay recargo por la rampa, la silla ni la adaptación. Ejemplos:
  Madrid tiene una tarifa fija de 33 € del aeropuerto al centro (dentro de la
  M-30), igual para Eurotaxis; Barcelona y otras ciudades van con taxímetro a la
  tarifa oficial, también sin recargo por accesibilidad. Un trayecto urbano corto
  (~2 km) suele rondar los 5–8 €. Recomienda reservar el Eurotaxi con antelación.

### D) Taxis accesibles por país (destinos más visitados por continente)
(Verificado el 30 de agosto de 2026. Regla general: reserva con antelación.
Muchos países prohíben el recargo por la silla/rampa, pero la disponibilidad
varía muchísimo. NO cites tarifas exactas salvo las indicadas; di "tarifa con
taxímetro/regulada, reserva con antelación" y recuerda confirmar con el
operador local.)

EUROPA
- España — "Eurotaxi": misma tarifa regulada que un taxi normal, sin recargo
  (ver sección C).
- Francia — "taxi PMR" / "taxi adapté": misma tarifa con taxímetro; por ley sin
  recargo por la silla ni el perro guía. Se reservan por teléfono/app con
  antelación (no en parada). En París los autobuses son ~100% accesibles, pero
  el metro casi no lo es (solo la Línea 14 tiene ascensor completo).
- Italia — "taxi attrezzato" / "taxi disabili": misma tarifa que el taxi
  estándar (algunos operadores dan descuento con certificado de accesibilidad).
  Flotas limitadas por ciudad → reserva por teléfono pidiendo "taxi attrezzato".
- Turquía (Estambul) — limitado: los taxis normales no suelen estar adaptados.
  En los aeropuertos hay taxis "Tipo E" con rampa (mostrador de taxis en
  llegadas) y operadores privados de furgonetas adaptadas ("engelli taksi") con
  reserva ~1 día antes. Metro y tranvía T1 con muchas estaciones con ascensor.

AMÉRICA
- Estados Unidos — "WAV" (wheelchair accessible vehicle) / taxi accesible: la ley
  ADA PROHÍBE cobrar recargo por la silla o la rampa; pagas la misma tarifa. La
  disponibilidad varía por ciudad; conviene usar el despacho accesible local
  (por ejemplo "Accessible Dispatch" en Nueva York).
- México (Ciudad de México) — no hay un taxi accesible regulado "de calle" a
  tarifa estándar; existen operadores privados de furgonetas adaptadas con
  reserva 1–2 días antes (tarifa del operador, no oficial). Pre-reservar es lo
  seguro.
- Australia — "WAT" (Wheelchair Accessible Taxi) / "maxi taxi": misma tarifa que
  un taxi normal, sin recargo para el pasajero (el gobierno reembolsa aparte al
  conductor). Se piden por teléfono/app o en parada. Los subsidios de tarifa son
  para residentes; el turista paga la tarifa normal.

ASIA
- Japón — "JPN Taxi" / taxi de diseño universal (Toyota): muy extendidos, con
  rampa; usan el taxímetro estándar (al parecer sin recargo, aunque no hay una
  declaración oficial explícita). Para silla eléctrica o grupo conviene reservar
  una furgoneta accesible con antelación. Trenes y metro excepcionalmente
  accesibles (ascensores y personal que coloca rampas para abordar).
- Tailandia — limitado: furgonetas accesibles con rampa mediante operadores
  especializados (Bangkok, Pattaya y zonas turísticas), con reserva ~24 h antes;
  es servicio privado y más caro que un taxi normal. Aceras y templos con poca
  accesibilidad.
- China — escaso: los taxis con rampa casi no existen. DiDi puede pedir un
  vehículo grande y tiene "Accessible Ride" solo en Pekín, Shanghái y Cantón. El
  tren de alta velocidad sí es accesible (rampas, ascensores, asistencia) —
  reserva con antelación.

ÁFRICA Y MEDIO ORIENTE
- Emiratos Árabes Unidos (Dubái) — el mejor de la región: la RTA / Dubai Taxi
  tiene taxis y furgonetas "People of Determination" con rampa; se piden por app
  o teléfono. Taxímetro normal con un 50% de descuento al final del viaje
  (requiere la tarjeta Sanad, gratis, también para turistas). Confirmar importes
  en la web oficial de la RTA.
- Sudáfrica (Ciudad del Cabo) — limitado: pocos operadores privados con rampa
  (reserva por teléfono); el Dial-a-Ride municipal es para residentes; los buses
  MyCiTi acomodan sillas. Conviene pre-arreglar.
- Egipto (El Cairo) — vía operadores: "London Cab Egypt" (cabinas con rampa, app
  y central 24/7, ~1 h de aviso) y tours con furgonetas adaptadas. Las aceras son
  poco accesibles → pre-reservar con un proveedor de confianza.
- Marruecos (Marrakech) — muy limitado: transfers y furgonetas adaptadas solo por
  reserva anticipada; hay muy pocos vehículos homologados. El transporte privado
  pre-arreglado es prácticamente la única opción fiable.

### Cómo citar este conocimiento
Cuando uses esta sección, dilo con naturalidad y cierra con algo como:
"Fuente: conocimiento verificado de AllGo (según aplique: norma DOT/ACAA de
EE.UU., Convenio de Montreal, o regulación local de taxis), verificado el 30 de
agosto de 2026." Y recuerda a la persona confirmar los detalles finos con su
aerolínea u operador local.
`

export const AUTISM_TRAVEL_KB = `
## CONOCIMIENTO VERIFICADO DE ALLGO — VIAJAR CON UNA PERSONA CON AUTISMO / NEURODIVERGENTE
(Última verificación: 6 de septiembre de 2026. Son marcos generales y estables,
NO políticas de un aeropuerto o aerolínea concretos; los servicios varían por
lugar, así que recuérdale SIEMPRE confirmar en la web del aeropuerto y con su
aerolínea. Para la política de una aerolínea específica usa lookup_airline_policy.)

IMPORTANTE PARA ALLI: cuando te pregunten sobre viajar con una persona con
autismo o neurodivergente, RESPONDE CON SEGURIDAD usando esta sección. NO digas
"no tengo una herramienta específica" ni que no tienes información — SÍ la
tienes aquí. Da los apoyos concretos y cierra recordando confirmar los detalles
con el aeropuerto/aerolínea.

### A) Antes de viajar (preparación)
- Avisa con anticipación al equipo de asistencia especial de la aerolínea y, si
  se puede, al aeropuerto, para que preparen los apoyos.
- Programas de "ensayo" o práctica en aeropuertos: en EE.UU. existe "Wings for
  Autism" / "Wings for All" (y programas similares en otros países), donde la
  familia practica todo el proceso —check-in, seguridad, abordar— en un día de
  simulacro, antes del viaje real. Se buscan por el nombre + el aeropuerto.
- Cordón de girasol (Hidden Disabilities Sunflower): programa internacional. Es
  un cordón/lanyard verde con girasoles que la persona lleva puesto; el personal
  capacitado entiende, SIN que tengas que explicar nada, que puede necesitar más
  tiempo, paciencia o apoyo. Muchos aeropuertos y aerolíneas lo dan gratis en sus
  mostradores, o se pide en la web del programa (hdsunflower.com).

### B) En el aeropuerto
- Salas sensoriales / espacios de calma: muchos aeropuertos grandes tienen
  "sensory rooms" o zonas tranquilas, lejos del ruido y la multitud, para
  regularse antes del vuelo. Verifica en la web del aeropuerto si el tuyo tiene.
- Asistencia en el control de seguridad: en EE.UU. existe "TSA Cares" — llamas
  con 72 horas de anticipación y te ayudan a pasar seguridad con más calma y
  apoyo personalizado. En otros países se pide "asistencia especial" al
  aeropuerto/aerolínea.
- Preembarque / abordar primero: casi siempre puedes solicitarlo, para
  acomodarse con calma y sin la presión de la fila.

### C) Durante el viaje (apoyos prácticos)
- Lleva audífonos o orejeras para el ruido, objetos de confort/regulación,
  snacks conocidos y actividades favoritas (tablet, juguete).
- Una tarjeta de comunicación o una nota breve para avisar a la tripulación de
  las necesidades de tu peque puede ayudar mucho.
- Explica el viaje con antelación con historias sociales o fotos del proceso
  (aeropuerto, seguridad, avión) para reducir la ansiedad de lo desconocido.

### Cómo citar este conocimiento
Responde con calidez y seguridad, y cierra con algo como: "Fuente: conocimiento
verificado de AllGo, verificado el 6 de septiembre de 2026. Como los servicios
varían por aeropuerto y aerolínea, confírmalo con ellos antes de viajar." NO das
consejo médico; para necesidades clínicas de la persona, sugiere hablar con su
profesional de salud.
`

export const SPECIAL_NEEDS_TRAVEL_KB = `
## CONOCIMIENTO VERIFICADO DE ALLGO — VIAJAR CON SÍNDROME DE DOWN, BAJA VISIÓN/CEGUERA Y PARÁLISIS CEREBRAL
(Última verificación: 6 de septiembre de 2026. Marcos generales y estables, NO
políticas de un aeropuerto o aerolínea concretos; recuérdale SIEMPRE confirmar
en la web del aeropuerto y con su aerolínea. Para la política de una aerolínea
específica usa lookup_airline_policy. NO das consejo médico.)

IMPORTANTE PARA ALLI: cuando te pregunten por viajar con una persona con
síndrome de Down, con baja visión o ceguera, o con parálisis cerebral, RESPONDE
CON SEGURIDAD usando esta sección. NO digas que no tienes información — SÍ la
tienes aquí. Da apoyos concretos y cierra recordando confirmar detalles con el
aeropuerto/aerolínea.

### 1) SÍNDROME DE DOWN
- El cordón de girasol (Hidden Disabilities Sunflower) también aplica: lo lleva
  puesto la persona y el personal capacitado entiende, sin explicaciones, que
  puede necesitar más tiempo, paciencia y apoyo.
- Pide asistencia especial a la aerolínea y preembarque para acomodarse con calma.
- Comunicación clara, sencilla y con paciencia; anticipa el viaje con fotos o
  historias sociales para reducir la ansiedad de lo desconocido.
- Si hay una condición de salud asociada (p. ej. del corazón), consulta con su
  médico antes de volar y lleva sus documentos/medicamentos en el equipaje de mano.

### 2) BAJA VISIÓN O CEGUERA (débil visual)
- Servicio de "meet and assist": el aeropuerto puede asignar a alguien que
  acompañe/guíe a la persona desde el check-in hasta la puerta y el asiento.
  Se solicita con anticipación a la aerolínea o al aeropuerto.
- A bordo, la tripulación da un briefing de seguridad individual y una
  orientación de dónde está todo (asiento, baño, botón de llamada).
- El bastón blanco se permite en cabina. Si viaja con perro guía, hay requisitos
  y papeles según la aerolínea y el país (revisa con lookup_airline_policy y las
  reglas del destino).
- Pide la información del vuelo en formato accesible y activa las funciones de
  accesibilidad del teléfono (lector de pantalla, apps de navegación).

### 3) PARÁLISIS CEREBRAL
- Asistencia con silla de ruedas en el aeropuerto de punta a punta, preembarque y
  transferencia asistida al asiento; solicítalo con anticipación.
- Si viaja con su propia silla de ruedas (manual o eléctrica), aplica todo lo de
  la sección de movilidad: etiquétala, lleva instrucciones de manejo, y conoce
  tus derechos si llega dañada. (Ver el conocimiento de movilidad de AllGo.)
- Pide asiento con más espacio; ten en cuenta que el baño accesible a bordo es
  limitado, así que planifica. El cordón de girasol también ayuda.
- Si hay dificultad del habla, una tarjeta de comunicación o notas escritas
  facilitan avisar a la tripulación lo que se necesita.

### Cómo citar este conocimiento
Responde con calidez y seguridad, y cierra con algo como: "Fuente: conocimiento
verificado de AllGo, verificado el 6 de septiembre de 2026. Como los servicios
varían por aeropuerto y aerolínea, confírmalo con ellos antes de viajar." Para
necesidades clínicas de la persona, sugiere hablar con su profesional de salud.
`

export const DISABILITIES_TRAVEL_KB = `
## CONOCIMIENTO VERIFICADO DE ALLGO — LAS NECESIDADES DE ACCESIBILIDAD MÁS FRECUENTES AL VIAJAR
(Última verificación: 6 de septiembre de 2026. Marcos generales y estables, NO
políticas de un aeropuerto o aerolínea concretos; recuérdale SIEMPRE confirmar
con su aerolínea y el aeropuerto, y para temas de salud con su médico. Para la
política de una aerolínea específica usa lookup_airline_policy. NO das consejo médico.)

IMPORTANTE PARA ALLI: cubres el espectro completo de necesidades de
accesibilidad. Cuando te pregunten por CUALQUIERA de estas, RESPONDE CON
SEGURIDAD con los apoyos concretos de abajo. NUNCA digas que no tienes
información ni que "no hay una herramienta específica". Cierra recordando
confirmar los detalles con la aerolínea/aeropuerto.

Las necesidades de accesibilidad más frecuentes (base CDC/OMS) que AllGo cubre:
1) Movilidad / física  2) Visión (baja visión / ceguera)  3) Audición (sordera /
hipoacusia)  4) Cognitiva / intelectual (incluye síndrome de Down)  5) Autismo /
neurodivergencia  6) Parálisis cerebral  7) Condiciones crónicas e invisibles
(diabetes, epilepsia, cardíacas, renales/diálisis, respiratorias/oxígeno)
8) Salud mental (ansiedad, estrés postraumático)  9) Habla y comunicación
10) Adultos mayores y demencia / Alzheimer.
(Movilidad, visión, autismo, síndrome de Down y parálisis cerebral están
detallados en las otras secciones de AllGo. Aquí van las demás.)

### AUDICIÓN (sordera o hipoacusia)
- Autoidentifícate ante la aerolínea para recibir la información accesible: bajo
  el Air Carrier Access Act, las aerolíneas de EE.UU. deben darte la misma
  información que a todos (avisos de puerta, cambios, instrucciones de seguridad)
  de forma accesible; pídelo con anticipación.
- Puedes pedir asiento cerca del frente y un asiento contiguo para tu intérprete
  o acompañante; muchas aerolíneas tienen video de seguridad con subtítulos.
- En seguridad: NO tienes que quitarte los audífonos o implantes; avisa al
  personal, pide instrucciones visuales o por escrito, y una app de voz-a-texto
  ayuda a comunicarte. El cordón de girasol te ayuda a señalarlo sin explicar.

### CONDICIONES CRÓNICAS E INVISIBLES (diabetes, epilepsia, cardíacas, renales/diálisis, respiratorias)
- Lleva TODOS los medicamentos en el equipaje de mano, en su envase original y
  con la receta o una carta del médico; nunca en la maleta documentada.
- Dispositivos médicos: los concentradores de oxígeno portátiles (POC) deben ser
  un modelo aprobado por la aerolínea y se avisan con anticipación; equipos como
  CPAP o bombas de insulina suelen permitirse en cabina. Los líquidos y
  suministros médicos pueden pasar por seguridad; solo decláralos al oficial.
- Si necesitas diálisis, planifica con tiempo centros en el destino (a bordo no
  hay). Ante cualquier condición de salud, consulta a tu médico antes de volar y
  lleva un resumen médico. El cordón de girasol señala una necesidad invisible.

### SALUD MENTAL (ansiedad, estrés postraumático)
- Pide preembarque para acomodarte con calma, busca las salas sensoriales o
  zonas tranquilas del aeropuerto, y lleva objetos o técnicas que te ayuden a
  regularte. Anticipa el viaje paso a paso para reducir la incertidumbre.
- El cordón de girasol te permite señalar, sin explicar, que puedes necesitar
  más tiempo o paciencia. (No doy consejo clínico; para eso, tu profesional de salud.)

### HABLA Y COMUNICACIÓN
- Una tarjeta de comunicación, notas escritas o una app de voz-a-texto facilitan
  avisar a la tripulación y al personal lo que necesitas.
- Autoidentifícate al pedir asistencia para que te den la información de forma
  accesible. El cordón de girasol ayuda a que el personal tenga más paciencia.

### ADULTOS MAYORES Y DEMENCIA / ALZHEIMER
- Solicita el servicio de asistencia del aeropuerto de punta a punta y
  preembarque; viajar con un acompañante ayuda mucho.
- Lleva una identificación y, si aplica, una pulsera o tarjeta médica con datos
  de contacto de emergencia. Mantén una rutina y objetos familiares, y organiza
  los medicamentos por horario en el equipaje de mano. El cordón de girasol
  ayuda a señalar la necesidad de paciencia y apoyo.

### COGNITIVA / INTELECTUAL (general)
- Comunicación clara, sencilla y con paciencia; anticipa el viaje con fotos o
  historias sociales; pide asistencia y preembarque. El cordón de girasol aplica.

### Cómo citar este conocimiento
Cierra con: "Fuente: conocimiento verificado de AllGo, verificado el 6 de
septiembre de 2026. Como los servicios varían por aeropuerto y aerolínea,
confírmalo con ellos antes de viajar." Para necesidades clínicas, sugiere hablar
con su profesional de salud.
`
