import { useState, useEffect } from "react";

// ─── Brand tokens ───────────────────────────────────────────────
const PAPER = "#FCFCFA";
const INK = "#14171F";
const BLUE = "#2547F4";
const HIGHLIGHT = "#F4E76E";
const GREY = "#5C6270";

const EDITION = "Week of Sept 3\u201310, 2026 \u00b7 hand-picked & simplified";

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
      headline: "Chime is buying its own bank",
      source: "Finextra",
      url: "https://www.finextra.com/newsarticle/48368/chime-acquires-banking-partner",
      date: "Sep 8",
      what: "Chime agreed to buy Stride Bank — its banking partner of more than seven years — for $590 million in cash. Stride will become Chime Bank, N.A., a wholly owned subsidiary, with the deal expected to close in the first half of 2027 pending regulator approval. Owning the bank ends Chime's reliance on partner banks, and the company expects over $100 million in savings from lower partner fees, cheaper funding and expanded lending.",
      why: "Chime serves more than ten million active accounts. If you're one of them, the app becomes the actual bank — one company responsible for your money end to end, with a regulator watching it directly.",
      jargonTerm: "Sponsor bank",
      jargonMeaning: "A licensed bank that fintech apps rent banking powers from behind the scenes.",
    },
    {
      headline: "Visa is turning payment data into loans for fintechs",
      source: "Visa",
      url: "https://investor.visa.com/news/news-details/2026/Visa-Brings-Onchain-Lending-into-Everyday-Payments/default.aspx",
      date: "Sep 2026",
      what: "Visa is combining its VisaNet settlement data with blockchain lending infrastructure so stablecoin-linked card programs and fintechs can borrow working capital — with real-time payment performance feeding underwriting, collateral management and automated repayment. The model is already live with Credit Coop, which has financed more than $2.5 billion of settlement volume with zero defaults.",
      why: "This is what stablecoins look like when they get boring — in the best way: quietly powering ordinary business lending behind everyday card payments.",
      jargonTerm: "Working capital",
      jargonMeaning: "The day-to-day cash a business needs to keep operating before its revenue arrives.",
    },
  ],
  stablecoins: [
    {
      headline: "PayPal will now help any app launch its own digital dollar",
      source: "Finextra",
      url: "https://www.finextra.com/newsarticle/48375/paypal-helps-developers-build-application-specific-pyusd-backed-stablecoins",
      date: "Sep 9",
      what: "PayPal, MoonPay and stablecoin platform M0 launched PYUSDx — a platform that lets developers create their own branded, application-specific stablecoins backed by PayPal's PYUSD, which is issued by Paxos, a federally regulated trust company. The pitch: launch a custom digital dollar in days rather than months, with cross-chain compatibility and transparent reserves.",
      why: "Soon, the 'digital dollar' inside an app you use might carry that app's own brand — while the real money behind it sits with a regulated issuer. Knowing who actually holds the backing is the question that matters.",
      jargonTerm: "Issuer",
      jargonMeaning: "The company that creates a stablecoin and holds the real money backing it.",
    },
    {
      headline: "A major US bank just moved money across the Atlantic on its own stablecoin",
      source: "PYMNTS",
      url: "https://www.pymnts.com/cryptocurrency/2026/this-week-in-stablecoins-everything-but-the-coin",
      date: "Sep 10",
      what: "US Bank executed a live pilot transaction between North America and Europe using USBDC, its own proprietary US dollar-backed stablecoin — moving money between its own operations across borders. As PYMNTS notes, it puts another regulated financial institution directly into digital-dollar infrastructure.",
      why: "When a major traditional bank runs cross-border payments on its own stablecoin, digital dollars stop being a crypto story and start being a banking story.",
      jargonTerm: "Settlement",
      jargonMeaning: "The moment money actually moves between institutions and a payment becomes final.",
    },
  ],
  regulators: [
    {
      headline: "Revolut got the green light to build a real American bank",
      source: "Finextra",
      url: "https://www.finextra.com/newsarticle/48345/revolut-achieves-conditional-occ-approval-for-us-national-bank-status",
      date: "Sep 3",
      what: "The OCC granted Revolut preliminary conditional approval for a US national bank charter — a green light to organize Revolut Bank US in Stamford, Connecticut, though not yet a licence to operate. Revolut plans to invest about $95 million in the bank, offering checking accounts, loans, credit cards and foreign exchange, with a possible stablecoin offered through a third-party issuer. It still needs FDIC insurance, Federal Reserve approval and final OCC sign-off, targeting a launch in the first half of 2027.",
      why: "Revolut's US 'bank' has so far run through partner banks. A real charter means the full weight of American banking supervision — more protection and more accountability for its customers.",
      jargonTerm: "Bank charter",
      jargonMeaning: "The government licence that lets a company legally operate as a bank.",
    },
    {
      headline: "The company behind Cash App wants a federal licence to hold your crypto",
      source: "PYMNTS",
      url: "https://www.pymnts.com/cryptocurrency/2026/block-pursues-national-trust-bank-charter-to-custody-bitcoin-and-stablecoins/",
      date: "Sep 8",
      what: "Block filed with the OCC to establish Builders Bank & Trust, an uninsured national trust bank that would provide custody and related fiduciary services for assets including bitcoin and stablecoins. It wouldn't take deposits or make loans — the point is one consistent federal framework for safeguarding digital assets as the business scales, instead of a patchwork of state rules.",
      why: "For anyone holding crypto through a mainstream app, custody supervised by a federal bank regulator is a meaningful upgrade in oversight.",
      jargonTerm: "Custody",
      jargonMeaning: "Safekeeping assets on someone else's behalf without owning them.",
    },
  ],
  publications: [
    {
      headline: "PayPal tried to sell $1 billion of startup stakes — the offers were too low",
      source: "PYMNTS",
      url: "https://www.pymnts.com/news/investment-tracker/2026/paypal-pauses-venture-capital-portfolio-sale-after-lowball-offers/",
      date: "Sep 2026",
      what: "PayPal shelved plans to sell roughly $900 million to $1 billion of its startup investments after bids came in at just 60 cents on the dollar.",
      why: "A window into the private-market mood: even a payments giant's venture portfolio only fetches steep discounts right now — a reality check on what startups are actually worth versus what their backers hoped.",
      jargonTerm: "Secondary sale",
      jargonMeaning: "Selling existing investment stakes to another buyer instead of waiting for the companies to exit.",
    },
    {
      headline: "An AI company just arranged a $15 billion credit line",
      source: "PYMNTS",
      url: "https://www.pymnts.com/news/artificial-intelligence/2026/anthropic-expands-credit-facility-to-15-billion-ahead-of-mega-ipo/",
      date: "Sep 2026",
      what: "Anthropic — the AI company behind Claude — is increasing its revolving credit facility sixfold, from $2.5 billion to $15 billion, as it prepares for a potential IPO.",
      why: "AI companies are now arranging bank-scale money. The size of the credit lines tells you how big the industry's ambitions — and its costs — have become.",
      jargonTerm: "Revolving credit facility",
      jargonMeaning: "A giant corporate credit line a company can borrow from, repay, and borrow from again.",
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
