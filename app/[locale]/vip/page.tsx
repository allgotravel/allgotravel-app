import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { requireMember } from '@/lib/subscription'
import VipForm from '@/components/VipForm'

export const dynamic = 'force-dynamic'

type Included = { icon: string; title: string; text: string }

const INCLUDED: Included[] = [
  { icon: '🔎', title: 'Verificación de tu ruta exacta', text: 'Revisamos tu aerolínea y tu país de destino, con la fuente oficial y la fecha. Nada de suposiciones.' },
  { icon: '📄', title: 'Dossier de viaje personalizado (PDF)', text: 'Todo tu caso en un solo documento elegante: requisitos, formularios, contactos y pasos, listo para llevar.' },
  { icon: '📋', title: 'Tus documentos, preparados', text: 'Dejamos listo tu formulario del DOT y tu checklist, paso a paso, para tu caso.' },
  { icon: '🗺️', title: 'Itinerario accesible', text: 'Hoteles accesibles verificados, áreas de alivio del aeropuerto y tiempos, en un plan claro que puedes seguir.' },
  { icon: '💬', title: 'Soporte prioritario por WhatsApp', text: 'Nos escribes antes y durante el viaje y te respondemos rápido. Nunca estás solo.' },
  { icon: '🛡️', title: 'Garantía de tranquilidad', text: 'Revisamos y ajustamos hasta que todo quede claro. Tu objetivo: viajar sin sorpresas.' },
]

const CSS = `
.vip{--navy:#0a2440;--navy2:#0e3a63;--gold:#d9b45b;--gold-l:#f3d68a;--gold-d:#b8912f;--cream:#faf7f0;--ink:#1b2733;--muted:#6b7683;--line:#ece4d2;background:var(--cream);color:var(--ink);min-height:100vh}
.vip .serif{font-family:'Playfair Display',Georgia,'Times New Roman',serif}
.vip .hero{position:relative;color:#fff;padding:34px 24px 40px;overflow:hidden;border-bottom:1px solid rgba(217,180,91,.35);background:radial-gradient(120% 90% at 80% 0%, #14406b 0%, transparent 60%),linear-gradient(160deg,var(--navy),#071a30)}
.vip .hairline{position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,transparent,var(--gold),var(--gold-l),var(--gold),transparent);background-size:200% 100%;animation:vsweep 6s linear infinite}
@keyframes vsweep{to{background-position:200% 0}}
.vip .spark{position:absolute;color:var(--gold-l);font-size:12px;opacity:0;animation:vtw 4s infinite}
@keyframes vtw{0%,100%{opacity:0;transform:scale(.5) rotate(0)}50%{opacity:.85;transform:scale(1) rotate(20deg)}}
.vip .back{position:relative;z-index:2;color:rgba(255,255,255,.7);font-size:.85rem;font-weight:500;text-decoration:none}
.vip .back:hover{color:#fff}
.vip .crown{display:inline-flex;align-items:center;gap:7px;position:relative;z-index:2;margin-top:16px;padding:7px 15px;border:1px solid rgba(217,180,91,.55);border-radius:30px;font-size:.66rem;font-weight:700;letter-spacing:1.5px;color:var(--gold-l);background:rgba(217,180,91,.08);overflow:hidden;opacity:0;animation:vup .7s .18s forwards}
.vip .crown::after{content:'';position:absolute;top:0;left:-140%;width:50%;height:100%;background:linear-gradient(90deg,transparent,rgba(243,214,138,.5),transparent);transform:skewX(-20deg);animation:vshine 4.5s 1s infinite}
@keyframes vshine{0%{left:-140%}40%,100%{left:170%}}
.vip .h1{position:relative;z-index:2;font-size:2rem;line-height:1.18;margin:16px 0 10px;font-weight:600;letter-spacing:.3px;color:#fff;opacity:0;animation:vup .8s .28s forwards}
.vip .h1 .g{background:linear-gradient(90deg,var(--gold-l),var(--gold),var(--gold-l));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.vip .lead{position:relative;z-index:2;color:#c4d0de;font-size:.95rem;max-width:440px;opacity:0;animation:vup .8s .4s forwards}
.vip .priceRow{position:relative;z-index:2;display:flex;align-items:baseline;gap:10px;margin-top:22px;opacity:0;animation:vup .8s .52s forwards}
.vip .price{font-size:2.4rem;font-weight:700;letter-spacing:.5px;color:#fff;animation:vglow 3.4s 1.2s ease-in-out infinite}
@keyframes vglow{0%,100%{text-shadow:0 0 0 rgba(217,180,91,0)}50%{text-shadow:0 0 26px rgba(243,214,138,.45)}}
.vip .price .cur{color:var(--gold-l)}
.vip .per{color:#a9b7c7;font-size:.8rem;letter-spacing:.3px}
@keyframes vup{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.vip .sec{padding:28px 24px;max-width:640px;margin:0 auto}
.vip .eyebrow{font-size:.66rem;font-weight:800;letter-spacing:2px;color:var(--gold-d);text-transform:uppercase;margin-bottom:6px}
.vip .h2{font-size:1.3rem;font-weight:600;color:var(--navy)}
.vip .rule{width:46px;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold-l));margin:12px 0 18px;border-radius:2px}
.vip .inc{list-style:none;display:grid;gap:13px;margin:0;padding:0}
.vip .inc li{display:flex;gap:14px;align-items:flex-start;background:#fff;border:1px solid var(--line);border-radius:16px;padding:16px 17px;box-shadow:0 6px 18px rgba(20,40,70,.05);transition:transform .35s cubic-bezier(.2,.7,.3,1),box-shadow .35s,border-color .35s;opacity:0;animation:vup .7s forwards}
.vip .inc li:nth-child(1){animation-delay:.05s}.vip .inc li:nth-child(2){animation-delay:.14s}.vip .inc li:nth-child(3){animation-delay:.23s}.vip .inc li:nth-child(4){animation-delay:.32s}.vip .inc li:nth-child(5){animation-delay:.41s}.vip .inc li:nth-child(6){animation-delay:.5s}
.vip .inc li:hover{transform:translateY(-4px);box-shadow:0 16px 34px rgba(20,40,70,.13);border-color:rgba(217,180,91,.6)}
.vip .inc .ic{width:44px;height:44px;border-radius:12px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:20px;background:linear-gradient(135deg,#fbf3dd,#f4e6bf);border:1px solid #eeddb2}
.vip .inc .t{font-weight:700;font-size:.98rem;color:var(--navy)}
.vip .inc .d{font-size:.86rem;color:var(--muted);margin-top:3px}
.vip .who{display:flex;gap:10px;align-items:flex-start;margin-top:18px;background:linear-gradient(120deg,#fff9ec,#fffdf8);border:1px solid #efdfb4;border-radius:14px;padding:15px 17px;font-size:.9rem;color:#6a5324}
.vip .who b{color:var(--gold-d)}
.vip .formSec{padding:6px 24px 40px;max-width:640px;margin:0 auto}
`

