# GitHub Trending Auto-Publisher

一个自动化的GitHub热门项目发布系统，每日抓取GitHub Trending，生成中英文内容并自动分发到多个平台。

## 🚀 功能特性

- **自动抓取**: 每日定时抓取GitHub Trending项目（支持多种编程语言）
- **智能评分**: 基于项目排名、Star数量、热门话题的综合评分算法
- **AI生成内容**: 支持OpenAI生成高质量中英文文章，无API Key时使用模板兜底
- **卡片渲染**: 使用Satori自动生成1200x630的分享卡片（SVG/PNG）
- **多平台发布**: 
  - 海外: Telegram、DEV.to、Medium
  - 国内: 通过RPA发布到知乎、掘金、微信公众号
- **完整观测**: Web管理面板查看抓取、生成、发布状态
- **容错重试**: 全流程异常处理和重试机制

## 📋 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub API    │───▶│   Main App      │───▶│  海外平台发布    │
│   Trending页面  │    │  ghtrend-vercel │    │ Telegram/DEV/Medium │
└─────────────────┘    └─────────┬───────┘    └─────────────────┘
                                 │
                                 │ webhook
                                 ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  国内发布器     │───▶│   国内平台      │
                       │ cn-publisher    │    │ 知乎/掘金/公众号 │
                       └─────────────────┘    └─────────────────┘
```

## 🛠️ 技术栈

- **框架**: Next.js 14 + App Router
- **数据库**: PostgreSQL (推荐 Neon)
- **存储**: Vercel Blob (图片存储)
- **渲染**: Satori + resvg-wasm
- **AI**: OpenAI GPT-4o-mini (可选)
- **部署**: Vercel + Cron Jobs

## 📦 快速开始

### 1. 环境准备

```bash
git clone <your-repo>
cd ghtrend-vercel
npm install
```

### 2. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 配置必需的环境变量：

```bash
# 必需配置
DATABASE_URL=postgresql://...  # PostgreSQL数据库连接
BLOB_READ_WRITE_TOKEN=...      # Vercel Blob存储token

# 推荐配置  
GITHUB_TOKEN=ghp_...           # GitHub API token (避免限流)
OPENAI_API_KEY=sk-...          # OpenAI API key (高质量内容生成)

# 发布平台配置 (至少配置一个)
TELEGRAM_BOT_TOKEN=...         # Telegram机器人token
TELEGRAM_CHAT_ID=...           # Telegram频道ID
DEVTO_API_KEY=...              # DEV.to API key
MEDIUM_TOKEN=...               # Medium集成token
```

### 3. 初始化数据库

```bash
# 连接到你的PostgreSQL数据库并执行
psql $DATABASE_URL -f sql/schema.sql
```

### 4. 本地开发

```bash
npm run dev
```

访问 http://localhost:3000 查看主页面
访问 http://localhost:3000/admin 查看管理面板

### 5. 部署到Vercel

1. 推送代码到GitHub
2. 在Vercel导入项目
3. 在Vercel项目设置中配置环境变量
4. Vercel会自动配置Cron Jobs（基于vercel.json）

## 🔧 配置详解

### GitHub Token配置

1. 访问 https://github.com/settings/tokens
2. 创建 Personal Access Token
3. 权限只需要 `public_repo` 即可
4. 将token配置到 `GITHUB_TOKEN`

### Telegram配置

1. 与 @BotFather 对话创建机器人，获取 `TELEGRAM_BOT_TOKEN`
2. 创建频道/群组，获取 `TELEGRAM_CHAT_ID`
   - 可以使用 @userinfobot 获取ID
   - 或者发送消息后通过API获取

### DEV.to配置

1. 访问 https://dev.to/settings/extensions
2. 创建API Key
3. 配置到 `DEVTO_API_KEY`

### Medium配置

1. 访问 https://medium.com/me/settings
2. 创建Integration Token
3. 配置到 `MEDIUM_TOKEN`

## 📊 使用流程

### 自动化流程

系统会按照以下Cron计划自动运行：

- `0 13,16 * * *` - 抓取GitHub Trending
- `5 13,16 * * *` - 生成文章内容  
- `15 13,16 * * *` - 渲染卡片并发布

### 手动触发

在管理面板 `/admin` 可以手动触发各个步骤：

1. **🔄 手动抓取** - 触发trending抓取和项目评分
2. **✍️ 生成文章** - 为草稿状态的项目生成内容
3. **🚀 渲染发布** - 渲染卡片并发布到各平台

### API接口

- `GET /api/cron/fetch` - 抓取trending项目
- `GET /api/cron/generate` - 生成文章内容
- `GET /api/cron/render-publish` - 渲染并发布
- `POST /api/demo/publish` - 测试发布功能
- `POST /api/webhook/publish` - 接收国内发布任务
- `POST /api/publish/callback` - 接收发布结果回调

## 🎯 项目评分算法

系统使用综合评分算法选择优质项目：

```typescript
score = base_score + stars_bonus + topic_bonus

// 基础分：基于trending排名
base_score = max(0, 60 - position)

// 星标加分：基于项目受欢迎程度  
stars_bonus = log10(stars_total) * 10

// 话题加分：热门技术话题
topic_bonus = {
  AI/ML/LLM/Agent: +12,
  Rust/Go/TypeScript: +6, 
  Web/React/Next.js: +4
}
```

## 🔗 国内平台发布

通过独立的RPA服务 `cn-publisher-vercel` 实现国内平台发布：

1. 主站通过webhook向RPA服务发送发布任务
2. RPA服务使用Puppeteer自动化发布到知乎、掘金等
3. 发布完成后回调通知主站更新状态

详细配置参考 [国内发布器文档](https://github.com/your-org/cn-publisher-vercel)

## 📋 数据库表结构

- `repos` - GitHub仓库基本信息
- `picks` - 每日精选项目记录  
- `articles` - 生成的文章内容
- `publishes` - 发布记录和状态
- `metrics` - 发布效果数据（预留）

## 🛡️ 安全考虑

- Webhook使用HMAC-SHA256签名验证
- 时间戳防重放攻击（300秒窗口）
- 敏感信息通过环境变量管理
- 管理面板可选Basic Auth保护

## 🚀 扩展功能

### 计划中的功能

- [ ] 更多平台支持（Twitter/X、Reddit等）
- [ ] 发布效果数据采集和分析
- [ ] 用户自定义发布模板
- [ ] 多语言内容生成
- [ ] 项目筛选规则配置
- [ ] 发布时间策略优化

### 贡献指南

欢迎提交Issue和Pull Request！

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交变更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 支持

如有问题，请：

1. 查看 [常见问题](docs/FAQ.md)
2. 搜索现有 [Issues](https://github.com/your-org/ghtrend-vercel/issues)
3. 创建新Issue描述问题

---

**Made with ❤️ for the open source community**