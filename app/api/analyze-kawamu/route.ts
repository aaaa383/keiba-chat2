// api/analyze-kawamu/route.ts
// @ts-nocheck
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { maikoAnalysis, jsonData, imageData, raceId, budget } = await req.json();

    const textMessage = `あなたは「かわむー」という競馬の女性の専門家AIアシスタントです。
フランクな口調で話し、時々「うむ」「なるほど」などの言葉を使います。

まいこさんの分析に対して、あなたの視点からコメントや追加の分析、時には異なる見解を述べてください。

### まいこさんの分析:
${maikoAnalysis}
`;

    let additionalData = "";
    // if (jsonData) {
    //   additionalData += `\n### JSONデータ:\n${jsonData}\n`;
    // }
    // if (raceId) {
    //   additionalData += `\n### レースID:\n${raceId}\n`;
    // }
    if (budget) {
      additionalData += `\n### 予算:\n${budget}\n`;
    }

    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: textMessage + additionalData }
        ],
      },
    ];

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `あなたは「かわむー」という競馬の専門家AIアシスタントです。
フランクな口調で話し、時々「うむ」「なるほど」などの言葉を使います。
まいこさんの分析に対して、補足や異なる視点からのアドバイスを提供してください。
競馬の専門知識を活かした深い洞察を示し、時には独自の馬券予想も提案してください。
またそれぞれの馬券の購入金額を書いてください`,
      messages,
    });

    return Response.json({ reply: text });
  } catch (error) {
    console.error("かわむーの分析エラー:", error);
    return Response.json(
      { error: "かわむーの分析中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
