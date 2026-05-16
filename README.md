# CareerFit CV Optimizer

Static frontend app to help any professional user convert a CV into a cleaner format, compare it with a job description using ATS-oriented heuristics, and estimate a negotiation-oriented salary range.

The project is designed to run directly in the browser and to be deployable on **GitHub Pages** without backend, build process or server-side storage.

---

## What the app does

CareerFit CV Optimizer has three main modules:

1. **Convert CV format**
   - Upload PDF, DOCX, TXT, MD or JSON.
   - Paste CV text manually.
   - Extract and normalize text.
   - Parse structured CV fields.
   - Edit fields manually.
   - Choose among 10 CV formats using visual cards.
   - Export the final CV to PDF or DOCX.

2. **ATS recommendation**
   - Paste or upload a job description.
   - Use free-text target role instead of a closed role checklist.
   - Select sector, seniority, target country and CV language.
   - Calculate a compatibility score.
   - Show found keywords, missing keywords, incomplete sections, risks and improvement recommendations.
   - Generate an optional AI prompt for external review.

3. **Salary calculator**
   - Estimate red/orange/green negotiation bands.
   - Use baseline markets for common countries.
   - Use assisted mode for any country by entering a local salary range seen in comparable offers.
   - Adjust using role family, seniority, experience, work mode, company type, sector and CV signals.

---

## Main CV formats

The UI shows the 10 formats as selectable cards:

1. Reverse chronological / Cronológico inverso.
2. Hybrid / Mixto.
3. Simple ATS / ATS simple.
4. Technical projects / Técnico por proyectos.
5. UK/Ireland international / Internacional UK-Irlanda.
6. Academic / Académico.
7. Europass.
8. Executive / Ejecutivo.
9. Functional skills-based / Funcional por competencias.
10. Visual / creative / Visual creativo.

Each card receives a suitability label:

- **Green**: recommended.
- **Orange**: possible depending on the case.
- **Red**: not recommended or high risk.

The recommendation engine considers target country, sector, seniority, projects, technical skills, certifications, academic orientation and creative/marketing context.

---

## Parsing improvements

The parser was rebuilt to reduce the common PDF problem where text is extracted as one long line.

Implemented changes:

- PDF extraction uses `pdf.js` and `getTextContent()`.
- Text items are grouped using coordinates:
  - sort by Y coordinate and then X coordinate;
  - group close Y positions into lines;
  - preserve spaces using X gaps;
  - add blank lines when vertical gaps are large.
- Text normalization repairs common PDF artefacts:
  - broken emails;
  - broken URLs and slugs such as `juliog - a.github.io` → `juliog-a.github.io`;
  - common split technical keywords such as `SI EM` → `SIEM`;
  - bullet variants;
  - Unicode dashes;
  - repeated spaces and line breaks.
- Section segmentation uses heading positions instead of copying fallback text into all sections.
- If a section is not detected confidently, it remains empty and appears in the UI as **No detectado**.
- Each field has a confidence state: `high`, `medium`, `low` or `missing`.
- A manual mode allows users to complete sections or place unstructured text into one single section without duplicating the whole CV.

Important limitation: PDF parsing is still heuristic. Highly visual CVs with multiple columns, icons, tables or unusual typography can require manual correction.

---

## ATS analysis logic

The default mode is local and heuristic. It does not call an AI model.

The score uses:

- structured CV completeness;
- keyword overlap between CV and job description;
- sector keyword libraries;
- job-description token extraction;
- metrics detection;
- professional links;
- missing sections;
- ATS risks such as excessive length or personal data for international markets.

The app can generate an optional prompt for an external AI reviewer, but no API key is hardcoded and no external call is made unless explicitly implemented/configured by the user.

---

## Salary calculator logic

The salary calculator is an orientation tool, not a salary database.

It works in two modes:

### 1. Baseline mode

For supported markets, the app uses internal approximate anchor ranges by country and role family. These anchors are adjusted by:

- seniority;
- years of experience;
- sector;
- company type;
- work mode;
- negotiation strategy;
- profile signals such as tools, certifications, languages, metrics and links.

### 2. Assisted mode

For unsupported markets or more specific contexts, the user enters a local salary range seen in real offers. The app turns that input into:

- **Red**: below market / weak negotiation zone.
- **Orange**: reasonable range.
- **Green**: recommended negotiation target.

All salary outputs include the warning that the estimate is indicative and should be checked against local salary sources.

---

## Demo mode

The **Cargar ejemplo** button rotates through varied examples:

1. Junior SOC Analyst.
2. Junior Process Engineer.
3. Junior Data Analyst.
4. Junior Marketing / Communications profile.
5. Junior Project Manager / Consulting profile.

Each demo includes:

- CV text;
- job description;
- sector;
- country;
- seniority;
- approximate local salary reference.

---

## Privacy

- CV parsing runs locally in the browser.
- GitHub Pages deployment has no backend.
- No CV is stored server-side by this project.
- No API key is hardcoded.
- API key fields are temporary browser inputs and are not saved to localStorage, sessionStorage or cookies.
- If a user connects an external AI provider in a future version, the CV/job text may be sent to that provider.

---

## How to run locally

### Option 1: open directly

Open `index.html` in a modern browser.

### Option 2: local server

Recommended for testing file handling and CDN libraries:

```bash
cd careerfit-cv-optimizer
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

---

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Upload all files in the project folder to the repository root.
3. Go to **Settings → Pages**.
4. Choose:
   - Source: `Deploy from a branch`;
   - Branch: `main`;
   - Folder: `/root`.
5. Save and wait for GitHub Pages to publish.

No build step is required.

---

## Technologies

- HTML5.
- CSS3.
- Vanilla JavaScript.
- `pdf.js` for PDF text extraction.
- `mammoth.js` for DOCX text extraction.
- `jsPDF` for PDF export.
- `docx.js` for DOCX export.
- `FileSaver.js` for browser downloads.

---

## Project structure

```text
careerfit-cv-optimizer/
  index.html
  assets/
    styles.css
    app.js
    parser.js
    analyzer.js
    salary.js
    formatter.js
    exporter.js
    i18n.js
    templates.js
    sample-cv.txt
    sample-job-description.txt
  README.md
  LICENSE
  .gitignore
  .nojekyll
```

---

## Known limitations

- PDF parsing is robust for common text-based PDFs, but not perfect for visual CVs, scanned documents or complex multi-column layouts.
- There is no OCR. Scanned PDFs need manual text extraction first.
- ATS score is heuristic and should be treated as guidance, not as a real ATS vendor score.
- Salary ranges are approximate and intentionally conservative.
- External AI is not required for the app to work.
- The generated PDF/DOCX is clean and ATS-friendly, but not a full professional desktop publishing engine.

---

## Portfolio value

This project demonstrates:

- browser-side document parsing;
- PDF/DOCX/TXT ingestion;
- coordinate-based PDF line reconstruction;
- structured CV extraction with confidence levels;
- UX simplification from a long wizard to a three-module SaaS-style interface;
- ATS-oriented keyword analysis;
- CV format recommendation logic;
- PDF and DOCX export;
- heuristic salary estimation;
- privacy-aware static frontend design;
- basic internationalization;
- GitHub Pages deployment readiness.

Suggested portfolio sentence:

> Built CareerFit CV Optimizer, a privacy-aware static web app that parses CVs, recommends ATS-friendly formats, compares resumes with job descriptions and generates PDF/DOCX outputs with a heuristic salary negotiation estimator.
