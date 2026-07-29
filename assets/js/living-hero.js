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
    const channels = {
      light: { current: 1, target: 1, speed: .064, min: .95, max: 1.05 },
      left: { current: 1, target: 1, speed: .095, min: .91, max: 1.08 },
      center: { current: 1, target: 1, speed: .075, min: .94, max: 1.06 },
      right: { current: 1, target: 1, speed: .082, min: .92, max: 1.09 },
      sign: { current: 1.04, target: 1.04, speed: .085, min: .98, max: 1.12 },
      traffic: { current: 1.04, target: 1.04, speed: .24, min: .96, max: 1.10 },
      reflection: { current: .58, target: .58, speed: .035, min: .52, max: .65 },
      haze: { current: .42, target: .42, speed: .025, min: .37, max: .49 },
      prism: { current: .18, target: .18, speed: .022, min: .12, max: .24 }
    };

    let nextChange = performance.now();
    let nextSignChange = performance.now() + 500;
    let nextTrafficChange = performance.now() + 700;
    let trafficBurstSteps = 0;
    let frameId = 0;
    const between = (min, max) => Math.random() * (max - min) + min;

    const setNormalTargets = () => {
      ["light", "left", "center", "right", "reflection", "haze", "prism"].forEach((name) => {
        const channel = channels[name];
        channel.target = between(channel.min, channel.max);
      });
    };

    const chooseState = (now) => {
      const event = Math.random();

      if (event < .055) {
        const names = ["left", "center", "right"];
        const selected = names[Math.floor(Math.random() * names.length)];
        channels[selected].target = between(.54, .77);
        channels.light.target = between(.89, .96);
        channels.reflection.target = between(.39, .49);
        channels.haze.target = between(.29, .36);
        nextChange = now + between(48, 115);
      } else if (event < .16) {
        const names = ["left", "center", "right"];
        const selected = names[Math.floor(Math.random() * names.length)];
        channels[selected].target = between(1.10, 1.19);
        channels.light.target = between(1.02, 1.08);
        channels.reflection.target = between(.63, .72);
        channels.prism.target = between(.20, .29);
        nextChange = now + between(90, 230);
      } else {
        setNormalTargets();
        nextChange = now + between(700, 2700);
      }
    };

    const animateSign = (now) => {
      if (now < nextSignChange) return;

      if (Math.random() < .16) {
        channels.sign.target = between(1.15, 1.26);
        nextSignChange = now + between(90, 170);
      } else {
        channels.sign.target = between(.99, 1.11);
        nextSignChange = now + between(850, 2100);
      }
    };

    const animateTraffic = (now) => {
      if (now < nextTrafficChange) return;

      if (trafficBurstSteps > 0) {
        channels.traffic.target = trafficBurstSteps % 2 === 0
          ? between(.30, .54)
          : between(1.28, 1.58);
        trafficBurstSteps -= 1;
        nextTrafficChange = now + between(65, 125);

        if (trafficBurstSteps === 0) {
          channels.traffic.target = between(1.02, 1.12);
          nextTrafficChange = now + between(1300, 3300);
        }
        return;
      }

      if (Math.random() < .78) {
        trafficBurstSteps = Math.floor(between(3, 7));
        channels.traffic.target = between(.36, .60);
        nextTrafficChange = now + between(70, 130);
      } else {
        channels.traffic.target = between(.98, 1.12);
        nextTrafficChange = now + between(900, 2200);
      }
    };

    const animate = (now) => {
      if (!document.hidden && hero.classList.contains("is-visible")) {
        if (now >= nextChange) chooseState(now);
        animateSign(now);
        animateTraffic(now);

        Object.entries(channels).forEach(([name, channel]) => {
          channel.current += (channel.target - channel.current) * channel.speed;
          hero.style.setProperty(`--hero-${name}`, channel.current.toFixed(3));
        });
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
        hero.style.setProperty("--hero-depth-x", `${((x - .5) * -9).toFixed(2)}px`);
        hero.style.setProperty("--hero-depth-y", `${((y - .5) * -6).toFixed(2)}px`);
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