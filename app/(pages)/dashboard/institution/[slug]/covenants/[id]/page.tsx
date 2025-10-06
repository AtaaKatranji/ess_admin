'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { Covenant } from '@/app/types/Covenant'
import { CalendarDays, UserCheck, RotateCcw } from 'lucide-react'
import AssignCovenantDialog from '@/app/components/AssignCovenantDialog'
import ReturnCovenantDialog from '@/app/components/ReturnCovenantDialog'

const BaseUrl = process.env.NEXT_PUBLIC_API_URL

export default function CovenantDetailsPage() {
  const { slug, id } = useParams()
  const [covenant, setCovenant] = useState<Covenant | null>(null)
  const [loading, setLoading] = useState(false)
  const [isAssignOpen, setIsAssignOpen] = useState(false)
  const [isReturnOpen, setIsReturnOpen] = useState(false)

  const fetchCovenant = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BaseUrl}/institutions/${slug}/covenants/${id}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch covenant')
      const data = await res.json()
      setCovenant(data.covenant || data)
    } catch (err) {
      console.error(err)
      toast.error('Error loading covenant details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCovenant()
  }, [id])

  if (loading) return <p className="text-sm text-muted-foreground">Loading...</p>
  if (!covenant) return <p className="text-sm text-muted-foreground">No covenant found.</p>

  const statusColor =
    covenant.status === 'available'
      ? 'text-green-600 border-green-400'
      : covenant.status === 'assigned'
      ? 'text-blue-600 border-blue-400'
      : covenant.status === 'maintenance'
      ? 'text-yellow-600 border-yellow-400'
      : covenant.status === 'lost'
      ? 'text-red-600 border-red-400'
      : 'text-gray-500 border-gray-400'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border border-border/40 bg-muted/30">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{covenant.name}</h2>
            <p className="text-sm text-muted-foreground">Code: {covenant.code}</p>
          </div>
          <Badge variant="outline" className={`${statusColor} capitalize`}>
            {covenant.status}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          {covenant.category && (
            <p>
              <span className="text-muted-foreground font-medium">Category:</span>{' '}
              {covenant.category}
            </p>
          )}
          {covenant.location && (
            <p>
              <span className="text-muted-foreground font-medium">Location:</span>{' '}
              {covenant.location}
            </p>
          )}
          {covenant.condition && (
            <p>
              <span className="text-muted-foreground font-medium">Condition:</span>{' '}
              {covenant.condition}
            </p>
          )}
          {covenant.description && (
            <p>
              <span className="text-muted-foreground font-medium">Description:</span>{' '}
              {covenant.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-3">
            <Button
              variant="default"
              className="flex items-center gap-2"
              onClick={() => setIsAssignOpen(true)}
              disabled={covenant.status !== 'available'}
            >
              <UserCheck className="w-4 h-4" /> Assign Covenant
            </Button>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsReturnOpen(true)}
              disabled={covenant.status !== 'assigned'}
            >
              <RotateCcw className="w-4 h-4" /> Return Covenant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Info */}
      {(covenant.lastMaintenance || covenant.nextMaintenance) && (
        <Card className="border border-border/40 bg-muted/20">
          <CardHeader>
            <h3 className="font-semibold flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Maintenance Schedule
            </h3>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {covenant.lastMaintenance && (
              <p>
                <span className="text-muted-foreground font-medium">Last Maintenance:</span>{' '}
                {new Date(covenant.lastMaintenance).toLocaleDateString()}
              </p>
            )}
            {covenant.nextMaintenance && (
              <p>
                <span className="text-muted-foreground font-medium">Next Maintenance:</span>{' '}
                {new Date(covenant.nextMaintenance).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <AssignCovenantDialog open={isAssignOpen} onOpenChange={setIsAssignOpen} covenantId={covenant.id} onUpdated={fetchCovenant} />
      <ReturnCovenantDialog open={isReturnOpen} onOpenChange={setIsReturnOpen} covenantId={covenant.id} onUpdated={fetchCovenant} />
    </div>
  )
}
