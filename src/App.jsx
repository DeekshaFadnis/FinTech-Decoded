import { useState, useEffect } from "react";

// ─── Brand tokens ───────────────────────────────────────────────
const PAPER = "#FCFCFA";
const INK = "#14171F";
const BLUE = "#2547F4";
const HIGHLIGHT = "#F4E76E";
const GREY = "#5C6270";

const EDITION = "July 2026 edition · hand-picked & simplified";

// ─── Usage stats (artifact shared storage) ──────────────────────
const STATS_KEY = "fd-usage-stats-v1";

const readStats = async () => {
  if (typeof window === "undefined" || !window.storage) return null;
  try {
    const r = await window.storage.get(STATS_KEY, true);
    return r ? JSON.parse(r.value) : null;
  } catch {
    return null;
  }
};

const bumpStat = async (field) => {
  if (typeof window === "undefined" || !window.storage) return;
  try {
    const s = (await readStats()) || { visits: 0, decodes: {}, linkDecodes: 0 };
    if (field === "visits") s.visits = (s.visits || 0) + 1;
    else if (field === "link") s.linkDecodes = (s.linkDecodes || 0) + 1;
    else s.decodes[field] = (s.decodes?.[field] || 0) + 1;
    s.lastActivity = new Date().toISOString().slice(0, 10);
    await window.storage.set(STATS_KEY, JSON.stringify(s), true);
  } catch {
    // stats are best-effort; never break the app for them
  }
};

// ─── Categories ─────────────────────────────────────────────────
const CATEGORIES = {
  payments: {
    emoji: "🏦",
    label: "Payments",
    blurb: "What the big payments players are up to.",
    items: ["Visa", "Mastercard", "Stripe", "Adyen", "Block", "PayPal", "Wise"],
  },
  stablecoins: {
    emoji: "🪙",
    label: "Stablecoins",
    blurb: "Digital dollars and the companies building them.",
    items: ["Circle", "Tether", "Open Standard (OUSD)", "Ripple"],
  },
  regulators: {
    emoji: "🏛",
    label: "Regulators",
    blurb: "New rules and decisions from the referees of finance.",
    items: ["ECB", "Bank of Canada", "U.S. Federal Reserve", "FCA", "FINRA", "CIRO", "ESMA"],
  },
  publications: {
    emoji: "📰",
    label: "Publications",
    blurb: "The biggest stories from trusted fintech outlets.",
    items: ["Finextra", "PYMNTS", "CoinDesk", "The Block", "FinTech Futures"],
  },
  canada: {
    emoji: "🍁",
    label: "Canada",
    blurb: "Money news that hits home for Canadians.",
    items: ["Fintech.ca", "Wealthsimple", "Interac", "KOHO", "Neo Financial", "Payments Canada", "Bank of Canada"],
  },
};

