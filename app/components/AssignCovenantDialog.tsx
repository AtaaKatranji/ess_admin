import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { toast } from 'react-toastify'
import { Employee } from '../types/Employee'
import { fetchEmployees } from '../api/employees/employeeId'
const BaseUrl = process.env.NEXT_PUBLIC_API_URL

interface AssignCovenantDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  covenantId: number
  onUpdated: () => void
}

export default function AssignCovenantDialog({ open, onOpenChange, covenantId, onUpdated }: AssignCovenantDialogProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeId, setEmployeeId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const slug = window.location.pathname.split('/')[2]


  useEffect(() => {
    if (open) fetchEmployees(slug).then(setEmployees)
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeId) {
      toast.warn('Please select an employee')
      return
    }
    try {
      setLoading(true)
      
      const res = await fetch(`${BaseUrl}/institutions/${slug}/covenants/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ covenantId, employeeId: Number(employeeId), notes }),
      })
      if (!res.ok) throw new Error('Failed to assign covenant')
      toast.success('Covenant assigned successfully')
      onUpdated()
      onOpenChange(false)
    } catch (err) {
      console.error(err)
      toast.error('Error assigning covenant')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Covenant to Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Covenant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
