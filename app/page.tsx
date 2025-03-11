"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Upload, Send, ImageIcon, FileJson, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import Image from "next/image"
import ReactMarkdown from "react-markdown"

type Character = "まいこさん" | "かわむー" | "user"

interface ChatMessage {
  id: string
  role: Character
  content: string
  isHtml?: boolean
}

export default function HorseRacingAdvisor() {
  const [jsonFile, setJsonFile] = useState<File | null>(null)
  const [shapImage, setShapImage] = useState<File | null>(null)
  const [jsonPreview, setJsonPreview] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [raceId, setRaceId] = useState<string>("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    onFinish: (message) => {
      // ユーザーの質問に対する応答は「まいこさん」から
      addMessage("まいこさん", message.content, true)
    },
  })

  useEffect(() => {
    // ダークモードの設定
    if (isDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDarkMode])

  useEffect(() => {
    // メッセージが追加されたらスクロールエリアを一番下にスクロール
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [chatMessages])

  const addMessage = (role: Character, content: string, isHtml = false) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role,
        content,
        isHtml,
      },
    ])
  }

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setJsonFile(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          try {
            const json = JSON.parse(event.target.result as string)
            setJsonPreview(JSON.stringify(json, null, 2))
          } catch (error) {
            setJsonPreview("JSONの解析に失敗しました。有効なJSONファイルをアップロードしてください。")
          }
        }
      }
      reader.readAsText(file)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setShapImage(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          // event.target.result は "data:image/jpeg;base64,..." の形式になっている
          setImagePreview(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyzeData = async () => {
    if (!jsonFile && !shapImage && !raceId) {
      addMessage("まいこさん", "データを分析するには、JSONファイル、Shap値の画像、またはレースIDを入力してください。")
      return
    }

    // チャット履歴をクリアしてリフレッシュ
    setChatMessages([])

    setIsAnalyzing(true)

    // まいこさんの初期メッセージ
    const today = new Date()
    const month = today.getMonth() + 1
    let maikoMessage

    if (month >= 1 && month <= 3) {
      maikoMessage = "ダート三冠に向けた動きが活発になるね"
    } else if (month >= 4 && month <= 6) {
      maikoMessage = "ダートもJpnIで盛り上がるね"
    } else if (month >= 7 && month <= 9) {
      maikoMessage = "秋に向けた中堅層の動きが活発になるね"
    } else {
      maikoMessage = "ダートもJpnIで盛り上がるね"
    }

    addMessage("まいこさん", maikoMessage, true)

    setTimeout(() => {
      addMessage("かわむー", "なんだって～", true)
    }, 1000)

    setTimeout(() => {
      if (raceId) {
        addMessage("まいこさん", `とりあえず、ID:${raceId}の予想を始めるよ！`, true)
      } else {
        addMessage("まいこさん", "アップロードされたデータを分析するね！", true)
      }
    }, 2000)

    setTimeout(() => {
      addMessage("かわむー", "うむ", true)
    }, 3000)

    // データ分析のリクエスト
    setTimeout(async () => {
      try {
        const requestData: any = {}

        if (jsonFile && jsonPreview) {
          requestData.jsonData = jsonPreview
        }

        if (shapImage && imagePreview) {
          requestData.imageData = imagePreview
        }

        if (raceId) {
          requestData.raceId = raceId
          addMessage("まいこさん", "まず今回の出馬表の馬の情報を表示するね！", true)

          // レース情報の取得（実際のAPIエンドポイントに置き換えてください）
          try {
            const raceResponse = await fetch(`/api/race?raceId=${raceId}`)
            if (raceResponse.ok) {
              const htmlTable = await raceResponse.text()
              addMessage("まいこさん", htmlTable, true)
            }
          } catch (error) {
            console.error("レース情報の取得に失敗しました", error)
          }
        }

        // まいこさんの分析
        const maikoResponse = await fetch("/api/analyze-maiko", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        })

        if (maikoResponse.ok) {
          const maikoData = await maikoResponse.json()
          addMessage("まいこさん", maikoData.analysis, true)

          // かわむーの返答
          setTimeout(async () => {
            const kawamuResponse = await fetch("/api/analyze-kawamu", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                maikoAnalysis: maikoData.analysis,
                ...requestData,
              }),
            })

            if (kawamuResponse.ok) {
              const kawamuData = await kawamuResponse.json()
              addMessage("かわむー", kawamuData.reply, true)
            } else {
              addMessage("かわむー", "うーん、分析できないぞ...", true)
            }

            setIsAnalyzing(false)
          }, 2000)
        } else {
          addMessage("まいこさん", "分析中にエラーが発生しました。もう一度お試しください。", true)
          setIsAnalyzing(false)
        }
      } catch (error) {
        console.error("分析エラー:", error)
        addMessage("まいこさん", "分析中にエラーが発生しました。もう一度お試しください。", true)
        setIsAnalyzing(false)
      }
    }, 4000)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!input.trim()) return

    // ユーザーのメッセージを追加
    addMessage("user", input)
    handleSubmit(e)
  }

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900`}>
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="border-b flex justify-between items-center">
          <CardTitle className="text-center text-2xl">馬券アドバイザー</CardTitle>
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} id="dark-mode" />
            <Moon className="h-4 w-4" />
          </div>
        </CardHeader>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid grid-cols-2 mx-4 mt-4">
            <TabsTrigger value="chat">チャット</TabsTrigger>
            <TabsTrigger value="upload">データアップロード</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="p-0">
            <ScrollArea className="h-[60vh] p-4" ref={scrollAreaRef}>
              {chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                  <Image
                    src="/placeholder.svg?height=100&width=100"
                    alt="馬のアイコン"
                    width={100}
                    height={100}
                    className="mb-4 opacity-50"
                  />
                  <p>
                    「データアップロード」タブからJSONファイルとShap値の画像をアップロードして、馬券のアドバイスを受けましょう。
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex items-start gap-2 max-w-[80%]">
                        {message.role !== "user" && (
                          <Avatar className="mt-1">
                            <AvatarImage
                              src={message.role === "まいこさん" ? "/images/maiko.png" : "/images/kawamu.png"}
                            />
                            <AvatarFallback>{message.role === "まいこさん" ? "M" : "K"}</AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`p-3 rounded-lg ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : message.role === "まいこさん"
                              ? "bg-pink-100 dark:bg-pink-900 text-pink-900 dark:text-pink-100"
                              : "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                          }`}
                        >
                          {message.isHtml ? (
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          ) : (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                        {message.role === "user" && (
                          <Avatar className="mt-1">
                            <AvatarFallback>You</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <CardFooter className="border-t p-4">
              <form onSubmit={onSubmit} className="flex w-full space-x-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="メッセージを入力..."
                  className="flex-grow"
                  disabled={isLoading || isAnalyzing}
                />
                <Button type="submit" disabled={isLoading || isAnalyzing}>
                  <Send className="h-4 w-4 mr-2" />
                  送信
                </Button>
              </form>
            </CardFooter>
          </TabsContent>

          <TabsContent value="upload" className="p-4 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileJson className="h-5 w-5" />
                    JSONファイル
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <label htmlFor="json-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          クリックしてJSONファイルをアップロード
                        </p>
                      </div>
                      <input
                        id="json-upload"
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleJsonUpload}
                      />
                    </label>
                  </div>

                  {jsonPreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">プレビュー:</p>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md text-xs overflow-auto max-h-40">
                        {jsonPreview}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Shap値の画像
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">クリックして画像をアップロード</p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>

                  {imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">プレビュー:</p>
                      <div className="relative h-40 w-full">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="アップロードされた画像"
                          fill
                          className="object-contain rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>レースID入力</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    id="race-id"
                    value={raceId}
                    onChange={(e) => setRaceId(e.target.value)}
                    placeholder="レースIDを入力（例: 202401010101）"
                    className="flex-grow"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-6">
              <Button onClick={handleAnalyzeData} className="w-full md:w-auto" size="lg" disabled={isAnalyzing}>
                {isAnalyzing ? "分析中..." : "データを分析して馬券をアドバイス"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}