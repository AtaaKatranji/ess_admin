"use client"

import { useState, useEffect } from "react"
import { List, Grid, Building2, Users, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import InstitutionCard from "@/app/components/InstitutionCard"
import { fetchInstitutionsByAdmin } from "@/app/api/institutions/institutions"
import { toast, ToastContainer } from "react-toastify"
import AddInstitutionDialog from "@/app/ui/Addinstitution"
import { useRouter } from "next/navigation"
import { Circles } from "react-loader-spinner"
import { motion } from "framer-motion"
import { parseCookies, setCookie } from "nookies"
import { AdminList } from "@/app/components/admin-list"

type UserRole = "admin" | "manger"

type InstitutionData = {
  _id: string
  adminId: string
  name: string
  address: string
  keyNumber: string
  macAddresses: { wifiName: string; mac: string }[]
  image: string
  slug: string
}

export function AdminDashboard() {
  const navigate = useRouter()
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "grid">("list")
  const [institutions, setInstitutions] = useState<InstitutionData[]>([])
  const [adminId, setAdminId] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<UserRole>("manger") // Added user role state
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const urlAdminId = params.get("adminId")
      console.log("urlAdminId", urlAdminId)
      const role = (params.get("role") as UserRole) || "manger" // Default to admin if not specified
      setAdminId(urlAdminId)
      setUserRole(role)
    }
  }, [])

  const fetchData = async () => {
    if (!adminId) {
      console.error("No adminId available")
      setLoading(false)
      toast.error("Admin ID not found. Please log in again.")
      return
    }

    try {
      const data = await fetchInstitutionsByAdmin(adminId)
      setInstitutions(data || [])
      // Auto-select first institution for admin users
      if (data && data.length > 0 && userRole === "admin") {
        setSelectedInstitution(data[0]._id)
      }
    } catch (error) {
      console.error("Error fetching institutions:", error)
      toast.error("Failed to load institutions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const cookies = parseCookies()
    const savedView = cookies.preferredView
    if (savedView) {
      setView(savedView as "list" | "grid")
    }

    if (adminId) {
      fetchData()
    }
  }, [adminId, userRole])

  const handleViewChange = (newView: "list" | "grid") => {
    setView(newView)
    setCookie(null, "preferredView", newView, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      secure: process.env.NODE_ENV === "production",
    })
  }

  const handleCardClick = async (slug: string) => {
    try {
      navigate.push(`/dashboard/institution/${slug}`)
    } catch (error) {
      toast.error(`Error navigating to institution: ${error}`)
    }
  }

  const handleInstitutionSelect = (institutionId: string) => {
    setSelectedInstitution(institutionId)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-white/60">
        <Circles height="80" width="80" color="#002E3BFF" ariaLabel="loading" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {userRole === "admin" ? "Super Admin Dashboard" : "Manger Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {userRole === "admin"
              ? "Manage organizations and administrators across all institutions"
              : "Manage your assigned institutions"}
          </p>
        </div>
        <Badge variant={userRole === "admin" ? "default" : "secondary"} className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          {userRole === "admin" ? "Super Admin" : "Manger"}
        </Badge>
      </div>

      {userRole === "admin" ? (
        <Tabs defaultValue="organizations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="managers">Manage Managers</TabsTrigger>
          </TabsList>

          <TabsContent value="organizations">
            {institutions.length === 0 ? (
              <div className="min-h-[400px] grid place-items-center">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Welcome to ESS</h2>
                  <p className="text-lg text-muted-foreground">No institutions available yet.</p>
                  <AddInstitutionDialog
                    //adminId={adminId}
                    onSuccess={async () => {
                      toast.success("Institution added successfully", {
                        autoClose: 2500,
                      })
                      await fetchData()
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold" style={{ color: "#002E3BFF" }}>
                    Organizations
                  </h2>
                  <AddInstitutionDialog
                    //adminId={adminId}
                    onSuccess={async () => {
                      toast.success("Institution added successfully", {
                        autoClose: 2500,
                      })
                      await fetchData()
                    }}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button variant={view === "grid" ? "default" : "outline"} onClick={() => handleViewChange("grid")}>
                    <Grid className="mr-2 h-4 w-4" /> Grid View
                  </Button>
                  <Button variant={view === "list" ? "default" : "outline"} onClick={() => handleViewChange("list")}>
                    <List className="mr-2 h-4 w-4" /> List View
                  </Button>
                </div>

                <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                  {institutions.map((institution) => (
                    <motion.div
                      className="my-2"
                      key={institution._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <InstitutionCard
                        name={institution.name}
                        address={institution.address}
                        onClick={() => handleCardClick(institution.slug)}
                      >
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </InstitutionCard>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="managers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Organization
                </CardTitle>
                <CardDescription>Choose an organization to manage its administrators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {institutions.map((institution) => (
                    <Button
                      key={institution._id}
                      variant={selectedInstitution === institution._id ? "default" : "outline"}
                      onClick={() => handleInstitutionSelect(institution._id)}
                    >
                      {institution.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {selectedInstitution && <AdminList institutionId={Number.parseInt(selectedInstitution)} />}
          </TabsContent>
        </Tabs>
      ) : (
        /* Regular admin view - only organizations */
        <div>
          {institutions.length === 0 ? (
            <div className="min-h-[400px] grid place-items-center">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Welcome to ESS</h2>
                <p className="text-lg text-muted-foreground">No institutions assigned to you yet.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold" style={{ color: "#002E3BFF" }}>
                  Your Organizations
                </h2>
              </div>

              <div className="flex space-x-2">
                <Button variant={view === "grid" ? "default" : "outline"} onClick={() => handleViewChange("grid")}>
                  <Grid className="mr-2 h-4 w-4" /> Grid View
                </Button>
                <Button variant={view === "list" ? "default" : "outline"} onClick={() => handleViewChange("list")}>
                  <List className="mr-2 h-4 w-4" /> List View
                </Button>
              </div>

              <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                {institutions.map((institution) => (
                  <motion.div
                    className="my-2"
                    key={institution._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <InstitutionCard
                      name={institution.name}
                      address={institution.address}
                      onClick={() => handleCardClick(institution.slug)}
                    >
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </InstitutionCard>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ToastContainer />
    </div>
  )
}
