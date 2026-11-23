"use strict";

(() => {
  const kCategories = [
    ["monster", "MONSTERS", "魔兽", "以 mon 开头的魔兽，包括颜色变种与小型版本。"],
    ["people", "PEOPLE", "人物·头目", "人物敌人与头目战中的角色。"],
    ["ally", "ALLIES", "同伴·客串", "以同伴身份参战的角色（客串成员等）由 AI 控制时使用的技能。"],
    ["common", "COMMON", "通用", "多个敌人共用的 AI 脚本。"],
  ];

  function escapeHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function rangeLabel(skill) {
    return `${skill.range.name}${skill.range.size}`;
  }

  function rangeSizes(skill) {
    return skill.range.sizes.map(([name, value]) => `${name} ${value}`).join("，") || "—";
  }

  function skillRows(enemy) {
    return enemy.skills
      .map(
        (skill) => `<tr>
          <td><b>${escapeHtml(skill.name)}</b></td><td>${skill.kind}</td><td>${skill.element}</td>
          <td>${rangeLabel(skill)}</td><td>${rangeSizes(skill)}</td>
          <td class="num">${skill.cost}</td><td class="num">${skill.aria}</td><td class="num">${skill.delay}</td><td class="num">${skill.stun}</td>
          <td>${skill.effects.map(escapeHtml).join("<br>") || "—"}</td></tr>`,
      )
      .join("");
  }

  function skillDetails(skill) {
    const rows = skill.raw.map(([name, value]) => `<tr><td class="nowrap">${name}</td><td class="mono">${escapeHtml(value)}</td></tr>`).join("");
    const flags = skill.flags.length > 0 ? `<p>效果旗标：${skill.flags.map(escapeHtml).join("；")}</p>` : "";

    return `<details class="raw"><summary>${escapeHtml(skill.name)}：全部参数</summary>
      <p>${escapeHtml(skill.range.shape)}</p>${flags}
      <table class="tbl"><tr><th>参数</th><th>原始值</th></tr>${rows}</table></details>`;
  }

  function enemyHtml(enemy) {
    const level = enemy.level ? `，默认等级 ${enemy.level}` : "";
    const comment = enemy.comment ? `<p>开发注释：${escapeHtml(enemy.comment)}</p>` : "";

    return `
      <div class="caption">
        <p>${escapeHtml(enemy.name)}：共 <em>${enemy.skills.length}</em> 个技能</p>
        <p>AI 脚本 ai_${escapeHtml(enemy.key)}.dat${level}</p>
      </div>
      <div class="text">
        ${comment}
        <table class="tbl">
          <tr><th>名称</th><th>种类</th><th>属性</th><th>范围</th><th>尺寸</th><th class="num">消耗</th><th class="num">咏唱</th>
            <th class="num">延迟</th><th class="num">晕眩</th><th>效果</th></tr>
          ${skillRows(enemy)}
        </table>
        <p>延迟决定行动后的 AT（延迟 ÷ SPD × 30）；咏唱不为 0 的技能先按咏唱时间排队，再发动。名称以 ◆ 开头的是游戏内部命名，战斗中通常不显示。</p>
        <h3>各技能的全部参数</h3>
        ${enemy.skills.map(skillDetails).join("")}
      </div>`;
  }

  function escapeAttr(text) {
    return escapeHtml(text).replace(/"/g, "&quot;");
  }

  function enemyKeywords(tab, enemy) {
    const parts = [enemy.name, enemy.key, `ai_${enemy.key}`, tab];
    if (enemy.level) {
      parts.push(`Lv${enemy.level}`);
    }

    if (enemy.comment) {
      parts.push(enemy.comment);
    }

    for (const skill of enemy.skills) {
      parts.push(skill.name, skill.kind, skill.kind.replace(/\s+/g, ""), skill.element, rangeLabel(skill), ...skill.effects);
    }

    return parts.join(" ");
  }

  function enemyPreview(enemy) {
    const names = enemy.skills.map((skill) => skill.name).join("、");

    return `${enemy.key}${enemy.level ? ` · Lv${enemy.level}` : ""} · ${names}`;
  }

  function enemyMatchHint(enemy, tokens) {
    const matched = enemy.skills.filter((skill) => {
      const text = [skill.name, skill.kind, skill.kind.replace(/\s+/g, ""), skill.element, rangeLabel(skill), ...skill.effects]
        .join(" ")
        .toLowerCase()
        .replace(/％/g, "%")
        .replace(/･/g, "·");

      return tokens.some((token) => text.includes(token));
    });
    if (matched.length === 0) {
      return enemyPreview(enemy);
    }

    const summary = matched
      .slice(0, 4)
      .map((skill) => (skill.effects.length > 0 ? `${skill.name}（${skill.effects[0]}）` : skill.name))
      .join("；");

    return `${enemy.key} · ${summary}${matched.length > 4 ? ` 等 ${matched.length} 个技能` : ""}`;
  }

  function listHtml(tab, note, enemies, topicIds) {
    const rows = enemies
      .map(
        (enemy, index) =>
          `<tr data-search="${escapeAttr(enemyKeywords(tab, enemy))}"><td><a href="#/enemy-skills/${enemy.category}/${topicIds[index]}">${escapeHtml(enemy.name)}</a></td><td class="mono">${escapeHtml(enemy.key)}</td>
          <td class="num">${enemy.level ?? "—"}</td><td class="num">${enemy.skills.length}</td>
          <td>${enemy.skills.map((skill) => escapeHtml(skill.name)).join("、")}</td></tr>`,
      )
      .join("");

    return `
      <div class="caption">
        <p>${note}</p>
        <p>共 <em>${enemies.length}</em> 个 AI 脚本。</p>
      </div>
      <div class="text">
        <table class="tbl" data-filterable="true"><tr><th>名称</th><th>脚本</th><th class="num">等级</th><th class="num">技能数</th><th>技能</th></tr>${rows}</table>
      </div>`;
  }

  const enemies = window.ENEMY_SKILLS_DATA;
  const chapters = kCategories.map(([id, label, tab, note]) => {
    const own = enemies.filter((enemy) => enemy.category === id);
    const counts = new Map();
    for (const enemy of own) {
      counts.set(enemy.name, (counts.get(enemy.name) ?? 0) + 1);
    }

    const topicIds = own.map((enemy) => enemy.key);

    return {
      id,
      label,
      tab,
      topics: [
        {
          id: "list",
          title: `${tab}一览`,
          isList: true,
          keywords: `${tab} 一览 ${note}`,
          preview: `${tab}分类下全部 ${own.length} 个 AI 脚本汇总`,
          html: listHtml(tab, note, own, topicIds),
        },
        ...own.map((enemy, index) => ({
          id: topicIds[index],
          title: counts.get(enemy.name) > 1 ? `${enemy.name}（${enemy.key}）` : enemy.name,
          keywords: enemyKeywords(tab, enemy),
          preview: enemyPreview(enemy),
          matchHint: (tokens) => enemyMatchHint(enemy, tokens),
          html: enemyHtml(enemy),
        })),
      ],
    };
  });

  Manual.register({
    id: "enemy-skills",
    group: "战斗",
    title: "敌方技能",
    summary: "各敌人 AI 脚本中登记的全部技能：种类、属性、范围形状与尺寸、消耗、咏唱、延迟、晕眩倍率、效果与全部原始参数。",
    chapters,
  });
})();
