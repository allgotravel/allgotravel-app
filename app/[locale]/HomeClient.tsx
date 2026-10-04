'use client'

import { useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import './landing.css'

// External links (landings + Hotmart checkout) — kept as absolute URLs
const URL = {
  kitDog: 'https://allgotravel.app/kit-perro-gratis.html',
  kitAll: 'https://allgotravel.app/kit-turismo-gratis.html',
  turismo: 'https://allgotravel.app/turismo.html',
  perro: 'https://allgotravel.app/perro.html',
  pack: 'https://pay.hotmart.com/A107786229V',
  kit: 'https://go.hotmart.com/L107208384X',
  silla: 'https://go.hotmart.com/Q107291577I',
  clubFounder: 'https://pay.hotmart.com/Q107023060D?off=osgbatei',
  clubMonthly: 'https://pay.hotmart.com/Q107023060D?off=zk0d9b2e',
  clubAnnual: 'https://pay.hotmart.com/Q107023060D?off=2nx7unav',
}

export default function HomeClient() {
  const t = useTranslations('landing')
  const locale = useLocale()
  const other = locale === 'en' ? 'es' : 'en'

  // Same sales-origin tracking as the landings: ?src=xxx -> Hotmart sck=xxx (default: web)
  const packClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    let src: string | null = null
    try { src = new URLSearchParams(window.location.search).get('src') } catch {}
    if (src) src = src.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40)
    try { if (src) sessionStorage.setItem('allgo_src', src); else src = sessionStorage.getItem('allgo_src') } catch {}
    const u = new globalThis.URL(e.currentTarget.href)
    u.searchParams.set('sck', src || 'web')
    e.currentTarget.href = u.toString()
    const w = window as unknown as { fbq?: (...args: unknown[]) => void }
    if (typeof w.fbq === 'function') {
      w.fbq('track', 'InitiateCheckout', { content_name: 'Pack Viajero Completo', content_category: 'ebook', value: 59.0, currency: 'USD' })
      w.fbq('trackCustom', 'ClickToCheckout', { content_name: 'Pack Viajero Completo', value: 59.0, currency: 'USD' })
    }
  }

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
              <a href="#app">{t('navApp')}</a>
              <a href="#guias">{t('navGuides')}</a>
              <a href="#historia">{t('navAbout')}</a>
              <a href="#faq">{t('navFaq')}</a>
            </nav>
            <a href={`/${other}`} className="pill" style={{ cursor: 'pointer', background: '#fff', border: '1.5px solid var(--tealb)', color: 'var(--teal)', fontWeight: 800 }}>{t('toggleLabel')}</a>
            <Link href="/login" className="pill" style={{ fontWeight: 700 }}>{t('navLogin')}</Link>
            <a className="cta" href="#viaje">{t('navPrepare')}</a>
          </div>
        </div>
      </header>

      <a id="top" />

      {/* ── HERO: why AllGo Travel App ── */}
      <section className="hero">
        <div className="wrap grid">
          <div>
            <span className="kicker">AllGo Travel App</span>
            <h1 className="h1long">{t('v2H1')}</h1>
            <p className="sub">{t('v2Sub')}</p>
            <div className="actions">
              <a className="btn btn-primary" href="#viaje">{t('v2Cta')}</a>
            </div>
            <p className="v2line">{t('v2Line')}</p>
          </div>
          <div className="heroimg">
            <img src="/img/home-hero.webp" width={800} height={999} alt={t('heroImgAlt')} />
            <div className="badge-float"><span className="ic">🌻</span> {t('heroBadge')}</div>
          </div>
        </div>
      </section>

      {/* ── SELECTOR: send each person to their solution ── */}
      <section className="section selector" id="viaje">
        <div className="wrap center">
          <h2 style={{ margin: '0 0 22px' }}>{t('selTitle')}</h2>
          <div className="selgrid">
            <a className="selcard" href="/perro.html?src=home"><span className="e">🦮</span><span className="tx">{t('sel1')}</span><span className="go">→</span></a>
            <a className="selcard" href="/turismo.html?src=home"><span className="e">♿</span><span className="tx">{t('sel2')}{locale === 'en' && <small>{t('selEsOnly')}</small>}</span><span className="go">→</span></a>
            <a className="selcard" href="/turismo.html?src=home-sensorial"><span className="e">🌻</span><span className="tx">{t('sel3')}{locale === 'en' && <small>{t('selEsOnly')}</small>}</span><span className="go">→</span></a>
            <a className="selcard" href="/turismo.html?src=home-mayor"><span className="e">👵</span><span className="tx">{t('sel4')}{locale === 'en' && <small>{t('selEsOnly')}</small>}</span><span className="go">→</span></a>
          </div>
          <p className="seltag">{t('selTag')}</p>
        </div>
      </section>

      {/* ── TRUST NUMBERS ── */}
      <section className="trust">
        <div className="wrap row">
          <div><div className="n">{t('trust1n')}</div><div className="l">{t('trust1l')}</div></div>
          <div><div className="n">{t('trust2n')}</div><div className="l">{t('trust2l')}</div></div>
          <div><div className="n">{t('trust3n')}</div><div className="l">{t('trust3l')}</div></div>
          <div><div className="n">{t('trust4n')}</div><div className="l">{t('trust4l')}</div></div>
        </div>
      </section>

      {/* ── ALLI EN ACCIÓN ── */}
      <section className="section app" id="app">
        <div className="wrap split reveal">
          <div>
            <span className="kicker" style={{ background: 'rgba(22,199,182,.15)', color: 'var(--tealb)' }}>{t('alliKicker')}</span>
            <h2 style={{ margin: '14px 0 6px' }}>{t('alliTitle')}</h2>
            <p className="lead">{t('alliLead')}</p>
            <div className="qa-list">
              {[1, 2, 3].map(n => (
                <div className="qa-card" key={n}>
                  <p className="q">{t(`alliQ${n}`)}</p>
                  <p className="a">{t(`alliA${n}`)}</p>
                  <p className="s">{t('alliSrc')}: {['TSA Cares · tsa.gov', '14 CFR 382.103 · ecfr.gov', 'Reglamento (CE) 1107/2006, art. 7 · eur-lex.europa.eu'][n - 1]} · {t('alliRev')}</p>
                </div>
              ))}
            </div>
          </div>
          <div><img className="phone" src="/img/home-app.webp" width={620} height={1346} loading="lazy" alt={t('appImgAlt')} /></div>
        </div>
      </section>

      {/* ── GUIDES ── */}
      <section className="section needs" id="guias">
        <div className="wrap center reveal">
          <span className="kicker">{t('prodKicker')}</span>
          <h2 style={{ margin: '14px 0 8px' }}>{t('prodTitle')}</h2>
          <p className="lead" style={{ margin: '0 auto 40px' }}>{t('prodLead')}</p>
        </div>
        <div className="wrap prod prod2 reveal">
          <div className="prodcard">
            <div className="ph duo"><img className="photo" src="/img/yadira-luna-aeropuerto.webp" width={1000} height={1299} loading="lazy" alt={t('dogPhotoAlt')} /><img className="cover" src="/img/home-perro.webp" width={700} height={700} loading="lazy" alt={t('dogCoverAlt')} /></div>
            <div className="bd"><span className="tag">{t('prodDogTag')}</span><h3>{t('dogGuideName')}</h3>{locale === 'en' && <span className="prodsub">{t('stripDogLang')}</span>}<p>{t('prodDogDesc')}</p><div className="price">$37</div><a className="btn btn-primary" style={{ marginTop: 12, justifyContent: 'center' }} href={URL.perro} target="_blank" rel="noopener">{t('prodCtaGet')}</a></div>
          </div>
          <div className="prodcard">
            <div className="ph"><img src="/img/turismo-portada-es.webp" width={700} height={700} loading="lazy" alt={t('prodTurImgAlt')} /></div>
            <div className="bd"><span className="tag">{t('prodTurTag')}</span><h3>Turismo Sin Fronteras</h3>{locale === 'en' && <span className="prodsub">{t('stripTurLang')}</span>}<p>{t('prodTurDesc')}</p><div className="price">$37</div><a className="btn btn-primary" style={{ marginTop: 12, justifyContent: 'center' }} href={URL.turismo} target="_blank" rel="noopener">{t('prodCtaGet')}</a></div>
          </div>
        </div>
        <div className="wrap reveal" id="pack">
          <h3 className="cual-title">{t('cualTitle')}</h3>
          <div className="cual">
            <div className="c">
              <h4>{t('dogGuideName')}</h4>
              <div className="lng">{t('cualDogLang')}</div>
              <div className="pr">$37</div>
              <a className="lnk" href={URL.perro}>{t('stripCta')}</a>
            </div>
            <div className="c">
              <h4>Turismo Sin Fronteras</h4>
              <div className="lng">{t('cualTurLang')}</div>
              <div className="pr">$37</div>
              <a className="lnk" href={URL.turismo}>{t('stripCta')}</a>
            </div>
            <div className="c pack">
              <span className="badge">{t('cualBadge')}</span>
              <h4>⭐ {t('cualPackName')}</h4>
              <div className="lng">{t('cualPackSub')}</div>
              <div className="pr">$59<s>$74</s></div>
              <a className="btn btn-primary" href={`${URL.pack}?src=pack-home&sck=web`} target="_blank" rel="noopener" onClick={packClick}>{t('cualPackCta')}</a>
              <div className="pnote">{t('cualPackNote')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="section story" id="historia">
        <div className="wrap reveal">
          <div className="storycard"><div className="split">
            <div className="txt">
              <span className="kicker">{t('storyKicker')}</span>
              <h2 style={{ margin: '14px 0 10px' }}>{t('storyTitle')}</h2>
              <p style={{ color: '#33475b', fontSize: 16.5 }}>{t('storyP1')}</p>
              <p style={{ color: '#33475b', fontSize: 16.5 }}>{t('storyP2')}</p>
              <div className="sig">{t('storySig')}</div>
              <figure className="luna"><img src="/img/yadira-luna-mostrador.webp" width={1000} height={1300} loading="lazy" alt={t('storyLunaAlt')} /><figcaption>{t('storyLunaCap')}</figcaption></figure>
            </div>
            <img src="/img/home-historia.webp" width={700} height={874} loading="lazy" alt={t('storyImgAlt')} />
          </div></div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section">
        <div className="wrap center reveal">
          <span className="kicker">{t('testKicker')}</span>
          <h2 style={{ margin: '14px 0 8px' }}>{t('testTitle')}</h2>
          <p className="lead" style={{ margin: '0 auto 40px' }}>{t('testLead')}</p>
        </div>
        <div className="wrap grid2 reveal">
          <div className="tcard"><div className="st">★★★★★</div><p>{t('test1')}</p><div className="who">Sandra <small>{t('test1sub')}</small></div></div>
          <div className="tcard"><div className="st">★★★★★</div><p>{t('test2')}</p><div className="who">@miamiglamcreations <small>{t('test2sub')}</small></div></div>
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

      {/* ── FAQ ── */}
      <section className="section" id="faq">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="center reveal"><span className="kicker">{t('faqKicker')}</span><h2 style={{ margin: '14px 0 26px' }}>{t('faqTitle')}</h2></div>
          <div className="faq reveal">
            <details open><summary>{t('faqQ1')}</summary><p>{t('faqA1')}</p></details>
            <details><summary>{t('faqQ2')}</summary><p>{t('faqA2')}</p></details>
            <details><summary>{t('faqQ4')}</summary><p>{t('faqA4')}</p></details>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section finalcta">
        <div className="wrap reveal">
          <h2>{t('finalTitle')}</h2>
          <a className="btn btn-white" href="#viaje" style={{ marginTop: 22 }}>{t('finalCtaV2')}</a>
          <p style={{ fontSize: 15, marginTop: 18, opacity: 0.85 }}>{t('finalP')}</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="wrap">
          <div className="cols">
            <div>
              <div className="brand" style={{ fontWeight: 800, fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><img src="/landing/img9.png" alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} /> AllGo Travel App</div>
              <p style={{ maxWidth: 280 }}>{t('footTagline')}</p>
            </div>
            <div><h4>{t('footExplore')}</h4><a href="#app">{t('footLinkApp')}</a><a href="#guias">{t('footLinkGuides')}</a><a href="#historia">{t('footLinkStory')}</a></div>
            <div><h4>{t('footResources')}</h4><a href="#faq">{t('footLinkFaq')}</a><a href="https://ig.me/m/allgotravelapp" target="_blank" rel="noopener">{t('footLinkContact')}</a></div>
            <div><h4>{t('footCommunity')}</h4><a href="https://instagram.com/allgotravelapp" target="_blank" rel="noopener">Instagram @allgotravelapp</a></div>
          </div>
          <div className="legal">{t('footLegal')}</div>
        </div>
      </footer>

    </div>
  )
}
