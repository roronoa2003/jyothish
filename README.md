# Jyotish

A private Vedic astrology workspace with an interactive parchment Kundli, sixteen divisional charts, five-level Vimshottari timing, local conversation and Python-generated life-report PDFs. The original star logo is retained.

[Download](https://www.rohaniyer.com/jyothish/) · [Releases](https://github.com/roronoa2003/jyothish/releases) · [Textbook rule audit](TEXTBOOK_VALIDATION.md)

## Install

**Mac:** download Apple Silicon or Intel ZIP, extract, and move Jyotish.app into Applications. Version 1.1.2 restores the original Atlas interface inside a SwiftUI/WebKit host, retaining native storage and inference and requires macOS 13.3+. It is ad-hoc signed, **not Apple-notarized**. Apple may block first launch; review the source/release and use the specific Privacy & Security approval only if you trust it. Apple Silicon was exercised locally; Intel execution remains unverified on Intel hardware.

**Windows 10/11 x64:** extract the entire portable ZIP and open Jyotish.exe. Keep its supporting files together. This build is unsigned; Windows execution and GPU compatibility remain unverified on Windows hardware. Python is included.

There is no automatic app updater. Close the previous app and replace it with the new download. Export your profile library first. Existing chart-library.json profiles remain local. Mac book imports from the former Electron version use a different browser store; reimport your owned books into the SwiftUI version. Retain the old application's data until migration is checked.

## Start

1. Enter birth date, time, location and historical IANA timezone. Listed cities fill coordinates; custom locations need both coordinates for a Lagna chart. Missing coordinates use the Moon as reference. An explicit UTC offset handles ambiguous daylight-saving times.
2. Choose the dasha year convention. Existing profiles default to 365.25636 days; solar 365.2425 and the textbook's savana 360 are available. This choice changes period boundaries, not planetary positions.
3. Save a profile, explore the chart atlas or timing studio, and ask a specific question. Dates such as “18th Oct” are preserved. Research questions combine D10 work and D24 education rather than unrelated relationship advice.
4. Generate a life book with charts, ruler chains, combinations, dasha tables, monthly readings and source/method notes. PDFs are saved locally and can be exported.
5. Track a conversation forecast by defining a concrete outcome and its direction before saving. Later record what happened, including misses. The journal retains dated snapshots separately from observations and excludes retrospective entries and abstentions from scored results.

## Local AI

Desktop inference uses **Qwen3.5 9B Q4_K_M** through a pinned official llama.cpp runtime. The 5.68 GB model downloads once and is SHA-256 verified. It is not embedded in the app download. Allow substantial free RAM/disk space; 16 GB or more is recommended, with speed depending on hardware. Native GPU fitting can fall back to CPU. No API key or ChatGPT account automation is required.

The smaller 4B candidate did not meet the same chart-reasoning checks, so it was not selected merely for speed. This release does not claim equivalent capability to every DeepSeek model. Native sample answers on the test Mac took roughly tens of seconds; complex answers, reloads and repairs can take longer.

The model receives the question, recent questions, calculated facts, relevant charts, dated windows and retrieved source passages. Typed evidence IDs keep calculations separate from generated explanation. Unknown questions are not silently replaced with a career/romance horoscope. Invalid chart claims or incomplete generation produce a visible retry error, rather than a canned substitute. The model can still make interpretive mistakes; it cannot answer every possible question reliably.

Imported searchable PDFs/text remain local and are retrieved at answer time. **Importing a book does not train the model.** The app bundles selected paraphrases and references, not copyrighted full books.

## Storage

- Mac: `~/Library/Application Support/Jyotish/`
- Windows: `%APPDATA%\\Jyotish\\`

Profiles: chart-library.json. Conversations, readings and report PDFs: their respective subfolders. Forecast snapshots: prediction-journal.json. Models: models/. Imported books use local browser storage. These files are not encrypted by the app; device access permits access to them. No profile sync or telemetry is implemented. Model downloads use public hosts; local inference does not transmit birth charts. New downloads contain no saved personal profiles or model caches.

## Calculation and interpretation

Astronomy Engine 2.1.19 computes positions, with approximate Lahiri ayanamsa, mean nodes, approximate sidereal ascendant and whole-sign houses. This is not Swiss Ephemeris or a claim to use a NASA prediction algorithm. Coordinates supported: 65°S–65°N. D2 uses Sun/Moon Hora; D30 unequal portions; D60 the declared degree mapping. Base Ashtakavarga retains SAV 337; shodhana is not implemented.

Timing subdivides the complete initial Vimshottari period before clipping the birth balance. Intervals are half-open and nested endpoints are preserved. Daily/weekly reading boundaries use UTC. High vargas are flagged where a hypothetical ±5-minute experiment changes their ascendants; that experiment is not rectification.

The Lessons Volume I lens adds declared Sun/Moon reference charts, kaaresha, badhaka reference houses and D10 livelihood links. Conditional dasha eligibility is reported separately from calculated active periods. Standalone Dwisaptati and Narayana phase functions are calculation-tested but are not yet a complete annual event-prediction engine. [The lesson coverage register](desktop/evaluation/lessons-coverage.json) records the incomplete coverage and source conflicts.

The Rao textbook lens adds primary co-lord selection, arudha exceptions, rasi drishti, argala/obstruction pairs and structural kendra–trikona links. It is labeled separately from visible-planet classical ownership. Specific publication/family patterns are limited generalizations of worked examples, not universal necessary rules. Source inconsistencies and conventions are documented in the audit.

Selected BPHS, Phaladeepika and Saravali summaries contribute proportional timing, sign dignity, connections and directional planetary relations. Curated Lal Kitab practices use the disclosed D1 house-matching convention; they do not constitute a complete Lal Kitab engine. Full Shadbala, all yoga/cancellation rules, rectification and calibrated event probabilities are not implemented. Symbolic practices are optional, with no promise to alter outcomes.

Software tests and retrospective source examples establish calculation/interpretation consistency, **not real-world predictive accuracy**. Astrology is not a scientifically validated forecasting method. No claim of “most accurate” is made; future observations would be needed to assess any event forecasts.

## Build

Node.js 22+, Python 3.12+, and macOS Command Line Tools for Swift builds:

```sh
npm ci
npm run build
npm test
cd desktop
npm ci
python3 prepare-runtimes.py
node fetch-native-runtimes.mjs
npm test
cd ..
node --test swiftui/test/startup.test.mjs
node swiftui/build.mjs
node swiftui/build.mjs --intel
node desktop/package.mjs --windows
```

Mac builds use a SwiftUI host with the Atlas interface; Windows remains Electron. Official native inference runtimes and CPython dependencies are pinned; weights download at runtime. Inspect desktop/THIRD_PARTY_NOTICES.md. Use JYOTISH_NATIVE_OUTPUT for Mac output, JYOTHISH_OUTPUT for Windows ZIP output, and JYOTISH_TEST_DATA for isolated SwiftUI QA data. Never bundle private app-data folders.

The docs/ download page belongs to this separate repository and does not change the portfolio repository. Developer ID/notarization still requires the maintainer's Apple enrollment and credentials; an ad-hoc signature does not remove Gatekeeper verification warnings.
