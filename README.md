# Client Service Coordinator Portfolio — Maria Zha-Zha Cornillez Bio

A portfolio website and application kit for a Client Service Coordinator role. It includes 12 interactive demos and downloadable work samples: Excel, PowerPoint, Word/PDF, and n8n automation files.

> **Independent portfolio demonstration.** All client data is fictional. The site is not affiliated with or endorsed by Ameriprise Financial or any other company. The demos save only to the visitor's own browser (localStorage). They send nothing, email no one, and connect to no real system.

---

## What's inside

| Area | Where |
|---|---|
| 10 site pages (Home, About, Experience, Skills, Projects, Process Improvement, Samples, Resume, Education, Contact) plus the Application Kit page | `src/app/` |
| 12 interactive demos (CRM, onboarding, service requests, calendar, communications, documents, Excel reporting, presentation, post-meeting, dashboard, SOPs, automation) | `src/demos/` |
| Your text (name, summary, experience, contact links) | `src/data/profile.ts` |
| Headshot setting | `src/data/photo.ts` |
| Ready-made downloads (XLSX, PPTX, DOCX, PDF, JSON, ZIP) | `public/downloads/` |
| Script that rebuilds every download file | `scripts/generate-assets.mjs` |

### Downloads included

- **Application documents:** ATS resume, cover letter, one-page profile, skills matrix, project summary, interview guide, references template, and 30-60-90 day plan, each as DOCX and PDF
- **Excel:** a 9-sheet admin reporting workbook with live formulas and charts
- **PowerPoint:** a 12-slide client meeting deck
- **SOPs:** 10 procedures, each as DOCX and PDF
- **n8n:** 7 importable workflow templates (`.json`)
- **Sample data:** JSON and CSV
- **ZIP bundles** for each group, plus `Complete-Work-Samples.zip`

---

## Before you publish: personalize it

Anything in **[square brackets]** is a placeholder for a fact only you know. Replace each one with your real information. Never guess.

1. **Fill in `src/data/profile.ts`:**
   - Contact: `[your.email@example.com]`, `[+63 9XX XXX XXXX]`, `[linkedin.com/in/your-profile]`, `[your-portfolio.vercel.app]` (use your Vercel link once it's live)
   - Government role: `[Position Title]`, `[Government Agency / Office Name]`, `[Start Year]`–`[End Year or Present]`
   - Call center role: `[Customer Service Representative]`, `[Call Center / BPO Company Name]`, years; keep or delete `[and email/chat]`; check the metrics marked `[edit to match your actual metrics]`
   - Online teaching role: `[Online Teacher / Tutor]`, `[Online Teaching Platform or Company Name]`, years
   - Education: each `[University Name]` and `[Year]`
2. **Fill in `src/data/documents.ts`:** cover letter `[Date]`, `[your-portfolio-url]`, your availability (two places), and the references template (leave its blanks if you'd rather fill them in Word).
3. **Your photo** is at `public/images/headshot.jpg`. To change it, replace that file with a new portrait photo (about 800 × 1000 px) using the same name.
4. **Rebuild the downloads.** Run `npm run generate` so the resume, cover letter and other documents pick up your edits.
5. **Search for leftovers.** In VS Code, press Ctrl+Shift+F and search for `[` inside `src/data` to make sure nothing is missed.

---

## Run it on your computer

You need [Node.js](https://nodejs.org) 18.18 or newer (20 LTS recommended).

```powershell
npm install
```

```powershell
npm run dev
```

Then open http://localhost:3000.

To test the production version:

```powershell
npm run build
```

```powershell
npm start
```

---

## Publish it free on Vercel

### Option A: through GitHub (recommended, updates automatically)

1. Create a free account at [github.com](https://github.com), then create a new **empty** repository (for example `client-service-portfolio`).
2. Upload this folder. On the repository page, click **"uploading an existing file"** and drag in everything **except** the `node_modules` and `.next` folders. Or, if you use Git:
   ```powershell
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/client-service-portfolio.git
   git push -u origin main
   ```
3. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account.
4. Click **Add New → Project**, choose your repository, and click **Import**.
5. Vercel detects **Next.js** automatically. Keep the default settings (build command `next build`, no environment variables needed) and click **Deploy**.
6. After about 1–2 minutes you get a link like `https://client-service-portfolio.vercel.app`. Put that link on your resume and in your application.

From then on, each change you push to GitHub redeploys the site automatically.

### Option B: from your computer with the Vercel CLI

```powershell
npm install -g vercel
```

```powershell
vercel
```

Answer the prompts (log in, accept the detected Next.js settings). Then publish to your live link:

```powershell
vercel --prod
```

### Custom domain (optional)

In Vercel, open your project → **Settings → Domains** → add a domain you own and follow the DNS steps it shows.

---

## Project scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the local development server |
| `npm run build` | Creates the production build |
| `npm start` | Serves the production build |
| `npm run generate` | Rebuilds every file in `public/downloads/` |

## Tech

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Recharts, ExcelJS, PptxGenJS, docx, PDFKit, lucide-react icons. All pages are generated as static files, so the site needs no database or server code.

## Troubleshooting

- **Build fails with `node:fs` / `node:https` errors:** `next.config.mjs` already handles these for the PowerPoint demo. Keep that file when you copy the project.
- **"JavaScript heap out of memory" while building:** close other programs, or run the build with more memory:
  ```powershell
  $env:NODE_OPTIONS="--max-old-space-size=4096"; npm run build
  ```
- **Demo data looks stale:** demos save edits in the browser. Use each demo's reset button, or clear the site's data in your browser.
