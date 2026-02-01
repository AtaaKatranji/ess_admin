"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { toast } from "react-toastify"

import { useInstitution } from "@/app/context/InstitutionContext"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/app/context/I18nContext"

const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
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
  status: string
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
  const [open, setOpen] = useState(false)
  
  const router = useRouter()
  //const params = useParams()
  const { setEmployeeId } = useEmployee(); 
  // const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug
  const { slug } = useInstitution();
  const { t } = useI18n();
  const [form, setForm] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    role: "",
    gender: "",
    hireDate: "",
    institutionSlug: slug,
    maritalStatus: "",
    birthDate: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
    contractType: "",
  })

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = { ...form }
      const res = await fetch(`${BaseUrl}/api/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Failed to add employee")
      toast.success(t("employees.toast.addSuccess"))
      setOpen(false)
      setForm({
        name: "",
        phoneNumber: "",
        address: "",
        role: "",
        gender: "",
        hireDate: "",
        institutionSlug: slug,
        maritalStatus: "",
        birthDate: "",
        emergencyContactName: "",
        emergencyContactRelation: "",
        emergencyContactPhone: "",
        contractType: "",
      })
    } catch {
      toast.error(t("employees.toast.addError"))
    }
  }
  const fetchData = async () => {     
    try {
      setLoading(true);
      if (!slug) {
        toast.error(t("employees.toast.missingSlug"));
        setLoading(false);
        return; // رح يمرّ على finally ويطفي اللودينغ
      }
      // Fetch shifts once outside Promise.all
      const insRes = await fetchInstitution(slug as string);
      if (!insRes.ok) {
        toast.error(insRes.data?.message ?? `Failed to load institution (HTTP ${insRes.status})`);
           // صفّر المفتاح حتى ما تمرّره للتبويبات
        return;                        // finally رح يشتغل ويطفي اللودينغ
      }
      
      //const uniqueKey = insRes.data.uniqueKey;
      

      const data = await fetchEmployees(slug)
      const dataShifts = await fetchShifts(slug)

      setShiftOptions(dataShifts)
      if (dataShifts.length > 0) {
        setSelectedShift(dataShifts[0].id)   // 👈 أول شيفت
      } else {
        setSelectedShift("all")              // 👈 fallback
      }
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
    selectedShift === "all" ? employees : employees.filter((emp) => emp.shiftId === selectedShift && emp.status === "active")

  const handleViewDetails = (employeeId: string) => {
    setEmployeeId(employeeId);
    router.push(`/dashboard/institution/${slug}/employees/${employeeId}/details`)
  }

  return (
    <div className="container mx-auto p-4 space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight  text-gray-800">
          {t("employees.title")}
        </h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Users className="h-5 w-5 text-muted-foreground hidden sm:block" />
          <Select value={selectedShift} onValueChange={setSelectedShift}>
            <SelectTrigger className="w-full sm:w-[200px]" aria-label="Select shift">
              <SelectValue placeholder={t("employees.filter.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("employees.filter.all")}
              </SelectItem>
              {shiftOptions.map((shift) => (
                <SelectItem key={shift.id} value={shift.id}>
                  {shift.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setOpen(true)}>
            {t("employees.add.button")}
          </Button>
        </div>
        
      </div>

      {loading ? (
        <EmployeeListSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 p-6 text-center">
          <p className="text-destructive">
            {t("employees.error")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{employee.name}</CardTitle>
                  <Badge 
                    variant={
                      employee.status === "active" ? "secondary" :
                      employee.status === "resigned" ? "destructive" :
                      employee.status === "suspended" ? "outline" :
                      "default"
                    }
                    className="w-fit"
                  >
                    {employee.role} – {employee.status}
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
                      <p className="text-sm font-medium">
                        {t("employees.card.totalHours")}
                      </p>
                      <p className="text-2xl font-bold">{employee.totalHours ?? "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => handleViewDetails(employee.id)} className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 transition-all border-0"
                  >
                    {t("employees.card.viewDetails")}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center p-10 border rounded-lg bg-muted/20">
              <Users className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                {t("employees.empty")}
              </p>
            </div>
          )}
        </>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("employees.dialog.title")}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                {t("employees.section.basic")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t("employees.field.name")}</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>{t("employees.field.phone")}</Label>
                  <Input
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    {t("employees.field.address")}
                  </label>
                  <Input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder={t("employees.field.address.placeholder")}
                  />
                </div>

                <div>
                  <Label>{t("employees.field.role")}</Label>
                  <Input
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </div>

                <div>
                  <Label>{t("employees.field.gender")}</Label>
                  <Select
                    value={form.gender}
                    onValueChange={(val) => setForm({ ...form, gender: val })}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("employees.field.gender.placeholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">
                        {t("employees.field.gender.male")}
                      </SelectItem>
                      <SelectItem value="female">
                        {t("employees.field.gender.female")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t("employees.field.birthDate")}</Label>
                  <Input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label>{t("employees.field.maritalStatus")}</Label>
                  <Select
                    value={form.maritalStatus}
                    onValueChange={(val) => setForm({ ...form, maritalStatus: val })}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "employees.field.maritalStatus.placeholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">
                        {t("employees.field.maritalStatus.single")}
                      </SelectItem>
                      <SelectItem value="married">
                        {t("employees.field.maritalStatus.married")}
                      </SelectItem>
                      <SelectItem value="divorced">
                        {t("employees.field.maritalStatus.divorced")}
                      </SelectItem>
                      <SelectItem value="widowed">
                        {t("employees.field.maritalStatus.widowed")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                {t("employees.section.employment")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t("employees.field.hireDate")}</Label>
                  <Input
                    type="date"
                    value={form.hireDate}
                    onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label>{t("employees.field.contractType")}</Label>
                  <Select
                    value={form.contractType}
                    onValueChange={(val) => setForm({ ...form, contractType: val })}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          "employees.field.contractType.placeholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">
                        {t("employees.field.contractType.permanent")}
                      </SelectItem>
                      <SelectItem value="temporary">
                        {t("employees.field.contractType.temporary")}
                      </SelectItem>
                      <SelectItem value="intern">
                        {t("employees.field.contractType.intern")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                {t("employees.section.emergency")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t("employees.field.emergency.name")}</Label>
                  <Input
                    value={form.emergencyContactName}
                    onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                  />
                </div>

                <div>
                  <Label>{t("employees.field.emergency.relation")}</Label>
                  <Input
                    value={form.emergencyContactRelation}
                    onChange={(e) => setForm({ ...form, emergencyContactRelation: e.target.value })}
                    placeholder={t(
                      "employees.field.emergency.relation.placeholder"
                    )}
                  />
                </div>

                <div>
                  <Label>{t("employees.field.emergency.phone")}</Label>
                  <Input
                    value={form.emergencyContactPhone}
                    onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full sm:w-auto">
                {t("employees.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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

