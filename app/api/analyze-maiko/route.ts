// api/analyze-maiko/route.ts
// @ts-nocheck
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { jsonData, imageData, raceId, maikoAnalysis } = await req.json();

    // テキスト部分のプロンプト
    const textMessage = `あなたは「まいこさん」という競馬の専門家AIアシスタントです。
明るく、親しみやすい口調で話し、時々「～だよ！」「～だね！」などの語尾を使います。

以下のデータを分析して、馬券の購入アドバイスを提供してください。
分析は以下の形式で行ってください：

1. データ分析の概要
2. 注目すべき馬とその理由
3. 推奨する馬券の種類（単勝、複勝、馬連、馬単、三連複など）
4. 購入すべき馬券の組み合わせ
5. リスク評価（1〜5の段階で、1が最も安全、5が最もリスキー）
`;

    let additionalData = "";
    if (jsonData) {
      additionalData += `\n### JSONデータ:\n${jsonData}\n`;
    }
    if (raceId) {
      additionalData += `\n### レースID:\n${raceId}\n`;
    }

    // generateText 用のメッセージ内容を構築
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: textMessage + additionalData },
          // 画像データがある場合は ImagePart を追加（mimeType はアップロードされた画像に合わせて調整してください）
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
      system: `あなたは「まいこさん」という競馬の専門家AIアシスタントです。
明るく、親しみやすい口調で話し、時々「～だよ！」「～だね！」などの語尾を使います。
競馬の専門用語を適切に使いながら、初心者にもわかりやすく説明してください。`,
      messages,
    });

    return Response.json({ analysis: text });
  } catch (error) {
    console.error("まいこさんの分析エラー:", error);
    return Response.json(
      { error: "まいこさんの分析中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
