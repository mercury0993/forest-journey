# AI 测评引擎 v2 — 设计文档

> 状态：已审批 | 2026-06-15

## 一、目标

将当前"规则分类 + 6 种硬编码模板"的测评引擎，升级为"DeepSeek 深度心理分析 + 81 种自有服务人格原型 + AI 动态生成个性化报告"的混合模式。

## 二、当前 vs 目标

| 维度 | 当前 (v1) | 目标 (v2) |
|---|---|---|
| AI 提供商 | OpenAI gpt-4o-mini | DeepSeek (chat 模型) |
| AI 用途 | 仅动物分类 (4 类 + 情感) | 全答案深度心理分析 |
| 模板数量 | 6 种硬编码全文 (~800字/种) | 81 种原型骨架 (~300字/种，含默认报告) |
| 报告文字 | 完全静态，不引用用户具体回答 | AI 动态生成（rules/encounter/prescription），archetype 由原型骨架 + AI 个性化点评合成 |
| 评分方式 | 纯规则 +- (最多 ±20) | 规则初评 + AI 校准，分歧超过 40 分则熔断 |
| 降级策略 | 关键词正则 | 关键词正则 (保留，零依赖)，降级时使用原型默认报告 |

## 三、核心架构决策

### 3.1 方案 A：AI 不生成原型名，只生成不绑定原型的个性化文字

**问题：** AI 在生成报告文字时不知道用户最终会被匹配到哪个原型。如果 AI 写成"独狼型"，而系统匹配到"白鹿型"，报告自相矛盾。

**解决：** DeepSeek 只负责三件事：
1. **NLP 深度分析** — 动物特征、情感色彩、关系动态
2. **四维校准分数** — 按档位（低/中/高）先定性，再在档内给具体分数
3. **三个不绑定原型的报告段落** — rules（规则与边界）、encounter（与他人相遇）、prescription（心灵处方）

`archetype`（服务者原型解读）由系统生成：
- 骨架：从匹配到的 81 种原型中取出 `defaultReport.archetype`（默认原型描述，~200 字）
- 点睛：嵌入 AI 输出的 1-2 句个性化点评（从 DeepSeek 的 `personalizedNote` 字段获取）

```
DeepSeek 输出                   系统合成
┌─────────────────┐           ┌──────────────────────────┐
│ NLP 深度分析     │           │ archetype = 原型默认描述  │
│ 四维校准分       │    +      │   + AI personalizedNote  │
│ rules 段落       │           │ rules = AI 生成          │
│ encounter 段落   │           │ encounter = AI 生成      │
│ prescription 段落│           │ prescription = AI 生成   │
│ personalizedNote │           │ roleTitle = 原型匹配     │
└─────────────────┘           └──────────────────────────┘
```

### 3.2 分歧熔断机制

当规则引擎初评分与 AI 校准分在**任一维度**上的差值超过 40 分时，触发熔断：
- 废弃 AI 校准值，完全使用规则引擎评分
- 降级使用原型的 `defaultReport` 全文（不嵌入 AI 生成内容）
- 记录日志以便后续排查

权重设为环境变量 `AI_CALIBRATION_WEIGHT`，默认 0.4，方便 A/B 测试。

## 四、服务人格四维模型 (自有框架)

每个维度 3 档（低 0-33 / 中 34-66 / 高 67-100），4 维全排列 = 81 种原型。

### 4.1 四个维度

| 维度 | 英文 | 低 | 中 | 高 |
|---|---|---|---|---|
| 共情力 | empathy | 理性独立，不易被情绪影响 | 有选择地共情，能收能放 | 深度感知他人情绪，天然共情者 |
| 秩序感 | rule | 灵活变通，规则为参考 | 尊重规则但保留弹性 | 依赖标准流程，边界清晰 |
| 应变力 | resilience | 面对压力易动摇 | 能应对常规困难 | 困境中稳定输出，越压越强 |
| 角色定位 | role | 专家顾问型，独立判断 | 协作平衡型 | 服务者型，团队导向 |

### 4.2 命名规则

原型名称 = `[角色形容词]·[动物隐喻]型服务者`

动物隐喻由角色定位 + 应变力 + 共情力组合决定，共 ~20 种动物覆盖 81 种组合。每个原型定义：
- `gridPosition`: 四维档位 (如 `"高共情·低秩序·高应变·高角色"`)
- `center`: 四维中心分数
- `roleTitle`: 完整称号
- `cardTitle`: 短称号
- `cardInterpretation`: 一句话标签
- `aiPromptGuide`: 告诉 DeepSeek 面向这类人应从哪些角度生成报告
- `defaultReport`: 降级时使用的完整四段报告文字

