"use client"

import { useState } from "react"
import { Check, X, ChevronDown, ChevronUp, Calendar, Clock, FileText, Wallet } from "lucide-react" // Added Wallet icon
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useI18n } from "@/app/context/I18nContext"

// Type definitions
interface LeaveRequest {
  id: string
  user: {
    id: string
    name: string
  }
  status: "Approved" | "Rejected" | "Pending"
  startDate: string
  endDate: string
  type: "Paid" | "Unpaid"
  annualPaidLeave: number | null // Allow null for unpaid leaves
  reason?: string
}

interface LeaveRequestCardProps {
  request: LeaveRequest
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onTypeChange: (id: string, type: string) => void
  canEditType: boolean
}

// Helper functions
const formattedDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const getDayCount = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

const getDayNamesInRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const days = []
  const current = new Date(start)

  while (current <= end) {
    days.push(current.toLocaleDateString("en-US", { weekday: "short" }))
    current.setDate(current.getDate() + 1)
  }

  return days.join(", ")
}

export function LeaveRequestCard({ request, onApprove, onReject, onTypeChange, canEditType }: LeaveRequestCardProps) {
  const { t } = useI18n()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleTypeChange = (value: string) => {
    onTypeChange(request.id, value)
  }

  const dayCount = getDayCount(request.startDate, request.endDate)
  const dayNames = getDayNamesInRange(request.startDate, request.endDate)

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-lg">{request.user.name}</div>
          <Badge
            variant={
              request.status === "Approved" ? "approve" : request.status === "Rejected" ? "destructive" : "outline"
            }
          >
            {t(`requests.status.${request.status.toLowerCase()}`)}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {canEditType && (
            <Select defaultValue={request.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpanded ? t("common.previous") : t("common.next")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-medium">{t("attendance.checkIn")}:</span> {formattedDate(request.startDate)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-medium">{t("attendance.checkOut")}:</span> {formattedDate(request.endDate)}
          </span>
        </div>

        <div className="flex items-center gap-2 col-span-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-medium">
              <span className=" font-bold">{dayCount}</span> day{dayCount !== 1 ? "s" : ""}:
            </span>{" "}
            {dayNames}
          </span>
        </div>

        {/* Display Annual Leave for Paid Requests */}
        {request.type === "Paid" && request.annualPaidLeave !== null && (
          <div className="flex items-center gap-2 col-span-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <span className="font-medium">Remaining Annual Paid Leave:</span> <span className="text-base font-bold">{request.annualPaidLeave}</span> days
            </span>
          </div>
        )}
      </CardContent>

      <Collapsible open={isExpanded}>
        <CollapsibleContent>
          {request.reason && (
            <div className="px-4 py-2 border-t border-border">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">{t("common.notes")}:</div>
                  <p className="text-sm">{request.reason}</p>
                </div>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {request.status === "Pending" && (
        <CardFooter className="px-4 py-3 border-t flex justify-end gap-2 bg-muted/20">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => onReject(request.id)}
          >
            <X className="mr-1 h-4 w-4" /> {t("requests.status.rejected")}
          </Button>
          <Button variant="default" size="sm" onClick={() => onApprove(request.id)}>
            <Check className="mr-1 h-4 w-4" /> {t("requests.status.approved")}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}