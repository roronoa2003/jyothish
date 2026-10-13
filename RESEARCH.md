# Interpretation research and rule register

Reviewed 13 October 2026 for version 1.0.2. This is an engineering/source audit, not a claim of reading every book or training a model on them. Copyrighted book files and the user's private sample report are not distributed.

## Passages inspected

P. V. R. Narasimha Rao, *Vedic Astrology: An Integrated Approach*, first published 2000, author-hosted PDF with 2010 update note:

| Passage | Implementation decision |
| --- | --- |
| Section 6.5, physical PDF p74 / printed p62 | Subject-specific varga house and ruler chains, alongside D1. Domain-house lists are explicit app choices. |
| Section 16.3, PDF p224 / printed p212 | Preserve subdivision of the complete opening mahadasha; no subdivision of only the remaining birth balance. |
| Section 16.5.1, PDF p226 / printed p214 | Antardasha lord's position and ownership relative to the mahadasha lord, separately labeled. |
| Section 25.3, PDF p332 / printed p320 | Transit sign occupancy and aspects mapped to natal houses and planets. |
| Chapter 32, PDF pp432–434 / printed pp420–422 | Hypothetical ascendant sensitivity test; no claim of rectification. |

[Author-hosted edition](https://vedicastrologer.org/articles/vedic_astro_textbook.pdf). The book's 2010 note says the author's views have developed since initial publication. These selected techniques are a declared framework, not unanimous rules or empirical proof.

Previously inspected classical passages remain identified in the app: Phaladeepika chapter 15 verse 30 (G. S. Kapoor, PDF p154), Saravali volume I chapter 4 verses 28–31 and 34 (R. Santhanam, PDF pp49–51), and selected BPHS chapters. The new code does not infer Shadbala from friendship or sign dignity. It does not import the author's experimental divisional-transit proposals, alternative dasha seeds, lifespan methods or retrospective case-study certainty into this release.

## Defects corrected

1. D1 debilitation with an ordinary varga sign, and ordinary D1 with varga debilitation, could disappear from the verdict. Both now remain explicit.
2. A weekly/monthly opening transit snapshot could stand in for the full interval. The combined conclusions now aggregate dated six-hour samples and preserve sign changes and active-lord changes.
3. Aspects to unoccupied domain houses were missing from the transit filter. They are now included independently of natal-planet contacts.
4. Monthly chat began on the chosen day (often the 15th), omitting earlier dates. It now uses calendar-month boundaries in UTC.
5. Repeated lords and general significators could sound like multiple independent confirmations. The engine now exposes unique lords and direct/indirect activation reasons.

## Verification and limits

Regression fixtures check the corrected conflict cases, recomputed varga ownership, directional period references, repeated lords, empty-house transit aspects, changing sampled signs, interval boundaries and ascendant sensitivity. Existing calculation and profile tests also run. These tests verify arithmetic and implemented rule behavior, not predictive validity.

No personal event corpus has been used to calibrate predictions. There are no empirical event probabilities. A credible accuracy study would need preregistered, date-stamped predictions, explicit outcomes, held-out participants, blinded evaluation and comparison with non-astrological baselines; retrospective matching alone is insufficient.

Six-hour sampling does not solve exact ingresses, stations or degree-aspect events. The ±5-minute experiment is an explicit hypothetical input range, not an estimate of the person's actual birth-time error. It checks ascendants only. Planetary cusp uncertainty and shifted dasha boundaries remain unresolved. The app keeps approximate Lahiri, approximate ascendant, whole-sign houses and mean nodes; changing these conventions requires a separate compatibility and calibration audit.
