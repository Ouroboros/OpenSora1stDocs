"use strict";

// 结构：大项（左侧标题）→ 章节（顶部标签，左侧一级条目）→ 小节（左侧缩进条目）
// 路由：#/<大项>/<章节>/<小节>
const Manual = (() => {
  const STAGE_WIDTH = 1920;
  const STAGE_HEIGHT = 1080;
  const MAX_GLOBAL_RESULTS = 120;
  const pages = [];
  const homeTabs = [{ id: "", label: "INDEX", tab: "目　录", href: "#/" }];
  const localQueries = new Map();

  let tabsEl;
  let sidebarEl;
  let titleEl;
  let bodyEl;
  let globalSearchEl;
  let globalInputEl;
  let globalClearEl;
  let globalResultsEl;
  let localInputEl;
  let localCountEl;
  let localClearEl;

  let allEntries = [];
  let pageSearchMap = new Map();
  let currentSidebarKey = null;
  let sidebarModel = null;
  let globalSelected = -1;
  let globalLinks = [];

  function register(page) {
    pages.push(page);
  }

  function parseRoute() {
    const path = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    const [pageId = "", chapterId = "", topicId = ""] = path.split("/");

    return { pageId, chapterId, topicId };
  }

  function href(...parts) {
    const path = parts.filter((part) => part !== undefined && part !== "").join("/");

    return `#/${path}`;
  }

  function el(tag, attrs = {}, html = "") {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value !== "" && value !== false && value !== undefined && value !== null) {
        node.setAttribute(key, value === true ? "" : String(value));
      }
    }

    if (html !== "") {
      node.innerHTML = html;
    }

    return node;
  }

  function escapeHtml(text) {
    return String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function normalize(text) {
    return String(text ?? "")
      .toLowerCase()
      .replace(/％/g, "%")
      .replace(/･/g, "·");
  }

  function tokenize(raw) {
    return normalize(raw).trim().split(/\s+/).filter(Boolean);
  }

  function matchesTokens(haystack, tokens) {
    for (const token of tokens) {
      if (!haystack.includes(token)) {
        return false;
      }
    }

    return true;
  }

  function highlight(text, tokens) {
    const source = String(text ?? "");
    if (tokens.length === 0) {
      return escapeHtml(source);
    }

    const parts = [...new Set(tokens)]
      .sort((left, right) => right.length - left.length)
      .map((token) =>
        token
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
          .replace(/%/g, "[%％]")
          .replace(/·/g, "[·･]"),
      );
    const regex = new RegExp(parts.join("|"), "gi");
    let out = "";
    let last = 0;
    for (const match of source.matchAll(regex)) {
      const start = match.index;
      out += escapeHtml(source.slice(last, start));
      out += `<mark>${escapeHtml(match[0])}</mark>`;
      last = start + match[0].length;
    }

    return out + escapeHtml(source.slice(last));
  }

  function extractFallbackKeywords(html) {
    const matches = String(html ?? "").match(/<(h3|p)[^>]*>[\s\S]*?<\/\1>/gi) ?? [];

    return matches
      .slice(0, 6)
      .map((chunk) => chunk.replace(/<[^>]+>/g, " "))
      .join(" ");
  }

  function buildIndex() {
    allEntries = [];
    pageSearchMap = new Map();
    for (const page of pages) {
      const pageChunks = [page.title, page.group, page.summary];
      for (const chapter of page.chapters) {
        pageChunks.push(chapter.tab, chapter.label ?? "", chapter.id);
        for (const topic of chapter.topics) {
          const extra = topic.keywords ?? extractFallbackKeywords(topic.html);
          pageChunks.push(topic.title, extra);
          const entry = {
            page,
            chapter,
            topic,
            href: href(page.id, chapter.id, topic.id),
            titleText: normalize(topic.title),
            chapterText: normalize(`${chapter.tab} ${chapter.label ?? ""} ${chapter.id}`),
            idText: normalize(topic.id),
            localSearch: normalize(`${chapter.tab} ${topic.title} ${topic.id} ${extra}`),
            fullSearch: normalize(`${page.title} ${page.group} ${chapter.tab} ${chapter.label ?? ""} ${topic.title} ${topic.id} ${extra}`),
          };
          allEntries.push(entry);
        }
      }

      pageSearchMap.set(page.id, normalize(pageChunks.join(" ")));
    }
  }

  function isMobile() {
    return window.innerWidth < 1000 || window.innerWidth < window.innerHeight;
  }

  function setMenuOpen(open) {
    document.documentElement.classList.toggle("menu-open", open);
  }

  function fitStage() {
    const mobile = isMobile();
    document.documentElement.classList.toggle("mobile", mobile);
    if (mobile) {
      return;
    }

    setMenuOpen(false);
    const scale = Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);
    const root = document.documentElement.style;
    root.setProperty("--scale", String(scale));
    root.setProperty("--stage-w", `${Math.max(STAGE_WIDTH, window.innerWidth / scale)}px`);
    root.setProperty("--stage-h", `${Math.max(STAGE_HEIGHT, window.innerHeight / scale)}px`);
  }

  function flatTopics(page) {
    return page.chapters.flatMap((chapter) => chapter.topics.map((topic) => ({ chapter, topic })));
  }

  function renderTabs(tabs, activeId) {
    tabsEl.replaceChildren();
    for (const tab of tabs) {
      tabsEl.append(
        el(
          "a",
          { class: tab.id === activeId ? "tab active" : "tab", href: tab.href },
          `<div class="tab-face"><small>${tab.label}</small><span>${tab.tab}</span></div>`,
        ),
      );
    }

    const active = tabsEl.querySelector(".tab.active");
    tabsEl.scrollLeft = 0;
    if (active && active.offsetLeft + active.offsetWidth > tabsEl.clientWidth) {
      tabsEl.scrollLeft = active.offsetLeft + active.offsetWidth - tabsEl.clientWidth;
    }
  }

  // ---------- 全局搜索 ----------

  function closeGlobalResults() {
    globalResultsEl.hidden = true;
    globalSelected = -1;
    globalLinks = [];
  }

  function selectGlobalItem(index) {
    if (globalLinks.length === 0) {
      globalSelected = -1;

      return;
    }

    const clamped = (index + globalLinks.length) % globalLinks.length;
    if (globalSelected >= 0 && globalLinks[globalSelected]) {
      globalLinks[globalSelected].classList.remove("selected");
    }

    globalSelected = clamped;
    const item = globalLinks[globalSelected];
    item.classList.add("selected");
    item.scrollIntoView({ block: "nearest" });
  }

  function renderGlobalResults() {
    const raw = globalInputEl.value;
    globalClearEl.hidden = raw === "";
    const tokens = tokenize(raw);
    if (tokens.length === 0) {
      closeGlobalResults();

      return;
    }

    const wantList = tokens.some((token) => token.includes("一览"));
    const byPage = new Map();
    let total = 0;
    for (const entry of allEntries) {
      if (!matchesTokens(entry.fullSearch, tokens)) {
        continue;
      }

      let score = 0;
      if (matchesTokens(entry.titleText, tokens)) {
        score += 4;
      }

      if (matchesTokens(entry.idText, tokens) || matchesTokens(entry.chapterText, tokens)) {
        score += 2;
      }

      if (entry.topic.isList) {
        score += wantList ? 3 : 0;
      } else {
        score += 1;
      }

      if (!byPage.has(entry.page.id)) {
        byPage.set(entry.page.id, { page: entry.page, items: [] });
      }

      byPage.get(entry.page.id).items.push({ entry, score });
      total += 1;
    }

    globalResultsEl.replaceChildren();
    globalLinks = [];
    globalSelected = -1;
    if (total === 0) {
      globalResultsEl.append(el("div", { class: "global-empty" }, `没有找到与「${escapeHtml(raw.trim())}」相关的内容`));
      globalResultsEl.hidden = false;

      return;
    }

    const truncated = total > MAX_GLOBAL_RESULTS;
    globalResultsEl.append(
      el(
        "div",
        { class: "global-summary" },
        `共找到 <b>${total}</b> 项${truncated ? `（仅显示前 ${MAX_GLOBAL_RESULTS} 项）` : ""}`,
      ),
    );

    const listWrap = el("div", { class: "global-list" });
    let budget = MAX_GLOBAL_RESULTS;
    for (const page of pages) {
      const group = byPage.get(page.id);
      if (!group || budget <= 0) {
        continue;
      }

      group.items.sort((left, right) => right.score - left.score);
      listWrap.append(
        el("div", { class: "global-group" }, `${escapeHtml(page.title)}<span>${group.items.length}</span>`),
      );
      for (const { entry } of group.items) {
        if (budget <= 0) {
          break;
        }

        const hint = entry.topic.matchHint ? entry.topic.matchHint(tokens) : entry.topic.preview ?? "";
        const link = el(
          "a",
          { class: "global-item", href: entry.href },
          `<span class="global-row"><span class="global-title">${highlight(entry.topic.title, tokens)}</span><span class="global-tag">${escapeHtml(entry.chapter.tab)}</span></span>${
            hint ? `<span class="global-sub">${highlight(hint, tokens)}</span>` : ""
          }`,
        );
        link.addEventListener("click", () => {
          closeGlobalResults();
          setMenuOpen(false);
        });
        listWrap.append(link);
        globalLinks.push(link);
        budget -= 1;
      }
    }

    globalResultsEl.append(listWrap);
    globalResultsEl.hidden = false;
  }

  // ---------- 左侧目录与当前大项过滤 ----------

  function scrollActiveIntoView(scroller, active) {
    if (!scroller || !active || active.closest("li")?.hidden) {
      return;
    }

    const top = active.offsetTop;
    const bottom = top + active.offsetHeight;
    if (top >= scroller.scrollTop && bottom <= scroller.scrollTop + scroller.clientHeight) {
      return;
    }

    scroller.scrollTop = Math.max(0, top - scroller.clientHeight / 2 + active.offsetHeight / 2);
  }

  function applyTableFilter(raw, tokens) {
    const table = bodyEl.querySelector('table[data-filterable="true"]');
    if (!table) {
      return;
    }

    let bar = table.previousElementSibling;
    if (!bar || !bar.classList.contains("table-filter-bar")) {
      bar = el("div", { class: "table-filter-bar" });
      table.before(bar);
    }

    let empty = table.nextElementSibling;
    if (!empty || !empty.classList.contains("table-empty")) {
      empty = el("p", { class: "table-empty", hidden: true });
      table.after(empty);
    }

    const rows = [...table.querySelectorAll("tr[data-search]")];
    let shown = 0;
    for (const row of rows) {
      if (row._search === undefined) {
        row._search = normalize(row.dataset.search);
      }

      const hit = tokens.length === 0 || matchesTokens(row._search, tokens);
      row.hidden = !hit;
      if (hit) {
        shown += 1;
      }
    }

    if (tokens.length > 0) {
      bar.classList.remove("idle");
      bar.innerHTML = `<span>当前筛选：「<em>${escapeHtml(raw.trim())}</em>」— 显示 <b>${shown}</b> / ${rows.length} 项</span><button type="button" class="table-filter-btn">清除筛选</button>`;
      bar.querySelector("button").addEventListener("click", () => {
        if (localInputEl) {
          localInputEl.value = "";
          applyLocalFilter();
        }
      });
      empty.textContent = `没有符合「${raw.trim()}」的条目。`;
      empty.hidden = shown > 0;
    } else {
      bar.classList.add("idle");
      bar.innerHTML = `<span>共 ${rows.length} 项</span><button type="button" class="table-filter-btn">筛选本页</button>`;
      bar.querySelector("button").addEventListener("click", () => {
        setMenuOpen(true);
        localInputEl?.focus();
      });
      empty.hidden = true;
    }
  }

  function applyLocalFilter() {
    if (!sidebarModel || !localInputEl) {
      return;
    }

    const raw = localInputEl.value;
    localQueries.set(currentSidebarKey, raw);
    localClearEl.hidden = raw === "";
    const tokens = tokenize(raw);

    if (sidebarModel.mode === "home") {
      let shown = 0;
      const visibleIds = new Set();
      for (const item of sidebarModel.items) {
        const hit = tokens.length === 0 || matchesTokens(item.search, tokens);
        item.li.hidden = !hit;
        if (hit) {
          shown += 1;
          visibleIds.add(item.page.id);
        }
      }

      sidebarModel.emptyEl.hidden = shown > 0;
      localCountEl.hidden = tokens.length === 0;
      localCountEl.textContent = `${shown}/${sidebarModel.items.length}`;

      const cards = [...bodyEl.querySelectorAll(".card[data-page-id]")];
      if (cards.length > 0) {
        for (const card of cards) {
          card.hidden = !visibleIds.has(card.dataset.pageId);
        }

        const homeEmpty = bodyEl.querySelector(".home-empty");
        if (homeEmpty) {
          homeEmpty.hidden = shown > 0;
        }
      }

      return;
    }

    const hasNonList = sidebarModel.groups.some((group) => group.topics.some((item) => !item.isList));
    let total = 0;
    let matched = 0;
    let anyVisible = false;
    for (const group of sidebarModel.groups) {
      const chapterHit = tokens.length > 0 && matchesTokens(group.chapterSearch, tokens);
      let groupHasMatch = false;
      let groupNonListMatch = false;
      for (const item of group.topics) {
        if (!hasNonList || !item.isList) {
          total += 1;
        }

        const hit = tokens.length === 0 || chapterHit || matchesTokens(item.search, tokens);
        item._hit = hit;
        if (hit) {
          groupHasMatch = true;
          if (!item.isList) {
            groupNonListMatch = true;
          }

          if (!hasNonList || !item.isList) {
            matched += 1;
          }
        }
      }

      for (const item of group.topics) {
        const visible = item._hit || (item.isList && groupNonListMatch);
        item.li.hidden = !visible;
      }

      group.chapterLi.hidden = !groupHasMatch;
      if (groupHasMatch) {
        anyVisible = true;
      }
    }

    sidebarModel.emptyEl.hidden = anyVisible;
    localCountEl.hidden = tokens.length === 0;
    localCountEl.textContent = `${matched}/${total}`;
    applyTableFilter(raw, tokens);
  }

  function buildSidebarShell(head, placeholder) {
    sidebarEl.replaceChildren();
    sidebarEl.append(
      el("a", { class: "side-head", href: "#/", title: "返回目录" }, `<div class="side-head-face"><span>${head}</span></div>`),
    );

    const filterWrap = el(
      "div",
      { class: "side-filter", role: "search" },
      `<div class="search-box">
        <input id="local-filter-input" type="search" placeholder="${escapeHtml(placeholder)}" autocomplete="off" spellcheck="false" aria-label="${escapeHtml(placeholder)}">
        <span id="local-filter-count" class="filter-count" hidden></span>
        <button id="local-filter-clear" class="search-clear" type="button" title="清除" hidden>×</button>
      </div>`,
    );
    sidebarEl.append(filterWrap);
    localInputEl = filterWrap.querySelector("#local-filter-input");
    localCountEl = filterWrap.querySelector("#local-filter-count");
    localClearEl = filterWrap.querySelector("#local-filter-clear");

    const scroller = el("div", { class: "side-scroll" });
    const list = el("ul", { class: "side-list" });
    scroller.append(list);
    sidebarEl.append(scroller);

    localInputEl.value = localQueries.get(currentSidebarKey) ?? "";
    localInputEl.addEventListener("input", applyLocalFilter);
    localInputEl.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (localInputEl.value !== "") {
          localInputEl.value = "";
          applyLocalFilter();
        } else {
          localInputEl.blur();
        }
      } else if (event.key === "Enter") {
        const first =
          list.querySelector("li:not([hidden]) a.side-item:not(.chapter):not(.is-list)") ??
          list.querySelector("li:not([hidden]) a.side-item:not(.chapter)");
        if (first) {
          location.hash = first.getAttribute("href");
        }
      }
    });
    localClearEl.addEventListener("click", () => {
      localInputEl.value = "";
      applyLocalFilter();
      localInputEl.focus();
    });

    return { scroller, list };
  }

  function mountHomeSidebar() {
    const key = "";
    if (currentSidebarKey !== key) {
      currentSidebarKey = key;
      const { scroller, list } = buildSidebarShell("目录", "筛选大项…");
      const items = [];
      for (const page of pages) {
        const li = el("li");
        const link = el("a", { class: "side-item", href: href(page.id), title: page.title }, page.title);
        li.append(link);
        list.append(li);
        items.push({ page, li, link, search: pageSearchMap.get(page.id) ?? normalize(page.title) });
      }

      const emptyEl = el("li", { class: "side-empty", hidden: true }, "无匹配项");
      list.append(emptyEl);
      sidebarModel = { mode: "home", scroller, items, emptyEl };
    }

    applyLocalFilter();
  }

  function mountPageSidebar(page, activeChapter, activeTopic) {
    const key = page.id;
    if (currentSidebarKey !== key) {
      currentSidebarKey = key;
      const { scroller, list } = buildSidebarShell(page.title, `筛选${page.title}…`);
      const entryMap = new Map();
      for (const entry of allEntries) {
        if (entry.page === page) {
          entryMap.set(entry.topic, entry);
        }
      }

      const groups = [];
      for (const group of page.chapters) {
        const chapterLi = el("li");
        const chapterLink = el(
          "a",
          { class: "side-item chapter", href: href(page.id, group.id, group.topics[0].id), title: group.tab },
          group.tab,
        );
        chapterLi.append(chapterLink);
        list.append(chapterLi);

        const topics = [];
        for (const item of group.topics) {
          const li = el("li", { class: "sub" });
          const link = el(
            "a",
            {
              class: item.isList ? "side-item is-list" : "side-item",
              href: href(page.id, group.id, item.id),
              title: item.title,
            },
            item.title,
          );
          li.append(link);
          list.append(li);
          const indexed = entryMap.get(item);
          topics.push({
            topic: item,
            chapter: group,
            li,
            link,
            isList: Boolean(item.isList),
            search: indexed ? indexed.localSearch : normalize(`${group.tab} ${item.title} ${item.id}`),
          });
        }

        groups.push({
          chapter: group,
          chapterLi,
          chapterLink,
          chapterSearch: normalize(`${group.tab} ${group.label ?? ""} ${group.id}`),
          topics,
        });
      }

      const emptyEl = el("li", { class: "side-empty", hidden: true }, "无匹配项");
      list.append(emptyEl);
      sidebarModel = { mode: "page", page, scroller, groups, emptyEl };
    }

    let activeLink = null;
    for (const group of sidebarModel.groups) {
      group.chapterLink.classList.toggle("current", group.chapter === activeChapter);
      for (const item of group.topics) {
        const isActive = item.topic === activeTopic;
        item.link.classList.toggle("active", isActive);
        if (isActive) {
          activeLink = item.link;
        }
      }
    }

    applyLocalFilter();
    scrollActiveIntoView(sidebarModel.scroller, activeLink);
  }

  function setTitle(text) {
    titleEl.innerHTML = `<span class="diamond"></span>${text}`;
  }

  function renderHome() {
    document.title = "OpenSora1st 说明书";
    renderTabs(homeTabs, "");
    setTitle("说明书目录");
    bodyEl.replaceChildren();
    bodyEl.append(
      el(
        "div",
        { class: "caption" },
        "<p>本说明书讲解战斗等游戏系统<em>实际的运作规则</em>。</p><p>从左侧条目进入各个大项，或使用左上角全局搜索。</p>",
      ),
    );
    const cards = el("div", { class: "cards" });
    for (const page of pages) {
      const chapters = page.chapters.map((chapter) => `<li>${chapter.tab}</li>`).join("");
      cards.append(
        el(
          "a",
          { class: "card", href: href(page.id), "data-page-id": page.id },
          `<small>${page.group}</small><h3>${page.title}</h3><p>${page.summary}</p><ol>${chapters}</ol>`,
        ),
      );
    }

    bodyEl.append(cards);
    bodyEl.append(el("div", { class: "empty home-empty", hidden: true }, "没有匹配的大项。"));
    mountHomeSidebar();
  }

  function renderNotFound() {
    document.title = "未找到 · OpenSora1st 说明书";
    renderTabs(homeTabs, null);
    setTitle("未找到");
    bodyEl.replaceChildren(el("div", { class: "empty" }, `没有这个页面。<a href="#/">返回目录</a>`));
    mountHomeSidebar();
  }

  function renderTopic(page, chapter, topic) {
    document.title = `${topic.title} · ${page.title} · OpenSora1st 说明书`;
    renderTabs(
      page.chapters.map((item) => ({ id: item.id, label: item.label, tab: item.tab, href: href(page.id, item.id) })),
      chapter.id,
    );

    setTitle(topic.title);
    bodyEl.replaceChildren();
    const body = el("div", { class: "sec-body" }, topic.html);
    bodyEl.append(body);

    const flat = flatTopics(page);
    const index = flat.findIndex((entry) => entry.topic === topic);
    const link = (entry, text) => `<a href="${href(page.id, entry.chapter.id, entry.topic.id)}">${text}</a>`;
    const pager = el("div", { class: "pager" });
    pager.append(el("span", {}, index > 0 ? link(flat[index - 1], `‹ ${flat[index - 1].topic.title}`) : ""));
    pager.append(el("span", {}, index < flat.length - 1 ? link(flat[index + 1], `${flat[index + 1].topic.title} ›`) : ""));
    bodyEl.append(pager);
    topic.mount?.(body);
    mountPageSidebar(page, chapter, topic);
  }

  function render() {
    const { pageId, chapterId, topicId } = parseRoute();
    bodyEl.scrollTop = 0;
    setMenuOpen(false);
    closeGlobalResults();
    if (isMobile()) {
      window.scrollTo(0, 0);
    }

    if (pageId === "") {
      renderHome();

      return;
    }

    const page = pages.find((item) => item.id === pageId);
    if (page === undefined) {
      renderNotFound();

      return;
    }

    const chapter = page.chapters.find((item) => item.id === chapterId) ?? page.chapters[0];
    const topic = chapter.topics.find((item) => item.id === topicId) ?? chapter.topics[0];
    if (chapter.id !== chapterId || topic.id !== topicId) {
      history.replaceState(null, "", href(page.id, chapter.id, topic.id));
    }

    renderTopic(page, chapter, topic);
  }

  function step(kind, delta) {
    const { pageId, chapterId, topicId } = parseRoute();
    const page = pages.find((item) => item.id === pageId);
    if (page === undefined) {
      if (kind === "topic" && pages.length > 0) {
        location.hash = href(pages[delta > 0 ? 0 : pages.length - 1].id);
      }

      return;
    }

    if (kind === "chapter") {
      const count = page.chapters.length;
      const index = page.chapters.findIndex((item) => item.id === chapterId);
      location.hash = href(page.id, page.chapters[(index + delta + count) % count].id);

      return;
    }

    let list;
    if (sidebarModel?.mode === "page" && sidebarModel.page === page && localInputEl?.value.trim()) {
      list = sidebarModel.groups
        .flatMap((group) => group.topics)
        .filter((item) => !item.li.hidden)
        .map((item) => ({ chapter: item.chapter, topic: item.topic }));
    } else {
      list = flatTopics(page);
    }

    if (list.length === 0) {
      return;
    }

    const index = list.findIndex((entry) => entry.chapter.id === chapterId && entry.topic.id === topicId);
    const next = index < 0 ? list[delta > 0 ? 0 : list.length - 1] : list[index + delta];
    if (next) {
      location.hash = href(page.id, next.chapter.id, next.topic.id);
    }
  }

  function onKey(event) {
    if (event.target.closest?.("input, textarea, select") || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (event.key === "/") {
      event.preventDefault();
      globalInputEl.focus();
      globalInputEl.select();

      return;
    }

    const keys = {
      q: ["chapter", -1],
      e: ["chapter", 1],
      w: ["topic", -1],
      s: ["topic", 1],
    };
    const action = keys[event.key.toLowerCase()];
    if (action === undefined) {
      return;
    }

    event.preventDefault();
    step(action[0], action[1]);
  }

  function initGlobalSearch() {
    globalSearchEl = document.getElementById("global-search");
    globalInputEl = document.getElementById("global-search-input");
    globalClearEl = document.getElementById("global-search-clear");
    globalResultsEl = document.getElementById("global-results");

    globalInputEl.addEventListener("input", renderGlobalResults);
    globalInputEl.addEventListener("focus", () => {
      if (globalInputEl.value.trim() !== "") {
        renderGlobalResults();
      }
    });
    globalInputEl.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        if (!globalResultsEl.hidden) {
          event.preventDefault();
          selectGlobalItem(globalSelected + 1);
        }
      } else if (event.key === "ArrowUp") {
        if (!globalResultsEl.hidden) {
          event.preventDefault();
          selectGlobalItem(globalSelected <= 0 ? globalLinks.length - 1 : globalSelected - 1);
        }
      } else if (event.key === "Enter") {
        if (!globalResultsEl.hidden && globalLinks.length > 0) {
          event.preventDefault();
          const target = globalLinks[globalSelected >= 0 ? globalSelected : 0];
          location.hash = target.getAttribute("href");
          closeGlobalResults();
        }
      } else if (event.key === "Escape") {
        if (!globalResultsEl.hidden) {
          closeGlobalResults();
        } else if (globalInputEl.value !== "") {
          globalInputEl.value = "";
          globalClearEl.hidden = true;
        } else {
          globalInputEl.blur();
        }
      }
    });
    globalClearEl.addEventListener("click", () => {
      globalInputEl.value = "";
      closeGlobalResults();
      globalClearEl.hidden = true;
      globalInputEl.focus();
    });
    document.addEventListener("click", (event) => {
      if (!globalSearchEl.contains(event.target)) {
        closeGlobalResults();
      }
    });
  }

  function start() {
    tabsEl = document.getElementById("tabs");
    sidebarEl = document.getElementById("sidebar");
    titleEl = document.getElementById("page-title");
    bodyEl = document.getElementById("page-body");
    buildIndex();
    initGlobalSearch();
    document.getElementById("key-prev").addEventListener("click", () => step("chapter", -1));
    document.getElementById("key-next").addEventListener("click", () => step("chapter", 1));
    document.getElementById("menu-toggle").addEventListener("click", () =>
      setMenuOpen(!document.documentElement.classList.contains("menu-open")),
    );
    document.getElementById("menu-backdrop").addEventListener("click", () => setMenuOpen(false));
    window.addEventListener("hashchange", render);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", fitStage);
    fitStage();
    render();
  }

  return { register, start };
})();
