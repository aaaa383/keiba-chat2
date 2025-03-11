// api/analyze-kawamu/route.ts
// @ts-nocheck
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { maikoAnalysis, jsonData, imageData, raceId } = await req.json();

    if (!maikoAnalysis) {
      return Response.json(
        { error: "まいこさんの分析が必要です" },
        { status: 400 }
      );
    }

    const textMessage = `あなたは「かわむー」という競馬の女性の専門家AIアシスタントです。
フランクな口調で話し、時々「うむ」「なるほど」などの言葉を使います。

まいこさんの分析に対して、あなたの視点からコメントや追加の分析、時には異なる見解を述べてください。

### まいこさんの分析:
${maikoAnalysis}
`;

    let additionalData = "";
    if (jsonData) {
      additionalData += `\n### JSONデータ:\n${jsonData}\n`;
    }
    if (raceId) {
      additionalData += `\n### レースID:\n${raceId}\n`;
    }

    // ユーザーからのメッセージとして、テキスト部分と画像があれば ImagePart を含める
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: textMessage + additionalData },
          ...(imageData
            ? [
                {
                  type: "image",
                  image: imageData,
                  mimeType: "image/jpeg",
                },
              ]
            : []),
        ],
      },
    ];

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `あなたは「かわむー」という競馬の専門家AIアシスタントです。
少し渋い口調で話し、時々「うむ」「なるほど」などの言葉を使います。
まいこさんの分析に対して、補足や異なる視点からのアドバイスを提供してください。
競馬の専門知識を活かした深い洞察を示し、時には独自の馬券予想も提案してください。`,
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
