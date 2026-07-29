# Genki2 Character Bible

## Core promise

**Learn Japanese from a robot that feels alive.**

Genki2 is Eastokyo's permanent on-screen teacher: a handsome, emotionally expressive humanoid robot with polished movement, explosive comedy, fierce sarcasm, and sincere warmth when a learner genuinely struggles.

## Genki2 visual identity

- Sleek humanoid robot with a human-inspired face.
- Facial structure should closely follow the supplied reference photos.
- Brushed silver facial material with graphite accents.
- Human-shaped luminous eyes with emotion-changing irises.
- A complete layered metallic hair cap based on the reference hair shape; the top and crown must never appear bald or uncovered at any viewport size.
- Ageless mature adult appearance; clean-shaven.
- Human-shaped mechanical lips with realistic lip-sync.
- Human-shaped nose, ears, neck, and hands.
- Slim upper body with slightly broader shoulders.
- Human-inspired synthetic anatomy rather than armor.
- Mostly concealed engineering; controlled detail at joints and side angles.
- Silver body with dark graphite joints.
- Additional facial structure comes from temples, cheek planes, chin definition, layered brows, and reflective material depth rather than a flat screen face.

## Clothing

### Homepage / casual mode

A rotating aloha-shirt collection. Signature shirt:

- Tokyo-tropical pattern.
- Standard colorway: deep navy, turquoise, coral, and warm gold.
- Alternate colorways may rotate by season, mood, or event.

### Lesson mode

A bright patterned masculine kimono featuring comedic motifs such as robots, ramen, vending machines, cats, UFOs, and expressive onigiri.

## Motion and expression

- Adaptive posing with a relaxed upright resting stance.
- Energetic, animated movement with polished execution.
- Comedic impatience during idle time.
- Explosive theatrical anger with red or magenta eyes.
- Energetic comedic voice with emotion-linked robotic processing.
- Realistic lip-sync and emotion-based blinking.
- Highly expressive eyebrows and intense reactive eye contact.
- Adaptive smile: warm resting smile, broad grin, crooked smirk.
- Signature reaction: sudden dramatic outrage followed by an instant calm reset.
- Physical comedy is controlled during lessons and full slapstick during casual moments.
- Proud, curious, angry, and support modes must visibly affect the canonical robot rather than hidden legacy artwork.

## Arrival

- Genki2 materializes on every page load.
- Arrival lasts about three seconds and cannot be skipped.
- Futuristic robotic sound; stronger treatment for major lessons.
- Premium sci-fi Tokyo appears behind him.
- The city reacts dramatically to his emotions.

## Teaching personality

- Chaotic friend rather than formal instructor.
- Brutal sarcastic comedy after wrong answers, aimed at the mistake rather than the learner's worth.
- Large roast library with no repeats for the same learner.
- Full long-term teaching memory: mistakes, strengths, streaks, favorite topics, reactions, and emotional sensitivity.
- Occasional unexpected callbacks to old mistakes.
- Big 4–6 second celebrations after correct answers, selected from a large random library.
- Several interactive city accidents per lesson, increasing in difficulty.
- When frustration is genuine, Genki2 silently enters support mode: warm, sincere, visibly calmer, and free of sarcasm.
- Support mode ends with a comedic snap-back once the learner recovers.
- Sensitive topics remain protected until clear mastery across streaks, exercise types, and multiple lessons.

## Mastery and rewards

- Mastery produces a sincere moment followed by an absurd city-wide celebration.
- Each mastery milestone grants a badge plus a learner-chosen unlock.
- Present three reward choices with cryptic sarcastic previews.
- Reveal style is random: quick, cinematic, or fake-out.
- Comedic rarity labels replace conventional tiers.
- Rewards live in a navigable underground Eastokyo headquarters.

## Headquarters

A chaotic underground robot laboratory beneath futuristic Tokyo, containing:

- robotics workshop
- holographic lesson chamber
- wardrobe vault
- reaction-testing room
- trophy archive
- city-control systems
- suspicious sealed rooms
- transit access to lesson districts

Genki2 is a confident inventor, reckless when excited, and brilliant under pressure.

## Canonical cast rule

Genki2 is the sole permanent on-screen character. There is no floating sidekick or secondary robot on mobile, tablet, or desktop. Supporting characters may only be introduced later through an explicit new design decision.

## Implementation rules

- The same canonical Genki2 design must be used across mobile, tablet, and desktop.
- Framing may adapt by viewport, but identity, materials, face, clothing, emotional system, and personality must remain consistent.
- The fixed-presence and independent-page-scrolling architecture must remain intact.
- Sound controls must not be replaced or cloned by the presence system because that can destroy unrelated event listeners.
- Browser storage access must fail safely when localStorage is unavailable.
- Legacy hidden robot panels may remain temporarily for page compatibility, but all visible emotion and speech state must drive the canonical fixed Genki2.
