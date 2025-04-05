// components/LeaveUpdateDialog.tsx
'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useState, ReactNode, SetStateAction } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LeaveUpdate {
  days: number;
  reason: string;
  timestamp: string;
}

interface LeaveUpdateDialogProps {
  initialDays: number;
  onUpdate: (update: LeaveUpdate) => void;
  editHistory?: LeaveUpdate[];
  trigger: ReactNode;
}

const LeaveUpdateDialog = ({
  initialDays,
  onUpdate,
  editHistory = [],
  trigger,
}: LeaveUpdateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState<number>(initialDays);
  const [reason, setReason] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (days && reason) {
        
      onUpdate({
        days,
        reason,
        timestamp: new Date().toISOString(),
      });
      setOpen(false);
      setReason('');
      setDays(initialDays);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
        >
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-lg font-bold">
              Update Annual Paid Leave
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 hover:bg-gray-100 rounded">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Number of Days
              </label>
              <Input
                type="number"
                value={days}
                onChange={(e: { target: { value: SetStateAction<string>; }; }) => setDays(Number(e.target.value))}
                min="0"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Reason for Change
              </label>
              <Input
                type="text"
                value={reason}
                onChange={(e: { target: { value: SetStateAction<string>; }; }) => setReason(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              Update Leave
            </Button>
          </form>

          {editHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Edit History</h3>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {editHistory.map((edit, index) => (
                  <div
                    key={index}
                    className="text-sm p-2 bg-gray-50 rounded"
                  >
                    <p>Days: {edit.days}</p>
                    <p>Reason: {edit.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(edit.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LeaveUpdateDialog;