import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";

interface VaultHeaderProps {
  onSignOut: () => void;
  onAddNew: () => void;
}

export function VaultHeader({ onSignOut, onAddNew }: VaultHeaderProps) {
  return (
    <Card className="w-full border-dashed border mt-4 rounded-none shadow-none">
      <CardHeader className="border-b border-dashed flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5" />
            <span className="text-sm font-mono">vault.sh</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={onSignOut}
              variant="outline"
              className="rounded-none border-dashed"
            >
              Sign Out
            </Button>
            <Button onClick={onAddNew} className="rounded-none border-dashed">
              Add New Password
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
