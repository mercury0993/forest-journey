import { NextRequest, NextResponse } from "next/server";
import { nlpFallback } from "@/lib/nlp-fallback";
import { rateLimit } from "@/lib/rate-limit";
import { calculateScores, applyAICalibration } from "@/lib/mapping-engine";
import { findArchetype } from "@/lib/templates";
import { AIAnalysisResult, AnimalCategory, AssessmentAnswers } from "@/lib/types";

const DEEPSEEK_BASE = "https://api.deepseek.com/v1";
const TIMEOUT_MS = 20000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeParseJSON(raw: string): Record<string, any> | null {
  // 1. 直接解析
  try { return JSON.parse(raw); } catch { /* continue */ }

  // 2. 提取 ```json ... ``` 包裹的内容
  const mdMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (mdMatch) {
    try { return JSON.parse(mdMatch[1]); } catch { /* continue */ }
  }

  // 3. 提取第一个完整 {...} 对象
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[0]); } catch { /* continue */ }
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateAIFields(parsed: Record<string, any>): AIAnalysisResult | null {
  try {
    const nlp = parsed.nlp as Record<string, unknown> | undefined;
    const cal = parsed.calibrationScores as Record<string, number> | undefined;

    if (!nlp || !cal || !parsed.rules || !parsed.encounter || !parsed.prescription || !parsed.personalizedNote) {
      return null;
    }

    const validCategories = new Set<string>(["herbivore_gentle", "predator_solitary", "social", "unknown"]);
    const validSentiments = new Set<string>(["positive", "neutral", "negative"]);

    const cat1 = (nlp.animal1Category as string) || "unknown";
    const cat2 = (nlp.animal2Category as string) || "unknown";
    const sent1 = (nlp.animal1Sentiment as string) || "neutral";
    const sent2 = (nlp.animal2Sentiment as string) || "neutral";

    return {
      nlp: {
        animal1Name: (nlp.animal1Name as string) || "unknown",
        animal1Category: (validCategories.has(cat1) ? cat1 : "unknown") as AnimalCategory,
        animal2Name: (nlp.animal2Name as string) || "unknown",
        animal2Category: (validCategories.has(cat2) ? cat2 : "unknown") as AnimalCategory,
        animal1Sentiment: (validSentiments.has(sent1) ? sent1 : "neutral") as "positive" | "neutral" | "negative",
        animal2Sentiment: (validSentiments.has(sent2) ? sent2 : "neutral") as "positive" | "neutral" | "negative",
        animal1Traits: Array.isArray(nlp.animal1Traits) ? nlp.animal1Traits as string[] : [],
        animal2Traits: Array.isArray(nlp.animal2Traits) ? nlp.animal2Traits as string[] : [],
        relationshipDynamic: (nlp.relationshipDynamic as string) || "独特的关系",
      },
      calibrationScores: {
        empathy: typeof cal.empathy === "number" ? cal.empathy : 50,
        rule: typeof cal.rule === "number" ? cal.rule : 50,
        resilience: typeof cal.resilience === "number" ? cal.resilience : 50,
        role: typeof cal.role === "number" ? cal.role : 50,
      },
      rules: parsed.rules as string,
      encounter: parsed.encounter as string,
      prescription: parsed.prescription as string,
      personalizedNote: parsed.personalizedNote as string,
    };
  } catch {
    return null;
  }
}

