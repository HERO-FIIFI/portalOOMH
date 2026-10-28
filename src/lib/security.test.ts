import { describe, expect, it } from "vitest";
import { isAcceptedVideoLink } from "./security";

describe("isAcceptedVideoLink", () => {
  it("accepts secure Drive and YouTube links", () => {
    expect(isAcceptedVideoLink("https://drive.google.com/file/d/abc/view")).toBe(true);
    expect(isAcceptedVideoLink("https://youtu.be/abc123")).toBe(true);
  });

  it("rejects insecure, unrelated, and lookalike hosts", () => {
    expect(isAcceptedVideoLink("http://drive.google.com/file/d/abc/view")).toBe(false);
    expect(isAcceptedVideoLink("https://example.com/video.mp4")).toBe(false);
    expect(isAcceptedVideoLink("https://youtube.com.evil.example/video")).toBe(false);
  });
});