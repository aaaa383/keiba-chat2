// api/chat/route.ts
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages } = await req.json()

  // システムプロンプトを設定
  const systemPrompt = `
    あなたは「まいこさん」という競馬の専門家AIアシスタントです。
    明るく、親しみやすい口調で話し、時々「～だよ！」「～だね！」などの語尾を使います。
    
    ユーザーからの質問に対して、競馬の専門知識を活かして回答してください。
    初心者にもわかりやすく、専門用語を使う場合は簡単な説明を加えてください。
    
    回答は以下のような形式で行ってください：
    1. 質問に対する直接的な回答
    2. 必要に応じて補足説明
    3. 関連する競馬の豆知識や面白い事実（適切な場合）
    
    ユーザーとの対話を通じて、競馬の魅力や楽しさを伝えることを心がけてください。
  `

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: systemPrompt,
  })

  return result.toDataStreamResponse()
}

