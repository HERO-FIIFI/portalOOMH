import { supabase } from "./supabase";
import { getAnonymousAccessToken } from "./supabaseUpload";
import type { EntryPayload } from "./appsScript";

export async function recordSubmission(payload: EntryPayload, videoPath?: string) {
  const accessToken = await getAnonymousAccessToken();
  const { data, error } = await supabase.functions.invoke<{ ok: boolean; id: string }>("record-submission", {
    body: {
      ...payload,
      videoPath: videoPath || null,
      videoLink: videoPath ? "" : payload.videoLink,
    },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error || !data?.ok) {
    throw new Error("Could not save the submission details securely.");
  }

  return data.id;
}