// ─── Static stories (edit freely — same fields per story) ───────
const STATIC_STORIES = {
  payments: [
    {
      headline: "The fees stores pay on your credit card are set to shrink",
      source: "Merchant Cost Consulting",
      url: "https://merchantcostconsulting.com/lower-credit-card-processing-fees/payment-news-today-june-2026/",
      date: "Jun 9",
      what: "A US judge gave preliminary approval to a settlement that would make Visa and Mastercard lower the fees merchants pay to accept credit cards — down by an average of 0.1 percentage points over five years, with standard US credit cards capped at 1.25% per transaction. It still needs final approval before it's a done deal.",
      why: "Stores bake these card fees into the prices everyone pays. Lower fees mean a little breathing room for small businesses — and possibly less pressure on prices.",
      jargonTerm: "Interchange fee",
      jargonMeaning: "The small cut of every card purchase that goes to the bank that issued the card.",
    },
    {
      headline: "Mastercard built a way for AI programs to pay each other",
      source: "Mastercard",
      url: "https://www.mastercard.com/us/en/news-and-trends/press/2026/june/mastercard-launches-agent-pay-for-machines.html",
      date: "Jun 10",
      what: "Mastercard launched Agent Pay for Machines — a payment system designed for AI agents that buy services from each other automatically, including payments worth fractions of a cent. More than 30 companies, including Adyen, Stripe and Coinbase, are the first to support it.",
      why: "The next wave of shopping may be your AI assistant ordering and paying for things on your behalf. The rules for how that money moves safely are being written right now.",
      jargonTerm: "Machine-to-machine payments",
      jargonMeaning: "Payments that happen between software programs with no human clicking 'buy'.",
    },
    {
      headline: "Adyen wants stores to sell to you inside AI chatbots",
      source: "Investing.com",
      url: "https://www.investing.com/news/company-news/adyen-launches-api-suite-for-ai-commerce-integration-93CH-4744986",
      date: "Jun 2026",
      what: "Payments company Adyen launched Adyen Agentic — tools that let retailers sell through conversational AI platforms without rebuilding their checkout for each one. It handles the product catalog, the cart and the payment, and it's starting with large US merchants. Early participants include American Express, Mastercard, Salesforce and Visa.",
      why: "If you've ever asked a chatbot to find you something, this is the plumbing that would let you actually buy it there — and it determines how safe that checkout is.",
      jargonTerm: "API",
      jargonMeaning: "A connector that lets two software systems talk to each other automatically.",
    },
  ],
  stablecoins: [
    {
      headline: "Circle, the company behind the USDC digital dollar, can now act as its own bank",
      source: "CNBC",
      url: "https://www.cnbc.com/2026/07/10/circle-gets-an-occ-bank-charter-as-stablecoin-competition-heats-up-shares-surge-14percent.html",
      date: "Jul 10",
      what: "A US banking regulator approved Circle to operate a national trust bank, called Circle National Trust. That lets Circle directly manage the money backing its USDC stablecoin — over $73 billion in circulation — instead of relying on outside banks to hold it. The charter doesn't let Circle take deposits or make loans like a regular bank.",
      why: "If you ever hold a digital dollar, what matters most is whether the real money behind it is safe. This puts that money under more direct oversight.",
      jargonTerm: "Reserves",
      jargonMeaning: "The real cash and safe assets set aside so every digital dollar is backed one-to-one.",
    },
    {
      headline: "140+ companies — including Visa and Stripe — are launching their own digital dollar",
      source: "Fortune",
      url: "https://fortune.com/2026/06/30/stripe-visa-stablecoin-rival-ousd-tether-circle/",
      date: "Jun 30",
      what: "A new company called Open Standard announced OUSD (Open USD), a stablecoin backed by Stripe, Visa, Mastercard, BlackRock and more than 140 other businesses. It launches later this year and is designed to share most of the interest earned on its backing assets with participants. The two current giants, Tether and Circle, are not part of it — and Circle's stock dropped sharply on the news.",
      why: "The biggest names in payments are betting digital dollars are the future of moving money — and they'd rather own that future than rent it.",
      jargonTerm: "Consortium",
      jargonMeaning: "A group of companies teaming up to build and own one shared project.",
    },
    {
      headline: "Ripple's digital dollar just went live in Japan",
      source: "CryptoSlate",
      url: "https://cryptoslate.com/ripple-got-rlusd-into-japan-now-the-stablecoin-race-begins-as-circle-and-nomura-join/",
      date: "Jun 24",
      what: "Ripple and its partner SBI launched the RLUSD stablecoin in Japan after approval from the country's financial regulator, making it available to both institutions and everyday users. It's classified under Japan's payment rules as a new category for foreign-issued stablecoins — and rivals are moving in fast: Circle and Nomura plan a USDC-based corporate payment service in Japan as early as 2027.",
      why: "Regulated digital dollars are going global, country by country. Japan is one of the world's biggest financial markets — a real test of whether this works at scale.",
      jargonTerm: "Stablecoin",
      jargonMeaning: "A digital coin designed to always be worth exactly one unit of a real currency, like the US dollar.",
    },
  ],
  regulators: [
    {
      headline: "The UK just published the rulebook for crypto companies",
      source: "NCFA Canada (weekly brief)",
      url: "https://ncfacanada.org/ncfa-weekly-fintech-intelligence-jun-27-jul-3-2026/",
      date: "Jun 2026",
      what: "The UK's Financial Conduct Authority set out rules for firms that let people buy, trade, hold and stake crypto — including stablecoin standards, capital requirements and stress testing. Companies can apply for authorisation between September 30, 2026 and February 28, 2027, before the rules become mandatory on October 25, 2027.",
      why: "If you use a crypto app in the UK, the platform will soon be held to standards much closer to a bank's — with real consequences if it falls short.",
      jargonTerm: "Authorisation",
      jargonMeaning: "The official licence a company must earn before it's allowed to offer financial services.",
    },
    {
      headline: "Canada now has a law for digital dollars — and the Bank of Canada is in charge",
      source: "Bennett Jones",
      url: "https://www.bennettjones.com/Insights/Blogs/Fintech-in-Canada-Q1-2026",
      date: "Mar 26",
      what: "Canada's stablecoin framework became law on March 26, 2026. Issuers of fiat-backed stablecoins will have to register with the Bank of Canada, keep one-to-one reserves in high-quality safe assets, and let holders redeem at full value — with no interest paid on holdings. Detailed regulations are still being written, with full force expected around 2027.",
      why: "When digital dollars arrive in your Canadian banking app, the company behind them will answer directly to the central bank — the same referee that watches over your money today.",
      jargonTerm: "Royal assent",
      jargonMeaning: "The final approval that officially turns a bill into law in Canada.",
    },
  ],
  publications: [
    {
      headline: "Klarna wants to become a real American bank",
      source: "FinTech Futures",
      url: "https://www.fintechfutures.com/bnpl-payments/klarna-applies-for-us-banking-licence",
      date: "Jul 6",
      what: "Klarna, the buy-now-pay-later giant used by about 30 million Americans, applied to US regulators to create Klarna Bank USA — its own bank chartered in Utah with FDIC insurance. Today it runs its US services through a partner bank; owning a licence would bring all of that in-house. It follows similar moves by PayPal and others.",
      why: "The app you split payments with becoming a licensed bank means more oversight, insured deposits — and a sign that fintechs are growing up into the system they once disrupted.",
      jargonTerm: "Industrial bank",
      jargonMeaning: "A special type of state-chartered bank that a company can own and run itself.",
    },
    {
      headline: "Digital dollars just had their biggest month ever",
      source: "CoinDesk",
      url: "https://www.coindesk.com/business/2026/07/06/circle-s-usdc-is-leaving-tether-behind-in-the-stablecoin-volume-race",
      date: "Jul 6",
      what: "Stablecoin transactions hit a record $1.79 trillion in June — up 63% from May and 125% from a year earlier, according to Visa's onchain data. Circle's USDC handled about 70% of that activity in the first half of 2026, well ahead of Tether's roughly 25%, as banks like Standard Chartered and BNY build services around it.",
      why: "Digital dollars are quietly moving from crypto trading into everyday payments and settlement — and the regulated option is the one winning.",
      jargonTerm: "Adjusted transaction volume",
      jargonMeaning: "A count of real payments only, after filtering out bots and internal shuffling.",
    },
    {
      headline: "Circle's stock tumbled after the giants ganged up",
      source: "CoinDesk",
      url: "https://www.coindesk.com/business/2026/06/30/circle-slides-8-as-stripe-coinbase-and-blackrock-back-rival-stablecoin-network",
      date: "Jun 30",
      what: "Circle's shares fell more than 17% to a four-month low after the Open USD consortium was unveiled. The new stablecoin's key twist: partners get to keep the earnings on the money backing the coin — striking directly at how today's stablecoin issuers make their profit.",
      why: "A reminder that in fintech, your biggest customers can become your biggest competitors overnight — and stock prices react in hours.",
      jargonTerm: "Reserve earnings",
      jargonMeaning: "The interest an issuer makes on the pile of money backing its coin.",
    },
  ],
  canada: [
    {
      headline: "More Canadians are paying for groceries in installments",
      source: "Fintech.ca",
      url: "https://www.fintech.ca/2026/07/07/canadians-turn-to-pay-later-as-grocery-costs-keep-climbing/",
      date: "Jul 7",
      what: "KOHO's Grocery Gap Report, based on data from over 173,000 members, found average grocery spending rose about 5% in a year — from $261 to $275 a month — while use of KOHO's Pay Later option more than doubled, up 109%. Trips to discount grocers rose 4.1% as shoppers hunt for savings.",
      why: "When people start splitting grocery bills into installments, it's a signal of real affordability stress. Pay-later on essentials can help in a pinch — but late fees can make a tight month tighter.",
      jargonTerm: "BNPL (buy now, pay later)",
      jargonMeaning: "Splitting a purchase into smaller payments over weeks — usually free unless you pay late.",
    },
    {
      headline: "Canada's instant-payment system finally has a green light",
      source: "Fathom4sight (via BetaKit)",
      url: "https://www.fathom4sight.ai/newsletters/fathom4sight-newsletter-week-of-july-6-2026",
      date: "Jul 2026",
      what: "The Finance Minister approved the legal framework for the Real-Time Rail, Canada's long-delayed instant payments system, clearing the way for a launch in the fourth quarter of 2026. Payments Canada has been building it since 2015 — it was originally promised for 2019. Once live, money will move instantly, any time, any day, instead of taking days to settle.",
      why: "Think e-transfers, bill payments and paycheques that land in seconds — even at 2 a.m. on a holiday. It's the plumbing upgrade Canadian payments have waited a decade for.",
      jargonTerm: "Payment rails",
      jargonMeaning: "The behind-the-scenes plumbing that moves money between banks.",
    },
    {
      headline: "Fintech apps just got their own keys to Canada's payment system",
      source: "Bennett Jones",
      url: "https://www.bennettjones.com/Insights/Blogs/Fintech-in-Canada-Q1-2026",
      date: "",
      what: "After a 2025 law change, Payments Canada admitted its first non-bank direct members: Wise, Float, KOHO, Paramount Commerce and Brim Financial. Direct membership gives these fintechs access to national payment infrastructure — including the upcoming Real-Time Rail — without going through a big bank.",
      why: "Your favourite money app relying less on the big banks can mean lower costs and faster features reaching you sooner.",
      jargonTerm: "Clearing and settlement",
      jargonMeaning: "The process of actually moving money between institutions after you hit 'pay'.",
    },
  ],
};

