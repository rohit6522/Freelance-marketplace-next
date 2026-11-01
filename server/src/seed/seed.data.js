export const PASSWORD = "Password123";
export const EMAIL_DOMAIN = "@gigcraft.test";

/* ----------------------------- PEOPLE ----------------------------- */

export const clients = [
  { key: "apex", name: "Alex Morgan", email: "client@gigcraft.test", companyName: "Apex Cloud Labs", country: "United States", img: 5 },
  { key: "vance", name: "Marcus Vance", email: "vance@gigcraft.test", companyName: "HyperLayer Corp", country: "United States", img: 11 },
  { key: "priya", name: "Priya Sharma", email: "priya@gigcraft.test", companyName: "Nimbus Startups", country: "India", img: 20 },
];

export const freelancers = [
  {
    key: "elena", name: "Elena Rostova", email: "elena@gigcraft.test", country: "Germany", img: 47,
    title: "Senior Product & UI/UX Systems Designer",
    bio: "Specializing in high-conversion SaaS web applications, multi-brand design systems and Figma developer handoffs. 8+ years crafting products used by 4M+ users across enterprise fintech and developer infrastructure.",
    skills: ["Figma", "Design Systems", "UX Research", "Prototyping", "SaaS UI", "Tailwind CSS"],
    languages: [{ name: "German", level: "native" }, { name: "English", level: "fluent" }, { name: "Spanish", level: "conversational" }],
    years: 8, location: "Berlin, Germany", tz: "UTC+1", rate: 55,
  },
  {
    key: "marcus", name: "Marcus Chen", email: "marcus@gigcraft.test", country: "Canada", img: 12,
    title: "Full-Stack Engineer (Next.js and Node.js)",
    bio: "I build fast, accessible web applications with Next.js, Node.js and MongoDB. Seven years shipping production SaaS products for startups and agencies.",
    skills: ["Next.js", "React", "Node.js", "MongoDB", "Tailwind CSS", "REST APIs"],
    languages: [{ name: "English", level: "native" }, { name: "Mandarin", level: "fluent" }],
    years: 7, location: "Toronto, Canada", tz: "UTC-5", rate: 70,
  },
  {
    key: "sarah", name: "Sarah Jenkins", email: "sarah@gigcraft.test", country: "United Kingdom", img: 32,
    title: "Brand Identity and Visual Designer",
    bio: "I help technical startups look as good as they build. Logo systems, typography and brand guidelines that scale across product and marketing.",
    skills: ["Branding", "Logo Design", "Typography", "Illustrator", "Brand Guidelines"],
    languages: [{ name: "English", level: "native" }],
    years: 5, location: "London, United Kingdom", tz: "UTC+0", rate: 45,
  },
  {
    key: "david", name: "David Miller", email: "david@gigcraft.test", country: "United States", img: 15,
    title: "Mobile Product Designer and Flutter Developer",
    bio: "I design intuitive iOS and Android interfaces and turn them into polished cross-platform apps with Flutter.",
    skills: ["Mobile UI", "iOS", "Android", "Flutter", "Figma"],
    languages: [{ name: "English", level: "native" }, { name: "Spanish", level: "conversational" }],
    years: 6, location: "Austin, United States", tz: "UTC-6", rate: 60,
  },
  {
    key: "amina", name: "Amina Al-Mansoor", email: "amina@gigcraft.test", country: "United Arab Emirates", img: 45,
    title: "Technical Writer and SEO Content Strategist",
    bio: "I turn complex engineering topics into clear articles, documentation and search-friendly content that developers actually read.",
    skills: ["Technical Writing", "SEO", "Documentation", "API Docs", "Content Strategy"],
    languages: [{ name: "Arabic", level: "native" }, { name: "English", level: "fluent" }],
    years: 4, location: "Dubai, United Arab Emirates", tz: "UTC+4", rate: 40,
  },
  {
    key: "lucas", name: "Lucas Vance", email: "lucas@gigcraft.test", country: "Netherlands", img: 8,
    title: "3D Artist and Motion Designer",
    bio: "Product renders, 3D animations and interactive web experiences built with Blender and Three.js.",
    skills: ["Blender", "3D Modeling", "Motion Graphics", "Three.js", "Video Editing"],
    languages: [{ name: "Dutch", level: "native" }, { name: "English", level: "fluent" }],
    years: 3, location: "Amsterdam, Netherlands", tz: "UTC+1", rate: 50,
  },
  {
    key: "rohan", name: "Rohan Mehta", email: "rohan@gigcraft.test", country: "India", img: 13,
    title: "Data Scientist and AI Engineer",
    bio: "I build machine learning models, analytics dashboards and LLM-powered tools that turn business data into decisions.",
    skills: ["Python", "Machine Learning", "LLM APIs", "Pandas", "Dashboards"],
    languages: [{ name: "Hindi", level: "native" }, { name: "English", level: "fluent" }],
    years: 2, location: "Pune, India", tz: "UTC+5:30", rate: 35,
  },
];

