import { uploadVideoToSupabase } from "./supabaseUpload";

/**
 * Google Drive submission bridge.
 *
 * Videos + entry data are pushed to a Google Apps Script Web App that the
 * Prayer Hour team deploys once (code below). The Web App drops the video
 * file into a Drive folder and appends the entry row to a Google Sheet.
 */

export const URL_STORAGE_KEY = "ph_apps_script_url";

/** Deployed Web App URL. Organisers can still override it from the panel. */
export const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbycgRszjvO1gF8jkM35HemFqPet1PBVTLN0Q5ayq7cokizv1bs8VEyj45GtKvNaQgI/exec";

/** Simple passkey protecting the organisers panel. Change it freely here. */
export const ORGANISER_PASSKEY = "prayerhour";
export const UNLOCK_KEY = "ph_org_unlocked";

/** The exact script the organisers paste into script.google.com */
export const APPS_SCRIPT_CODE = `/** PRAYER HOUR — Oil On My Head Challenge · Drive intake
 *  1) Create a folder in Google Drive for videos, copy its ID from the URL.
 *  2) Create a Google Sheet for entries, copy its ID from the URL.
 *  3) Paste both IDs below, Deploy → New deployment → Web app
 *     (Execute as: Me · Access: Anyone). Copy the /exec URL into the portal.
 *  4) In Project Settings - Script properties, add SUPABASE_URL and
 *     SUPABASE_SERVICE_ROLE_KEY so uploaded videos get a signed Sheet link.
 *  5) Each participant gets an automatic confirmation email (MailApp). */

var FOLDER_ID = "1y6KRCp7HWC0LkioCp2xMMCdtlPtyurRE";
var SHEET_ID  = "1aNjy3jsHhFRer3pS_ubVgugwwM22C9dVTWVJ3b7VOPE";
var RETENTION_DAYS = 365;
var SUPABASE_BUCKET = "challenge-videos";
var SIGNED_URL_TTL_SECONDS = 7 * 24 * 60 * 60;

function createSupabaseSignedUrl_(objectPath) {
  var properties = PropertiesService.getScriptProperties();
  var supabaseUrl = (properties.getProperty("SUPABASE_URL") || "").replace(/\/$/, "");
  var serviceRoleKey = properties.getProperty("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!supabaseUrl || !serviceRoleKey || !objectPath) return "";

  var encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
  var response = UrlFetchApp.fetch(
    supabaseUrl + "/storage/v1/object/sign/" + encodeURIComponent(SUPABASE_BUCKET) + "/" + encodedPath,
    {
      method: "post",
      contentType: "application/json",
      headers: {
        apikey: serviceRoleKey,
        Authorization: "Bearer " + serviceRoleKey
      },
      payload: JSON.stringify({ expiresIn: SIGNED_URL_TTL_SECONDS }),
      muteHttpExceptions: true
    }
  );
  if (response.getResponseCode() >= 300) return "";

  var body = JSON.parse(response.getContentText() || "{}");
  return body.signedURL ? supabaseUrl + "/storage/v1" + body.signedURL : "";
}

function escapeHtml_(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function purgeOldData() {
  var cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  var folder = DriveApp.getFolderById(FOLDER_ID);
  var files = folder.getFiles();
  while (files.hasNext()) {
    var file = files.next();
    if (file.getDateCreated() < cutoff) file.setTrashed(true);
  }

  var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();
  for (var row = sheet.getLastRow(); row >= 2; row--) {
    var createdAt = sheet.getRange(row, 1).getValue();
    if (createdAt instanceof Date && createdAt < cutoff) sheet.deleteRow(row);
  }
}

function doGet() {
  return json_({ ok: true, service: "prayer-hour-portal" });
}

function doPost(e) {
  try {
    var p = e.parameter;
    var stamp = new Date();
    var safeName = (p.leadName || "entry").replace(/[^a-z0-9]+/gi, "_");
    var videoUrl = p.videoLink || "";
    var supabasePath = "";

    if (videoUrl.indexOf("supabase://") === 0) {
      supabasePath = videoUrl.slice("supabase://".length);
      videoUrl = createSupabaseSignedUrl_(supabasePath);
    }

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
      p.guardianName, p.guardianPhone, p.videoLink || "(file attached)", videoUrl || supabasePath
    ];
    sheet.getActiveSheet().appendRow(row);

    /* Confirmation email to the participant (fails silently — never blocks the entry). */
    try {
      if (p.email) {
        var emailLeadName = escapeHtml_(p.leadName || "champion");
        var emailGuardianName = escapeHtml_(p.guardianName || "");
        var emailGuardianPhone = escapeHtml_(p.guardianPhone || "");
        var emailRefCode = escapeHtml_(p.refCode || "");
        var guardianLine = (p.ageGroup === "Under 18")
          ? "<p>Parent/guardian on file: <b>" + emailGuardianName + "</b> · " + emailGuardianPhone +
            " — the team may call this number to confirm consent.</p>"
          : "";
        MailApp.sendEmail({
          to: p.email,
          name: "Prayer Hour",
          subject: "Entry received — Oil On My Head Challenge (" + p.refCode + ")",
          htmlBody:
            "<div style='font-family:Arial,sans-serif;color:#222'>" +
            "<h2 style='color:#c97f0a'>The oil is on your head! 🔥</h2>" +
            "<p>Hi <b>" + emailLeadName + "</b>,</p>" +
            "<p>Your <b>Oil On My Head Challenge</b> entry has been received. Thank you!</p>" +
            "<p>Reference code: <b>" + emailRefCode + "</b> — quote it in any enquiry.</p>" +
            guardianLine +
            "<p>All entries are screened and the <b>Top 16 Finalists</b> will be contacted on the phone/WhatsApp number you provided before the team's school visits and public voting.</p>" +
            "<p>— The Prayer Hour Team</p>" +
            "</div>"
        });
      }
    } catch (mailErr) { /* keep the submission successful even if email fails */ }

    return json_({ ok: true, refCode: p.refCode, videoUrl: videoUrl });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

 * Run purgeOldData manually or create a daily Apps Script time trigger for it.
 */
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
  videoUrl?: string;
  error?: string;
}

export function getAppsScriptUrl(): string {
  try {
    return (window.localStorage.getItem(URL_STORAGE_KEY) ?? DEFAULT_APPS_SCRIPT_URL).trim();
  } catch {
    return DEFAULT_APPS_SCRIPT_URL;
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
 */
export async function submitEntry(
  payload: EntryPayload,
  file: File | null,
  onProgress: (pct: number) => void,
): Promise<SubmitResult> {
  const url = getAppsScriptUrl();
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => fd.append(k, v));

  try {
    if (file) {
      const objectName = await uploadVideoToSupabase(file, payload.refCode, onProgress);
      fd.set("videoLink", `supabase://${objectName}`);
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The video upload failed." };
  }

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) onProgress(file ? 96 + Math.round((ev.loaded / ev.total) * 4) : Math.round((ev.loaded / ev.total) * 100));
    };
    xhr.onload = () => {
      onProgress(100);
      try {
        const data = JSON.parse(xhr.responseText || "{}");
        if (data.ok) {
          resolve({
            ok: true,
            videoUrl: typeof data.videoUrl === "string" && data.videoUrl.startsWith("http") ? data.videoUrl : undefined,
          });
        } else {
          resolve({ ok: false, error: data.error || "Drive intake rejected the entry." });
        }
      } catch {
        resolve({ ok: false, error: "Unexpected response from the intake script." });
      }
    };
    xhr.onerror = () => resolve({ ok: false, error: "Network error — check your connection and try again." });
    xhr.send(fd);
  });
}