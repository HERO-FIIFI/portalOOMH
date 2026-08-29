export const CARRD_URL = "https://prayerhour.carrd.co";

export const SOCIALS = [
  { id: "tiktok", label: "TikTok — @PrayerHour", url: "https://www.tiktok.com/@prayerhour" },
  { id: "instagram", label: "Instagram Reels — @PrayerHour", url: "https://www.instagram.com/prayerhour" },
  { id: "youtube", label: "YouTube — Prayer Hour", url: "https://www.youtube.com/@PrayerHour" },
  { id: "whatsapp", label: "WhatsApp Community", url: "https://chat.whatsapp.com/PrayerHourOilOnMyHead" },
  { id: "telegram", label: "Telegram Channel", url: "https://t.me/prayerhour" },
] as const;
export type SocialId = (typeof SOCIALS)[number]["id"];

export const HASHTAG = "#OilOnMyHeadChallenge";

export const SHARE_TEXT =
  "I just entered the Prayer Hour 'Oil On My Head' Challenge! 🚀🔥 Watch out for the Top 16! #OilOnMyHeadChallenge #PrayerHour";

export const STAGES = [
  {
    n: 1,
    title: "Submissions Open",
    status: "ACTIVE NOW",
    note: "The portal is live — entries are flowing straight into the Prayer Hour Drive.",
    active: true,
  },
  {
    n: 2,
    title: "Screening & Top 16",
    status: "UP NEXT",
    note: "The team screens every entry and selects the Top 16 Finalists.",
    active: false,
  },
  {
    n: 3,
    title: "Team School Visits",
    status: "SOON",
    note: "Prayer Hour visits each finalist at their school for a feature moment.",
    active: false,
  },
  {
    n: 4,
    title: "Public Voting & Winner",
    status: "FINAL STAGE",
    note: "Videos go live for public voting — then the winner is announced.",
    active: false,
  },
];

export const REGIONS = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra",
  "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West",
  "Volta", "Western", "Western North",
];

export const VIDEO_RULES = [
  "Maximum 2 minutes",
  "Must use Eben's “Oil On My Head” soundtrack",
  "Individual, duo, or group entries accepted",
  "All participants must be SHS students or graduates",
  "Clear audio and video",
  "Appropriate for public viewing",
];

export const PIPELINE = [
  {
    n: "01",
    title: "Submit your entry",
    body: "Upload a 2-minute performance video using the official soundtrack through this portal. It lands straight in the Prayer Hour Google Drive.",
  },
  {
    n: "02",
    title: "Screening → Top 16",
    body: "The Prayer Hour Team screens every entry and selects the Top 16 Finalists based on talent, creativity and sound.",
  },
  {
    n: "03",
    title: "We visit your school",
    body: "The team visits each finalist at their SHS for a feature moment before the world sees your video.",
  },
  {
    n: "04",
    title: "Public voting",
    body: "Selected videos are released for public voting. The oil is on your head — let your talent speak.",
  },
];

export const FAQ = [
  {
    q: "Who can enter?",
    a: "Any SHS student (SHS 1, 2 or 3) or graduate — as an individual, a duo, or a group. Everyone in the video must be an SHS student or graduate.",
  },
  {
    q: "Which soundtrack do I use?",
    a: "Only Eben's “Oil On My Head”. Performances using any other sound will be disqualified during screening.",
  },
  {
    q: "How long can my video be?",
    a: "Maximum 2 minutes (120 seconds). The portal checks your video's length before it lets you submit — anything longer will be rejected.",
  },
  {
    q: "My video file is too big. What now?",
    a: "Upload it to your own Google Drive or YouTube (unlisted) and paste the share link in the submission form instead of attaching the file.",
  },
  {
    q: "Do I need a parent or guardian?",
    a: "Yes, if any participant is under 18 — a parent/guardian name and phone number are required, plus their consent.",
  },
];
