import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CARRD_URL, REGIONS, VIDEO_RULES } from "../data";
import { useLocalStorage } from "../hooks";
import {
  APPS_SCRIPT_CODE,
  ENTRIES_KEY,
  URL_STORAGE_KEY,
  makeRefCode,
  submitEntry,
  type EntryPayload,
  type SubmitResult,
} from "../lib/appsScript";

/* ================= types ================= */

type EntryType = "" | "Individual" | "Duo" | "Group";
type FormLevel = "" | "SHS 1" | "SHS 2" | "SHS 3" | "Graduate";
type AgeGroup = "" | "under18" | "over18";

interface FormState {
  entryType: EntryType;
  leadName: string;
  phone: string;
  email: string;
  school: string;
  location: string;
  form: FormLevel;
  otherNames: string;
  ageGroup: AgeGroup;
  guardianName: string;
  guardianPhone: string;
  videoLink: string;
  decl1: boolean;
  decl2: boolean;
  decl3: boolean;
}

interface VideoMeta {
  file: File;
  url: string;
  sizeMB: number;
  duration: number;
}

type Phase = "idle" | "uploading" | "done" | "error";

const EMPTY: FormState = {
  entryType: "",
  leadName: "",
  phone: "",
  email: "",
  school: "",
  location: "",
  form: "",
  otherNames: "",
  ageGroup: "",
  guardianName: "",
  guardianPhone: "",
  videoLink: "",
  decl1: false,
  decl2: false,
  decl3: false,
};

/* ================= helpers ================= */

const fmtDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
};

function probeDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      const d = v.duration;
      URL.revokeObjectURL(url);
      Number.isFinite(d) ? resolve(d) : reject(new Error("bad"));
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("bad"));
    };
    v.src = url;
  });
}

/* ================= tiny UI atoms ================= */

function Label({ req, children }: { req?: boolean; children: React.ReactNode }) {
  return (
    <span className="mb-1.5 block text-[12px] font-bold tracking-[0.14em] text-parch/85">
      {children}
      {req && <span className="text-flame"> *</span>}
    </span>
  );
}

function Err({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <span className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-ember">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 1l7 13H1L8 1zm-.9 5h1.8l-.2 4h-1.4l-.2-4zm.9 7.2a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
      </svg>
      {msg}
    </span>
  );
}

function SectionCard({
  id,
  num,
  title,
  note,
  children,
}: {
  id: string;
  num: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset id={id} className="reveal border-2 border-line bg-coal/80 p-5 transition-colors sm:p-7">
      <legend className="sr-only">{title}</legend>
      <div className="mb-6 flex items-baseline gap-4">
        <span className="display text-3xl text-flame">{num}</span>
        <div>
          <h3 className="display text-2xl text-cream">{title}</h3>
          {note && <p className="mt-0.5 text-xs text-parch/60">{note}</p>}
        </div>
      </div>
      {children}
    </fieldset>
  );
}

/* ================= icons ================= */

const PersonIcon = ({ n = 1 }: { n?: number }) => (
  <svg width="26" height="26" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2">
    {n === 1 && (
      <>
        <circle cx="14" cy="9" r="4.5" />
        <path d="M5 25c0-5 4-8 9-8s9 3 9 8" />
      </>
    )}
    {n === 2 && (
      <>
        <circle cx="10" cy="9" r="3.6" />
        <path d="M2.5 24c0-4.4 3.4-7 7.5-7s7.5 2.6 7.5 7" />
        <circle cx="20" cy="8" r="3" />
        <path d="M17.5 15.4c3.7.4 8 2.8 8 7.6" />
      </>
    )}
    {n === 3 && (
      <>
        <circle cx="14" cy="7.5" r="3.4" />
        <path d="M7.5 23c0-4 2.9-6.2 6.5-6.2s6.5 2.2 6.5 6.2" />
        <circle cx="5.5" cy="10.5" r="2.6" />
        <path d="M0.8 22.5c0-3.3 2.1-5.2 4.7-5.5" />
        <circle cx="22.5" cy="10.5" r="2.6" />
        <path d="M27.2 22.5c0-3.3-2.1-5.2-4.7-5.5" />
      </>
    )}
  </svg>
);

/* ================= upload zone ================= */

