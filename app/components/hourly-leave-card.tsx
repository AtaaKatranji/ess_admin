"use client"

import { useState } from "react"
import { Check, X, ChevronDown, ChevronUp, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Type definitions
type HourlyLeave = {
  breakDetails: {
    id: string
    startTime: string
    endTime: string
    duration: string
    status: "Approved" | "Rejected" | "Pending"
  }
  employeeDetails: {
    name: string
  }
}

interface HourlyLeaveCardProps {
  leave: HourlyLeave
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

// Helper function
const formattedTime = (timeString: string) => {
  try {
    const date = new Date(timeString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return timeString // Return as is if parsing fails
  }
}

export function HourlyLeaveCard({ leave, onApprove, onReject }: HourlyLeaveCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-lg">{leave.employeeDetails.name}</div>
          <Badge
            variant={
                          leave.breakDetails.status === "Approved" ? "secondary" :
            leave.breakDetails.status === "Rejected" ? "destructive" : "outline"
            }
          >
            {leave.breakDetails.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
            
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
              
              </TooltipTrigger>
              <TooltipContent>
                <p>{isExpanded ? "Show less" : "Show more"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-medium">Start:</span> {formattedTime(leave.breakDetails.startTime)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-medium">End:</span> {formattedTime(leave.breakDetails.endTime)}
          </span>
        </div>

        <div className="flex items-center gap-2 col-span-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <span className="font-medium">Duration:</span> {leave.breakDetails.duration}
          </span>
        </div>
      </CardContent>

      {leave.breakDetails.status === "Pending" && (
        <CardFooter className="px-4 py-3 border-t flex justify-end gap-2 bg-muted/20">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive hover:bg-destructive/10"
            onClick={() => onReject(leave.breakDetails.id)}
          >
            <X className="mr-1 h-4 w-4" /> Reject
          </Button>
          <Button variant="default" size="sm" onClick={() => onApprove(leave.breakDetails.id)}>
            <Check className="mr-1 h-4 w-4" /> Approve
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

