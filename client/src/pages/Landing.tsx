import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Public page at "/" - redirects straight to /dashboard if already logged in.
export function Landing() {
  const { user, loading } = useAuth();

  // Same wait-for-auth-check rule as ProtectedRoute.
  if (loading) {
    return <p>Loading...</p>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const year = new Date().getFullYear();

  return (
    <div className="landing">
      <header className="landing-topbar">
        <div className="landing-topbar-inner">
          <span className="landing-logo">TrackWise</span>
          <Link to="/login" className="landing-login-link">
            Log in
          </Link>
        </div>
      </header>

      {/* --- Hero --- */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>Know exactly where your money goes.</h1>
            <p className="hero-sub">
              TrackWise helps you log spending, set budgets that actually
              stick, and finally see the full picture — without the guilt,
              and without a spreadsheet you'll abandon in a week.
            </p>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started Free
            </Link>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="mockup-card">
              <div className="mockup-card-header">
                <span>Spending overview</span>
                <span className="mockup-pill">This month</span>
              </div>

              <div className="mockup-donut-row">
                <svg viewBox="0 0 120 120" className="mockup-donut">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#243049" strokeWidth="18" />
                  <circle
                    cx="60" cy="60" r="45" fill="none" stroke="#2dd4bf" strokeWidth="18"
                    strokeDasharray="113.1 169.6" strokeDashoffset="0"
                    transform="rotate(-90 60 60)" strokeLinecap="round"
                  />
                  <circle
                    cx="60" cy="60" r="45" fill="none" stroke="#60a5fa" strokeWidth="18"
                    strokeDasharray="70.7 212.0" strokeDashoffset="-115"
                    transform="rotate(-90 60 60)"
                  />
                  <circle
                    cx="60" cy="60" r="45" fill="none" stroke="#f5a623" strokeWidth="18"
                    strokeDasharray="56.5 226.2" strokeDashoffset="-187"
                    transform="rotate(-90 60 60)"
                  />
                  <circle
                    cx="60" cy="60" r="45" fill="none" stroke="#64748b" strokeWidth="18"
                    strokeDasharray="42.4 240.3" strokeDashoffset="-245"
                    transform="rotate(-90 60 60)"
                  />
                </svg>

                <ul className="mockup-legend">
                  <li><span className="dot dot-teal" />Food</li>
                  <li><span className="dot dot-blue" />Transport</li>
                  <li><span className="dot dot-amber" />Rent</li>
                  <li><span className="dot dot-slate" />Other</li>
                </ul>
              </div>

              <svg viewBox="0 0 200 50" className="mockup-line">
                <polyline
                  points="0,40 28,32 56,36 84,16 112,24 140,8 168,20 200,12"
                  fill="none" stroke="#2dd4bf" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* --- The problem --- */}
      <section className="problem">
        <div className="section-inner">
          <h2>Sound familiar?</h2>
          <div className="problem-list">
            <p>You get to the end of the month and can't explain where half your paycheck went.</p>
            <p>You set a budget with good intentions — and it falls apart by week two.</p>
            <p>You tried a spreadsheet. You updated it twice, then never opened it again.</p>
          </div>
        </div>
      </section>

      {/* --- Features as benefits --- */}
      <section className="features">
        <div className="section-inner">
          <h2>What you actually get</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2 4 14h6l-1 8 9-12h-6z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>Log it in seconds</h3>
              <p>
                Add an expense or paycheck in a few taps. No categories to
                hunt for, no forms to dread — tracking stops feeling like
                a chore.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                </svg>
              </div>
              <h3>Budgets that actually hold</h3>
              <p>
                Set daily, weekly, or monthly limits per category, and know
                the moment you're close to the edge — before you're over it.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3>See it at a glance</h3>
              <p>
                Pie, line, and bar views turn a month of transactions into
                patterns you can actually act on.
              </p>
              <svg viewBox="0 0 140 60" className="feature-bars" aria-hidden="true">
                <rect x="5" y="25" width="16" height="30" rx="3" fill="#2dd4bf" opacity="0.5" />
                <rect x="31" y="8" width="16" height="47" rx="3" fill="#2dd4bf" opacity="0.7" />
                <rect x="57" y="18" width="16" height="37" rx="3" fill="#2dd4bf" opacity="0.6" />
                <rect x="83" y="2" width="16" height="53" rx="3" fill="#2dd4bf" />
                <rect x="109" y="30" width="16" height="25" rx="3" fill="#2dd4bf" opacity="0.5" />
              </svg>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="6" width="18" height="13" rx="2" />
                  <path d="M3 10h18" strokeLinecap="round" />
                  <circle cx="16" cy="14.5" r="1.4" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <h3>Always know your real balance</h3>
              <p>
                Every calculation happens automatically. No manual math, no
                guessing — just your real number, updated the moment you
                log something.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- How it works --- */}
      <section className="how-it-works">
        <div className="section-inner">
          <h2>Up and running in three steps</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign up</h3>
              <p>Create your free account in under a minute.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Log your transactions</h3>
              <p>Add expenses and income as they happen — or catch up in one sitting.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Watch your insights update</h3>
              <p>Your dashboard, budgets, and charts update instantly, every time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Why TrackWise --- */}
      <section className="why">
        <div className="section-inner">
          <h2>Why TrackWise</h2>
          <div className="why-grid">
            <div className="why-item">
              <h3>Simple by design</h3>
              <p>
                Built for people who bounced off finance apps with more
                settings than a cockpit — or gave up on spreadsheets that
                overpromised.
              </p>
            </div>
            <div className="why-item">
              <h3>Fast, not fussy</h3>
              <p>
                No onboarding maze, no paywall before you've even tried it.
                Sign up and start logging in your first minute.
              </p>
            </div>
            <div className="why-item">
              <h3>Your data, your account</h3>
              <p>
                TrackWise is built around one account, one person. What you
                track is yours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="final-cta">
        <div className="section-inner">
          <h2>Start understanding your money today.</h2>
          <p>No credit card, no catch — just a clearer picture of your finances.</p>
          <Link to="/signup" className="btn btn-primary btn-lg">
            Sign Up Free
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© {year} Jabbar Oguntola</p>
      </footer>
    </div>
  );
}