function buildPrompt(answers: AssessmentAnswers): string {
  return `你是一位资深心理投射测评分析师，专精于通过森林意象投射解读服务型人格。

## 场景隐喻解读指南
用户完成了4个森林场景的心理投射测评。每个场景对应一个心理维度：

- **场景一（遇到的第一个动物）**：映射**自我认知**。动物的种类、状态、眼神反映用户如何看待自己作为服务者。
- **场景二（小屋木桌）**：映射**规则与边界**。桌布新旧=对规则的态度（新=重视规则和标准，旧=灵活务实随性），凳子数量=社交边界（少=倾向独立工作，多=团队导向）。
- **场景三（墙）**：映射**困难应对**。墙的高度=困难感知强度，墙的材质=困难性质（柔软=人际情绪类困难，坚硬=制度结构类障碍），跨越方式=应对策略（翻越=直面，绕路=变通，找门=寻求外部帮助）。
- **场景四（遇到的第二个动物）**：映射**客户/服务对象认知**。用户对第二个动物的描述和第一感觉，反映ta如何看待服务对象。

## 用户答案

**场景一（自我认知）：**
- 动物：${answers.scene1.animalName}
- 描述：${answers.scene1.description}
- 它在做什么、眼神如何：${answers.scene1.followUp1}
- 它看到你了吗、有交流吗：${answers.scene1.followUp2 || "未回答"}

**场景二（规则与边界）：**
- 桌布选择：${answers.scene2.tablecloth}${answers.scene2.tableclothOther ? "（" + answers.scene2.tableclothOther + "）" : ""}
- 凳子数量：${answers.scene2.stoolCount}

**场景三（困难应对）：**
- 墙的高度（0柔软低矮-100高耸入云）：${answers.scene3.wallHeight}
- 墙的材质（0柔软灌木-100坚硬石砖）：${answers.scene3.wallMaterial}
- 如何过去：${answers.scene3.crossingMethod === "easy" ? "轻松翻越" : answers.scene3.crossingMethod === "climb" ? "费点劲爬过去" : answers.scene3.crossingMethod === "detour" ? "绕路走" : answers.scene3.crossingMethod === "door" ? "找找有没有门" : answers.scene3.crossingOther || answers.scene3.crossingMethod}

**场景四（客户认知）：**
- 动物：${answers.scene4.animalName}
- 描述：${answers.scene4.description}
- 它在做什么、眼神如何：${answers.scene4.followUp1}
- 它看到你了吗、有交流吗：${answers.scene4.followUp2 || "未回答"}
- 第一感觉：${answers.scene4.firstFeeling === "warm_joy" ? "温暖喜悦" : answers.scene4.firstFeeling === "care" ? "想去呵护" : answers.scene4.firstFeeling === "equal_respect" ? "平等尊重" : answers.scene4.firstFeeling === "nervous" ? "有些紧张" : "好奇观察"}

## 任务

1. **深度分析**（nlp字段）：分析两只动物的心理投射含义：
   - animal1Name / animal2Name：动物名称（中文）
   - animal1Category / animal2Category：类别，必须是 "herbivore_gentle"、"predator_solitary"、"social"、"unknown" 之一
   - animal1Sentiment / animal2Sentiment：情感色彩，"positive"、"neutral"、"negative" 之一
   - animal1Traits / animal2Traits：3个性格特征词（中文），如["灵动","警觉","温暖"]
   - relationshipDynamic：两只动物关系的动态描述（一句中文）

2. **四维校准**（calibrationScores字段）：先判断各维度的档位（低0-33/中34-66/高67-100），再在档位区间内给出具体分数。各维度：
   - empathy（共情力）：低=理性独立/中=收放自如/高=深度共情
   - rule（秩序感）：低=灵活变通/中=弹性务实/高=秩序井然
   - resilience（应变力）：低=柔韧生长/中=稳中求进/高=坚如磐石
   - role（角色定位）：低=专家顾问型/中=协作平衡型/高=服务者型

3. **个性化报告段落**（以下部分不要提及任何具体的动物原型称号）：
   - **rules**（约150字）：结合用户的桌布选择和凳子数量，解读ta的规则与边界感。引用用户的实际选择。
   - **encounter**（约150字）：解读两只动物的关系，映射ta与他人相遇的方式。引用用户对动物的具体描述。
   - **prescription**（约150字）：三条具体、可操作的心灵处方，编号1. 2. 3.，每条约50字。
   - **personalizedNote**（1-2句，不超过80字）：从用户的具体描述中提炼个性化点评。格式："你在描述中提到[用户具体描述]，这反映了你[心理特质]。"

## 输出格式
严格输出纯 JSON，不要 \`\`\`json 标记，不要任何解释文字。输出以下结构：

{"nlp":{"animal1Name":"...","animal1Category":"...","animal2Name":"...","animal2Category":"...","animal1Sentiment":"...","animal2Sentiment":"...","animal1Traits":["...","...","..."],"animal2Traits":["...","...","..."],"relationshipDynamic":"..."},"calibrationScores":{"empathy":0,"rule":0,"resilience":0,"role":0},"rules":"...","encounter":"...","prescription":"...","personalizedNote":"..."}`;
}

export async function POST(request: NextRequest) {
  try {
    // --- 安全校验 ---
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 16384) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!rateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json();
    const answers = body as AssessmentAnswers;

    if (!answers.scene1?.animalName || !answers.scene4?.animalName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // --- 规则引擎初评 ---
    const animal1Text = `${answers.scene1.animalName} ${answers.scene1.description} ${answers.scene1.followUp1}`;
    const animal2Text = `${answers.scene4.animalName} ${answers.scene4.description}`;
    const animal2Feeling = answers.scene4.firstFeeling || "";

    const fallbackResult = nlpFallback(animal1Text, animal2Text, animal2Feeling);
    const ruleScores = calculateScores(answers, {
      animal1Name: fallbackResult.animal1Name,
      animal1Category: fallbackResult.animal1Category,
      animal2Name: fallbackResult.animal2Name,
      animal2Category: fallbackResult.animal2Category,
      animal1Sentiment: fallbackResult.animal1Sentiment,
      animal2Sentiment: fallbackResult.animal2Sentiment,
    });

    // --- DeepSeek API 调用 ---
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    let aiResult: AIAnalysisResult | null = null;

    if (deepseekKey) {
      try {
        const response = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${deepseekKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: buildPrompt(answers) }],
            temperature: 0.5,
            max_tokens: 2000,
          }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = safeParseJSON(content);
            if (parsed) {
              aiResult = validateAIFields(parsed);
            }
          }
        }
      } catch {
        // DeepSeek failed — fall through to fallback
        console.warn("[report] DeepSeek API call failed, using fallback");
      }
    }

    // --- 校准与原型匹配 ---
    const calibration = applyAICalibration(ruleScores, aiResult?.calibrationScores ?? null);
    const archetype = findArchetype(calibration.finalScores);

    // --- 合成报告 ---
    const fullReport = {
      archetype: calibration.calibrationTrusted && aiResult
        ? archetype.defaultReport.archetype + "\n\n" + aiResult.personalizedNote
        : archetype.defaultReport.archetype,
      rules: aiResult?.rules || archetype.defaultReport.rules,
      encounter: aiResult?.encounter || archetype.defaultReport.encounter,
      prescription: aiResult?.prescription || archetype.defaultReport.prescription,
    };

    return NextResponse.json({
      data: {
        nlp: aiResult?.nlp || fallbackResult,
        scores: calibration.finalScores,
        calibrationTrusted: calibration.calibrationTrusted,
        archetypeIndex: calibration.archetypeIndex,
        roleTitle: archetype.roleTitle,
        cardTitle: archetype.cardTitle,
        cardInterpretation: archetype.cardInterpretation,
        fullReport,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
