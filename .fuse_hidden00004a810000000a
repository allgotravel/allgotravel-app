import React, { useState, useMemo } from "react";

/* ============================================================
   AllGo Travel — Verificador de Elegibilidad PSD
   Prototipo v1 · Bilingüe ES/EN

   ESTADO (Dispatch, D-12):
   ✅ GUIDE_URL apuntando al checkout real de Hotmart
   ✅ <DevNote /> eliminado
   ⏳ PENDIENTE: conectar handleEmail a ManyChat/Supabase
      → llenar EMAIL_ENDPOINT con el webhook/endpoint real
   ⏳ PENDIENTE: publicar en allgotravel.app/verificador y probar móvil
   ============================================================ */

const GUIDE_URL = "https://go.hotmart.com/Q106793737G";

// TODO (Yadi/Dispatch): URL del webhook de ManyChat o endpoint de Supabase
// que reciba { email, ref, status }. Si queda vacío, el form solo muestra
// el mensaje de éxito sin guardar el correo.
const EMAIL_ENDPOINT = "";

const C = {
  ink: "#16202B",
  paper: "#EDEDE7",
  card: "#FFFFFF",
  teal: "#1A5A55",
  tealSoft: "#E4EDEB",
  amber: "#C0801F",
  amberSoft: "#F7EEDC",
  muted: "#6B7580",
  line: "#D6D6CE",
};

const MONO = "'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace";
const SANS =
  "'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

/* ---------------- contenido bilingüe ---------------- */

