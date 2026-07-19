import { useState, useEffect } from "react";

// ─── Brand tokens ───────────────────────────────────────────────
const PAPER = "#FCFCFA";
const INK = "#14171F";
const BLUE = "#2547F4";
const HIGHLIGHT = "#F4E76E";
const GREY = "#5C6270";

const EDITION = "Mid-July 2026 edition · hand-picked & simplified";

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
      headline: "Stripe just offered $53 billion to buy PayPal — and PayPal isn't sure",
      source: "Finextra",
      url: "https://www.finextra.com/newsarticle/48116/paypal-board-considers-53bn-stripe-advent-offer-inadequate---reuters",
      date: "Jul 17",
      what: "Stripe and private equity firm Advent International bid $60.50 per share for PayPal — valuing it at more than $53 billion, a 28% premium to its share price, backed by about $50 billion in committed bank financing. The plan: own PayPal equally and keep it intact. But PayPal's board reportedly believes the offer undervalues the company and worries about regulatory pushback, and hasn't formally responded.",
      why: "Two of the biggest names in online payments could become one company — touching millions of checkouts, Venmo accounts and online purchases. Whatever happens next, this is the biggest story in payments right now.",
      jargonTerm: "Takeover premium",
      jargonMeaning: "The extra amount above the current share price a buyer offers to convince shareholders to sell.",
    },
    {
      headline: "Visa built an AI money assistant for your banking app",
      source: "PYMNTS",
      url: "https://www.pymnts.com/news/artificial-intelligence/2026/visa-readies-rollout-ai-financial-assistant-banking-apps/",
      date: "Jul 14",
      what: "Visa launched an AI Financial Assistant that banks can plug into their own apps, under their own brand. Cardholders can chat about their spending in plain language, get automatic insights, and take action — with US banks starting pilots in August and a global rollout planned after.",
      why: "People are already asking AI chatbots for money advice. This puts that experience inside your bank's own app — where your financial data doesn't have to be handed to a third party.",
      jargonTerm: "Value-added service",
      jargonMeaning: "An extra feature a payment network sells to banks on top of simply processing payments.",
    },
  ],
  stablecoins: [
    {
      headline: "Sony is getting into digital dollars",
      source: "CoinDesk",
      url: "https://www.coindesk.com/business/2026/07/09/sony-secures-conditional-approval-to-set-up-u-s-stablecoin-trust-bank",
      date: "Jul 9",
      what: "Sony received conditional approval to set up a US trust bank that would support issuing and managing dollar-backed stablecoins. It's a striking move: an electronics and entertainment giant stepping directly into regulated digital money.",
      why: "When companies like Sony start building digital-dollar infrastructure, it's a sign stablecoins are going mainstream — not just a crypto niche.",
      jargonTerm: "Trust bank",
      jargonMeaning: "A special kind of bank that safeguards assets for others but doesn't take deposits or make loans.",
    },
    {
      headline: "A company put $295 million of its own stock on the blockchain — on day one",
      source: "CoinDesk",
      url: "https://www.coindesk.com/business/2026/07/02/securitize-tokenizes-usd295-million-of-its-own-stock-on-solana-and-avalanche-amid-nyse-debut",
      date: "Jul 2",
      what: "Securitize, a tokenization firm backed by BlackRock and ARK Invest, went public on the New York Stock Exchange — and on its very first day of trading, made its own shares available in token form on the Solana and Avalanche blockchains. Investors held about $295 million of the tokenized shares at launch, and the company says they represent the same stock as the NYSE shares, not a separate copy.",
      why: "This is what 'stocks on the blockchain' looks like in practice. If it catches on, buying shares could someday work more like sending a digital payment — faster settlement, fewer middlemen.",
      jargonTerm: "Tokenization",
      jargonMeaning: "Turning a real-world asset, like a share of stock, into a digital token that lives on a blockchain.",
    },
  ],
  regulators: [
    {
      headline: "Buy-now-pay-later is officially regulated in the UK — as of this week",
      source: "Finextra",
      url: "https://www.finextra.com/newsarticle/48090/uk-bnpl-regulations-come-into-force",
      date: "Jul 15",
      what: "The UK's new buy-now-pay-later regime came into force on July 15. Providers must now give clear upfront details about payment schedules and what happens if you miss one, run proportionate affordability checks, and support customers in arrears — a big shift for a market that grew from £60 million in 2017 to over £13 billion by 2024, used by roughly one in five UK adults.",
      why: "BNPL looks like a payment button at checkout, but it's really credit — and until this week it sat outside the rules. UK shoppers just gained protections other borrowers have had for decades.",
      jargonTerm: "Consumer Duty",
      jargonMeaning: "The UK rule requiring financial firms to deliver good outcomes for customers — not just follow the letter of the law.",
    },
    {
      headline: "Cash App's parent will pay $45 million over fraud protection failures",
      source: "PYMNTS",
      url: "https://www.pymnts.com/legal/2026/block-pays-45-million-to-settle-46-state-probe-into-cash-app-fraud-protection-and-resolution/",
      date: "Jul 8",
      what: "Block agreed to pay $45 million to settle allegations from 46 US states that it misled consumers about the safety of Cash App and failed to provide the fraud protection and dispute resolution required by law. The investigation was led by Oregon and Texas. Block denied wrongdoing and agreed to strengthen fraud prevention and customer support.",
      why: "Millions of people treat payment apps like bank accounts. Enforcement like this pushes those apps to actually behave like one when something goes wrong — including a real human to talk to.",
      jargonTerm: "Multistate settlement",
      jargonMeaning: "State attorneys general teaming up to enforce consumer protection rules together.",
    },
  ],
  publications: [
    {
      headline: "AI-generated fake documents are breaking mortgage checks",
      source: "PYMNTS",
      url: "https://www.pymnts.com/news/artificial-intelligence/2026/ai-cracked-mortgage-verification-system/",
      date: "Jul 2026",
      what: "Generative AI can now produce fake payslips, bank statements and tax records convincing enough to pass standard mortgage verification — and Australian banks are investigating billions of dollars in suspected fraudulent loans. In response, lenders are shifting from checking documents to verifying financial data directly at the source, through consent-based access to government and payroll records.",
      why: "The way lenders decide who gets a loan is being rebuilt in real time. Expect more 'connect your account' verification and fewer 'upload a PDF' requests.",
      jargonTerm: "Underwriting",
      jargonMeaning: "The process a lender uses to decide whether you can afford a loan.",
    },
    {
      headline: "Why the PayPal bid is also a digital-dollar story",
      source: "CoinDesk",
      url: "https://www.coindesk.com/business/2026/07/15/stripe-mounts-blockbuster-usd53-billion-bid-to-buy-paypal",
      date: "Jul 15",
      what: "CoinDesk's angle on the week's mega-deal: Stripe and PayPal are two of the most prominent mainstream companies bringing stablecoins onto traditional payment rails. PayPal issues its own digital dollar, PYUSD — currently the sector's eighth largest at about a $185 million market value, versus roughly $184 billion for leader Tether — while Stripe has focused on integrating Circle's USDC into its payments infrastructure.",
      why: "If the deal happens, the combined company would hold serious cards in the race to make digital dollars part of everyday payments — not just crypto trading.",
      jargonTerm: "Market capitalization",
      jargonMeaning: "The total value of all of a coin's (or company's) units combined.",
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
      headline: "Canada's instant-payment system cleared its last big legal hurdle",
      source: "Payments Canada",
      url: "https://www.payments.ca/critical-milestone-achieved-law-and-rules-approved-canadas-real-time-rail",
      date: "",
      what: "The by-law and rules governing the Real-Time Rail — Canada's long-awaited instant payment system — have received all necessary approvals and come into force on August 24, 2026, ahead of a launch planned for the fourth quarter of 2026. Once live, payments will send, clear and settle in seconds, 24/7, every day of the year.",
      why: "Think e-transfers, bill payments and paycheques that land instantly — even at 2 a.m. on a holiday. It's the plumbing upgrade Canadian payments have waited a decade for.",
      jargonTerm: "Payment rails",
      jargonMeaning: "The behind-the-scenes plumbing that moves money between financial institutions.",
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
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em", padding: "14px 12px 14px 0", whiteSpace: "nowrap", color: "#000000" }}>
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
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: "clamp(38px, 8vw, 60px)", lineHeight: 1.02, margin: 0, letterSpacing: "-0.03em", color: "#000000" }}>
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
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24, margin: "0 0 4px", color: "#000000" }}>
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
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 24, margin: "0 0 4px", color: "#000000" }}>
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
