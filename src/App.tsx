import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { Copy, Check, Calendar as CalendarIcon, Clock, Type, FileText, Globe, Settings, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Toaster } from "@/components/ui/sonner"

const translations = {
  en: {
    title: "Kokuchi-kun Overwork Tool",
    subtitle: "Batch generate Discord announcement messages for your VRChat events. Select multiple dates to create recurring event posts.",
    eventDetails: "Event Details",
    eventDetailsDesc: "Fill in the details for your event announcements.",
    eventTitle: "Event Title",
    eventTitlePlaceholder: "e.g. Friday Game Event",
    announcementTitle: "Announcement Title",
    announcementTitlePlaceholder: "e.g. Announcement: <EVENT_TITLE>",
    announcementTitleHelp: "You can use <EVENT_TITLE> and <DATE> placeholders.",
    announcementTime: "Announcement Time",
    announcementContent: "Announcement Content",
    announcementContentHelp: "Use <DATE> as a placeholder for the selected date (e.g., 2026年3月27日). You can also use <EVENT_TITLE>.",
    selectDates: "Select Dates",
    selectDatesDesc: (max: number) => `Pick up to ${max} dates for your recurring events.`,
    generateBtn: (count: number) => `Generate Messages (${count})`,
    generatedMessages: "Generated Messages",
    generatedMessagesDesc: (count: number) => count > 0 ? `Showing ${count} generated messages.` : "Your generated messages will appear here.",
    noMessages: "No messages generated yet.",
    noMessagesDesc: "Fill out the form and click Generate.",
    copy: "Copy",
    copied: "Copied",
    errorNoDate: "Please select at least one date",
    errorMaxDate: (max: number) => `Maximum ${max} messages allowed`,
    successGenerated: (count: number) => `Generated ${count} messages`,
    adminTitle: "Admin URL Generator",
    adminSubtitle: "Generate a custom URL with pre-configured mention tags and limits.",
    botMention: "Bot Mention Tag",
    roleMention: "Role Mention Tag",
    maxCountLabel: "Max Generation Count",
    generatedUrl: "Generated URL",
    backToMain: "Back to Generator",
    adminEntrance: "Admin Tools",
    copyUrl: "Copy URL",
  },
  ja: {
    title: "告知くん残業ツール",
    subtitle: "VRChatイベント用のDiscord告知メッセージを一括生成します。複数の日付を選択して定期イベントの投稿を作成できます。",
    eventDetails: "イベント詳細",
    eventDetailsDesc: "イベント告知の詳細を入力してください。",
    eventTitle: "イベントタイトル",
    eventTitlePlaceholder: "例：金曜日ゲームイベント",
    announcementTitle: "告知タイトル",
    announcementTitlePlaceholder: "例：「<EVENT_TITLE>」開催のお知らせ",
    announcementTitleHelp: "<EVENT_TITLE> と <DATE> のプレースホルダーを使用できます。",
    announcementTime: "告知時間",
    announcementContent: "告知内容",
    announcementContentHelp: "<DATE> は選択した日付（例：2026年3月27日）に置き換わります。<EVENT_TITLE> も使用可能です。",
    selectDates: "日付選択",
    selectDatesDesc: (max: number) => `定期イベント用に最大 ${max} 日まで選択できます。`,
    generateBtn: (count: number) => `メッセージを生成 (${count}件)`,
    generatedMessages: "生成されたメッセージ",
    generatedMessagesDesc: (count: number) => count > 0 ? `${count} 件の生成されたメッセージを表示しています。` : "生成されたメッセージがここに表示されます。",
    noMessages: "まだメッセージが生成されていません。",
    noMessagesDesc: "フォームに入力して「生成」をクリックしてください。",
    copy: "コピー",
    copied: "コピー済み",
    errorNoDate: "日付を選択してください",
    errorMaxDate: (max: number) => `最大 ${max} 件まで生成できます`,
    successGenerated: (count: number) => `${count} 件のメッセージを生成しました`,
    adminTitle: "管理者用URLジェネレーター",
    adminSubtitle: "メンションタグや制限を事前設定したカスタムURLを生成します。",
    botMention: "Botメンションタグ",
    roleMention: "ロールメンションタグ",
    maxCountLabel: "最大生成件数",
    generatedUrl: "生成されたURL",
    backToMain: "ジェネレーターに戻る",
    adminEntrance: "管理者ツール",
    copyUrl: "URLをコピー",
  }
}

