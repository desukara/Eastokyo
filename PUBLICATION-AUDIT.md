# Eastokyo Publication Audit

## Positioning

Eastokyo Education Review is Englishire's independent digital publication for the English-teaching profession in Tokyo and across Japan. It is not a travel, restaurant, neighborhood, nightlife or general Tokyo-culture magazine.

## Page decisions

| Page | Decision | Reason |
|---|---|---|
| `index.html` | Keep | Rebuilt as the publication homepage and Englishire service gateway. |
| `city-life.html` | Keep URL, rebuild meaning | Legacy slug retained to avoid breaking existing links; page now functions solely as the magazine archive. |
| `the-end-of-the-easy-teacher.html` | Keep | First complete Eastokyo article edition. |
| `about.html` | Rebuilt | Removed travel/culture positioning and established editorial remit and publisher relationship. |
| `editorial-policy.html` | Rebuilt | Replaced hospitality/review policy with standards for professional journalism, conflicts, sources and corrections. |
| `work-with-us.html` | Keep URL, repurpose | Now for contributors, sources, research and transparent professional partnerships—not hotels or restaurant campaigns. |
| `contact.html` | Rebuilt | Separates Eastokyo editorial enquiries from Englishire teacher-cover requests. |
| `404.html` | Rebuilt | Gives useful routes to the homepage, archive and Englishire while acknowledging migrated legacy URLs. |
| `sitemap.xml` | Updated | Includes the archive and published Eastokyo article. |

## Article migration ledger

The following Englishire Journal articles still need native Eastokyo editions, followed by redirects or canonical cleanup on the Englishire originals:

1. Hiring Foreign Teachers in Japan
2. The Real Cost of English Teacher Turnover
3. How Schools Can Handle Staff Shortages
4. Emergency Classroom Coverage
5. Backup Teacher Eikaiwa
6. Eikaiwa School Operations
7. School Collapse After Three Decades

Until migration is complete, the Eastokyo archive labels these links as **original editions** rather than pretending they are already Eastokyo pages.

## Remaining technical cleanup

- Audit unreferenced legacy imagery and remove travel/culture assets only after confirming no live page depends on them.
- Consolidate old page-specific CSS after all secondary pages have moved to the shared publication system.
- Add redirects when article migrations create replacement Eastokyo URLs.
- Verify deployment-level redirects for any retired legacy routes.
- Run a final crawl for broken internal links, duplicate metadata and orphan pages after the article migration.
