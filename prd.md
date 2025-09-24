下面是一个可落地的、端到端的**详细设计方案与技术细节**。它与我给你的两份 Vercel 项目（`ghtrend-vercel` 主站流水线、`cn-publisher-vercel` 国内发布器）完全对齐，你可以直接据此实现/扩展。

---

# 目标与范围（MVP）

* 每天自动抓取 GitHub Trending（多语言/多栈）。
* 为**精选项目**生成中英文稿件和卡片图（SVG/PNG），并**自动分发**到：

  * 海外：Telegram、DEV.to、Medium
  * 国内：知乎、掘金、微信公众号（RPA 自动化）
* 全流程**可观测、可重试、可追溯**，支持**人工兜底**。

---

# 总体架构

```
+--------------------+           +---------------------+            +-------------------------+
|  Cron (Vercel)     |  fetch    |  Next.js App (API)  |  publish   |   Overseas Adapters     |
|  /api/cron/*       +----------->  ghtrend-vercel     +-----------> |  Telegram/Dev.to/Medium |
+---------+----------+           +----------+----------+            +-----------+-------------+
          |                                 |                                    |
          | generate                        | save assets to Blob / write PG     |
          v                                 v                                    |
+--------------------+           +---------------------+            +-----------v-------------+
|  OpenAI(可选)      |    SVG/PNG|  Satori + resvg     |   PUT      |  Vercel Blob (公开)     |
|  本地模板兜底      +----------->  生成卡片图          +----------->|  /cards/2025-09-24/...  |
+--------------------+           +---------------------+            +-------------------------+

                  国内分发（异步）
                                 webhook(签名)
+--------------------+           +---------------------+           +-------------------------+
|  cn-publisher-     | <---------+ /api/webhook/publish|          |   国内平台（RPA）       |
|  vercel (RPA)      + ----------> /api/publish/callback+--------->|  知乎/掘金/公众号       |
+--------------------+    回调   +---------------------+  结果回传 +-------------------------+

              持久化与观测
+--------------------+       +----------------+       +--------------------+
|   Neon/Postgres    | <---- |  Next.js API   | ----> |  Admin Dashboard   |
| repos/picks/...    |       |  q()/routes    |       | /admin 页面         |
+--------------------+       +----------------+       +--------------------+
```

---

# 组件划分

## 1) 主站流水线（`ghtrend-vercel`，Next.js App + API + Cron）

* **抓取**：`/api/cron/fetch` 解析 Trending 页面，调用 GitHub API 富化（topics、stars、desc）。
* **生成**：`/api/cron/generate` 用 OpenAI（若无 key 则模板兜底）产出中英标题/摘要/正文。
* **渲染/发布**：`/api/cron/render-publish` 用 Satori 产 SVG → resvg-wasm 产 PNG → 存 Vercel Blob → 调海外适配器发布 → 写 `publishes`。
* **Webhook**：`/api/webhook/publish` 接受“下发至国内 RPA”的任务；`/api/publish/callback` 接收 RPA 发布结果回调。
* **管理页**：`/admin` 快速查看最近 picks + 发布状态。

## 2) 国内发布器（`cn-publisher-vercel`，Vercel Functions + Puppeteer）

* **入口**：`/api/webhook/publish`（HMAC 验签）收到任务，拉起无头浏览器执行**发文流程**。
* **登录态**：通过**Cookie 注入**维持登录（存 Blob 或 ENV，冷启动注入到 `page.setCookie`）。
* **回调**：发布完成后向主站 `/api/publish/callback` 回传签名结果。

## 3) 数据与存储

* **Neon/Postgres**：核心业务表（`repos/picks/articles/publishes/metrics`）。
* **Vercel Blob**：卡片图（`/cards/YYYY-MM-DD/<owner-repo>.svg|png`），也可存 Cookie JSON。
* **Secrets**：Vercel Project 环境变量管理，按环境（Dev/Prod）隔离。

---

# 数据模型（Postgres）

```sql
create table repos (
  id text primary key,             -- owner/repo
  lang text,
  stars_total int default 0,
  stars_7d int default 0,          -- 可后续补采，用 stars delta 做排序参考
  topics jsonb default '[]'::jsonb,
  readme_excerpt text,
  homepage text,
  license text,
  owner_type text,
  created_at timestamptz default now()
);

create table picks (
  id text primary key,             -- repo_id@YYYY-MM-DD (去重：同一天同仓库只入一次)
  repo_id text not null references repos(id),
  score double precision not null, -- 打分理由见 score.ts
  reason text,
  date date not null
);

create table articles (
  id text primary key,             -- owner-repo-YYYY-MM-DD
  repo_id text not null references repos(id),
  title_cn text, title_en text,
  summary_cn text, summary_en text,
  body_cn_md text, body_en_md text,
  assets jsonb default '[]'::jsonb,  -- [svgUrl, pngUrl, ...]
  status text default 'draft',       -- draft/ready/published/failed
  created_at timestamptz default now()
);

create table publishes (
  id text primary key,
  article_id text not null references articles(id),
  platform text not null,           -- telegram/devto/medium/zhihu/juejin/wechat_mp
  post_url text,
  post_id text,
  status text default 'queued',     -- queued/sent/succeeded/failed
  retries int default 0,
  created_at timestamptz default now()
);

create table metrics (
  id bigserial primary key,
  publish_id text not null references publishes(id),
  views int default 0, likes int default 0, comments int default 0, shares int default 0,
  collected_at timestamptz default now()
);
```

