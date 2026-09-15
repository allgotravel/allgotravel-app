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
  kit: 'https://go.hotmart.com/L107208384X',
  silla: 'https://go.hotmart.com/Q107291577I',
  clubFounder: 'https://pay.hotmart.com/Q107023060D?off=osgbatei',
  clubMonthly: 'https://pay.hotmart.com/Q107023060D?off=zk0d9b2e',
  clubAnnual: 'https://pay.hotmart.com/Q107023060D?off=2nx7unav',
}

export default function HomePage() {
  const t = useTranslations('landing')
  const locale = useLocale()
  const other = locale === 'en' ? 'es' : 'en'
  const bold = { b: (chunks: React.ReactNode) => <b>{chunks}</b> }

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

    return () => { anchors.forEach(a => a.removeEventListener('click', handler)); io.disconnect() }
  }, [])

  return (
    <div className="lp">

      {/* ── NAV ── */}
      <header className="nav">
        <div className="wrap row">
          <a className="brand" href="#top"><img className="brandlogo" src="/landing/img1.png" alt="AllGo Travel App" /> AllGo Travel App</a>
          <div className="menuwrap">
            <nav className="navlinks">
              <a href="#app">{t('navApp')}</a>
              <a href="#guias">{t('navGuides')}</a>
              <a href="#club">{t('navClub')}</a>
              <a href="#historia">{t('navAbout')}</a>
              <a href="#faq">{t('navFaq')}</a>
            </nav>
            <a href={`/${other}`} className="pill" style={{ cursor: 'pointer', background: '#fff', border: '1.5px solid var(--tealb)', color: 'var(--teal)', fontWeight: 800 }}>{t('toggleLabel')}</a>
            <Link href="/login" className="pill" style={{ fontWeight: 700 }}>{t('navLogin')}</Link>
            <a className="cta" href="#gratis">{t('navStartFree')}</a>
          </div>
        </div>
      </header>

      <a id="top" />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="wrap grid">
          <div>
            <span className="kicker">{t('heroKicker')}</span>
            <h1>{t('heroTitleA')} <span className="hl">{t('heroTitleHl')}</span></h1>
            <p className="sub">{t('heroSub')}</p>
            <div className="actions">
              <a className="btn btn-primary" href="#gratis">{t('heroCtaPrimary')}</a>
              <a className="btn btn-ghost" href="#app">{t('heroCtaGhost')}</a>
            </div>
            <div className="rating"><span className="stars">★★★★★</span> <span>{t('heroRating')}</span></div>
          </div>
          <div className="heroimg">
            <img src="/landing/img2.jpg" alt={t('heroImgAlt')} />
            <div className="badge-float"><span className="ic">🌻</span> {t('heroBadge')}</div>
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="trust">
        <div className="wrap row">
          <div><div className="n">{t('trust1n')}</div><div className="l">{t('trust1l')}</div></div>
          <div><div className="n">{t('trust2n')}</div><div className="l">{t('trust2l')}</div></div>
          <div><div className="n">{t('trust3n')}</div><div className="l">{t('trust3l')}</div></div>
          <div><div className="n">{t('trust4n')}</div><div className="l">{t('trust4l')}</div></div>
        </div>
      </section>

      {/* ── FREE KITS ── */}
      <section className="section" id="gratis">
        <div className="wrap center reveal">
          <span className="kicker">{t('gratisKicker')}</span>
          <h2 style={{ margin: '14px 0 8px' }}>{t('gratisTitle')}</h2>
          <p className="lead" style={{ margin: '0 auto 40px' }}>{t('gratisLead')}</p>
        </div>
        <div className="wrap grid2 reveal">
          <div className="card"><div className="ic">🦮</div><h3>{t('kitDogTitle')}</h3><p>{t('kitDogDesc')}</p><a className="btn btn-primary" style={{ marginTop: 14, justifyContent: 'center' }} href={URL.kitDog} target="_blank" rel="noopener">{t('kitCta')}</a></div>
          <div className="card"><div className="ic">🌍</div><h3>{t('kitAllTitle')}</h3><p>{t('kitAllDesc')}</p><a className="btn btn-primary" style={{ marginTop: 14, justifyContent: 'center' }} href={URL.kitAll} target="_blank" rel="noopener">{t('kitCta')}</a></div>
        </div>
      </section>

      {/* ── PROBLEM / SOLUTION ── */}
      <section className="section">
        <div className="wrap split reveal">
          <div>
            <span className="kicker">{t('probKicker')}</span>
            <h2 style={{ marginTop: 14 }}>{t('probTitle')}</h2>
            <p className="lead">{t('probLead')}</p>
          </div>
          <div>
            <ul className="checklist">
              <li><span className="tk">✓</span> <span>{t.rich('probLi1', bold)}</span></li>
              <li><span className="tk">✓</span> <span>{t.rich('probLi2', bold)}</span></li>
              <li><span className="tk">✓</span> <span>{t.rich('probLi3', bold)}</span></li>
              <li><span className="tk">✓</span> <span>{t.rich('probLi4', bold)}</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── APP + ALLI ── */}
      <section className="section app" id="app">
        <div className="wrap split reveal">
          <div>
            <span className="kicker" style={{ background: 'rgba(22,199,182,.15)', color: 'var(--tealb)' }}>{t('appKicker')}</span>
            <h2 style={{ margin: '14px 0 6px' }}>{t('appTitle')}</h2>
            <p className="lead">{t('appLead')}</p>
            <ul className="feat">
              <li><span className="tk">✓</span> <span>{t('appFeat1')}</span></li>
              <li><span className="tk">✓</span> <span>{t('appFeat2')}</span></li>
              <li><span className="tk">✓</span> <span>{t('appFeat3')}</span></li>
              <li><span className="tk">✓</span> <span>{t('appFeat4')}</span></li>
            </ul>
            <div className="pillrow">
              <span className="chip">{t('chip1')}</span><span className="chip">{t('chip2')}</span><span className="chip">{t('chip3')}</span><span className="chip">{t('chip4')}</span><span className="chip">{t('chip5')}</span>
            </div>
          </div>
          <div><img className="phone" src="/landing/img3.jpg" alt={t('appImgAlt')} /></div>
        </div>
      </section>

      {/* ── ECOSYSTEM ── */}
      <section className="section">
        <div className="wrap center reveal">
          <span className="kicker">{t('ecoKicker')}</span>
          <h2 style={{ margin: '14px 0 8px' }}>{t('ecoTitle')}</h2>
          <p className="lead" style={{ margin: '0 auto 40px' }}>{t('ecoLead')}</p>
        </div>
        <div className="wrap grid4 reveal">
          <div className="card"><div className="ic">📱</div><h3>{t('eco1t')}</h3><p>{t('eco1d')}</p></div>
          <div className="card"><div className="ic">📘</div><h3>{t('eco2t')}</h3><p>{t('eco2d')}</p></div>
          <div className="card"><div className="ic">🎁</div><h3>{t('eco3t')}</h3><p>{t('eco3d')}</p></div>
          <div className="card"><div className="ic">💛</div><h3>{t('eco4t')}</h3><p>{t('eco4d')}</p></div>
        </div>
      </section>

      {/* ── PRODUCTS / GUÍAS ── */}
      <section className="section needs" id="guias">
        <div className="wrap center reveal">
          <span className="kicker">{t('prodKicker')}</span>
          <h2 style={{ margin: '14px 0 8px' }}>{t('prodTitle')}</h2>
          <p className="lead" style={{ margin: '0 auto 40px' }}>{t('prodLead')}</p>
        </div>
        <div className="wrap prod reveal">
          <div className="prodcard">
            <div className="ph"><img src="/landing/img4.jpg" alt="Turismo Sin Fronteras — ES / EN" /></div>
            <div className="bd"><span className="tag">{t('prodTurTag')}</span><h3>Turismo Sin Fronteras</h3><p>{t('prodTurDesc')}</p><div className="price">$37</div><a className="btn btn-primary" style={{ marginTop: 12, justifyContent: 'center' }} href={URL.turismo} target="_blank" rel="noopener">{t('prodCtaGet')}</a></div>
          </div>
          <div className="prodcard">
            <div className="ph"><img src="/landing/img5.jpg" alt="Viaja con tu Perro de Servicio — ES / EN" /></div>
            <div className="bd"><span className="tag">{t('prodDogTag')}</span><h3>Viaja con tu Perro de Servicio</h3><p>{t('prodDogDesc')}</p><div className="price">$37</div><a className="btn btn-primary" style={{ marginTop: 12, justifyContent: 'center' }} href={URL.perro} target="_blank" rel="noopener">{t('prodCtaGet')}</a></div>
          </div>
          <div className="prodcard">
            <div className="ph"><img src="/landing/img6.jpg" alt="Kit del Viajero" /></div>
            <div className="bd"><span className="tag">{t('prodKitTag')}</span><h3>Kit del Viajero</h3><p>{t('prodKitDesc')}</p><div className="price">$9</div><a className="btn btn-ghost" style={{ marginTop: 12, justifyContent: 'center' }} href={URL.kit} target="_blank" rel="noopener">{t('prodCtaSee')}</a></div>
          </div>
          <div className="prodcard">
            <div className="ph"><img src="/landing/img7.jpg" alt="Vuela con tu Silla Eléctrica" /></div>
            <div className="bd"><span className="tag">{t('prodChairTag')}</span><h3>Vuela con tu Silla Eléctrica</h3><p>{t('prodChairDesc')}</p><div className="price">$17</div><a className="btn btn-ghost" style={{ marginTop: 12, justifyContent: 'center' }} href={URL.silla} target="_blank" rel="noopener">{t('prodCtaGet')}</a></div>
          </div>
        </div>
      </section>

      {/* ── NEEDS ── */}
      <section className="section">
        <div className="wrap center reveal">
          <span className="kicker">{t('needsKicker')}</span>
          <h2 style={{ margin: '14px 0 8px' }}>{t('needsTitle')}</h2>
          <p className="lead" style={{ margin: '0 auto 40px' }}>{t('needsLead')}</p>
        </div>
        <div className="wrap grid3 reveal">
          <div className="need"><div className="e">♿</div><h3>{t('need1t')}</h3><p>{t('need1d')}</p></div>
          <div className="need"><div className="e">🌻</div><h3>{t('need2t')}</h3><p>{t('need2d')}</p></div>
          <div className="need"><div className="e">👁️</div><h3>{t('need3t')}</h3><p>{t('need3d')}</p></div>
          <div className="need"><div className="e">👵</div><h3>{t('need4t')}</h3><p>{t('need4d')}</p></div>
          <div className="need"><div className="e">🩺</div><h3>{t('need5t')}</h3><p>{t('need5d')}</p></div>
          <div className="need"><div className="e">🦮</div><h3>{t('need6t')}</h3><p>{t('need6d')}</p></div>
        </div>
      </section>

      {/* ── CLUB / PRICING ── */}
      <section className="section needs" id="club">
        <div className="wrap center reveal">
          <span className="kicker">{t('clubKicker')}</span>
          <h2 style={{ margin: '14px 0 8px' }}>{t('clubTitle')}</h2>
          <p className="lead" style={{ margin: '0 auto 40px' }}>{t('clubLead')}</p>
        </div>
        <div className="wrap plans reveal">
          <div className="plan featured">
            <span className="ptag">{t('planFoundTag')}</span>
            <h3>{t('planFoundName')}</h3>
            <div className="pr"><span className="was">$29</span>$14.99<small>{t('perMonth')}</small></div>
            <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>{t('planFoundMuted')}</p>
            <ul>
              <li><span className="tk">✓</span> <span>{t('planFoundLi1')}</span></li>
              <li><span className="tk">✓</span> <span>{t('planFoundLi2')}</span></li>
              <li><span className="tk">✓</span> <span>{t('planFoundLi3')}</span></li>
            </ul>
            <a className="btn btn-primary" style={{ justifyContent: 'center' }} href={URL.clubFounder} target="_blank" rel="noopener">{t('planFoundCta')}</a>
          </div>
          <div className="plan">
            <h3>{t('planMonthName')}</h3>
            <div className="pr">$29<small>{t('perMonth')}</small></div>
            <p className="muted" style={{ margin: '2px 0 0', fontSize: 13 }}>{t('planMonthMuted')}</p>
            <ul>
              <li><span className="tk">✓</span> <span>{t('planMonthLi1')}</span></li>
              <li><span className="tk">✓</span> <span>{t('planMonthLi2')}</span></li>
              <li><span className="tk">✓</span> <span>{t('planMonthLi3')}</span></li>
            </ul>
            <a className="btn btn-ghost" style={{ justifyContent: 'center' }} href={URL.clubMonthly} target="_blank" rel="noopener">{t('planMonthCta')}</a>
          </div>
          <div className="plan">
            <h3>{t('planYearName')}</h3>
            <div className="pr">$290<small>{t('perYear')}</small></div>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--orange)', fontWeight: 700 }}>{t('planYearSave')}</p>
            <ul>
              <li><span className="tk">✓</span> <span>{t('planYearLi1')}</span></li>
              <li><span className="tk">✓</span> <span>{t('planYearLi2')}</span></li>
              <li><span className="tk">✓</span> <span>{t('planYearLi3')}</span></li>
            </ul>
            <a className="btn btn-ghost" style={{ justifyContent: 'center' }} href={URL.clubAnnual} target="_blank" rel="noopener">{t('planYearCta')}</a>
          </div>
        </div>
        <p className="center muted" style={{ marginTop: 22, fontSize: 13.5 }}>{t('clubSecure')}</p>
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
            </div>
            <img src="/landing/img8.jpg" alt={t('storyImgAlt')} />
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

      {/* ── DIFF ── */}
      <section className="section diff">
        <div className="wrap center reveal">
          <span className="kicker" style={{ background: 'rgba(22,199,182,.15)', color: 'var(--tealb)' }}>{t('diffKicker')}</span>
          <h2 style={{ margin: '14px 0 8px' }}>{t('diffTitle')}</h2>
          <p className="lead" style={{ margin: '0 auto 40px' }}>{t('diffLead')}</p>
        </div>
        <div className="wrap grid4 reveal">
          <div className="card"><div className="ic">✅</div><h3>{t('diff1t')}</h3><p>{t('diff1d')}</p></div>
          <div className="card"><div className="ic">💬</div><h3>{t('diff2t')}</h3><p>{t('diff2d')}</p></div>
          <div className="card"><div className="ic">🧰</div><h3>{t('diff3t')}</h3><p>{t('diff3d')}</p></div>
          <div className="card"><div className="ic">💛</div><h3>{t('diff4t')}</h3><p>{t('diff4d')}</p></div>
        </div>
        <div className="wrap"><div className="note center">{t('diffNote')}</div></div>
      </section>

      {/* ── FAQ ── */}
      <section className="section" id="faq">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="center reveal"><span className="kicker">{t('faqKicker')}</span><h2 style={{ margin: '14px 0 26px' }}>{t('faqTitle')}</h2></div>
          <div className="faq reveal">
            <details open><summary>{t('faqQ1')}</summary><p>{t('faqA1')}</p></details>
            <details><summary>{t('faqQ2')}</summary><p>{t('faqA2')}</p></details>
            <details><summary>{t('faqQ3')}</summary><p>{t('faqA3')}</p></details>
            <details><summary>{t('faqQ4')}</summary><p>{t('faqA4')}</p></details>
            <details><summary>{t('faqQ5')}</summary><p>{t('faqA5')}</p></details>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section finalcta">
        <div className="wrap reveal">
          <h2>{t('finalTitle')}</h2>
          <p>{t('finalP')}</p>
          <a className="btn btn-white" href="#gratis">{t('finalCta')}</a>
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
            <div><h4>{t('footExplore')}</h4><a href="#app">{t('footLinkApp')}</a><a href="#guias">{t('footLinkGuides')}</a><a href="#club">{t('footLinkClub')}</a><a href="#historia">{t('footLinkStory')}</a></div>
            <div><h4>{t('footResources')}</h4><a href="#faq">{t('footLinkFaq')}</a><a href="#gratis">{t('footLinkKit')}</a><a href="#">{t('footLinkBlog')}</a><a href="#">{t('footLinkContact')}</a></div>
            <div><h4>{t('footCommunity')}</h4><a href="https://instagram.com/allgotravelapp" target="_blank" rel="noopener">Instagram @allgotravelapp</a><a href="#">Facebook</a><a href="#">YouTube</a></div>
          </div>
          <div className="legal">{t('footLegal')}</div>
        </div>
      </footer>

    </div>
  )
}
