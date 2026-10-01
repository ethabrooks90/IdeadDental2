# Idea Dental — website redesign

A dark, premium redesign of the Idea Dental site (Houston, TX), built with
React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion and three.js.
All copy, services, hours and contact details come from the practice's live
site; the layout, motion and visual design are new.

## Sections

Hero (video) · About · What we offer (scroll-scrubbed walkthrough) · Tooth
explorer (interactive 3D molar) · Technology · Doctors · Before & after ·
Reviews · Insurance · FAQ · Contact · Footer.

## Develop

```bash
npm ci
npm run dev
```

Then open http://localhost:5173/IdeaDental/.

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages
(`.github/workflows/deploy.yml`). The base path follows the repository name
automatically. In the repo's **Settings → Pages**, set **Source** to
**GitHub Actions** once.

## Content updates

Hours, prices, services, doctors, reviews and FAQ answers all live in
`src/data/content.ts`. Hours and prices were last updated from the practice
on 2026-10-01.

## Pending before launch

- **Contact form**: there's no backend yet, so a request becomes a
  ready-to-send text message to the office. Set `FORM_ENDPOINT` in
  `src/site/Contact.tsx` to a form service URL (e.g. Formspree) to send
  requests directly.
- **FAQ and Tooth explorer wording**: to be confirmed by the practice.

## Credits

3D tooth model: “Maxillary First Molar with Two Root Canals” by University
of Dundee, School of Dentistry, licensed CC BY 4.0
(`public/models/molar-license.txt`).
