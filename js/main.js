/* Eastokyo main.js
   Magazine motion, navigation polish, reading tools, and tiny satirical chaos.
   Drop this in as: js/main.js
*/

(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const eastokyoLines = [
    "Cabinet confirms emergency meeting about meetings remains unscheduled.",
    "Tokyo pigeons deny involvement in station platform negotiations.",
    "Experts warn nation only three apology emails away from enlightenment.",
    "Convenience store announces limited-edition existential dread onigiri.",
    "Local mascot refuses to comment without legal representation.",
    "Shibuya crossing briefly achieves sentience, immediately apologizes.",
    "Ministry launches task force to define the word 'soon'.",
    "Salaryman reports suspiciously emotional relationship with vending machine.",
    "Weather agency predicts 80% chance of dramatic umbrella abandonment.",
    "Temple cat accepts new post as Deputy Minister of Side-Eye.",
  ];

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMobileNav() {
    const toggle = $(".nav-toggle");
    const nav = $(".nav-list");
    if (!toggle || !nav) return;

    toggle.setAttribute("aria-expanded", "false");

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
      toggle.textContent = isOpen ? "Menu" : "Close";
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.textContent = "Menu";
      }
    });
  }

  function initStickyHeader() {
    const header = $(".site-header");
    if (!header) return;

    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentY = window.scrollY;
      header.classList.toggle("is-scrolled", currentY > 32);
      header.classList.toggle("is-hidden", currentY > 220 && currentY > lastY);
      lastY = Math.max(currentY, 0);
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  function initReadingProgress() {
    const article = $("article") || $(".article-body") || $(".story-article");
    if (!article) return;

    const bar = document.createElement("div");
    bar.className = "reading-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    const update = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function initBackToTop() {
    const button = document.createElement("button");
    button.className = "back-to-top";
    button.type = "button";
    button.textContent = "↑ Top";
    button.setAttribute("aria-label", "Back to top");
    document.body.appendChild(button);

    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });

    const update = () =>
      button.classList.toggle("is-visible", window.scrollY > 650);
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initScrollReveal() {
    const targets = $$(
      ".hero-story, .compact-card, .article-card, .sidebar-widget, .wide-feature, .category-block, .article-main, .article-body > *, .related-stories article"
    );
    if (!targets.length || prefersReducedMotion) return;

    targets.forEach((el, index) => {
      el.classList.add("reveal-on-scroll");
      el.style.setProperty("--reveal-delay", `${Math.min(index * 35, 280)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  }

  function initTickerPersonality() {
    const ticker = $("#breaking-ticker");
    if (!ticker) return;

    const existing = $$("li", ticker)
      .map((li) => li.textContent.trim())
      .filter(Boolean);
    const allLines = [...new Set([...existing, ...eastokyoLines])];

    ticker.innerHTML = "";
    [...allLines, ...allLines].forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      ticker.appendChild(li);
    });

    ticker.classList.add("ticker-enhanced");
  }

  function initSearchPolish() {
    const form = $(".search-form");
    const input = form ? $("input[type='search']", form) : null;
    if (!form || !input) return;

    form.addEventListener("submit", (event) => {
      const query = input.value.trim();
      if (!query) {
        event.preventDefault();
        form.classList.add("is-shaking");
        input.placeholder = "Type a scandal first...";
        setTimeout(() => form.classList.remove("is-shaking"), 420);
        return;
      }

      if (!form.getAttribute("action")) {
        event.preventDefault();
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
      }
    });
  }

  function initArticleReadingTime() {
    const body = $(".article-body") || $("article");
    if (!body) return;

    const words = body.textContent.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 225));
    const target = $("[data-reading-time]") || $(".reading-time");

    if (target) {
      target.textContent = `${minutes} min read`;
      return;
    }

    const byline = $(".article-meta") || $(".byline") || $(".article-byline");
    if (!byline) return;

    const span = document.createElement("span");
    span.className = "reading-time";
    span.textContent = `${minutes} min read`;
    byline.appendChild(span);
  }

  function initLinkFlourish() {
    $$("a[href]").forEach((link) => {
      if (link.hostname && link.hostname !== window.location.hostname) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });
  }

  function initKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      if (
        event.target.matches("input, textarea, select") ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;

      if (event.key.toLowerCase() === "t") {
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }

      if (event.key === "/") {
        const input = $(".search-form input[type='search']");
        if (input) {
          event.preventDefault();
          input.focus();
        }
      }
    });
  }

  function initIssueStamp() {
    const header = $(".brand-row");
    if (!header || $(".issue-stamp")) return;

    const stamp = document.createElement("div");
    stamp.className = "issue-stamp";
    stamp.innerHTML = `<span>東東京</span><strong>SATIRE</strong>`;
    header.appendChild(stamp);
  }

  function injectSupportStyles() {
    if ($("#eastokyo-main-js-styles")) return;

    const style = document.createElement("style");
    style.id = "eastokyo-main-js-styles";
    style.textContent = `
    .site-header {
      position: static;
    }
  
        .site-header.is-scrolled {
          box-shadow: 0 10px 0 rgba(0,0,0,.12);
        }
  
        .site-header.is-hidden {
          transform: translateY(-100%);
        }
  
        .reading-progress {
          position: fixed;
          top: 0;
          left: 0;
          height: 6px;
          width: 0;
          background: #d71920;
          z-index: 9999;
          box-shadow: 0 2px 0 #15151a;
        }
  
        .back-to-top {
          position: fixed;
          right: 18px;
          bottom: 18px;
          z-index: 60;
          border: 3px solid #15151a;
          background: #fffaf2;
          color: #15151a;
          font-weight: 900;
          padding: 12px 14px;
          border-radius: 999px;
          box-shadow: 6px 6px 0 #d71920;
          cursor: pointer;
          opacity: 0;
          pointer-events: none;
          transform: translateY(14px);
          transition: opacity .22s ease, transform .22s ease;
        }
  
        .back-to-top.is-visible {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }
  
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(24px) rotate(-.3deg);
          transition: opacity .52s ease var(--reveal-delay), transform .52s ease var(--reveal-delay);
        }
  
        .reveal-on-scroll.is-revealed {
          opacity: 1;
          transform: translateY(0) rotate(0deg);
        }
  
        .ticker-enhanced {
          animation: eastokyoTicker 45s linear infinite;
        }
  
        .ticker-window:hover .ticker-enhanced {
          animation-play-state: paused;
        }
  
        @keyframes eastokyoTicker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
  
        .search-form.is-shaking {
          animation: eastokyoShake .38s ease;
        }
  
        @keyframes eastokyoShake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-7px); }
          50% { transform: translateX(7px); }
          75% { transform: translateX(-4px); }
        }
  
        .issue-stamp {
          justify-self: end;
          align-self: start;
          display: inline-grid;
          place-items: center;
          min-width: 86px;
          min-height: 86px;
          border: 4px solid #d71920;
          border-radius: 50%;
          color: #d71920;
          background: rgba(255,250,242,.82);
          transform: rotate(8deg);
          font-family: Arial, sans-serif;
          font-weight: 900;
          line-height: 1;
          box-shadow: 5px 5px 0 #15151a;
        }
  
        .issue-stamp span {
          font-size: 1.05rem;
          letter-spacing: .1em;
        }
  
        .issue-stamp strong {
          font-size: .72rem;
          letter-spacing: .12em;
        }
  
        .reading-time::before {
          content: "•";
          margin: 0 .55em;
        }
  
        @media (max-width: 680px) {
          .nav-list:not(.is-open) {
            display: none;
          }
  
          .nav-list.is-open {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
            overflow: visible;
          }
  
          .issue-stamp {
            display: none;
          }
  
          .back-to-top {
            right: 12px;
            bottom: 12px;
          }
        }
  
        @media (prefers-reduced-motion: reduce) {
          .ticker-enhanced,
          .search-form.is-shaking,
          .reveal-on-scroll,
          .site-header,
          .back-to-top {
            animation: none !important;
            transition: none !important;
          }
        }
      `;
    document.head.appendChild(style);
  }

  ready(() => {
    injectSupportStyles();
    initMobileNav();
    initStickyHeader();
    initReadingProgress();
    initBackToTop();
    initScrollReveal();
    // Ticker content/animation is owned by js/ticker.js.
    // Search form submission is owned by js/search.js.
    initArticleReadingTime();
    initLinkFlourish();
    initKeyboardShortcuts();
    initIssueStamp();
  });
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
