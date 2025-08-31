"use client"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Send, Users, MessageSquare, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { fetchShifts } from "@/app/api/shifts/shifts"
import type { Shift } from "@/app/types/Shift"
import { sendNotifiy } from "@/app/api/notifications/notification-api"
import { useInstitution } from "@/app/context/InstitutionContext"

export default function NotificationPage() {
  const { slug } = useInstitution()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [selectedShiftId, setSelectedShiftId] = useState("")
  const [message, setMessage] = useState("")
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [shiftsLoading, setShiftsLoading] = useState(true)

  const maxTitleLength = 100
  const maxMessageLength = 500

  useEffect(() => {
    if (!slug) return
    const loadShifts = async () => {
      try {
        setShiftsLoading(true)
        const data = await fetchShifts(slug)
        setShifts(data)
      } catch {
        toast.error("Failed to load shifts")
      } finally {
        setShiftsLoading(false)
      }
    }

    if (slug) {
      loadShifts()
    }
  }, [slug])

  const selectedShift = shifts.find((shift) => shift.id === selectedShiftId)

  const isFormValid = selectedShiftId && title.trim() && message.trim()

  const sendNotification = async () => {
    if (!isFormValid) {
      toast.error("Please fill in all required fields.")
      return
    }

    setLoading(true)
    try {
      const res = await sendNotifiy(selectedShiftId, title.trim(), message.trim())
      const data = await res?.json()

      if (res?.ok) {
        toast.success("Notification sent successfully!", {
          description: `Sent to ${selectedShift?.name}`,
        })
        setMessage("")
        setTitle("")
        setSelectedShiftId("")
      } else {
        toast.error(data.message || "Failed to send notification.")
      }
    } catch (err) {
      console.error(err)
      toast.error("Error sending notification.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
  <div className="max-w-6xl mx-auto space-y-10">
    {/* Header */}
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
        <Send className="w-8 h-8 text-blue-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800">Send Notification</h1>
      <p className="text-gray-600">Notify team members about important updates</p>
    </div>

    {/* Content: Form + Preview */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Form Card */}
      <Card className="shadow-md border bg-white/90 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Compose Notification
          </CardTitle>
          <CardDescription>Select a shift and write your message</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Shift */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Target Shift *
            </Label>
            <Select value={selectedShiftId} onValueChange={setSelectedShiftId} disabled={shiftsLoading}>
              <SelectTrigger className="h-12 border-2 focus:border-blue-500">
                <SelectValue placeholder={shiftsLoading ? "Loading..." : "Select shift"} />
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
                Selected: {selectedShift.name}
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Notification Title *</Label>
            <div className="relative">
              <Textarea
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, maxTitleLength))}
                placeholder="Short title..."
                rows={2}
                className="border-2 resize-none focus:border-blue-500"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">{title.length}/{maxTitleLength}</div>
            </div>
            {title.length > maxTitleLength * 0.9 && (
              <div className="text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Approaching character limit
              </div>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">Message Content *</Label>
            <div className="relative">
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, maxMessageLength))}
                placeholder="Full message..."
                rows={6}
                className="border-2 focus:border-blue-500"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">{message.length}/{maxMessageLength}</div>
            </div>
            {message.length > maxMessageLength * 0.9 && (
              <div className="text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Approaching character limit
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-4">
            <Button
              onClick={sendNotification}
              disabled={loading || !isFormValid}
              className="w-full h-12 bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
            {!isFormValid && (
              <p className="text-sm text-gray-500 text-center mt-2">All fields are required.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {(title || message) && (
        <Card className="shadow-md border border-gray-200 h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-700">Preview</CardTitle>
            <CardDescription>How your notification will appear</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
              {title && <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>}
              {message && <p className="text-gray-700 whitespace-pre-wrap">{message}</p>}
              {selectedShift && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <Badge variant="outline" className="text-xs">To: {selectedShift.name}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  </div>
</div>
  )
}
