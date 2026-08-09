(() => {
  // Normalize the oldest engineering-page shape, where each h3 and its
  // following paragraphs were siblings rather than an article container.
  [...document.querySelectorAll("h3")]
    .filter((heading) => !heading.closest("article, .art, ul.articles > li"))
    .forEach((heading) => {
      const wrapper = document.createElement("div");
      heading.before(wrapper);
      let node = heading;
      do {
        const next = node.nextSibling;
        wrapper.append(node);
        node = next;
      } while (node && !["H2", "H3", "FOOTER"].includes(node.tagName));
      wrapper.querySelector(":scope > p:not(.meta)")?.classList.add("reader-summary");
      wrapper.classList.add("reader-legacy-item");
    });

  const items = [...document.querySelectorAll("article, .art, ul.articles > li, .reader-legacy-item")];
  const collapsibleItems = items.filter((item) =>
    item.querySelector(".summary, .sum, .sup, .alert, .note, .reader-summary")
  );

  const makeButton = (className, label) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.textContent = label;
    return button;
  };

  const setExpanded = (item, button, expanded) => {
    item.classList.toggle("is-expanded", expanded);
    button.setAttribute("aria-expanded", String(expanded));
    button.textContent = expanded ? "詳細を閉じる" : "詳細を読む";
  };

  collapsibleItems.forEach((item, index) => {
    item.classList.add("reader-item");
    if (!item.id) item.id = `article-${index + 1}`;

    const button = makeButton("reader-button reader-toggle", "詳細を読む");
    button.setAttribute("aria-controls", item.id);
    button.addEventListener("click", () => {
      setExpanded(item, button, !item.classList.contains("is-expanded"));
      syncExpandAll();
    });
    item.append(button);
    setExpanded(item, button, false);
  });

  const highlight = document.querySelector(".hi, .highlight");
  if (highlight?.querySelector("p")) {
    highlight.classList.add("reader-collapsible");
    const button = makeButton("reader-button reader-toggle", "詳細を読む");
    button.addEventListener("click", () => {
      setExpanded(highlight, button, !highlight.classList.contains("is-expanded"));
    });
    highlight.append(button);
    setExpanded(highlight, button, false);
  }

  const header = document.querySelector("header, h1");
  if (!header || collapsibleItems.length === 0) return;

  const toolbar = document.createElement("nav");
  toolbar.className = "reader-toolbar";
  toolbar.setAttribute("aria-label", "記事表示とカテゴリ移動");

  const actions = document.createElement("div");
  actions.className = "reader-actions";
  const expandAll = makeButton("reader-button reader-expand-all", "すべて展開");
  const count = document.createElement("span");
  count.className = "reader-count";
  count.textContent = `${collapsibleItems.length}件`;
  actions.append(expandAll, count);
  toolbar.append(actions);

  const headings = [...document.querySelectorAll("h2")].filter(
    (heading) => !heading.closest(".hi, .highlight")
  );
  if (headings.length > 0) {
    const categories = document.createElement("div");
    categories.className = "reader-categories";
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `category-${index + 1}`;
      const link = document.createElement("a");
      link.className = "reader-category";
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent.trim();
      categories.append(link);
    });
    toolbar.append(categories);
  }

  const syncExpandAll = () => {
    const allExpanded = collapsibleItems.every((item) =>
      item.classList.contains("is-expanded")
    );
    expandAll.textContent = allExpanded ? "すべて折りたたむ" : "すべて展開";
    expandAll.setAttribute("aria-expanded", String(allExpanded));
  };

  expandAll.addEventListener("click", () => {
    const shouldExpand = collapsibleItems.some(
      (item) => !item.classList.contains("is-expanded")
    );
    collapsibleItems.forEach((item) => {
      const button = item.querySelector(":scope > .reader-toggle");
      setExpanded(item, button, shouldExpand);
    });
    syncExpandAll();
  });

  header.insertAdjacentElement("afterend", toolbar);
  syncExpandAll();
  document.documentElement.classList.add("reader-ready");
})();
