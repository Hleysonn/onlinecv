# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server
npm run build     # type-check then bundle (vue-tsc -b && vite build)
npm run preview   # preview the production build
```

No test suite exists in this project.

## Architecture

Single-page Vue 3 app (TypeScript, Vite, Tailwind CSS v4) with two routes:

- `/` → `src/pages/CVPage.vue` — the public CV display with PDF export
- `/admin` → `src/pages/AdminPage.vue` — a tabbed editor for all CV sections

### State

All CV data lives in `src/stores/cvStore.ts` as a single `reactive<CVData>` object (`cvStore`). This is **not** a Pinia store — it's a plain reactive object exported directly. Data is loaded from `localStorage` on startup (merged with `defaultData` to handle newly added fields) and auto-saved via a deep `watch`. The `resetToDefault` and `generateId` helpers are also exported from this file.

`CVData` contains: `person`, `about`, `experiences`, `educations`, `skillGroups`, `softSkills`, `languages`, `projects`.

### Admin access

`CVPage` listens for keyboard input globally and SHA-256-hashes typed sequences. When the hash matches `SECRET_HASH`, it sets `sessionStorage.adminUnlocked = 'true'` and reveals the admin buttons. The `/admin` route has no server-side guard — access control is purely client-side via `sessionStorage`.

### PDF export

`CVPage` exports two PDF variants both via dynamic `import('jspdf')`:
- `handlePrintAts` — styled two-column PDF with dark sidebar
- `handleDownloadAts` — plain ATS-friendly single-column PDF

### CSS

Global utilities (`.card`, `.chip`, `.chip-dark`, `.section-title`) are defined in `src/style.css` alongside an extensive `@media print` block that overrides the visual layout for browser printing.

### Skill group colors

Valid `SkillGroup.color` values used in template class-binding: `amber`, `blue`, `emerald`, `purple`, `slate`, `red`.

### Instruction pour claude
- Tiens-toi strictement à ce que je demande, rien de plus.
- Respecte ma demande littéralement. Ne fais aucune supposition.
- Ne propose pas d'étapes, de suggestions ou d'améliorations non sollicitées.
- Ne crée, ne modifie, ne renomme, ne supprime aucun fichier, document, artifact, canvas ou partie du projet sans demande explicite.
- Pas de récap ni de conclusion.
- Pas de disclaimer ("N'hésite pas si besoin", "Je peux aussi...", etc.).
- Réponds avec le minimum de mots nécessaire.
- Si la réponse tient en 3 phrases, ne fais pas 3 paragraphes.
- Si je réponds uniquement "oui", "ok", "continue" ou "vas-y", exécute simplement la suite.
- En cas d'ambiguïté, pose une seule question.

## Priorité

En cas de conflit entre ces règles, respecte toujours la demande de l'utilisateur de la manière la plus littérale possible.
