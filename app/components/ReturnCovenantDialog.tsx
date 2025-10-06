import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'

const BaseUrl = process.env.NEXT_PUBLIC_API_URL

interface ReturnCovenantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  covenantId: number
  onUpdated: () => void
}

export default function ReturnCovenantDialog({ open, onOpenChange, covenantId, onUpdated }: ReturnCovenantDialogProps) {
  const [assignmentId, setAssignmentId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const slug = window.location.pathname.split('/')[2]
      const res = await fetch(`${BaseUrl}/institutions/${slug}/covenants/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ covenantId: Number(covenantId) }),
      })
      if (!res.ok) throw new Error('Failed to return covenant')
      toast.success('Covenant returned successfully')
      onUpdated()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error('Error returning covenant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Return Covenant</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Assignment ID"
            value={assignmentId}
            onChange={(e) => setAssignmentId(e.target.value)}
            required
          />

          <DialogFooter>
            <Button type="submit" disabled={loading || covenantId != Number(assignmentId)}>
              {loading ? 'Returning...' : 'Confirm Return'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}