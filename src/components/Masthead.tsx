import { useState } from "react";
import { CARRD_URL } from "../data";
import { useScramble } from "../hooks";

const POSTER_SRC =
  "https://image.qwenlm.ai/generated-images/29dd23eb-cc49-44b8-82b2-c608149ffdce/_result.png";

/* ---------- small living pieces ---------- */

function Equalizer({ className = "" }: { className?: string }) {
  const bars = [
    ["eq-a", 26], ["eq-b", 40], ["eq-c", 30], ["eq-a", 52], ["eq-b", 22],
    ["eq-c", 44], ["eq-a", 34], ["eq-b", 56], ["eq-c", 28], ["eq-a", 46],
    ["eq-b", 36], ["eq-c", 50],
  ] as const;
  return (
    <div className={`flex items-end gap-[5px] ${className}`} aria-hidden="true">
      {bars.map(([cls, h], i) => (
        <span
          key={i}
          className={`eq-bar w-[5px] bg-gold ${cls}`}
          style={{ height: h, animationDelay: `${i * 0.09}s` }}
        />
      ))}
    </div>
  );
}

function Vinyl() {
  return (
    <svg viewBox="0 0 300 300" className="spin-slow h-full w-full" aria-hidden="true">
      <circle cx="150" cy="150" r="148" fill="#211810" stroke="#4a3822" strokeWidth="2" />
      {[128, 108, 88, 68].map((r) => (
        <circle key={r} cx="150" cy="150" r={r} fill="none" stroke="#322314" strokeWidth="1.5" />
      ))}
      <circle cx="150" cy="150" r="46" fill="#f2a81d" />
      <circle cx="150" cy="150" r="46" fill="none" stroke="#171008" strokeWidth="3" />
      <text x="150" y="143" textAnchor="middle" fontFamily="Anton, sans-serif" fontSize="13" fill="#171008">
        OIL ON MY HEAD
      </text>
      <text x="150" y="160" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="700" fontSize="10" fill="#171008">
        EBEN · PRAYER HOUR
      </text>
      <circle cx="150" cy="150" r="5" fill="#171008" />
    </svg>
  );
}

function FallbackPoster() {
  return (
    <div className="relative flex aspect-[832/1216] flex-col items-center justify-center overflow-hidden bg-coal">
      <div className="halftone absolute inset-0 opacity-60" />
      <div className="stripes-gold absolute inset-x-0 top-0 h-6" />
      <div className="stripes-gold absolute inset-x-0 bottom-0 h-6" />
      <svg width="64" height="72" viewBox="0 0 16 18" className="flicker text-flame">
        <path
          d="M8 0c1 3-3 4.5-3 8a3 3 0 0 0 6 .2C11 10 13 11 13 13.5A5.5 5.5 0 0 1 8 18a5.5 5.5 0 0 1-5.5-5C2.5 8 8 6 8 0z"
          fill="currentColor"
        />
      </svg>
      <p className="display mt-5 px-6 text-center text-4xl text-cream">OIL ON MY HEAD</p>
      <p className="display mt-2 text-lg text-gold">EBEN</p>
      <p className="mt-3 text-[11px] font-semibold tracking-[0.3em] text-parch/70">PRAYER HOUR CHALLENGE</p>
    </div>
  );
}

/* ---------- the advert card ---------- */

