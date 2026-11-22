"use strict";

// 结构：大项（左侧标题）→ 章节（顶部标签，左侧一级条目）→ 小节（左侧缩进条目）
// 路由：#/<大项>/<章节>/<小节>
const Manual = (() => {
  const STAGE_WIDTH = 1920;
  const STAGE_HEIGHT = 1080;
  const pages = [];
  const homeTabs = [{ id: "", label: "INDEX", tab: "目　录", href: "#/" }];

  let tabsEl;
  let sidebarEl;
  let titleEl;
  let bodyEl;

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
      node.setAttribute(key, value);
    }

    node.innerHTML = html;

    return node;
  }

  function fitStage() {
    const scale = Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);
    const root = document.documentElement.style;
    root.setProperty("--scale", String(scale));
    root.setProperty("--stage-w", `${Math.max(STAGE_WIDTH, window.innerWidth / scale)}px`);
    root.setProperty("--stage-h", `${Math.max(STAGE_HEIGHT, window.innerHeight / scale)}px`);
  }

  // 大项的全部小节，按章节顺序展开
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

  function renderSidebar(head, items) {
    sidebarEl.replaceChildren();
    sidebarEl.append(el("a", { class: "side-head", href: "#/", title: "返回目录" }, `<div class="side-head-face"><span>${head}</span></div>`));
    const list = el("ul", { class: "side-list" });
    for (const item of items) {
      const li = el("li", { class: item.sub ? "sub" : "" });
      li.append(el("a", { class: `side-item ${item.className ?? ""}`.trim(), href: item.href, title: item.title }, item.title));
      list.append(li);
    }

    sidebarEl.append(list);
    const active = list.querySelector(".side-item.active");
    if (active) {
      const top = active.offsetTop - sidebarEl.clientHeight / 2 + active.offsetHeight / 2;
      sidebarEl.scrollTop = Math.max(0, top);
    }
  }

  function setTitle(text) {
    titleEl.innerHTML = `<span class="diamond"></span>${text}`;
  }

  function renderHome() {
    document.title = "OpenSora1st 说明书";
    renderTabs(homeTabs, "");
    renderSidebar(
      "目录",
      pages.map((page) => ({ title: page.title, href: href(page.id) })),
    );
    setTitle("说明书目录");
    bodyEl.replaceChildren();
    bodyEl.append(
      el(
        "div",
        { class: "caption" },
        "<p>本说明书讲解战斗等游戏系统<em>实际的运作规则</em>。</p><p>从左侧条目进入各个大项。</p>",
      ),
    );
    const cards = el("div", { class: "cards" });
    for (const page of pages) {
      const chapters = page.chapters.map((chapter) => `<li>${chapter.tab}</li>`).join("");
      cards.append(
        el(
          "a",
          { class: "card", href: href(page.id) },
          `<small>${page.group}</small><h3>${page.title}</h3><p>${page.summary}</p><ol>${chapters}</ol>`,
        ),
      );
    }

    bodyEl.append(cards);
  }

  function renderNotFound() {
    document.title = "未找到 · OpenSora1st 说明书";
    renderTabs(homeTabs, null);
    renderSidebar(
      "目录",
      pages.map((page) => ({ title: page.title, href: href(page.id) })),
    );
    setTitle("未找到");
    bodyEl.replaceChildren(el("div", { class: "empty" }, `没有这个页面。<a href="#/">返回目录</a>`));
  }

  function renderTopic(page, chapter, topic) {
    document.title = `${topic.title} · ${page.title} · OpenSora1st 说明书`;
    renderTabs(
      page.chapters.map((item) => ({ id: item.id, label: item.label, tab: item.tab, href: href(page.id, item.id) })),
      chapter.id,
    );

    const items = [];
    for (const group of page.chapters) {
      items.push({
        title: group.tab,
        href: href(page.id, group.id, group.topics[0].id),
        className: group === chapter ? "chapter current" : "chapter",
      });
      for (const item of group.topics) {
        items.push({
          sub: true,
          title: item.title,
          href: href(page.id, group.id, item.id),
          className: item === topic ? "active" : "",
        });
      }
    }

    renderSidebar(page.title, items);
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
  }

  function render() {
    const { pageId, chapterId, topicId } = parseRoute();
    bodyEl.scrollTop = 0;
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

    const flat = flatTopics(page);
    const index = flat.findIndex((entry) => entry.chapter.id === chapterId && entry.topic.id === topicId);
    const next = flat[index + delta];
    if (next) {
      location.hash = href(page.id, next.chapter.id, next.topic.id);
    }
  }

  function onKey(event) {
    if (event.target.closest?.("input, textarea, select") || event.ctrlKey || event.metaKey || event.altKey) {
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

  function start() {
    tabsEl = document.getElementById("tabs");
    sidebarEl = document.getElementById("sidebar");
    titleEl = document.getElementById("page-title");
    bodyEl = document.getElementById("page-body");
    document.getElementById("key-prev").addEventListener("click", () => step("chapter", -1));
    document.getElementById("key-next").addEventListener("click", () => step("chapter", 1));
    window.addEventListener("hashchange", render);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", fitStage);
    fitStage();
    render();
  }

  return { register, start };
})();
