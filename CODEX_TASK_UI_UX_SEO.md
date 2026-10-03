# Codex execution task

## Mission

Implement the first improvement cycle from the independent UI UX SEO audit for TS Aventura.

The audit is available in this repository on branch `review/ui-ux-seo-2026-09-26` at

`docs/review/ui-ux-seo-audit-2026-09-26.md`

Read the complete audit before changing code.

If the current working branch is `feat/homepage-preview-2026-09-24`, keep it. Do not check out the review branch over the working tree. Fetch it and read the file with Git or through the GitHub raw URL.

## Repository and scope

Expected local repository

`C:\Dev\ts-aventura-web-remote`

Expected working branch

`feat/homepage-preview-2026-09-24`

Public preview

https://transserrano.github.io/ts-aventura-web-preview/

This cycle may update only the preview and its documentation.

Do not modify

- source main
- production WordPress
- cPanel
- DNS
- production domain
- TS Viagens
- FareHarbor live products
- Viator, GetYourGuide or Google Things to Do
- real prices or availability outside the preview
- the preview noindex protection

## Goal

Preserve the approved visual direction and materially improve decision quality, trust, catalog usability and SEO readiness.

The first activity pilot is Caminhada Aquática Góis because it is distinctive, well documented and central to the brand.

Do not produce another plan-only response. Inspect the repository, implement the safe first cycle, test it and publish only to the existing preview workflow if all gates pass.

## Work package A Product Truth

Create one maintainable source of truth suitable for the current architecture. It may be structured data, content data or documented content contracts, but avoid duplicating the same fact across templates.

Record every activity with

- internal identifier
- PT and EN names
- PT and EN slugs
- destination
- price and tax treatment
- price unit
- operational minimum
- duration
- distance when relevant
- difficulty wording
- age and physical requirements
- seasonality
- capacity
- included and excluded
- meeting and logistics fields
- safety and weather fields
- booking status
- source and validation status

Use confirmed facts from the audit. Unknown values must be explicitly marked as unknown in the data source but must not appear publicly as invented placeholders.

Do not overwrite a newer validated repository value merely because the audit contains an older number. Report every conflict.

## Work package B Caminhada Aquática pilot

Rebuild the activity page using existing design tokens and components.

Above the first major scroll show

- Caminhada Aquática
- Góis
- about 4 hours
- about 2 km
- minimum 4 participants
- price information appropriate to the page audience
- optional jumps from 2 to 8 m
- short human difficulty explanation
- clear primary CTA
- clear secondary CTA

Use the following approved facts unless the repository contains newer validated data

- 35 euros for groups
- 30 euros for schools
- minimum 4
- about 2 km
- about 4 hours
- jumps from 2 to 8 m are optional
- slide and rope elements
- winter operation uses double neoprene and buoyancy aid

Do not claim instant booking or live availability. Until a real booking flow is connected, the CTA must truthfully request information or availability.

Add

- real experience summary
- itinerary
- included and not included
- what to bring
- physical and health requirements
- meeting and logistics section without exposing sensitive coordinates
- concrete safety and weather policy wording
- activity-specific FAQ
- related activities explained by difference
- repeated CTA at the end

Remove generic repeated paragraphs when specific content replaces them.

## Work package C Trust layer

Add a reusable global trust component in a visually restrained way.

Candidate facts

- Since 1999
- RNAAT 24/2003
- RNAVT 3925
- local guides
- verified reviews when a real source exists

Validate the context of each licence before displaying it. If the repository does not contain sufficient legal confirmation, implement the component and document the blocker without publishing the uncertain claim.

Add the company slogan where it strengthens the narrative

`A Trans Serrano leva-o aonde mais ninguém o leva.`

Do not fabricate

- review counts
- ratings
- insurance wording
- staff qualifications
- partners
- response times
- phone, email or address

Use only validated repository data for those fields.

## Work package D Catalog usability

Improve the activities catalog while preserving the editorial identity.

Required outcomes

- first activity cards appear materially earlier
- large empty space is reduced
- cards use a consistent fact order
- cards show price from when validated, duration, location, level and minimum age when applicable
- information is not hidden only on hover
- keyboard focus remains visible
- mobile layout has no horizontal overflow

Implement lightweight filters only if they can be supported cleanly by the current architecture

- water
- land
- motor
- duration
- audience
- intensity
- location

If full filters would create unjustified complexity, implement clear category chips and document the deferred enhancement.

## Work package E SEO readiness

For the homepage, catalog and pilot activity add or validate

- unique title without the preview online suffix
- unique meta description
- Open Graph title, description, URL and image
- Twitter card metadata
- favicon and theme color if approved assets already exist
- canonical
- reciprocal PT and EN hreflang
- BreadcrumbList
- Organization or LocalBusiness only with validated facts
- Product and Offer only when the visible price and conditions match

Keep

- noindex
- nofollow where currently required for the preview
- preview canonicals appropriate to the current validation environment

Do not create production canonicals or remove noindex.

Validate JSON LD syntax and ensure every marked-up fact is visible on the page.

## Work package F Quality gates

Run the existing full local validation suite.

At minimum verify

- desktop and mobile widths
- PT and EN
- homepage
- catalog
- Caminhada Aquática pilot
- header and footer
- keyboard navigation
- focus visibility
- 200 percent zoom
- reduced motion
- zero horizontal overflow
- zero broken internal links
- zero console errors
- zero unexpected external requests
- all images have useful alt text
- structured data parses
- noindex remains active
- existing pages do not regress

Target Core Web Vitals budgets must be documented even if real field data is unavailable

- LCP at or below 2.5 s
- INP at or below 200 ms
- CLS at or below 0.1

Capture before and after screenshots for desktop and mobile.

## Publication gate

Publish only through the already approved GitHub Pages preview workflow.

Do not touch source main or any production system.

Before publication require

- clean working tree except intended changes
- complete tests
- visual review
- no secrets
- no external production writes
- explicit list of files changed
- commit SHA and published preview SHA

If the existing publication method would alter main or production, do not publish. Stop and report the exact blocker.

## Evidence and handoff

Create a new evidence folder under `docs/evidence` containing

- report in Markdown
- test results
- screenshots or screenshot index
- metadata and schema checks
- link and console checks
- changed file inventory
- known unknowns and Product Truth conflicts
- next recommended cycle

Final response must include

- status
- branch
- local HEAD
- published commit if any
- public preview URL
- exact test counts
- what changed visually
- what changed in UX
- what changed in SEO
- what was deliberately not changed
- blockers requiring business approval
- next cycle recommendation

## Stop conditions

Stop without guessing if

- a price conflict cannot be resolved from an authoritative source
- a licence or legal claim is uncertain
- a task requires a production credential or secret
- publication would modify main
- FareHarbor live data would be changed
- the preview would become indexable
- another process has changed overlapping files unexpectedly

Otherwise proceed autonomously through implementation, validation and preview publication.
