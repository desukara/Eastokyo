/*
==========================================
Eastokyo Article Loader
article.js
==========================================
*/

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug || typeof getArticle !== "function") {
    window.location.href = "404.html";
    return;
  }

  const article = getArticle(slug);

  if (!article) {
    window.location.href = "404.html";
    return;
  }

  document.title = `${article.title} | Eastokyo`;

  setText("#article-section", article.section);
  setText("#article-title", article.title);
  setText("#article-excerpt", article.excerpt);
  setText("#article-author", article.author);
  setText("#article-date", formatDate(article.date));
  setText("#article-reading", `${article.readingTime} min read`);

  const image = document.querySelector("#article-image");

  if (image) {
    image.src = article.image;
    image.alt = article.title;
  }

  const body = document.querySelector("#article-body");

  if (body) {
    body.innerHTML = article.body;
  }

  buildTags(article);

  buildRelated(article);

  buildNavigation(article);
});

function setText(selector, value) {
  const element = document.querySelector(selector);

  if (element) {
    element.textContent = value;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",

    month: "long",

    day: "numeric",
  });
}

function buildTags(article) {
  const container = document.querySelector("#article-tags");

  if (!container) return;

  container.innerHTML = "";

  article.tags.forEach((tag) => {
    const link = document.createElement("a");

    link.href = `search.html?q=${encodeURIComponent(tag)}`;

    link.textContent = tag;

    container.appendChild(link);
  });
}

function buildRelated(article) {
  const list = document.querySelector("#related-articles");

  if (!list) return;

  list.innerHTML = "";

  const related = EASTOKYO_ARTICLES.filter(
    (a) => a.slug !== article.slug && a.section === article.section
  ).slice(0, 4);

  related.forEach((item) => {
    const li = document.createElement("li");

    li.innerHTML = `
  
        <a href="article.html?slug=${item.slug}">
  
          ${item.title}
  
        </a>
  
      `;

    list.appendChild(li);
  });
}

function buildNavigation(article) {
  const index = EASTOKYO_ARTICLES.findIndex((a) => a.slug === article.slug);

  const prev = EASTOKYO_ARTICLES[index - 1];

  const next = EASTOKYO_ARTICLES[index + 1];

  const prevLink = document.querySelector("#prev-article");
  const nextLink = document.querySelector("#next-article");

  if (prevLink) {
    if (prev) {
      prevLink.href = `article.html?slug=${prev.slug}`;
      prevLink.textContent = `← ${prev.title}`;
    } else {
      prevLink.style.display = "none";
    }
  }

  if (nextLink) {
    if (next) {
      nextLink.href = `article.html?slug=${next.slug}`;
      nextLink.textContent = `${next.title} →`;
    } else {
      nextLink.style.display = "none";
    }
  }
}
