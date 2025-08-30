"use client"

import { useState, useEffect, useMemo } from "react"
import { List, Grid, Building2, Users, Shield, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {  TooltipProvider,  } from "@/components/ui/tooltip";
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
import { RoleManagement } from "./role-management"
import UserMenu from "./userMenu"




type InstitutionData = {
  id: number
  name: string
  address: string
  uniqueKey?: string
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
      const res = await fetch(`${BaseUrl}/api/v1/admins/me`, { credentials: 'include',  });
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

  const handleCardClick = async (slug: string, uniqueKey: string) => {
    try {
      if (cardClickGuardRef.current) {
        cardClickGuardRef.current = false; // استهلك الحارس
        return; // لا تروح على الداشبورد
      }

      localStorage.setItem('institutionKey', uniqueKey);
      // أو إذا بدك تجيب مباشرة من localStorage

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
        {/* SVG background code */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <defs>
              {/* Soft diagonal gradient */}
              <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#eef3f8" />
                <stop offset="100%" stopColor="#dbe6f3" />
              </linearGradient>

              {/* Very subtle grid */}
              <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M64 0H0V64" fill="none" stroke="#1e3a8a" strokeOpacity="0.04" strokeWidth="1" />
              </pattern>

              {/* Gentle wave gradient */}
              <linearGradient id="wave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>

              {/* Glow blobs */}
              <radialGradient id="blobBlue" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="blobTeal" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Base gradient */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" />

            {/* Subtle grid overlay */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />

            {/* Soft blobs (top-right / bottom-left) */}
            <circle cx="82%" cy="18%" r="280" fill="url(#blobBlue)" />
            <circle cx="12%" cy="78%" r="220" fill="url(#blobTeal)" />

            {/* Abstract waves (bottom) */}
            <path d="M0,70% C20%,66% 32%,76% 50%,72% C68%,68% 80%,76% 100%,72% L100%,100% L0,100% Z" fill="url(#wave)" />
            <path d="M0,78% C18%,74% 36%,86% 52%,82% C70%,78% 86%,88% 100%,82% L100%,100% L0,100% Z" fill="url(#wave)" />

            {/* Faint, relevant icons */}
            <g opacity="0.06" fill="none" stroke="#0f172a" strokeWidth="2">
              {/* Calendar (top-left) */}
              <rect x="7%" y="12%" rx="10" ry="10" width="140" height="110" />
              <line x1="7%" y1="18%" x2="16.5%" y2="18%" />
              <line x1="9%" y1="12%" x2="9%" y2="18%" />
              <line x1="14%" y1="12%" x2="14%" y2="18%" />
              <rect x="8.5%" y="21%" width="18" height="14" rx="3" />
              <rect x="11.5%" y="21%" width="18" height="14" rx="3" />
              <rect x="14.5%" y="21%" width="18" height="14" rx="3" />
              <rect x="8.5%" y="24%" width="18" height="14" rx="3" />
              <rect x="11.5%" y="24%" width="18" height="14" rx="3" />

              {/* Clock (right side) */}
              <circle cx="88%" cy="36%" r="70" />
              <line x1="88%" y1="36%" x2="88%" y2="26%" />
              <line x1="88%" y1="36%" x2="94%" y2="36%" />

              {/* Building (bottom-right) */}
              <rect x="78%" y="68%" width="220" height="140" rx="8" />
              <rect x="80%" y="72%" width="28" height="28" rx="4" />
              <rect x="84%" y="72%" width="28" height="28" rx="4" />
              <rect x="88%" y="72%" width="28" height="28" rx="4" />
              <rect x="80%" y="78%" width="28" height="28" rx="4" />
              <rect x="84%" y="78%" width="28" height="28" rx="4" />
              <rect x="88%" y="78%" width="28" height="28" rx="4" />
              <rect x="92%" y="78%" width="28" height="60" rx="4" />
            </g>
          </svg>
        </div>
        <Circles height="80" width="80" color="#002E3BFF" ariaLabel="loading" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 space-y-6 ">
      {/* SVG background code */}
      <div className="pointer-events-none fixed inset-0 -z-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <defs>
              {/* Soft diagonal gradient */}
              <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#eef3f8" />
                <stop offset="100%" stopColor="#dbe6f3" />
              </linearGradient>

              {/* Very subtle grid */}
              <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M64 0H0V64" fill="none" stroke="#1e3a8a" strokeOpacity="0.04" strokeWidth="1" />
              </pattern>

              {/* Gentle wave gradient */}
              <linearGradient id="wave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>

              {/* Glow blobs */}
              <radialGradient id="blobBlue" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="blobTeal" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Base gradient */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" />

            {/* Subtle grid overlay */}
            <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />

            {/* Soft blobs (top-right / bottom-left) */}
            <circle cx="82%" cy="18%" r="280" fill="url(#blobBlue)" />
            <circle cx="12%" cy="78%" r="220" fill="url(#blobTeal)" />

            {/* Abstract waves (bottom) */}
            <path d="M0,70% C20%,66% 32%,76% 50%,72% C68%,68% 80%,76% 100%,72% L100%,100% L0,100% Z" fill="url(#wave)" />
            <path d="M0,78% C18%,74% 36%,86% 52%,82% C70%,78% 86%,88% 100%,82% L100%,100% L0,100% Z" fill="url(#wave)" />

            {/* Faint, relevant icons */}
            <g opacity="0.06" fill="none" stroke="#0f172a" strokeWidth="2">
              {/* Calendar (top-left) */}
              <rect x="7%" y="12%" rx="10" ry="10" width="140" height="110" />
              <line x1="7%" y1="18%" x2="16.5%" y2="18%" />
              <line x1="9%" y1="12%" x2="9%" y2="18%" />
              <line x1="14%" y1="12%" x2="14%" y2="18%" />
              <rect x="8.5%" y="21%" width="18" height="14" rx="3" />
              <rect x="11.5%" y="21%" width="18" height="14" rx="3" />
              <rect x="14.5%" y="21%" width="18" height="14" rx="3" />
              <rect x="8.5%" y="24%" width="18" height="14" rx="3" />
              <rect x="11.5%" y="24%" width="18" height="14" rx="3" />

              {/* Clock (right side) */}
              <circle cx="88%" cy="36%" r="70" />
              <line x1="88%" y1="36%" x2="88%" y2="26%" />
              <line x1="88%" y1="36%" x2="94%" y2="36%" />

              {/* Building (bottom-right) */}
              <rect x="78%" y="68%" width="220" height="140" rx="8" />
              <rect x="80%" y="72%" width="28" height="28" rx="4" />
              <rect x="84%" y="72%" width="28" height="28" rx="4" />
              <rect x="88%" y="72%" width="28" height="28" rx="4" />
              <rect x="80%" y="78%" width="28" height="28" rx="4" />
              <rect x="84%" y="78%" width="28" height="28" rx="4" />
              <rect x="88%" y="78%" width="28" height="28" rx="4" />
              <rect x="92%" y="78%" width="28" height="60" rx="4" />
            </g>
          </svg>
        </div>
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
        <div className="flex items-center gap-2">
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
          <UserMenu />
        </div>
        
      </div>
  
      {isSuperAdmin ? (
        // --- Super Admin Dashboard ---
        <Tabs defaultValue="organizations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="organizations">Institutions</TabsTrigger>
            <TabsTrigger value="managersRoles">Manage Mangers & Roles</TabsTrigger>
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
                        onClick={() => handleCardClick(institution.slug,institution.uniqueKey!)}
                      >
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </InstitutionCard>
                      
                       {/* Owner chip (top-left) */}
                      {/* {isOwnerOf(institution.id) && (
                        <Badge
                          variant="secondary"
                          className="absolute left-3 top-3 z-20 flex items-center gap-1 pointer-events-none"
                        >
                          <Crown className="h-3.5 w-3.5" />
                          Owner
                        </Badge>
                      )}  
                      {/* Manage admins icon (top-right) — only for owners 
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
                        
                      )} */}

                      </div>
                      
                    </motion.div>
                  ))}
                </div>
                </TooltipProvider>
              </div>
            )}
          </TabsContent>
          {/* --- Tab: Manage Managers --- */}
          <TabsContent value="managersRoles" >
            <Card className="py-6 mt-6">
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
            <Tabs defaultValue="managersRoles" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 mt-6">
                <TabsTrigger value="managers">Manage Managers</TabsTrigger>
                <TabsTrigger value="roles">Manage Roles</TabsTrigger>
              </TabsList>
              
              <TabsContent value="managers" className="py-6">
              {selectedInstitution && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Managers Management</h2>
                      <p className="text-muted-foreground">Manage managers' roles across the institution</p>
                      </div>
                      {/* زر فتح الدialog */}
                      <AddAdminDialog
                        institutionId={selectedInstitution}
                        isSuperAdmin={isSuperAdmin}
                        canAssignOwner={false} 
                        onDone={() => adminListRef.current?.reload?.()}
                      />
                  </div>
                  <Providers>
                    <AdminList institutionId={selectedInstitution!} />
                  </Providers>
                  
                  </div>
                )}
              </TabsContent>
              <TabsContent value="roles" className="py-6">
                <RoleManagement  institutionId={selectedInstitution!}  /> 
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      ) : isOwner ? (
        // --- Owner Dashboard (إدارة مشرفين مؤسسته فقط) ---
        <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations">
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
                      onClick={() => handleCardClick(institution.slug,institution.uniqueKey!)} // فتح dashboard بالمؤسسة
                    >
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </InstitutionCard>

                    {/* شارة مالك */}
                    {isOwnerOf(institution.id) && (
                      <Badge
                        variant="secondary"
                        className="absolute left-3 top-3 z-30 flex items-center gap-1 h-6 px-2 text-xs rounded-full bg-background/80 backdrop-blur border pointer-events-none shadow"
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
                        onPointerDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        // لا تعمل preventDefault هون
                        onPointerUp={(e) => {
                          e.preventDefault() // امنع التصرف الافتراضي هون
                          e.stopPropagation() // وامنـع الانتشار
                          cardClickGuardRef.current = true
                          setSelectedInstitutionForManage(institution.id)
                          setManageOpen(true)
                          console.log("institution.id by press button", institution.id)
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation()
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
        </TabsContent>

        <TabsContent value="roles" className="py-6">
          <RoleManagement />
        </TabsContent>
      </Tabs>
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
                      onClick={() => handleCardClick(institution.slug,institution.uniqueKey!)}
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
