# 原创牌组、产品优化与统计发布

日期：2026-09-29。前置版本 `cc37af1a3af49af4094fd3d443ace8f05a19fd0c`。保留四种独立工具、Agent、手记和中英知识内容。

## 实现

- 78 张原创 AI 预生成牌面、牌背和缩略图；画廊、抽牌、Agent 与手记共用。详见 [素材说明与提示词](../art/README.md)。优化牌面共 15,625,878 字节，每张不超过 227,518 字节；缩略图独立按需加载。
- 中英图鉴可索引；首页具体解释工具与 Agent，明确入口、免费额度与数据选择；导航补齐紫微。
- 八字年/月交界修正历史夏令时与固定 UTC+8 节气的混用。旧版失败证据在 [修复前回归记录](deck-accuracy-regression-before.txt)。
- 第一方 Cloudflare D1 事件、独立服务端完成回执、管理汇总后台、测试流量隔离、关闭选项与保留期。详见 [统计设计](../analytics.md)。
- Agent 普通对话到最后一次模型调用但正常产出时记完成；只有确实缺报告或截断工具工作才记受限。避免正常结果被错算为未完成。

系统评估与来源见 [产品评估](../research/product-audit-2026-09-29.md)。

## 本地验证

- `npm run verify`：42 个 Astro 文件检查无错误/警告，69 个 HTML 页面构建，64 个可索引页面，3,193 个内部引用通过，79 张图与 78 张缩略图审计通过。[完整记录](deck-quality.txt)。初次全检 132 项测试；后续补充请求格式错误的真实 Worker → SQLite 回归，最终 [133 项测试](deck-tests-final.txt)、[类型检查](deck-check-final.txt) 与 lint 均通过。
- ESLint 通过。[记录](deck-lint.txt)。
- 实际 Wrangler + SQLite/D1 收集验证：客户端事件入库、UUID 去重、未知私密字段拒绝、伪造服务端事件拒绝、外域请求拒绝、管理鉴权、测试过滤、实际计算与会话覆盖。[本地回执](deck-analytics-local.json)。
- UI：桌面完整图鉴、圣杯筛选、点击放大、Escape 关闭和焦点返回；三牌抽取，实际正逆位旋转与稳定 ID；保存手记。
- 响应式：390 px 图鉴双列、轻触放大，320 px 抽牌无横向溢出；手机模拟为桌面 Chromium 响应式检查，不是真机 Safari 认证。
- 关闭统计后真实抽牌成功，网络中只有工具请求且头为 `X-Wenbu-Analytics: off`，D1 成功计算数量仍为关闭前的 1；重新开启恢复状态。[关闭后记录](deck-optout-local.json)。
- 管理界面使用真实本地数据登录成功，刷新后需再次输入密钥。密钥只在内存与请求头，未进入网址或浏览器存储。

## grok-cli 审查与修复

第一轮 [实际审查](deck-analytics-review.md) 指出的预览参数、大图预加载、示例统计、错误分类、CLI 关闭说明、空闲停止事件、取消状态覆盖、后台限流和有界重试均已处理。会话图明确表示覆盖，不推断严格顺序。牌组 `major` 数据实际存在，相关条件性担忧未复现。

后续 [实际复审](deck-analytics-final-review.md) 发现 Agent 最后调用误报受限，已修正并增加 3 项边界回归。最终 [聚焦审查](deck-completion-review.md) 返回 `No blocking defects found.`。两次早期 final review 尝试达到 max turns，没有产生结论；不计为通过。最终文本审查显式禁用工具，仅基于提供的源码快照，不冒充运行测试。

线上验证进一步发现：超大请求等 4xx 曾混入服务故障；已统一将 400 / 413 / 415 记为输入未通过，429 仍单列限流，5xx 保留为服务故障。最后的 [补充审查](deck-final-followup-review.md) 返回 `No blocking defects found.`。没有重写旧测试事件；后台默认排除这些 QA 流量。还为 Agent 和单次解读添加了图像可见性约束：模型没有收到原创插画图像，不得把传统图案或推测描述成亲眼看见的页面画面。

## 生产交付

生产 D1 `wenbu-analytics` 已创建，迁移已应用，管理密钥已通过 Worker secret 配置。[迁移记录](deck-analytics-migration.txt)。

- Cloudflare 最终版本 `fdae60be-b743-4aa5-b071-c055da57cfcd`，自定义域 `wenbu.genedai.me`；D1、独立限流和每日清理触发器实际部署成功。[部署记录](deck-deploy-final.txt)。
- 全部 64 个可索引页面、10 个公开资源/错误路径、四种计算 API、官方 MCP 客户端初始化/工具/资源调用通过。[生产 smoke](deck-live-smoke.json)。页面与资源在随后两次 Worker 修复中未改变。
- 全部 79 张正式图片在线返回 200，SHA-256 与仓库清单一致，缓存 1 天；管理页面 noindex。[资源验证](deck-assets-live.json)。
- 第一方事件实际进入生产 D1，重复 UUID 接收 0、私密自由字段/伪造成功事件 422、外域 403、未鉴权后台 401；默认排除测试；实际计算与会话覆盖成立。[生产统计验证](deck-analytics-live.json)。
- 最终版本再验证 400 / 413 / 415，独立测试活动下输入未通过 3、服务错误 0。[分类回执](deck-error-classification-live.json)。
- 浏览器在生产三次选牌得到真实三牌，新插画、正逆位与放大正常。默认后台为空；勾选测试后显示真实 QA 数据，没有填充演示数据。[在线抽牌](screenshots/deck-live-reading.png)、[后台](screenshots/deck-insights-live.png)。后台截图包含修复前的故意错误测试；以最后的分类回执判断修复。
- DeepSeek 实际执行两个合成测试回合，请求 `deepseek-v4-flash`，返回模型名 `deepseek-flash`。第一回合 2 次模型调用、1 次真实抽牌工具、1 份卡牌产物；第二回合 1 次模型调用，沿用牌并明确说明自己未收到图像。D1 有 2 个 `agent_finished / complete` 回执。[汇总回执](deck-d1-live-receipts.json)、[实际对话](deck-agent-live-transcript.txt)、[卡牌放大](screenshots/deck-agent-card-live.png)。
- 检查的浏览器会话没有控制台错误；所有已配置 secret 均未出现在源码、文档、公开资源或构建产物扫描中。

GitHub CI 状态在提交后核对。没有把部署成功等同于 SEO 收录、排名、增长或预测效果，也没有把本次 responsive 模拟当成跨浏览器/真机认证。