export default function App() {
  const [lang, setLang] = useState<"en" | "ja">(() => {
    if (typeof navigator !== "undefined") {
      const browserLang = navigator.language || (navigator.languages && navigator.languages[0]) || "";
      return browserLang.toLowerCase().startsWith("ja") ? "ja" : "en";
    }
    return "ja";
  })
  const t = translations[lang]

  const [view, setView] = useState<"main" | "admin">("main")

  // Generator State
  const [mentionBot, setMentionBot] = useState("<@1306499718313938974>")
  const [mentionRole, setMentionRole] = useState("<@&1320711513698472008>")
  const [maxCount, setMaxCount] = useState(4)

  const [announcementTitle, setAnnouncementTitle] = useState("「<EVENT_TITLE>」開催のお知らせ")
  const [eventTitle, setEventTitle] = useState("金曜日ゲームイベント")
  const [announcementContent, setAnnouncementContent] = useState(
    "<DATE> 21:00 から 24:00 まで、「<EVENT_TITLE>」を開催します！\n＜イベントの紹介＞\n途中参加、退室自由です。\nデスクトップ参加や、見学のみのご参加も歓迎です。\n参加方法：グループインスタンスにJOIN\n参加条件・人数制限：特になし（Quest対応）\nお問い合わせ先：＜イベント主催者名＞"
  )
  const [announcementTime, setAnnouncementTime] = useState("18:00")
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [generatedMessages, setGeneratedMessages] = useState<{ date: Date; text: string }[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // Admin State
  const [adminBot, setAdminBot] = useState(mentionBot)
  const [adminRole, setAdminRole] = useState(mentionRole)
  const [adminMax, setAdminMax] = useState(maxCount.toString())
  const [copiedUrl, setCopiedUrl] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has("mentionBot")) {
      setMentionBot(params.get("mentionBot")!)
      setAdminBot(params.get("mentionBot")!)
    }
    if (params.has("mentionRole")) {
      setMentionRole(params.get("mentionRole")!)
      setAdminRole(params.get("mentionRole")!)
    }
    if (params.has("maxCount")) {
      const count = parseInt(params.get("maxCount")!, 10)
      if (!isNaN(count) && count > 0) {
        setMaxCount(count)
        setAdminMax(count.toString())
      }
    }
  }, [])

  const handleGenerate = () => {
    if (selectedDates.length === 0) {
      toast.error(t.errorNoDate)
      return
    }

    if (selectedDates.length > maxCount) {
      toast.error(t.errorMaxDate(maxCount))
      return
    }

    const messages = selectedDates.sort((a, b) => a.getTime() - b.getTime()).map((date) => {
      const formattedDate = format(date, "yyyy年M月d日", { locale: ja })
      
      const content = announcementContent
        .replace(/<DATE>/g, formattedDate)
        .replace(/<EVENT_TITLE>/g, eventTitle)
        
      const title = announcementTitle
        .replace(/<DATE>/g, formattedDate)
        .replace(/<EVENT_TITLE>/g, eventTitle)
      
      const text = `${mentionRole} ${mentionBot}
告知日付：${formattedDate} ${announcementTime}

告知タイトル：${title}

イベントタイトル：${eventTitle}

告知内容：

${content}`

      return { date, text }
    })

    setGeneratedMessages(messages)
    toast.success(t.successGenerated(messages.length))
  }

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    toast.success(t.copied)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const generatedAdminUrl = useMemo(() => {
    if (typeof window === "undefined") return ""
    const url = new URL(window.location.origin + window.location.pathname)
    if (adminBot) url.searchParams.set("mentionBot", adminBot)
    if (adminRole) url.searchParams.set("mentionRole", adminRole)
    const max = parseInt(adminMax, 10)
    if (!isNaN(max) && max > 0) url.searchParams.set("maxCount", max.toString())
    return url.toString()
  }, [adminBot, adminRole, adminMax])

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(generatedAdminUrl)
    setCopiedUrl(true)
    toast.success(t.copied)
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 font-sans text-zinc-900 relative pb-24">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">{t.title}</h1>
            <p className="text-zinc-500 max-w-2xl">{t.subtitle}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLang(lang === "en" ? "ja" : "en")} className="shrink-0 self-start sm:self-auto">
            <Globe className="mr-2 h-4 w-4" />
            {lang === "en" ? "日本語" : "English"}
          </Button>
        </header>

        {view === "main" ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Form Section */}
            <div className="lg:col-span-5 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t.eventDetails}</CardTitle>
                  <CardDescription>{t.eventDetailsDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventTitle" className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-zinc-500" />
                      {t.eventTitle}
                    </Label>
                    <Input
                      id="eventTitle"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder={t.eventTitlePlaceholder}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                      <Type className="h-4 w-4 text-zinc-500" />
                      {t.announcementTitle}
                    </Label>
                    <p className="text-xs text-zinc-500 mb-2">
                      {t.announcementTitleHelp}
                    </p>
                    <Input
                      id="title"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      placeholder={t.announcementTitlePlaceholder}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-zinc-500" />
                      {t.announcementTime}
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={announcementTime}
                      onChange={(e) => setAnnouncementTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-zinc-500" />
                      {t.announcementContent}
                    </Label>
                    <p className="text-xs text-zinc-500 mb-2">
                      {t.announcementContentHelp}
                    </p>
                    <Textarea
                      id="content"
                      value={announcementContent}
                      onChange={(e) => setAnnouncementContent(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.selectDates}</CardTitle>
                  <CardDescription>{t.selectDatesDesc(maxCount)}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => setSelectedDates(dates as Date[])}
                    className="rounded-md border shadow-sm bg-white"
                  />
                  <div className="mt-6 w-full">
                    <Button onClick={handleGenerate} className="w-full" size="lg">
                      {t.generateBtn(selectedDates.length)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="h-full border-dashed bg-zinc-50/50">
                <CardHeader>
                  <CardTitle>{t.generatedMessages}</CardTitle>
                  <CardDescription>
                    {t.generatedMessagesDesc(generatedMessages.length)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {generatedMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500">
                      <CalendarIcon className="mb-4 h-12 w-12 opacity-20" />
                      <p>{t.noMessages}</p>
                      <p className="text-sm">{t.noMessagesDesc}</p>
                    </div>
                  ) : (
                    generatedMessages.map((msg, index) => (
                      <div key={index} className="group relative rounded-lg border bg-white shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between border-b bg-zinc-50 px-4 py-2">
                          <span className="text-sm font-medium text-zinc-700">
                            {format(msg.date, "yyyy年M月d日", { locale: ja })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5"
                            onClick={() => handleCopy(msg.text, index)}
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="h-4 w-4 text-green-600" />
                                <span className="text-green-600">{t.copied}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                <span>{t.copy}</span>
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="p-4">
                          <pre className="whitespace-pre-wrap font-mono text-sm text-zinc-800 break-words">
                            {msg.text}
                          </pre>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto mt-12">
            <Card>
              <CardHeader>
                <CardTitle>{t.adminTitle}</CardTitle>
                <CardDescription>{t.adminSubtitle}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminBot">{t.botMention}</Label>
                    <Input
                      id="adminBot"
                      value={adminBot}
                      onChange={(e) => setAdminBot(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminRole">{t.roleMention}</Label>
                    <Input
                      id="adminRole"
                      value={adminRole}
                      onChange={(e) => setAdminRole(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminMax">{t.maxCountLabel}</Label>
                    <Input
                      id="adminMax"
                      type="number"
                      min="1"
                      value={adminMax}
                      onChange={(e) => setAdminMax(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label>{t.generatedUrl}</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={generatedAdminUrl}
                      className="bg-zinc-50 font-mono text-xs"
                    />
                    <Button onClick={handleCopyUrl} className="shrink-0 gap-2">
                      {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {t.copyUrl}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="secondary"
          className="shadow-lg rounded-full px-4 py-6 border border-zinc-200"
          onClick={() => setView(view === "main" ? "admin" : "main")}
        >
          {view === "main" ? (
            <>
              <Settings className="mr-2 h-5 w-5" />
              <span className="font-medium">{t.adminEntrance}</span>
            </>
          ) : (
            <>
              <ArrowLeft className="mr-2 h-5 w-5" />
              <span className="font-medium">{t.backToMain}</span>
            </>
          )}
        </Button>
      </div>

      <Toaster position="bottom-right" />
    </div>
  )
}
