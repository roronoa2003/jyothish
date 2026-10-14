# Textbook rule and validation audit — 1.1.0

Primary study source: P. V. R. Narasimha Rao, *Vedic Astrology: An Integrated Approach*, supplied 515-page PDF, SHA-256 `1cafa828f34764ed5e85816882df2e8f0bc014c5c57ccdb27169416e117fd4db`. Page references below are PDF pages. The edition includes a later note about refinements. This audit covers selected sections; it does not claim the complete book has been implemented or that the model has been trained on it.

| Concept | Pages | Implementation / verification |
|---|---|---|
| Subject-specific vargas and references | 74, 181–182, 226 | D10 work, D24 education, D9 relationships, D7 family; recomputed houses and primary rulers inside the chosen division |
| Arudha calculation and exceptions | 98–100 | All twelve padas reproduce Example 29 |
| Rasi drishti | 114–115 | Movable/fixed exclusions and dual-sign aspects; symmetry checked separately from graha aspects |
| Argala and virodhargala | 116–119 | Paired count results, secondary pairs, Ketu reversal; ties stay unresolved; blocked intervention does not cancel independent pairs |
| Structural kendra–trikona connections | 146–147 | Selected conjunction, mutual graha aspect and exchange links; degree strength/cancellation not invented |
| Primary co-lord selection | 214–215 | Position, companions, specified rasi associations, exaltation, modality, then declared arudha degree convention; nodes count backwards |
| Special lagnas | 57–59 | Pure sunrise-based formulas verified against numeric examples; not a complete production special-lagna interpretation engine |
| Vimshottari | 223–226 | Complete initial period subdivision; selectable 360/365.2425/365.25636-day years |
| Worked examples | 228–230 | D10 publishing preconditions and D7 family activation; both reported family months reproduce the three period lords using savana years |
| Coarse varga/transit comparison | 332–337 | Example 105/106 contact calculations tested. This is the author's research proposal; not an independently established event trigger |

## Source disagreements retained

The book chooses 360-day savana years while noting that many practitioners use solar years. Existing profiles retain the previous sidereal convention unless changed. Example 50's minute-rounded lunar longitude does not reproduce its approximate timestamp exactly; the calculation test permits a two-day rounding tolerance and discloses it.

A passage lists Mars's own-sign division in Leo while the adjacent table lists Aries. The implementation retains Aries and does not copy that apparent textual error. Node dignity and co-lord conventions are explicitly Rao-specific. A primary ruler, an occupant and a subperiod lord remain different roles.

## What the examples establish

The family and publishing predicates were derived from those same author-selected examples. They are regression checks of a source convention, not independent predictions. The author's outcome/identity is omitted from model prompts, but rules were developed with knowledge of the examples and the model may have seen the book during pretraining. Major-period publication support is broad; it does not predict a specific publication day. Several correlated chart lenses are not independent statistical confirmations.

Native model evaluation records raw responses, elapsed time, input hashes, attempted repairs and failures in an isolated QA directory. Early runs confused primary ownership, optional argala ties and simultaneously active dasha roles. They are retained as failures. The revised pipeline computes activation tags and constrains their output; passing these checks demonstrates grounded explanation under constraints, not unconstrained discovery or accuracy on future events.

## Prospective checking

The local forecast journal stores the concrete event, direction, date windows, answer and creation time before appending subsequent observations. Scoring excludes hindsight entries and abstentions and retains missing observations and misses. Hashes detect modified snapshots within this workflow; they are not cryptographic timestamp attestations. Self-reporting, selected questions, correlated events and broad windows limit inference. No measured real-world accuracy or calibrated event probability is available for this release.

## Release checks

The current source passed 17 core tests, 48 desktop tests and the application-entrypoint check. The latest constrained Qwen3.5 9B evaluation passed four selected cases on their first attempts (approximately 25–29 seconds per case); see desktop/evaluation/latest-validation.json. Prior failed responses are retained in the isolated development records. Apple Silicon SwiftUI checks exercised profile restoration, native conversation, Python PDF generation and forecast-journal snapshot persistence. Intel and Windows binaries were built and checked, but runtime execution on those platforms remains unverified.


## Lessons on Vedic Astrology, Volume I — incremental audit

Source: PVR Narasimha Rao, student-compiled lessons 1–45, 2005. The supplied PDF has 122 physical pages; printed pages occur two per PDF page. SHA-256: `5a838bab779923d5f0f1da22a72541f090fc2346a168b4e14355fac1f66db6f6`. Full source text is not distributed. All 45 lessons have been inventoried; close reading, implementation and model evaluation remain incomplete. See the paraphrased [coverage register](desktop/evaluation/lessons-coverage.json).

Ten added tests check reference charts, purushartha groups, badhaka rules, eight/seven karaka conventions, conditional dasha eligibility, answer folding, the Lesson 8 D10 placements and amsa labels, the Lesson 17 Mars/Venus ranking, Bhoga, Lesson 33 period thirds, derived family references and independently sourced Dwisaptati timing. Passing these checks does not establish prediction accuracy.

The Lesson 42 marriage quiz is **not passed**. Dwisaptati reproduces the reported April 1994 Rahu major-period start, but the computed subperiod on the reported May 1997 marriage date is Saturn rather than Jupiter under the declared sidereal year. The book resolves competing dates using annual Tithi Pravesha, which is not implemented here. The test is not altered to force the known answer. Bangalore coordinates in the probe are the app's listed-city approximation because that example does not supply exact coordinates.

The original Atlas visual design is restored in 1.1.1 while retaining native model inference, profile storage, life books, timing and forecast journal. A native Mac question about next-month career completed with a chart-grounded answer and persisted across reopening. Root tests: 17 passed; desktop tests: 59 passed. Intel and Windows runtime execution still require testing on those platforms.


## 1.1.2 Mac startup repair

The native asset server canonicalizes both the resource root and requested file before checking containment. Mac App Translocation can otherwise present `/private/var` and `/var` aliases as different prefixes, producing empty responses and a white screen. The new native startup test serves assets from an aliased temporary app path, checks missing files and HEAD requests, and rejects encoded traversal and external symlinks. The fixed Atlas was opened from that temporary path. A native loading/error surface and retry action cover navigation failure and WebKit termination.