export default async function VipPage() {
  const locale = await getLocale()
  await requireMember(locale)

  return (
    <main className="vip">
      <style>{CSS}</style>

      <section className="hero">
        <div className="hairline" />
        <span className="spark" style={{ top: 26, left: '72%' }}>✦</span>
        <span className="spark" style={{ top: 70, left: '44%', animationDelay: '1.2s' }}>✧</span>
        <span className="spark" style={{ top: 120, left: '84%', animationDelay: '2.1s' }}>✦</span>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <Link href="/dashboard" className="back">← Inicio</Link>
          <div className="crown">👑 EXPERIENCIA VIP · SOLO MIEMBROS</div>
          <h1 className="h1 serif">Tu viaje, <span className="g">planificado por un especialista</span></h1>
          <p className="lead">
            Nosotros hacemos todo el trabajo por ti: verificamos tu ruta, preparamos tus documentos y armamos tu
            itinerario. Tú solo viajas tranquilo.
          </p>
          <div className="priceRow">
            <span className="price serif"><span className="cur">$</span>297</span>
            <span className="per">PAGO ÚNICO · POR VIAJE</span>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="eyebrow">Servicio hecho para ti</div>
        <h2 className="h2 serif">Qué incluye tu paquete VIP</h2>
        <div className="rule" />
        <ul className="inc">
          {INCLUDED.map((it) => (
            <li key={it.title}>
              <div className="ic">{it.icon}</div>
              <div>
                <div className="t">{it.title}</div>
                <div className="d">{it.text}</div>
              </div>
            </li>
          ))}
        </ul>
        <div className="who">
          <span>✨</span>
          <div>
            <b>Ideal si</b> tienes un viaje importante pronto, una ruta complicada, o simplemente quieres que alguien
            se encargue de todo por ti.
          </div>
        </div>
      </section>

      <section className="formSec">
        <VipForm />
      </section>
    </main>
  )
}