const T = {
  es: {
    kicker: "AllGo Travel · Herramienta gratuita",
    title: "¿Tu perro califica como Perro de Servicio Psiquiátrico?",
    lede:
      "Desde 2021 los perros de apoyo emocional ya no vuelan gratis en Estados Unidos. Los perros de servicio psiquiátrico sí. Tres criterios deciden en cuál categoría estás.",
    start: "Empezar",
    time: "4 preguntas · 2 minutos · sin registro",
    honest: "Lo que esta herramienta NO hace",
    honestBody:
      "No emite certificados, no te diagnostica y no reemplaza a un profesional con licencia. Te dice dónde estás parada frente a los tres criterios federales y qué te falta.",
    back: "Atrás",
    next: "Siguiente",
    seeResult: "Ver mi resultado",
    step: "Paso",
    of: "de",

    q1: "¿Tienes una condición de salud mental diagnosticada?",
    q1help:
      "Ansiedad, depresión, TEPT, trastorno de pánico u otra condición reconocida que limite una actividad importante de tu vida.",
    q1a: "Sí, diagnosticada por un profesional con licencia",
    q1b: "Creo que sí, pero no tengo diagnóstico formal",
    q1c: "No",

    q2: "¿Qué tareas entrenadas hace tu perro?",
    q2help: "Marca todas las que apliquen. Este es el criterio que más peso tiene.",
    tasks: [
      "Presión profunda cuando tengo una crisis",
      "Me trae la medicación",
      "Interrumpe conductas repetitivas o de autolesión",
      "Reacciona antes o durante un ataque de pánico",
      "Me guía a una salida o a un lugar seguro",
      "Crea espacio entre otras personas y yo",
      "Me despierta de pesadillas",
    ],
    none: "Ninguna — me acompaña y me calma con su presencia",

    q3: "¿Cómo se comporta en público?",
    q3help: "Marca solo lo que ya hace de forma confiable.",
    behaviors: [
      "No ladra ni gruñe a personas o perros",
      "No salta encima de la gente",
      "Ignora comida del piso y de las mesas",
      "Se echa quieto bajo la mesa o el asiento",
      "Camina con correa o arnés sin jalar",
    ],

    q4: "¿Cuándo es tu próximo vuelo?",
    q4help: "Opcional. Sirve para calcular tus fechas límite.",
    noDate: "Todavía no tengo fecha",

    resultTitle: "Tu resultado",
    ref: "Referencia",
    generated: "Generado",
    criteria: "Los tres criterios federales",
    c1: "Condición diagnosticada",
    c2: "Tarea entrenada",
    c3: "Comportamiento en público",
    met: "Cumplido",
    partial: "Parcial",
    notYet: "Todavía no",
    nextSteps: "Tus próximos pasos",
    deadlines: "Tus fechas límite",
    daysLeft: "días para tu vuelo",
    scamTitle: "Antes de que alguien te cobre",
    scamBody:
      "No existe ningún registro federal obligatorio de perros de servicio. Nadie puede exigirte un certificado, un carnet ni un chaleco para volar. Si una página te vende un registro como requisito legal, es una estafa. Lo que sí necesitas es el formulario del DOT, que es gratuito.",
    notCert:
      "Esto no es un certificado y no tiene valor legal. Es una orientación basada en los criterios públicos del DOT y la ADA.",
    emailTitle: "Recibe la guía completa",
    emailBody:
      "El formulario DOT explicado paso a paso, requisitos por aerolínea y checklist por país. En español y en inglés.",
    emailPh: "tu@correo.com",
    emailBtn: "Enviar la guía",
    emailOk: "Listo. Revisa tu correo en los próximos minutos.",
    emailErr: "Escribe un correo válido para continuar.",
    restart: "Empezar de nuevo",
    seeGuide: "Ver la guía completa",
  },
  en: {
    kicker: "AllGo Travel · Free tool",
    title: "Does your dog qualify as a Psychiatric Service Dog?",
    lede:
      "Since 2021, emotional support animals no longer fly free in the United States. Psychiatric service dogs still do. Three criteria decide which category you're in.",
    start: "Start",
    time: "4 questions · 2 minutes · no signup",
    honest: "What this tool does NOT do",
    honestBody:
      "It issues no certificates, does not diagnose you, and does not replace a licensed professional. It shows you where you stand against the three federal criteria and what's missing.",
    back: "Back",
    next: "Next",
    seeResult: "See my result",
    step: "Step",
    of: "of",

    q1: "Do you have a diagnosed mental health condition?",
    q1help:
      "Anxiety, depression, PTSD, panic disorder or another recognized condition that limits a major life activity.",
    q1a: "Yes, diagnosed by a licensed professional",
    q1b: "I think so, but I have no formal diagnosis",
    q1c: "No",

    q2: "What trained tasks does your dog perform?",
    q2help: "Check all that apply. This is the criterion that carries the most weight.",
    tasks: [
      "Deep pressure therapy during a crisis",
      "Retrieves my medication",
      "Interrupts repetitive or self-harming behavior",
      "Responds before or during a panic attack",
      "Guides me to an exit or a safe place",
      "Creates space between me and other people",
      "Wakes me from nightmares",
    ],
    none: "None — she keeps me company and calms me by being there",

    q3: "How does your dog behave in public?",
    q3help: "Only check what your dog already does reliably.",
    behaviors: [
      "Doesn't bark or growl at people or dogs",
      "Doesn't jump on people",
      "Ignores food on the floor and on tables",
      "Settles quietly under a table or seat",
      "Walks on leash or harness without pulling",
    ],

    q4: "When is your next flight?",
    q4help: "Optional. Used to calculate your deadlines.",
    noDate: "I don't have a date yet",

    resultTitle: "Your result",
    ref: "Reference",
    generated: "Generated",
    criteria: "The three federal criteria",
    c1: "Diagnosed condition",
    c2: "Trained task",
    c3: "Public behavior",
    met: "Met",
    partial: "Partial",
    notYet: "Not yet",
    nextSteps: "Your next steps",
    deadlines: "Your deadlines",
    daysLeft: "days until your flight",
    scamTitle: "Before anyone charges you",
    scamBody:
      "There is no mandatory federal registry for service dogs. Nobody can require a certificate, an ID card or a vest for you to fly. If a website sells you a registration as a legal requirement, it's a scam. What you do need is the DOT form, which is free.",
    notCert:
      "This is not a certificate and has no legal value. It's guidance based on the public DOT and ADA criteria.",
    emailTitle: "Get the full guide",
    emailBody:
      "The DOT form explained step by step, airline requirements and a country checklist. In Spanish and English.",
    emailPh: "you@email.com",
    emailBtn: "Send me the guide",
    emailOk: "Done. Check your inbox in the next few minutes.",
    emailErr: "Enter a valid email to continue.",
    restart: "Start over",
    seeGuide: "See the full guide",
  },
};

/* ---------------- lógica ---------------- */

function evaluate(a) {
  const c1 = a.dx === "yes" ? "met" : a.dx === "maybe" ? "partial" : "no";
  const c2 = a.tasks.length > 0 ? "met" : "no";
  const n = a.behaviors.length;
  const c3 = n >= 5 ? "met" : n >= 3 ? "partial" : "no";
  return { c1, c2, c3 };
}

