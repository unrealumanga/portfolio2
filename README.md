# Portfolio 2

An independent, editorial redesign of Hethusha Umanga’s experiential design portfolio.

## Local preview

```bash
npm run serve
```

Open `http://localhost:4173`.

## Verification

```bash
npm install
npm run check
npm test
```

The automated checks verify content/image integrity, desktop and mobile interactions, and detectable accessibility issues.

## Structure

- `index.html` — semantic page structure and portfolio copy
- `assets/css/style.css` — responsive design system and layout
- `assets/js/data.js` — preserved project order and gallery data
- `assets/js/app.js` — project rendering, dialog galleries, navigation, and motion
- `img/` — independent copy of the curated portfolio imagery

The project is intentionally framework-free so it can deploy directly to GitHub Pages.