export const elenaAccreditations = [
  { name: "Master Certified UX Architect and Usability Researcher", issuer: "Nielsen Norman Group", year: 2022, credentialId: "NNG-UX-0512" },
  { name: "Figma Certified Design System Architect", issuer: "Figma", year: 2023, credentialId: "FG-DS-0410" },
];

export const elenaWorkHistory = [
  { title: "Independent Lead Design Architect", company: "Self-Employed", location: "Berlin and Remote", startYear: 2021, current: true, description: "Advising Series A-through-C startups on design systems, information hierarchy and developer integration frameworks." },
  { title: "Staff UI/UX Systems Designer", company: "Zalando SE", location: "Berlin, Germany", startYear: 2018, endYear: 2021, description: "Spearheaded core multi-platform web design guidelines for seller portals used by 12,000+ brand partners." },
  { title: "Senior Product Designer", company: "N26 Bank", location: "Berlin, Germany", startYear: 2016, endYear: 2018, description: "Designed internal fraud detection interfaces and merchant administration tooling." },
];

/* ---------------------------- PORTFOLIO ---------------------------- */

export const portfolio = [
  { owner: "elena", title: "Nexus Global Treasury and FX Execution Engine", category: "Fintech Infra", metric: "+62% onboarding completion", duration: "14 weeks sprint", deliverables: ["Design System V2", "Trader Workstation UI", "Storybook Sync Spec"], description: "Unified web workstation for high-velocity currency traders. Standardized 180+ UI components and removed friction from manual order placement workflows." },
  { owner: "elena", title: "Kubewave Cluster Diagnostics Console", category: "DevTools / Infra", metric: "-65% configuration errors", duration: "8 weeks sprint", deliverables: ["Information Architecture", "Interactive Node Map", "React Component Wireframes"], description: "Autonomous observability and configuration portal for DevOps teams. Streamlined multi-cluster orchestration and telemetry logs into dense, unified dashboards." },
  { owner: "elena", title: "Arcadia Wholesale Logistics Portal", category: "B2B Commerce", metric: "$3.4M transacted in month 1", duration: "6 weeks sprint", deliverables: ["Bulk Ordering UX", "Responsive Mobile Web", "Checkout Funnel Audit"], description: "Architected a rapid checkout and bulk-ordering flow for pan-European agricultural distributors with real-time inventory tracking." },
  { owner: "elena", title: "Sentra Cyber Posture and SOC-2 Command Center", category: "SOC-Ops", metric: "Zero design debt at launch", duration: "10 weeks sprint", deliverables: ["Audit Dashboard", "Design Tokens Library", "Incident Playbook UX"], description: "Complete design foundation for an automated compliance engine that converts complex posture audits into clear remediation task flows." },
  { owner: "marcus", title: "LedgerLoop Invoicing Platform", category: "SaaS", metric: "Lighthouse score 98", duration: "10 weeks sprint", deliverables: ["Next.js App", "REST API", "Stripe-ready checkout"], description: "Full-stack invoicing platform for freelancers with recurring billing, team roles and a fast, accessible dashboard." },
  { owner: "sarah", title: "Orbit DevTools Rebrand", category: "Branding", metric: "+40% trial signups", duration: "5 weeks sprint", deliverables: ["Logo System", "Brand Guidelines", "Social Templates"], description: "Complete visual identity for a developer tools startup, from logo system to documentation theme and launch assets." },
  { owner: "david", title: "FitPulse Companion App", category: "Mobile", metric: "4.8 App Store rating", duration: "12 weeks sprint", deliverables: ["iOS and Android UI", "Flutter Build", "Design Tokens"], description: "Cross-platform fitness companion app with workout tracking, streaks and wearable sync, designed and built end to end." },
  { owner: "lucas", title: "Aether Headphones Product Film", category: "3D Animation", metric: "1.2M launch views", duration: "4 weeks sprint", deliverables: ["3D Models", "Product Animation", "Web Embed"], description: "Photoreal 3D product animation and interactive web viewer for a consumer audio launch." },
];