**键/唯一性**：

* `picks.id = repo_id@date`，避免同日重复入选。
* `articles.id = repo-date`，保证“一仓库一天一篇”。
* `publishes` 对 `(article_id, platform)` 应在应用层做**幂等**（insert前先查，或使用 `on conflict do nothing`）。

---

# 关键流程与时序

## 1) 抓取 Trending → 富化 → 打分 → 建草稿

```
Cron /api/cron/fetch
  ├─ fetchTrending(lang: 'all'|'ts'|'py'...)  // 解析 HTML
  ├─ enrichRepo(full_name)                    // GitHub API
  ├─ scoreRepo(meta, position)                // 基于排序位次/Stars/Topic 的启发式打分
  ├─ INSERT repos / picks
  └─ INSERT articles(id=owner-repo-date, status='draft')
```

**鲁棒性**：

* Trending 页结构改变 → regex/selector 失败时：记录错误并回退到「只用 GitHub API 搜索/Stars 排序」模式（可另设 `fetchTrendingFallback`）。
* GitHub API 速率限制 → 配置 `GITHUB_TOKEN`，请求头加 `Authorization`，并做指数退避。

## 2) 稿件生成

```
Cron /api/cron/generate
  ├─ SELECT articles.status='draft' JOIN repos
  ├─ composeArticle():
  │   ├─ 有 OPENAI_API_KEY → 走 LLM（JSON schema 输出）
  │   └─ 无 → 模板兜底（可读性 OK）
  └─ UPDATE articles SET titles/summaries/bodies
```

**内容质量**：

* 双语输出（en/cn），控制长度（标题 60～90 char；摘要 120～160 char）。
* 关键词/标签来自 `topics`（最多 6 个）。
* 附上仓库链接、作者署名/License 提示（避免侵权误解）。

## 3) 卡片渲染与海外分发

```
Cron /api/cron/render-publish
  ├─ SELECT ready-to-publish articles
  ├─ renderCardSVG() using Satori (1200×630, Inter 字体)
  ├─ svgToPng() via resvg-wasm
  ├─ saveBlob('/cards/YYYY-MM-DD/repo.svg|png')
  ├─ publishDevto() / publishMedium() / publishTelegram()
  ├─ INSERT publishes (status='sent')，失败则 status='failed' + retries+1
  └─ UPDATE articles.status='published'
```

**格式/限制**（保守值）：

* Telegram：若发图 + caption，caption 建议 ≤ 900 字符（官方上限随版本变化，保守处理并加 `…`）。
* DEV.to：`description` ≤ \~160 字符；`tags` ≤ 4–5 个；`cover_image` 可用 SVG URL（必要时改 PNG）。
* Medium：HTML 内容为主（插图用 Blob 公网 URL）。

## 4) 国内分发（RPA）

### 触发

* 主站可在 `/api/cron/render-publish` 末尾**追加**一个对 `/api/webhook/publish` 的 POST（携带 article/payload），或在 Admin 面板提供“分发国内”按钮。

### 任务下发（Webhook 规范）

* 方法：`POST https://<cn-publisher-vercel>/api/webhook/publish`
* 头部：

  * `x-timestamp: <秒级时间戳>`
  * `x-signature: <hex(hmac_sha256(secret, ts + '.' + raw_body))>`
* 体（示例）：

```json
{
  "article": {
    "id": "owner-repo-2025-09-24",
    "title_cn": "xxx",
    "summary_cn": "xxx",
    "body_cn_md": "....",
    "assets": ["https://.../repo.svg", "https://.../repo.png"]
  },
  "platform": "zhihu",     // or juejin / wechat_mp
  "options": { "topics": ["AI","Rust"], "cover": "https://.../repo.png" }
}
```

### RPA 执行（Puppeteer）

* **登录态**：通过 `page.setCookie(...)` 注入 Cookie；Cookie JSON 建议存到 Blob 或 ENV（Base64）。
* **流程骨架**（以掘金为例）：

  1. `page.goto('https://juejin.cn/editor')`
  2. 等编辑器挂载，填标题/正文（将 Markdown 粘贴到编辑框）
  3. 选择标签（尽量使用 data-\* 或稳定的 aria 属性）
  4. 上传封面（若流程要求）
  5. 点发布/确认弹窗
  6. 等跳转，抓取文章 URL
