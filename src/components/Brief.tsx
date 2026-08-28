import { useState } from "react";
import { CARRD_URL, FAQ, PIPELINE, VIDEO_RULES } from "../data";

function SectionHead({
  index,
  tag,
  title,
}: {
  index: string;
  tag: string;
  title: React.ReactNode;
}) {
  return (
    <div className="reveal mb-10 flex items-end gap-5">
      <span className="display text-6xl leading-none text-cream/15 sm:text-7xl">{index}</span>
      <div>
        <p className="text-[11px] font-bold tracking-[0.3em] text-flame">{tag}</p>
        <h2 className="display mt-1 text-4xl text-cream sm:text-5xl">{title}</h2>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.4">
      <path d="M2.5 8.5l3.5 3.5 7-8" />
    </svg>
  );
}

export function Challenge() {
  return (
    <section id="challenge" className="relative scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          index="01"
          tag="READ THIS FIRST"
          title={
            <>
              THE <span className="text-gold">CHALLENGE</span>
            </>
          }
        />

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="reveal lg:col-span-7">
            <p className="text-xl leading-relaxed text-cream sm:text-2xl">
              Are you an SHS student <span className="bg-gold px-1.5 font-extrabold text-ink">or graduate</span> ready to showcase your talent? Enter{" "}
              <span className="bg-gold px-1.5 font-extrabold text-ink">individually</span>, as a{" "}
              <span className="bg-gold px-1.5 font-extrabold text-ink">duo</span>, or as a{" "}
              <span className="bg-gold px-1.5 font-extrabold text-ink">group</span> and create an
              exciting <span className="font-extrabold text-gold">2-minute video performance</span>{" "}
              using Eben's “Oil On My Head” soundtrack.
            </p>
            <p className="mt-5 max-w-2xl leading-relaxed text-parch/90">
              Submissions are collected through this portal and delivered straight into the
              Prayer Hour team's Google Drive — then the screening begins.
            </p>

            {/* soundtrack chip */}
            <a
              href={CARRD_URL}
              target="_blank"
              rel="noreferrer"
              className="group mt-8 inline-flex items-center gap-4 border-2 border-line bg-coal p-3 pr-5 transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-[6px_6px_0_0_rgba(242,168,29,1)]"
            >
              <span className="grid h-14 w-14 place-items-center border-2 border-gold bg-ink">
                <svg width="22" height="22" viewBox="0 0 24 24" className="text-gold">
                  <path
                    d="M9 18.5a3 3 0 1 1-2-2.83V5.6a1 1 0 0 1 .76-.97l11-2.75A1 1 0 0 1 20 2.85v11.82a3 3 0 1 1-2-2.83V6.3l-9 2.25v9.95z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span>
                <span className="block text-[10px] font-bold tracking-[0.25em] text-parch/60">
                  REQUIRED SOUNDTRACK
                </span>
                <span className="display block text-xl text-cream">
                  “OIL ON MY HEAD” — <span className="text-gold">EBEN</span>
                </span>
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="ml-2 text-parch transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold"
              >
                <path d="M2 10L10 2M10 2H4M10 2v6" />
              </svg>
            </a>

            {/* stat strip */}
            <div className="mt-10 grid grid-cols-2 gap-px border-2 border-line bg-line sm:grid-cols-4">
              {[
                ["2:00", "MAX RUNTIME"],
                ["1", "OFFICIAL SOUND"],
                ["TOP 16", "FINALISTS"],
                ["100%", "STUDENTS & GRADS"],
              ].map(([big, small]) => (
                <div key={small} className="group bg-coal px-4 py-5 transition-colors hover:bg-bark">
                  <p className="display text-3xl text-gold transition-transform group-hover:-translate-y-0.5">
                    {big}
                  </p>
                  <p className="mt-1 text-[10px] font-bold tracking-[0.2em] text-parch/60">{small}</p>
                </div>
              ))}
            </div>
          </div>

          {/* video requirements card */}
          <div className="lg:col-span-5">
            <div className="reveal relative border-2 border-gold bg-coal p-6 hard-shadow sm:p-7">
              <span className="display absolute -top-4 left-5 border-2 border-ink bg-gold px-3 py-1 text-sm text-ink">
                VIDEO REQUIREMENTS
              </span>
              <ul className="mt-3 space-y-3.5">
                {VIDEO_RULES.map((r, i) => (
                  <li key={r} className="flex items-start gap-3 text-[15px] text-cream/90">
                    <span
                      className="mt-0.5 grid h-6 w-6 flex-none place-items-center border border-gold/60 text-gold"
                      style={{ transitionDelay: `${i * 30}ms` }}
                    >
                      <CheckIcon />
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
              <div className="stripes-gold mt-7 h-3 w-full opacity-80" />
              <p className="mt-4 text-xs leading-relaxed text-parch/70">
                The portal automatically rejects videos longer than 2 minutes, so time your
                performance before you film.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how" className="relative scroll-mt-20 border-y-2 border-line bg-coal/60 py-20 lg:py-28">
      <div className="halftone pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          index="02"
          tag="WHAT HAPPENS NEXT"
          title={
            <>
              HOW IT <span className="text-flame">WORKS</span>
            </>
          }
        />

        <div className="grid gap-px border-2 border-line bg-line md:grid-cols-2">
          {PIPELINE.map((step, i) => (
            <div
              key={step.n}
              className={`reveal group relative bg-ink p-7 transition-colors duration-300 hover:bg-bark sm:p-9 ${
                i % 2 === 0 ? "" : ""
              }`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div className="flex items-start justify-between">
                <span className="display text-5xl text-cream/12 transition-colors duration-300 group-hover:text-gold sm:text-6xl">
                  {step.n}
                </span>
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mt-2 text-parch/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-flame"
                >
                  <path d="M4 12h16M13 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="display mt-4 text-2xl text-cream sm:text-3xl">{step.title}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-parch/85">{step.body}</p>
            </div>
          ))}
        </div>

        <p className="reveal display mt-10 text-center text-2xl text-cream sm:text-4xl">
          🌟 SCREENED → TOP 16 → <span className="text-gold">SCHOOL VISITS</span> → PUBLIC VOTING
        </p>
      </div>
    </section>
  );
}

export function Rules() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="rules" className="relative scroll-mt-20 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          index="03"
          tag="BEFORE YOU FILM"
          title={
            <>
              RULES &amp; <span className="text-gold">FAQ</span>
            </>
          }
        />

        <div className="reveal mx-auto max-w-3xl border-2 border-line">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className={i > 0 ? "border-t-2 border-line" : ""}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className={`flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors sm:px-7 ${
                    isOpen ? "bg-bark text-gold" : "text-cream hover:bg-coal"
                  }`}
                >
                  <span className="flex items-center gap-4">
                    <span className="display text-sm text-flame">Q{i + 1}</span>
                    <span className="font-bold">{item.q}</span>
                  </span>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    className={`flex-none transition-transform duration-300 ${isOpen ? "rotate-45 text-flame" : ""}`}
                  >
                    <path d="M9 2v14M2 9h14" />
                  </svg>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="border-l-4 border-gold bg-coal px-5 py-4 leading-relaxed text-parch/90 sm:px-7">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