/* ------------------------------ GIGS ------------------------------ */

export const gigData = [
  { key: "saas", owner: "elena", cat: "Graphics & Design", title: "I will design a conversion-focused SaaS dashboard and responsive web app in Figma", tags: ["Figma", "SaaS", "UI/UX"], prices: [120, 280, 550], days: [3, 5, 10], perks: ["Source Figma file", "Responsive breakpoints", "Clickable prototype"], desc: "Enterprise-grade, conversion-first product design for SaaS dashboards and web applications, built explicitly for engineering handoff with auto-layout components and tokens." },
  { key: "ds", owner: "elena", cat: "Graphics & Design", title: "I will build a scalable Figma design system with developer-ready tokens", tags: ["Figma", "Design System", "Tokens"], prices: [200, 450, 900], days: [5, 10, 21], perks: ["Component library", "Design tokens JSON", "Usage documentation"], desc: "A complete design system with variables, tokens and documented components that your frontend team can map directly into Tailwind or CSS." },
  { key: "landing", owner: "elena", cat: "Graphics & Design", title: "I will design a high-converting landing page for your startup", tags: ["Landing Page", "Figma", "Conversion"], prices: [90, 180, 340], days: [2, 4, 7], perks: ["Desktop and mobile layouts", "Copy structure guidance", "Source Figma file"], desc: "A focused landing page design built around a single conversion goal, with clear messaging hierarchy, social proof and mobile-first layouts." },
  { key: "nextjs", owner: "marcus", cat: "Web Development", title: "I will build full-stack responsive web applications using Next.js and Tailwind", tags: ["React", "Next.js", "Frontend"], prices: [350, 800, 1600], days: [7, 14, 25], perks: ["Responsive Next.js app", "API integration", "Deployment setup"], desc: "Production-ready Next.js applications with clean component architecture, server-side rendering, authentication and a deployed, documented codebase." },
  { key: "api", owner: "marcus", cat: "Programming & Technology", title: "I will build a secure REST API with Node.js, Express and MongoDB", tags: ["Node.js", "Express", "MongoDB"], prices: [150, 350, 700], days: [4, 8, 14], perks: ["REST endpoints", "JWT authentication", "API documentation"], desc: "A well-structured REST API with validation, authentication, role-based access, error handling and documentation, ready for your frontend to consume." },
  { key: "bugfix", owner: "marcus", cat: "Web Development", title: "I will fix bugs and optimize the performance of your React application", tags: ["React", "Performance", "Debugging"], prices: [60, 140, 300], days: [1, 3, 6], perks: ["Bug fixes", "Performance audit", "Code review notes"], desc: "Fast, careful debugging and performance tuning for React apps, including bundle analysis, rendering fixes and a written summary of every change." },
  { key: "brand", owner: "sarah", cat: "Graphics & Design", title: "I will craft modern brand identity guidelines and logo systems", tags: ["Branding", "Vector", "Identity"], prices: [120, 260, 500], days: [4, 7, 12], perks: ["Logo and variations", "Color and type system", "Brand guidelines PDF"], desc: "A modern, flexible brand identity with a logo system, typography, color palette and guidelines so every touchpoint stays consistent." },
  { key: "social", owner: "sarah", cat: "Digital Marketing", title: "I will create a social media content kit with consistent brand templates", tags: ["Social Media", "Templates", "Canva"], prices: [70, 150, 320], days: [2, 4, 7], perks: ["10 post templates", "Story templates", "Editable source files"], desc: "A ready-to-use social media kit with editable templates that match your brand, so your team can publish quickly and stay consistent." },
  { key: "mobile", owner: "david", cat: "Graphics & Design", title: "I will design intuitive mobile app UI for iOS and Android", tags: ["Mobile", "iOS", "Flutter"], prices: [220, 480, 950], days: [5, 10, 18], perks: ["Mobile screens", "Interactive prototype", "Developer handoff"], desc: "Clean, platform-aware mobile interface design with a clickable prototype and developer-ready specs for both iOS and Android." },
  { key: "flutter", owner: "david", cat: "Programming & Technology", title: "I will develop a cross-platform Flutter app from your Figma design", tags: ["Flutter", "Dart", "Mobile"], prices: [400, 900, 1800], days: [10, 21, 35], perks: ["Flutter source code", "State management", "Store-ready build"], desc: "I turn your Figma design into a polished Flutter app for iOS and Android, with clean architecture, state management and a store-ready build." },
  { key: "techwrite", owner: "amina", cat: "Writing & Translation", title: "I will write SEO-optimized technical blog posts and articles", tags: ["Tech Writing", "SEO", "Articles"], prices: [85, 190, 420], days: [2, 4, 8], perks: ["Keyword research", "Original article", "On-page SEO"], desc: "Clear, well-researched technical articles written for developers and optimized for search, with keyword research and on-page SEO included." },
  { key: "docs", owner: "amina", cat: "Writing & Translation", title: "I will write clear developer documentation and API guides", tags: ["Documentation", "API", "Markdown"], prices: [120, 280, 600], days: [3, 7, 14], perks: ["Getting started guide", "API reference", "Code examples"], desc: "Developer documentation that people actually use: quick-start guides, API references and code samples, delivered in Markdown or your docs platform." },
  { key: "seoaudit", owner: "amina", cat: "Digital Marketing", title: "I will run a technical SEO audit with an actionable fix list", tags: ["SEO", "Audit", "Analytics"], prices: [100, 240, 480], days: [3, 5, 9], perks: ["Technical crawl report", "Prioritized fix list", "Keyword opportunities"], desc: "A thorough technical SEO audit covering crawlability, speed, structure and content gaps, with a prioritized list of fixes your team can act on." },
  { key: "animation3d", owner: "lucas", cat: "Video & Animation", title: "I will create 3D product animations and interactive web experiences", tags: ["3D", "Blender", "Motion"], prices: [450, 950, 1900], days: [5, 10, 18], perks: ["3D model and render", "Product animation", "Web-ready export"], desc: "Photorealistic 3D product models, animations and interactive web viewers that make your product stand out on launch day." },
  { key: "video", owner: "lucas", cat: "Video & Animation", title: "I will edit and produce a polished product demo video", tags: ["Video Editing", "Demo", "Motion Graphics"], prices: [150, 320, 640], days: [3, 6, 10], perks: ["Edited demo video", "Motion graphics", "Captions and music"], desc: "A crisp product demo video with clean editing, motion graphics, captions and music, formatted for your website and social channels." },
  { key: "ml", owner: "rohan", cat: "Data & AI", title: "I will build a machine learning model and dashboard for your business data", tags: ["Python", "ML", "Dashboards"], prices: [180, 420, 900], days: [5, 10, 20], perks: ["Data cleaning", "Trained model", "Interactive dashboard"], desc: "From messy data to a working predictive model and a simple dashboard, with a clear write-up of the approach, accuracy and next steps." },
  { key: "chatbot", owner: "rohan", cat: "Data & AI", title: "I will build a custom AI chatbot for your website using LLM APIs", tags: ["AI", "Chatbot", "LLM"], prices: [150, 380, 800], days: [4, 8, 15], perks: ["Chat widget", "Knowledge base setup", "Deployment guide"], desc: "A custom AI chatbot trained on your own content, embedded on your website, with safe responses, conversation logging and a deployment guide." },
  { key: "bizplan", owner: "rohan", cat: "Business", title: "I will write a clear business plan and financial model for your startup", tags: ["Business Plan", "Finance", "Startup"], prices: [130, 300, 650], days: [4, 8, 14], perks: ["Business plan document", "Financial projections", "Investor summary"], desc: "A clear, investor-friendly business plan with market analysis, financial projections and a one-page summary tailored to your startup." },
];

