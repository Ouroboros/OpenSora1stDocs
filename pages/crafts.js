"use strict";

(() => {
  const kCharas = [
    ["estelle", "ESTELLE", "艾丝蒂尔"],
    ["joshua", "JOSHUA", "约书亚"],
    ["scherazard", "SCHERAZARD", "雪拉扎德"],
    ["olivier", "OLIVIER", "奥利维尔"],
    ["kloe", "KLOE", "克萝赛"],
    ["agate", "AGATE", "阿加特"],
    ["tita", "TITA", "缇妲"],
    ["zin", "ZIN", "阵"],
  ];

  // S 战技伤害倍率（t_btlsys.tbl BattleSCraftDamageRatio：发动时 CP 不低于门限时取该行）
  const kSCraftRatio = [
    [100, 100],
    [120, 110],
    [140, 120],
    [160, 130],
    [180, 140],
    [200, 150],
  ];

  function escapeHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function fieldsHtml(craft) {
    const rows = craft.fields
      .map(
        ([offset, name, value, note]) =>
          `<tr><td class="mono">${offset}</td><td class="nowrap">${name}</td><td class="mono">${escapeHtml(value)}</td><td>${escapeHtml(note)}</td></tr>`,
      )
      .join("");

    return `<h3>全部字段（t_skill.tbl 的一行，共 0xB0 字节）</h3>
      <table class="tbl"><tr><th>偏移</th><th>字段</th><th>原始值</th><th>含义</th></tr>${rows}</table>`;
  }

  function rangeLabel(craft) {
    return `${craft.range.name}${craft.range.size}`;
  }

  function rangeSizes(craft) {
    return craft.range.sizes.map(([name, value]) => `${name} ${value}`).join("，");
  }

  function rangeHtml(craft) {
    const rows = craft.range.sizes.map(([name, value]) => `<tr><td>${name}</td><td class="num">${value}</td></tr>`).join("");
    const grade = craft.range.size
      ? `<p>大小等级由游戏按形状计算：圆按半径²，扇形按半径² × 张角 ÷ 360，直线按宽度；再与门限比较得出 S、M、L、LL。</p>`
      : "";

    return `<h3>范围</h3>
      <table class="tbl">
        <tr><th>项目</th><th>数值</th></tr>
        <tr><td>范围（游戏内名称）</td><td>${rangeLabel(craft)}</td></tr>
        <tr><td>形状</td><td>${craft.range.shape}</td></tr>
        ${rows}
      </table>
      ${grade}
      <p>距离为游戏内部的距离单位。射程 100 表示实际上不受距离限制。部分装备效果会加大射程与范围。</p>`;
  }

  function costText(craft) {
    return craft.kind === "S 战技" ? `全部 CP（至少 ${craft.cost}）` : `CP ${craft.cost}`;
  }

  function learnText(craft) {
    return craft.learn > 0 ? `Lv${craft.learn}` : "不随升级习得";
  }

  function powerText(craft) {
    if (craft.power === null) {
      return "—";
    }

    const rank = craft.summary.match(/攻击 (SS|S\+|S|A\+|A|B\+|B|C\+|C|D\+|D|E\+|E)/);

    return `${craft.power}%${rank ? `（${rank[1]}）` : ""}`;
  }

  function escapeAttr(text) {
    return escapeHtml(text).replace(/"/g, "&quot;");
  }

  function craftKeywords(chara, craft) {
    return [
      chara,
      craft.name,
      craft.id,
      craft.kind,
      craft.kind.replace(/\s+/g, ""),
      rangeLabel(craft),
      craft.range.shape,
      learnText(craft),
      craft.summary,
      craft.description,
      ...craft.effects,
    ].join(" ");
  }

  function overviewHtml(charaId, chara, crafts) {
    const rows = crafts
      .map(
        (craft) => `<tr data-search="${escapeAttr(craftKeywords(chara, craft))}"><td><a href="#/crafts/${charaId}/${craft.id}"><b>${escapeHtml(craft.name)}</b></a></td><td>${craft.kind}</td><td class="num">${craft.kind === "S 战技" ? "全部" : craft.cost}</td>
          <td class="num">${craft.delay}</td><td class="num">${powerText(craft)}</td><td class="num">${craft.stun ? `${craft.stun}%` : "—"}</td>
          <td>${rangeLabel(craft)}</td><td>${rangeSizes(craft) || "—"}</td>
          <td>${learnText(craft)}</td><td>${craft.summary}</td></tr>`,
      )
      .join("");

    return `
      <div class="caption">
        <p>${chara} 共有 <em>${crafts.length}</em> 个战技与 S 战技。</p>
        <p>延迟决定行动后的 AT：<em>延迟 ÷ SPD × 30</em>。</p>
      </div>
      <div class="text">
        <table class="tbl" data-filterable="true">
          <tr><th>名称</th><th>种类</th><th class="num">CP</th><th class="num">延迟</th><th class="num">威力</th><th class="num">晕眩</th><th>范围</th><th>尺寸</th><th>习得</th><th>游戏内说明</th></tr>
          ${rows}
        </table>
        <p>「游戏内说明」由游戏自身的说明生成逻辑与数据表得出，与游戏中显示的文字相同（颜色与图标除外，威力图标以等级字母表示）。</p>
      </div>`;
  }

  function craftHtml(craft) {
    const effects = craft.effects.map((line) => `<li>${line}</li>`).join("");
    const scraft =
      craft.kind === "S 战技"
        ? `<h3>S 战技的 CP 倍率</h3>
          <p>S 战技消耗发动时的<em>全部 CP</em>（至少 ${craft.cost}）。我方发动时，伤害按发动时的 CP 额外加成：</p>
          <table class="tbl"><tr><th>发动时 CP</th>${kSCraftRatio.map(([cp]) => `<th class="num">${cp} 以上</th>`).join("")}</tr>
          <tr><td>伤害倍率</td>${kSCraftRatio.map(([, rate]) => `<td class="num">${rate}%</td>`).join("")}</tr></table>`
        : "";

    return `
      <div class="caption">
        <p>${craft.summary}</p>
        <p>${craft.description}</p>
      </div>
      <div class="text">
        <h3>基本数据</h3>
        <table class="tbl">
          <tr><th>项目</th><th>数值</th><th>说明</th></tr>
          <tr><td>种类</td><td>${craft.kind}</td><td></td></tr>
          <tr><td>消耗</td><td>${costText(craft)}</td><td></td></tr>
          <tr><td>延迟</td><td class="num">${craft.delay}</td><td>行动后 AT = ${craft.delay} ÷ SPD × 30；SPD 30 时为 ${craft.delay}，SPD 40 时为 ${(craft.delay * 0.75).toFixed(1)}</td></tr>
          <tr><td>威力</td><td class="num">${powerText(craft)}</td><td>攻击力按此百分比计算</td></tr>
          <tr><td>晕眩倍率</td><td class="num">${craft.stun ? `${craft.stun}%` : "—"}</td><td>造成伤害时累积晕眩值的倍率</td></tr>
          <tr><td>习得</td><td>${learnText(craft)}</td><td></td></tr>
        </table>
        ${rangeHtml(craft)}
        <h3>效果明细</h3>
        <ul>${effects}</ul>
        ${scraft}
        ${fieldsHtml(craft)}
      </div>`;
  }

  const crafts = window.CRAFTS_DATA;
  const chapters = kCharas.map(([id, label, name], index) => {
    const own = crafts.filter((craft) => craft.chara === index);

    return {
      id,
      label,
      tab: name,
      topics: [
        {
          id: "list",
          title: "战技一览",
          isList: true,
          keywords: `${name} 战技一览 S战技`,
          preview: `${name}全部 ${own.length} 个战技与 S 战技汇总`,
          html: overviewHtml(id, name, own),
        },
        ...own.map((craft) => ({
          id: String(craft.id),
          title: craft.name,
          keywords: craftKeywords(name, craft),
          preview: craft.summary,
          html: craftHtml(craft),
        })),
      ],
    };
  });

  Manual.register({
    id: "crafts",
    group: "战斗",
    title: "我方战技",
    summary: "8 名角色全部战技与 S 战技：游戏内说明、消耗、延迟、威力、晕眩倍率、习得等级与效果明细。",
    chapters,
  });
})();
