'use client'

import { useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import './landing.css'

// Organic traffic goes to each guide's landing page (never straight to checkout).
// The landings carry ?src through to Hotmart (sck) for sales-origin tracking.
const GUIDE = {
  perro: '/perro.html?src=home',
  turismo: '/turismo.html?src=home',
  pack: '/perro.html?src=home-pack#pack',
  mexico: '/mexico.html?src=home',
}

// ── Named testimonials ──
// ONLY real people who gave permission to use their name and words. Never invent
// or paraphrase. Sandra and Bertha (@miamiglamcreations) gave permission (Oct 2026);
// both relate to the Service Dog guide, so their quotes sit next to that guide.
// TURISMO_TESTIMONIALS: add an entry once someone gives permission. While the list
// is empty nothing is rendered.
type NamedTestimonial = { quote: string; name: string; detail?: string; tr?: string }
const TURISMO_TESTIMONIALS: NamedTestimonial[] = []

function TestimonialCard({ quote, name, detail, tr }: NamedTestimonial) {
  return (
    <figure className="tcard gtest">
      <div className="st" aria-hidden="true">★★★★★</div>
      <blockquote lang="es"><p>{quote}</p></blockquote>
      {tr && <p className="gtr">{tr}</p>}
      <figcaption className="who">{name}{detail && <small>{detail}</small>}</figcaption>
    </figure>
  )
}

export default function HomeClient() {
  const t = useTranslations('landing')
  const locale = useLocale()
  const other = locale === 'en' ? 'es' : 'en'

  useEffect(() => {
    // Smooth-scroll for in-page anchors
    const handler = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement
      const id = a.getAttribute('href')
      if (id && id.startsWith('#') && id.length > 1) {
        const target = document.querySelector(id)
        if (target) {
          e.preventDefault()
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }
    const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
    anchors.forEach(a => a.addEventListener('click', handler))

    // Reveal-on-scroll
    const io = new IntersectionObserver(
      entries => entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) }
      }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))

    // Keep the chat bubble from covering the hero text on mobile
    const root = document.documentElement
    const hero = document.querySelector('.lp .hero')
    const heroIo = new IntersectionObserver(([en]) => root.classList.toggle('lp-hero-visible', en.isIntersecting), { rootMargin: '-80px 0px 0px 0px' })
    if (hero) heroIo.observe(hero)

    return () => { anchors.forEach(a => a.removeEventListener('click', handler)); io.disconnect(); heroIo.disconnect(); root.classList.remove('lp-hero-visible') }
  }, [])

  return (
    <div className="lp">

      {/* ── NAV ── */}
      <header className="nav">
        <div className="wrap row">
          <a className="brand" href="#top" aria-label="AllGo Travel App"><img className="brandlogo" src="/landing/img1.png" alt="AllGo Travel App" /> <span className="brandtxt">AllGo Travel App</span></a>
          <div className="menuwrap">
            <nav className="navlinks">
              <a href="#guias">{t('h3NavGuides')}</a>
              <a href="#historia">{t('navAbout')}</a>
              <a href="#faq">{t('navFaq')}</a>
            </nav>
            <a href={`/${other}`} className="pill" style={{ cursor: 'pointer', background: '#fff', border: '1.5px solid var(--tealb)', color: 'var(--teal)', fontWeight: 800 }}>{t('toggleLabel')}</a>
            <Link href="/login" className="pill" style={{ fontWeight: 700 }}>{t('navLogin')}</Link>
            <a className="cta" href="#guias">{t('h3NavCta')}</a>
          </div>
        </div>
      </header>

      <a id="top" />

      {/* ── HERO: on mobile (≈390×750) the offer + CTA fit before any scroll;
             the photo sits BELOW the text and is shorter on mobile ── */}
      <section className="hero">
        <div className="wrap grid">
          <div className="herotxt">
            <span className="kicker">{t('h3Kicker')}</span>
            <h1 className="h1long">{t('h3H1')}</h1>
            <p className="sub">{t('h3Sub')}</p>
            <ul className="herochecks">
              <li>{t('h3Bullet1')}</li>
              <li>{t('h3Bullet2')}</li>
              <li>{t('h3Bullet3')}</li>
            </ul>
            <div className="actions">
              <a className="btn btn-primary" href="#guias">{t('h3HeroCta')}</a>
            </div>
            <p className="v2line">{t('h3From')}</p>
            <ul className="heroprods">
              <li><a href={GUIDE.perro}><span className="e" aria-hidden="true">🦮</span><span className="tx">{t('h3Mini1')}<small>{t('h3Mini1Sub')}</small></span><span className="pr">$37</span></a></li>
              <li><a href={GUIDE.turismo}><span className="e" aria-hidden="true">♿</span><span className="tx">{t('h3Mini2')}<small>{t('h3Mini2Sub')}</small></span><span className="pr">$37</span></a></li>
              <li className="pk"><a href={GUIDE.pack}><span className="e" aria-hidden="true">⭐</span><span className="tx">{t('h3Mini3')}<small>{t('h3Mini3Sub')}</small></span><span className="pr">$59</span></a></li>
            </ul>
          </div>
          <div className="heroimg">
            <img src="/img/home-hero.webp" width={800} height={999} alt={t('heroImgAlt')} />
            <div className="badge-float"><span className="ic">🌻</span> {t('heroBadge')}</div>
          </div>
        </div>
      </section>

      {/* ── ¿NO SABES CUÁL ELEGIR? 4 situations, right after the hero ── */}
      <section className="section selector" id="viaje">
        <div className="wrap center">
          <span className="kicker">{t('h3ProfKicker')}</span>
          <h2 style={{ margin: '14px 0 22px' }}>{t('h3SelTitle')}</h2>
          <div className="selgrid">
            <a className="selcard" href="/perro.html?src=home"><span className="e">🦮</span><span className="tx">{t('sel1')}</span><span className="go">→</span></a>
            <a className="selcard" href="/turismo.html?src=home"><span className="e">♿</span><span className="tx">{t('sel2')}{locale === 'en' && <small>{t('selEsOnly')}</small>}</span><span className="go">→</span></a>
            <a className="selcard" href="/turismo.html?src=home-sensorial"><span className="e">🌻</span><span className="tx">{t('sel3')}{locale === 'en' && <small>{t('selEsOnly')}</small>}</span><span className="go">→</span></a>
            <a className="selcard" href="/turismo.html?src=home-mayor"><span className="e">👵</span><span className="tx">{t('sel4')}{locale === 'en' && <small>{t('selEsOnly')}</small>}</span><span className="go">→</span></a>
          </div>
          <p className="gagency">{t('h3NotAgency')}</p>
        </div>
      </section>

      {/* ── GUIDES: para quién es · qué resuelve · precio · botón a su landing ── */}
      <section className="section needs" id="guias">
        <div className="wrap center reveal">
          <span className="kicker">{t('h3GKicker')}</span>
          <h2 style={{ margin: '14px 0 8px' }}>{t('h3GTitle')}</h2>
          <p className="lead" style={{ margin: '0 auto 40px' }}>{t('h3GLead')}</p>
        </div>
        {/* Nuevo: Patitas Viajeras Sin Fronteras (México; la guía está solo en español) → /mexico.html */}
        <div className="wrap reveal">
          <article className="prodcard gnew">
            <a className="ph" href={GUIDE.mexico}><img src="/img/mexico/portada-mini.jpg" width={240} height={360} loading="lazy" alt={t('h3MxCoverAlt')} /></a>
            <div className="bd">
              <span className="tag gnewtag">{t('h3MxBadge')}</span>
              <h3>{t('h3MxName')}</h3>
              <p className="gsys">{t('h3MxLine')}</p>
              <span className="prodsub">{t('h3MxLang')}</span>
              <div className="gnewrow">
                <div className="price">$17</div>
                <a className="btn btn-primary gbtn" href={GUIDE.mexico}>{t('h3MxCta')}</a>
              </div>
            </div>
          </article>
        </div>
        <div className="wrap gcards reveal">

          {/* Guía Perro de Servicio + Sandra's and Bertha's testimonials (with permission) */}
          <div className="gcol">
            <article className="prodcard">
              <div className="ph duo luna"><img className="photo" src="/img/yadira-luna-aeropuerto.webp" width={1000} height={1299} loading="lazy" alt={t('dogPhotoAlt')} /><img className="cover" src="/img/home-perro.webp" width={700} height={700} loading="lazy" alt={t('dogCoverAlt')} /></div>
              <div className="bd">
                <span className="tag">{t('prodDogTag')}</span>
                <h3>{t('dogGuideName')}</h3>
                <p className="gsys">{t('h3DogSys')}</p>
                <span className="prodsub">{t('h3LangLabel')}: {t('h3DogLang')}</span>
                <dl className="gdl">
                  <dt>{t('h3ForLabel')}</dt><dd>{t('h3DogFor')}</dd>
                  <dt>{t('h3SolvesLabel')}</dt><dd>{t('h3DogSolves')}</dd>
                </dl>
                <div className="price">$37</div>
                <a className="btn btn-primary gbtn" href={GUIDE.perro}>{t('h3DogCta')}</a>
              </div>
            </article>
            {/* Exact original quotes (Spanish) on both /es and /en; /en adds a labeled translation */}
            <TestimonialCard quote={t('h3SandraQuote')} name={t('h3SandraName')} detail={t('h3SandraSub')} tr={locale === 'en' ? t('h3SandraTr') : undefined} />
            <TestimonialCard quote={t('h3BerthaQuote')} name={t('h3BerthaName')} detail={t('h3BerthaSub')} tr={locale === 'en' ? t('h3BerthaTr') : undefined} />
          </div>

          {/* Guía Turismo Sin Fronteras (solo en español) */}
          <div className="gcol">
            <article className="prodcard">
              {/* Human photo (crop of the existing hero: wheelchair traveler + older adult in an airport) + the guide cover */}
              <div className="ph duo"><img className="photo tur" src="/img/home-hero.webp" width={800} height={999} loading="lazy" alt={t('h3TurPhotoAlt')} /><img className="cover tur" src="/img/turismo-portada-es.webp" width={700} height={700} loading="lazy" alt={t('prodTurImgAlt')} /></div>
              <div className="bd">
                <span className="tag">{t('h3TurTag')}</span>
                <h3>Turismo Sin Fronteras</h3>
                <p className="gsys">{t('h3TurSys')}</p>
                <span className="prodsub">{t('h3LangLabel')}: {t('h3TurLang')}</span>
                <dl className="gdl">
                  <dt>{t('h3ForLabel')}</dt><dd>{t('h3TurFor')}</dd>
                  <dt>{t('h3SolvesLabel')}</dt><dd>{t('h3TurSolves')}</dd>
                </dl>
                <div className="price">$37</div>
                <a className="btn btn-primary gbtn" href={GUIDE.turismo}>{t('h3TurCta')}</a>
              </div>
            </article>
            {/* Slot for real, named Turismo testimonials — hidden while the list is empty */}
            {TURISMO_TESTIMONIALS.map(x => <TestimonialCard key={x.name} {...x} />)}
          </div>

          {/* Pack Viajero Completo → perro.html#pack (landing, not checkout) */}
          <div className="gcol" id="pack">
            <article className="prodcard gpack">
              <span className="gbadge">{t('h3PackBadge')}</span>
              <div className="ph gduo"><img src="/img/home-perro.webp" width={700} height={700} loading="lazy" alt={t('dogCoverAlt')} /><img src="/img/turismo-portada-es.webp" width={700} height={700} loading="lazy" alt={t('prodTurImgAlt')} /></div>
              <div className="bd">
                <span className="tag">{t('cualBadge')}</span>
                <h3>{t('h3PackName')}</h3>
                <p className="gsys">{t('h3PackSys')}</p>
                <span className="prodsub">{t('h3LangLabel')}: {t('h3PackLang')}</span>
                <dl className="gdl">
                  <dt>{t('h3ForLabel')}</dt><dd>{t('h3PackFor')}</dd>
                  <dt>{t('h3SolvesLabel')}</dt><dd>{t('h3PackSolves')}</dd>
                </dl>
                <div className="price">$59<span className="old">$74</span></div>
                <a className="btn btn-primary gbtn" href={GUIDE.pack}>{t('h3PackCta')}</a>
              </div>
            </article>
          </div>
        </div>
        <p className="center gsecure">{t('h3Secure')}</p>
      </section>

      {/* ── POR DENTRO: partial previews (cropped on purpose, not enough to use for free) ── */}
      <section className="section inside" id="por-dentro">
        <div className="wrap center reveal">
          <h2 style={{ margin: '0 0 8px' }}>{t('h3InsideTitle')}</h2>
          <p className="lead" style={{ margin: '0 auto 26px' }}>{t('h3InsideLead')}</p>
        </div>
        <div className="wrap insidegrid reveal">
          {[
            { src: '/img/perro-cheatsheet-dot.webp', w: 800, h: 240, n: 1, dog: true, wide: true },
            { src: '/img/perro-aerolineas-region.webp', w: 800, h: 240, n: 2, dog: true, wide: true },
            // Modo Mostrador: page exported from the real bonus PDF; only the top shows (CSS crop + fade)
            { src: '/img/perro-modo-mostrador.jpg', w: 800, h: 1035, n: 5, dog: true, wide: false },
            { src: '/img/turismo-guiones.webp', w: 700, h: 656, n: 3, dog: false, wide: false },
            { src: '/img/turismo-tarjetas.webp', w: 700, h: 1624, n: 4, dog: false, wide: false },
          ].map(p => (
            <figure className="peek" key={p.n}>
              <div className={p.wide ? 'pv wide' : 'pv'}><img src={p.src} width={p.w} height={p.h} loading="lazy" alt={t(`h3Inside${p.n}`)} /></div>
              <figcaption><b>{t(`h3Inside${p.n}`)}</b><span className="use">{t(`h3InsideUse${p.n}`)}</span><small>{t(p.dog ? 'h3InsideFromDog' : 'h3InsideFromTur')}</small></figcaption>
            </figure>
          ))}
        </div>
        <p className="center insidenote">{t('h3InsideNote')}</p>
      </section>

      {/* ── TRUST BAR (only verifiable facts) ── */}
      <section className="trust">
        <div className="wrap row row3">
          <div><div className="n">{t('trust3n')}</div><div className="l">{t('trust3l')}</div></div>
          <div><div className="n">2026</div><div className="l">{t('h3Trust2026')}</div></div>
          <div><div className="n ntext">{t('trustSrcN')}</div><div className="l">{t('trustSrcL')}</div></div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="section story" id="historia">
        <div className="wrap reveal">
          <div className="storycard"><div className="split">
            <div className="txt">
              <span className="kicker">{t('storyKicker')}</span>
              <h2 style={{ margin: '14px 0 6px' }}>{t('storyWhoTitle')}</h2>
              {/* Yadira's own words (same founder text as perro/turismo/mexico.html) */}
              <p style={{ color: '#0E7C86', fontWeight: 700, margin: '0 0 12px' }}>{t('storyWhoSub')}</p>
              {[1, 2, 3, 4, 5].map(n => <p key={n} style={{ color: '#33475b', fontSize: 16 }}>{t(`storyWhoP${n}`)}</p>)}
              <div className="sig">{t('storyWhoSig1')}<br />{t('storyWhoSig2')}</div>
              <p style={{ color: '#5B686D', fontSize: 13.5, marginTop: 10 }}>All Go Travel LLC · {t('storyWhoPlace')} · <a href="https://www.allgotravel.app" style={{ textDecoration: 'underline' }}>www.allgotravel.app</a> · <a href="mailto:hola@allgotravel.app" style={{ textDecoration: 'underline' }}>hola@allgotravel.app</a></p>
            </div>
            {/* Beach photo removed; the real photo of Yadira + Luna is the story's image (full, never cropped) */}
            <figure className="luna"><img src="/img/yadira-papa-luna-aeropuerto.webp" width={1200} height={900} loading="lazy" alt={t('storyLunaAlt')} /></figure>
          </div></div>
        </div>
      </section>

      {/* ── TRUST (official sources) ── */}
      <section className="section trustv2">
        <div className="wrap center reveal">
          <h2 style={{ margin: '0 0 8px' }}>{t('trustV2Title')}</h2>
          <p className="lead" style={{ margin: '0 auto 22px' }}>{t('trustV2Sub')}</p>
          <ul className="tchecks">
            <li>{t('trustV2c1')}</li><li>{t('trustV2c2')}</li><li>{t('trustV2c3')}</li><li>{t('trustV2c4')}</li>
          </ul>
          <p className="tsrc">{t('trustV2Src')}</p>
        </div>
      </section>

      {/* ── FAQ (guides) ── */}
      <section className="section" id="faq">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="center reveal"><span className="kicker">{t('faqKicker')}</span><h2 style={{ margin: '14px 0 26px' }}>{t('h3FaqTitle')}</h2></div>
          <div className="faq reveal">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <details key={n} open={n === 1}><summary>{t(`h3FaqQ${n}`)}</summary><p>{t(`h3FaqA${n}`)}</p></details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section finalcta">
        <div className="wrap reveal">
          <h2>{t('h3FinalTitle')}</h2>
          <p className="finaltxt">{t('h3FinalText')}</p>
          <a className="btn btn-white" href="#guias" style={{ marginTop: 8 }}>{t('h3FinalCta')}</a>
          <p className="finalfine">{t('h3FinalFine')}</p>
        </div>
      </section>

      {/* ── PRÓXIMAMENTE: one short line only (out of the main flow) ── */}
      <p className="soonline" id="pronto">{t('h3SoonLine')}</p>

      {/* ── FOOTER ── */}
      <footer>
        <div className="wrap">
          <div className="cols">
            <div>
              <div className="brand" style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><img src="/landing/img9.png" alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} /> AllGo Travel App</div>
              <p style={{ maxWidth: 280 }}>{t('footTagline')}</p>
            </div>
            <div><h4>{t('footExplore')}</h4><a href="#guias">{t('footLinkGuides')}</a><a href="#historia">{t('footLinkStory')}</a><a href="#faq">{t('footLinkFaq')}</a></div>
            <div><h4>{t('footResources')}</h4><a href="https://ig.me/m/allgotravelapp" target="_blank" rel="noopener">{t('footLinkContact')}</a></div>
            <div><h4>{t('footCommunity')}</h4><a href="https://instagram.com/allgotravelapp" target="_blank" rel="noopener">Instagram @allgotravelapp</a></div>
          </div>
          <div className="legal">{t('footLegal')}</div>
        </div>
      </footer>

    </div>
  )
}
