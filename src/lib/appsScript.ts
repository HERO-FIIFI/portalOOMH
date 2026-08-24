/**
 * Google Drive submission bridge.
 *
 * Videos + entry data are pushed to a Google Apps Script Web App that the
 * Prayer Hour team deploys once (code below). The Web App drops the video
 * file into a Drive folder and appends the entry row to a Google Sheet.
 *
 * If no Web App URL is configured the portal runs in DEMO MODE: the entry is
 * validated, reference-coded and stored locally so the full flow can be
 * previewed without touching Drive.
 */

export const URL_STORAGE_KEY = "ph_apps_script_url";
export const ENTRIES_KEY = "ph_local_entries";

/** The exact script the organisers paste into script.google.com */
export const APPS_SCRIPT_CODE = `/** PRAYER HOUR — Oil On My Head Challenge · Drive intake
 *  1) Create a folder in Google Drive for videos, copy its ID from the URL.
 *  2) Create a Google Sheet for entries, copy its ID from the URL.
 *  3) Paste both IDs below, Deploy → New deployment → Web app
 *     (Execute as: Me · Access: Anyone). Copy the /exec URL into the portal. */

var FOLDER_ID = "PASTE_YOUR_DRIVE_FOLDER_ID";
var SHEET_ID  = "PASTE_YOUR_GOOGLE_SHEET_ID";

function doGet() {
  return json_({ ok: true, service: "prayer-hour-portal" });
}

function doPost(e) {
  try {
    var p = e.parameter;
    var stamp = new Date();
    var safeName = (p.leadName || "entry").replace(/[^a-z0-9]+/gi, "_");
    var videoUrl = p.videoLink || "";

    var fileBlob = e.parameters.videoFile && e.parameters.videoFile[0];
    if (fileBlob) {
      var folder = DriveApp.getFolderById(FOLDER_ID);
      fileBlob.setName(p.refCode + "_" + safeName + ".mp4");
      var file = folder.createFile(fileBlob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      videoUrl = file.getUrl();
    }

    var sheet = SpreadsheetApp.openById(SHEET_ID);
    var row = [
      stamp, p.refCode, p.entryType, p.leadName, p.phone, p.email,
      p.school, p.location, p.form, p.otherNames, p.ageGroup,
      p.guardianName, p.guardianPhone, p.videoLink || "(file attached)", videoUrl
    ];
    sheet.getActiveSheet().appendRow(row);

    return json_({ ok: true, refCode: p.refCode, videoUrl: videoUrl });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export interface EntryPayload {
  refCode: string;
  entryType: string;
  leadName: string;
  phone: string;
  email: string;
  school: string;
  location: string;
  form: string;
  otherNames: string;
  ageGroup: string;
  guardianName: string;
  guardianPhone: string;
  videoLink: string;
  fileName: string;
  fileSizeMB: string;
  duration: string;
}

export interface SubmitResult {
  ok: boolean;
  demo: boolean;
  videoUrl?: string;
  error?: string;
}

export function getAppsScriptUrl(): string {
  try {
    return (window.localStorage.getItem(URL_STORAGE_KEY) ?? "").trim();
  } catch {
    return "";
  }
}

function makeRefCode(): string {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, "0");
  return `OOH-${t}${r}`;
}

export { makeRefCode };

/**
 * POSTs the entry (and optional video file) to the Apps Script Web App.
 * Falls back to a simulated demo submission when no URL is configured.
 */
export function submitEntry(
  payload: EntryPayload,
  file: File | null,
  onProgress: (pct: number) => void,
): Promise<SubmitResult> {
  const url = getAppsScriptUrl();

  if (!url) {
    // ---- demo mode: simulate a network upload ----
    return new Promise((resolve) => {
      let pct = 0;
      const iv = window.setInterval(() => {
        pct = Math.min(100, pct + 6 + Math.random() * 12);
        onProgress(Math.floor(pct));
        if (pct >= 100) {
          window.clearInterval(iv);
          try {
            const prev = JSON.parse(window.localStorage.getItem(ENTRIES_KEY) ?? "[]");
            prev.push({ ...payload, at: new Date().toISOString() });
            window.localStorage.setItem(ENTRIES_KEY, JSON.stringify(prev));
          } catch {
            /* ignore quota */
          }
          window.setTimeout(() => resolve({ ok: true, demo: true }), 350);
        }
      }, 120);
    });
  }

  // ---- live mode: real upload to Google Drive via Apps Script ----
  return new Promise((resolve) => {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("videoFile", file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) onProgress(Math.round((ev.loaded / ev.total) * 96));
    };
    xhr.onload = () => {
      onProgress(100);
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (data.ok) resolve({ ok: true, demo: false, videoUrl: data.videoUrl });
        else resolve({ ok: false, demo: false, error: data.error || "Drive intake rejected the entry." });
      } catch {
        resolve({ ok: false, demo: false, error: "Unexpected response from the intake script." });
      }
    };
    xhr.onerror = () =>
      resolve({ ok: false, demo: false, error: "Network error — check your connection and try again." });
    xhr.send(fd);
  });
}
