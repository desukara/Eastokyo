"use strict";

/**
 * Eastokyo Travel Magazine
 * Homepage progressive enhancements
 *
 * The site remains fully navigable if JavaScript is unavailable.
 */

(() => {
  const documentElement = document.documentElement;
  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  documentElement.classList.add("js-enabled");

  // Automatically update the footer year.
  const setCurrentYear = () => {
    const yearElement = document.querySelector("#current-year");

    if (yearElement) {
      yearElement.textContent = String(new Date().getFullYear());
    }
  };

  // Create the slim vertical Eastokyo reading indicator.
  const createReadingProgress = () => {
    const progressTrack = document.createElement("div");
    const progressBar = document.createElement("div");

    progressTrack.className = "eastokyo-progress";
    progressBar.className = "eastokyo-progress__bar";

    progressTrack.setAttribute("aria-hidden", "true");
    progressTrack.append(progressBar);
    document.body.append(progressTrack);

    Object.assign(progressTrack.style, {
      position: "fixed",
      top: "0",
      right: "0",
      zIndex: "999",
      width: "3px",
      height: "100dvh",
      pointerEvents: "none",
      background: "rgba(23, 23, 23, 0.12)",
    });

    Object.assign(progressBar.style, {
      width: "100%",
      height: "100%",
      transform: "scaleY(0)",
      transformOrigin: "top",
      background: "var(--vermilion, #cf3a2b)",
      willChange: "transform",
    });

    let frameRequested = false;

    const updateProgress = () => {
      const scrollableDistance =
        documentElement.scrollHeight - documentElement.clientHeight;

      const progress =
        scrollableDistance > 0
          ? Math.min(Math.max(window.scrollY / scrollableDistance, 0), 1)
          : 0;

      progressBar.style.transform = `scaleY(${progress})`;
      frameRequested = false;
    };

    const requestProgressUpdate = () => {
      if (!frameRequested) {
        window.requestAnimationFrame(updateProgress);
        frameRequested = true;
      }
    };

    updateProgress();

    window.addEventListener("scroll", requestProgressUpdate, {
      passive: true,
    });

    window.addEventListener("resize", requestProgressUpdate, {
      passive: true,
    });
  };

  // Highlight the navigation link for the section currently in view.
  const activateSectionNavigation = () => {
    const navigationLinks = Array.from(
      document.querySelectorAll('.primary-nav a[href^="#"]')
    );

    if (!navigationLinks.length || !("IntersectionObserver" in window)) {
      return;
    }

    const sections = navigationLinks
      .map((link) => {
        const selector = link.getAttribute("href");
        const section = selector ? document.querySelector(selector) : null;

        return section ? { link, section } : null;
      })
      .filter(Boolean);

    const setActiveLink = (activeLink) => {
      navigationLinks.forEach((link) => {
        if (link === activeLink) {
          link.setAttribute("aria-current", "location");
          link.style.color = "var(--paper-light, #f4ecdf)";
        } else {
          link.removeAttribute("aria-current");
          link.style.removeProperty("color");
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              second.intersectionRatio - first.intersectionRatio
          );

        if (!visibleEntries.length) {
          return;
        }

        const match = sections.find(
          ({ section }) => section === visibleEntries[0].target
        );

        if (match) {
          setActiveLink(match.link);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.05, 0.2, 0.5],
      }
    );

    sections.forEach(({ section }) => {
      observer.observe(section);
    });
  };

  // Add restrained pointer movement to editorial image areas.
  const enhanceImageMovement = () => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    if (reducedMotionQuery.matches || !finePointer) {
      return;
    }

    const imageAreas = document.querySelectorAll(
      [
        ".cover-story__media .image-placeholder",
        ".story-card__media .image-placeholder",
      ].join(", ")
    );

    imageAreas.forEach((imageArea) => {
      imageArea.style.willChange = "transform";

      imageArea.style.transition =
        "transform 650ms var(--ease-editorial, " +
        "cubic-bezier(0.22, 1, 0.36, 1))";

      const handlePointerMove = (event) => {
        const bounds = imageArea.getBoundingClientRect();

        if (!bounds.width || !bounds.height) {
          return;
        }

        const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;

        const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;

        const rotateX = vertical * -1.2;
        const rotateY = horizontal * 1.2;

        imageArea.style.transform =
          `perspective(1100px) ` +
          `rotateX(${rotateX}deg) ` +
          `rotateY(${rotateY}deg) ` +
          `scale(1.012)`;
      };

      const resetImage = () => {
        imageArea.style.transform =
          "perspective(1100px) rotateX(0deg) rotateY(0deg) scale(1)";
      };

      imageArea.addEventListener("pointermove", handlePointerMove);
      imageArea.addEventListener("pointerleave", resetImage);
      imageArea.addEventListener("pointercancel", resetImage);
    });
  };

  // Add subtle transitions between local HTML pages.
  const enablePageTransitions = () => {
    if (
      reducedMotionQuery.matches ||
      typeof document.body.animate !== "function"
    ) {
      return;
    }

    const links = document.querySelectorAll("a[href]");
    let navigationStarted = false;

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        if (
          event.defaultPrevented ||
          navigationStarted ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          link.hasAttribute("download") ||
          link.target === "_blank"
        ) {
          return;
        }

        const destination = new URL(link.href, window.location.href);
        const current = new URL(window.location.href);

        const isSamePageHash =
          destination.pathname === current.pathname &&
          destination.search === current.search &&
          Boolean(destination.hash);

        const isNavigableHtmlPage =
          destination.origin === current.origin &&
          !isSamePageHash &&
          (destination.pathname.endsWith(".html") ||
            destination.pathname.endsWith("/"));

        if (!isNavigableHtmlPage) {
          return;
        }

        event.preventDefault();
        navigationStarted = true;

        const animation = document.body.animate(
          [
            {
              opacity: 1,
              transform: "translateY(0)",
            },
            {
              opacity: 0,
              transform: "translateY(-8px)",
            },
          ],
          {
            duration: 240,
            easing: "cubic-bezier(0.4, 0, 1, 1)",
            fill: "forwards",
          }
        );

        animation.addEventListener("finish", () => {
          window.location.assign(destination.href);
        });

        animation.addEventListener("cancel", () => {
          navigationStarted = false;
        });
      });
    });

    window.addEventListener("pageshow", () => {
      navigationStarted = false;

      document.body.getAnimations().forEach((animation) => {
        animation.cancel();
      });

      document.body.style.removeProperty("opacity");
      document.body.style.removeProperty("transform");
    });
  };

  // Keep same-page anchor navigation smooth and accessible.
  const enhanceAnchorNavigation = () => {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const selector = link.getAttribute("href");

        if (!selector || selector === "#") {
          return;
        }

        const target = document.querySelector(selector);

        if (!target) {
          return;
        }

        event.preventDefault();

        target.scrollIntoView({
          behavior: reducedMotionQuery.matches ? "auto" : "smooth",
          block: "start",
        });

        window.history.replaceState(null, "", selector);
      });
    });
  };

  const initialize = () => {
    setCurrentYear();
    createReadingProgress();
    activateSectionNavigation();
    enhanceImageMovement();
    enablePageTransitions();
    enhanceAnchorNavigation();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true,
    });
  } else {
    initialize();
  }
})();
