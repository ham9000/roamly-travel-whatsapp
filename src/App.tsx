import { useState, type FormEvent, type ReactNode } from 'react'
import './App.css'

type IconName =
  | 'arrow'
  | 'calendar'
  | 'check'
  | 'clock'
  | 'headset'
  | 'menu'
  | 'plane'
  | 'shield'
  | 'star'
  | 'users'
  | 'whatsapp'

const iconPaths: Record<IconName, ReactNode> = {
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  calendar: (
    <>
      <rect width="18" height="16" x="3" y="5" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  headset: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <path d="M18 19c0 1.1-.9 2-2 2h-3" />
      <rect width="4" height="6" x="3" y="12" rx="2" />
      <rect width="4" height="6" x="17" y="12" rx="2" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plane: <path d="M22 2 9 15M22 2l-7 20-4-9-9-4 20-7Z" />,
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  star: <path d="m12 2 3 6 7 .9-5 4.8 1.2 6.8L12 17.3l-6.2 3.2L7 13.7 2 9l7-.9L12 2Z" />,
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M20.5 11.8a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.4-4.9A8.4 8.4 0 1 1 20.5 11.8Z" />
      <path d="M8.2 7.7c.2-.5.4-.5.8-.5h.4c.2 0 .4 0 .6.5l.8 1.9c.1.3.1.5-.1.7l-.6.8c-.2.2-.3.4-.1.7.8 1.4 1.9 2.5 3.3 3.2.3.2.5.2.7-.1l.9-1.1c.2-.3.5-.3.8-.2l1.9.9c.3.2.5.2.5.4.1.2.1 1-.2 1.9-.3.9-1.7 1.7-2.4 1.8-.6.1-1.5.2-4.5-1.1-3.8-1.7-6.3-5.7-6.5-6-.2-.3-1.5-2-.1-3.8Z" />
    </>
  ),
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {iconPaths[name]}
    </svg>
  )
}

const packages = [
  {
    location: 'Santorini, Greece',
    title: 'Aegean Escape',
    duration: '5 days',
    rating: '4.9',
    reviews: '128',
    price: '1,299',
    image:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=85',
    tag: 'Best seller',
  },
  {
    location: 'Bali, Indonesia',
    title: 'Island Soul',
    duration: '7 days',
    rating: '4.8',
    reviews: '96',
    price: '1,549',
    image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85',
    tag: 'Popular',
  },
  {
    location: 'Marrakech, Morocco',
    title: 'Desert & Medina',
    duration: '6 days',
    rating: '4.9',
    reviews: '84',
    price: '1,149',
    image:
      'https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1200&q=85',
    tag: 'New',
  },
]

const benefits = [
  {
    icon: 'headset' as const,
    title: 'A real expert, one message away',
    text: 'No call queues or chatbots. Your dedicated travel designer stays with you from planning to landing.',
  },
  {
    icon: 'shield' as const,
    title: 'Travel with confidence',
    text: 'Carefully vetted stays, transparent pricing, and around-the-clock support wherever you go.',
  },
  {
    icon: 'star' as const,
    title: 'Made for you',
    text: 'Every itinerary is tailored around your pace, interests, budget, and the memories you want to make.',
  },
]

const steps = [
  {
    number: '01',
    title: 'Tell us your dream',
    text: 'Share your destination, dates, and travel style on WhatsApp.',
  },
  {
    number: '02',
    title: 'Get your custom plan',
    text: 'Your travel expert sends a personalized itinerary and clear quote.',
  },
  {
    number: '03',
    title: 'Book and explore',
    text: 'Confirm securely, pack your bags, and message us anytime you need help.',
  },
]

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, '') ?? ''

