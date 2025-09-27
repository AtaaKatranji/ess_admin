import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Mail, User, Building2 } from "lucide-react"
import { Employee } from "@/app/types/Employee";

interface EmployeeCardProps {
  employee: Employee
}

export function EmployeeCard({ employee }: EmployeeCardProps) {
  // const getStatusVariant = (status: string) => {
  //   switch (status) {
  //     case "active":
  //       return "default"
  //     case "resigned":
  //       return "destructive"
  //     case "suspended":
  //       return "secondary"
  //     default:
  //       return "outline"
  //   }
  // }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success/10 text-success border-success/20"
      case "resigned":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "suspended":
        return "bg-warning/10 text-warning border-warning/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="container mx-auto px-4">
  <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
    <CardHeader className="pb-3 px-4 sm:px-6 lg:px-8">
      <div className="flex items-start gap-3 sm:gap-4 lg:gap-6">
        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 ring-2 ring-primary/20 flex-shrink-0">
            <AvatarImage src={employee.avatar || "/placeholder.svg"} alt={employee.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm sm:text-lg lg:text-xl">
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-balance leading-tight mb-1">
              {employee.name}
            </CardTitle>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground font-medium">
              {employee.position || "Employee"}
            </p>
            <div className="mt-2">
              <Badge className={`${getStatusColor(employee.status)} font-medium px-2 py-1 text-xs lg:text-sm`}>
                {employee.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0 px-4 sm:px-6 lg:px-8">
        <div className="grid gap-2 sm:gap-3 lg:gap-4 lg:grid-cols-3">
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 rounded-lg bg-muted/30 border border-border/50">
            <Mail className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</p>
              <p className="text-xs sm:text-sm lg:text-base font-medium truncate">{employee.email || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 rounded-lg bg-muted/30 border border-border/50">
            <Building2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Department</p>
              <p className="text-xs sm:text-sm lg:text-base font-medium truncate">{employee.department || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 rounded-lg bg-muted/30 border border-border/50">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Work Schedule</p>
              <p className="text-xs sm:text-sm lg:text-base font-medium">
                {employee.shiftId
                  ? `${employee.shiftId} - ${employee.shiftName}`
                  : "Unassigned"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 px-4 sm:px-6 lg:px-8">
        <Button className="w-full lg:w-auto font-medium shadow-sm hover:shadow-md transition-all duration-200 text-sm py-2 px-4 lg:px-6">
          <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          Edit General Info
        </Button>
      </CardFooter>
    </Card>
    </div>
  )
}