### 4.3 四维评分逻辑

```
用户答案 → 规则引擎初评 (calculateScores) → 四维初分
         → DeepSeek 深度分析 → 四维校准值 + 个性化报告文字 + personalizedNote
         → 分歧熔断检查（任一维度 |初分 - 校准| > 40 → 废弃校准）
         → 初分 × 0.6 + 校准值 × 0.4 → 最终四维分（权重可配置）
         → 四维分 → 三档化 → 81 格定位 → 匹配原型
         → 合成最终报告（原型骨架 + AI 个性化段落）
```

## 五、API 重构

### 5.1 `/api/report` (POST)

**输入：** 完整答案

```json
{
  "scene1": { "animalName": "...", "description": "...", "followUp1": "...", "followUp2": "..." },
  "scene2": { "tablecloth": "new|old|other", "stoolCount": 3 },
  "scene3": { "wallHeight": 75, "wallMaterial": 60, "crossingMethod": "climb" },
  "scene4": { "animalName": "...", "description": "...", "firstFeeling": "warm_joy" }
}
```

**输出：**

```json
{
  "data": {
    "nlp": {
      "animal1Name": "...",
      "animal1Category": "social",
      "animal2Name": "...",
      "animal2Category": "herbivore_gentle",
      "animal1Sentiment": "positive",
      "animal2Sentiment": "positive",
      "animal1Traits": ["灵动", "警觉", "温暖"],
      "animal2Traits": ["脆弱", "好奇"],
      "relationshipDynamic": "守护者与被守护者"
    },
    "scores": { "empathy": 78, "rule": 35, "resilience": 72, "role": 65 },
    "calibrationTrusted": true,
    "archetypeIndex": 42,
    "roleTitle": "静默守护者·白鹿型服务者",
    "cardTitle": "静默守护者",
    "cardInterpretation": "你在安静中感知一切，以柔韧的方式守护你认可的人和事。",
    "fullReport": {
      "archetype": "（原型默认描述 + AI personalizedNote 合成）",
      "rules": "（AI 生成 ~150字，不绑定原型）",
      "encounter": "（AI 生成 ~150字，不绑定原型）",
      "prescription": "（AI 生成 ~150字，不绑定原型）"
    }
  }
}
```

### 5.2 DeepSeek Prompt 设计

关键改进：**在 prompt 中解释每个场景的心理投射含义**，防止 AI 分析跑偏。

