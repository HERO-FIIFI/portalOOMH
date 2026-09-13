import { useEffect, useRef, useState } from "react";

/**
 * Plays the official challenge song on load. Browsers block audio with
 * sound until the visitor interacts with the page (click/tap/key) — no way
 * around that. So this starts muted (which autoplay is always allowed to
 * do) and unmutes on the very first interaction anywhere on the page.
 */
export function SiteAudio() {
  const ref = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;

    audio.muted = true;
    audio.play().catch(() => {});

    const unlock = () => {
      audio.muted = false;
      setMuted(false);
      audio.play().catch(() => {});
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const toggle = () => {
    const audio = ref.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
    if (!audio.muted) audio.play().catch(() => {});
  };

  return (
    <>
      <audio ref={ref} src="/audio/oil-on-my-head-remix.m4a" loop autoPlay muted playsInline />
      <button
        type="button"
        onClick={toggle}
        aria-label={muted ? "Unmute site music" : "Mute site music"}
        className="fixed bottom-4 right-4 z-50 grid h-11 w-11 place-items-center border-2 border-gold bg-ink/90 text-gold shadow-lg backdrop-blur transition-colors hover:bg-gold hover:text-ink"
      >
        {muted ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
            <path d="M16 8l5 8M21 8l-5 8" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12" />
          </svg>
        )}
      </button>
    </>
  );
}
