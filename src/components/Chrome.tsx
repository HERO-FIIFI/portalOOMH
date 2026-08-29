import { CARRD_URL } from "../data";
import { SocialIcons } from "./Community";

const TICKER_ITEMS = [
  "SUBMISSIONS OPEN",
  "OFFICIAL SONG: “OIL ON MY HEAD” — EBEN",
  "OPEN TO SHS STUDENTS & GRADUATES",
  "INDIVIDUAL · DUO · GROUP",
  "TOP 16 FINALISTS → SCHOOL VISITS → PUBLIC VOTING",
  "2 MINUTES TO SHOW YOUR TALENT",
];

function TickerRow() {
  return (
    <>
      {[0, 1].map((half) => (
        <div key={half} className="flex shrink-0 items-center" aria-hidden={half === 1}>
          {TICKER_ITEMS.map((t) => (
            <span
              key={t + half}
              className="display flex items-center gap-3 px-5 py-1.5 text-[13px] tracking-wide text-ink"
            >
              {t}
              <svg width="11" height="11" viewBox="0 0 12 12" className="text-ember">
                <path d="M6 0l1.6 4.4L12 6 7.6 7.6 6 12 4.4 7.6 0 6l4.4-1.6z" fill="currentColor" />
              </svg>
            </span>
          ))}
        </div>
      ))}
    </>
  );
}

export function Ticker() {
  return (
    <div className="relative z-40 overflow-hidden border-b-2 border-ink bg-gold">
      <div className="marquee-track">
        <TickerRow />
        <TickerRow />
      </div>
    </div>
  );
}

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-ink/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center border-2 border-gold bg-coal transition-colors group-hover:bg-gold">
            {/* flame mark */}
            <svg width="16" height="18" viewBox="0 0 16 18" className="text-gold transition-colors group-hover:text-ink">
              <path
                d="M8 0c1 3-3 4.5-3 8a3 3 0 0 0 6 .2C11 10 13 11 13 13.5A5.5 5.5 0 0 1 8 18a5.5 5.5 0 0 1-5.5-5C2.5 8 8 6 8 0z"
                fill="currentColor"
              />
            </svg>
          </span>
          <span className="display text-xl leading-none">
            PRAYER<span className="text-gold">&nbsp;HOUR</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-[13px] font-semibold tracking-wide text-parch md:flex">
          <a href="#challenge" className="transition-colors hover:text-gold">The Challenge</a>
          <a href="#how" className="transition-colors hover:text-gold">How It Works</a>
          <a href="#rules" className="transition-colors hover:text-gold">Rules &amp; FAQ</a>
          <a href="#follow" className="transition-colors hover:text-gold">Follow</a>
          <a
            href={CARRD_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-gold"
          >
            Official Advert
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 10L10 2M10 2H4M10 2v6" />
            </svg>
          </a>
        </nav>

        <a
          href="#submit"
          className="display border-2 border-gold bg-gold px-4 py-2 text-sm text-ink shadow-[4px_4px_0_0_rgba(255,107,43,1)] transition-all hover:-translate-y-0.5 hover:bg-amber hover:shadow-[6px_6px_0_0_rgba(255,107,43,1)] active:translate-y-0 active:shadow-[2px_2px_0_0_rgba(255,107,43,1)]"
        >
          Submit Entry
        </a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-24 border-t-4 border-gold bg-coal">
      <div className="overflow-hidden border-b border-line/60 py-4">
        <div className="marquee-track slow">
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0 items-center" aria-hidden={half === 1}>
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="display flex items-center gap-6 px-6 text-3xl text-cream/15 sm:text-4xl">
                  THE OIL IS ON MY HEAD
                  <svg width="26" height="26" viewBox="0 0 24 24" className="text-flame/60">
                    <path
                      d="M12 1c1.5 4.5-4.5 6.5-4.5 11a4.5 4.5 0 0 0 9 .3C16.5 15 19 16 19 19a7 7 0 1 1-14 0C5 12 12 9 12 1z"
                      fill="currentColor"
                    />
                  </svg>
                  LET YOUR TALENT SPEAK
                  <svg width="24" height="24" viewBox="0 0 12 12" className="text-gold/50">
                    <path d="M6 0l1.6 4.4L12 6 7.6 7.6 6 12 4.4 7.6 0 6l4.4-1.6z" fill="currentColor" />
                  </svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="display text-2xl">
            PRAYER<span className="text-gold"> HOUR</span>
          </p>
          <SocialIcons className="mt-5" />
        </div>
        <div className="text-sm">
          <p className="display mb-4 text-sm tracking-wider text-gold">QUICK LINKS</p>
          <ul className="space-y-2.5 text-parch/85">
            <li><a href="#challenge" className="transition-colors hover:text-gold">The Challenge</a></li>
            <li><a href="#how" className="transition-colors hover:text-gold">How It Works</a></li>
            <li><a href="#rules" className="transition-colors hover:text-gold">Rules &amp; FAQ</a></li>
            <li><a href="#submit" className="transition-colors hover:text-gold">Submission Portal</a></li>
            <li>
              <a href={CARRD_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-gold">
                prayerhour.carrd.co
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M2 10L10 2M10 2H4M10 2v6" />
                </svg>
              </a>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="display mb-4 text-sm tracking-wider text-gold">THE SOUNDTRACK</p>
          <p className="text-parch/85">
            “Oil On My Head” — <span className="font-bold text-cream">Eben</span>
          </p>
          <p className="mt-2 leading-relaxed text-parch/70">
            Every entry must be performed to the official soundtrack. Find it on
            the official advert page.
          </p>
        </div>
      </div>
      <div className="border-t border-line/60 py-4 text-center text-xs tracking-wide text-parch/50">
        © {new Date().getFullYear()} Prayer Hour · Oil On My Head Challenge · Accra, Ghana
      </div>
    </footer>
  );
}
