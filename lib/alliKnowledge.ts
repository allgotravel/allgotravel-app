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
  estándar (algunos operadores dan descuento con certificado de discapacidad).
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
