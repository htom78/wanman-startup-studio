# Wanman Startup Studio

一个面向 AI-native founder 的阶段门控创业操作系统。它可以接入 wanman 做多智能体协作，但稳定主线是可重复的本地文件流程：输入创业想法，先完成 Idea Stage 的证据链，再决定是否进入 MVP Gate。

## 产品定位

目标不是“AI 自动创业”，而是让 founder 用一组受控 agent 完成：

- Idea Stage：问题假设、客户发现、竞品威胁、反证、解决方案概念、是否允许进入 MVP。
- MVP Gate：MVP 范围、架构简报、度量框架、安全检查、是否开始构建。
- Launch / Scale：先作为 stage-gate 模板沉淀，后续再扩展自动化。

核心原则：证据先于构建，founder 负责判断和编排，agent 负责研究、反驳、结构化和执行。

## 核心目录

- `inputs/`：创业项目输入 JSON。
- `scripts/new-startup-run.mjs`：创建一次 startup run。
- `scripts/validate-stage.mjs`：校验 Idea 或 MVP Gate 是否完整。
- `scripts/promote-stage.mjs`：Idea Gate 通过后生成 MVP Gate 工作区。
- `system/roles/`：多智能体角色工作包。
- `system/stage-gates/`：阶段门控标准。
- `modules/`：可选阶段模块，例如 `idea/product-research`。
- `runs/`：每次 startup run 的独立目录。
- `docs/playbook-mapping.md`：Founder Playbook 到系统设计的映射。

## 快速开始

```bash
cd /Volumes/PortableSSD/Projects/Codex_Projects/wanman-startup-studio
node scripts/new-startup-run.mjs inputs/startup-brief.example.json
```

完成 `runs/<run-id>/TASKS.md` 中的 Idea Stage 文件后，先验收：

```bash
node scripts/validate-stage.mjs runs/<run-id> idea
```

如果 `output/idea/gate-decision.md` 写明 `Decision: ALLOW_MVP`，再进入 MVP Gate：

```bash
node scripts/promote-stage.mjs runs/<run-id>
node scripts/validate-stage.mjs runs/<run-id> mvp
```

完整 demo 验收：

```bash
npm test
```

挂载产品研究模块：

```bash
node scripts/add-product-research-module.mjs runs/<run-id>
node scripts/validate-stage.mjs runs/<run-id> product-research
```

## 阶段门控

Idea Gate 只有三个合法结论：

- `Decision: ALLOW_MVP`：证据足够，允许进入 MVP Gate。
- `Decision: PIVOT`：问题真实但方向需要调整。
- `Decision: BLOCK`：证据不足，不允许构建。

MVP Gate 只有三个合法结论：

- `Decision: BUILD`：MVP 范围、架构、指标和安全检查已到位。
- `Decision: REVISE`：需要补齐范围、技术或指标。
- `Decision: STOP`：不应继续构建。

## 可选 Wanman 自动化

`AGENT.md` 和 `agents.json` 提供 wanman sharedWorkspace 的协作约束。实际使用时仍以 `scripts/` 的稳定流程为验收标准；wanman 只是可选执行层。
