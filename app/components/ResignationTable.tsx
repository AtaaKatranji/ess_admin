"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import {  Check, X } from "lucide-react"
const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
type Resignation = {
  id: number
  employeeName: string
  resignationDate: string
  reason: string | null
  status: "Pending" | "Approved" | "Rejected"
}

interface Props {
  orgSlug: string
}

export default function ResignationTable({ orgSlug }: Props) {
  const [resignations, setResignations] = useState<Resignation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchResignations = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BaseUrl}/institutions/${orgSlug}/resignations`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json()
      setResignations(data)
    } catch {
      toast.error("Failed to load resignations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResignations()
  }, [orgSlug])

  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      const res = await fetch(`${BaseUrl}/institutions/${orgSlug}/resignations/${id}/${action}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
      if (!res.ok) throw new Error("Action failed")
      toast.success(`Resignation ${action}d`)
      fetchResignations()
    } catch {
      toast.error("Error while updating resignation")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${BaseUrl}/institutions/${orgSlug}/resignations/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
      if (!res.ok) throw new Error("Delete failed")
      toast.success("Resignation deleted")
      fetchResignations()
    } catch {
      toast.error("Error deleting resignation")
    }
  }

  if (loading) return <p>Loading...</p>

  const pending = resignations.filter((r) => r.status === "Pending")
  const approved = resignations.filter((r) => r.status === "Approved")
  const rejected = resignations.filter((r) => r.status === "Rejected")

  return (
    <div className="space-y-6">
     

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-4">
          <TabsTrigger value="pending">
            Pending {pending.length > 0 && <span className="ml-1">({pending.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved {approved.length > 0 && <span className="ml-1">({approved.length})</span>}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected {rejected.length > 0 && <span className="ml-1">({rejected.length})</span>}
          </TabsTrigger>
        </TabsList>

        {/* Pending */}
        <TabsContent value="pending" className="space-y-4">
          {pending.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No pending resignations</div>
          ) : (
            pending.map((r) => (
              <Card key={r.id} className="overflow-hidden">
                <CardHeader className="flex justify-between items-center bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{r.employeeName}</span>
                    <Badge variant="outline">{r.status}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(r.resignationDate).toLocaleDateString()}
                  </span>
                </CardHeader>
                <CardContent className="px-4 py-3">
                  <p className="text-sm">
                    <span className="font-medium">Reason:</span> {r.reason || "—"}
                  </p>
                </CardContent>
                <CardFooter className="px-4 py-3 border-t flex justify-end gap-2 bg-muted/20">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive hover:bg-destructive/10"
                    onClick={() => handleAction(r.id, "reject")}
                  >
                    <X className="mr-1 h-4 w-4" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => handleAction(r.id, "approve")}>
                    <Check className="mr-1 h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}>
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Approved */}
        <TabsContent value="approved" className="space-y-4">
          {approved.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No approved resignations</div>
          ) : (
            approved.map((r) => (
              <Card key={r.id} className="overflow-hidden">
                <CardHeader className="flex justify-between items-center bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{r.employeeName}</span>
                    <Badge variant="secondary">{r.status}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(r.resignationDate).toLocaleDateString()}
                  </span>
                </CardHeader>
                <CardContent className="px-4 py-3">
                  <p className="text-sm">
                    <span className="font-medium">Reason:</span> {r.reason || "—"}
                  </p>
                </CardContent>
                <CardFooter className="px-4 py-3 border-t flex justify-end gap-2 bg-muted/20">
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}>
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Rejected */}
        <TabsContent value="rejected" className="space-y-4">
          {rejected.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No rejected resignations</div>
          ) : (
            rejected.map((r) => (
              <Card key={r.id} className="overflow-hidden">
                <CardHeader className="flex justify-between items-center bg-muted/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{r.employeeName}</span>
                    <Badge variant="destructive">{r.status}</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(r.resignationDate).toLocaleDateString()}
                  </span>
                </CardHeader>
                <CardContent className="px-4 py-3">
                  <p className="text-sm">
                    <span className="font-medium">Reason:</span> {r.reason || "—"}
                  </p>
                </CardContent>
                <CardFooter className="px-4 py-3 border-t flex justify-end gap-2 bg-muted/20">
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}>
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
