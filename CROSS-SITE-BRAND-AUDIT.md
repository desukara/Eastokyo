# Eastokyo × Englishire Brand Integrity Audit

## Canonical roles

- **Eastokyo Magazine** is Englishire's independent digital publication for the English-teaching profession in Tokyo and across Japan.
- **Englishire** is the temporary English teacher-cover service for Tokyo schools.
- Eastokyo reports on the profession. Englishire supports schools in practice.

## Canonical Eastokyo header

The publication masthead returns to `index.html`. The explicit Englishire navigation item returns to `https://englishire.com/`.

Canonical navigation:

1. Latest
2. Magazine
3. About
4. Contribute
5. Englishire

This prevents the logo itself from changing destination between pages and keeps the service handoff visible rather than implicit.

## Canonical Eastokyo footer

Every publication footer should expose:

- Magazine
- About
- Contribute
- Editorial Policy
- Contact
- Request teacher cover through Englishire

Canonical identity statement:

> Englishire's independent digital magazine for the English-teaching profession in Tokyo and across Japan.

## Brand and editorial exclusions

Retired Eastokyo identity must not reappear in public navigation, metadata, guide copy or page descriptions. Remove references to:

- The Tokyo Magazine
- travel and culture magazine
- hotels and restaurants
- nightlife and after-dark guides
- generic neighbourhood recommendations
- standalone crow-era branding

## Cross-site destinations

- Englishire homepage: `https://englishire.com/`
- Teacher-cover request: `https://englishire.com/contact.html`
- Englishire process: `https://englishire.com/how-it-works.html`
- Eastokyo homepage: `https://eastokyo.com/`
- Magazine desk: `https://eastokyo.com/city-life.html`

## Implementation in this pass

- `assets/js/magazine-guide.js` now normalises the masthead destination, publication navigation and footer navigation on every Eastokyo page using the shared script.
- The shared footer service action consistently routes to Englishire teacher-cover contact.
- The shared publication description is consistent across pages.
- Genki2's travel-magazine notes have been replaced with teaching-profession editorial guidance.

## New-page rule

New pages should contain the canonical header and footer directly in source. Shared-script normalisation remains a safety net for older files, not a substitute for correct new markup.