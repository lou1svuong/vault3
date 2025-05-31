import { Button } from "@/components/ui/button";
import { Plus, LogOut, ArrowLeft, Lock, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VaultWithMembers {
  id: string;
  name: string;
  isOwner: boolean;
  members: string[];
}

interface VaultHeaderProps {
  onSignOut: () => void;
  onAddNew: () => void;
  vaults: VaultWithMembers[];
  selectedVaultId: string | null;
  onVaultSelect: (vaultId: string) => void;
  onBack: () => void;
  showBackButton: boolean;
}

export function VaultHeader({
  onSignOut,
  onAddNew,
  vaults,
  selectedVaultId,
  onVaultSelect,
  onBack,
  showBackButton,
}: VaultHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-none"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={onAddNew}
            variant="outline"
            className="rounded-none border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Password
          </Button>
          <Button
            onClick={onSignOut}
            variant="outline"
            className="rounded-none border-dashed"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {!showBackButton && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vaults.map((vault) => (
            <Card
              key={vault.id}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                selectedVaultId === vault.id
                  ? "border-primary bg-primary/5"
                  : "border-dashed"
              )}
              onClick={() => onVaultSelect(vault.id)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium">{vault.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    <span>{vault.isOwner ? "Owner" : "Member"}</span>
                    <Users className="h-3 w-3 ml-2" />
                    <span>{vault.members.length} members</span>
                  </div>
                </div>
                {selectedVaultId === vault.id && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