* **人机风控**：

  * 控制节奏（`waitForTimeout`、`waitForSelector`），减少瞬时高频点击。
  * UA/时区/语言与常规浏览一致；必要时启用无痕 `context`。
  * 若遇 CAPTCHA：记录截图/DOM，返回 `status='failed'`，支持人工补发。

### 回调（Callback 规范）

* 方法：`POST https://<ghtrend-vercel>/api/publish/callback`
* 头部与签名同上，但用 `WEBHOOK_CALLBACK_SECRET`
* 体（示例）：

```json
{
  "article_id": "owner-repo-2025-09-24",
  "platform": "zhihu",
  "status": "succeeded",
  "post_url": "https://zhuanlan.zhihu.com/p/xxxxxx",
  "post_id": "xxxxxx"
}
```

---

# 适配器与接口契约

## 海外适配器（函数签名）

```ts
type PublishResult = { url: string; id: string }

publishTelegram(text: string, imageUrl?: string): Promise<PublishResult>
publishDevto(params: { title: string; markdown: string; tags?: string[]; description?: string; cover?: string }): Promise<PublishResult>
publishMedium(params: { title: string; html: string; tags?: string[] }): Promise<PublishResult>
```

## 国内适配器（RPA 路由）

```ts
type CnPayload = {
  article: {
    id: string
    title_cn: string
    summary_cn?: string
    body_cn_md: string
    assets?: string[]    // [svgUrl, pngUrl]
  }
  platform: 'zhihu' | 'juejin' | 'wechat_mp'
  options?: Record<string, any>
}
```

* 建议将国内三家实现拆为 `steps/zhihu.ts` / `steps/juejin.ts` / `steps/wechat.ts`，每个导出统一的 `run(page, payload)`。

---

# 打分与挑选策略（`score.ts`）

* **基础分**：`base = max(0, 60 - position)`（排名越靠前越高）
* **星级加权**：`stars = log10(stars_total) * 10`
* **话题加成**：

  * AI/LLM/Agent：+12
  * Rust/Go/TS：+6
  * Web/React/Next：+4
* 可扩展：近 7 日 Star 增量（`stars_7d`），License（MIT/Apache 优先），README 质量（字数/图片数）。

---

# 卡片模板（Satori + resvg）

* **尺寸**：1200×630（社媒通用分享卡）
* **字体**：Inter（在线拉取 woff2，或内置到 repo）
* **层级**：

  * 顶栏：日期 + repo 标识（github.com/owner/repo）
  * 标题：英文标题（回退中文）
  * 摘要：英文摘要（回退中文）
  * 徽章：Stars、7d Δ（可选）
  * 标签：topics（最多 6）
* **导出**：

  * SVG 保真留痕（用于 DEV.to/Medium）
  * PNG 兼容 Telegram/国内平台

---

# 调度与频率

* Vercel Cron（UTC）：

  * `0 13,16 * * *` → `/api/cron/fetch`
  * `5 13,16 * * *` → `/api/cron/generate`
  * `15 13,16 * * *` → `/api/cron/render-publish`
* 备注：可按目标受众时区微调（例如国内上午/晚间高峰）。

---

# 异常处理与重试

* **API/网络**：指数退避 `2^n * 500ms`，最多 5 次。
* **发布**：

  * 失败时写入 `publishes.status='failed'`、`retries+1`、`post_id/post_url=''`
  * 提供 `/api/admin/retry?publish_id=...`（可选路线）或手工脚本重试
  * 幂等：对同 `(article_id, platform)` 再次发布前先查 DB
* **RPA**：

  * 每一步加“断言 + 截图”留痕；遇到不可恢复异常，早返回 + 回调 `failed`
  * `CAPTCHA` 或风控提示：直接失败并携带 `reason` 字段（可在主站展示）

---

# 安全设计

* **Webhook HMAC**（主站→RPA、RPA→主站）：

  * `signature = HMAC_SHA256(secret, ts + '.' + raw_body)` → hex
  * **时效校验**：|now - ts| ≤ 300s
  * **常量时长比较**：`timingSafeEqual`
  * **重放防御**（增强）：如有必要，加入 `jti` 与 5 分钟内 nonce 去重表
* **Secrets**：放 Vercel Project ENV；不要 commit `.env`；在 Admin 页面不展示敏感信息。
* **权限**：Admin 页仅内部访问（简单做法：加 `BASIC_AUTH_USER/PASS` 或只在 Preview/Dev 环境启用）。
* **内容合规**：卡片底部固定加“Source: GitHub • Attribution to repo authors”；正文包含仓库链接与 License 信息。

