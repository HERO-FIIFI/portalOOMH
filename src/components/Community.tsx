import type { ReactNode } from "react";
import { HASHTAG, SOCIALS, STAGES, type SocialId } from "../data";

/* ================= custom platform icons ================= */

export function PlatformIcon({ id, size = 18 }: { id: SocialId; size?: number }) {
  switch (id) {
    case "tiktok":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M14.6 2h3c.2 2 1.6 3.9 4.4 4.2v3.2c-1.7 0-3.3-.6-4.6-1.5v6.9a6.4 6.4 0 1 1-6.4-6.4c.3 0 .7 0 1 .1v3.3a3.2 3.2 0 1 0 2.6 3.1V2z" />
        </svg>
      );
    case "instagram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" stroke="none" />
        </svg>
      );
    case "youtube":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23 12s0-3.8-.5-5.5c-.3-1-1.1-1.8-2.1-2C18.7 4 12 4 12 4s-6.7 0-8.4.5c-1 .2-1.8 1-2.1 2C1 8.2 1 12 1 12s0 3.8.5 5.5c.3 1 1.1 1.8 2.1 2 1.7.5 8.4.5 8.4.5s6.7 0 8.4-.5c1-.2 1.8-1 2.1-2 .5-1.7.5-5.5.5-5.5z" />
          <path d="M10 15.5v-7l6 3.5z" fill="#171008" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 1.9a8.1 8.1 0 1 1-4.2 15l-.5-.3-2.5.7.7-2.4-.3-.5A8.1 8.1 0 0 1 12 3.9zM8.8 7.4c-.2 0-.5.1-.7.4-.2.3-1 1-1 2.3s1 2.6 1.1 2.8c.2.2 2 3.1 4.8 4.2 2.3.9 2.8.7 3.3.7.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3l-2.1-1c-.3-.1-.5-.2-.7.1l-1 1.2c-.1.2-.3.2-.6.1a6.6 6.6 0 0 1-3.2-2.9c-.2-.4 0-.5.1-.7l.5-.6c.2-.2.2-.4.1-.6l-.9-2.1c-.2-.4-.4-.7-.7-.7h-.4z" />
        </svg>
      );
    case "telegram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21.9 4.1 2.9 11.4c-.9.4-.9 1.6 0 1.9l4.9 1.6 1.8 5.6c.3.8 1.3 1 1.9.4l2.6-2.5 4.9 3.6c.7.5 1.7.1 1.9-.7l3-15.9c.2-1-.7-1.7-2-1.3zM9.4 14.2l8.6-7.7-6.7 8.7-.3 3z" />
        </svg>
      );
    case "facebook":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
        </svg>
      );
  }
}

/* ================= compact icon row (confirmation screen + footer) ================= */

export function SocialIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {SOCIALS.map((s) => (
        <a
          key={s.id}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          title={s.label}
          aria-label={s.label}
          className="grid h-10 w-10 place-items-center border-2 border-line bg-ink text-parch transition-all hover:-translate-y-1 hover:border-gold hover:text-gold"
        >
          <PlatformIcon id={s.id} />
        </a>
      ))}
    </div>
  );
}

/* ================= live stage tracker ================= */

