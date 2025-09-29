// Description: A dialog component to confirm the resignation of an employee.
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { AlertTriangle } from "lucide-react"



interface ResignDialogProps {
  employeeName: string
  onConfirm: (resignReason: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ResignDialog({ employeeName, onConfirm, open, onOpenChange }: ResignDialogProps) {
  const [typedName, setTypedName] = useState("")
  const [reason, setReason] = useState("")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" /> Resign Employee
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            You are about to mark <span className="font-semibold text-slate-900">{employeeName}</span> as{" "}
            <span className="text-red-600 font-semibold">resigned</span>.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>The employee will no longer appear as active.</li>
            <li>Attendance, leaves, and other actions will be disabled.</li>
            <li>This action <strong>cannot be undone</strong>.</li>
          </ul>
          <p className="mt-2">
            To confirm, type <span className="font-semibold text-slate-900">{employeeName}</span> below:
          </p>
          <Input
            placeholder={`Type "${employeeName}"`}
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
          />
          <Input
            placeholder={`Reason (optional)`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={typedName !== employeeName}
            onClick={() => onConfirm(reason)}  
          >
            Confirm Resignation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

}

export default ResignDialog