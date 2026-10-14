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


## 1.1.3 optional online reasoning

Groq uses the same `consultationInput` facts, rules, retrieved passages, question planning and timing windows as native local inference. `generateConsultation` validates both paths through the same evidence-ID, calculated-date and question-specific checks. A real Groq Qwen 3.8 27B request using the synthetic built-in example produced a next-month career reading and passed these checks. This verifies integration, not predictive accuracy. No personal chart was used for that API test.

Validation: 17 root tests, 63 desktop tests and the native Mac startup test pass. Added tests cover masked/encrypted storage, consent gates, structured request preservation, quota errors, voice consent and interruption behavior. ElevenLabs live audio remains unverified; the user elected to leave voice optional. Sources remain in retrieval and export while source cards are removed from conversation display.


## Unreleased textbook solving-contract update — 14 October 2026

The consultation path now selects the union of subject-specific divisions rather than defaulting unrelated questions to D9. Each astrology answer must select birth-chart foundation and calculated period/window evidence. Non-forecast subject questions must also select each available required division and at least one calculated textbook/lesson rule. Explicit evidence groups are sent to the model and independently checked before rendering. A source-derived divisional fact can satisfy both the division and rule requirements; repeated evidence IDs remain prohibited. The reason budget expands for multiple subjects. The prompt requests a direct favorable, unfavorable or mixed event judgment, its dominant combination and counterfactor, rather than general advice. Moon-reference context is explicitly identified. Source summaries retain more relevant text instead of being truncated to three 240-character snippets. Both native and online models use this path.

Twelve synthetic-profile/topic combinations cover work, relationships, study, property, resources and spiritual practice. Tests reject natal-only answers and accept complete evidence-linked arguments. All 68 desktop tests and 17 core tests pass; the frontend build succeeds. These checks establish software behavior, not event accuracy.

The textbook-example evaluator previously constrained its `support` response enum using the calculated rule result. That restriction is removed in grader version 4: direct support, background-only, mixed and timing-unresolved are all available to the model. Earlier constrained runs remain historical consistency checks, not evidence of unrestricted predictive classification accuracy. An added test prevents reinstating the expected-verdict restriction.

Annual-chart convention research: the author's 2014 paper, [Re-defining Tithi Pravesha Chart](https://vedicastrologer.org/articles/pp_tp.pdf), pages 1–4, changes the annual soli-lunar month definition and uses recommended calculation settings. The earlier lesson example cannot be silently tested using this revised convention as though it were the same method. Annual Tithi Pravesha, compressed annual periods and full planetary strength remain unimplemented; the Lesson 42 marriage-date quiz remains unresolved. This update does not claim complete textbook coverage or model fine-tuning. Installed app and published downloads remain 1.1.4 until a separately verified release.


Live model checks for this update are recorded in [unrestricted book validation](desktop/evaluation/book-validation-unrestricted.json). Publication activation and the missing-timing ablation passed on their first attempts. The two family cases failed with thinking disabled, including after adding the subject-chart snapshot. Both passed on retries with thinking enabled (about 52 and 57 seconds total per case). The four selected checks have passing results across separate runs, not a four-of-four first-attempt result. The grading field measures activation classification; it does not measure real-world event accuracy.

A native model handoff bug discarded the requested reasoning flag. The adapter now forwards it, the Mac backend honors it, and failed balanced-mode answers retry with thinking enabled. Swift sources type-check successfully. Dedicated tests verify explicit reasoning, disabled thinking, and a failed fast answer escalating on retry. Research application questions now carry an explicit selection-decision stage and reject substitution of project-completion answers. The relevant reference ruler is included in the model facts. D2 context distinguishes the app's Sun/Moon Hora convention from the Kashinatha Hora in some lessons.


The final synthetic campus-selection question passed on its second attempt with reasoning enabled, approximately 81 seconds total. It answered acceptance versus rejection at the deadline and used birth-chart, D10, D24, calculated period and textbook-rule evidence. [Consultation validation](desktop/evaluation/solving-contract-validation.json) preserves the earlier failed run and subsequent retests. Relationship timing and next-month career passed in the preceding run. None of these is a verified real-world event outcome. The broader book-learning goal remains incomplete; this source update is not yet installed or published as a desktop release.