function UploadZone({
  video,
  setVideo,
  error,
  onClearError,
}: {
  video: VideoMeta | null;
  setVideo: (v: VideoMeta | null) => void;
  error?: string;
  onClearError: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [checking, setChecking] = useState(false);
  const [localErr, setLocalErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (video) URL.revokeObjectURL(video.url);
    };
  }, [video]);

  const handleFile = useCallback(
    async (f: File) => {
      setLocalErr("");
      onClearError();
      if (!f.type.startsWith("video/")) {
        setLocalErr("That's not a video file. Upload MP4, MOV, WEBM or similar.");
        return;
      }
      const sizeMB = f.size / (1024 * 1024);
      if (sizeMB > 250) {
        setLocalErr("File is over 250MB. Compress it, or paste a Drive/YouTube link below instead.");
        return;
      }
      setChecking(true);
      try {
        const duration = await probeDuration(f);
        if (duration > 120.5) {
          setLocalErr(
            `Video runs ${fmtDuration(duration)} — the limit is 2:00. Trim it down and try again.`,
          );
          setChecking(false);
          return;
        }
        if (video) URL.revokeObjectURL(video.url);
        setVideo({ file: f, url: URL.createObjectURL(f), sizeMB, duration });
      } catch {
        setLocalErr("Couldn't read that video. Try re-exporting it as MP4.");
      } finally {
        setChecking(false);
      }
    },
    [onClearError, setVideo, video],
  );

  return (
    <div>
      <Label req>UPLOAD YOUR VIDEO</Label>

      {!video && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFile(f);
          }}
          className={`flex w-full flex-col items-center justify-center gap-3 border-2 border-dashed px-6 py-12 transition-all ${
            dragging
              ? "border-gold bg-bark scale-[1.01]"
              : error || localErr
                ? "border-ember/80 bg-ink hover:border-ember"
                : "border-line bg-ink hover:border-gold hover:bg-bark/60"
          }`}
        >
          {checking ? (
            <>
              <span className="grid h-12 w-12 place-items-center border-2 border-gold">
                <svg width="22" height="22" viewBox="0 0 24 24" className="spin-slow text-gold" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ animationDuration: "1s" }}>
                  <path d="M12 3a9 9 0 1 0 9 9" />
                </svg>
              </span>
              <p className="font-bold text-gold">Checking video length…</p>
            </>
          ) : (
            <>
              <span className="grid h-14 w-14 place-items-center border-2 border-gold bg-coal text-gold">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 16V4M7 9l5-5 5 5" />
                  <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                </svg>
              </span>
              <p className="display text-xl text-cream">
                DRAG YOUR VIDEO HERE <span className="text-gold">OR TAP TO BROWSE</span>
              </p>
              <p className="text-xs text-parch/60">MP4 · MOV · WEBM — up to 250MB, max 2:00 runtime</p>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {video && (
        <div className="border-2 border-moss/70 bg-ink p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <video
              src={video.url}
              controls
              preload="metadata"
              className="max-h-44 w-full flex-none border border-line bg-black sm:w-64"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="truncate font-bold text-cream">{video.file.name}</p>
                <button
                  type="button"
                  onClick={() => setVideo(null)}
                  className="flex-none border border-line px-2 py-1 text-[11px] font-bold tracking-wider text-parch transition-colors hover:border-ember hover:text-ember"
                >
                  REMOVE ✕
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="border border-line bg-coal px-2 py-1 text-parch">
                  {video.sizeMB.toFixed(1)} MB
                </span>
                <span className="border border-line bg-coal px-2 py-1 text-parch">
                  RUNTIME {fmtDuration(video.duration)}
                </span>
                <span className="border border-moss bg-moss/10 px-2 py-1 text-moss">
                  ✓ 2:00 COMPLIANT
                </span>
                {video.sizeMB > 50 && (
                  <span className="border border-amber bg-amber/10 px-2 py-1 text-amber">
                    ⚠ OVER 50MB — may need the link option
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-parch/65">
                On submit, this file uploads directly into the Prayer Hour Google Drive folder.
              </p>
            </div>
          </div>
        </div>
      )}

      <Err msg={localErr || error} />
    </div>
  );
}

/* ================= setup panel (Drive connect) ================= */

function DriveConnectPanel() {
  const [url, setUrl] = useLocalStorage(URL_STORAGE_KEY);
  const [draft, setDraft] = useState(url);
  const [copied, setCopied] = useState(false);
  const connected = /^https:\/\/script\.google(usercontent)?\.com\/.+\/exec\/?$/.test(url);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <details className="reveal group border-2 border-line bg-ink">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-coal [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center border-2 border-line text-parch">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a4.5 4.5 0 0 0-6.4 6.4L3 18v3h3l5.3-5.3a4.5 4.5 0 0 0 6.4-6.4L15 12l-3-3 2.7-2.7z" />
            </svg>
          </span>
          <span>
            <span className="display block text-lg text-cream">ORGANISERS — CONNECT YOUR DRIVE</span>
            <span className="text-xs text-parch/60">
              {connected ? "Intake script linked — submissions go live to Drive" : "Demo mode — set up the free Google Apps Script intake"}
            </span>
          </span>
        </span>
        <span
          className={`flex-none border px-2.5 py-1 text-[10px] font-bold tracking-[0.18em] ${
            connected ? "border-moss bg-moss/10 text-moss" : "border-amber bg-amber/10 text-amber"
          }`}
        >
          {connected ? "● CONNECTED" : "● DEMO MODE"}
        </span>
      </summary>

      <div className="space-y-6 border-t-2 border-line px-5 py-6">
        <ol className="grid gap-5 text-sm leading-relaxed text-parch/85 md:grid-cols-3">
          {[
            ["1 · CREATE THE INTAKE", "In Google Drive make a folder for videos and a Sheet for entries. Open script.google.com, paste the script below, and put both IDs inside it."],
            ["2 · DEPLOY AS WEB APP", "Deploy → New deployment → Web app. Execute as “Me”, access “Anyone”. Copy the /exec URL it gives you."],
            ["3 · PASTE THE URL HERE", "Save it below on any device that runs this portal. Every submission now lands in your Drive folder + Sheet automatically."],
          ].map(([t, b]) => (
            <li key={t} className="border-l-2 border-gold pl-4">
              <p className="display text-sm text-gold">{t}</p>
              <p className="mt-1.5">{b}</p>
            </li>
          ))}
        </ol>

        <div>
          <Label>APPS SCRIPT WEB APP URL</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="field flex-1 font-mono text-[13px]"
              placeholder="https://script.google.com/macros/s/…/exec"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setUrl(draft.trim())}
              className="display border-2 border-gold bg-gold px-5 py-2.5 text-sm text-ink transition-colors hover:bg-amber"
            >
              SAVE
            </button>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label>THE INTAKE SCRIPT (COPY → PASTE INTO APPS SCRIPT)</Label>
            <button
              type="button"
              onClick={copyCode}
              className={`border px-3 py-1.5 text-[11px] font-bold tracking-wider transition-all ${
                copied
                  ? "border-moss bg-moss/15 text-moss"
                  : "border-line text-parch hover:border-gold hover:text-gold"
              }`}
            >
              {copied ? "COPIED ✓" : "COPY CODE"}
            </button>
          </div>
          <pre className="max-h-64 overflow-auto border-2 border-line bg-ink p-4 font-mono text-[11px] leading-relaxed text-parch/80">
            {APPS_SCRIPT_CODE}
          </pre>
        </div>
      </div>
    </details>
  );
}

