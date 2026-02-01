"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Send, MessageSquare, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { fetchShifts } from "@/app/api/shifts/shifts"
import type { Shift } from "@/app/types/Shift"
import { sendNotifiy } from "@/app/api/notifications/notification-api"
import { useInstitution } from "@/app/context/InstitutionContext"
import { useI18n } from "@/app/context/I18nContext"
import { Input } from "@/components/ui/input"

export default function SendNotificationPage() {
  const { t } = useI18n()
  const { slug } = useInstitution();
  const [shifts, setShifts] = useState<Shift[]>([])
  const [shiftId, setShiftId] = useState("")
  const [message, setMessage] = useState("")
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [shiftsLoading, setShiftsLoading] = useState(true)
  const [allowed, setAllowed] = useState<boolean | null>(null);

  const maxTitleLength = 50
  const maxMessageLength = 200

  useEffect(() => {
    if (!slug) return;

    (async () => {
      try {
        setShiftsLoading(true)
        const data = await fetchShifts(slug)
        setShifts(data)
      } catch {
        toast.error(t("notifications.toast.loadShiftsFailed"))
      } finally {
        setShiftsLoading(false)
      }
    })();
  }, [slug, t]);

  const selectedShift = shifts.find((shift) => shift.id === shiftId)
  const selectedShiftLabel = selectedShift?.name || ""

  const isFormValid = shiftId && title.trim() && message.trim()

  const sendNotification = async () => {
    if (!isFormValid) {
      toast.error(t("notifications.toast.fillAllFields"))
      return
    }

    setLoading(true)
    try {
      const res = await sendNotifiy(shiftId, title.trim(), message.trim(), slug || "")
      if (res?.status === 401) {
        toast.error(t("notifications.toast.unauthenticated"));
        return;
      }
      if (res?.status === 403) {
        const data = await res?.json().catch(() => ({}));
        const msg = data?.message || t("notifications.toast.noPermission");
        setAllowed(false);
        toast.error(msg);
        return;
      }

      if (!res?.ok) throw new Error("Failed to send notification");
      toast.success(t("notifications.toast.success"), {
        description: `${t("notifications.toast.sentTo")} ${selectedShiftLabel}`,
      });
      setTitle("");
      setMessage("")
      setShiftId("")
    } catch (err) {
      console.error(err)
      toast.error(t("notifications.toast.errorSending"))
    } finally {
      setLoading(false)
    }
  }

  const banner =
    allowed === false ? (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 text-blue-800">
        <AlertCircle className="w-5 h-5 mt-0.5" />
        <p className="text-sm">
          {t("notifications.permission.body")}
        </p>
      </div>
    ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {banner}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-800">{t("notifications.title")}</h1>
          <p className="text-gray-600">{t("notifications.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <Card className="shadow-md border bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                {t("notifications.compose")}
              </CardTitle>
              <CardDescription>{t("notifications.composeDesc")}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-700">{t("notifications.targetShift")}</Label>
                <Select value={shiftId} onValueChange={setShiftId} disabled={shiftsLoading}>
                  <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                    <SelectValue placeholder={shiftsLoading ? t("common.loading") : t("notifications.selectShift")} />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id!} className="py-3">
                        <div className="flex justify-between w-full">
                          <span className="font-medium">{shift.name}</span>
                          <Badge variant="secondary" className="ml-2 text-green-800">Active</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedShift && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                    <CheckCircle className="w-4 h-4" />
                    {t("notifications.selected")}: {selectedShift.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">{t("notifications.notifTitle")}</Label>
                <Input
                  placeholder={t("notifications.notifTitlePlaceholder")}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={maxTitleLength}
                  className="h-12 border-2 focus:border-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{title.length}/{maxTitleLength}</span>
                  {title.length > maxTitleLength * 0.8 && <span className="text-amber-600 font-medium">{t("notifications.charLimit")}</span>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">{t("notifications.message")}</Label>
                <Textarea
                  placeholder={t("notifications.messagePlaceholder")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={maxMessageLength}
                  className="min-h-[120px] border-2 focus:border-blue-500 resize-none"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{message.length}/{maxMessageLength}</span>
                  {message.length > maxMessageLength * 0.9 && <span className="text-amber-600 font-medium">{t("notifications.charLimit")}</span>}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={sendNotification}
                  disabled={loading || !isFormValid || allowed === false}
                  className="w-full h-12 bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t("notifications.sending")}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t("notifications.send")}
                    </>
                  )}
                </Button>
                {!isFormValid && (
                  <p className="text-sm text-center text-amber-600 font-medium">
                    {t("notifications.required")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-1 space-y-6">
            <CardHeader className="px-0">
              <CardTitle className="text-lg text-gray-700">{t("notifications.preview")}</CardTitle>
              <CardDescription>{t("notifications.previewDesc")}</CardDescription>
            </CardHeader>
            {(title || message) && (
              <CardContent className="p-0">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                          {t("notifications.to")}: {selectedShiftLabel || "..."}
                        </span>
                        <span className="text-[10px] text-gray-400">Just now</span>
                      </div>
                      {title && <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>}
                      {message && <p className="text-gray-700 text-sm whitespace-pre-wrap">{message}</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
