# Loan Calculator

A fast, accessible loan calculator web app built with React, Vite and Mantine. Calculates payments, generates an amortization schedule, and supports CSV / PDF export.

Badges
- Build: Vite / GitHub Actions (add your CI badge)
- License: (add LICENSE file if applicable)
- Issues: (link to repo issues)

Quick links
- Project folder: loan-calc
- Dev server: npm run dev
- Production build: npm run build
- Deploy (Cloudflare Pages): npm run deploy:staging / npm run deploy:production

Table of contents
- Features
- Tech stack
- Getting started
- Usage
- Project structure
- Scripts
- Tests
- Deployment
- Contributing
- License & contact

Features
- Monthly payment calculation using standard amortization formula
- Amortization schedule with per-period breakdown (principal, interest, balance)
- CSV export (PapaParse)
- PDF export (jsPDF + autotable)
- Modern UI with Mantine components and accessibility in mind
- Optional data persistence via Supabase client (supabase-js)
- Mobile responsive; configured for Cloudflare Pages deployment

Tech stack (from package.json)
- Framework: React 18 + Vite
- UI: @mantine/core, @mantine/form, @mantine/hooks, @mantine/notifications
- Icons: @tabler/icons-react
- Exports: jspdf, jspdf-autotable, papaparse
- Backend client: @supabase/supabase-js (optional)
- Formatting / linting: Prettier, ESLint
- Tests: Vitest + Testing Library
- Styling: Tailwind CSS + PostCSS
- Deploy: wrangler (Cloudflare Pages)

Prerequisites
- Node.js 18+ (recommend LTS)
- npm 8+ (or yarn)
- If you plan to use Cloudflare Pages: Cloudflare account and wrangler configured (api token)

Repository layout
(Primary app is in the loan-calc folder)
loan-calculator/
├─ loan-calc/
│  ├─ src/                # React source code (components, pages, utils)
│  ├─ public/             # Static assets
│  ├─ index.html
│  └─ package.json
├─ README.md
└─ (other repo-level files)

Getting started (local)

1. Clone the repository and open the app folder:
   git clone https://github.com/narzian/loan-calculator.git
   cd loan-calculator/loan-calc

2. Install dependencies:
   npm install
   # or
   # yarn

3. Start the dev server:
   npm run dev
   # open http://localhost:5173 (Vite default) or the port printed in console

4. Build for production:
   npm run build

5. Preview production build locally:
   npm run preview

Available npm scripts (from loan-calc/package.json)
- npm run dev — start Vite dev server
- npm run build — production build (vite build)
- npm run preview — preview the production build locally
- npm run lint — run ESLint checks
- npm run lint:fix — run ESLint and auto-fix
- npm run format — format files with Prettier
- npm run format:check — check formatting
- npm run test — run Vitest
- npm run test:run — run Vitest in single-run mode
- npm run test:coverage — run Vitest with coverage
- npm run dev:pages — wrangler pages dev (dev environment for Cloudflare Pages)
- npm run dev:full — build + wrangler pages dev (useful for Pages environment)
- npm run deploy:staging — build + wrangler pages publish (staging)
- npm run deploy:production — build + wrangler pages publish --env=production

Notes about deployment
- The project includes wrangler scripts to publish to Cloudflare Pages. Ensure you have Wrangler installed and logged in:
  npm install -g wrangler
  wrangler login
- The dev:pages script runs a local Pages development server using the dist output.
- You may need to set project name and environment values in wrangler.toml (if present) or as arguments to wrangler pages publish.

Important implementation notes
- Core calculation logic follows the amortization formula:
  payment = P * r / (1 - (1 + r)^-n)
  where r is the periodic rate and n is total number of payments.
- Exports:
  - CSV uses papaParse (papaparse) to generate data client-side.
  - PDF uses jsPDF with jspdf-autotable for tabular amortization export.

Tests
- Unit tests and component tests use Vitest and Testing Library.
- Run tests:
  npm run test
- Run coverage:
  npm run test:coverage

Environment & configuration
- There is a Supabase client dependency included. If the app uses Supabase, set your keys as environment variables (or in a .env):
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
- Tailwind and PostCSS are configured as devDependencies — check tailwind.config.js and postcss.config.js in the loan-calc folder if you customize styles.

Suggestions & next steps I can help with
- Add a LICENSE file (MIT recommended) and badge
- Add CI actions (GitHub Actions) for lint/test/build
- Add screenshots and a short demo GIF to docs/
- Commit this README to the repo (I can create a PR for you)

Contact / Maintainer
- Repository owner: narzian (https://github.com/narzian)