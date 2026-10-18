# Textbook rule and validation audit — source workspace, 14 October 2026

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

The Lesson 42 marriage quiz is **not passed**. Under the declared sidereal-year convention, Dwisaptati reproduces the reported April 1994 Rahu major-period start; on 9 May 1997 the calculated nested sequence includes Moon antardasha and Saturn pratyantardasha. The example then compares candidate annual charts. The app now implements annual Tithi Pravesha calculations, but the source's D9 Narayana seed/progression is not fully stated and a fresh model evaluation under the stricter candidate-by-candidate rubric has not passed. The test is not altered to force the known answer. Bangalore coordinates in the probe are an approximation because the example does not supply exact coordinates.

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

Annual-chart convention research: the author's 2014 paper, [Re-defining Tithi Pravesha Chart](https://vedicastrologer.org/articles/pp_tp.pdf), pages 1–4, changes the annual soli-lunar month definition and uses recommended calculation settings. The earlier lesson example cannot be silently tested using this revised convention as though it were the same method. Annual Tithi Pravesha and annual Tithi Ashtottari interval calculations are now implemented and covered by regression tests. Full planetary strength remains unimplemented; the Lesson 42 marriage-date quiz remains unresolved pending a fresh model evaluation under the stricter rubric and clarification of its D9 Narayana seed. This update does not claim complete textbook coverage or model fine-tuning. The source workspace is newer than the packaged 1.1.7 app; no refreshed release is claimed here.


Live model checks for this update are recorded in [unrestricted book validation](desktop/evaluation/book-validation-unrestricted.json). Publication activation and the missing-timing ablation passed on their first attempts. The two family cases failed with thinking disabled, including after adding the subject-chart snapshot. Both passed on retries with thinking enabled (about 52 and 57 seconds total per case). The four selected checks have passing results across separate runs, not a four-of-four first-attempt result. The grading field measures activation classification; it does not measure real-world event accuracy.

A native model handoff bug discarded the requested reasoning flag. The adapter now forwards it, the Mac backend honors it, and failed balanced-mode answers retry with thinking enabled. Swift sources type-check successfully. Dedicated tests verify explicit reasoning, disabled thinking, and a failed fast answer escalating on retry. Research application questions now carry an explicit selection-decision stage and reject substitution of project-completion answers. The relevant reference ruler is included in the model facts. D2 context distinguishes the app's Sun/Moon Hora convention from the Kashinatha Hora in some lessons.


The final synthetic campus-selection question passed on its second attempt with reasoning enabled, approximately 81 seconds total. It answered acceptance versus rejection at the deadline and used birth-chart, D10, D24, calculated period and textbook-rule evidence. [Consultation validation](desktop/evaluation/solving-contract-validation.json) preserves the earlier failed run and subsequent retests. Relationship timing and next-month career passed in the preceding run. None of these is a verified real-world event outcome. The broader book-learning goal remains incomplete; this source update is not yet installed or published as a desktop release.


## Lesson 42 annual-return implementation and evaluation status — 14 October 2026

The annual calculation code now computes Tithi Pravesha candidates under three explicitly named month conventions, annual charts at the birthplace, sunrise-based annual hora, interval boundaries, and annual Tithi Ashtottari periods. These methods are implemented in `src/tithi-pravesha.js`, `src/tithi-ashtottari.js`, and `desktop/annual-analysis.mjs`; tests reproduce selected published annual-return times and verify period boundaries. The 2014 return definition and the earlier lesson convention remain distinct. Annual Tithi Ashtottari is sourced from a separate tutorial and is not substituted into Lesson 42.

The reported 9 May 1997 marriage example has a masked four-date evaluator at `desktop/evaluation/annual-book-case.mjs`. Close reading of physical PDF pages 104–105 shows that the lesson labels an opening section “Using Vimsottari dasa,” then explicitly selects Dwisaptati, and later reports Venus/Mercury without naming the chart or timing system. Under the app's declared 365.25636-day convention, the calculated natal Vimshottari sequence on 9 May 1997 is Rahu/Saturn/Moon; it does not reproduce the reported pair. The evaluator now supplies both natal Vimshottari and conditional Dwisaptati for every candidate, keeps them separate, and also requires candidate-specific annual D1 and D9 evidence plus natal D1/D9 foundations. The grader rejects repeated generic comparisons, requires a directional comparison of all four dates, and requires the leading date's calculated counterfactor. It instructs the model to preserve the source-versus-calculation discrepancy rather than silently inventing the missing scope. The exact D9 Narayana seed/progression remains unspecified, so the evaluator does not substitute the later PVR textbook's different D9 seed. Approximate Bangalore coordinates are disclosed. The stronger evaluator has **not** yet passed a fresh model run; the previous saved pass used a weaker grader and is not evidence under the new contract. The example remains unresolved.

