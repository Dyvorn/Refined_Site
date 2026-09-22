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

    // YouTube API & Fallback Data (Privacy-first: avoids unconsented client-side tracking)
    YOUTUBE_API_KEY: '', // Optional: Keep empty to use rock-solid privacy-first static data
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

    // Contact Form Endpoint (Optional: e.g. 'https://formspree.io/f/your_id' or left empty for direct mail client)
    CONTACT_ENDPOINT: '',

    // Modular Project List (Active Development Showcase)
    // Disciplines: 'audio' (Pink), 'video' (Cyan), 'code' (Amber), 'all' (Tri-Color: Physical DIY / Engineering)
    PROJECTS: [
        {
            title: "DaVinci Resolve Fusion Macro Suite",
            category: "VIDEO VFX // WORKFLOW",
            discipline: "video",
            status: "IN DEVELOPMENT",
            year: "2026",
            description: "High-efficiency 3D motion graphic templates, automatic Magic Mask compositing nodes, and kinetic text tools.",
            tags: ["Fusion VFX", "DaVinci Resolve", "Presets"],
            link: "#video"
        },
        {
            title: "Modular Synthesis & Spatial Audio Lab",
            category: "AUDIO ENGINEERING",
            discipline: "audio",
            status: "IN DEVELOPMENT",
            year: "2026",
            description: "Custom atmospheric sound design beds, cinematic sub-bass impacts, and spatial audio mastering experiments.",
            tags: ["Sound Design", "Synthesizers", "Mastering"],
            link: "#"
        },
        {
            title: "Creative Technologist Script Engine",
            category: "CREATIVE CODE",
            discipline: "code",
            status: "IN DEVELOPMENT",
            year: "2026",
            description: "Lightweight automation utilities, WebGL real-time distortion shaders, and video metadata extraction tools.",
            tags: ["GLSL Shaders", "JavaScript", "Automation"],
            link: "#"
        },
        {
            title: "Tactile Studio Console & Hardware Rig",
            category: "DIY // ENGINEERING",
            discipline: "all",
            status: "IN PROGRESS",
            year: "2026",
            description: "Custom macro controller hardware build with motorized faders and physical dials tailored for video timeline cutting.",
            tags: ["Hardware DIY", "Microcontrollers", "Ergonomics"],
            link: "#"
        }
    ]
};

