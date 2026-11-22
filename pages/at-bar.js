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

  // ---------- AT 延迟计算 ----------

  function mountDelay(body) {
    const host = body.querySelector("#delay-calc");
    host.innerHTML = `
      <div class="controls">
        <label>对象现在的 AT <input type="number" id="dc-self" value="0"></label>
        <label>排在它后面的角色 AT <input type="number" id="dc-next" value="20"></label>
        <label><input type="checkbox" id="dc-has-after" checked> 再后面一位的 AT <input type="number" id="dc-after" value="21"></label>
        <label>技能的延迟量 <input type="number" id="dc-delay" value="10"></label>
      </div>
      <div class="result" id="dc-result"></div>`;
    const read = (id) => Number(host.querySelector(id).value) || 0;
    const update = () => {
      const self = read("#dc-self");
      const next = read("#dc-next");
      const after = read("#dc-after");
      const hasAfter = host.querySelector("#dc-has-after").checked && after > next;
      const pass = hasAfter ? Math.min(1, (after - next) * 0.5) + next - self : next + 1 - self;
      const delay = read("#dc-delay");
      const added = Math.max(delay, pass);
      host.querySelector("#dc-result").innerHTML = `
        <p>刚好越过后面那位所需的延迟：<b>${pass.toFixed(2)}</b></p>
        <p>实际延迟 = 两者取大 = <b>${added.toFixed(2)}</b>，对象的 AT 变为 <em>${(self + added).toFixed(2)}</em>
        ${added > delay ? "——延迟量不够，<em>仍然被推到了后面那位之后</em>。" : "。"}</p>`;
    };
    host.addEventListener("input", update);
    update();
  }

  // ---------- 奖励出现机率 ----------

  function percent(value) {
    return `${(value * 100).toFixed(1)}%`;
  }

  function mountBonusChance(body) {
    const host = body.querySelector("#bonus-chance");
    host.innerHTML = `
      <div class="controls">
        <label>「没有奖励」的份额 <input type="number" id="bc-none" min="0" value="40"></label>
        <label>各种奖励的份额合计 <input type="number" id="bc-bonus" min="0" value="60"></label>
        <label>奖励率加成 <input type="range" id="bc-rate" min="0" max="200" step="10" value="0"><b id="bc-rate-value">0%</b></label>
      </div>
      <div class="result" id="bc-result"></div>`;
    const update = () => {
      const none = Math.max(0, Number(host.querySelector("#bc-none").value) || 0);
      const bonus = Math.max(0, Number(host.querySelector("#bc-bonus").value) || 0);
      const rate = Number(host.querySelector("#bc-rate").value);
      host.querySelector("#bc-rate-value").textContent = `${rate}%`;
      const extra = Math.floor((bonus * rate) / 100);
      const total = none + bonus + extra;
      const actual = bonus / (total + 1);
      const expected = (bonus + extra) / (total + 1);
      host.querySelector("#bc-result").innerHTML = `
        <table class="tbl">
          <tr><th>　</th><th>出现奖励的机率</th></tr>
          <tr><td>直观预期（加成让奖励更容易出现）</td><td class="bar-cell"><i style="width:${(expected * 100).toFixed(1)}%"></i><span>${percent(expected)}</span></td></tr>
          <tr><td>游戏实际</td><td class="bar-cell"><i style="width:${(actual * 100).toFixed(1)}%"></i><span><em>${percent(actual)}</em></span></td></tr>
        </table>`;
    };
    host.addEventListener("input", update);
    update();
  }

  // ---------- 章节与小节 ----------

  const chapters = [
    {
      id: "bar",
      label: "ACTION BAR",
      tab: "行动条",
      topics: [
        {
          id: "overview",
          title: "AT BAR 是什么",
          html: `
            <div class="caption">
              <p>战斗画面上沿齿轮排列的头像，就是<em>行动顺序</em>。</p>
              <p>越靠前越早行动，<em>最前面的角色就是下一个行动者</em>。</p>
            </div>
            <div class="widget">
              <div class="controls">
                <label>角色数 <input type="range" id="arc-count" min="1" max="16" value="12"><b id="arc-count-value">12</b></label>
                <button id="arc-act">让最前面的角色行动</button>
              </div>
              <div class="figure"><div class="frame arc-host"></div></div>
              <p class="fig-note">示意图（弧度经过放大）</p>
            </div>
            <div class="text">
              <p>每个角色都有一个 <b>AT 值</b>，可以理解为「还要等多久才能行动」。<em>数值越小，越早行动</em>。
              AT BAR 把战场上所有角色按 AT 值从小到大排成一列，沿着齿轮弯成一段弧线。</p>
              <p>每当有角色行动完毕，齿轮就会转动一下，头像整体向前移动，刚行动完的角色则按新的 AT 值排回队伍后方。</p>
              <p>有些头像旁边会带有 <b>AT 奖励</b> 图标，轮到这个角色行动时生效，详见「AT 奖励」。</p>
            </div>`,
          mount: (body) => mountArc(body, true),
        },
        {
          id: "display",
          title: "位置与数字",
          html: `
            <div class="caption">
              <p>头像下方的数字就是 <em>AT 值</em>。</p>
              <p>只有<em>前 8 位</em>显示数字，第 9 位起头像挤在一起。</p>
            </div>
            <div class="text">
              <h3>位置与数字</h3>
              <ul>
                <li>前 8 位的头像间隔相同，下方显示 AT 值。</li>
                <li>第 9 位起头像几乎重叠，数字隐藏。打开角色详细信息窗口时，所有数字都会显示。</li>
                <li>越靠前的头像叠在越上层。</li>
              </ul>
              <h3>头像的动作</h3>
              <ul>
                <li>战斗开始时，头像从后方依次滑入。</li>
                <li>普通加入的头像从左侧淡入；插队的头像从<em>右侧飞入</em>，落位时震动并闪光。</li>
                <li>头像变暗的角色，表示其处于无法领取 AT 奖励的状态（见「夺取」）。</li>
              </ul>
            </div>`,
        },
        {
          id: "order",
          title: "排列规则",
          html: `
            <div class="caption">
              <p>原则上按 <em>AT 值从小到大</em>排列。</p>
              <p>插队的角色<em>按插队的先后</em>排在最前面。</p>
            </div>
            <div class="text">
              <ol>
                <li>正在行动的角色永远在最前面。</li>
                <li>其余角色按 AT 值从小到大排列；AT 相同时保持原来的先后。</li>
                <li>插队的角色排在普通角色之前，先插队的在前。但插队的角色<em>不会挤到正在行动的角色前面</em>。</li>
                <li>敌我双方同时插队时，<em>敌方在前</em>。</li>
              </ol>
            </div>`,
        },
        {
          id: "join",
          title: "上条与离开",
          html: `
            <div class="caption">
              <p>战斗不能的角色会<em>离开行动条</em>。</p>
              <p>复活或增援的角色，会在下次选择指令前<em>补上</em>。</p>
            </div>
            <div class="text">
              <h3>谁会出现在行动条上</h3>
              <ul>
                <li>战斗开始时，所有能行动的角色都会出现。</li>
                <li>战斗不能的角色会从行动条上消失；被复活、或有增援加入时，会在下一次选择指令前补上。</li>
                <li>部分特殊状态下的角色也会暂时离开行动条。</li>
              </ul>
              <h3>事件战斗的固定顺序</h3>
              <p>部分事件战斗会预先指定行动顺序。此时指定角色的 AT 值依次被设为 10、20、30……，每行动一次就消耗掉一项。</p>
            </div>`,
        },
      ],
    },
    {
      id: "preview",
      label: "PREVIEW",
      tab: "行动预览",
      topics: [
        {
          id: "self",
          title: "自己的下一次行动",
          html: `
            <div class="caption">
              <p>选择技能时，行动条上会显示<em>行动后的位置</em>。</p>
              <p>技能的延迟越大，下一次行动<em>排得越靠后</em>。</p>
            </div>
            <div class="text">
              <p>选中技能后，行动条上会多出一个自己的头像，表示使用这个技能后下一次行动的位置，并以箭头标示移动方向。</p>
              <ul>
                <li>需要咏唱的技能会带有咏唱标记：发动前要先等到这个位置。</li>
                <li>头像上带着某些 AT 奖励时，奖励会跟着移到咏唱后的位置。</li>
              </ul>
            </div>`,
        },
        {
          id: "targets",
          title: "对象的变化",
          html: `
            <div class="caption">
              <p>AT 会被改变的对象，也会显示<em>改变后的位置</em>。</p>
              <p>切换目标时，预览<em>即时更新</em>。</p>
            </div>
            <div class="text">
              <p>技能带有 AT 延迟或 AT 提前效果时，被选为对象的角色也会显示变化后的位置和数值。对象的头像会以颜色高光标出。</p>
              <h3>小技巧</h3>
              <p>利用预览可以确认：延迟技能能否把敌人推到我方之后，或者某个带奖励的位置会被谁拿到。</p>
            </div>`,
        },
      ],
    },
    {
      id: "delay",
      label: "DELAY & CUT IN",
      tab: "延迟与插队",
      topics: [
        {
          id: "delay",
          title: "AT 延迟",
          html: `
            <div class="caption">
              <p>AT 延迟<em>至少会把对象推到后面那位角色之后</em>。</p>
              <p>即使技能的延迟量很小，也是如此。</p>
            </div>
            <div class="text">
              <p>延迟技能对一个角色生效时，游戏会比较两个数：</p>
              <ol>
                <li>技能本身的延迟量（会按对象的速度换算，部分敌人对延迟有抗性）。</li>
                <li>让对象刚好越过排在它后面那一位所需的延迟量。</li>
              </ol>
              <p>实际延迟取其中较大的一个。所以<em>只要命中，对象至少会被推后一位</em>。</p>
              <p>「刚好越过」的落点在后面两位之间：比后面那位多出两者间距的一半，但最多只多 1。
              后面只剩一位时，则落在那一位之后 1 点。</p>
            </div>
            <div class="widget" id="delay-calc"></div>`,
          mount: mountDelay,
        },
        {
          id: "first",
          title: "AT 提前",
          html: `
            <div class="caption">
              <p>AT 提前把对象<em>直接排到最前面</em>。</p>
              <p>对象位置上的 AT 奖励<em>一起跟过去</em>。</p>
            </div>
            <div class="text">
              <p>AT 提前效果会把对象的 AT 值变为接近 0，下一个就轮到它（正在行动的角色除外）。</p>
              <p>对象原位置上的 AT 奖励会全部移到新的位置，配合奖励使用效果更好。</p>
            </div>`,
        },
        {
          id: "insert",
          title: "插队",
          html: `
            <div class="caption">
              <p>插队的角色<em>从右侧飞入</em>，直接排到最前面。</p>
              <p>正在咏唱的魔法会因此<em>被取消</em>。</p>
            </div>
            <div class="text">
              <h3>插队的方式</h3>
              <ul>
                <li>在可以操作的时机按下对应按键插队发动（如 S 战技）。</li>
                <li>剧情事件中的强制插队。</li>
              </ul>
              <h3>插队时发生的事</h3>
              <ol>
                <li>插队角色的 AT 变为 0，排到最前面（不会越过正在行动的角色）。</li>
                <li>它原来位置上的 AT 奖励一起带过来。</li>
                <li>如果它正在咏唱魔法，<em>咏唱被取消</em>。</li>
                <li>按键插队时，已经插过队、还没行动的角色不能再次插队。</li>
              </ol>
              <div class="box">
                <span class="box-title">插队与 AT 奖励</span>
                原位置上的奖励会跟到插队位置；但插队行动结束后，<em>不会获得新的 AT 奖励</em>。
              </div>
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
          title: "奖励的种类",
          html: `
            <div class="caption">
              <p>头像旁的奖励图标，会在<em>那个角色行动时</em>生效。</p>
              <p>敌人也能拿到奖励，<em>注意敌方头像旁的图标</em>。</p>
            </div>
            <div class="text">
              <table class="tbl">
                <tr><th>奖励</th><th>效果</th><th>生效时机</th></tr>
                <tr><td>HP 回复</td><td>按最大 HP 的百分比回复。</td><td>回合开始时</td></tr>
                <tr><td>EP 回复</td><td>按最大 EP 的百分比回复。</td><td>回合开始时</td></tr>
                <tr><td>CP 回复</td><td>回复固定数值的 CP。</td><td>回合开始时</td></tr>
                <tr><td>会心</td><td>本回合攻击与回复<em>必定会心</em>，会心倍率也会提高。</td><td>整个回合</td></tr>
                <tr><td>耳珠</td><td>本回合打倒敌人时，掉落的耳珠增加。</td><td>整个回合</td></tr>
                <tr><td>导力魔法</td><td>本回合导力魔法<em>不消耗 EP、无需咏唱</em>，效果提高。</td><td>整个回合</td></tr>
                <tr><td>随机异常</td><td>本回合攻击时，给目标附加随机的异常状态。</td><td>整个回合</td></tr>
              </table>
              <p>同一种奖励有不同的强度等级，具体数值因奖励而异。HP、EP、CP 回复对我方和敌方分别设有数值；
              其余四种对敌方也使用和我方相同的数值。</p>
            </div>`,
        },
        {
          id: "timing",
          title: "出现与生效",
          html: `
            <div class="caption">
              <p>行动结束后，下一次行动的位置<em>有机会获得新奖励</em>。</p>
              <p>回复类奖励在<em>回合开始时</em>立即生效。</p>
            </div>
            <div class="text">
              <h3>奖励何时出现</h3>
              <ul>
                <li>战斗开始、指令界面出现时，每个头像都有机会带上奖励。</li>
                <li>之后每当有角色行动完毕，它排回队伍后的新位置有机会获得一个新奖励。</li>
                <li>以下情况，这次行动后不会获得新奖励：发动需要咏唱的魔法（开始咏唱时）、插队行动、本次行动中夺得了别人的奖励。</li>
              </ul>
              <h3>奖励生效时</h3>
              <p>回复类奖励在回合开始时立即生效，图标放大旋转后消失，角色身上出现特效。其余奖励在整个回合内有效。</p>
            </div>`,
        },
        {
          id: "chance",
          title: "出现机率",
          html: `
            <div class="caption">
              <p>每场战斗都设有<em>各种奖励的出现份额</em>。</p>
              <p>提高奖励率的加成，实际上<em>反而让奖励更难出现</em>。</p>
            </div>
            <div class="text">
              <h3>抽取方式</h3>
              <p>每次决定奖励时，游戏按这场战斗设定的份额抽签：「没有奖励」占一份，每种奖励各占一份。
              我方和敌方的份额分开设定。</p>
              <h3>奖励率加成的实际效果</h3>
              <p>如果队伍中有提高 AT 奖励出现率的效果，游戏会按加成放大抽签的总数，但<em>每种奖励自身的份额没有跟着放大</em>，
              多出来的部分全部落到了「没有奖励」上。结果是：<em>加成越高，出现奖励的机率越低</em>。</p>
              <p>以下可以试算两者的差别（份额为示例数值）：</p>
            </div>
            <div class="widget" id="bonus-chance"></div>
            <p class="fig-note">游戏中是否存在带这种加成的装备，尚未核对。</p>`,
          mount: mountBonusChance,
        },
      ],
    },
    {
      id: "steal",
      label: "MERGE & STEAL",
      tab: "升级与争夺",
      topics: [
        {
          id: "merge",
          title: "叠加与升级",
          html: `
            <div class="caption">
              <p>同一个位置拿到相同的奖励，会<em>升级为更高一级</em>。</p>
              <p>更强的奖励会<em>覆盖</em>较弱的同类奖励。</p>
            </div>
            <div class="text">
              <p>奖励移到一个已有奖励的位置上时（例如被夺取、或领取新奖励），会和原有的奖励比较：</p>
              <table class="tbl">
                <tr><th>情况</th><th>结果</th></tr>
                <tr><td>两者相同</td><td>合并并<em>升级</em>为更高一级（已是最高级时，新来的奖励作废）。</td></tr>
                <tr><td>新来的是同类的更高一级</td><td>原有奖励<em>升级</em>为新来的那一级。</td></tr>
                <tr><td>新来的是同类的更低一级</td><td>新来的奖励作废。</td></tr>
                <tr><td>不同种类</td><td>两个奖励并排放在一起，都会生效。</td></tr>
              </table>
            </div>`,
        },
        {
          id: "move",
          title: "奖励的去向",
          html: `
            <div class="caption">
              <p>被 AT 延迟命中的角色，<em>奖励会消失</em>。</p>
              <p>AT 提前和插队，奖励则会<em>跟过去</em>。</p>
            </div>
            <div class="text">
              <table class="tbl">
                <tr><th>情况</th><th>原位置上的奖励</th></tr>
                <tr><td>被 AT 延迟命中</td><td>随原位置<em>一起消失</em>。</td></tr>
                <tr><td>被 AT 提前命中</td><td>全部跟到新位置。</td></tr>
                <tr><td>插队</td><td>全部跟到插队位置。</td></tr>
                <tr><td>自己发动需要咏唱的技能</td><td>部分种类的奖励跟到咏唱完成的位置。</td></tr>
              </table>
              <p>延迟技能没有命中、AT 没有变化时，奖励保持不变。</p>
              <h3>小技巧</h3>
              <p>敌方头像旁出现强力奖励时，用 AT 延迟技能命中这个敌人，就能<em>让它的奖励作废</em>。反过来，我方带着奖励的角色要提防敌人的延迟攻击。</p>
            </div>`,
        },
        {
          id: "steal",
          title: "夺取",
          html: `
            <div class="caption">
              <p>行动结束时，某些角色的奖励会被<em>夺走</em>。</p>
              <p>头像变暗的角色<em>无法持有奖励</em>。</p>
            </div>
            <div class="text">
              <p>行动结束时，以下角色的奖励会被夺走：</p>
              <ul>
                <li>被这次行动者的行动打倒、离开行动条的角色<span class="tag infer">推测</span>：奖励归行动者。</li>
                <li>头像变暗的角色：奖励归最后一个对它使用 AT 提前效果的角色；没有的话归这次的行动者。</li>
              </ul>
              <p>被夺取的奖励移到夺取者的下一次行动位置，并按「叠加与升级」的规则合并。部分奖励不能被夺取。</p>
            </div>`,
        },
      ],
    },
  ];

  Manual.register({
    id: "at-bar",
    group: "战斗",
    title: "AT BAR",
    summary: "战斗中的行动顺序：排列规则、行动预览、AT 延迟与插队，以及 AT 奖励的种类、升级、争夺与出现机率。",
    chapters,
  });
})();
