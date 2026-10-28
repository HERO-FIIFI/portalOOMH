import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import { supabase, supabaseKey, supabaseUrl, SUPABASE_BUCKET } from "./supabase";

const CHUNK_SIZE = 6 * 1024 * 1024;


async function getAnonymousAccessToken() {
  const current = await supabase.auth.getSession();
  if (current.data.session?.access_token) return current.data.session.access_token;

  const signedIn = await supabase.auth.signInAnonymously();
  if (signedIn.error || !signedIn.data.session?.access_token) {
    throw new Error(
      "Secure upload is temporarily unavailable. Please try again shortly or use the video link option.",
    );
  }
  return signedIn.data.session.access_token;
}

export async function uploadVideoToSupabase(
  file: File,
  refCode: string,
  onProgress: (pct: number) => void,
) {
  const accessToken = await getAnonymousAccessToken();
  const { data: signedUpload, error: signedUploadError } = await supabase.functions.invoke<{
    path: string;
    token: string;
  }>("create-upload-url", {
    body: { refCode, fileName: file.name },
  });

  if (signedUploadError || !signedUpload?.path || !signedUpload.token) {
    throw new Error("Could not prepare the secure video upload.");
  }

  const objectName = signedUpload.path;
  const endpoint = `${supabaseUrl.replace(/\.supabase\.co$/, ".storage.supabase.co")}/storage/v1/upload/resumable`;
  const uppy = new Uppy({ autoProceed: false, allowMultipleUploadBatches: false });

  uppy.use(Tus, {
    endpoint,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    headers: {
      authorization: `Bearer ${accessToken}`,
      apikey: supabaseKey,
      "x-signature": signedUpload.token,
    },
    uploadDataDuringCreation: true,
    removeFingerprintOnSuccess: true,
    chunkSize: CHUNK_SIZE,
    allowedMetaFields: ["bucketName", "objectName", "contentType", "cacheControl", "metadata"],
  });

  uppy.addFile({
    name: file.name,
    type: file.type || "video/mp4",
    data: file,
    meta: {
      bucketName: SUPABASE_BUCKET,
      objectName,
      contentType: file.type || "video/mp4",
      cacheControl: "3600",
      metadata: JSON.stringify({ refCode }),
    },
  });

  const progressHandler = (_file: unknown, progress: { bytesUploaded: number; bytesTotal: number | null }) => {
    if (progress.bytesTotal) onProgress(Math.round((progress.bytesUploaded / progress.bytesTotal) * 96));
  };
  uppy.on("upload-progress", progressHandler);

  try {
    const result = await uppy.upload();
    const failed = result?.failed ?? [];
    const successful = result?.successful ?? [];
    if (failed.length > 0 || successful.length !== 1) {
      throw new Error(failed[0]?.error || "The video upload failed.");
    }
    onProgress(96);
    return objectName;
  } finally {
    uppy.off("upload-progress", progressHandler);
    uppy.destroy();
  }
}
