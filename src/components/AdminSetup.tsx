import { useState } from "react";
import { APPS_SCRIPT_CODE, DEFAULT_APPS_SCRIPT_URL } from "../lib/appsScript";

export function AdminSetup() {
  const [copied, setCopied] = useState(false);
  const connected = (() => {
    try {
      const parsed = new URL(DEFAULT_APPS_SCRIPT_URL);
      return parsed.protocol === "https:" &&
        (parsed.hostname === "script.google.com" || parsed.hostname === "script.googleusercontent.com") &&
        parsed.pathname.endsWith("/exec");
    } catch {
      return false;
    }
  })();

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
    <details className="group relative inline-block">
      <summary className="cursor-pointer text-[10px] font-bold tracking-[0.2em] text-parch/50 transition-colors hover:text-gold">ADMIN SETUP</summary>

      <div className="space-y-6 border-t-2 border-line px-5 py-6">
        <p className="border-l-2 border-amber pl-4 text-sm leading-relaxed text-parch/85">
          The public app no longer accepts an Apps Script URL from the browser. Set
          <code className="mx-1 text-gold">VITE_APPS_SCRIPT_URL</code> in Vercel, then redeploy.
          This panel is informational and is not an authentication boundary.
        </p>
        <ol className="grid gap-5 text-sm leading-relaxed text-parch/85 md:grid-cols-3">
          {[
            ["1 - CREATE THE INTAKE", "Create a Google Sheet, open script.google.com, paste the script below, and set the Drive/Sheet IDs."],
            ["2 - DEPLOY AS WEB APP", "Deploy as a Web app, execute as yourself, allow access as required, and copy the /exec URL."],
            ["3 - CONFIGURE VERCEL", "Set VITE_APPS_SCRIPT_URL in Vercel. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY as Apps Script properties."],
          ].map(([title, body]) => (
            <li key={title} className="border-l-2 border-gold pl-4">
              <p className="display text-sm text-gold">{title}</p>
              <p className="mt-1.5">{body}</p>
            </li>
          ))}
        </ol>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-bold tracking-wider text-parch/70">THE INTAKE SCRIPT (COPY - PASTE INTO APPS SCRIPT)</p>
            <button
              type="button"
              onClick={copyCode}
              className={`border px-3 py-1.5 text-[11px] font-bold tracking-wider transition-all ${copied ? "border-moss bg-moss/15 text-moss" : "border-line text-parch hover:border-gold hover:text-gold"}`}
            >
              {copied ? "COPIED" : "COPY CODE"}
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