export function StageTracker() {
  return (
    <section className="relative overflow-hidden border-b-2 border-line bg-ink">
      <div className="halftone pointer-events-none absolute inset-0 opacity-25" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="reveal flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2.5 text-[11px] font-bold tracking-[0.3em] text-gold">
            <span className="pulse-dot h-2 w-2 rounded-full bg-flame" />
            LIVE CHALLENGE TRACKER
          </p>
          <span className="border-2 border-line bg-coal px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-parch">
            CURRENTLY: <span className="text-gold">STAGE 1 OF 4</span>
          </span>
        </div>

        <ol className="reveal mt-8 grid gap-7 md:grid-cols-4 md:gap-0">
          {STAGES.map((s) => (
            <li key={s.n} className="md:pr-7">
              {/* track segment */}
              <div className="relative h-2">
                <div
                  className={`h-full w-full ${s.active ? "bar-active" : "bg-line/40"}`}
                />
                {/* node */}
                <span
                  className={`display absolute -top-[7px] grid h-6 w-6 place-items-center border-2 text-[13px] ${
                    s.active
                      ? "border-ink bg-flame text-ink"
                      : "border-line bg-coal text-parch/70"
                  }`}
                >
                  {s.n}
                </span>
              </div>

              <div className="mt-4">
                <p
                  className={`flex items-center gap-2 text-[10px] font-bold tracking-[0.22em] ${
                    s.active ? "text-flame" : "text-parch/50"
                  }`}
                >
                  {s.active && <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-flame" />}
                  {s.status}
                </p>
                <p
                  className={`display mt-1.5 text-2xl leading-tight ${
                    s.active ? "text-cream" : "text-parch/75"
                  }`}
                >
                  {s.title}
                </p>
                <p className={`mt-1.5 text-[13px] leading-relaxed ${s.active ? "text-parch/85" : "text-parch/55"}`}>
                  {s.note}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ================= follow the challenge — social hub ================= */

function ChannelRow({
  icon,
  name,
  handle,
  desc,
  url,
  cta,
  accent = false,
}: {
  icon: ReactNode;
  name: string;
  handle: string;
  desc: string;
  url: string;
  cta: string;
  accent?: boolean;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`group flex flex-col gap-4 border-2 border-line bg-coal/80 px-5 py-5 transition-all hover:-translate-y-0.5 hover:border-gold sm:flex-row sm:items-center ${
        accent ? "border-flame/50" : ""
      }`}
    >
      <span
        className="grid flex-none place-items-center border-2 border-gold/60 bg-ink p-3 text-gold transition-colors group-hover:bg-gold group-hover:text-ink"
        style={{ width: 52, height: 52 }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="display flex flex-wrap items-baseline gap-x-3 text-xl text-cream">
          {name}
          <span className="font-body text-[12px] font-bold tracking-wide text-gold">{handle}</span>
        </span>
        <span className="mt-1 block text-[13px] leading-relaxed text-parch/70">{desc}</span>
      </span>
      <span className="display flex flex-none items-center gap-2 border-2 border-line px-3.5 py-2 text-sm text-parch transition-all group-hover:border-gold group-hover:bg-gold group-hover:text-ink">
        {cta}
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <path d="M2 10L10 2M10 2H4M10 2v6" />
        </svg>
      </span>
    </a>
  );
}

export function FollowChallenge() {
  return (
    <section id="follow" className="relative scroll-mt-20 overflow-hidden border-t-2 border-line py-20 lg:py-24">
      <div className="pointer-events-none absolute -left-32 top-10 h-[22rem] w-[22rem] rounded-full bg-gold/8 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.3em] text-flame">
              <span className="pulse-dot h-2 w-2 rounded-full bg-flame" />
              DON'T MISS A DROP
            </p>
            <h2 className="display mt-3 text-5xl text-cream sm:text-6xl">
              FOLLOW THE{" "}
              <span className="text-transparent" style={{ WebkitTextStroke: "2px #f2a81d" }}>
                CHALLENGE
              </span>
            </h2>
            <p className="mt-3 max-w-xl text-parch/85">
              Entry highlights, screening progress, the Top 16 reveal and voting dates —
              everything drops across our channels first.
            </p>
          </div>
          <span className="display border-2 border-gold bg-ink px-4 py-2.5 text-lg text-gold">
            {HASHTAG}
          </span>
        </div>

        <div className="reveal mt-10 grid gap-4">
          <ChannelRow
            icon={<PlatformIcon id="tiktok" size={24} />}
            name="TikTok"
            handle="@PrayerHour"
            desc="Featured entry highlights and viral moments from the challenge."
            url={SOCIALS[0].url}
            cta="FOLLOW"
          />
          <ChannelRow
            icon={<PlatformIcon id="instagram" size={22} />}
            name="Instagram Reels"
            handle="@PrayerHour"
            desc="Updates, announcements and reel features of the best performances."
            url={SOCIALS[1].url}
            cta="FOLLOW"
          />
          <ChannelRow
            icon={<PlatformIcon id="youtube" size={24} />}
            name="YouTube"
            handle="Prayer Hour"
            desc="Watch full performance clips and complete Prayer Hour broadcasts."
            url={SOCIALS[2].url}
            cta="WATCH"
          />
          <ChannelRow
            icon={<PlatformIcon id="facebook" size={24} />}
            name="Facebook"
            handle="Prayer Hour"
            desc="Community updates, photos and event announcements from the team."
            url={SOCIALS[3].url}
            cta="FOLLOW"
          />

          {/* real-time alert channels */}
          <div className="border-2 border-flame/60 bg-ink p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="grid place-items-center gap-1" style={{ width: 52 }}>
                  <span className="grid h-9 w-9 place-items-center border-2 border-flame/60 text-flame">
                    <PlatformIcon id="whatsapp" size={18} />
                  </span>
                  <span className="grid h-9 w-9 place-items-center border-2 border-flame/60 text-flame">
                    <PlatformIcon id="telegram" size={18} />
                  </span>
                </span>
                <div>
                  <p className="display text-xl text-cream">REAL-TIME ALERT CHANNELS</p>
                  <p className="mt-0.5 max-w-lg text-[13px] leading-relaxed text-parch/70">
                    Join for instant alerts — screening progress, <span className="text-gold">Top 16 reveals</span>{" "}
                    and voting dates.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={SOCIALS[3].url}
                  target="_blank"
                  rel="noreferrer"
                  className="display flex items-center gap-2 border-2 border-gold bg-gold px-4 py-2.5 text-sm text-ink transition-all hover:-translate-y-0.5 hover:bg-amber active:translate-y-0"
                >
                  <PlatformIcon id="whatsapp" size={15} />
                  JOIN WHATSAPP
                </a>
                <a
                  href={SOCIALS[4].url}
                  target="_blank"
                  rel="noreferrer"
                  className="display flex items-center gap-2 border-2 border-cream/70 px-4 py-2.5 text-sm text-cream transition-all hover:-translate-y-0.5 hover:border-gold hover:text-gold active:translate-y-0"
                >
                  <PlatformIcon id="telegram" size={15} />
                  JOIN TELEGRAM
                </a>
              </div>
            </div>
          </div>
        </div>

        <p className="reveal mt-6 text-center text-xs font-bold tracking-[0.25em] text-parch/50">
          TAG <span className="text-gold">{HASHTAG}</span> ON YOUR POSTS — THE TEAM IS WATCHING 👀
        </p>
      </div>
    </section>
  );
}
