"use strict";

(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const DEG = Math.PI / 180;

  // 每个位次相差 2°；第 9 位起挤在一起，数值只在前 8 位显示
  const kSlotAngle = -2;
  const kCompressFirstSlot = 8;
  const kCompressMaxSlots = 3;
  const kCompressAngle = -14;
  const kCompressStep = 0.2;
  const kNumberFadeAngle = -14.2;
  const kNumberFadeRange = 0.2;

  function slotAngle(slot) {
    if (slot >= kCompressFirstSlot) {
      const extra = Math.min(slot - kCompressFirstSlot, kCompressMaxSlots);

      return kCompressAngle - extra * kCompressStep - kCompressStep;
    }

    return slot * kSlotAngle;
  }

  function numberOpacity(angle) {
    return Math.max(0, Math.min(Math.max(0, angle - kNumberFadeAngle) / kNumberFadeRange, 1));
  }

  function svg(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
      node.setAttribute(key, value);
    }

    return node;
  }

  function gearPath(radius, teeth, depth) {
    const points = [];
    const step = (Math.PI * 2) / teeth;
    for (let index = 0; index < teeth; ++index) {
      const base = index * step;
      const corners = [
        [radius - depth, base],
        [radius, base + step * 0.18],
        [radius, base + step * 0.5],
        [radius - depth, base + step * 0.68],
      ];
      for (const [r, a] of corners) {
        points.push(`${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`);
      }
    }

    return `M${points.join("L")}Z`;
  }

  function gear(cx, cy, radius, teeth, fill, spin) {
    const group = svg("g", { transform: `translate(${cx} ${cy})` });
    const body = svg("g");
    body.append(svg("path", { d: gearPath(radius, teeth, radius * 0.12), fill, stroke: "#5b4426", "stroke-width": 2 }));
    body.append(svg("circle", { r: radius * 0.62, fill: "none", stroke: "#5b4426", "stroke-width": 2, opacity: 0.6 }));
    body.append(svg("circle", { r: radius * 0.16, fill: "#5b4426" }));
    if (spin) {
      body.append(
        svg("animateTransform", {
          attributeName: "transform",
          type: "rotate",
          from: "0",
          to: "-360",
          dur: "36s",
          repeatCount: "indefinite",
        }),
      );
    }

    group.append(body);

    return group;
  }

  // ---------- 行动条示意图 ----------

  const ARC = {
    width: 760,
    height: 430,
    pivotX: 110,
    pivotY: 590,
    radius: 500,
    exaggerate: 3,
    iconRadius: 25,
  };

  function arcPosition(angle) {
    const shown = -angle * ARC.exaggerate * DEG;

    return [ARC.pivotX + ARC.radius * Math.sin(shown), ARC.pivotY - ARC.radius * Math.cos(shown)];
  }

  function createArc(labels) {
    const root = svg("svg", { viewBox: `0 0 ${ARC.width} ${ARC.height}`, width: ARC.width, height: ARC.height });
    root.append(svg("rect", { width: ARC.width, height: ARC.height, fill: "#efe6d2" }));
    root.append(gear(ARC.pivotX, ARC.pivotY, 200, 28, "#c9a96a", false));
    root.append(gear(ARC.pivotX + 165, ARC.pivotY - 150, 70, 14, "#b8955a", false));
    root.append(
      svg("circle", {
        cx: ARC.pivotX,
        cy: ARC.pivotY,
        r: ARC.radius,
        fill: "none",
        stroke: "#8c7a5b",
        "stroke-width": 1.5,
        "stroke-dasharray": "5 6",
      }),
    );
    const [ax, ay] = arcPosition(0);
    root.append(gear(ax, ay, 44, 12, "#e3c47a", true));
    if (labels) {
      const note = (x, y, text) => {
        const node = svg("text", { x, y, "font-size": 16, "font-weight": 700, fill: "#3f3524" });
        node.textContent = text;
        root.append(node);
      };
      note(ax + 56, ay - 30, "← 下一个行动的角色");
      note(ARC.pivotX + 30, ARC.height - 18, "每次行动结束，齿轮转动，头像向前移");
    }

    const layer = svg("g");
    root.append(layer);

    return { root, layer };
  }

  function drawIcons(layer, units) {
    const existing = new Map([...layer.children].map((node) => [node.dataset.key, node]));
    const order = units.map((unit, slot) => ({ unit, slot })).reverse();
    for (const { unit, slot } of order) {
      let node = existing.get(unit.key);
      if (node === undefined) {
        node = svg("g");
        node.dataset.key = unit.key;
        node.style.transition = "transform 0.4s ease-out, opacity 0.2s linear";
        node.append(
          svg("circle", {
            r: ARC.iconRadius + 4,
            fill: unit.enemy ? "#a83a3a" : "#3c6aa0",
            stroke: "#2b2216",
            "stroke-width": 1.5,
          }),
        );
        node.append(svg("circle", { r: ARC.iconRadius - 2, fill: unit.enemy ? "#f4d9d4" : "#dde8f4" }));
        const name = svg("text", { y: 6, "text-anchor": "middle", "font-size": 17, "font-weight": 700, fill: "#222" });
        name.textContent = unit.name;
        node.append(name);
        node.append(svg("text", { class: "at", y: ARC.iconRadius + 22, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: "#1f3c5e" }));
        if (unit.bonus) {
          const badge = svg("g", { transform: `translate(${ARC.iconRadius + 6} ${-ARC.iconRadius + 4})` });
          badge.append(svg("rect", { x: -12, y: -11, width: 24, height: 22, rx: 4, fill: "#f3d36b", stroke: "#7a5a12" }));
          const text = svg("text", { y: 5, "text-anchor": "middle", "font-size": 12, "font-weight": 700, fill: "#6a3f00" });
          text.textContent = unit.bonus;
          badge.append(text);
          node.append(badge);
        }

        const [sx, sy] = arcPosition(slotAngle(slot + 20));
        node.style.transform = `translate(${sx}px, ${sy}px)`;
        node.style.opacity = "0";
      }

      const angle = slotAngle(slot);
      const [x, y] = arcPosition(angle);
      layer.append(node);
      requestAnimationFrame(() => {
        node.style.transform = `translate(${x}px, ${y}px)`;
        node.style.opacity = "1";
      });
      const number = node.querySelector("text.at");
      number.textContent = String(unit.at);
      number.style.opacity = String(numberOpacity(angle));
      existing.delete(unit.key);
    }

    for (const node of existing.values()) {
      node.remove();
    }
  }

  function sampleUnits(count) {
    const names = ["我A", "敌1", "我B", "敌2", "我C", "敌3", "我D", "敌4", "敌5", "敌6", "敌7", "敌8", "敌9", "敌10", "敌11", "敌12"];
    const units = [];
    for (let index = 0; index < count; ++index) {
      const name = names[index];
      units.push({ key: name, name, enemy: name.startsWith("敌"), at: index * 15 + (index % 3) * 4 });
    }

    return units;
  }

  function mountArc(body, interactive) {
    const host = body.querySelector(".arc-host");
    const { root, layer } = createArc(!interactive);
    host.append(root);
    let units = sampleUnits(interactive ? 12 : 9);
    if (!interactive) {
      units[1].bonus = "HP";
      units[4].bonus = "会心";
      drawIcons(layer, units);

      return;
    }

    const count = body.querySelector("#arc-count");
    count.addEventListener("input", () => {
      body.querySelector("#arc-count-value").textContent = count.value;
      const fresh = sampleUnits(Number(count.value));
      units = fresh.map((unit) => units.find((old) => old.key === unit.key) ?? unit);
      drawIcons(layer, units);
    });
    body.querySelector("#arc-act").addEventListener("click", () => {
      const [first, ...rest] = units;
      first.at = (rest.length > 0 ? rest[rest.length - 1].at : 0) + 7;
      units = [...rest, first].sort((left, right) => left.at - right.at);
      drawIcons(layer, units);
    });
    drawIcons(layer, units);
  }

  // ---------- 通用 ----------

  // 速度换算：延迟 ÷ SPD × 30，结果大于 0 时至少为 1
  const kSpeedBase = 30;

  function scaleBySpeed(value, spd) {
    if (spd === 0) {
      return 100;
    }

    const scaled = (value / spd) * kSpeedBase;

    return scaled > 0 ? Math.max(1, scaled) : scaled;
  }

  function fmt(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  function percent(value) {
    return `${(value * 100).toFixed(1)}%`;
  }

  // ---------- 时间流动模拟 ----------

  const kSimSkills = [
    ["普通攻击", 100],
    ["战技（如天魁拳）", 120],
    ["S 战技", 150],
    ["鼓励", 50],
    ["待命", 50],
  ];

  function simUnits() {
    return [
      { name: "我A", spd: 30, skill: 100, at: 22.4 },
      { name: "我B", spd: 36, skill: 120, at: 27.1 },
      { name: "敌1", spd: 24, skill: 100, at: 20.6 },
      { name: "敌2", spd: 40, skill: 100, at: 25.3 },
    ];
  }

  function mountSimulator(body) {
    const host = body.querySelector("#sim");
    let units = simUnits();
    let log = [];
    let turn = 0;
    const skillOptions = (selected) =>
      kSimSkills.map(([name, delay]) => `<option value="${delay}" ${delay === selected ? "selected" : ""}>${name}（${delay}）</option>`).join("");
    const draw = () => {
      const order = [...units].sort((left, right) => left.at - right.at);
      const max = Math.max(...units.map((unit) => unit.at), 1);
      const rows = order
        .map(
          (unit, rank) => `<tr>
            <td class="num">${rank + 1}</td><td><b>${unit.name}</b></td>
            <td><input type="number" min="1" value="${unit.spd}" data-spd="${unit.name}"></td>
            <td><select data-skill="${unit.name}">${skillOptions(unit.skill)}</select></td>
            <td class="bar-cell"><i style="width:${((unit.at / max) * 100).toFixed(1)}%"></i><span>${fmt(unit.at)}</span></td>
          </tr>`,
        )
        .join("");
      host.querySelector("#sim-table").innerHTML =
        `<tr><th class="num">顺序</th><th>角色</th><th>SPD</th><th>下次使用</th><th>AT</th></tr>${rows}`;
      host.querySelector("#sim-log").innerHTML = log.length === 0 ? "<p>按「推进一回合」开始。</p>" : log.map((line) => `<p>${line}</p>`).join("");
    };
    host.innerHTML = `
      <div class="controls">
        <button id="sim-step">推进一回合</button>
        <button id="sim-reset">重置</button>
      </div>
      <table class="tbl" id="sim-table"></table>
      <div class="result" id="sim-log"></div>`;
    host.addEventListener("change", (event) => {
      const target = event.target;
      if (target.dataset.spd) {
        units.find((unit) => unit.name === target.dataset.spd).spd = Math.max(1, Number(target.value) || 1);
      } else if (target.dataset.skill) {
        units.find((unit) => unit.name === target.dataset.skill).skill = Number(target.value);
      }
    });
    host.querySelector("#sim-step").addEventListener("click", () => {
      turn += 1;
      const actor = [...units].sort((left, right) => left.at - right.at)[0];
      const passed = actor.at <= 0.00001 ? 0 : actor.at;
      for (const unit of units) {
        unit.at = unit === actor ? 0 : Math.max(0, unit.at - passed);
      }

      const next = scaleBySpeed(actor.skill, actor.spd);
      actor.at = next;
      log = [
        `第 ${turn} 回合：<b>${actor.name}</b> 行动。其他人的 AT 各减 ${fmt(passed)}；${actor.name} 行动后 AT = ${actor.skill} ÷ ${actor.spd} × 30 = <em>${fmt(next)}</em>`,
        ...log,
      ].slice(0, 6);
      draw();
    });
    host.querySelector("#sim-reset").addEventListener("click", () => {
      units = simUnits();
      log = [];
      turn = 0;
      draw();
    });
    draw();
  }

  // ---------- 行动后 AT 计算 ----------

  function mountDelayFormula(body) {
    const host = body.querySelector("#delay-formula");
    host.innerHTML = `
      <div class="controls">
        <label>技能延迟 <input type="number" id="df-delay" value="100" min="0"></label>
        <label>SPD <input type="number" id="df-spd" value="30" min="1"></label>
        <label>延迟倍率状态 <input type="number" id="df-rate" value="100" min="0">%</label>
        <label>装备修正 <input type="number" id="df-equip" value="100" min="0">%</label>
        <label><input type="checkbox" id="df-half"> 延迟减半状态</label>
      </div>
      <div class="result" id="df-result"></div>`;
    const read = (id) => Number(host.querySelector(id).value) || 0;
    const update = () => {
      const delay = read("#df-delay");
      const spd = Math.max(1, read("#df-spd"));
      let ratio = (read("#df-rate") / 100) * (read("#df-equip") / 100);
      if (host.querySelector("#df-half").checked) {
        ratio *= 0.5;
      }

      const modified = delay * ratio;
      const result = scaleBySpeed(modified, spd);
      host.querySelector("#df-result").innerHTML = `
        <p>修正后延迟 = ${delay} × ${fmt(ratio)} = ${fmt(modified)}</p>
        <p>行动后 AT = ${fmt(modified)} ÷ ${spd} × 30 = <em>${fmt(result)}</em></p>`;
    };
    host.addEventListener("input", update);
    update();
  }

  // ---------- SPD 与 AT 的取值 ----------

  // 我方 SPD = 基数 + floor(等级 × 每级增量)（t_status.tbl）
  const kPartySpd = [
    ["艾丝蒂尔", 18, 0.56],
    ["约书亚", 20, 0.6],
    ["雪拉扎德", 19, 0.58],
    ["奥利维尔", 17, 0.54],
    ["克萝赛", 18, 0.55],
    ["阿加特", 19, 0.57],
    ["缇妲", 15, 0.51],
    ["阵", 16, 0.53],
  ];

  function partySpd(base, rate, level) {
    return base + Math.floor(Math.fround(level * Math.fround(rate)));
  }

  function mountSpdTable(body) {
    const levels = [1, 10, 20, 30, 40, 50, 60];
    const head = levels.map((level) => `<th class="num">Lv${level}</th>`).join("");
    const rows = kPartySpd
      .map(([name, base, rate]) => `<tr><td>${name}</td>${levels.map((level) => `<td class="num">${partySpd(base, rate, level)}</td>`).join("")}</tr>`)
      .join("");
    body.querySelector("#party-spd").innerHTML = `<tr><th>角色</th>${head}</tr>${rows}`;

    const host = body.querySelector("#spd-calc");
    const options = kPartySpd.map(([name], index) => `<option value="${index}">${name}</option>`).join("");
    host.innerHTML = `
      <div class="controls">
        <label>角色 <select id="sc-chara">${options}</select></label>
        <label>等级 <input type="number" id="sc-level" value="30" min="1" max="120"></label>
        <label>装备等固定 SPD <input type="number" id="sc-flat" value="0"></label>
        <label>装备 SPD 百分比 <input type="number" id="sc-rate" value="0">%</label>
        <label>战斗中 SPD 升降 <input type="number" id="sc-buff" value="0">%</label>
      </div>
      <div class="result" id="sc-result"></div>`;
    const read = (id) => Number(host.querySelector(id).value) || 0;
    const update = () => {
      const [name, base, rate] = kPartySpd[Number(host.querySelector("#sc-chara").value)];
      const level = Math.max(1, read("#sc-level"));
      const table = partySpd(base, rate, level);
      const equipped = table + read("#sc-flat");
      const withRate = equipped + Math.trunc((equipped * read("#sc-rate")) / 100);
      const battle = Math.max(1, withRate + Math.trunc((read("#sc-buff") * withRate) / 100));
      const rows = [
        ["移动、待命（延迟 50）", 50],
        ["普通攻击（延迟 100）", 100],
        ["攻击类战技（延迟 120）", 120],
        ["S 战技（延迟 150）", 150],
      ]
        .map(([label, delay]) => `<tr><td>${label}</td><td class="num">${fmt(scaleBySpeed(delay, battle))}</td></tr>`)
        .join("");
      host.querySelector("#sc-result").innerHTML = `
        <p>${name} Lv${level}：状态表 SPD ${table} → 加装备 ${withRate} → 战斗中 <em>${battle}</em></p>
        <table class="tbl"><tr><th>行动</th><th class="num">行动后 AT</th></tr>${rows}</table>`;
    };
    host.addEventListener("input", update);
    update();
  }

  // ---------- AT 延迟计算 ----------

  function mountDelay(body) {
    const host = body.querySelector("#delay-calc");
    host.innerHTML = `
      <div class="controls">
        <label>对象现在的 AT <input type="number" id="dc-self" value="10"></label>
        <label>排在它后面的角色 AT <input type="number" id="dc-next" value="30"></label>
        <label><input type="checkbox" id="dc-has-after" checked> 再后面一位的 AT <input type="number" id="dc-after" value="31"></label>
      </div>
      <div class="controls">
        <label>技能的延迟量 <input type="number" id="dc-delay" value="10"></label>
        <label>对象的 SPD <input type="number" id="dc-spd" value="30" min="1"></label>
      </div>
      <div class="result" id="dc-result"></div>`;
    const read = (id) => Number(host.querySelector(id).value) || 0;
    const update = () => {
      const self = read("#dc-self");
      const next = read("#dc-next");
      const after = read("#dc-after");
      const hasAfter = host.querySelector("#dc-has-after").checked && after > next;
      const pass = hasAfter ? Math.min(1, (after - next) * 0.5) + next - self : next + 1 - self;
      const delay = scaleBySpeed(read("#dc-delay"), Math.max(1, read("#dc-spd")));
      const added = Math.max(delay, pass);
      host.querySelector("#dc-result").innerHTML = `
        <p>技能延迟按对象 SPD 换算：${fmt(delay)}；刚好越过后面那位所需：${fmt(pass)}</p>
        <p>实际增加 = 两者取大 = <b>${fmt(added)}</b>，对象的 AT 变为 <em>${fmt(self + added)}</em>
        ${added > delay ? "——延迟量不够，<em>仍然被推到了后面那位之后</em>。" : "。"}</p>`;
    };
    host.addEventListener("input", update);
    update();
  }

  // ---------- 奖励出现机率 ----------

  const kBonusNames = ["无奖励", "HP", "HP2", "EP", "EP2", "CP", "CP2", "会心", "会心2", "耳珠", "耳珠2", "零咏唱", "零咏唱2", "随机异常"];
  const kStandardWeights = [50, 8, 0, 8, 0, 8, 0, 10, 0, 8, 0, 8, 0, 0];

  function rollDistribution(weights, rate) {
    const total = weights.reduce((sum, weight, id) => sum + weight + (id === 0 ? 0 : Math.floor((weight * rate) / 100)), 0);
    const counts = new Array(weights.length).fill(0);
    for (let low = 0; low <= total; ++low) {
      let remaining = total;
      let result = 0;
      for (let id = weights.length - 1; id >= 0; --id) {
        remaining -= weights[id];
        if (weights[id] !== 0 && remaining <= low) {
          result = id;
          break;
        }
      }

      counts[result] += 1;
    }

    return counts.map((count) => count / (total + 1));
  }

  function mountBonusChance(body) {
    const host = body.querySelector("#bonus-chance");
    host.innerHTML = `
      <div class="controls">
        <label>奖励率加成 <input type="range" id="bc-rate" min="0" max="200" step="10" value="0"><b id="bc-rate-value">0%</b></label>
      </div>
      <table class="tbl" id="bc-table"></table>`;
    const update = () => {
      const rate = Number(host.querySelector("#bc-rate").value);
      host.querySelector("#bc-rate-value").textContent = `${rate}%`;
      const chances = rollDistribution(kStandardWeights, rate);
      const rows = kStandardWeights
        .map((weight, id) => ({ weight, id }))
        .filter(({ weight }) => weight > 0)
        .map(
          ({ weight, id }) =>
            `<tr><td>${kBonusNames[id]}</td><td class="num">${weight}</td><td class="bar-cell"><i style="width:${(chances[id] * 100).toFixed(1)}%"></i><span>${percent(chances[id])}</span></td></tr>`,
        )
        .join("");
      host.querySelector("#bc-table").innerHTML = `<tr><th>结果</th><th class="num">份额</th><th>机率</th></tr>${rows}`;
    };
    host.addEventListener("input", update);
    update();
  }

  // ---------- 章节与小节 ----------

  const chapters = [
    {
      id: "basics",
      label: "BASICS",
      tab: "基本原理",
      topics: [
        {
          id: "what",
          title: "AT 是什么",
          keywords: "AT BAR 小数 整数 浮点数 负数 0 零 0.00001 上限 最小正数 舍去 取整 量级",
          preview: "AT 的数值类型、正负与 0、最小正数 0.00001 及各种情况下的取值",
          html: `
            <div class="caption">
              <p>AT 是每个角色<em>距离下一次行动的等待量</em>。</p>
              <p>AT 越小越早行动，<em>归零的角色立刻行动</em>。</p>
            </div>
            <div class="widget">
              <div class="controls">
                <label>角色数 <input type="range" id="arc-count" min="1" max="16" value="12"><b id="arc-count-value">12</b></label>
                <button id="arc-act">让最前面的角色行动</button>
              </div>
              <div class="figure"><div class="frame arc-host"></div></div>
              <p class="fig-note">行动条示意图（弧度经过放大），头像下方的数字为 AT</p>
            </div>
            <div class="text">
              <h3>AT 是什么样的数</h3>
              <table class="tbl">
                <tr><th>问题</th><th>答案</th></tr>
                <tr><td>整数还是小数</td><td><em>小数</em>（单精度浮点数，约 7 位有效数字）。例如 100 ÷ 34 × 30 = 88.235……，就按这个小数保存和比较。</td></tr>
                <tr><td>画面上的数字</td><td>只显示整数部分，小数<em>直接舍去</em>（不是四舍五入）：88.9 显示 88，0.00001 显示 0。显示相同的两个角色，实际数值仍有大小。</td></tr>
                <tr><td>会不会是负数</td><td><em>不会</em>。每回合减少时、AT 延迟生效时，结果都会被截到不小于 0；其余写入 AT 的规则给出的也都是 0 或正数。</td></tr>
                <tr><td>能不能是 0</td><td><em>能</em>。轮到行动的角色在行动期间为 0；插队的角色立即变为 0；其他人每回合被减到不够减时也停在 0；延迟为 0 的行动结束后也是 0。AT 为 0 就是「已经轮到」。</td></tr>
                <tr><td>有没有上限</td><td>没有专门的上限。SPD 越低、延迟越大、被 AT 延迟叠加得越多，AT 就越大。</td></tr>
                <tr><td>最小的正数</td><td><b>0.00001</b>：AT 提前效果与「立即行动」状态给出的值。决定行动者时，不超过 0.00001 的 AT 按 0 处理：它行动时，其他人的 AT <em>一点也不减</em>。</td></tr>
              </table>
              <h3>各种情况下 AT 的取值</h3>
              <table class="tbl">
                <tr><th>时机</th><th>取值</th></tr>
                <tr><td>战斗开始</td><td>10，或 20–30、40–50 之间的<em>任意小数</em>（见「战斗开始时的 AT」）；被敌人接触开战时，一名我方为某个敌人的 AT + 0.1</td></tr>
                <tr><td>正在行动</td><td>0</td></tr>
                <tr><td>每回合减少后</td><td>原值 − 行动者的 AT，最小 0</td></tr>
                <tr><td>行动结束后</td><td>0（延迟为 0）或<em>不小于 1</em> 的小数；处于「立即行动」状态时为 0.00001</td></tr>
                <tr><td>被 AT 延迟</td><td>原值 + 延迟量（至少越过后面一位）</td></tr>
                <tr><td>被 AT 提前</td><td>0.00001</td></tr>
                <tr><td>插队</td><td>0</td></tr>
                <tr><td>事件战斗指定顺序</td><td>10、20、30……（第 n 位为 n × 10）</td></tr>
                <tr><td>复活</td><td>先算 50 ÷ SPD × 30；场上只要有人的 AT 不小于它，就改为场上最大的 AT + 1（头像变暗的角色不计）</td></tr>
              </table>
              <p>战斗中每个角色都有一个 AT 值。行动条（AT BAR）把所有角色按 AT 从小到大排成一列，最前面的角色就是下一个行动者。</p>
              <p>AT 的一生只有三件事：</p>
              <ol>
                <li><b>战斗开始时</b>按开战方式随机决定（见「AT 的计算」）。</li>
                <li><b>时间流动</b>：每次有人行动，全体的 AT 一起减少。</li>
                <li><b>行动之后</b>按所用技能的延迟和自己的 SPD 重新设定。</li>
              </ol>
              <p>此外，AT 延迟、AT 提前、插队等效果会直接改动 AT（见「AT 的增减」）。</p>
              <h3>数值的量级</h3>
              <ul>
                <li>开战时：10–50。</li>
                <li>行动一次之后：「技能延迟 ÷ SPD × 30」，普通攻击大约 50–150。</li>
                <li>我方 SPD 大约是「18 + 0.55 × 等级」，同等级敌人通常更快。</li>
              </ul>
              <p>具体数值见「AT 的计算 › SPD 与 AT 的取值」。</p>
            </div>`,
          mount: (body) => mountArc(body, true),
        },
        {
          id: "flow",
          title: "时间的流动",
          keywords: "回合 流程 减少 倒计时 模拟器 SPD 技能延迟",
          preview: "每回合最前角色行动，其他人 AT 一起减去它的 AT（附逐回合模拟器）",
          html: `
            <div class="caption">
              <p>每回合，行动条<em>最前面的角色</em>行动。</p>
              <p>其他人的 AT <em>一起减去它的 AT</em>，相对顺序不变。</p>
            </div>
            <div class="text">
              <h3>一个回合的流程</h3>
              <ol>
                <li>取行动条最前面的角色作为行动者，记下它的 AT（不超过 0.00001 时按 0 算）。</li>
                <li>其他所有角色的 AT 减去这个值，最小为 0；行动者的 AT 变为 0。</li>
                <li>行动者选择并执行行动。</li>
                <li>行动结束，行动者的 AT 设为「技能延迟 ÷ SPD × 30」，排回队伍中。</li>
              </ol>
              <p>所以 AT 实际上就是一个倒计时：谁的数字先归零，谁就先行动。延迟小的技能、SPD 高的角色，回来得更快。</p>
            </div>
            <div class="widget" id="sim"></div>
            <p class="fig-note">可修改 SPD 和下次使用的技能，逐回合观察 AT 的变化。初始 AT 为示例数值。</p>`,
          mount: mountSimulator,
        },
        {
          id: "order",
          title: "排列规则",
          keywords: "排序 顺序 插队 敌方优先 战斗不能 复活 增援",
          preview: "AT 从小到大排列，插队角色排在普通角色之前，同时插队敌方优先",
          html: `
            <div class="caption">
              <p>原则上按 <em>AT 从小到大</em>排列。</p>
              <p>插队的角色<em>按插队的先后</em>排在最前面。</p>
            </div>
            <div class="text">
              <ol>
                <li>正在行动的角色永远在最前面。</li>
                <li>其余角色按 AT 从小到大排列；AT 相同时保持原来的先后。</li>
                <li>插队的角色排在普通角色之前，先插队的在前。但插队的角色<em>不会挤到正在行动的角色前面</em>。</li>
                <li>敌我双方同时插队时，<em>敌方在前</em>。</li>
              </ol>
              <h3>谁在行动条上</h3>
              <ul>
                <li>战斗不能的角色会离开行动条；复活、增援的角色在下一次选择指令前补上。</li>
                <li>部分特殊状态下的角色也会暂时离开行动条。</li>
              </ul>
            </div>`,
        },
        {
          id: "display",
          title: "行动条的显示",
          keywords: "数字 前8位 堆叠 预览 高光 变暗 无法持有奖励",
          preview: "前 8 位显示 AT 数字，第 9 位起堆叠；选择技能与目标时的行动预览",
          html: `
            <div class="caption">
              <p>头像下方的数字就是 <em>AT</em>。</p>
              <p>只有<em>前 8 位</em>显示数字，第 9 位起头像挤在一起。</p>
            </div>
            <div class="text">
              <ul>
                <li>前 8 位的头像间隔相同，下方显示 AT（取整显示）。</li>
                <li>第 9 位起头像几乎重叠，数字隐藏。打开角色详细信息窗口时，所有数字都会显示。</li>
                <li>插队的头像从<em>右侧飞入</em>，落位时震动并闪光。</li>
                <li>头像变暗的角色处于特殊状态：无法持有 AT 奖励，开战时 AT 也不同（见各节）。</li>
              </ul>
              <h3>行动预览</h3>
              <p>选择技能时，行动条上会多出一个自己的头像，表示用这个技能后下一次行动的位置。
              技能带 AT 延迟或 AT 提前效果时，对象也会显示变化后的位置。切换技能和目标时预览即时更新。</p>
            </div>`,
        },
      ],
    },
    {
      id: "formula",
      label: "FORMULA",
      tab: "AT 的计算",
      topics: [
        {
          id: "initial",
          title: "战斗开始时的 AT",
          keywords: "初始化 开战 随机 先制 主动发起 昏厥 被接触 偷袭 10 20 30 40 50",
          preview: "不同开战方式下我方与敌方的初始 AT 范围（10、20–30、40–50）",
          html: `
            <div class="caption">
              <p>开战时，每个角色的 AT 在一个范围内<em>随机决定</em>。</p>
              <p>开战方式决定了<em>谁的范围更有利</em>。</p>
            </div>
            <div class="text">
              <p>初始 AT = 10 + 范围内的随机值（连续均匀分布）。</p>
              <table class="tbl">
                <tr><th>开战方式</th><th>我方</th><th>敌方</th></tr>
                <tr><td>一般（事件战斗等）</td><td class="num">20–30</td><td class="num">20–30</td></tr>
                <tr><td>主动发起战斗</td><td><em>操作中的角色 10</em>，其他 20–30</td><td class="num">20–30</td></tr>
                <tr><td>开战时有敌人处于昏厥（被敌人接触开战时不适用）</td><td class="num">20–30</td><td><em>40–50</em></td></tr>
                <tr><td>被敌人接触、攻击而开战</td><td><em>40–50</em>（一人例外，见下）</td><td class="num">20–30</td></tr>
              </table>
              <p>主动发起战斗且有敌人昏厥时，两条同时生效：操作中的角色 10，其他队友 20–30，敌人 40–50。
              头像变暗（特殊状态）的敌人一律为 10。</p>
              <h3>被敌人接触开战时的例外</h3>
              <p>我方会随机选一人，把他的 AT 设为某个敌人的 AT + 0.1，让他<em>紧跟在这个敌人之后</em>、比其他队友先行动。
              跟在哪个敌人之后取决于敌人数量（敌人按 AT 从大到小排列）：</p>
              <table class="tbl">
                <tr><th>敌人数</th><th>跟在谁之后</th></tr>
                <tr><td>1</td><td>唯一的敌人</td></tr>
                <tr><td>2–3</td><td>AT 最小（最快）的敌人</td></tr>
                <tr><td>4</td><td>1/3 机率第 2 快的敌人，2/3 机率最快的敌人</td></tr>
                <tr><td>5 以上</td><td>从最慢数起第 3、4、5 个敌人之一，各 1/3</td></tr>
              </table>
            </div>`,
        },
        {
          id: "after",
          title: "行动后的 AT",
          keywords: "公式 延迟 SPD 30 普通攻击 战技 S战技 移动 待命 异常状态 无法行动 计算器",
          preview: "行动后 AT = 技能延迟 ÷ SPD × 30，常见技能延迟表与计算器",
          html: `
            <div class="caption">
              <p>行动后的 AT = <em>技能延迟 ÷ SPD × 30</em>。</p>
              <p>SPD 30 时，AT 恰好等于技能的延迟。</p>
            </div>
            <div class="text">
              <p>每个技能都有一个「延迟」值。行动结束时先对延迟做修正（见「延迟的修正」），再按 SPD 换算。结果大于 0 时最少为 1。
              SPD 包含 SPD 提升／降低状态的效果，最低按 1 计算。</p>
              <h3>常见技能的延迟</h3>
              <table class="tbl">
                <tr><th>行动</th><th class="num">延迟</th></tr>
                <tr><td>普通攻击</td><td class="num">100</td></tr>
                <tr><td>移动、待命、因异常状态无法行动</td><td class="num">50</td></tr>
                <tr><td>攻击类战技（双连击、天魁拳、绝影、金刚击……）</td><td class="num">115–130</td></tr>
                <tr><td>天堂之吻</td><td class="num">150</td></tr>
                <tr><td>辅助类战技（公牛之怒 30、挑衅 45、鼓励 50、回复弹 75、幸福扳机 80）</td><td class="num">30–80</td></tr>
                <tr><td>S 战技</td><td class="num">150</td></tr>
              </table>
            </div>
            <div class="widget" id="delay-formula"></div>`,
          mount: mountDelayFormula,
        },
        {
          id: "values",
          title: "SPD 与 AT 的取值",
          keywords: "SPD 成长 装备 难度 VeryEasy Easy Normal Hard Nightmare 等级修正 艾丝蒂尔 约书亚 雪拉扎德 奥利维尔 克萝赛 阿加特 缇妲 阵 计算器",
          preview: "SPD 构成、我方 8 人与敌方各难度 SPD 范围及行动后 AT 速查",
          html: `
            <div class="caption">
              <p>SPD 30 是基准：此时行动后的 AT <em>正好等于技能延迟</em>。</p>
              <p>同等级的敌人 SPD 通常<em>比我方高三到七成</em>。</p>
            </div>
            <div class="text">
              <h3>AT 的数值</h3>
              <ul>
                <li>AT 是带小数的数，行动条上显示时<em>去掉小数部分</em>（例如 88.2 显示为 88）。排序用的是完整数值，所以显示相同的两个角色也有先后。</li>
                <li>AT 不会小于 0。正在行动、刚插队的角色为 0；AT 提前与「立即行动」状态给出的是 0.00001。</li>
                <li>行动后的 AT 大于 0 时至少为 1，SPD 再高也不会低于 1。</li>
                <li>开战时的 AT 在 10–50 之间，行动一次后通常在 50–200 之间，所以<em>第一轮的顺序几乎只由开战方式决定</em>，之后才是 SPD 与技能延迟起作用。</li>
              </ul>
              <h3>速查：行动后的 AT</h3>
              <table class="tbl">
                <tr><th>SPD</th><th class="num">待命（50）</th><th class="num">普通攻击（100）</th><th class="num">战技（120）</th><th class="num">S 战技（150）</th></tr>
                <tr><td>20</td><td class="num">75</td><td class="num">150</td><td class="num">180</td><td class="num">225</td></tr>
                <tr><td>30</td><td class="num">50</td><td class="num">100</td><td class="num">120</td><td class="num">150</td></tr>
                <tr><td>40</td><td class="num">37.5</td><td class="num">75</td><td class="num">90</td><td class="num">112.5</td></tr>
                <tr><td>50</td><td class="num">30</td><td class="num">60</td><td class="num">72</td><td class="num">90</td></tr>
                <tr><td>60</td><td class="num">25</td><td class="num">50</td><td class="num">60</td><td class="num">75</td></tr>
              </table>
              <p>AT 与 SPD 成反比：SPD 翻倍，行动次数也翻倍。两个角色的行动频率之比，等于「SPD ÷ 所用技能延迟」之比。</p>

              <h3>SPD 由什么组成</h3>
              <ol>
                <li><b>等级成长</b>：基数 + 等级 × 每级增量（小数部分舍去）。</li>
                <li><b>固定加成</b>：装备、饰品上写的 SPD 数值，以及其他永久加成。</li>
                <li><b>装备百分比</b>：「SPD +n%」一类的装备效果，对以上合计生效（小数舍去）。</li>
                <li><b>战斗中的升降</b>：SPD 提升、SPD 降低等状态按百分比增减，结果最低为 1。</li>
              </ol>

              <h3>我方角色的 SPD（未装备）</h3>
              <table class="tbl" id="party-spd"></table>
              <p>每升级 SPD 约增加 0.5–0.6。约书亚最快，缇妲最慢；同等级下两人相差约 25%。</p>

              <h3>敌人的 SPD</h3>
              <p>敌人同样按「基数 + 等级 × 每级增量」计算，但多数魔兽每级增加 1，之后还要依次乘上两个倍率：</p>
              <table class="tbl">
                <tr><th>难度</th><th class="num">VeryEasy</th><th class="num">Easy</th><th class="num">Normal</th><th class="num">Hard</th><th class="num">Nightmare</th></tr>
                <tr><td>敌人 SPD 倍率</td><td class="num">70%</td><td class="num">85%</td><td class="num">100%</td><td class="num">105%</td><td class="num">110%</td></tr>
              </table>
              <table class="tbl">
                <tr><th>敌人等级</th><th class="num">1–9</th><th class="num">10–19</th><th class="num">20–29</th><th class="num">30–39</th><th class="num">40–49</th><th class="num">50–59</th></tr>
                <tr><td>等级修正（Easy、Normal、Hard）</td><td class="num">101–117%</td><td class="num">131–132%</td><td class="num">132–133%</td><td class="num">133–134%</td><td class="num">134–135%</td><td class="num">135–140%</td></tr>
                <tr><td>等级修正（VeryEasy）</td><td class="num">101–112%</td><td class="num">121–122%</td><td class="num">122–123%</td><td class="num">123–124%</td><td class="num">124–125%</td><td class="num">125%</td></tr>
                <tr><td>等级修正（Nightmare）</td><td class="num">121–125%</td><td class="num">127–129%</td><td class="num">129–131%</td><td class="num">131–133%</td><td class="num">133–140%</td><td class="num">140–150%</td></tr>
                <tr><td>Normal 下的敌人 SPD（中位数）</td><td class="num">24</td><td class="num">31</td><td class="num">43</td><td class="num">51</td><td class="num">70</td><td class="num">93</td></tr>
                <tr><td>Normal 下的敌人 SPD（范围）</td><td class="num">15–47</td><td class="num">24–60</td><td class="num">31–73</td><td class="num">41–84</td><td class="num">52–98</td><td class="num">62–117</td></tr>
                <tr><td>同等级我方 SPD（约）</td><td class="num">18–23</td><td class="num">23–29</td><td class="num">29–34</td><td class="num">34–40</td><td class="num">40–46</td><td class="num">46–51</td></tr>
              </table>
              <p>中位数与范围按状态表中 279 个敌方数据在各自默认等级下计算，含头目与同一敌人的不同版本，只供估算量级。
              等级修正在 10 级时有一次明显的跳升（Normal 下由 117% 升到 131%），这也是 10 级前后敌人明显变快的原因之一。</p>

              <h3>一个例子</h3>
              <p>Lv30 的艾丝蒂尔未装备时 SPD 34，普通攻击后 AT = 100 ÷ 34 × 30 ≈ <em>88.2</em>；
              Normal 难度下 SPD 51 的同级敌人，普通攻击后 AT = 100 ÷ 51 × 30 ≈ <em>58.8</em>。
              如果双方都只用普通攻击，敌人行动 3 次、艾丝蒂尔只行动 2 次。补上 SPD 装备、使用延迟小的技能、给敌人加 AT 延迟，就是在缩小这个差距。</p>
            </div>
            <div class="widget" id="spd-calc"></div>
            <p class="fig-note">计算器：按角色与等级算出 SPD，再算各类行动后的 AT。</p>`,
          mount: mountSpdTable,
        },
        {
          id: "arts",
          title: "导力魔法的咏唱",
          keywords: "导力魔法 咏唱 驱动 发动 零咏唱 取消 打断 延迟减半",
          preview: "导力魔法分咏唱与发动两段换算 AT，以及常见魔法咏唱与延迟表",
          html: `
            <div class="caption">
              <p>导力魔法分<em>两段</em>：先咏唱，后发动。</p>
              <p>两段各自按 SPD 换算成 AT。</p>
            </div>
            <div class="text">
              <ol>
                <li>选择魔法后进入咏唱，AT 设为「咏唱时间 ÷ SPD × 30」，排回队伍等待。</li>
                <li>轮到时发动魔法，之后 AT 设为「延迟 ÷ SPD × 30」。</li>
              </ol>
              <table class="tbl">
                <tr><th>魔法</th><th class="num">咏唱</th><th class="num">发动后延迟</th></tr>
                <tr><td>时间加速、结晶防护、风之防壁、混沌利刃</td><td class="num">5</td><td class="num">25</td></tr>
                <tr><td>神圣祝福、风之翼击</td><td class="num">7</td><td class="num">35</td></tr>
                <tr><td>回复术、治愈术</td><td class="num">18</td><td class="num">72</td></tr>
                <tr><td>火焰箭、石之锤、风之轮、高压水块</td><td class="num">45</td><td class="num">45</td></tr>
                <tr><td>烈火箭、暗影之矛</td><td class="num">55</td><td class="num">55</td></tr>
                <tr><td>雷光、地狱之门、陨石冲击</td><td class="num">60</td><td class="num">60</td></tr>
                <tr><td>泰坦之咆哮、电浆波动</td><td class="num">70</td><td class="num">70</td></tr>
              </table>
              <ul>
                <li>咏唱时间受装备的咏唱修正和「延迟减半」状态影响，不受「延迟倍率」状态影响。</li>
                <li>持有<em>零咏唱</em>奖励时，导力魔法不需要咏唱，立即发动。</li>
                <li>咏唱中被插队或某些效果打断时，咏唱取消。</li>
              </ul>
            </div>`,
        },
        {
          id: "modifiers",
          title: "延迟的修正",
          keywords: "延迟倍率 延迟减半 装备 立即行动 0.00001 SPD升降 无法行动 异常状态",
          preview: "状态与装备按比例修正技能延迟，及无法行动时的 AT 规则",
          html: `
            <div class="caption">
              <p>状态与装备会<em>按比例</em>修正技能的延迟。</p>
              <p>无法行动时，AT 按「无法行动」的延迟计算。</p>
            </div>
            <div class="text">
              <h3>修正的种类</h3>
              <table class="tbl">
                <tr><th>来源</th><th>效果</th><th>适用</th></tr>
                <tr><td>延迟倍率状态</td><td>延迟 × 状态设定的百分比</td><td>普通行动（不含咏唱）</td></tr>
                <tr><td>延迟减半状态</td><td>延迟 × 50%</td><td>普通行动与咏唱</td></tr>
                <tr><td>装备效果</td><td>按装备设定的比例</td><td>普通攻击、战技、S 战技、魔法、道具（咏唱另有装备修正）</td></tr>
                <tr><td>「立即行动」状态</td><td>行动后 AT 直接变为 0.00001，<em>下一个又轮到自己</em></td><td>换算后大于 0 时</td></tr>
                <tr><td>SPD 提升／降低</td><td>改变换算时的 SPD</td><td>全部</td></tr>
              </table>
              <p>多个修正相乘。对自己使用带「AT 提前」效果的技能时，会获得「立即行动」状态。</p>
              <h3>无法行动时</h3>
              <p>因异常状态等无法行动、或处于头像变暗的特殊状态时，延迟取以下两者较大的一个，再按 SPD 换算：</p>
              <ul>
                <li>无法行动的延迟 50。</li>
                <li>场上其他角色中最小的正 AT（头像变暗的角色除外）。</li>
              </ul>
            </div>`,
        },
        {
          id: "revive",
          title: "复活与增援",
          keywords: "复活 增援 召唤 待命 50 指定顺序",
          preview: "复活角色排到所有人之后，增援与召唤按待命延迟 50 换算",
          html: `
            <div class="caption">
              <p>复活的角色<em>排到所有人之后</em>。</p>
              <p>增援与召唤按「待命」的延迟加入。</p>
            </div>
            <div class="text">
              <ul>
                <li><b>复活</b>：AT 先按待命的延迟 50 换算；如果有其他角色（头像变暗的除外）的 AT 不小于这个值，就改为其中最大的 AT + 1，<em>保证排在最后</em>。</li>
                <li><b>增援</b>：AT = 50 ÷ SPD × 30。</li>
                <li><b>召唤</b>：召唤出的角色 AT = 50 ÷ SPD × 30。</li>
                <li>事件战斗指定了行动顺序时，增援与召唤按指定的位次 × 10 取代以上结果；复活的角色仍会排到最后。</li>
              </ul>
            </div>`,
        },
      ],
    },
    {
      id: "change",
      label: "CHANGE",
      tab: "AT 的增减",
      topics: [
        {
          id: "delay",
          title: "AT 延迟",
          keywords: "延迟 保底 越过 抗性 免疫 夺取奖励 计算器",
          preview: "AT 延迟按对象 SPD 换算且至少推后一位，命中时夺走对象奖励",
          html: `
            <div class="caption">
              <p>AT 延迟<em>至少会把对象推到后面那位之后</em>。</p>
              <p>命中时还会<em>夺走对象的 AT 奖励</em>。</p>
            </div>
            <div class="text">
              <h3>增加多少</h3>
              <p>延迟量先按<em>对象的</em> SPD 换算（÷ SPD × 30），再和「刚好越过后面那位所需的量」比较，取较大者加到对象的 AT 上。
              所以只要命中，对象至少被推后一位。</p>
              <p>「刚好越过」的落点：比后面那位多出它与再后一位间距的一半，最多多 1；后面只剩一位时，落在它之后 1 点。</p>
              <h3>不会生效的情况</h3>
              <ul>
                <li>按技能的成功率判定失败，或对象对 AT 延迟有抗性。</li>
                <li>对象的装备可抵抗 AT 延迟，或处于防止 AT 变化的状态。</li>
                <li>对象是已插队、正等待行动的角色。</li>
              </ul>
              <h3>夺取奖励</h3>
              <p>AT 延迟命中时，对象身上的 AT 奖励会被攻击者夺走，移到攻击者的下一次行动位置，按合并规则处理。</p>
            </div>
            <div class="widget" id="delay-calc"></div>`,
          mount: mountDelay,
        },
        {
          id: "first",
          title: "AT 提前",
          keywords: "提前 加速 0.00001 立即行动 奖励跟随",
          preview: "对象 AT 变为 0.00001 排到最前；对自己使用时获得立即行动",
          html: `
            <div class="caption">
              <p>AT 提前把对象的 AT 变为 <em>0.00001</em>。</p>
              <p>对象会<em>排到最前</em>，下一个行动（正在行动的角色除外）。</p>
            </div>
            <div class="text">
              <ul>
                <li>有成功率的技能先判定成功与否。</li>
                <li>对象原位置上的 AT 奖励全部跟到新位置。</li>
                <li>对自己使用时，还会获得「立即行动」状态：这次行动后的 AT 同样变为 0.00001，<em>紧接着再行动一次</em>。</li>
              </ul>
            </div>`,
        },
        {
          id: "insert",
          title: "插队",
          keywords: "S-Break S战技 S 战技 0 取消咏唱 奖励",
          preview: "插队角色 AT 变为 0 排到最前并取消咏唱，行动后不获得新奖励",
          html: `
            <div class="caption">
              <p>插队的角色 AT 变为 <em>0</em>，直接排到最前。</p>
              <p>正在咏唱的魔法会<em>被取消</em>。</p>
            </div>
            <div class="text">
              <ul>
                <li>在可以操作的时机按下对应按键插队发动（如 S 战技），或由剧情事件强制插队。</li>
                <li>插队的角色排在普通角色之前，不会越过正在行动的角色；多人插队时按先后排列。</li>
                <li>原位置上的 AT 奖励一起带过来。</li>
                <li>按键插队时，已插过队、还没行动的角色不能再次插队。</li>
                <li>插队行动结束后，AT 照常按所用技能的延迟设定，但<em>这次不会获得新的 AT 奖励</em>。</li>
              </ul>
            </div>`,
        },
      ],
    },
    {
      id: "bonus",
      label: "AT BONUS",
      tab: "AT 奖励",
      topics: [
        {
          id: "kinds",
          title: "奖励一览",
          keywords: "AT奖励 HP EP CP 会心 暴击 耳珠 零咏唱 随机异常 一级 二级",
          preview: "7 种 AT 奖励的一级与二级效果及生效时机",
          html: `
            <div class="caption">
              <p>头像旁的奖励图标，在<em>那个角色行动时</em>生效。</p>
              <p>同一种奖励有<em>两个等级</em>，二级只能靠合并升级得到。</p>
            </div>
            <div class="text">
              <table class="tbl">
                <tr><th>奖励</th><th>一级</th><th>二级</th><th>生效</th></tr>
                <tr><td>HP 回复</td><td>我方 20%／敌方 2%</td><td>我方 50%／敌方 4%</td><td>回合开始时</td></tr>
                <tr><td>EP 回复</td><td>我方 20%／敌方 2%</td><td>我方 50%／敌方 4%</td><td>回合开始时</td></tr>
                <tr><td>CP 回复</td><td>+50</td><td>+100</td><td>回合开始时</td></tr>
                <tr><td>会心</td><td>必定会心</td><td>必定会心，倍率 +30%</td><td>整个回合</td></tr>
                <tr><td>耳珠</td><td>打倒敌人时额外掉落耳珠</td><td>额外掉落量为一级的 2 倍</td><td>整个回合</td></tr>
                <tr><td>零咏唱</td><td>导力魔法不耗 EP、免咏唱</td><td>同左，效果 +50%</td><td>整个回合</td></tr>
                <tr><td>随机异常</td><td colspan="2">攻击时给目标附加随机异常状态</td><td>整个回合</td></tr>
              </table>
              <p>HP、EP 为最大值的百分比。会心、耳珠、零咏唱、随机异常对敌方使用与我方相同的数值。
              会心、耳珠、随机异常会随头像位置移动（见「升级与夺取」）。</p>
            </div>`,
        },
        {
          id: "chance",
          title: "出现机率",
          keywords: "概率 抽签 份额 标准组 奖励率加成 无奖励",
          preview: "标准份额与奖励率加成反而降低出奖励机率的试算",
          html: `
            <div class="caption">
              <p>大多数战斗中，约<em>一半</em>的抽签结果是没有奖励。</p>
              <p>奖励率加成实际上<em>反而让奖励更难出现</em>。</p>
            </div>
            <div class="text">
              <h3>何时抽签</h3>
              <ul>
                <li>战斗开始、指令界面出现时，为每个头像各抽一次。</li>
                <li>每当有角色行动完毕，为其下一次行动的位置抽一次（发动咏唱、插队行动、本次夺得了奖励时不抽）。</li>
              </ul>
              <h3>份额</h3>
              <p>每场战斗使用一组份额，我方与敌方相同。标准组为：无奖励 50、会心 10，HP、EP、CP、耳珠、零咏唱各 8，随机异常 0。
              另有一组无会心、无奖励 60 的份额，以及一组<em>完全没有奖励</em>的份额（具体用于哪些战斗未整理）。</p>
              <h3>奖励率加成</h3>
              <p>队伍中有提高 AT 奖励出现率的效果时，游戏按加成放大了抽签的总数，但<em>每种奖励自身的份额没有放大</em>，
              多出来的部分全部落到「无奖励」上。下表按标准组计算：</p>
            </div>
            <div class="widget" id="bonus-chance"></div>`,
          mount: mountBonusChance,
        },
        {
          id: "merge",
          title: "升级与夺取",
          keywords: "合并 覆盖 升级 夺取 变暗 延迟 咏唱",
          preview: "同类奖励合并升级与高级覆盖低级，以及位置变化与夺取规则",
          html: `
            <div class="caption">
              <p>相同的奖励合并会<em>升级</em>，高级覆盖低级。</p>
              <p>AT 延迟命中、头像变暗时，奖励会被<em>夺走</em>。</p>
            </div>
            <div class="text">
              <h3>合并规则</h3>
              <table class="tbl">
                <tr><th>新来的奖励</th><th>结果</th></tr>
                <tr><td>与原有的相同（一级）</td><td>升级为二级</td></tr>
                <tr><td>与原有的相同（二级）</td><td>新来的作废</td></tr>
                <tr><td>原有一级，新来同类二级</td><td>原有的变为二级</td></tr>
                <tr><td>原有二级，新来同类一级</td><td>新来的作废</td></tr>
                <tr><td>不同种类</td><td>并排放置，都会生效</td></tr>
              </table>
              <h3>位置改变时</h3>
              <ul>
                <li>AT 提前、插队：奖励全部跟到新位置。</li>
                <li>自己咏唱：会心、耳珠、随机异常跟到咏唱后的位置，其余奖励在本回合结束后消失。</li>
              </ul>
              <h3>夺取</h3>
              <ul>
                <li>AT 延迟命中：攻击者夺走对象的奖励。</li>
                <li>行动结束时，头像变暗的角色的奖励被夺走，归最后一个对它使用 AT 提前效果的角色，没有的话归这次的行动者。</li>
                <li>被这次行动者打倒、离开行动条的角色<span class="tag infer">推测</span>：奖励归行动者。</li>
              </ul>
              <p>被夺取的奖励移到夺取者的下一次行动位置，按合并规则处理。</p>
            </div>`,
        },
      ],
    },
  ];

  Manual.register({
    id: "at-bar",
    group: "战斗",
    title: "AT BAR",
    summary: "AT 的原理：战斗开始时如何决定、每回合如何减少、行动后如何计算，以及延迟、提前、插队与 AT 奖励。",
    chapters,
  });
})();
