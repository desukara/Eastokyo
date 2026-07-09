(() => {
  "use strict";

  const articles = window.EASTOKYO_ARTICLES || [];
  const form = document.querySelector(".search-form");
  const input = document.querySelector("#site-search");

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .trim();
  }

  function articleUrl(article) {
    return article && article.slug
      ? `article.html?slug=${encodeURIComponent(article.slug)}`
      : "search.html";
  }

  function searchArticles(query) {
    const q = normalize(query);
    if (!q) return [];

    return articles.filter((article) => {
      const haystack = [
        article.title,
        article.section,
        article.excerpt,
        article.author,
        Array.isArray(article.tags) ? article.tags.join(" ") : "",
      ]
        .map(normalize)
        .join(" ");

      return haystack.includes(q);
    });
  }

  function goToSearchPage(query) {
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
  }

  function renderSearchPage() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    const resultsRoot = document.querySelector("#search-results");
    const heading = document.querySelector("#search-heading");
    const count = document.querySelector("#search-count");

    if (!resultsRoot) return;

    if (input && query && !input.value) input.value = query;
    if (heading)
      heading.textContent = query ? `Search: ${query}` : "Search Eastokyo";

    const results = searchArticles(query);

    if (count) {
      count.textContent = `${results.length} result${
        results.length === 1 ? "" : "s"
      } found`;
    }

    resultsRoot.innerHTML = "";

    if (!query) {
      resultsRoot.innerHTML = `
        <div class="search-empty">
          <h2>Type something scandalous.</h2>
          <p>Try Tokyo, politics, cat, train, AI, or vending machine.</p>
        </div>
      `;
      return;
    }

    if (!results.length) {
      resultsRoot.innerHTML = `
        <div class="search-empty">
          <h2>No scandal found.</h2>
          <p>The newsroom checked under the fax machine. Nothing.</p>
        </div>
      `;
      return;
    }

    results.forEach((article) => {
      const url = articleUrl(article);
      const card = document.createElement("article");
      card.className = "search-result-card";
      card.innerHTML = `
        <p class="section-kicker">${article.section}</p>
        <h2><a href="${url}">${article.title}</a></h2>
        <p>${article.excerpt}</p>
        <a class="read-more" href="${url}">Read story</a>
      `;
      resultsRoot.appendChild(card);
    });
  }

  if (form && input && !form.dataset.searchOwnedBySearchJs) {
    form.dataset.searchOwnedBySearchJs = "true";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = input.value.trim();

      if (!query) {
        input.placeholder = "Search scandals, cats, trains...";
        form.classList.add("is-shaking");
        setTimeout(() => form.classList.remove("is-shaking"), 400);
        return;
      }

      goToSearchPage(query);
    });
  }

  renderSearchPage();
})();