function getWhatsAppUrl(message: string) {
  const recipient = whatsappNumber ? `/${whatsappNumber}` : ''
  return `https://wa.me${recipient}?text=${encodeURIComponent(message)}`
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    destination: '',
    dates: '',
    travelers: '2',
  })

  const openWhatsApp = (message: string) => {
    window.open(getWhatsAppUrl(message), '_blank', 'noopener,noreferrer')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = [
      `Hi Roamly! I'm ${form.name}.`,
      `I'd like help planning a trip to ${form.destination}.`,
      `Travel dates: ${form.dates}.`,
      `Number of travelers: ${form.travelers}.`,
      'Could you create a personalized itinerary for me?',
    ].join('\n')
    openWhatsApp(message)
  }

  const askAboutPackage = (packageTitle: string, location: string) => {
    openWhatsApp(
      `Hi Roamly! I'm interested in the ${packageTitle} package in ${location}. Could you share the details?`,
    )
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Roamly home">
          <span className="brand-mark">
            <Icon name="plane" size={18} />
          </span>
          Roamly
        </a>

        <button
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          className="menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <Icon name="menu" size={24} />
        </button>

        <nav className={menuOpen ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
          <a href="#destinations" onClick={() => setMenuOpen(false)}>
            Destinations
          </a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#why-us" onClick={() => setMenuOpen(false)}>
            Why us
          </a>
        </nav>

        <button
          className="button button-whatsapp header-cta"
          onClick={() =>
            openWhatsApp("Hi Roamly! I'd like some help planning my next trip.")
          }
          type="button"
        >
          <Icon name="whatsapp" />
          Plan on WhatsApp
        </button>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              Your personal travel expert
            </div>
            <h1>
              Your next great story <span>starts here.</span>
            </h1>
            <p className="hero-copy">
              Personal trips planned by real travel experts, all through the ease of
              WhatsApp. Less searching. More exploring.
            </p>
            <div className="hero-actions">
              <button
                className="button button-primary"
                onClick={() =>
                  document.getElementById('trip-planner')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }
                type="button"
              >
                Plan my trip
                <Icon name="arrow" />
              </button>
              <div className="traveler-proof">
                <div className="avatar-stack" aria-hidden="true">
                  <span>JT</span>
                  <span>MS</span>
                  <span>AK</span>
                </div>
                <div>
                  <div className="stars">★★★★★</div>
                  <small>Trusted by 2,000+ travelers</small>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <img
              alt="Traveler overlooking a tropical beach"
              src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1400&q=85"
            />
            <div className="floating-card floating-itinerary">
              <span className="floating-icon">
                <Icon name="calendar" size={18} />
              </span>
              <div>
                <strong>Your itinerary is ready!</strong>
                <small>Just now · WhatsApp</small>
              </div>
              <span className="status-dot" />
            </div>
            <div className="floating-card floating-rating">
              <span className="rating-star">★</span>
              <div>
                <strong>4.9 / 5</strong>
                <small>from happy travelers</small>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Booking benefits">
          <div>
            <Icon name="check" />
            Personal travel expert
          </div>
          <div>
            <Icon name="check" />
            Handpicked stays
          </div>
          <div>
            <Icon name="check" />
            24/7 WhatsApp support
          </div>
          <div>
            <Icon name="check" />
            No hidden fees
          </div>
        </section>

        <section className="section packages-section" id="destinations">
          <div className="section-heading split-heading">
            <div>
              <span className="section-kicker">Curated escapes</span>
              <h2>Trips worth talking about</h2>
            </div>
            <p>
              Start with one of our favorite journeys, then make it completely
              yours with your personal travel expert.
            </p>
          </div>

          <div className="package-grid">
            {packages.map((item) => (
              <article className="package-card" key={item.title}>
                <div className="package-image">
                  <img alt={item.location} loading="lazy" src={item.image} />
                  <span className="package-tag">{item.tag}</span>
                </div>
                <div className="package-content">
                  <div className="package-location">{item.location}</div>
                  <h3>{item.title}</h3>
                  <div className="package-meta">
                    <span>
                      <Icon name="clock" size={16} />
                      {item.duration}
                    </span>
                    <span>
                      <span className="inline-star">★</span>
                      {item.rating} ({item.reviews})
                    </span>
                  </div>
                  <div className="package-footer">
                    <div>
                      <small>From</small>
                      <strong>${item.price}</strong>
                      <small> / person</small>
                    </div>
                    <button
                      aria-label={`Ask about ${item.title}`}
                      onClick={() => askAboutPackage(item.title, item.location)}
                      type="button"
                    >
                      <Icon name="arrow" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section why-section" id="why-us">
          <div className="why-image">
            <img
              alt="Friends enjoying a trip together"
              loading="lazy"
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85"
            />
            <div className="happy-card">
              <strong>2,000+</strong>
              <span>happy travelers</span>
            </div>
          </div>
          <div className="why-content">
            <span className="section-kicker">Why Roamly</span>
            <h2>Travel planning should feel exciting, not exhausting.</h2>
            <p className="section-intro">
              We combine human expertise with the convenience of WhatsApp to make
              planning your best trip refreshingly simple.
            </p>
            <div className="benefit-list">
              {benefits.map((benefit) => (
                <div className="benefit" key={benefit.title}>
                  <span className="benefit-icon">
                    <Icon name={benefit.icon} />
                  </span>
                  <div>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section how-section" id="how-it-works">
          <div className="section-heading centered-heading">
            <span className="section-kicker">How it works</span>
            <h2>From idea to itinerary in three easy steps</h2>
            <p>Your dream trip is just a conversation away.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div className="step-card" key={step.number}>
                <span className="step-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                {index < steps.length - 1 && <span className="step-line" />}
              </div>
            ))}
          </div>
        </section>

        <section className="planner-section" id="trip-planner">
          <div className="planner-copy">
            <span className="section-kicker light">Start your journey</span>
            <h2>Where will your next story take you?</h2>
            <p>
              Share a few details and continue the conversation with a travel expert
              on WhatsApp.
            </p>
            <div className="response-note">
              <span>
                <Icon name="whatsapp" size={22} />
              </span>
              <div>
                <strong>Fast, human replies</strong>
                <small>We typically respond in under 10 minutes.</small>
              </div>
            </div>
          </div>

          <form className="planner-form" onSubmit={handleSubmit}>
            <label>
              Your name
              <input
                autoComplete="name"
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="e.g. Jamie"
                required
                value={form.name}
              />
            </label>
            <label>
              Where do you want to go?
              <input
                onChange={(event) =>
                  setForm({ ...form, destination: event.target.value })
                }
                placeholder="e.g. Japan, Italy, somewhere warm..."
                required
                value={form.destination}
              />
            </label>
            <div className="form-row">
              <label>
                Travel dates
                <input
                  onChange={(event) =>
                    setForm({ ...form, dates: event.target.value })
                  }
                  placeholder="e.g. Oct 10–18"
                  required
                  value={form.dates}
                />
              </label>
              <label>
                Travelers
                <select
                  onChange={(event) =>
                    setForm({ ...form, travelers: event.target.value })
                  }
                  value={form.travelers}
                >
                  {[1, 2, 3, 4, 5, 6, '7+'].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button className="button button-whatsapp form-submit" type="submit">
              <Icon name="whatsapp" size={22} />
              Continue on WhatsApp
            </button>
            <small className="privacy-note">
              No spam, ever. Just helpful trip planning from a real person.
            </small>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <div>
          <a className="brand footer-brand" href="#top">
            <span className="brand-mark">
              <Icon name="plane" size={18} />
            </span>
            Roamly
          </a>
          <p>Personal journeys. Effortlessly planned.</p>
        </div>
        <div className="footer-links">
          <a href="#destinations">Destinations</a>
          <a href="#how-it-works">How it works</a>
          <a href="#why-us">Why us</a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} Roamly Travel</p>
      </footer>

      <button
        aria-label="Chat with us on WhatsApp"
        className="floating-whatsapp"
        onClick={() =>
          openWhatsApp("Hi Roamly! I'd like some help planning my next trip.")
        }
        type="button"
      >
        <Icon name="whatsapp" size={28} />
      </button>
    </div>
  )
}

export default App
