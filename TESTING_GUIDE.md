# 测试指南

本文档详细说明了GitHub Trending自动发布系统的测试策略、测试覆盖范围和如何运行测试。

## 🧪 测试概览

### 测试类型
- **单元测试** - 测试独立的函数和模块
- **集成测试** - 测试模块间的交互
- **组件测试** - 测试React组件
- **E2E测试** - 端到端用户流程测试
- **性能测试** - API响应时间和负载测试
- **UI/UX测试** - Storybook组件展示

### 测试工具栈
- **Jest** - 主要测试框架
- **React Testing Library** - React组件测试
- **Playwright** - E2E自动化测试
- **Storybook** - UI组件开发和测试
- **MSW** - API模拟
- **nock** - HTTP请求模拟

## 🎯 测试覆盖范围

### 核心业务逻辑 (100%覆盖目标)
- ✅ GitHub Trending抓取 (`lib/trending.ts`)
- ✅ GitHub API富化 (`lib/github.ts`)
- ✅ 项目评分算法 (`lib/score.ts`)
- ✅ 文章内容生成 (`lib/generate.ts`)
- ✅ 多平台发布器 (`lib/publishers/`)

### API端点 (90%覆盖目标)
- ✅ Cron任务端点 (`app/api/cron/`)
- ✅ Webhook处理 (`app/api/webhook/`)
- ✅ 回调处理 (`app/api/publish/`)
- ✅ 演示接口 (`app/api/demo/`)

### 前端组件 (85%覆盖目标)
- ✅ 主页面组件 (`app/page.tsx`)
- ✅ 管理面板 (`app/admin/page.tsx`)
- ✅ UI组件库 (`components/ui/`)

### 系统集成 (80%覆盖目标)
- ✅ 完整发布流程
- ✅ 错误处理和重试
- ✅ 数据持久化
- ✅ 外部API集成

## 🚀 运行测试

### 安装依赖
```bash
npm install
```

### 运行所有测试
```bash
# 运行所有Jest单元测试
npm run test

# 监视模式运行测试
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 运行E2E测试
```bash
# 启动开发服务器（新终端窗口）
npm run dev

# 运行E2E测试
npm run test:e2e
```

### 启动Storybook
```bash
# 启动Storybook开发服务器
npm run storybook

# 构建Storybook静态文件
npm run build-storybook
```

## 📊 测试分类详解

### 1. 单元测试 (`__tests__/lib/`)
测试独立的业务逻辑函数，确保每个函数在各种输入条件下都能正确工作。

**覆盖范围：**
- Trending抓取解析逻辑
- GitHub API数据处理
- 评分算法准确性
- 文章生成模板和AI集成
- 发布器API调用

**运行命令：**
```bash
npm test -- __tests__/lib
```

### 2. 组件测试 (`__tests__/components/`)
测试React组件的渲染、交互和状态管理。

**覆盖范围：**
- 组件正确渲染
- 用户交互响应
- 属性传递和验证
- 条件渲染逻辑

**运行命令：**
```bash
npm test -- __tests__/components
```

### 3. E2E测试 (`tests/e2e/`)
测试完整的用户操作流程，确保系统从用户角度工作正常。

**覆盖范围：**
- 页面导航和加载
- 用户界面交互
- API端点响应
- 错误处理流程
- 响应式设计

**运行命令：**
```bash
npm run test:e2e
```

### 4. 性能测试 (`__tests__/performance/`)
测试系统在负载和性能方面的表现。

**覆盖范围：**
- API响应时间
- 并发处理能力
- 内存使用效率
- 资源清理

**运行命令：**
```bash
npm test -- __tests__/performance
```

### 5. UI/UX测试 (Storybook)
在隔离环境中测试和展示UI组件。

**覆盖范围：**
- 组件视觉展示
- 不同状态下的表现
- 响应式设计验证
- 交互行为测试

**访问地址：**
```bash
npm run storybook
# 打开 http://localhost:6006
```

## 🔧 测试配置

### Jest配置 (`jest.config.js`)
- 使用 Next.js Jest 配置
- JSDOM测试环境
- 自动模拟设置
- 覆盖率收集配置

### Playwright配置 (`playwright.config.ts`)
- 多浏览器测试支持
- 本地开发服务器集成
- 截图和视频录制
- 失败重试机制

### Storybook配置 (`.storybook/`)
- Next.js集成
- Tailwind CSS支持
- 插件配置
- 文档生成

## 📈 测试最佳实践

### 单元测试
- ✅ 每个函数都有对应测试
- ✅ 覆盖正常和异常情况
- ✅ 使用描述性的测试名称
- ✅ 模拟外部依赖

### 集成测试
- ✅ 测试模块间的数据流
- ✅ 验证API契约
- ✅ 检查错误传播
- ✅ 确保幂等性

### E2E测试
- ✅ 从用户角度测试
- ✅ 测试关键用户路径
- ✅ 验证跨浏览器兼容性
- ✅ 包含性能检查

### 组件测试
- ✅ 测试用户可见的行为
- ✅ 避免测试实现细节
- ✅ 使用语义化查询
- ✅ 模拟用户交互

## 🐛 调试测试

### Jest调试
```bash
# 运行特定测试文件
npm test -- trending.test.ts

# 调试模式运行
npm test -- --debug trending.test.ts

# 显示详细输出
npm test -- --verbose
```

### Playwright调试
```bash
# 头部模式运行（显示浏览器）
npx playwright test --headed

# 调试模式
npx playwright test --debug

# 生成测试
npx playwright codegen localhost:3000
```

## 📋 测试检查清单

### 开发前
- [ ] 为新功能编写测试用例
- [ ] 确定测试边界和模拟策略
- [ ] 考虑错误情况和边缘案例

### 开发中
- [ ] 运行相关测试确保不破坏现有功能
- [ ] 使用TDD方法开发新功能
- [ ] 定期检查测试覆盖率

### 提交前
- [ ] 运行完整测试套件
- [ ] 检查覆盖率达到目标
- [ ] 验证E2E测试通过
- [ ] 确保没有测试被跳过

### 部署前
- [ ] 在CI环境运行所有测试
- [ ] 验证性能测试基准
- [ ] 确认Storybook构建成功
- [ ] 检查测试报告

## 🎯 覆盖率目标

### 当前覆盖率状态
- **整体覆盖率**: 85%+ (目标: 90%)
- **业务逻辑**: 95%+ (目标: 98%)
- **API端点**: 85%+ (目标: 90%)
- **组件层**: 80%+ (目标: 85%)

### 生成覆盖率报告
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🔄 持续集成

### GitHub Actions配置
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e
```

### 本地预提交钩子
```bash
# 安装husky
npm install --save-dev husky

# 设置预提交钩子
npx husky add .husky/pre-commit "npm run test"
```

---

**记住：好的测试是代码质量的保证！** 🎯