export default function FintechDecoded() {
  const [active, setActive] = useState("payments"); // category key | "link"
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  // Count each visit once per page load
  useEffect(() => {
    bumpStat("visits");
  }, []);

  const switchTab = (key) => {
    setActive(key);
    setCopiedIdx(null);
    if (key !== "link") bumpStat(key);
    else bumpStat("link");
  };

  const openStats = async () => {
    setShowStats(true);
    setStats(await readStats());
  };

  const copyStory = async (st, i) => {
    const text = [
      st.headline,
      "",
      st.what,
      "",
      `Why it matters: ${st.why}`,
      st.jargonTerm ? `\n${st.jargonTerm} — ${st.jargonMeaning}` : "",
      st.url ? `\nSource: ${st.url}` : "",
      "",
      "(via Fintech, decoded. — curated by Deeksha Fadnis)",
    ]
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 1600);
  };

  const cat = active !== "link" ? CATEGORIES[active] : null;
  const stories = active !== "link" ? STATIC_STORIES[active] || [] : [];

  return (
    <div style={{ minHeight: "100vh", background: PAPER, color: INK, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;600;700;800&display=swap');
        .fd-card { transition: transform .18s ease, box-shadow .18s ease; }
        .fd-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(20,23,31,0.09); }
        .fd-nav::-webkit-scrollbar { display: none; }
        .fd-chip:focus-visible, input:focus-visible, .fd-tab:focus-visible, button:focus-visible { outline: 3px solid ${BLUE}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) {
          .fd-card { transition: none; }
        }
      `}</style>

      {/* ── Top menu ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "1.5px solid #E4E6EB" }}>
        <div className="fd-nav" style={{
          maxWidth: 860, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center",
          gap: 4, overflowX: "auto", scrollbarWidth: "none",
        }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", padding: "14px 12px 14px 0", whiteSpace: "nowrap", color: INK }}>
            Fintech, <span style={{ background: `linear-gradient(180deg, transparent 55%, ${HIGHLIGHT} 55%)`, padding: "0 2px" }}>decoded</span>.
          </div>
          <div style={{ flex: 1 }} />
          {Object.entries(CATEGORIES).map(([key, c]) => (
            <button
              key={key}
              className="fd-tab"
              onClick={() => switchTab(key)}
              style={{
                fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
                padding: "14px 12px", border: "none", background: "transparent", whiteSpace: "nowrap",
                color: active === key ? INK : GREY,
                boxShadow: active === key ? `inset 0 -3px 0 ${BLUE}` : "none",
              }}
            >
              <span aria-hidden="true">{c.emoji}</span> {c.label}
            </button>
          ))}
          <button
            className="fd-tab"
            onClick={() => switchTab("link")}
            style={{
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
              padding: "14px 12px", border: "none", background: "transparent", whiteSpace: "nowrap",
              color: active === "link" ? INK : GREY,
              boxShadow: active === "link" ? `inset 0 -3px 0 ${BLUE}` : "none",
            }}
          >
            <span aria-hidden="true">🔍</span> Decode a link
          </button>
        </div>
      </nav>

      {/* ── Masthead ── */}
      <header style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 6px", textAlign: "center" }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: BLUE, marginBottom: 12 }}>
          The plain-English news brief
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(38px, 8vw, 60px)", lineHeight: 1.02, margin: 0, letterSpacing: "-0.03em", color: INK }}>
          Fintech,{" "}
          <span style={{ background: `linear-gradient(180deg, transparent 55%, ${HIGHLIGHT} 55%)`, padding: "0 4px" }}>
            decoded
          </span>
          .
        </h1>
        <p style={{ fontSize: 17, fontWeight: 600, maxWidth: 480, margin: "16px auto 0", lineHeight: 1.45, color: INK }}>
          Money and tech news, rewritten so anyone can understand it — without losing what matters.
        </p>
        <p style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: "0.04em", color: GREY, margin: "12px auto 0" }}>
          Curated by Deeksha Fadnis
        </p>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "26px 20px 80px" }}>
        {cat && (
          <section>
            <div style={{ textAlign: "center", marginBottom: 10 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24, margin: "0 0 4px", color: INK }}>
                <span aria-hidden="true">{cat.emoji}</span> {cat.label}
              </h2>
              <p style={{ fontSize: 14.5, fontWeight: 600, color: GREY, margin: "0 0 14px" }}>{cat.blurb}</p>

              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: GREY, marginBottom: 10 }}>
                Covering
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {cat.items.map((s) => (
                  <span key={s} className="fd-chip" style={{
                    fontSize: 13, fontWeight: 600, background: "#fff", color: INK,
                    border: "1.5px solid #D7DAE0", borderRadius: 8, padding: "6px 11px",
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Story cards ── */}
            <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 26 }}>
              <p style={{ textAlign: "center", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: GREY, margin: 0 }}>
                {EDITION}
              </p>
              {stories.map((st, i) => (
                <article key={i} className="fd-card" style={{
                  background: "#fff", border: "1.5px solid #E4E6EB", borderRadius: 16,
                  padding: "26px 26px 24px", boxShadow: "0 4px 14px rgba(20,23,31,0.05)",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: BLUE, marginBottom: 9 }}>
                    {st.source}{st.date ? ` · ${st.date}` : ""}
                  </div>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(20px, 3.8vw, 25px)", lineHeight: 1.2, margin: "0 0 13px", letterSpacing: "-0.01em", color: INK }}>
                    {st.headline}
                  </h3>

                  <div style={{ fontSize: 15.5, lineHeight: 1.6, color: INK }}>{st.what}</div>

                  <div style={{ marginTop: 16, paddingLeft: 14, borderLeft: `3px solid ${BLUE}` }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: BLUE }}>
                      Why it matters to you
                    </div>
                    <div style={{ fontSize: 15, lineHeight: 1.55, marginTop: 5, fontWeight: 600, color: INK }}>{st.why}</div>
                  </div>

                  {st.jargonTerm && (
                    <div style={{ marginTop: 18, fontSize: 14.5, lineHeight: 1.55, color: INK }}>
                      <span style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: GREY, display: "block", marginBottom: 4 }}>
                        Jargon, decoded
                      </span>
                      <span style={{ background: HIGHLIGHT, fontWeight: 700, padding: "1px 5px", color: INK }}>{st.jargonTerm}</span>
                      {" "}— {st.jargonMeaning}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, flexWrap: "wrap", gap: 8 }}>
                    {st.url ? (
                      <a href={st.url} target="_blank" rel="noreferrer" style={{ fontSize: 13.5, fontWeight: 700, color: BLUE, textDecoration: "none" }}>
                        Read the original ↗
                      </a>
                    ) : (
                      <span />
                    )}
                    <button onClick={() => copyStory(st, i)} style={{
                      border: "1.5px solid #D7DAE0", borderRadius: 8, background: copiedIdx === i ? HIGHLIGHT : "#fff",
                      fontWeight: 700, fontSize: 12.5, padding: "6px 12px", cursor: "pointer", color: INK, fontFamily: "inherit",
                    }}>
                      {copiedIdx === i ? "Copied ✓" : "📋 Copy this story"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {active === "link" && (
          <section style={{ textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24, margin: "0 0 4px", color: INK }}>
              <span aria-hidden="true">🔍</span> Decode a link
            </h2>
            <p style={{ fontSize: 14.5, fontWeight: 600, color: GREY, margin: "0 0 20px" }}>
              Paste any confusing fintech article, get it in plain English.
            </p>
            <div style={{
              maxWidth: 440, margin: "0 auto", background: "#fff", border: "1.5px solid #E4E6EB",
              borderRadius: 16, padding: "26px 24px",
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }} aria-hidden="true">🚧</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 6, color: INK }}>
                Coming soon
              </div>
              <p style={{ fontSize: 14.5, color: GREY, lineHeight: 1.55, margin: 0 }}>
                This feature is on the way. Want it sooner? Tell me on LinkedIn — the more people ask, the faster it ships.
              </p>
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1.5px solid #E4E6EB", background: "#fff" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "22px 20px", textAlign: "center", fontSize: 13.5, color: GREY, lineHeight: 1.6 }}>
          <span style={{ color: INK, fontWeight: 700 }}>Curated by Deeksha Fadnis</span>
          <br />
          Summaries are simplified for understanding and aren't financial advice.
          Always check the original source before making decisions.
          <br />
          <button onClick={openStats} style={{ border: "none", background: "none", cursor: "pointer", color: GREY, fontSize: 12, fontWeight: 600, marginTop: 8, textDecoration: "underline", fontFamily: "inherit" }}>
            📊 Usage stats
          </button>
        </div>
      </footer>

      {/* ── Stats panel ── */}
      {showStats && (
        <div
          onClick={() => setShowStats(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(20,23,31,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Usage stats"
            style={{ background: "#fff", borderRadius: 16, padding: "26px 28px", width: "min(400px, 100%)", boxShadow: "0 20px 50px rgba(20,23,31,0.25)" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, margin: 0, color: INK }}>
                📊 Usage stats
              </h2>
              <button onClick={() => setShowStats(false)} aria-label="Close"
                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, fontWeight: 700, color: GREY }}>
                ✕
              </button>
            </div>

            {stats ? (
              <div style={{ fontSize: 14.5, lineHeight: 1.9, color: INK }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #EEE", paddingBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>Total visits</span>
                  <strong style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18 }}>{stats.visits || 0}</strong>
                </div>
                {Object.entries(CATEGORIES).map(([key, c]) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{c.emoji} {c.label} views</span>
                    <strong>{stats.decodes?.[key] || 0}</strong>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>🔍 Decode-a-link interest</span>
                  <strong>{stats.linkDecodes || 0}</strong>
                </div>
                {stats.lastActivity && (
                  <div style={{ fontSize: 12.5, color: GREY, marginTop: 10 }}>
                    Last activity: {stats.lastActivity}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: 14, color: GREY, margin: 0 }}>
                No stats yet — counts start once the published site gets its first visit. (Stats only work on the live published version.)
              </p>
            )}

            <p style={{ fontSize: 12, color: GREY, marginTop: 14, lineHeight: 1.5 }}>
              Counts are approximate (page loads, not unique people) and shared across all visitors of this site.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
