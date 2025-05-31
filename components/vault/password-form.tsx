import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

interface PasswordFormProps {
  password: Partial<PasswordEntry>;
  isLoading: boolean;
  isEditing: boolean;
  onChange: (field: keyof PasswordEntry, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function PasswordForm({
  password,
  isLoading,
  isEditing,
  onChange,
  onSave,
  onCancel,
}: PasswordFormProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center space-x-2">
        <span className="text-muted-foreground">$</span>
        <span>{isEditing ? "edit_password" : "add_password"}</span>
      </div>
      <div className="pl-6 space-y-4">
        <Input
          placeholder="Title"
          value={password.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          className="rounded-none border-dashed"
        />
        <Input
          placeholder="Username"
          value={password.username || ""}
          onChange={(e) => onChange("username", e.target.value)}
          className="rounded-none border-dashed"
        />
        <Input
          type="password"
          placeholder="Password"
          value={password.password || ""}
          onChange={(e) => onChange("password", e.target.value)}
          className="rounded-none border-dashed"
        />
        <Input
          placeholder="URL (optional)"
          value={password.url || ""}
          onChange={(e) => onChange("url", e.target.value)}
          className="rounded-none border-dashed"
        />
        <Textarea
          placeholder="Notes (optional)"
          value={password.notes || ""}
          onChange={(e) => onChange("notes", e.target.value)}
          className="rounded-none border-dashed"
        />
        <div className="flex justify-end space-x-2">
          <Button
            onClick={onCancel}
            variant="outline"
            className="rounded-none border-dashed"
          >
            Cancel
          </Button>
          <Button
            onClick={onSave}
            disabled={isLoading}
            className="rounded-none border-dashed"
          >
            {isLoading ? "Saving..." : isEditing ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
