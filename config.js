// config.js
// Global Site Configuration for VYRN (lennardpenzler.com)
const CONFIG = {
    // Creator Info & Socials
    CREATOR_NAME: 'Lennard Finn Penzler',
    BRAND_NAME: 'VYRN',
    CONTACT_EMAIL: 'refined.mov@gmail.com',
    YOUTUBE_URL: 'https://www.youtube.com/@VYRNvisuals/',
    BUYMEACOFFEE_URL: 'https://buymeacoffee.com/vyrn',
    GITHUB_URL: 'https://github.com/Dyvorn', // Updated profile link

    // YouTube API & Fallback Data
    YOUTUBE_API_KEY: 'AIzaSyA24XmA6nfPzwCzny2RcB9_WkC4o1o_HKk',
    YOUTUBE_CHANNEL_ID: 'UCGe5VOk80siQe0r2OfQQWPw',
    FALLBACK_SUBSCRIBERS: '51+',
    LATEST_VIDEO: {
        id: '5t1xed1vlO4',
        title: 'HOW TO PUT TEXT BEHIND YOU | Davinci Resolve Tutorial',
        channelTitle: 'VYRN',
        uploadDate: '2024-01-01',
        url: 'https://www.youtube.com/watch?v=5t1xed1vlO4'
    },

    // Discord Community Launch Notification
    DISCORD: {
        status: 'Community Server Coming Soon',
        description: 'Join the waitlist to get early member access when our private DaVinci & creative tech server opens.'
    },

    // Unified Free Backend Endpoint (e.g. deployed Google Apps Script Web App URL from apps-script/Code.gs)
    // Powers BOTH Get in Touch email delivery AND the Discord Launch Waitlist Google Sheets database.
    BACKEND_ENDPOINT: '',

    // Optional separate overrides (only needed if using two different providers, e.g. Formspree / Brevo / Worker)
    CONTACT_ENDPOINT: '',
    WAITLIST_ENDPOINT: '',

    // =========================================================================
    // Modular Project List Template
    // Add your project objects into the PROJECTS array below when ready.
    //
    // Disciplines: 
    //   'video' (Cyan) | 'audio' (Pink) | 'code' (Amber) | 'all' (Tri-Color DIY/Engineering)
    //
    // Status (Optional):
    //   'IN DEVELOPMENT' | 'IN PROGRESS' | 'COMPLETED' | 'COMING SOON'
    //
    // Example Project Schema:
    // {
    //     title: "Your Project Title",
    //     category: "VIDEO VFX // WORKFLOW",
    //     discipline: "video",
    //     status: "IN DEVELOPMENT",
    //     year: "2026",
    //     description: "One or two sentences describing what you built, edited, or created.",
    //     tags: ["DaVinci Resolve", "Fusion", "Preset"],
    //     link: "https://your-link-or-repo.com" // or "#"
    // }
    // =========================================================================
    PROJECTS: [
        // Currently empty. Add project objects here when ready to showcase!
    ]
};

