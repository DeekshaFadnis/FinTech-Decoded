import { useState, useEffect } from "react";

// ─── Brand tokens ───────────────────────────────────────────────
const PAPER = "#FCFCFA";
const INK = "#14171F";
const BLUE = "#2547F4";
const HIGHLIGHT = "#F4E76E";
const GREY = "#5C6270";

const EDITION = "Week of July 13\u201319, 2026 \u00b7 hand-picked & simplified";

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
      headline: "Mastercard might sell the pipes that move Britain's money",
      source: "FinTech Futures",
      url: "https://www.fintechfutures.com/fintech/fintech-futures-top-five-news-stories-of-the-week-17-july-2026",
      date: "Jul 17",
      what: "Mastercard is reportedly exploring the sale of a majority stake in Vocalink, its London-based payments technology business, according to a Financial Times report cited by FinTech Futures. Vocalink acts as the central switchboard for the UK's retail banking network — the behind-the-scenes infrastructure that everyday bank payments run through.",
      why: "You never see the pipes that move a country's money, but who owns them shapes investment, reliability and fees across the whole system.",
      jargonTerm: "Payment rails",
      jargonMeaning: "The behind-the-scenes plumbing that moves money between banks and accounts.",
    },
    {
      headline: "A payment app just became a trade war issue",
      source: "CoinDesk",
      url: "https://www.coindesk.com/business/2026/07/18/trump-targets-brazil-s-payments-system-while-dollar-stablecoins-quietly-dominate-country-s-payments",
      date: "Jul 18",
      what: "The US will impose a 25% tariff on most Brazilian goods from July 22 — the first time Washington has used its Section 301 trade powers against another country's domestic payment system. US officials argue Brazil's Pix network, which offers free transfers for individuals and caps merchant fees, disadvantages American card companies. Pix handled 42.9 billion transactions in the second half of 2025 — nearly double all card payments combined. Meanwhile, dollar-linked stablecoins already make up about 90% of Brazil's crypto transaction volume.",
      why: "How countries move money — cards, instant transfers, digital dollars — is turning into geopolitics. That fight ends up shaping the prices and payment options regular people get.",
      jargonTerm: "Section 301",
      jargonMeaning: "A US trade law that lets Washington penalize foreign practices it deems unfair to American companies.",
    },
  ],
  stablecoins: [
    {
      headline: "Visa built the machinery for banks to run digital dollars",
      source: "Finextra",
      url: "https://www.finextra.com/newsarticle/48110/visa-launches-stablecoin-platform",
      date: "Jul 16",
      what: "Visa unveiled the Visa Stablecoin Platform, now in beta testing — a single environment where banks and fintechs can access, store and redeem stablecoins, including on-chain wallet infrastructure through a new Wallet-as-a-Service offering. It starts with Open USD (OUSD), the stablecoin from Open Standard, the new independent company whose 140+ founding partners include Visa, Mastercard, US Bank, Google and Coinbase — slated to launch later this year.",
      why: "The company behind the card in your wallet is building the plumbing for banks to issue digital dollars. When your bank eventually offers one, something like this will likely be running underneath.",
      jargonTerm: "Minting",
      jargonMeaning: "Creating new units of a stablecoin, each backed by real money held in reserve.",
    },
    {
      headline: "Will Gen Alpha ever open a bank account?",
      source: "CoinDesk",
      url: "https://www.coindesk.com/business/2026/07/17/crypto-executives-say-digital-native-generations-may-never-need-a-bank-account",
      date: "Jul 17",
      what: "Crypto executives and bankers told CoinDesk they increasingly expect digitally native generations to rely on wallets holding stablecoins and tokenized assets instead of stand-alone bank accounts. Standard Chartered expects stablecoin circulation to grow roughly sevenfold to about $2 trillion by 2028 — with stablecoins handling more retail payments and remittances, while bank-issued tokens serve larger institutional flows.",
      why: "Whether or not bank accounts actually disappear, the people building tomorrow's financial products are planning for a world where your 'account' is a wallet on your phone.",
      jargonTerm: "Digital wallet",
      jargonMeaning: "Software that holds your money and digital assets and lets you pay directly from your phone.",
    },
  ],
  regulators: [
    {
      headline: "The UK is now directly regulating the cloud companies banks run on",
      source: "FinTech Futures",
      url: "https://www.fintechfutures.com/fintech/fintech-futures-top-five-news-stories-of-the-week-17-july-2026",
      date: "Jul 17",
      what: "The UK's HM Treasury rolled out a new regime this week that brings four global cloud service providers under direct regulatory oversight for the first time — a move intended to strengthen the resilience of the UK's financial system.",
      why: "So much of banking now runs on a handful of cloud companies that one outage could ripple across the entire financial system. Regulators are finally treating that invisible plumbing as critical infrastructure.",
      jargonTerm: "Critical third party",
      jargonMeaning: "An outside company so important to the financial system that regulators supervise it directly.",
    },
  ],
  publications: [
    {
      headline: "A banking tech company's own customers just funded it to a $1.6B valuation",
      source: "FinTech Futures",
      url: "https://www.fintechfutures.com/fintech/fintech-futures-top-five-news-stories-of-the-week-17-july-2026",
      date: "Jul 17",
      what: "Lumin Digital, a California-based digital banking technology provider, raised $115 million — including a $70 million round backed by 15 of its own existing clients, such as Affinity Plus Federal Credit Union, plus a $45 million growth investment led by long-term backer Light Street Capital. The round values Lumin at $1.6 billion, with the money earmarked for AI, payments, CRM and lending products.",
      why: "When a company's own customers put up $70 million to fund it, that's about the strongest product endorsement there is — and its tools shape the online banking experience millions of credit union members use.",
      jargonTerm: "Growth equity",
      jargonMeaning: "Investment in an established company to help it expand — not to keep it alive.",
    },
  ],
  canada: [],
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
              {stories.length === 0 && (
                <div style={{ background: "#fff", border: "1.5px solid #E4E6EB", borderRadius: 16, padding: "26px 24px", textAlign: "center" }}>
                  <div style={{ fontSize: 26, marginBottom: 8 }} aria-hidden="true">{cat.emoji}</div>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 6, color: INK }}>
                    Quiet week
                  </div>
                  <p style={{ fontSize: 14.5, color: GREY, lineHeight: 1.55, margin: 0 }}>
                    No new stories from our tracked sources made the cut this edition — honest curation beats padding. Check back next week.
                  </p>
                </div>
              )}
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