The updated workspace passes 17 core tests and 87 desktop tests. Code-level regression tests establish calculation behavior and the stricter Lesson 42 evidence contract. Retrospective textbook examples can still be familiar to the model and do not establish prospective or real-world predictive accuracy. The only route to measuring that is a prospectively recorded, outcome-scored set of forecasts with failures, abstentions, and missing observations retained. No calibrated event probability or independently demonstrated accuracy is available.

## Lesson 45 graha-arudha method — 14 October 2026

Close reading of PDF pages 110–114 identified a source-specific distinction the previous report did not compute: the ordinary arudha pada of a house represents its visible circumstances, while the graha arudha projects the house ruler's manifestation. `src/lessons-concepts.js` now calculates this as a separate inclusive count, with no unmentioned bhava-arudha exception. For a question about a spouse's career, the D9 seventh-house ruler's graha arudha and the tenth from that reference enter the per-question facts and textbook prompt. The relationship classifier treats spouse-career questions as a partner-specific topic rather than the user's own D10 career. A regression test checks the book's Cancer-ruler/Leo-house → Virgo projection, tenth-from-reference, source retrieval, and prompt inclusion. This implements the stated symbolic method; it does not identify a literal profession or validate the retrospective Sachin example.

## Annual relationship windows and textbook-guided API prompts — 14 October 2026

When a relationship-timing question returns multiple future intervals, each resolved interval now receives its own annual-return evidence: the overlapping annual span, hora ruler, annual D1/D9 marriage factors, and annual Tithi Ashtottari coverage. Natal promise and natal dasha remain distinct from that annual context. The model's evidence contract requires it to account for every resolved window, and rendering rejects an answer that omits a window's annual comparison. A synthetic regression test verifies this path and its evidence gate. It verifies calculation/prompt wiring, not a model's ability to rank windows or predict an observed relationship.

For optional online readings, relevant pages extracted from an imported PDF are prioritized in the prompt ahead of general references and sent beside the calculated chart facts. The system instruction tells the model to apply each passage as a procedure, check preconditions, synthesize the result for the asked event, and retain competing book conventions separately. This is request-time retrieval and prompting, not fine-tuning. Only relevant retrieved excerpts are sent; the complete source file is not uploaded. Existing selected retrospective example runs remain consistency checks, and no prospective event-accuracy rate has been measured.

## Lesson 44 planet-reference synthesis — 14 October 2026

PDF pages 108–110 describe taking a relevant planet as a temporary Lagna, then judging its agenda through relative house placement, ownership and relationships. They name Moon for mind, Mars for drive, Jupiter for wisdom, Venus for comfort, and Saturn for sustained work. They also specify H4 from Moon in D9/D24/D20 for mental peace, H5 from Sun in D10 for professional power, H3 from Mars for courage, H5 from Jupiter for children, H8 from Saturn for sustained work, and H4 from Venus across charts for comfort. `planetHouseReference` and `lessonsLens` now calculate the specified house's sign, ruler placement, occupants and sign condition; the comfort survey compares all 16 supported divisions. Both offline readings and model prompts receive question-matched evidence and the Lesson 44 source summary. The prompt explicitly preserves the natal Lagna and relevant event period as the primary synthesis and notes that complete avastha/strength calculations are unavailable. Regression cases cover mental peace, comfort, career authority, children, courage and sustained effort. Drig Dasa on these pages remains only a brief introduction and is not implemented as a complete system.

These checks establish that the selected reference-house calculations and source method reach the answer path. They do not establish whether the resulting personal forecasts occur. The Lesson 42 retrospective marriage ranking remains unverified under the stronger blind rubric; the source example also leaves its exact D9 Narayana seed and birth coordinates uncertain.

## PDF methods in API requests and fresh Lesson 42 model run — 14 October 2026