```
系统角色：你是一位资深心理投射测评分析师，专精于通过森林意象投射解读服务型人格。

## 场景隐喻解读指南
用户完成了4个森林场景的心理投射测评。每个场景对应一个心理维度：

- **场景一（遇到的第一个动物）**：映射**自我认知**。动物的种类、状态、眼神反映用户如何看待自己作为服务者。
- **场景二（小屋木桌）**：映射**规则与边界**。桌布新旧 = 对规则的态度（新=重视规则，旧=灵活务实），凳子数量 = 社交边界（少=倾向独立，多=团队导向）。
- **场景三（墙）**：映射**困难应对**。墙的高度 = 困难感知强度，墙的材质 = 困难性质（柔软=人际冲突，坚硬=制度障碍），跨越方式 = 应对策略。
- **场景四（遇到的第二个动物）**：映射**客户认知**。用户对第二个动物的描述和第一感觉，反映ta如何看待服务对象。

## 用户答案
[四个场景的完整结构化答案]

## 任务
1. **深度分析**：分析两只动物的心理投射含义，输出：
   - 动物名称、类别（herbivore_gentle/predator_solitary/social/unknown）
   - 3个性格特征词（中文）
   - 情感色彩（positive/neutral/negative）
   - 两只动物的关系动态（一句中文描述）

2. **四维校准**：先判断各维度的档位（低0-33/中34-66/高67-100），再在档位区间内给出具体分数。不要直接跳到一个精确数字，而是先定性再定量。

3. **个性化报告段落**（以下三部分不要提及任何具体的原型称号或动物名）：
   - **rules**（~150字）：关联用户的桌布和凳子选择，解读ta的规则与边界感
   - **encounter**（~150字）：解读两只动物的关系，映射ta与他人相遇的方式
   - **prescription**（~150字）：三条具体、可操作的心灵处方
   - **personalizedNote**（1-2句话，不超过80字）：从用户的具体描述中提炼的个性化点评，用于嵌入原型解读段落。格式："你在描述中提到[用户具体描述]，这反映了你[心理特质]"

## 输出格式
严格输出纯 JSON，不要 ```json 标记，不要任何解释文字。
{ ... }
```

## 六、模板系统重构

### 6.1 文件变更

| 文件 | 操作 |
|---|---|
| `lib/types.ts` | 新增 `ArchetypeDefinition`、`AIAnalysisResult` 类型；`NLPResult` 扩展字段 |
| `lib/templates.ts` | **完全重写** — 6 种硬编码 → 81 种原型骨架 + `defaultReport` + 索引函数 |
| `lib/mapping-engine.ts` | 新增 `applyAICalibration()` + 分歧熔断 + 档位化函数；保留 `calculateScores()` |
| `lib/nlp-fallback.ts` | 保留并增强关键词库，作为降级方案 |
| `app/api/report/route.ts` | **完全重写** — OpenAI → DeepSeek，完整分析 prompt + JSON 防御解析 |
| `app/(public)/result/page.tsx` | 适配新 API 返回格式，移除客户端 `matchTemplate` 调用 |

### 6.2 降级策略

三层降级：

1. **DeepSeek 正常** → 完整 AI 分析 + 原型骨架 + 个性化报告
2. **DeepSeek 超时/失败/解析失败/分歧熔断** → 规则引擎评分 + 关键词 NLP + 原型 `defaultReport` 全文（无个性化元素）
3. **无 API Key** → 同第 2 层（完全离线可用）

### 6.3 模板骨架结构

```typescript
interface ArchetypeDefinition {
  gridPosition: string;        // "高共情·低秩序·高应变·高角色"
  center: DimensionScores;     // { empathy: 83, rule: 17, resilience: 83, role: 83 }
  roleTitle: string;           // "静默守护者·白鹿型服务者"
  cardTitle: string;           // "静默守护者"
  cardInterpretation: string;  // 一句话标签
  aiPromptGuide: string;       // DeepSeek 生成报告时的方向指引
  defaultReport: {             // 降级时使用的完整报告
    archetype: string;         // ~200字
    rules: string;             // ~150字
    encounter: string;         // ~150字
    prescription: string;      // ~150字（3条）
  };
}
```

所有 81 个原型的 `defaultReport` 在实现时一次性手写完成，保证降级体验不崩塌。

## 七、健壮性设计

### 7.1 DeepSeek JSON 防御性解析

```typescript
function safeParseDeepSeekResponse(rawContent: string): AIAnalysisResult {
  // 1. 直接尝试解析
  try { return JSON.parse(rawContent); } catch {}
  
  // 2. 提取 ```json ... ``` 包裹的内容
  const mdMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (mdMatch) {
    try { return JSON.parse(mdMatch[1]); } catch {}
  }
  
  // 3. 提取第一个完整 {...} 对象
  const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch {}
  }
  
  throw new Error("DeepSeek response unparseable");
}
```

### 7.2 字段缺失容错

对解析成功的 JSON，检查必填字段是否存在。缺失字段用以下默认值填充：
- NLP 相关 → `"unknown"` 或空数组
- 四维校准分 → 对应维度的规则引擎初评分（等效于校准权重降为 0）
- 报告段落 → 从原型 `defaultReport` 中取出对应段落

## 八、性能与成本

| 指标 | 估算 |
|---|---|
| DeepSeek 响应时间 | 5-20 秒（生成 ~600 字中文） |
| 单次 API 成本 | ~0.002-0.005 元 |
| 月千次测评成本 | ~2-5 元 |
| 降级时响应时间 | <50ms（纯本地计算） |
| API 超时设置 | 20 秒 |

## 九、不影响的范围

- 4 场景测评交互流程 ✓ 不动
- 服务卡片 UI / 分享卡片 PNG ✓ 不动
- 完整报告展示组件 ✓ 不动（只改数据源）
- 雷达图 ✓ 不动
- 管理后台所有功能 ✓ 不动
- Prisma schema / 数据库 ✓ 不动
- Supabase Auth / 速率限制 ✓ 不动
- 存储层 (localStorage + 云端同步) ✓ 不动

## 十、实现顺序

1. `lib/types.ts` — 新增类型定义
2. `lib/templates.ts` — 81 种原型骨架 + `defaultReport` + 索引函数
3. `lib/mapping-engine.ts` — 新增 `applyAICalibration` + 分歧熔断 + 档位化函数
4. `lib/nlp-fallback.ts` — 增强关键词库
5. `app/api/report/route.ts` — DeepSeek 调用 + 新 prompt + JSON 防御解析
6. `app/(public)/result/page.tsx` — 适配新数据流
7. 端到端测试验证