export const gigFaqs = [
  { question: "Do you work with confidential projects?", answer: "Yes. I am happy to sign an NDA and keep all project files and information private." },
  { question: "What do you need from me to start?", answer: "Share your requirements, brand assets and any reference links when you place the order, and I will confirm the plan before starting." },
];

/* ------------------------------ ORDERS ------------------------------ */

export const reviewComments = [
  "Excellent work, delivered ahead of schedule with clean, well-organised files.",
  "Clear communication throughout and the result matched our brief exactly.",
  "Very professional. Great attention to detail and quick turnaround on feedback.",
  "Exceeded expectations. We will definitely hire again for our next project.",
  "Solid quality and fair pricing. Everything was documented and easy to hand off.",
  "Responsive, reliable and genuinely skilled. Highly recommended for serious projects.",
];
export const reviewCommentFour = "Good result overall. A couple of small revisions were needed but handled quickly.";

const done = (client, gig, tier, daysAgo, rating, revision = false) => ({
  client, gig, tier, state: "completed", daysAgo, rating, revision,
});

// Elena: 11 completed orders, 9 reviewed (Top Rated). Apex ke do orders jaan-boojhkar review-pending hain.
const elenaClients = ["apex", "vance", "priya"];
const elenaGigs = ["saas", "ds", "landing"];
const elenaTiers = ["basic", "standard", "premium"];
const elenaOrders = Array.from({ length: 11 }, (_, i) => {
  const client = elenaClients[i % 3];
  const skipReview = client === "apex" && i >= 6;
  return done(
    client,
    elenaGigs[(i + Math.floor(i / 3)) % 3],
    elenaTiers[i % 3],
    150 - i * 13,
    skipReview ? null : i === 4 ? 4 : 5,
    i === 3
  );
});

