"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchEmployees, fetchTotalHours } from "@/app/api/employees/employeeId"
import { fetchInstitution } from "@/app/api/institutions/institutions"
import { fetchShifts } from "@/app/api/shifts/shifts"
import { Clock, Users, Briefcase, Mail, Building } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { useEmployee } from "@/app/context/EmployeeContext";
interface Employee {
  id: string
  name: string
  role: string
  department?: string
  email?: string
  totalHours?: number
  shift: {
    id: string
    name: string
  }
  shiftId?: string
  shiftName?: string
}

interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
  days: string[]
}

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedShift, setSelectedShift] = useState("all")
  const [shiftOptions, setShiftOptions] = useState<Shift[]>([])
  const router = useRouter()
  const params = useParams()
  const { setEmployeeId } = useEmployee(); 
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug

  const fetchData = async () => {
    try {
      setLoading(true)
      const dataIns = await fetchInstitution(slug!)
      console.log("dataIns", dataIns)
      if (!dataIns.uniqueKey) return

      const data = await fetchEmployees(dataIns.uniqueKey)
      const dataShifts = await fetchShifts(dataIns.uniqueKey)

      setShiftOptions(dataShifts)
      // if (dataShifts.length > 0) {
      //   setSelectedShift(dataShifts[0]._id)
      // }

      console.log("users ", data)
      setEmployees(data)
      if (data.length > 0) {
        // Create a new array with total hours for each employee
        const employeesWithHours = await Promise.all(
          data.map(async (employee: Employee) => {
            console.log("Employees: ", data.length , employee.id)
            const totalHours = await fetchTotalHours(employee.id, new Date())
            return { ...employee, totalHours }
          }),
        )
        setEmployees(employeesWithHours)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
      setError("Failed to fetch employees.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchDataAsync = async () => {
      await fetchData()
    }

    fetchDataAsync()
  }, [])

  const filteredEmployees =
    selectedShift === "all" ? employees : employees.filter((emp) => emp.shiftId === selectedShift)

  const handleViewDetails = (employeeId: string) => {
    setEmployeeId(employeeId);
    router.push(`/dashboard/institution/${slug}/employees/${employeeId}/details`)
  }

  return (
    <div className="container mx-auto p-4 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight  text-gray-800">Employees List</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Users className="h-5 w-5 text-muted-foreground hidden sm:block" />
          <Select value={selectedShift} onValueChange={setSelectedShift}>
            <SelectTrigger className="w-full sm:w-[200px]" aria-label="Select shift">
              <SelectValue placeholder="Filter by shift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shifts</SelectItem>
              {shiftOptions.map((shift) => (
                <SelectItem key={shift.id} value={shift.id}>
                  {shift.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <EmployeeListSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 p-6 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{employee.name}</CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {employee.role}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {employee.department && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Building className="h-4 w-4 mr-2" />
                        <span>{employee.department}</span>
                      </div>
                    )}
                    {employee.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="truncate">{employee.email}</span>
                      </div>
                    )}
                    {employee.shift?.name && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <span>{employee.shift.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center p-3 bg-muted/50 rounded-md">
                    <Clock className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Total Hours</p>
                      <p className="text-2xl font-bold">{employee.totalHours ?? "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleViewDetails(employee.id)} className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 transition-all border-0"
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center p-10 border rounded-lg bg-muted/20">
              <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No employees found for this shift.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Skeleton loader for the employee list
const EmployeeListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex items-center p-3 bg-muted/50 rounded-md">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-1/4" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default EmployeeList

