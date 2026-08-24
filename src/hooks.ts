import { useCallback, useEffect, useRef, useState } from "react";

/** Adds `.is-in` to `.reveal` elements when they enter the viewport. */
export function useRevealObserver() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const GLYPHS = "OILNHEAD▲◆✦#%&@";

/** Scramble-decode effect for display headlines. */
export function useScramble(text: string, startDelay = 150) {
  const [out, setOut] = useState(text);
  const frame = useRef(0);

  useEffect(() => {
    let raf = 0;
    let started = false;
    const total = 26;
    const timeout = window.setTimeout(() => {
      started = true;
      const tick = () => {
        frame.current += 1;
        const progress = frame.current / total;
        const settled = Math.floor(progress * text.length);
        let next = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (ch === " " || i < settled) next += ch;
          else next += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setOut(next);
        if (frame.current < total) raf = requestAnimationFrame(tick);
        else setOut(text);
      };
      raf = requestAnimationFrame(tick);
    }, startDelay);
    return () => {
      window.clearTimeout(timeout);
      if (started) cancelAnimationFrame(raf);
    };
  }, [text, startDelay]);

  return out;
}

/** localStorage-backed string state. */
export function useLocalStorage(key: string, initial = "") {
  const [value, setValue] = useState<string>(() => {
    try {
      return window.localStorage.getItem(key) ?? initial;
    } catch {
      return initial;
    }
  });
  const set = useCallback(
    (v: string) => {
      setValue(v);
      try {
        window.localStorage.setItem(key, v);
      } catch {
        /* private mode — ignore */
      }
    },
    [key],
  );
  return [value, set] as const;
}
