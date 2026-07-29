"use strict";

const hero = document.querySelector(".living-hero");

if (hero) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const observer = new IntersectionObserver(([entry]) => {
    hero.classList.toggle("is-visible", entry.isIntersecting);
  }, { threshold: 0.18 });

  observer.observe(hero);

  if (!reducedMotion.matches) {
    let currentLight = 1;
    let targetLight = 1;
    let currentReflection = .58;
    let targetReflection = .58;
    let nextChange = performance.now();
    let frameId = 0;

    const between = (min, max) => Math.random() * (max - min) + min;

    const chooseState = (now) => {
      const rareFluorescentDip = Math.random() < .075;
      const tinyElectricalPulse = !rareFluorescentDip && Math.random() < .18;

      if (rareFluorescentDip) {
        targetLight = between(.76, .88);
        targetReflection = between(.39, .48);
        nextChange = now + between(55, 125);
      } else if (tinyElectricalPulse) {
        targetLight = between(1.03, 1.10);
        targetReflection = between(.60, .68);
        nextChange = now + between(90, 210);
      } else {
        targetLight = between(.96, 1.045);
        targetReflection = between(.53, .62);
        nextChange = now + between(650, 2400);
      }
    };

    const animate = (now) => {
      if (!document.hidden && hero.classList.contains("is-visible")) {
        if (now >= nextChange) chooseState(now);

        currentLight += (targetLight - currentLight) * .068;
        currentReflection += (targetReflection - currentReflection) * .042;

        hero.style.setProperty("--hero-light", currentLight.toFixed(3));
        hero.style.setProperty("--hero-reflection", currentReflection.toFixed(3));
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    window.addEventListener("pagehide", () => cancelAnimationFrame(frameId), { once: true });
  }

  if (finePointer.matches && !reducedMotion.matches) {
    let raf = 0;

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        hero.style.setProperty("--hero-x", `${(x * 100).toFixed(2)}%`);
        hero.style.setProperty("--hero-y", `${(y * 100).toFixed(2)}%`);
        hero.style.setProperty("--hero-depth-x", `${((x - .5) * -7).toFixed(2)}px`);
        hero.style.setProperty("--hero-depth-y", `${((y - .5) * -5).toFixed(2)}px`);
      });
    });

    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--hero-x", "50%");
      hero.style.setProperty("--hero-y", "42%");
      hero.style.setProperty("--hero-depth-x", "0px");
      hero.style.setProperty("--hero-depth-y", "0px");
    });
  }
}
