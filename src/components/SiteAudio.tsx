import { useEffect, useRef, useState } from "react";

/**
 * Plays the official challenge song on load. Most browsers block unmuted
 * autoplay until the visitor interacts with the page, so this starts muted,
 * attempts an unmuted play immediately, and — if that's blocked — unmutes
 * and plays on the first click/keydown/touch anywhere on the page.
 */
export function SiteAudio() {
  const ref = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = ref.current;
    if (!audio) return;

    audio.play().catch(() => {
      // autoplay blocked — wait for the first user gesture, then retry
      setMuted(true);
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
    });
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
      <audio ref={ref} src="/audio/oil-on-my-head-remix.m4a" loop autoPlay playsInline />
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
