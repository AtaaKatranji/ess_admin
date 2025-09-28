"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

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

  // 🔹 fetch resignations
  const fetchResignations = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/institutions/${orgSlug}/resignations`)
      const data = await res.json()
      setResignations(data)
    } catch  {
      toast.error("Failed to load resignations")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResignations()
  }, [orgSlug])

  // 🔹 approve/reject
  const handleAction = async (id: number, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/institutions/${orgSlug}/resignations/${id}/${action}`, {
        method: "PATCH",
      })
      if (!res.ok) throw new Error("Action failed")
      toast.success(`Resignation ${action}d`)
      fetchResignations()
    } catch {
      toast.error("Error while updating resignation")
    }
  }

  // 🔹 delete resignation
  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/institutions/${orgSlug}/resignations/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Delete failed")
      toast.success("Resignation deleted")
      fetchResignations()
    } catch {
      toast.error("Error deleting resignation")
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Resignation Requests</h2>

      <div className="border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Reason</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resignations.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-2">{r.employeeName}</td>
                <td className="px-4 py-2">{new Date(r.resignationDate).toLocaleDateString()}</td>
                <td className="px-4 py-2">{r.reason || "—"}</td>
                <td className="px-4 py-2">
                  <Badge
                    variant={
                      r.status === "Rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {r.status}
                  </Badge>
                </td>
                <td className="px-4 py-2 space-x-2">
                  {r.status === "Pending" && (
                    <>
                      <Button size="sm" onClick={() => handleAction(r.id, "approve")}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleAction(r.id, "reject")}>
                        Reject
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleDelete(r.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