/* ================= success screen ================= */

function SuccessScreen({
  payload,
  result,
  onReset,
}: {
  payload: EntryPayload;
  result: SubmitResult;
  onReset: () => void;
}) {
  return (
    <div className="reveal is-in border-2 border-moss bg-coal p-6 text-center sm:p-12">
      <span className="mx-auto grid h-20 w-20 place-items-center border-2 border-moss bg-moss/10">
        <svg width="38" height="38" viewBox="0 0 32 32" fill="none" stroke="#55b57c" strokeWidth="3.4">
          <path className="draw-check" d="M5 17.5l7.5 7.5L27 8" />
        </svg>
      </span>
      <p className="display mt-6 text-3xl text-cream sm:text-5xl">
        YOU'RE IN, <span className="text-gold">{payload.leadName.split(" ")[0].toUpperCase() || "CHAMPION"}</span>!
      </p>
      <p className="mx-auto mt-4 max-w-xl leading-relaxed text-parch/85">
        Your entry {result.demo && "has been recorded in demo mode — "}
        {result.demo ? "it will" : "has"} been delivered to the Prayer Hour team
        {result.demo ? " once the Drive intake is connected" : " and stored in their Google Drive"}.
        Keep your reference code safe — you'll need it for any enquiries.
      </p>

      <div className="mx-auto mt-8 inline-block border-2 border-dashed border-gold bg-ink px-8 py-5">
        <p className="text-[10px] font-bold tracking-[0.3em] text-parch/60">REFERENCE CODE</p>
        <p className="display mt-1 text-4xl tracking-wider text-gold sm:text-5xl">{payload.refCode}</p>
      </div>

      {result.videoUrl && (
        <a
          href={result.videoUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-moss underline decoration-2 underline-offset-4 transition-colors hover:text-cream"
        >
          View your video in Google Drive
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 10L10 2M10 2H4M10 2v6" />
          </svg>
        </a>
      )}

      <div className="mx-auto mt-10 grid max-w-2xl gap-px border-2 border-line bg-line text-left text-sm sm:grid-cols-2">
        {[
          ["ENTRY TYPE", payload.entryType],
          ["SCHOOL", payload.school],
          ["FORM", payload.form],
          ["VIDEO", payload.fileName ? `${payload.fileName} (${payload.fileSizeMB} MB · ${payload.duration})` : payload.videoLink],
        ].map(([k, v]) => (
          <div key={k} className="bg-ink px-4 py-3">
            <p className="text-[10px] font-bold tracking-[0.2em] text-parch/50">{k}</p>
            <p className="mt-0.5 truncate font-semibold text-cream">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={onReset}
          className="display border-2 border-gold bg-gold px-6 py-3.5 text-lg text-ink transition-all hover:-translate-y-0.5 hover:bg-amber active:translate-y-0"
        >
          SUBMIT ANOTHER ENTRY
        </button>
        <a
          href={CARRD_URL}
          target="_blank"
          rel="noreferrer"
          className="display border-2 border-cream/60 px-6 py-3.5 text-lg text-cream transition-colors hover:border-gold hover:text-gold"
        >
          BACK TO THE ADVERT ↗
        </a>
      </div>
    </div>
  );
}

/* ================= main portal ================= */

export function Portal() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [video, setVideo] = useState<VideoMeta | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [outcome, setOutcome] = useState<{ payload: EntryPayload; result: SubmitResult } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => {
      if (!e[k]) return e;
      const n = { ...e };
      delete n[k];
      return n;
    });
  };

  const needsGuardian = form.ageGroup !== "over18";

  /* ---- live completion meter ---- */
  const progressPct = useMemo(() => {
    const checks: boolean[] = [
      !!form.entryType,
      form.leadName.trim().length >= 3,
      /^[+0-9][0-9\s-]{8,}$/.test(form.phone.trim()),
      !!form.school.trim(),
      !!form.location.trim(),
      !!form.form,
      !!(video || form.videoLink.trim()),
      !!form.ageGroup,
      !needsGuardian || (!!form.guardianName.trim() && !!form.guardianPhone.trim()),
      form.decl1 && form.decl2 && form.decl3,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form, video, needsGuardian]);

  /* ---- validation ---- */
  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.entryType) e.entryType = "Choose how you're entering.";
    if (form.leadName.trim().length < 3) e.leadName = "Enter your full name.";
    if (!/^[+0-9][0-9\s-]{8,}$/.test(form.phone.trim()))
      e.phone = "Enter a valid phone / WhatsApp number.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "That email doesn't look right.";
    if (!form.school.trim()) e.school = "Enter your SHS name.";
    if (!form.location.trim()) e.location = "Where is your school? Town & region.";
    if (!form.form) e.form = "Select your current form — or Graduate.";
    if (form.entryType !== "Individual" && form.entryType !== "" && !form.otherNames.trim())
      e.otherNames = `List the other ${form.entryType === "Duo" ? "member" : "members"} of your ${form.entryType.toLowerCase()}.`;
    if (!video && !form.videoLink.trim())
      e.video = "Upload your video — or paste a Drive/YouTube link below.";
    if (form.videoLink.trim() && !/^https:\/\/[^\s]+\.[^\s]+/i.test(form.videoLink.trim()))
      e.videoLink = "Links must start with https://";
    if (!form.ageGroup) e.ageGroup = "Tell us if any participant is under 18.";
    if (needsGuardian && form.ageGroup === "under18") {
      if (!form.guardianName.trim()) e.guardianName = "Parent/guardian name is required under 18.";
      if (!/^[+0-9][0-9\s-]{8,}$/.test(form.guardianPhone.trim()))
        e.guardianPhone = "Parent/guardian phone is required under 18.";
    }
    if (!form.decl1) e.decl1 = "You must confirm eligibility.";
    if (!form.decl2) e.decl2 = "You must confirm consent.";
    if (!form.decl3) e.decl3 = "You must accept the rules to enter.";
    return e;
  };

  const shakeSection = (key: string) => {
    const map: Record<string, string> = {
      entryType: "sec-participant", leadName: "sec-participant", phone: "sec-participant",
      email: "sec-participant", school: "sec-participant", location: "sec-participant",
      form: "sec-participant", otherNames: "sec-participant", ageGroup: "sec-guardian",
      guardianName: "sec-guardian", guardianPhone: "sec-guardian",
      video: "sec-video", videoLink: "sec-video",
      decl1: "sec-declaration", decl2: "sec-declaration", decl3: "sec-declaration",
    };
    const el = document.getElementById(map[key] ?? "sec-participant");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.remove("shake");
      void el.offsetWidth;
      el.classList.add("shake");
      window.setTimeout(() => el.classList.remove("shake"), 600);
    }
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError("");
    const e = validate();
    setErrors(e);
    const keys = Object.keys(e);
    if (keys.length > 0) {
      shakeSection(keys[0]);
      return;
    }

    const payload: EntryPayload = {
      refCode: makeRefCode(),
      entryType: form.entryType,
      leadName: form.leadName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      school: form.school.trim(),
      location: form.location.trim(),
      form: form.form,
      otherNames: form.otherNames.trim(),
      ageGroup: form.ageGroup === "under18" ? "Under 18" : "18 or older",
      guardianName: form.guardianName.trim(),
      guardianPhone: form.guardianPhone.trim(),
      videoLink: form.videoLink.trim(),
      fileName: video?.file.name ?? "",
      fileSizeMB: video ? video.sizeMB.toFixed(1) : "",
      duration: video ? fmtDuration(video.duration) : "",
    };

    setPhase("uploading");
    setProgress(0);
    const result = await submitEntry(payload, video?.file ?? null, setProgress);

    if (result.ok) {
      setOutcome({ payload, result });
      setPhase("done");
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setPhase("error");
      setSubmitError(result.error ?? "Something went wrong. Please try again.");
    }
  };

  const reset = () => {
    setForm(EMPTY);
    setVideo(null);
    setErrors({});
    setOutcome(null);
    setPhase("idle");
    setProgress(0);
  };

  const localCount = useMemo(() => {
    try {
      return JSON.parse(window.localStorage.getItem(ENTRIES_KEY) ?? "[]").length as number;
    } catch {
      return 0;
    }
  }, [outcome]);

  return (
    <section id="submit" ref={rootRef} className="relative scroll-mt-20 border-t-4 border-gold bg-coal/40 py-20 lg:py-28">
      <div className="pointer-events-none absolute -right-32 top-0 h-[28rem] w-[28rem] rounded-full bg-gold/8 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.3em] text-flame">STEP IN — IT'S FREE</p>
            <h2 className="display mt-2 text-5xl text-cream sm:text-6xl">
              SUBMISSION <span className="text-gold">PORTAL</span>
            </h2>
            <p className="mt-3 max-w-xl text-parch/85">
              Fill the form, attach your 2-minute video, and hit submit. Your entry is delivered
              straight into the Prayer Hour Google Drive.
            </p>
          </div>
          <div className="flex items-center gap-2 border-2 border-line bg-ink px-4 py-2.5 text-xs font-bold tracking-wider text-parch">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#55b57c" strokeWidth="2">
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
              <path d="M12 12l8-4.5M12 12L4 7.5M12 12v9" />
            </svg>
            SECURED BY GOOGLE DRIVE INTAKE
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          {/* sticky aside */}
          <aside className="lg:col-span-4">
            <div className="space-y-6 lg:sticky lg:top-24">
              <div className="reveal border-2 border-line bg-ink p-6">
                <div className="flex items-baseline justify-between">
                  <p className="display text-lg text-cream">ENTRY PROGRESS</p>
                  <p className="display text-3xl text-gold">{progressPct}%</p>
                </div>
                <div className="mt-3 h-3 border border-line bg-coal">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-flame transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-parch/60">
                  {progressPct === 100
                    ? "🔥 Everything's ready — hit submit below!"
                    : "The bar fills as your entry becomes complete."}
                </p>
              </div>

              <div className="reveal border-2 border-line bg-ink p-6">
                <p className="display text-lg text-cream">BEFORE YOU SUBMIT</p>
                <ul className="mt-4 space-y-3">
                  {VIDEO_RULES.map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-[13px] text-parch/85">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#f2a81d" strokeWidth="2.4" className="mt-0.5 flex-none">
                        <path d="M2.5 8.5l3.5 3.5 7-8" />
                      </svg>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="reveal border-2 border-flame bg-ink p-6">
                <p className="display text-lg text-flame">CAN'T FIND THE SONG?</p>
                <p className="mt-2 text-[13px] leading-relaxed text-parch/85">
                  The official “Oil On My Head” soundtrack and full advert live on the Prayer Hour
                  page.
                </p>
                <a
                  href={CARRD_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="display mt-4 inline-flex items-center gap-2 border-2 border-flame px-4 py-2 text-sm text-flame transition-colors hover:bg-flame hover:text-ink"
                >
                  prayerhour.carrd.co ↗
                </a>
              </div>

              {localCount > 0 && phase !== "done" && (
                <div className="reveal border border-line bg-ink p-4 text-xs text-parch/60">
                  {localCount} demo entr{localCount === 1 ? "y" : "ies"} stored on this device.
                </div>
              )}
            </div>
          </aside>

          {/* form column */}
          <div className="lg:col-span-8">
            {outcome ? (
              <SuccessScreen payload={outcome.payload} result={outcome.result} onReset={reset} />
            ) : (
              <form onSubmit={onSubmit} noValidate className="space-y-7">
                {/* 01 — participant */}
                <SectionCard id="sec-participant" num="01" title="PARTICIPANT DETAILS" note="👤 Who's entering the challenge?">
                  <div className="space-y-5">
                    <div>
                      <Label req>ENTRY TYPE</Label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {(["Individual", "Duo", "Group"] as const).map((t, i) => {
                          const active = form.entryType === t;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => set("entryType", t)}
                              aria-pressed={active}
                              className={`flex flex-col items-center gap-2 border-2 px-2 py-4 transition-all sm:flex-row sm:justify-center sm:gap-3 ${
                                active
                                  ? "border-gold bg-gold text-ink shadow-[4px_4px_0_0_rgba(255,107,43,1)]"
                                  : "border-line bg-ink text-parch hover:-translate-y-0.5 hover:border-gold hover:text-cream"
                              }`}
                            >
                              <PersonIcon n={i + 1} />
                              <span className="display text-base sm:text-lg">{t}</span>
                            </button>
                          );
                        })}
                      </div>
                      <Err msg={errors.entryType} />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label req>LEAD PARTICIPANT FULL NAME</Label>
                        <input
                          className={`field ${errors.leadName ? "has-error" : ""}`}
                          placeholder="e.g. Abena Serwaa Mensah"
                          value={form.leadName}
                          onChange={(e) => set("leadName", e.target.value)}
                        />
                        <Err msg={errors.leadName} />
                      </div>
                      <div>
                        <Label req>PHONE / WHATSAPP NUMBER</Label>
                        <input
                          className={`field ${errors.phone ? "has-error" : ""}`}
                          placeholder="e.g. 024 123 4567"
                          inputMode="tel"
                          value={form.phone}
                          onChange={(e) => set("phone", e.target.value)}
                        />
                        <Err msg={errors.phone} />
                      </div>
                      <div>
                        <Label>EMAIL ADDRESS</Label>
                        <input
                          className={`field ${errors.email ? "has-error" : ""}`}
                          placeholder="you@example.com (optional)"
                          inputMode="email"
                          value={form.email}
                          onChange={(e) => set("email", e.target.value)}
                        />
                        <Err msg={errors.email} />
                      </div>
                      <div>
                        <Label req>NAME OF SHS</Label>
                        <input
                          className={`field ${errors.school ? "has-error" : ""}`}
                          placeholder="e.g. Prempeh College"
                          value={form.school}
                          onChange={(e) => set("school", e.target.value)}
                        />
                        <Err msg={errors.school} />
                      </div>
                      <div>
                        <Label req>SCHOOL LOCATION &amp; REGION</Label>
                        <input
                          className={`field ${errors.location ? "has-error" : ""}`}
                          placeholder="e.g. Adum, Kumasi — Ashanti"
                          list="gh-regions"
                          value={form.location}
                          onChange={(e) => set("location", e.target.value)}
                        />
                        <datalist id="gh-regions">
                          {REGIONS.map((r) => (
                            <option key={r} value={r} />
                          ))}
                        </datalist>
                        <Err msg={errors.location} />
                      </div>
                      <div>
                        <Label req>CURRENT FORM / STATUS</Label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {(["SHS 1", "SHS 2", "SHS 3", "Graduate"] as const).map((f) => {
                            const active = form.form === f;
                            return (
                              <button
                                key={f}
                                type="button"
                                onClick={() => set("form", f)}
                                aria-pressed={active}
                                className={`border-2 py-2.5 text-sm font-bold transition-all ${
                                  active
                                    ? "border-gold bg-gold text-ink"
                                    : "border-line bg-ink text-parch hover:border-gold hover:text-cream"
                                }`}
                              >
                                {f}
                              </button>
                            );
                          })}
                        </div>
                        <Err msg={errors.form} />
                      </div>
                    </div>

                    {form.entryType && form.entryType !== "Individual" && (
                      <div className="border-l-4 border-flame bg-ink p-4">
                        <Label req>OTHER PARTICIPANT NAMES</Label>
                        <textarea
                          className={`field min-h-20 ${errors.otherNames ? "has-error" : ""}`}
                          placeholder={`Full names of your ${form.entryType === "Duo" ? "partner" : "group members"}, one per line`}
                          value={form.otherNames}
                          onChange={(e) => set("otherNames", e.target.value)}
                        />
                        <Err msg={errors.otherNames} />
                      </div>
                    )}
                  </div>
                </SectionCard>

                {/* 02 — video */}
                <SectionCard id="sec-video" num="02" title="VIDEO SUBMISSION" note="🎥 Max 2 minutes · must use the Eben soundtrack">
                  <div className="space-y-5">
                    <UploadZone
                      video={video}
                      setVideo={setVideo}
                      error={errors.video}
                      onClearError={() =>
                        setErrors((e) => {
                          const n = { ...e };
                          delete n.video;
                          return n;
                        })
                      }
                    />
                    <div className="border-2 border-dashed border-line bg-ink/60 p-4">
                      <Label>FILE TOO BIG? PASTE A LINK INSTEAD</Label>
                      <input
                        className={`field font-mono text-[13px] ${errors.videoLink ? "has-error" : ""}`}
                        placeholder="https://drive.google.com/… or https://youtu.be/…"
                        value={form.videoLink}
                        onChange={(e) => {
                          set("videoLink", e.target.value);
                          if (e.target.value.trim())
                            setErrors((er) => {
                              const n = { ...er };
                              delete n.video;
                              return n;
                            });
                        }}
                      />
                      <Err msg={errors.videoLink} />
                      <p className="mt-2 text-xs text-parch/55">
                        Upload to your own Drive (anyone with link) or YouTube (unlisted), then paste
                        the share link. A link or a file is required — one of the two.
                      </p>
                    </div>
                  </div>
                </SectionCard>

                {/* 03 — guardian */}
                <SectionCard id="sec-guardian" num="03" title="PARENT / GUARDIAN" note="👨‍👩‍👧 Required for participants under 18">
                  <div className="space-y-5">
                    <div>
                      <Label req>ARE ANY PARTICIPANTS UNDER 18?</Label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {(
                          [
                            ["under18", "YES — UNDER 18"],
                            ["over18", "NO — ALL 18+"],
                          ] as const
                        ).map(([v, label]) => {
                          const active = form.ageGroup === v;
                          return (
                            <button
                              key={v}
                              type="button"
                              onClick={() => set("ageGroup", v)}
                              aria-pressed={active}
                              className={`border-2 py-3 text-sm font-bold tracking-wide transition-all ${
                                active
                                  ? "border-gold bg-gold text-ink"
                                  : "border-line bg-ink text-parch hover:border-gold hover:text-cream"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      <Err msg={errors.ageGroup} />
                    </div>

                    {needsGuardian && (
                      <div
                        className={`grid gap-5 border-l-4 p-4 sm:grid-cols-2 ${
                          form.ageGroup === "under18" ? "border-ember bg-ink" : "border-line bg-ink/60"
                        }`}
                      >
                        <div>
                          <Label req={form.ageGroup === "under18"}>PARENT / GUARDIAN NAME</Label>
                          <input
                            className={`field ${errors.guardianName ? "has-error" : ""}`}
                            placeholder="Full name"
                            value={form.guardianName}
                            onChange={(e) => set("guardianName", e.target.value)}
                          />
                          <Err msg={errors.guardianName} />
                        </div>
                        <div>
                          <Label req={form.ageGroup === "under18"}>PARENT / GUARDIAN PHONE</Label>
                          <input
                            className={`field ${errors.guardianPhone ? "has-error" : ""}`}
                            placeholder="e.g. 020 987 6543"
                            inputMode="tel"
                            value={form.guardianPhone}
                            onChange={(e) => set("guardianPhone", e.target.value)}
                          />
                          <Err msg={errors.guardianPhone} />
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>

                {/* 04 — declaration */}
                <SectionCard id="sec-declaration" num="04" title="DECLARATION" note="✅ Three ticks and you're done">
                  <div className="space-y-4">
                    {(
                      [
                        ["decl1", "I confirm that all information provided is correct and all participants are eligible SHS students or graduates."],
                        ["decl2", "I have the required parent/guardian consent where applicable."],
                        ["decl3", "I agree to the Official Rules & Terms and consent to the use of my submitted video for the competition and related Prayer Hour publicity."],
                      ] as const
                    ).map(([k, text]) => (
                      <div key={k}>
                        <label className="flex cursor-pointer items-start gap-3.5 border-2 border-line bg-ink p-4 transition-colors hover:border-gold/70">
                          <input
                            type="checkbox"
                            className="check-box mt-0.5"
                            checked={form[k]}
                            onChange={(e) => set(k, e.target.checked)}
                          />
                          <span className="text-[14px] leading-relaxed text-cream/90">{text}</span>
                        </label>
                        <Err msg={errors[k]} />
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* submit */}
                {submitError && (
                  <div className="shake flex items-start gap-3 border-2 border-ember bg-ember/10 p-4 text-sm font-semibold text-ember">
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" className="mt-0.5 flex-none">
                      <path d="M8 1l7 13H1L8 1zm-.9 5h1.8l-.2 4h-1.4l-.2-4zm.9 7.2a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
                    </svg>
                    {submitError}
                  </div>
                )}

                <div className="reveal">
                  <button
                    type="submit"
                    disabled={phase === "uploading"}
                    className={`display relative w-full overflow-hidden border-2 border-ink px-8 py-6 text-2xl transition-all sm:text-3xl ${
                      phase === "uploading"
                        ? "cursor-wait bg-bark text-parch"
                        : "bg-flame text-ink shadow-[8px_8px_0_0_rgba(242,168,29,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0_0_rgba(242,168,29,1)] active:translate-y-0 active:shadow-[4px_4px_0_0_rgba(242,168,29,1)]"
                    }`}
                  >
                    {phase === "uploading" && (
                      <span
                        className="absolute inset-y-0 left-0 bg-gold/30 transition-[width] duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                    <span className="relative flex items-center justify-center gap-3">
                      {phase === "uploading" ? (
                        <>
                          UPLOADING TO DRIVE… {progress}%
                        </>
                      ) : (
                        <>
                          🔥 SUBMIT MY ENTRY
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                            <path d="M4 12h16M13 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                  <p className="mt-3 text-center text-xs text-parch/55">
                    Your video and details are delivered to the Prayer Hour team's Google Drive.
                    Only the screening team can access raw entries.
                  </p>
                </div>
              </form>
            )}

            <div className="mt-10">
              <DriveConnectPanel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
