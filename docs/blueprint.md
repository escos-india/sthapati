# **App Name**: SthapatiApp Landing

## Core Features:

- Global Layout: Implements the global setup with React, TypeScript, Tailwind CSS, Framer Motion for frontend and Node.js, Express, TypeScript, PostgreSQL, Prisma ORM for backend, including tooling like ESLint, Prettier, Jest, Docker, and CI/CD.
- Header & Navigation: A sticky header with a large, left-aligned logo (the attached image of Sthapati logo), primary navigation links, a profile dropdown, and a hamburger menu for mobile devices.
- Hero Section with Search: A full-width, auto-rotating slideshow with a centered search input overlay that includes a live auto-suggest dropdown with search results and a prominent CTA button.
- AI-Powered Search Suggestions: The LLM is used as a tool, powering the live search suggestions in the hero section by analyzing the input and identifying relevant results from people, posts and blogs.
- Community Updates Carousel: A horizontally scrollable carousel displaying dummy post cards themed to architecture, including a thumbnail image, title, excerpt, author, and date. Users can interact with the elements through hover effects to reveal the “Read More” button.
- Interactive Animations: Interactive page animations using Framer Motion, triggered on scroll, hover, and focus events, including skeleton loaders and staggered animations for carousel items.
- Backend API for Search and Community Updates: Backend REST API using Node.js and Prisma to handle search queries and community updates, including data seeding and error handling.

## Style Guidelines:

- Primary color: Light beige (#F5F5DC) to provide a warm, architectural feel.
- Background color: Off-white (#FAFAFA), complementing the beige to give a clean, spacious environment.
- Accent color: Earthy brown (#A0522D) used for call to actions and important interactive elements. The goal is to create contrast without disrupting the warmth created through other colors.
- Headline font: 'Playfair' (serif) for an elegant, high-end feel; body font: 'PT Sans' (sans-serif) for readability in longer texts. The pairing is optimized for balancing elegance and legibility.
- Use line icons to maintain a minimal, clean look. Icons should represent key functionalities (search, navigation) using a thin stroke weight and a neutral color that adjusts on hover to the accent color.
- Employ a responsive grid layout for scalability across various devices (mobile, tablet, desktop). Use consistent padding and margins to provide visual harmony and enhance readability.
- Incorporate subtle, scroll-triggered animations to fade in and slide up page sections. Animations for buttons and cards (scale and shadow on hover) enhance interactivity.