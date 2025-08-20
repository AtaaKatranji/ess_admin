"use client"

import { useState, useEffect, useMemo } from "react"
import { List, Grid, Building2, Users, Shield, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import InstitutionCard from "@/app/components/InstitutionCard"
import { fetchInstitutionsByAdmin } from "@/app/api/institutions/institutions"
import { toast, ToastContainer } from "react-toastify"
import AddInstitutionDialog from "@/app/ui/Addinstitution"
import { useRouter } from "next/navigation"
import { Circles } from "react-loader-spinner"
import { motion } from "framer-motion"
import { parseCookies, setCookie } from "nookies"
import  AdminList  from "@/app/components/admin-list"
import AddAdminDialog from "./AddAdminDialog"
import React from "react"
import Providers from "../providers"


type InstitutionData = {
  id: number
  name: string
  address: string
  keyNumber?: string
  macAddresses?: { wifiName: string; mac: string }[]
  image?: string
  slug: string
  role: string      
  roleId: string      
}
interface User {
  id: string;
  name: string;
  globalRole: "superAdmin" | "regular"; 
}
export function AdminDashboard() {
  const navigate = useRouter()
  const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "grid">("list")
  const [institutions, setInstitutions] = useState<InstitutionData[]>([]);
  const [admin, setAdmin] = useState<User | null>(null);
  // const [adminId, setAdminId] = useState<string | null>(null)
  // const [userRole, setUserRole] = useState<UserRole>("manger") // Added user role state
  const [selectedInstitution, setSelectedInstitution] = useState<number | null>(null)
  



  const [adminInstitutions, setAdminInstitutions] = useState<InstitutionData[]>([]);
  const [ownerSet, setOwnerSet] = useState<Set<number>>(new Set());
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedInstitutionForManage, setSelectedInstitutionForManage] = useState<number | null>(null);
  

  const adminListRef = React.useRef<{ reload?: () => void }>(null)
  const cardClickGuardRef = React.useRef(false);
  
  useEffect(() => {
    const run = async () => {
      const res = await fetch(`${BaseUrl}/api/v1/admins/me`, { credentials: 'include' });
      if (!res.ok) {
        // مش مسجّل → رجّعه على صفحة اللوجين
        navigate.replace('/login');
        return;
      }
      const { user } = await res.json();
      // خزّن user (id, role, name...)
      setAdmin(user);
    };
    run();
  }, []);


  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const params = new URLSearchParams(window.location.search)
  //     const urlAdminId = params.get("adminId")
  //     console.log("urlAdminId", urlAdminId)
  //     const role = (params.get("role") as UserRole) || "manger" // Default to admin if not specified
  //     setAdminId(urlAdminId)
  //     setUserRole(role)
  //   }
  // }, [])

  const fetchData = async () => {
    if (!admin?.id) {
      console.error("No adminId available")
      setLoading(false)
      toast.error("Admin ID not found. Please log in again.")
      return
    }

    try {
      const data :InstitutionData[] = await fetchInstitutionsByAdmin()
      setAdminInstitutions(data || []);
      setInstitutions(data || []);
      // Auto-select first institution for admin users
      const ownedIds = data
        .filter((x) => x?.role?.toLowerCase() === "owner")
        .map((x) => x.id);
        console.log("ownedIds",ownedIds)
      const owned = new Set<number>(ownedIds);
      setOwnerSet(owned);
      console.log("owned",owned)

      // Auto-open if the user owns exactly one institution
      if (ownedIds.length === 1) {
        setSelectedInstitutionForManage(ownedIds[0]);
        setSelectedInstitution(ownedIds[0]);
        setManageOpen(true);
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

    if (admin?.id) {
      fetchData()
    }
  }, [admin?.id, admin?.globalRole])

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
      if (cardClickGuardRef.current) {
        cardClickGuardRef.current = false; // استهلك الحارس
        return; // لا تروح على الداشبورد
      }
      navigate.push(`/dashboard/institution/${slug}`)
    } catch (error) {
      toast.error(`Error navigating to institution: ${error}`)
    }
  }

  const handleInstitutionSelect = (institutionId: number) => {
    setSelectedInstitution(institutionId)
  }

  const isSuperAdmin = admin?.globalRole === "superAdmin"
  const isOwner = !isSuperAdmin && ownerSet.size > 0;
  const isOwnerOf = (institutionId: number) => ownerSet.has(institutionId);
  const selectedInstitutionObj = useMemo(
    () => adminInstitutions.find((i: InstitutionData) => i.id === selectedInstitutionForManage) ?? null,
    [adminInstitutions, selectedInstitutionForManage]
  );


  // console.log("selectedInstitution",selectedInstitution)
  // console.log("institutions",institutions)
  // const currentInstitution = institutions.find((i) => i.id === selectedInstitution)
  // console.log("currentInstitution",currentInstitution)
  // const isOwner = currentInstitution?.role === "owner"

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-white/60">
        <Circles height="80" width="80" color="#002E3BFF" ariaLabel="loading" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 space-y-6 ">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800 ">
            {isSuperAdmin
              ? "Super Admin Dashboard"
              : isOwner
              ? "Owner Dashboard"
              : "Manager Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {isSuperAdmin
              ? "Manage organizations and administrators across all institutions"
              : isOwner
              ? "Manage managers inside your institution"
              : "View your assigned institutions"}
          </p>
        </div>
        <Badge
          variant={isSuperAdmin ? "default" : isOwner ? "outline" : "secondary"}
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          {isSuperAdmin
            ? "Super Admin"
            : isOwner
            ? "Owner"
            : "Manager"}
        </Badge>
      </div>
  
      {isSuperAdmin ? (
        // --- Super Admin Dashboard ---
        <Tabs defaultValue="organizations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="managers">Manage Managers</TabsTrigger>
          </TabsList>
  
          {/* --- Tab: Organizations --- */}
          <TabsContent value="organizations">
            {institutions.length === 0 ? (
              <div className="min-h-[400px] grid place-items-center">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Welcome to ESS</h2>
                  <p className="text-lg text-muted-foreground">
                    No institutions available yet.
                  </p>
                  <AddInstitutionDialog
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
                    onSuccess={async () => {
                      toast.success("Institution added successfully", {
                        autoClose: 2500,
                      })
                      await fetchData()
                    }}
                  />
                </div>
  
                {/* Switch View (Grid/List) */}
                <div className="flex flex-wrap gap-2 space-x-2">
                  <Button
                    variant={view === "grid" ? "default" : "outline"}
                    onClick={() => handleViewChange("grid")}
                  >
                    <Grid className="mr-2 h-4 w-4" /> Grid View
                  </Button>
                  <Button
                    variant={view === "list" ? "default" : "outline"}
                    onClick={() => handleViewChange("list")}
                  >
                    <List className="mr-2 h-4 w-4" /> List View
                  </Button>
                </div>

                <TooltipProvider> 
                <div
                  className={
                    view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}
                >
                  {institutions.map((institution) => (
                    <motion.div
                      className="my-2"
                      key={institution.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="relative">
                      <InstitutionCard
                        name={institution.name}
                        address={institution.address}
                        onClick={() => handleCardClick(institution.slug)}
                      >
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </InstitutionCard>
                      
                       {/* Owner chip (top-left) */}
                      {isOwnerOf(institution.id) && (
                        <Badge
                          variant="secondary"
                          className="absolute left-3 top-3 z-20 flex items-center gap-1 pointer-events-none"
                        >
                          <Crown className="h-3.5 w-3.5" />
                          Owner
                        </Badge>
                      )}  
                      {/* Manage admins icon (top-right) — only for owners */}
                      {isOwnerOf(institution.id) && (
                        
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-3 top-3 z-20"
                                aria-label="Manage admins"
                                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                onKeyDown={(e) => { e.stopPropagation(); }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  cardClickGuardRef.current = true; // فعّل الحارس
                                  setSelectedInstitutionForManage(institution.id);
                                  setManageOpen(true);
                                  console.log("institution.id by press button",institution.id)
                                }}
                                
                              >
                                <Users className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Manage admins</TooltipContent>
                          </Tooltip>
                        
                      )}
                      </div>
                      
                    </motion.div>
                  ))}
                </div>
                </TooltipProvider>
              </div>
            )}
          </TabsContent>
  
          {/* --- Tab: Manage Managers --- */}
          <TabsContent value="managers" className="py-6">
            <Card className="py-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span className="text-gray-800">Select Organization</span>
                </CardTitle>
                <CardDescription>
                  Choose an organization to manage its administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  {institutions.map((institution) => (
                    <Button
                      key={institution.id}
                      variant={
                        selectedInstitution === institution.id ? "default" : "outline"
                      }
                      onClick={() => handleInstitutionSelect(institution.id)}
                    >
                      {institution.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
  
            {selectedInstitution && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Managers for Institution #{selectedInstitution}</h3>
                  {/* زر فتح الدialog */}
                  <AddAdminDialog
                    institutionId={selectedInstitution}
                    isSuperAdmin={isSuperAdmin}
                    canAssignOwner={false} 
                    onDone={() => adminListRef.current?.reload?.()}
                  />
              </div>
              <Providers>
                <AdminList institutionId={selectedInstitutionForManage!} />
              </Providers>
              
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : isOwner ? (
        // --- Owner Dashboard (إدارة مشرفين مؤسسته فقط) ---
        <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ color: "#002E3BFF" }}>
            Your Organizations
          </h2>
        </div>
    
        <div className="flex space-x-2">
          <Button
            variant={view === "grid" ? "default" : "outline"}
            onClick={() => handleViewChange("grid")}
          >
            <Grid className="mr-2 h-4 w-4" /> Grid View
          </Button>
          <Button
            variant={view === "list" ? "default" : "outline"}
            onClick={() => handleViewChange("list")}
          >
            <List className="mr-2 h-4 w-4" /> List View
          </Button>
        </div>
    
        <div
          className={view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-2"}
        >
          {institutions.map((institution) => (
            <motion.div
              className="my-2 relative"
              key={institution.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative ">
                <InstitutionCard
                  name={institution.name}
                  address={institution.address}
                  onClick={() => handleCardClick(institution.slug)} // فتح dashboard بالمؤسسة
                >
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </InstitutionCard>
    
                {/* شارة مالك */}
                {isOwnerOf(institution.id) && (
                  <Badge
                    variant="secondary"
                    className="absolute left-2 top-2 flex items-center gap-1 pointer-events-none"
                  >
                    <Crown className="h-3.5 w-3.5" />
                    Owner
                  </Badge>
                )}
    
                {/* زر إدارة المشرفين للمالك */}
                {isOwnerOf(institution.id) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2  z-20 pointer-events-auto"
                    aria-label="Manage admins"
                    onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onKeyDown={(e) => { e.stopPropagation(); }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      cardClickGuardRef.current = true; // فعّل الحارس
                      setSelectedInstitutionForManage(institution.id);
                      setManageOpen(true);
                      console.log("institution.id by press button",institution.id)
                    }}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      ) : (
        // --- Manager Dashboard (عرض المؤسسات فقط) ---
        <div>
          {institutions.length === 0 ? (
            <div className="min-h-[400px] grid place-items-center">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Welcome to ESS</h2>
                <p className="text-lg text-muted-foreground">
                  No institutions assigned to you yet.
                </p>
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
                <Button
                  variant={view === "grid" ? "default" : "outline"}
                  onClick={() => handleViewChange("grid")}
                >
                  <Grid className="mr-2 h-4 w-4" /> Grid View
                </Button>
                <Button
                  variant={view === "list" ? "default" : "outline"}
                  onClick={() => handleViewChange("list")}
                >
                  <List className="mr-2 h-4 w-4" /> List View
                </Button>
              </div>
  
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-2"
                }
              >
                {institutions.map((institution) => (
                  <motion.div
                    className="my-2"
                    key={institution.id}
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
  {/* One global Sheet instance — opened via per-card icon, auto-open if exactly one owned */}
  {selectedInstitutionForManage !== null && (
        <Sheet open={manageOpen} onOpenChange={(open) => {
          setManageOpen(open);
          if (!open) {
            // إذا بتحب ترجع الحالة فاضية
            setSelectedInstitutionForManage(null);
          }
        }}>
          <SheetContent side="right" className="w-full sm:max-w-xl">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Manage Admins
              </SheetTitle>
              <SheetDescription>Owners can add or remove admins and change their roles for this institution.</SheetDescription>
            </SheetHeader>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedInstitutionObj ? (
                  <>
                    <span className="font-medium">{selectedInstitutionObj.name}</span>
                    <span className="ml-2 opacity-70">#{selectedInstitutionObj.id}</span>
                  </>
                ) : (
                  <>Institution #{selectedInstitutionForManage}</>
                )}
              </div>

              <AddAdminDialog
                institutionId={selectedInstitutionForManage}
                isSuperAdmin={false}
                canAssignOwner={false}
                onDone={() => adminListRef.current?.reload?.()}
              />
            </div>

            <div className="mt-4">
              <Providers>
                 <AdminList institutionId={selectedInstitutionForManage!} />
              </Providers>
            </div>
          </SheetContent>
        </Sheet>
      )}
      <ToastContainer />
    </div>
  )
  
}
