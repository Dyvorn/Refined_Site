// config.js
// IMPORTANT: Replace 'YOUR_YOUTUBE_API_KEY' with your actual API key.
// SECURITY WARNING: Your YouTube API Key is exposed to the frontend.
// You MUST restrict this API Key by HTTP Referrers in the Google Cloud Console
// to prevent unauthorized use on other domains.
const CONFIG = {
    YOUTUBE_API_KEY: 'AIzaSyA24XmA6nfPzwCzny2RcB9_WkC4o1o_HKk',
    YOUTUBE_CHANNEL_ID: 'UCGe5VOk80siQe0r2OfQQWPw',
    YOUTUBE_URL: 'https://www.youtube.com/@VYRNvisuals/',
    BUYMEACOFFEE_URL: 'https://buymeacoffee.com/vyrn',

    // Modular Project List (Edit, add, or remove projects here)
    // Disciplines: 'audio' (Pink), 'video' (Cyan), 'code' (Amber), 'all' (Pink + Cyan + Amber: Physical DIY / Engineering)
    PROJECTS: [
        {
            title: "[PROJECT TITLE 01]",
            category: "AUDIO",
            discipline: "audio",
            year: "[2026]",
            description: "[Brief one-sentence description or summary of the audio production project.]",
            link: "#"
        },
        {
            title: "[PROJECT TITLE 02]",
            category: "VIDEO",
            discipline: "video",
            year: "[2026]",
            description: "[Brief one-sentence description or summary of the video production or tutorial project.]",
            link: "#"
        },
        {
            title: "[PROJECT TITLE 03]",
            category: "CODE",
            discipline: "code",
            year: "[2026]",
            description: "[Brief one-sentence description or summary of the creative software or script tool.]",
            link: "#"
        },
        {
            title: "[PROJECT TITLE 04]",
            category: "DIY // ENGINEERING",
            discipline: "all",
            year: "[2026]",
            description: "[Brief one-sentence description or summary of the physical build / hardware engineering project.]",
            link: "#"
        }
    ]
};
