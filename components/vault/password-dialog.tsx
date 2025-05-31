import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export function PasswordDialog({
  open,
  onOpenChange,
  password,
  onPasswordChange,
  onSubmit,
}: PasswordDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-dashed rounded-none">
        <DialogHeader>
          <DialogTitle className="font-mono">
            Set Encryption Password
          </DialogTitle>
          <DialogDescription className="font-mono">
            Please enter a password to encrypt your vault. This password will be
            required to access your vault in the future.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="password" className="font-mono">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="Enter your encryption password"
              className="rounded-none border-dashed"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-none border-dashed"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!password}
            className="rounded-none border-dashed"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
