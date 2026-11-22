"use strict";

const Manual = (() => {
  const STAGE_WIDTH = 1920;
  const STAGE_HEIGHT = 1080;
  const pages = [];
  const home = {
    id: "",
    label: "INDEX",
    title: "目　录",
  };

  let tabsEl;
  let sidebarEl;
  let titleEl;
  let bodyEl;

  function register(page) {
    pages.push(page);
  }

  function parseRoute() {
    const path = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    const [pageId = "", sectionId = ""] = path.split("/");

    return { pageId, sectionId };
  }

  function href(pageId, sectionId) {
    if (pageId === "") {
      return "#/";
    }

    return sectionId ? `#/${pageId}/${sectionId}` : `#/${pageId}`;
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
    document.documentElement.style.setProperty("--scale", String(scale));
  }

  function renderTabs(activeId) {
    tabsEl.replaceChildren();
    for (const page of [home, ...pages]) {
      tabsEl.append(
        el(
          "a",
          { class: page.id === activeId ? "tab active" : "tab", href: href(page.id) },
          `<div class="tab-face"><small>${page.label}</small><span>${page.title}</span></div>`,
        ),
      );
    }
  }

  function renderSidebar(head, items, activeId) {
    sidebarEl.replaceChildren();
    sidebarEl.append(el("a", { class: "side-head", href: "#/", title: "返回目录" }, `<div class="side-head-face"><span>${head}</span></div>`));
    const list = el("ul", { class: "side-list" });
    for (const item of items) {
      const li = el("li");
      li.append(el("a", { class: item.id === activeId ? "side-item active" : "side-item", href: item.href, title: item.title }, item.title));
      list.append(li);
    }

    sidebarEl.append(list);
  }

  function setTitle(text) {
    titleEl.innerHTML = `<span class="diamond"></span>${text}`;
  }

  function pageItems() {
    return pages.map((page) => ({ id: page.id, title: page.title, href: href(page.id) }));
  }

  function renderHome() {
    document.title = "OpenSora1st 说明书";
    renderTabs("");
    renderSidebar("目录", pageItems(), "");
    setTitle("说明书目录");
    bodyEl.replaceChildren();
    bodyEl.append(
      el(
        "div",
        { class: "caption" },
        "<p>本说明书讲解战斗等游戏系统<em>实际的运作规则</em>。</p><p>从上方标签或左侧条目进入各个子页。</p>",
      ),
    );
    const cards = el("div", { class: "cards" });
    for (const page of pages) {
      const sections = page.sections.map((section) => `<li>${section.title}</li>`).join("");
      cards.append(
        el(
          "a",
          { class: "card", href: href(page.id) },
          `<small>${page.label}</small><h3>${page.title}</h3><p>${page.summary}</p><ol>${sections}</ol>`,
        ),
      );
    }

    bodyEl.append(cards);
  }

  function renderNotFound() {
    document.title = "未找到 · OpenSora1st 说明书";
    renderTabs(null);
    renderSidebar("目录", pageItems(), "");
    setTitle("未找到");
    bodyEl.replaceChildren(el("div", { class: "empty" }, `没有这个页面。<a href="#/">返回目录</a>`));
  }

  function renderSection(page, index) {
    const section = page.sections[index];
    document.title = `${section.title} · ${page.title} · OpenSora1st 说明书`;
    renderTabs(page.id);
    renderSidebar(
      page.title,
      page.sections.map((item) => ({ id: item.id, title: item.title, href: href(page.id, item.id) })),
      section.id,
    );
    setTitle(section.heading ?? section.title);
    bodyEl.replaceChildren();
    const body = el("div", { class: "sec-body" }, section.html);
    bodyEl.append(body);
    if (section.sources) {
      bodyEl.append(el("div", { class: "src" }, `<b>依据：</b>${section.sources}`));
    }

    const pager = el("div", { class: "pager" });
    const prev = page.sections[index - 1];
    const next = page.sections[index + 1];
    pager.append(el("span", {}, prev ? `<a href="${href(page.id, prev.id)}">‹ ${prev.title}</a>` : ""));
    pager.append(el("span", {}, next ? `<a href="${href(page.id, next.id)}">${next.title} ›</a>` : ""));
    bodyEl.append(pager);
    section.mount?.(body);
  }

  function render() {
    const { pageId, sectionId } = parseRoute();
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

    const index = page.sections.findIndex((item) => item.id === sectionId);
    if (index < 0) {
      history.replaceState(null, "", href(page.id, page.sections[0].id));
      renderSection(page, 0);

      return;
    }

    renderSection(page, index);
  }

  function step(kind, delta) {
    const { pageId, sectionId } = parseRoute();
    if (kind === "tab") {
      const order = ["", ...pages.map((page) => page.id)];
      const current = Math.max(0, order.indexOf(pageId));
      location.hash = href(order[(current + delta + order.length) % order.length]);

      return;
    }

    const page = pages.find((item) => item.id === pageId);
    if (page === undefined) {
      return;
    }

    const index = page.sections.findIndex((item) => item.id === sectionId);
    const next = page.sections[index + delta];
    if (next) {
      location.hash = href(page.id, next.id);
    }
  }

  function onKey(event) {
    if (event.target.closest?.("input, textarea, select") || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const keys = {
      q: ["tab", -1],
      e: ["tab", 1],
      w: ["section", -1],
      s: ["section", 1],
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
    document.getElementById("key-prev").addEventListener("click", () => step("tab", -1));
    document.getElementById("key-next").addEventListener("click", () => step("tab", 1));
    window.addEventListener("hashchange", render);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", fitStage);
    fitStage();
    render();
  }

  return { register, start };
})();