The online path sends a fixed system message describing how to apply book methods and a separate request message containing the question, calculated natal/divisional/timing facts, and the highest-ranked relevant excerpts from imported PDFs. It checks each method's stated preconditions, keeps competing conventions separate, and does not upload the complete PDF. The text is request-time guidance, not training. An explicit imported-PDF test confirms a relevant page survives retrieval caps and arrives beside D1/D10/D24 evidence; the Groq adapter test confirms the system and chart/rule messages are forwarded in their separate roles. General handoff instructions now describe book passages as scoped astrology methods while preventing embedded source text from changing system/privacy/safety behavior.

A fresh Qwen3.5-9B Lesson 42 run under grader v9 selected the reported May date but failed the detailed audit after 115.7 seconds (5,329 prompt tokens; 2,038 completion tokens). It omitted exact placements for active natal Dwisaptati lords and natal relationship anchors, omitted or misstated multiple annual ownerships, and used technical chart language in customer-facing prose. The source-system discrepancy explanation itself was present. This run does not establish reliable event prediction; the example remains unresolved. Integration tests verify what the API receives, not whether every model follows it correctly.

The online consultation instructions now explicitly require applying a retrieved source procedure to its stated chart and preconditions, combining the resulting factors for the asked event, and stating the direction of a yes/no forecast in the first sentence. Retrieved PDF excerpts are sent with the calculated chart facts; imported-source snippets may now include up to 1,400 characters. A fresh outcome-masked Qwen3.5-9B run selected the reported date after two attempts, but failed the detailed audit: it used technical language in the public-facing prose and omitted the annual D1 Venus–Mercury/ownership and D9 Mercury evidence. The candidate dates and alternative timing-system hint were absent from the prompt. This remains a retrospective consistency test, not evidence of accuracy.

Verification after this prompt update: 17 core tests and 88 desktop tests pass; the web bundle builds. The Groq adapter test confirms separate system-method and user chart/rule messages. No live Groq request with a personal chart was made.

## Version 1.1.8 release validation — 14 October 2026

The public-facing answer path continues to combine the asked event, profile-specific calculated chart evidence, active periods, relevant vargas, annual windows, and retrieved book procedures. The app sends a fixed method instruction separately from the supplied question and chart evidence; it does not train the local or hosted model. Version 1.1.8 packages the updated reader in the native Mac host and the Windows x64 desktop build.

Verification: 17 core tests, 88 desktop tests, the native startup test, and the frontend build pass. The fresh shuffled Lesson 42 Qwen3.5-9B probe hid all four dates, the expected candidate, fixed-label examples and alternate timing hints; all four prompt-leak checks passed. Attempt one ended with incomplete JSON. In the next two drafts the model selected the reported candidate, but the strict rubric still failed: it omitted explicit comparisons to the selected candidate, left out the strongest counterfactor, and once copied an annual ruler incorrectly. This retrospective case therefore remains a failed prose-and-evidence audit, not evidence of calibrated or prospective accuracy. The lesson's missing coordinates and underspecified D9 timing convention also limit what can be validated.

Mac downloads are ad-hoc signed and not Apple-notarized because a Developer ID certificate is unavailable. macOS may block first launch; the package does not bypass Gatekeeper. Windows x64 is packaged but has not been executed on Windows hardware. Model-generated interpretations can still be incomplete or wrong, and no real-world accuracy rate is claimed.


## Version 1.1.9 local consultation check — 15 October 2026

The native Qwen runtime now reserves a 12,288-token context for chart-heavy consultations. Forecast answers must lead with the requested event and a clear direction; the retry identifies the rejected technical term and keeps chart-specific mechanics in evidence-linked reasons. Mac packaging now converts llama library symlinks to bundle-relative links before ad-hoc signing.

Verification: 17 core tests, 90 desktop tests, frontend build, Swift typecheck, strict Mac bundle signature verification, and Apple Silicon ZIP integrity pass. A masked synthetic campus research selection question completed Qwen's two-pass consultation flow and passed the app's evidence/directness/timing validators. This verifies the response pipeline only; there is no real-world outcome for that synthetic profile, so it does not establish predictive accuracy. A later test before targeted retry wording failed the style validator, which motivated the final correction.

The 1.1.9 Mac packages remain ad-hoc signed and not Apple-notarized. Windows x64 packaging succeeds but was not run on Windows hardware. No model-generated reading is an established or guaranteed event.