---

# 可观测性与追踪

* **结构化日志**：每条任务带 `trace_id`（比如 `article_id`），贯穿抓取→生成→发布→回调。
* **错误聚合**：在 Vercel Logs 基础上，可接 Slack/Telegram Bot 报警（失败率超阈值、连续失败、Captcha 命中）。
* **管理页**：`/admin` 展示最近 N 条 picks、各平台发布状态与 URL；可加筛选（按日期/平台）。

---

# 本地开发与部署

## 主站 ghtrend-vercel

```bash
# 本地
npm i
# 初始化数据库（Neon/PG 跑 schema.sql）
psql $DATABASE_URL -f sql/schema.sql
# 配置 .env（见 .env.example）
npm run dev

# 部署
vercel deploy     # 或 Vercel 导入仓库自动构建
# Vercel 控制台 -> Cron Jobs 添加三条计划任务
```

## 国内发布器 cn-publisher-vercel

```bash
npm i
# 配置 .env（WEBHOOK_SECRET/CALLBACK_*）
vercel deploy

# 登录态（推荐 Cookie 注入）
# 方案：在本地 Chrome 登录后，通过扩展/脚本导出目标域 Cookie -> 存到 Blob/ENV
# 函数启动时读取并注入到 puppeteer 的 page.setCookie(...)
```

---

# 性能与容量预估（MVP）

* **抓取**：每天 2 次，每次 \~50 repos × 5 语言 ≈ 250 调用 + GitHub API 富化（250 次）。使用 token 后完全可控。
* **生成**：每天 100～200 篇以内（MVP 可只选 Top 50），OpenAI 成本可控；无 Key 时模板零成本。
* **渲染**：Satori + resvg-wasm 单图 < 200ms（冷启动除外）；Blob 写入简单。
* **发布**：

  * 海外 API：速率较宽松，串行即可。
  * RPA：Vercel Function 单次最长 15 分钟，单任务 1～3 分钟内，串行队列避免风控。

---

# 质量与风控策略

* **内容去重**：同一 repo 在短期内重复 trending，若标题/摘要变化小 → 只更新 metrics，不重复发文（或“动态更新”）。
* **长度控制**：标题/摘要/正文按平台限制裁剪，统一 `…` 收尾。
* **图片可用性**：优先 SVG（清晰），平台不支持时回退 PNG。
* **GitHub 反爬**：加 UA、限速，请求间隔 300–500ms，失败退避。

---

# 扩展路线（Roadmap）

* **更多平台**：Twitter/X、Reddit（海外）；小红书、哔哩哔哩（国内，仍需 RPA）。
* **选题增强**：加入 `stars_7d`/`issues_activity`/`commit_count`、Lang 权重，支持“主题专刊”（AI/前端/后端）。
* **评论与互动**：发布后自动在 Telegram 置顶；Medium/DEV.to 自动评论补充链接。
* **指标采集**：`/api/cron/fetch-metrics` 周期抓取各平台阅读/点赞/评论，写入 `metrics`。
* **人机协同**：Admin 提供“人工改稿后再发”的编辑流，稿件状态 `reviewing`。
* **多租户**：表加 `tenant_id`，可一套系统服务多个账号矩阵。

---

# 关键实现细节摘录

* **HMAC**（Node/Vercel 环境）：

  ```ts
  const expect = crypto.createHmac('sha256', secret)
    .update(`${ts}.${rawBody}`)
    .digest('hex')
  // 比对：Buffer + timingSafeEqual
  ```
* **Satori 字体加载**：避免每次网络拉取，生产可改为**内置 woff2**（打包小、稳定）。
* **resvg-wasm 初始化**：冷启动时加载 WASM；多图复用同实例。
* **Telegram**：图片消息优先 `sendPhoto`，文本消息回退 `sendMessage`（注意 caption 限制）。
* **DEV.to**：`cover_image` 支持公开 URL；`tags` 不超过 4–5；`published:true` 表示直接上架。
* **Medium**：先 `GET /v1/me` 获取 `userId` 再 `POST /users/:id/posts`。

---

# 验收清单（MVP Done）

* [ ] Neon/PG 表结构创建成功，能查/写。
* [ ] 三个 Cron 能按时触发，并在 Logs 可见。
* [ ] 生成文章（无 OpenAI 时走模板）正确入库。
* [ ] Blob 生成 SVG/PNG，public URL 可访问。
* [ ] Telegram/DEV.to/Medium 发布成功，`publishes` 写入 URL/ID。
* [ ] 调用 `/api/webhook/publish` → `cn-publisher-vercel` 接收并回调成功（即使目前只是“跑到页面”）。
* [ ] `/admin` 能看到当日 picks 与发布结果。
* [ ] 整条链路出现错误时，有日志与失败状态，且可重试。

---

