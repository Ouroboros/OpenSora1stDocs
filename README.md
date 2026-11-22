# OpenSora1st 说明书

面向玩家的《空之轨迹 the 1st》游戏系统说明书，讲解战斗等系统实际的运作规则。内容依据 OpenSora1st 还原工程的源码与游戏数据表整理。

在线阅读：<https://ouroboros.github.io/OpenSora1stDocs/>

## 目前收录

- **AT BAR**：AT 的初始化、时间流动、行动后的计算、延迟修正、AT 延迟与提前、插队，以及 AT 奖励的种类、出现机率、升级与夺取。
- **战技**：8 名角色全部战技与 S 战技的游戏内说明、消耗、延迟、威力、晕眩倍率、习得等级与效果明细。

## 操作

| 按键 | 作用 |
| --- | --- |
| Q／E | 切换顶部章节 |
| W／S | 切换左侧小节 |

每个小节都有独立的地址，例如 `#/at-bar/formula/after`，可以直接分享。

## 本地阅读

直接用浏览器打开 `index.html` 即可，不需要服务器或构建步骤。

## 目录结构

```
index.html          入口；在这里登记所有子页
assets/manual.css   版面样式（按 1920×1080 设计，等比缩放）
assets/manual.js    路由、标签与目录
assets/pointer.svg  目录指针
pages/*.js          各个子页的内容
pages/crafts-data.js  战技数据（由游戏数据表生成）
```

## 新增子页

1. 在 `pages/` 下新建脚本，调用 `Manual.register({ id, group, title, summary, chapters })`。
   `chapters` 中每个章节有 `id`、`label`（英文小标题）、`tab`（中文标签）与 `topics`；
   每个小节有 `id`、`title`、`html`，需要交互时提供 `mount(body)`。
2. 在 `index.html` 中加入对应的 `<script src="pages/….js"></script>`。
