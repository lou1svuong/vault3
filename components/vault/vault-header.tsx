import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus, Terminal } from "lucide-react";
import ThemeToggler from "../theme/toggler";

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
  showBackButton?: boolean;
  onBack?: () => void;
}

export function VaultHeader({
  onSignOut,
  onAddNew,
  selectedVaultId,
  onVaultSelect,
  showBackButton,
  onBack,
}: VaultHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {showBackButton && onBack && (
          <Button
            onClick={onBack}
            className="rounded-none flex items-center space-x-2"
          >
            <span className="text-sm font-mono">$ cd vault.sh</span>
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
          Add New
        </Button>
        <Button
          onClick={onSignOut}
          variant="outline"
          className="rounded-none border-dashed"
        >
          Sign Out
        </Button>
        <ThemeToggler
          size="icon"
          className="rounded-none border size-9 border-dashed"
        />
      </div>
    </div>
  );
}
