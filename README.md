# Jyothish — Your celestial archive

An independent, browser-local Vedic astrology application with a Three.js floating parchment Kundli, React/Motion interface, sixteen divisional maps, dasha timelines, report modules, and source-aware chat.

Published at **https://www.rohaniyer.com/jyothish/** from the separate `roronoa2003/jyothish` repository. GitHub Pages inherits the custom domain of the account's user site; this repository does not need a CNAME file.

## Run and build

```sh
npm ci
npm test
npm run build
python3 -m http.server 4173 --directory dist
```

`dist/` contains the deployable app. GitHub Pages publishes the checked-in `docs/` directory on `main`. After a change, build, run checks, copy the contents of `dist/` to `docs/`, commit, and push. The generated offline asset manifest must match the compiled files.

## Chat modes

- **Offline chart reader:** deterministic, bounded chart explanations from computed positions, periods, divisional mappings, and retrieved source summaries. This is not a general language model.
- **On-device AI:** optional Qwen 2.5 1.5B through WebLLM. Requires WebGPU, sufficient GPU memory, and a first download of model files. Inference stays on the device. Models and generated answers can be wrong; inspect the evidence. Browser cache eviction can require a new download.
- **Your ChatGPT account:** manually export the reading pack and attach it in ChatGPT. No OpenAI API key, subscription endpoint automation, or ChatGPT fine-tuning is used.

## Local books and offline use

Import text-based PDF, TXT, or Markdown files that you own or may use. PDF.js extracts text locally. IndexedDB stores imported books on the same browser/device. Imports are limited to the first 500 pages / 1 million text characters per file; scanned PDFs need OCR. Retrieved excerpts preserve page references. Book content is treated as untrusted reference data, not executable instructions. The included library is a set of selected rule summaries, not complete copyrighted translations.

“Prepare for offline use” caches the app. Optional model files are separately downloaded and cached by WebLLM. “Remember birth details” is an opt-in browser-local setting. Uploaded books and birth profiles are never included in this repository or uploaded to a calculation server.

## Calculation and interpretation limits

Astronomy Engine 2.1.19 supplies geocentric positions. Lahiri ayanamsa and the ascendant are approximate. Whole-sign houses are the main reference. The rule library explains its conventions and omitted factors. Dignity is not a total strength score; full Shadbala, exact degree-based aspect strength, yoga cancellations, and historical dasha-commencement synthesis are not implemented. High divisional charts are particularly sensitive to birth-time uncertainty.

Classical texts are an interpretive tradition, not empirical proof. This application does not establish scientifically validated future predictions, diagnose illnesses, calculate death, or guarantee marriage, financial, or other outcomes.

## Sources and software

Classical references link to BPHS chapters 3, 6, 26, 33, 46–48, 51 and 66; modern conventions are labeled separately. User-provided books remain local. Astronomy Engine and Three.js licenses are included in `dist/`; React/Motion, WebLLM and PDF.js notices accompany compiled assets.
