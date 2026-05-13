"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Send, MessageSquare, Loader2, AlertCircle, Bell, User, Users, RefreshCw, Reply, Trash2 } from "lucide-react"
import { fetchShifts } from "@/app/api/shifts/shifts"
import { fetchEmployees } from "@/app/api/employees/employeeId"
import type { Shift } from "@/app/types/Shift"
import { sendNotifiy, sendNotifiyUser, fetchNotifications, deleteNotification } from "@/app/api/notifications/notification-api"
import { useInstitution } from "@/app/context/InstitutionContext"
import { useI18n } from "@/app/context/I18nContext"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

interface AppNotification {
  id: number;
  title: string;
  body: string;
  type: string;
  data: {
    userId?: number | string;
    shiftId?: number | string;
    [key: string]: unknown;
  };
  createdAt: string;
  seen: boolean;
}

export default function NotificationsPage() {
  const { t } = useI18n()
  const { slug } = useInstitution();
  const [shifts, setShifts] = useState<Shift[]>([])
  const [employees, setEmployees] = useState<Array<{ id: number | string; name: string }>>([])
  const [incomingNotifications, setIncomingNotifications] = useState<AppNotification[]>([])
  
  const [recipientType, setRecipientType] = useState<"shift" | "employee">("shift")
  const [shiftId, setShiftId] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [message, setMessage] = useState("")
  const [title, setTitle] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(true)
  const [allowed, setAllowed] = useState<boolean | null>(null);

  const maxTitleLength = 50
  const maxMessageLength = 200

  const loadData = async () => {
    if (!slug) return;
    try {
      setFetchingData(true)
      const [shiftsData, empsData, notifsData] = await Promise.all([
        fetchShifts(slug),
        fetchEmployees(slug),
        fetchNotifications<AppNotification>(slug)
      ])
      setShifts(shiftsData)
      setEmployees(empsData)
      setIncomingNotifications(notifsData)
    } catch (err) {
      console.error(err)
      toast.error(t("notifications.toast.loadDataFailed") || "Failed to load data")
    } finally {
      setFetchingData(false)
    }
  }

  useEffect(() => {
    loadData();
    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(() => {
      if (slug) fetchNotifications<AppNotification>(slug).then(setIncomingNotifications);
    }, 30000);
    return () => clearInterval(interval);
  }, [slug]);

  const selectedShift = shifts.find((s) => s.id === shiftId)
  const selectedEmployee = employees.find((e) => String(e.id) === employeeId)
  
  const recipientLabel = recipientType === "shift" 
    ? (selectedShift?.name || "") 
    : (selectedEmployee?.name || "")

  const isFormValid = (recipientType === "shift" ? shiftId : employeeId) && title.trim() && message.trim()

  const handleSend = async () => {
    if (!isFormValid) {
      toast.error(t("notifications.toast.fillAllFields"))
      return
    }

    setLoading(true)
    try {
      let res;
      if (recipientType === "shift") {
        res = await sendNotifiy(shiftId, title.trim(), message.trim(), slug || "")
      } else {
        res = await sendNotifiyUser(employeeId, title.trim(), message.trim(), slug || "")
      }

      if (res?.status === 403) {
        setAllowed(false);
        toast.error(t("notifications.toast.noPermission"));
        return;
      }

      if (!res?.ok) throw new Error("Failed to send notification");
      
      toast.success(t("notifications.toast.success"), {
        description: `${t("notifications.toast.sentTo")} ${recipientLabel}`,
      });
      
      setTitle("");
      setMessage("")
      setShiftId("")
      setEmployeeId("")
    } catch (err) {
      console.error(err)
      toast.error(t("notifications.toast.errorSending"))
    } finally {
      setLoading(false)
    }
  }

  const handleFollowUp = (notif: AppNotification) => {
    setRecipientType("employee")
    setEmployeeId(String(notif.data?.userId || ""))
    setTitle(`Follow up: ${notif.title}`)
    setMessage(`Hi ${notif.body.split(' ')[1] || ''}, regarding the alert: "${notif.title}". Please let us know...`)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleDelete = async (id: number) => {
    if (!slug) return;
    try {
      const res = await deleteNotification(id, slug);
      if (res?.ok) {
        setIncomingNotifications(prev => prev.filter(n => n.id !== id));
        toast.success(t("notifications.toast.deleted") || "Notification deleted");
      } else {
        throw new Error("Failed to delete notification");
      }
    } catch (err) {
      console.error(err);
      toast.error(t("notifications.toast.deleteFailed") || "Failed to delete notification");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" />
              {t("notifications.title")}
            </h1>
            <p className="text-slate-500">{t("notifications.subtitle")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} disabled={fetchingData}>
            <RefreshCw className={`w-4 h-4 mr-2 ${fetchingData ? 'animate-spin' : ''}`} />
            {t("common.refresh") || "Refresh"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: COMPOSE */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  {t("notifications.compose")}
                </CardTitle>
                <CardDescription>{t("notifications.composeDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-3">
                  <Label className="text-slate-700 font-medium">{t("notifications.recipientType") || "Recipient Type"}</Label>
                  <Tabs value={recipientType} onValueChange={(v) => setRecipientType(v as "shift" | "employee")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="shift" className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> {t("notifications.shift") || "By Shift"}
                      </TabsTrigger>
                      <TabsTrigger value="employee" className="flex items-center gap-2">
                        <User className="w-4 h-4" /> {t("notifications.employee") || "By Employee"}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {recipientType === "shift" ? (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <Label className="text-slate-700">{t("notifications.targetShift")}</Label>
                    <Select value={shiftId} onValueChange={setShiftId} disabled={fetchingData}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={t("notifications.selectShift")} />
                      </SelectTrigger>
                      <SelectContent>
                        {shifts.map((s) => (
                          <SelectItem key={s.id} value={s.id!}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                    <Label className="text-slate-700">{t("notifications.targetEmployee") || "Target Employee"}</Label>
                    <Select value={employeeId} onValueChange={setEmployeeId} disabled={fetchingData}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder={t("notifications.selectEmployee") || "Select Employee"} />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((e) => (
                          <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-slate-700">{t("notifications.notifTitle")}</Label>
                  <Input
                    placeholder={t("notifications.notifTitlePlaceholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={maxTitleLength}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700">{t("notifications.message")}</Label>
                  <Textarea
                    placeholder={t("notifications.messagePlaceholder")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={maxMessageLength}
                    className="min-h-[100px] resize-none"
                  />
                  <div className="flex justify-end text-[10px] text-slate-400">
                    {message.length}/{maxMessageLength}
                  </div>
                </div>

                <Button
                  onClick={handleSend}
                  disabled={loading || !isFormValid || allowed === false}
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> {t("notifications.send")}</>}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-dashed border-slate-300 bg-slate-100/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 text-slate-500">
                  <AlertCircle className="w-5 h-5 mt-0.5 text-blue-400" />
                  <div className="text-sm">
                    <p className="font-medium text-slate-700 mb-1">{t("notifications.tipTitle") || "Quick Tip"}</p>
                    <p>{t("notifications.tipBody") || "Sending specific alerts to employees helps maintain high attendance compliance."}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: ALERTS & HISTORY */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="shadow-sm border-slate-200 h-full flex flex-col">
              <CardHeader className="border-b bg-slate-50/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{t("notifications.incomingAlerts") || "Incoming Alerts"}</CardTitle>
                  <CardDescription>{t("notifications.incomingDesc") || "Real-time updates from the system"}</CardDescription>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {incomingNotifications.length} Total
                </Badge>
              </CardHeader>
              <CardContent className="p-0 flex-1">
                <ScrollArea className="h-[600px] p-4">
                  <div className="space-y-4">
                    {incomingNotifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                        <Bell className="w-10 h-10 opacity-20" />
                        <p>{t("notifications.noAlerts") || "No recent alerts"}</p>
                      </div>
                    ) : (
                      incomingNotifications.map((notif) => (
                        <div key={notif.id} className={`p-4 rounded-xl border transition-all ${notif.seen ? 'bg-white border-slate-100' : 'bg-blue-50/30 border-blue-100 shadow-sm'}`}>
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${notif.type.includes('missed') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-900 text-sm">{notif.title}</h4>
                                <span className="text-[10px] text-slate-400">{format(new Date(notif.createdAt), 'MMM d, HH:mm')}</span>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">{notif.body}</p>
                              <div className="pt-3 flex items-center justify-between">
                                <div className="flex gap-2">
                                  {notif.type === 'admin_missed_checkin' && <Badge variant="destructive" className="text-[9px] uppercase tracking-tighter">Urgent</Badge>}
                                  <Badge variant="outline" className="text-[9px] uppercase tracking-tighter bg-white">{notif.type}</Badge>
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs" onClick={() => handleFollowUp(notif)}>
                                    <Reply className="w-3 h-3 mr-1.5" />
                                    {t("notifications.followUp") || "Follow up"}
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 text-xs" onClick={() => handleDelete(notif.id)}>
                                    <Trash2 className="w-3 h-3 mr-1.5" />
                                    {t("common.delete") || "Delete"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
