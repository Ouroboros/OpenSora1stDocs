"use strict";

// 由游戏数据表 t_skill.tbl 与还原工程的 BuildSkillHelp 生成
window.CRAFTS_DATA = [
 {
  "id": 2001,
  "chara": 0,
  "kind": "战技",
  "name": "旋风轮",
  "sort": 0,
  "cost": 40,
  "delay": 120,
  "learn": 1,
  "power": 125,
  "stun": 120,
  "summary": "【物理攻击 D+／自身·圆L】STR↓／侧面特效",
  "description": "将棍棒回旋抡动，形成旋风般的圆轮。",
  "effects": [
   "伤害：威力 125%，物理（STR 对 DEF），侧面命中时攻击力 ×120%",
   "STR 降低"
  ]
 },
 {
  "id": 2003,
  "chara": 0,
  "kind": "战技",
  "name": "绞丝棍",
  "sort": 1,
  "cost": 50,
  "delay": 125,
  "learn": 14,
  "power": 200,
  "stun": 140,
  "summary": "【魔法攻击 B／扇形直线】解除驱动／夺取奖励",
  "description": "用棍棒击出冲击波，将敌人贯穿。",
  "effects": [
   "伤害：威力 200%，魔法（ATS 对 ADF）",
   "解除驱动（取消咏唱）：机率 100%",
   "夺取对象的 AT 奖励"
  ]
 },
 {
  "id": 2002,
  "chara": 0,
  "kind": "战技",
  "name": "金刚击",
  "sort": 2,
  "cost": 60,
  "delay": 130,
  "learn": 34,
  "power": 250,
  "stun": 180,
  "summary": "【物理攻击 A／单体】晕眩·大／封技30％／SPD↓",
  "description": "瞄准敌人要害的全力一击。",
  "effects": [
   "伤害：威力 250%，物理（STR 对 DEF）",
   "封技：机率 30%",
   "SPD 降低"
  ]
 },
 {
  "id": 2000,
  "chara": 0,
  "kind": "战技",
  "name": "鼓励",
  "sort": 3,
  "cost": 30,
  "delay": 50,
  "learn": 3,
  "power": null,
  "stun": 0,
  "summary": "【辅助／我方全体】3回合STR･DEF↑／CP逐渐上升",
  "description": "以洪亮的声音振奋士气。",
  "effects": [
   "STR 提升",
   "DEF 提升",
   "CP 逐渐上升：每回合 15，3 回合"
  ]
 },
 {
  "id": 2004,
  "chara": 0,
  "kind": "S 战技",
  "name": "烈波无双击",
  "sort": 4,
  "cost": 100,
  "delay": 150,
  "learn": -1,
  "power": 275,
  "stun": 140,
  "summary": "【物理攻击 A+／地点·圆M】封技50％／夺取奖励",
  "description": "以猛烈的气势向敌人发动狂风暴雨般的连续打击。",
  "effects": [
   "伤害：威力 275%，物理（STR 对 DEF）",
   "封技：机率 50%",
   "夺取对象的 AT 奖励"
  ]
 },
 {
  "id": 2005,
  "chara": 0,
  "kind": "S 战技",
  "name": "樱花无双击",
  "sort": 5,
  "cost": 100,
  "delay": 150,
  "learn": 20,
  "power": 350,
  "stun": 200,
  "summary": "【物理攻击 SS／地点·圆S】晕眩·极／夺取奖励",
  "description": "在烈波无双击的基础上增加了上挑和下劈攻击，威力有所增强。",
  "effects": [
   "伤害：威力 350%，物理（STR 对 DEF）",
   "夺取对象的 AT 奖励"
  ]
 },
 {
  "id": 2101,
  "chara": 1,
  "kind": "战技",
  "name": "双连击",
  "sort": 0,
  "cost": 30,
  "delay": 115,
  "learn": 1,
  "power": 200,
  "stun": 140,
  "summary": "【物理攻击 B／地点·圆S】解除驱动／背面特效",
  "description": "兼具速度与力量的二连击。",
  "effects": [
   "伤害：威力 200%，物理（STR 对 DEF），背面命中时攻击力 ×120%",
   "解除驱动（取消咏唱）：机率 100%"
  ]
 },
 {
  "id": 2100,
  "chara": 1,
  "kind": "战技",
  "name": "绝影",
  "sort": 1,
  "cost": 40,
  "delay": 120,
  "learn": 3,
  "power": 150,
  "stun": 120,
  "summary": "【物理攻击 C／直线S】延迟小",
  "description": "斩击敌人并妨碍其行动。",
  "effects": [
   "伤害：威力 150%，物理（STR 对 DEF）",
   "AT 延迟：延迟量 30（按对象 SPD 换算，至少越过后一位），机率 100%"
  ]
 },
 {
  "id": 2102,
  "chara": 1,
  "kind": "战技",
  "name": "胧",
  "sort": 2,
  "cost": 50,
  "delay": 125,
  "learn": 15,
  "power": 250,
  "stun": 180,
  "summary": "【物理攻击 A／单体】晕眩·大／即死20％／DEF･ADF↓",
  "description": "从敌人死角瞄准要害。",
  "effects": [
   "伤害：威力 250%，物理（STR 对 DEF）",
   "即死：机率 20%",
   "DEF 降低",
   "ADF 降低"
  ]
 },
 {
  "id": 2103,
  "chara": 1,
  "kind": "战技",
  "name": "魔眼",
  "sort": 3,
  "cost": 60,
  "delay": 130,
  "learn": 35,
  "power": 225,
  "stun": 120,
  "summary": "【魔法攻击 B+／扇形M】混乱20％／延迟中",
  "description": "以金色瞳孔瞪视敌人，扰乱其认知。",
  "effects": [
   "伤害：威力 225%，魔法（ATS 对 ADF）",
   "混乱：机率 20%",
   "AT 延迟：延迟量 40（按对象 SPD 换算，至少越过后一位），机率 100%"
  ]
 },
 {
  "id": 2104,
  "chara": 1,
  "kind": "S 战技",
  "name": "断骨剑",
  "sort": 4,
  "cost": 100,
  "delay": 150,
  "learn": -1,
  "power": 300,
  "stun": 140,
  "summary": "【物理攻击 S／单体】消除增益／解除驱动／夺取奖励",
  "description": "以迷惑性极强的动作连续斩击敌人。",
  "effects": [
   "伤害：威力 300%，物理（STR 对 DEF）",
   "消除对象的增益状态",
   "解除驱动（取消咏唱）：机率 100%",
   "夺取对象的 AT 奖励"
  ]
 },
 {
  "id": 2105,
  "chara": 1,
  "kind": "S 战技",
  "name": "漆黑之牙",
  "sort": 5,
  "cost": 100,
  "delay": 150,
  "learn": 21,
  "power": 325,
  "stun": 140,
  "summary": "【物理攻击 S+／全体】即死20％／延迟大／夺取奖励",
  "description": "可在瞬间斩倒所有敌人的暗黑之刃。",
  "effects": [
   "伤害：威力 325%，物理（STR 对 DEF）",
   "即死：机率 20%",
   "AT 延迟：延迟量 50（按对象 SPD 换算，至少越过后一位），机率 100%",
   "夺取对象的 AT 奖励"
  ]
 },
 {
  "id": 2200,
  "chara": 2,
  "kind": "战技",
  "name": "风之鞭",
  "sort": 1,
  "cost": 40,
  "delay": 120,
  "learn": 1,
  "power": 150,
  "stun": 120,
  "summary": "【魔法攻击 C／扇形L】黑暗40％／延迟小／SPD･MOV↓",
  "description": "挥鞭划破空气，在形成真空的同时重击敌人。",
  "effects": [
   "伤害：威力 150%，魔法（ATS 对 ADF）",
   "黑暗：机率 40%",
   "AT 延迟：延迟量 30（按对象 SPD 换算，至少越过后一位），机率 100%",
   "SPD 降低",
   "MOV 降低"
  ]
 },
 {
  "id": 2201,
  "chara": 2,
  "kind": "战技",
  "name": "束缚之钉",
  "sort": 2,
  "cost": 50,
  "delay": 125,
  "learn": 1,
  "power": 200,
  "stun": 140,
  "summary": "【物理攻击 B／直线L】解除驱动／封技40％／侧面特效",
  "description": "打击敌人要害，封印其攻击。",
  "effects": [
   "伤害：威力 200%，物理（STR 对 DEF），侧面命中时攻击力 ×120%",
   "解除驱动（取消咏唱）：机率 100%",
   "封技：机率 40%"
  ]
 },
 {
  "id": 2202,
  "chara": 2,
  "kind": "战技",
  "name": "天堂之吻",
  "sort": 3,
  "cost": 90,
  "delay": 150,
  "learn": 16,
  "power": null,
  "stun": 0,
  "summary": "【辅助／我方·地点·圆L】加速／3回合STR･SPD↑／CP+15",
  "description": "以鞭策的方式粗鲁地激励伙伴。可立即行动。",
  "effects": [
   "AT 提前：对象 AT 变为 0.00001，机率 100%；对自己使用时获得「立即行动」",
   "STR 提升",
   "SPD 提升",
   "CP +15"
  ]
 },
 {
  "id": 2203,
  "chara": 2,
  "kind": "S 战技",
  "name": "女王之怒",
  "sort": 5,
  "cost": 100,
  "delay": 150,
  "learn": 1,
  "power": 325,
  "stun": 160,
  "summary": "【物理攻击 S+／地点·圆M】延迟大／SPD↓／夺取奖励",
  "description": "用长鞭发动令敌人无法躲闪的恐怖连击。",
  "effects": [
   "伤害：威力 325%，物理（STR 对 DEF）",
   "AT 延迟：延迟量 50（按对象 SPD 换算，至少越过后一位），机率 100%",
   "SPD 降低",
   "夺取对象的 AT 奖励"
  ]
 },
 {
  "id": 2300,
  "chara": 3,
  "kind": "战技",
  "name": "快速狙击",
  "sort": 1,
  "cost": 40,
  "delay": 120,
  "learn": 1,
  "power": 125,
  "stun": 120,
  "summary": "【物理攻击 D+／地点·圆L】ATS･ADF↓／夺取奖励",
  "description": "以肉眼无法捕捉的速度射出子弹，同时攻击范围内的全部敌人。",
  "effects": [
   "伤害：威力 125%，物理（STR 对 DEF）",
   "ATS 降低",
   "ADF 降低",
   "夺取对象的 AT 奖励"
  ]
 },
 {
  "id": 2301,
  "chara": 3,
  "kind": "战技",
  "name": "精准射击",
  "sort": 2,
  "cost": 50,
  "delay": 125,
  "learn": 1,
  "power": 200,
  "stun": 120,
  "summary": "【魔法攻击 B／直线S】解除驱动／封魔50％／背面特效",
  "description": "精准地狙击敌人，封锁其魔法。",
  "effects": [
   "伤害：威力 200%，魔法（ATS 对 ADF），背面命中时攻击力 ×120%",
   "解除驱动（取消咏唱）：机率 100%",
   "封魔：机率 50%"
  ]
 },
 {
  "id": 2302,
  "chara": 3,
  "kind": "战技",
  "name": "幸福扳机",
  "sort": 3,
  "cost": 60,
  "delay": 80,
  "learn": 39,
  "power": null,
  "stun": 0,
  "summary": "【回复／我方·地点·圆LL】HP･EP回复25％／解除减益",
  "description": "投掷花束，使伤势痊愈。原理与手法都令人捉摸不透的神秘战技。",
  "effects": [
   "回复最大 HP 的 25%",
   "回复最大 EP 的 25%",
   "解除异常状态",
   "解除能力降低"
  ]
 },
 {
  "id": 2303,
  "chara": 3,
  "kind": "S 战技",
  "name": "咆哮弹",
  "sort": 4,
  "cost": 100,
  "delay": 150,
  "learn": 1,
  "power": 275,
  "stun": 160,
  "summary": "【魔法攻击 A+／全体】封魔100％／夺取奖励",
  "description": "发射威力无比的能量弹，引起大爆炸。",
  "effects": [
   "伤害：威力 275%，魔法（ATS 对 ADF）",
   "封魔：机率 100%",
   "夺取对象的 AT 奖励"
  ]
 },
 {
  "id": 2400,
  "chara": 4,
  "kind": "战技",
  "name": "斗魂",
  "sort": 1,
  "cost": 50,
  "delay": 125,
  "learn": 1,
  "power": 200,
  "stun": 140,
  "summary": "【物理攻击 B／直线S】STR･DEF↓／侧面特效",
  "description": "吉克从空中发动的奇袭攻击。",
  "effects": [
   "伤害：威力 200%，物理（STR 对 DEF），侧面命中时攻击力 ×120%",
   "STR 降低",
   "DEF 降低"
  ]
 },
 {
  "id": 2401,
  "chara": 4,
  "kind": "战技",
  "name": "岚",
  "sort": 2,
  "cost": 50,
  "delay": 125,
  "learn": 1,
  "power": 225,
  "stun": 120,
  "summary": "【魔法攻击 B+／地点·圆S】延迟中／冻结40％",
  "description": "裹挟冰冷寒风的猛烈连续攻击。",
  "effects": [
   "伤害：威力 225%，魔法（ATS 对 ADF）",
   "AT 延迟：延迟量 40（按对象 SPD 换算，至少越过后一位），机率 100%",
   "冻结：机率 40%"
  ]
 },
 {
  "id": 2402,
  "chara": 4,
  "kind": "战技",
  "name": "洁白灵气",
  "sort": 3,
  "cost": 50,
  "delay": 60,
  "learn": 22,
  "power": null,
  "stun": 0,
  "summary": "【辅助／自身·圆LL】逐渐回复HP／4回合心眼／解除减益",
  "description": "鼓舞同伴，赐予天恩。",
  "effects": [
   "逐渐回复 HP：每回合 15%，3 回合",
   "心眼：机率 100%",
   "解除异常状态",
   "解除能力降低"
  ]
 },
 {
  "id": 2403,
  "chara": 4,
  "kind": "S 战技",
  "name": "光明之环",
  "sort": 4,
  "cost": 100,
  "delay": 150,
  "learn": 1,
  "power": null,
  "stun": 0,
  "summary": "【回复／我方全体】复活／回复HP100％／护盾小",
  "description": "向空之女神献上祈祷，为成员带来生命气息。",
  "effects": [
   "复活，并回复最大 HP 的 100%",
   "HP 护盾：1000"
  ]
 },
 {
  "id": 2500,
  "chara": 5,
  "kind": "战技",
  "name": "公牛之怒",
  "sort": 1,
  "cost": 0,
  "delay": 30,
  "learn": 1,
  "power": null,
  "stun": 0,
  "summary": "【辅助／自身】HP减少20％／3回合STR↑／CP+60",
  "description": "牺牲体力提升斗志的怒吼。",
  "effects": [
   "自身 HP 减少最大 HP 的 20%",
   "STR 提升",
   "CP +60"
  ]
 },
 {
  "id": 2501,
  "chara": 5,
  "kind": "战技",
  "name": "火焰碎击",
  "sort": 2,
  "cost": 50,
  "delay": 125,
  "learn": 1,
  "power": 200,
  "stun": 140,
  "summary": "【物理攻击 B／扇形M】炎伤40％／侧面特效",
  "description": "缠绕烈火的强力一击。",
  "effects": [
   "伤害：威力 200%，物理（STR 对 DEF），侧面命中时攻击力 ×120%",
   "炎伤：机率 40%"
  ]
 },
 {
  "id": 2502,
  "chara": 5,
  "kind": "战技",
  "name": "龙骑之刃",
  "sort": 3,
  "cost": 40,
  "delay": 120,
  "learn": 1,
  "power": 150,
  "stun": 120,
  "summary": "【魔法攻击 C／直线S】解除驱动",
  "description": "以重剑产生的冲击波吞噬敌人。",
  "effects": [
   "伤害：威力 150%，魔法（ATS 对 ADF）",
   "解除驱动（取消咏唱）：机率 100%"
  ]
 },
 {
  "id": 2503,
  "chara": 5,
  "kind": "战技",
  "name": "霸王疾风",
  "sort": 4,
  "cost": 60,
  "delay": 130,
  "learn": 35,
  "power": 250,
  "stun": 160,
  "summary": "【物理攻击 A／地点·圆S】延迟大／DEF↓",
  "description": "在最佳时机猛然接近敌人，以重剑发动连续攻击。",
  "effects": [
   "伤害：威力 250%，物理（STR 对 DEF）",
   "AT 延迟：延迟量 50（按对象 SPD 换算，至少越过后一位），机率 100%",
   "DEF 降低"
  ]
 },
 {
  "id": 2505,
  "chara": 5,
  "kind": "S 战技",
  "name": "终极裂斩",
  "sort": 5,
  "cost": 100,
  "delay": 150,
  "learn": 1,
  "power": 325,
  "stun": 180,
  "summary": "【物理攻击 S+／圆LL】炎伤60％／夺取奖励",
  "description": "以倾注全力的斩击引发爆炎。",
  "effects": [
   "伤害：威力 325%，物理（STR 对 DEF）",
   "炎伤：机率 60%",
   "夺取对象的 AT 奖励"
  ]
 },
 {
  "id": 2600,
  "chara": 6,
  "kind": "战技",
  "name": "烟雾弹",
  "sort": 1,
  "cost": 40,
  "delay": 120,
  "learn": 1,
  "power": 150,
  "stun": 120,
  "summary": "【物理攻击 C／地点·圆L】黑暗･炎伤50％",
  "description": "发射烟雾弹攻击敌人。",
  "effects": [
   "伤害：威力 150%，物理（STR 对 DEF）",
   "黑暗：机率 50%",
   "炎伤：机率 50%"
  ]
 },
 {
  "id": 2601,
  "chara": 6,
  "kind": "战技",
  "name": "回复弹",
  "sort": 2,
  "cost": 50,
  "delay": 75,
  "learn": 1,
  "power": null,
  "stun": 0,
  "summary": "【回复／我方·地点·圆M】HP回复30％／CP+30／解除减益",
  "description": "向空中发射回复弹，治愈范围内的成员。",
  "effects": [
   "回复最大 HP 的 30%",
   "CP +30",
   "解除异常状态",
   "解除能力降低"
  ]
 },
 {
  "id": 2602,
  "chara": 6,
  "kind": "战技",
  "name": "干扰射线",
  "sort": 3,
  "cost": 60,
  "delay": 130,
  "learn": 33,
  "power": 150,
  "stun": 120,
  "summary": "【魔法攻击 C／直线M】消除增益／解除驱动／夺取奖励",
  "description": "装上武器零件，发射高密度激光。",
  "effects": [
   "伤害：威力 150%，魔法（ATS 对 ADF）",
   "消除对象的增益状态",
   "解除驱动（取消咏唱）：机率 100%",
   "夺取对象的 AT 奖励"
  ]
 },
 {
  "id": 2603,
  "chara": 6,
  "kind": "S 战技",
  "name": "炮射冲击",
  "sort": 4,
  "cost": 100,
  "delay": 150,
  "learn": 1,
  "power": 300,
  "stun": 140,
  "summary": "【物理攻击 S／直线L】STR↓／夺取奖励",
  "description": "用拉赛尔博士秘藏的帝国制火药式多管炮向敌人发动猛烈乱射。",
  "effects": [
   "伤害：威力 300%，物理（STR 对 DEF）",
   "STR 降低",
   "夺取对象的 AT 奖励"
  ]
 },
 {
  "id": 2701,
  "chara": 7,
  "kind": "战技",
  "name": "天魁拳",
  "sort": 1,
  "cost": 40,
  "delay": 120,
  "learn": 1,
  "power": 200,
  "stun": 140,
  "summary": "【物理攻击 B／地点·圆S】延迟中／背面特效",
  "description": "使出外门顶肘使敌人畏惧，再以拳击制敌的技能。",
  "effects": [
   "伤害：威力 200%，物理（STR 对 DEF），背面命中时攻击力 ×120%",
   "AT 延迟：延迟量 40（按对象 SPD 换算，至少越过后一位），机率 100%"
  ]
 },
 {
  "id": 2704,
  "chara": 7,
  "kind": "战技",
  "name": "龙闪脚",
  "sort": 2,
  "cost": 60,
  "delay": 130,
  "learn": 39,
  "power": 275,
  "stun": 180,
  "summary": "【物理攻击 A+／地点·圆M】晕眩·大",
  "description": "从巨大身躯流畅踢出的惊人多段踢击。",
  "effects": [
   "伤害：威力 275%，物理（STR 对 DEF）"
  ]
 },
 {
  "id": 2703,
  "chara": 7,
  "kind": "战技",
  "name": "龙神功",
  "sort": 3,
  "cost": 50,
  "delay": 60,
  "learn": 36,
  "power": null,
  "stun": 0,
  "summary": "【辅助／自身】4回合STR･DEF↑↑／解除减益",
  "description": "以泰斗流传承的内气功激发自身斗志。",
  "effects": [
   "解除异常状态",
   "解除能力降低",
   "STR 提升",
   "DEF 提升"
  ]
 },
 {
  "id": 2702,
  "chara": 7,
  "kind": "战技",
  "name": "养命功",
  "sort": 4,
  "cost": 40,
  "delay": 70,
  "learn": 1,
  "power": null,
  "stun": 0,
  "summary": "【回复／我方·单体】复活／回复HP35％／解除减益",
  "description": "按压提升生命力的神秘穴道，赐予生命的气息。",
  "effects": [
   "复活，并回复最大 HP 的 35%",
   "解除异常状态",
   "解除能力降低"
  ]
 },
 {
  "id": 2700,
  "chara": 7,
  "kind": "战技",
  "name": "挑衅",
  "sort": 5,
  "cost": 20,
  "delay": 45,
  "learn": 1,
  "power": null,
  "stun": 0,
  "summary": "【妨碍／扇形LL】DEF↓／自身仇恨值↑",
  "description": "以挑衅将敌人注意力集中到自身，同时削弱其防御。",
  "effects": [
   "DEF 降低"
  ]
 },
 {
  "id": 2705,
  "chara": 7,
  "kind": "S 战技",
  "name": "奥义·雷神掌",
  "sort": 6,
  "cost": 100,
  "delay": 150,
  "learn": 1,
  "power": 350,
  "stun": 200,
  "summary": "【物理攻击 SS／直线M】晕眩·极／封技60％／夺取奖励",
  "description": "释放双掌聚集的气劲，攻击眼前的敌人。",
  "effects": [
   "伤害：威力 350%，物理（STR 对 DEF）",
   "封技：机率 60%",
   "夺取对象的 AT 奖励"
  ]
 }
];