function AdvertCard() {
  const [broken, setBroken] = useState(false);
  return (
    <div className="reveal group relative mx-auto w-full max-w-md lg:max-w-none">
      {/* tape strips */}
      <span className="absolute -top-3 left-8 z-20 h-6 w-24 -rotate-6 bg-cream/20 backdrop-blur-[1px]" />
      <span className="absolute -top-3 right-8 z-20 h-6 w-24 rotate-6 bg-cream/20 backdrop-blur-[1px]" />

      {/* sticker */}
      <span className="display absolute -left-3 top-6 z-20 -rotate-6 border-2 border-ink bg-flame px-3 py-1.5 text-sm text-ink shadow-[4px_4px_0_0_rgba(23,16,8,0.9)]">
        OFFICIAL ADVERT
      </span>

      <div className="relative rotate-1 overflow-hidden border-2 border-cream/85 bg-coal transition-transform duration-300 group-hover:rotate-0 group-hover:scale-[1.015] hard-shadow">
        {broken ? (
          <FallbackPoster />
        ) : (
          <img
            src={POSTER_SRC}
            alt="Oil On My Head Challenge official advert artwork — golden oil pouring on a singer's head"
            className="aspect-[832/1216] w-full object-cover"
            loading="eager"
            onError={() => setBroken(true)}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="display text-2xl leading-none text-cream">
            OIL ON MY <span className="text-gold">HEAD</span>
          </p>
          <p className="mt-1 text-[11px] font-semibold tracking-[0.22em] text-parch/80">
            THE CHALLENGE · EBEN · PRAYER HOUR
          </p>
        </div>
      </div>

      {/* card actions */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={CARRD_URL}
          target="_blank"
          rel="noreferrer"
          className="display inline-flex items-center justify-center gap-2 border-2 border-gold bg-gold px-5 py-3 text-base text-ink transition-all hover:-translate-y-0.5 hover:bg-amber hover:shadow-[5px_5px_0_0_rgba(255,107,43,1)] active:translate-y-0"
        >
          prayerhour.carrd.co
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 10L10 2M10 2H4M10 2v6" />
          </svg>
        </a>
        <a
          href="#submit"
          className="group/link inline-flex items-center justify-center gap-2 text-sm font-bold text-cream underline decoration-flame decoration-2 underline-offset-4 transition-colors hover:text-gold"
        >
          Enter via this portal
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover/link:translate-y-0.5">
            <path d="M7 1v11M2 7l5 5 5-5" />
          </svg>
        </a>
      </div>
    </div>
  );
}

/* ---------- masthead ---------- */

export function Masthead() {
  const line1 = useScramble("OIL ON MY", 250);
  const line2 = useScramble("HEAD.", 750);

  return (
    <section id="top" className="relative overflow-hidden border-b-4 border-gold">
      {/* ambient layers */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-[26rem] w-[26rem] rounded-full bg-flame/10 blur-3xl" />
      <div className="halftone pointer-events-none absolute inset-0 opacity-40" />

      {/* spinning vinyl backdrop */}
      <div className="pointer-events-none absolute -right-28 -top-28 h-[24rem] w-[24rem] opacity-25 lg:opacity-40">
        <Vinyl />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-16">
        {/* left — the announcement */}
        <div className="lg:col-span-7">
          <div className="reveal flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 border border-line bg-coal/80 px-3 py-1.5 text-[11px] font-bold tracking-[0.25em] text-gold">
              <span className="pulse-dot h-2 w-2 rounded-full bg-flame" />
              PRAYER HOUR PRESENTS
            </span>
            <Equalizer />
          </div>

          <h1 className="display mt-6 text-[17vw] text-cream sm:text-7xl lg:text-[6.2rem] xl:text-[7rem]">
            <span className="block">{line1}</span>
            <span
              className="block text-transparent"
              style={{ WebkitTextStroke: "2.5px #f2a81d" }}
            >
              {line2}
            </span>
          </h1>

          {/* oil drips under the title */}
          <div className="relative mt-1 h-10 w-40 overflow-hidden" aria-hidden="true">
            {[10, 45, 90, 130].map((x, i) => (
              <span
                key={x}
                className="oil-drip absolute top-0 block h-7 w-[5px] rounded-b-full bg-gold/80"
                style={{ left: x, animationDelay: `${i * 1.4}s` }}
              />
            ))}
          </div>

          <p className="reveal mt-2 max-w-xl text-base leading-relaxed text-parch sm:text-lg">
            The <span className="font-bold text-cream">SHS talent challenge</span> is
            live. Perform to Eben's official soundtrack, film{" "}
            <span className="font-bold text-cream">2 explosive minutes</span>, and
            upload it right here — your video goes straight to the{" "}
            <span className="font-bold text-gold">Prayer Hour Google Drive</span>.
          </p>

          {/* meta strip */}
          <div className="reveal mt-8 grid grid-cols-2 border-2 border-line bg-coal/70 sm:grid-cols-4">
            {[
              ["OFFICIAL SONG", "“Oil On My Head”"],
              ["ARTIST", "Eben"],
              ["WHO ENTERS", "Students & Grads"],
              ["FORMAT", "Solo · Duo · Group"],
            ].map(([k, v], i) => (
              <div
                key={k}
                className={`px-4 py-3.5 ${i > 0 ? "border-l-2 border-line" : ""} ${
                  i >= 2 ? "max-sm:border-t-2 max-sm:border-line" : ""
                } ${i === 2 ? "max-sm:border-l-0" : ""}`}
              >
                <p className="text-[10px] font-bold tracking-[0.22em] text-parch/60">{k}</p>
                <p className="display mt-1 text-lg leading-tight text-cream">{v}</p>
              </div>
            ))}
          </div>

          <div className="reveal mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#submit"
              className="display border-2 border-ink bg-flame px-7 py-4 text-xl text-ink shadow-[6px_6px_0_0_rgba(242,168,29,1)] transition-all hover:-translate-y-1 hover:shadow-[9px_9px_0_0_rgba(242,168,29,1)] active:translate-y-0 active:shadow-[3px_3px_0_0_rgba(242,168,29,1)]"
            >
              Enter the Challenge ↓
            </a>
            <a
              href={CARRD_URL}
              target="_blank"
              rel="noreferrer"
              className="display border-2 border-cream/70 px-6 py-4 text-lg text-cream transition-all hover:border-gold hover:text-gold"
            >
              View the Advert ↗
            </a>
          </div>
        </div>

        {/* right — the advert card with both links */}
        <div className="lg:col-span-5 lg:pl-4">
          <AdvertCard />
        </div>
      </div>
    </section>
  );
}
