// components/ForbiddenDialog.tsx
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  required?: string[];
  institutionNameOrSlug?: string;
  backHref?: string; // page to return to, e.g. /ins or /dashboard
};

export default function ForbiddenDialog({
  open,
  onOpenChange,
  required = [],
  institutionNameOrSlug,
  backHref = "/ins",
}: Props) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>🚫 Access Denied</DialogTitle>
          <DialogDescription>
            {institutionNameOrSlug ? (
              <>
                You don’t have permission to access the institution (
                <b>{institutionNameOrSlug}</b>).
              </>
            ) : (
              <>You don’t have permission to access this institution.</>
            )}
          </DialogDescription>
        </DialogHeader>

        {required.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Required permissions:
            <ul className="list-disc ms-5 mt-1">
              {required.map((k) => (
                <li key={k}>
                  <code>{k}</code>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              onOpenChange(false);
              router.push(backHref); // go back to select another institution
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