function buildSteps(s, a, lang) {
  const out = [];
  const es = lang === "es";

  if (s.c2 === "no") {
    out.push(
      es
        ? "Entrena al menos una tarea. Esta es la línea exacta entre un perro de apoyo emocional y un perro de servicio: dar compañía no cuenta, ejecutar una tarea sí. La presión profunda suele ser la más accesible para empezar."
        : "Train at least one task. This is the exact line between an emotional support animal and a service dog: providing comfort doesn't count, performing a task does. Deep pressure is usually the most accessible place to start."
    );
  }
  if (s.c1 === "partial") {
    out.push(
      es
        ? "Agenda una evaluación con un profesional de salud mental con licencia. Sin diagnóstico no se sostiene el resto."
        : "Book an evaluation with a licensed mental health professional. Without a diagnosis, the rest doesn't hold."
    );
  }
  if (s.c1 === "no") {
    out.push(
      es
        ? "El primer paso es una consulta con un profesional con licencia. Un perro de servicio se define por la discapacidad que asiste."
        : "The first step is a consultation with a licensed professional. A service dog is defined by the disability it assists with."
    );
  }
  if (s.c3 === "partial" || s.c3 === "no") {
    out.push(
      es
        ? "Trabaja el acceso público. Una aerolínea puede negarte el embarque si tu perro ladra, salta o no se queda quieto — aunque cumplas todo lo demás."
        : "Work on public access. An airline can deny boarding if your dog barks, jumps or won't settle — even if you meet everything else."
    );
  }
  if (s.c1 === "met" && s.c2 === "met") {
    out.push(
      es
        ? "Completa el formulario del DOT (Service Animal Air Transportation Form). Es gratuito y se entrega hasta 48 horas antes del vuelo."
        : "Complete the DOT Service Animal Air Transportation Form. It's free and submitted up to 48 hours before your flight."
    );
    out.push(
      es
        ? "Si tu vuelo dura 8 horas o más, puede que también te pidan el formulario de alivio. Pregúntalo al reservar, no en el aeropuerto."
        : "If your flight is 8 hours or longer, you may also need the relief attestation form. Ask when booking, not at the airport."
    );
    out.push(
      es
        ? "Llama al escritorio de accesibilidad de tu aerolínea y pide el nombre de quien te atienda. Ese nombre te sirve si hay un problema en el mostrador."
        : "Call your airline's accessibility desk and ask for the name of whoever helps you. That name matters if there's a problem at the counter."
    );
  }
  return out;
}

function headline(s, lang) {
  const es = lang === "es";
  const all = s.c1 === "met" && s.c2 === "met" && s.c3 === "met";
  if (all)
    return es
      ? "Cumples los tres criterios. Lo que falta es el papeleo."
      : "You meet all three criteria. What's left is paperwork.";
  if (s.c2 === "met" && s.c1 !== "no")
    return es
      ? "Vas por buen camino. Cumples el criterio que más pesa."
      : "You're on track. You meet the criterion that matters most.";
  if (s.c2 === "no")
    return es
      ? "Hoy tu perro no califica — pero esto se entrena."
      : "Today your dog doesn't qualify — but this is trainable.";
  return es ? "Te falta camino, y es camino recorrible." : "You have some way to go, and it's walkable.";
}

/* ---------------- piezas de UI ---------------- */

function Pill({ state, t }) {
  const map = {
    met: { bg: C.tealSoft, fg: C.teal, label: t.met },
    partial: { bg: C.amberSoft, fg: C.amber, label: t.partial },
    no: { bg: "#EFEFEA", fg: C.muted, label: t.notYet },
  };
  const s = map[state];
  return (
    <span
      className="inline-block rounded-full px-3 py-1"
      style={{
        background: s.bg,
        color: s.fg,
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        fontWeight: 500,
      }}
    >
      {s.label}
    </span>
  );
}