export const completedOrders = [
  ...elenaOrders,
  done("vance", "nextjs", "basic", 120, 5),
  done("apex", "api", "standard", 100, 5, true),
  done("priya", "bugfix", "premium", 80, 5),
  done("vance", "nextjs", "standard", 60, 4),
  done("apex", "api", "basic", 40, 5),
  done("priya", "nextjs", "premium", 25, 5),
  done("priya", "brand", "basic", 90, 5),
  done("vance", "brand", "standard", 50, 4),
  done("apex", "social", "premium", 15, 5),
  done("vance", "mobile", "standard", 70, 5),
  done("priya", "flutter", "basic", 30, 4),
  done("apex", "techwrite", "standard", 45, 5),
  done("vance", "animation3d", "basic", 35, 5),
];

// state: progress (milestones = kitne milestones complete aur release), delivered, pending, cancelled
export const activeOrders = [
  { client: "apex", gig: "saas", tier: "standard", state: "progress", milestones: 2, daysAgo: 5 },
  { client: "vance", gig: "nextjs", tier: "basic", state: "delivered", daysAgo: 3 },
  { client: "priya", gig: "mobile", tier: "standard", state: "progress", milestones: 1, daysAgo: 4 },
  { client: "apex", gig: "brand", tier: "basic", state: "delivered", daysAgo: 2 },
  { client: "apex", gig: "ml", tier: "standard", state: "pending", daysAgo: 1 },
  { client: "vance", gig: "techwrite", tier: "basic", state: "cancelled", daysAgo: 20 },
  { client: "priya", gig: "animation3d", tier: "basic", state: "progress", milestones: 0, daysAgo: 2 },
  { client: "priya", gig: "landing", tier: "basic", state: "pending", daysAgo: 0 },
];

export const savedGigsForApex = ["saas", "nextjs", "brand", "mobile", "techwrite"];