import { NextRequest, NextResponse } from "next/server";
import { nlpFallback } from "@/lib/nlp-fallback";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { animal1Text, animal2Text, animal2Feeling } = body;

    if (!animal1Text || !animal2Text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      return NextResponse.json(nlpFallback(animal1Text, animal2Text, animal2Feeling || ""));
    }

    try {
      const prompt = `Analyze the following descriptions of two animals encountered in a forest. Return a JSON object with these fields:
- animal1Name: the name of the first animal
- animal1Category: one of "herbivore_gentle", "predator_solitary", "social", or "unknown"
- animal2Name: the name of the second animal
- animal2Category: one of "herbivore_gentle", "predator_solitary", "social", or "unknown"
- animal1Sentiment: one of "positive", "neutral", or "negative" (tone of the description)
- animal2Sentiment: one of "positive", "neutral", or "negative"

Animal 1 description: "${animal1Text}"
Animal 2 description: "${animal2Text}"
First feeling toward animal 2: "${animal2Feeling || "not specified"}"

Return ONLY valid JSON, no other text.`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 200,
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const match = content.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            return NextResponse.json(parsed);
          }
        }
      }
    } catch {
      // OpenAI failed — fall through to regex fallback
    }

    return NextResponse.json(nlpFallback(animal1Text, animal2Text, animal2Feeling || ""));
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