function Choice({ selected, onClick, children, multi }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left mb-3 flex items-start gap-3 transition-colors"
      style={{
        background: selected ? C.tealSoft : C.card,
        border: `1px solid ${selected ? C.teal : C.line}`,
        borderRadius: 4,
        padding: "14px 16px",
        color: C.ink,
        fontFamily: SANS,
        fontSize: 15,
        lineHeight: 1.45,
      }}
    >
      <span
        className="shrink-0 flex items-center justify-center"
        style={{
          width: 18,
          height: 18,
          marginTop: 2,
          borderRadius: multi ? 3 : 9,
          border: `1.5px solid ${selected ? C.teal : "#B9BDB6"}`,
          background: selected ? C.teal : "transparent",
          color: "#fff",
          fontSize: 12,
          lineHeight: 1,
        }}
      >
        {selected ? "✓" : ""}
      </span>
      <span>{children}</span>
    </button>
  );
}

function Label({ children }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: C.muted,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------- componente principal ---------------- */

export default function VerificadorPSD() {
  const [lang, setLang] = useState("es");
  const [screen, setScreen] = useState(0); // 0 intro, 1-4 preguntas, 5 resultado
  const [dx, setDx] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [none, setNone] = useState(false);
  const [behaviors, setBehaviors] = useState([]);
  const [date, setDate] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const t = T[lang];
  const answers = { dx, tasks, behaviors, date };
  const status = useMemo(() => evaluate(answers), [dx, tasks, behaviors]);
  const steps = useMemo(() => buildSteps(status, answers, lang), [status, lang]);

  const ref = useMemo(
    () =>
      "AG-" +
      Math.random().toString(36).slice(2, 6).toUpperCase() +
      "-" +
      Math.random().toString(36).slice(2, 6).toUpperCase(),
    []
  );

  const daysToFlight = useMemo(() => {
    if (!date) return null;
    const d = new Date(date + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((d - now) / 86400000);
  }, [date]);

  const toggle = (arr, set, v) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const pickTask = (task) => {
    setNone(false);
    toggle(tasks, setTasks, task);
  };
  const pickNone = () => {
    setNone(true);
    setTasks([]);
  };

  const canAdvance =
    (screen === 1 && dx !== null) ||
    (screen === 2 && (tasks.length > 0 || none)) ||
    screen === 3 ||
    screen === 4;

  const handleEmail = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErr(t.emailErr);
      return;
    }
    setErr("");
    // Envío del lead al backend (ManyChat/Supabase). Si EMAIL_ENDPOINT está
    // vacío, se omite el POST y solo se muestra el mensaje de éxito.
    if (EMAIL_ENDPOINT) {
      try {
        await fetch(EMAIL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, ref, status }),
        });
      } catch (e) {
        // No bloquear al usuario si el backend falla; el lead se puede
        // recuperar del lado del cliente en una siguiente iteración.
      }
    }
    setSent(true);
  };

  const reset = () => {
    setScreen(0);
    setDx(null);
    setTasks([]);
    setNone(false);
    setBehaviors([]);
    setDate("");
    setEmail("");
    setSent(false);
    setErr("");
  };

  const btn = (primary) => ({
    background: primary ? C.teal : "transparent",
    color: primary ? "#fff" : C.muted,
    border: primary ? "none" : `1px solid ${C.line}`,
    borderRadius: 3,
    padding: "13px 22px",
    fontFamily: SANS,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
  });

  return (
    <div style={{ background: C.paper, minHeight: "100vh", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        button:focus-visible, input:focus-visible {
          outline: 2px solid ${C.teal}; outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>

      <div className="mx-auto px-5 py-8" style={{ maxWidth: 620 }}>
        {/* encabezado */}
        <div className="flex items-center justify-between mb-8">
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: C.muted }}>
            {t.kicker.toUpperCase()}
          </div>
          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.08em",
              color: C.teal,
              background: "transparent",
              border: `1px solid ${C.line}`,
              borderRadius: 3,
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
        </div>

        {/* intro */}
        {screen === 0 && (
          <div>
            <h1
              style={{
                fontFamily: SANS,
                fontWeight: 700,
                fontSize: 30,
                lineHeight: 1.18,
                letterSpacing: "-0.02em",
                marginBottom: 18,
              }}
            >
              {t.title}
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 16, lineHeight: 1.6, color: "#3A4653", marginBottom: 26 }}>
              {t.lede}
            </p>

            <div
              style={{
                background: C.card,
                border: `1px solid ${C.line}`,
                borderRadius: 4,
                padding: 18,
                marginBottom: 26,
              }}
            >
              <Label>{t.honest}</Label>
              <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: "#3A4653", margin: 0 }}>
                {t.honestBody}
              </p>
            </div>

            <button onClick={() => setScreen(1)} style={{ ...btn(true), width: "100%" }}>
              {t.start}
            </button>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11.5,
                color: C.muted,
                textAlign: "center",
                marginTop: 12,
              }}
            >
              {t.time}
            </div>
          </div>
        )}

        {/* preguntas */}
        {screen >= 1 && screen <= 4 && (
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.1em",
                color: C.muted,
                marginBottom: 20,
              }}
            >
              {t.step} {screen} {t.of} 4
            </div>
            <div style={{ height: 2, background: C.line, marginBottom: 28 }}>
              <div style={{ height: 2, width: `${(screen / 4) * 100}%`, background: C.teal }} />
            </div>

            <h2
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: 22,
                lineHeight: 1.3,
                letterSpacing: "-0.015em",
                marginBottom: 8,
              }}
            >
              {screen === 1 ? t.q1 : screen === 2 ? t.q2 : screen === 3 ? t.q3 : t.q4}
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.55, color: C.muted, marginBottom: 24 }}>
              {screen === 1 ? t.q1help : screen === 2 ? t.q2help : screen === 3 ? t.q3help : t.q4help}
            </p>

            {screen === 1 && (
              <>
                <Choice selected={dx === "yes"} onClick={() => setDx("yes")}>{t.q1a}</Choice>
                <Choice selected={dx === "maybe"} onClick={() => setDx("maybe")}>{t.q1b}</Choice>
                <Choice selected={dx === "no"} onClick={() => setDx("no")}>{t.q1c}</Choice>
              </>
            )}

            {screen === 2 && (
              <>
                {t.tasks.map((task, i) => (
                  <Choice key={i} multi selected={tasks.includes(i)} onClick={() => pickTask(i)}>
                    {task}
                  </Choice>
                ))}
                <div style={{ height: 1, background: C.line, margin: "18px 0" }} />
                <Choice multi selected={none} onClick={pickNone}>{t.none}</Choice>
              </>
            )}

            {screen === 3 && (
              <>
                {t.behaviors.map((b, i) => (
                  <Choice key={i} multi selected={behaviors.includes(i)} onClick={() => toggle(behaviors, setBehaviors, i)}>
                    {b}
                  </Choice>
                ))}
              </>
            )}

            {screen === 4 && (
              <>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: `1px solid ${C.line}`,
                    borderRadius: 4,
                    fontFamily: SANS,
                    fontSize: 15,
                    color: C.ink,
                    background: C.card,
                  }}
                />
                <button
                  onClick={() => setDate("")}
                  style={{
                    marginTop: 12,
                    background: "transparent",
                    border: "none",
                    color: C.muted,
                    fontFamily: SANS,
                    fontSize: 14,
                    textDecoration: "underline",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {t.noDate}
                </button>
              </>
            )}

            <div className="flex gap-3 mt-8">
              <button onClick={() => setScreen(screen - 1)} style={btn(false)}>
                {t.back}
              </button>
              <button
                onClick={() => setScreen(screen + 1)}
                disabled={!canAdvance}
                style={{ ...btn(true), flex: 1, opacity: canAdvance ? 1 : 0.4 }}
              >
                {screen === 4 ? t.seeResult : t.next}
              </button>
            </div>
          </div>
        )}

        {/* resultado */}
        {screen === 5 && (
          <div>
            {/* comprobante */}
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.line}`,
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  padding: "12px 18px",
                  borderBottom: `1px dashed ${C.line}`,
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: MONO,
                  fontSize: 11,
                  color: C.muted,
                  letterSpacing: "0.06em",
                }}
              >
                <span>{t.ref}: {ref}</span>
                <span>{new Date().toLocaleDateString(lang === "es" ? "es-US" : "en-US")}</span>
              </div>

              <div style={{ padding: "22px 18px" }}>
                <h2
                  style={{
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 24,
                    lineHeight: 1.25,
                    letterSpacing: "-0.02em",
                    marginTop: 0,
                    marginBottom: 22,
                  }}
                >
                  {headline(status, lang)}
                </h2>

                <Label>{t.criteria}</Label>
                {[
                  [t.c1, status.c1],
                  [t.c2, status.c2],
                  [t.c3, status.c3],
                ].map(([label, st], i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between"
                    style={{
                      padding: "13px 0",
                      borderBottom: i < 2 ? `1px solid ${C.line}` : "none",
                      fontFamily: SANS,
                      fontSize: 15,
                    }}
                  >
                    <span>{label}</span>
                    <Pill state={st} t={t} />
                  </div>
                ))}
              </div>
            </div>

            {/* fechas límite */}
            {daysToFlight !== null && daysToFlight >= 0 && (
              <div
                style={{
                  background: C.amberSoft,
                  border: `1px solid ${C.amber}`,
                  borderRadius: 4,
                  padding: 18,
                  marginBottom: 24,
                }}
              >
                <Label>{t.deadlines}</Label>
                <div
                  style={{
                    fontFamily: SANS,
                    fontWeight: 700,
                    fontSize: 34,
                    lineHeight: 1,
                    color: C.amber,
                    marginBottom: 4,
                  }}
                >
                  {daysToFlight}
                </div>
                <div style={{ fontFamily: SANS, fontSize: 14.5, color: "#3A4653" }}>
                  {t.daysLeft}
                </div>
              </div>
            )}

            {/* pasos */}
            <div style={{ marginBottom: 24 }}>
              <Label>{t.nextSteps}</Label>
              {steps.map((s, i) => (
                <div key={i} className="flex gap-3" style={{ marginBottom: 14 }}>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      color: C.teal,
                      paddingTop: 3,
                      minWidth: 20,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 15, lineHeight: 1.55, color: "#3A4653" }}>
                    {s}
                  </span>
                </div>
              ))}
            </div>

            {/* estafas */}
            <div
              style={{
                background: C.card,
                borderLeft: `3px solid ${C.teal}`,
                border: `1px solid ${C.line}`,
                borderLeftWidth: 3,
                borderRadius: 4,
                padding: 18,
                marginBottom: 24,
              }}
            >
              <Label>{t.scamTitle}</Label>
              <p style={{ fontFamily: SANS, fontSize: 14.5, lineHeight: 1.6, color: "#3A4653", margin: 0 }}>
                {t.scamBody}
              </p>
            </div>

            {/* email */}
            <div
              style={{
                background: C.ink,
                borderRadius: 4,
                padding: 22,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: 19,
                  color: "#fff",
                  marginBottom: 8,
                }}
              >
                {t.emailTitle}
              </div>
              <p
                style={{
                  fontFamily: SANS,
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  color: "#A9B4BF",
                  marginTop: 0,
                  marginBottom: 16,
                }}
              >
                {t.emailBody}
              </p>

              {sent ? (
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color: "#8FD0C4",
                    padding: "12px 0",
                  }}
                >
                  ✓ {t.emailOk}
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={email}
                    placeholder={t.emailPh}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "13px 15px",
                      border: "1px solid #2E3A47",
                      background: "#0F1720",
                      borderRadius: 3,
                      color: "#fff",
                      fontFamily: SANS,
                      fontSize: 15,
                      marginBottom: 10,
                    }}
                  />
                  {err && (
                    <div style={{ fontFamily: MONO, fontSize: 12, color: "#E2A34B", marginBottom: 10 }}>
                      {err}
                    </div>
                  )}
                  <button
                    onClick={handleEmail}
                    style={{
                      width: "100%",
                      background: C.teal,
                      color: "#fff",
                      border: "none",
                      borderRadius: 3,
                      padding: "13px",
                      fontFamily: SANS,
                      fontSize: 15,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {t.emailBtn}
                  </button>
                </>
              )}
            </div>

            <a
              href={GUIDE_URL}
              style={{
                display: "block",
                textAlign: "center",
                fontFamily: SANS,
                fontSize: 15,
                color: C.teal,
                textDecoration: "underline",
                marginBottom: 22,
              }}
            >
              {t.seeGuide}
            </a>

            <p
              style={{
                fontFamily: MONO,
                fontSize: 11.5,
                lineHeight: 1.6,
                color: C.muted,
                borderTop: `1px solid ${C.line}`,
                paddingTop: 16,
              }}
            >
              {t.notCert}
            </p>

            <button
              onClick={reset}
              style={{
                background: "transparent",
                border: "none",
                color: C.muted,
                fontFamily: SANS,
                fontSize: 14,
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
                marginTop: 4,
              }}
            >
              {t.restart}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
