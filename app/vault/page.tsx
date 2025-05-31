"use client";

import { useState, useRef, useEffect } from "react";
import { Tusky, Vault } from "@tusky-io/ts-sdk/web";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Terminal, Users, Lock, Trash2 } from "lucide-react";
import {
  useCurrentAccount,
  useSignPersonalMessage,
  useCurrentWallet,
} from "@mysten/dapp-kit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordCard } from "@/components/vault/password-card";
import { toast } from "sonner";
import { VaultHeader } from "@/components/vault/vault-header";
import { PasswordForm } from "@/components/vault/password-form";
import { VaultLogger } from "@/components/vault/vault-logger";
import { PasswordDialog } from "@/components/vault/password-dialog";
import { VaultDialog } from "@/components/vault/vault-dialog";
import { useSearchParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DeleteVaultDialog } from "@/components/vault/delete-vault-dialog";

interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

interface VaultWithMembers {
  id: string;
  name: string;
  isOwner: boolean;
  members: string[];
}

function getDomain(url?: string) {
  if (!url) return "";
  try {
    const withProtocol = url.match(/^https?:\/\//) ? url : `https://${url}`;
    return new URL(withProtocol).hostname;
  } catch {
    return "";
  }
}

export default function VaultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tusky, setTusky] = useState<Tusky | null>(null);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPassword, setNewPassword] = useState<Partial<PasswordEntry>>({});
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(
    null
  );
  const [logs, setLogs] = useState<string[]>([]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState("");
  const [currentTuskyInstance, setCurrentTuskyInstance] =
    useState<Tusky | null>(null);
  const [deletingPasswordId, setDeletingPasswordId] = useState<string | null>(
    null
  );
  const [trashFiles, setTrashFiles] = useState<any[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [vaults, setVaults] = useState<VaultWithMembers[]>([]);
  const [selectedVaultId, setSelectedVaultId] = useState<string | null>(null);
  const [isLoadingVault, setIsLoadingVault] = useState(false);
  const [showVaultDialog, setShowVaultDialog] = useState(false);
  const [deletingVaultId, setDeletingVaultId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [vaultToDelete, setVaultToDelete] = useState<VaultWithMembers | null>(
    null
  );

  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const account = useCurrentAccount();
  const wallet = useCurrentWallet();

  // Load initial vault from URL
  useEffect(() => {
    const vaultId = searchParams.get("vault");
    if (vaultId && tusky) {
      setSelectedVaultId(vaultId);
      loadPasswords(tusky, vaultId);
    }
  }, [searchParams, tusky]);

  const updateVaultUrl = (vaultId: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (vaultId) {
      params.set("vault", vaultId);
    } else {
      params.delete("vault");
    }
    router.push(`/vault?${params.toString()}`);
  };

  const handleVaultSelect = async (vaultId: string) => {
    setSelectedVaultId(vaultId);
    updateVaultUrl(vaultId);
    if (tusky) {
      setIsLoadingVault(true);
      setPasswords([]); // Clear passwords when switching vaults
      try {
        await loadPasswords(tusky, vaultId);
      } finally {
        setIsLoadingVault(false);
      }
    }
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const addLog = (message: string, methodCall?: string) => {
    const timestamp = new Date().toLocaleTimeString();
    if (methodCall) {
      setLogs((prev) => [
        ...prev,
        `${timestamp}: ${message}`,
        `  → ${methodCall}`,
      ]);
    } else {
      setLogs((prev) => [...prev, `${timestamp}: ${message}`]);
    }
  };

  const handleSignInWithWallet = async () => {
    if (account) {
      try {
        setIsLoading(true);
        setError(null);

        addLog(
          "Initializing Tusky with wallet...",
          "Tusky.init({ wallet: { signPersonalMessage, account } })"
        );
        const tuskyInstance = new Tusky({
          wallet: {
            signPersonalMessage,
            account: account as any,
          },
        });

        addLog("Signing in with wallet...", "tusky.auth.signIn()");
        await tuskyInstance.auth.signIn();

        setCurrentTuskyInstance(tuskyInstance);
        setShowPasswordDialog(true);
      } catch (err) {
        console.error("Sign in error:", err);
        setError(err instanceof Error ? err.message : "Failed to sign in");
        setIsLoading(false);
      }
    }
  };

  const handlePasswordSubmit = async () => {
    if (!currentTuskyInstance || !encryptionPassword) return;

    setShowPasswordDialog(false);
    setEncryptionPassword("");

    try {
      setIsLoading(true);
      addLog("Setting up encryption context...");
      await handleEncryptionContext(currentTuskyInstance);

      addLog(
        "Adding keystore encrypter...",
        "tusky.addEncrypter({ keystore: true })"
      );
      await currentTuskyInstance.addEncrypter({ keystore: true });

      setTusky(currentTuskyInstance);
      await loadVaults(currentTuskyInstance);
    } catch (err) {
      console.error("Encryption error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to set up encryption"
      );
    } finally {
      setIsLoading(false);
      setCurrentTuskyInstance(null);
    }
  };

  const handleSignOut = async () => {
    if (tusky) {
      addLog("Signing out...");
      tusky.signOut();
      setTusky(null);
      setLogs([]);
      addLog("Successfully signed out");
    }
  };

  const handleEncryptionContext = async (tuskyInstance: Tusky) => {
    if (!encryptionPassword) {
      throw new Error("Password is required.");
    }
    addLog(
      "Adding password encrypter...",
      'tusky.addEncrypter({ password: "***", keystore: true })'
    );
    await tuskyInstance.addEncrypter({
      password: encryptionPassword,
      keystore: true,
    });
  };

  const loadVaults = async (tuskyInstance: Tusky) => {
    try {
      addLog("Loading vaults...");
      const vaults = await tuskyInstance.vault.listAll();
      addLog(`Found ${vaults.length} vaults`);

      const vaultList = await Promise.all(
        vaults.map(async (vault) => {
          if (!vault || !vault.id) {
            addLog("Invalid vault object: missing ID");
            return null;
          }

          try {
            const members = await tuskyInstance.vault.members(vault.id);
            return {
              id: vault.id,
              name: vault.name || "Unnamed Vault",
              isOwner: vault.owner === tuskyInstance.auth.getAddress(),
              members: members.map((m) => m.address),
            };
          } catch (err) {
            addLog(
              `Error loading members for vault ${vault.id}: ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            );
            return null;
          }
        })
      );

      const validVaults = vaultList.filter(
        (vault): vault is VaultWithMembers => vault !== null
      );
      setVaults(validVaults);
      addLog(`Successfully loaded ${validVaults.length} valid vaults`);

      // If there's a selected vault in URL, load its passwords
      const vaultId = searchParams.get("vault");
      if (vaultId && validVaults.some((v) => v.id === vaultId)) {
        setSelectedVaultId(vaultId);
        await loadPasswords(tuskyInstance, vaultId);
      }
    } catch (err) {
      console.error("Load vaults error:", err);
      setError(err instanceof Error ? err.message : "Failed to load vaults");
    }
  };

  const loadPasswords = async (tuskyInstance: Tusky, vaultId: string) => {
    try {
      addLog(`Loading passwords from vault ${vaultId}...`);
      const files = await tuskyInstance.file.listAll({ vaultId });
      addLog(`Found ${files.length} files in vault`);

      const activeFiles = files.filter((file) => !file.isTrashed);
      addLog(`Found ${activeFiles.length} active files (not in trash)`);

      const passwordEntries: PasswordEntry[] = [];
      for (const file of activeFiles) {
        try {
          addLog(`Loading file: ${file.name}`);
          const buffer = await tuskyInstance.file.arrayBuffer(file.id);
          const content = new TextDecoder().decode(buffer);
          const entry = JSON.parse(content);
          passwordEntries.push(entry);
        } catch (err) {
          console.error(`Error loading file ${file.name}:`, err);
          addLog(
            `Error loading file ${file.name}: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
        }
      }

      addLog(`Successfully loaded ${passwordEntries.length} passwords`);
      setPasswords(passwordEntries);
    } catch (err) {
      console.error("Load passwords error:", err);
      setError(err instanceof Error ? err.message : "Failed to load passwords");
    }
  };

  const handleEdit = (password: PasswordEntry) => {
    setEditingPassword(password);
    setNewPassword({
      title: password.title,
      username: password.username,
      password: password.password,
      url: password.url,
      notes: password.notes,
    });
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingPassword(null);
    setNewPassword({});
    setShowAddForm(false);
  };

  const handlePasswordChange = (field: keyof PasswordEntry, value: string) => {
    setNewPassword((prev) => ({ ...prev, [field]: value }));
  };

  const deletePassword = async (id: string) => {
    if (!tusky || !selectedVaultId) return;

    try {
      setError(null);
      setDeletingPasswordId(id);

      const files = await tusky.file.listAll({ vaultId: selectedVaultId });
      const passwordToDelete = passwords.find((p) => p.id === id);
      if (!passwordToDelete) {
        toast.error("Password entry not found.");
        return;
      }

      const fileToDelete = files.find(
        (f) => f.name === `${passwordToDelete.title}.json`
      );

      if (fileToDelete) {
        addLog(`Deleting password file: ${fileToDelete.name}`);
        await tusky.file.delete(fileToDelete.id);
        await tusky.file.deletePermanently(fileToDelete.id);

        const filesAfterDelete = await tusky.file.listAll({
          vaultId: selectedVaultId,
        });
        const fileStillExists = filesAfterDelete.some(
          (f) => f.id === fileToDelete.id
        );

        if (fileStillExists) {
          toast.error("Failed to delete password. Please try again.");
          return;
        }

        toast.success("Password deleted successfully!");
        setPasswords((prev) => prev.filter((entry) => entry.id !== id));
      } else {
        toast.error("Password file not found in vault.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting password.");
      setError(
        err instanceof Error ? err.message : "Failed to delete password"
      );
    } finally {
      setDeletingPasswordId(null);
    }
  };

  const savePassword = async () => {
    if (!tusky || !selectedVaultId) {
      setError("Tusky is not initialized or no vault selected");
      return;
    }

    if (!newPassword.title?.trim()) {
      setError("Title is required");
      return;
    }
    if (!newPassword.username?.trim()) {
      setError("Username is required");
      return;
    }
    if (!newPassword.password?.trim()) {
      setError("Password is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (editingPassword) {
        const files = await tusky.file.listAll({ vaultId: selectedVaultId });
        const oldFile = files.find(
          (f) => f.name === `${editingPassword.title}.json`
        );
        if (oldFile) {
          addLog(`Deleting old password file: ${oldFile.name}`);
          await tusky.file.delete(oldFile.id);
          await tusky.file.deletePermanently(oldFile.id);
        }
      }

      const passwordEntry: PasswordEntry = {
        id: Date.now().toString(),
        title: newPassword.title!,
        username: newPassword.username!,
        password: newPassword.password!,
        url: newPassword.url,
        notes: newPassword.notes,
      };

      const blob = new Blob([JSON.stringify(passwordEntry)], {
        type: "application/json",
      });
      const fileName = `${passwordEntry.title}.json`;
      addLog(`Uploading password file: ${fileName}`);
      await tusky.file.upload(selectedVaultId, blob, {
        name: fileName,
        mimeType: "application/json",
      });

      setShowAddForm(false);
      setNewPassword({});
      setEditingPassword(null);
      toast.success(
        editingPassword
          ? "Password updated successfully!"
          : "Password saved successfully!"
      );
      await loadPasswords(tusky, selectedVaultId);
    } catch (err) {
      console.error("Save password error:", err);
      toast.error(
        editingPassword
          ? "Failed to update password"
          : "Failed to save password"
      );
      setError(err instanceof Error ? err.message : "Failed to save password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVault = async (vaultName: string) => {
    if (!tusky) return;

    try {
      setIsLoading(true);
      addLog(`Creating new vault: ${vaultName}`);
      const { id } = await tusky.vault.create(vaultName, {
        encrypted: true,
      });

      addLog(`Vault created with ID: ${id}`);
      await loadVaults(tusky);
      toast.success("Vault created successfully!");
      setShowVaultDialog(false);
    } catch (err) {
      console.error("Create vault error:", err);
      toast.error("Failed to create vault");
      setError(err instanceof Error ? err.message : "Failed to create vault");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVault = async (vaultId: string) => {
    if (!tusky) return;

    try {
      setDeletingVaultId(vaultId);
      addLog(`Deleting vault ${vaultId}...`);

      // Delete all files in the vault first
      const files = await tusky.file.listAll({ vaultId });
      for (const file of files) {
        await tusky.file.delete(file.id);
        await tusky.file.deletePermanently(file.id);
      }

      // Delete the vault
      await tusky.vault.delete(vaultId);

      addLog(`Vault ${vaultId} deleted successfully`);
      toast.success("Vault deleted successfully");

      // Reload vaults list
      await loadVaults(tusky);

      // If the deleted vault was selected, clear selection
      if (selectedVaultId === vaultId) {
        setSelectedVaultId(null);
        updateVaultUrl(null);
      }
    } catch (err) {
      console.error("Delete vault error:", err);
      toast.error("Failed to delete vault");
      setError(err instanceof Error ? err.message : "Failed to delete vault");
    } finally {
      setDeletingVaultId(null);
      setShowDeleteDialog(false);
      setVaultToDelete(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl border border-dashed">
      {isLoading ? (
        <Card className="w-full border-dashed border rounded-none shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-mono">Loading vault...</span>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="w-full border-dashed border rounded-none shadow-none">
          <CardHeader className="border-b border-dashed pb-4">
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5" />
              <span className="text-sm font-mono">error.sh</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Alert variant="destructive" className="font-mono">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : !tusky ? (
        <Card className="w-full border-dashed border rounded-none shadow-none">
          <CardHeader className="border-b border-dashed pb-4">
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5" />
              <span className="text-sm font-mono">vault.sh</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">$</span>
                <span>connect_wallet</span>
              </div>
              <div className="pl-6">
                <Button
                  onClick={handleSignInWithWallet}
                  variant="outline"
                  className="w-full rounded-none border-dashed"
                >
                  Sign in with Wallet
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <VaultHeader
            onSignOut={handleSignOut}
            onAddNew={
              selectedVaultId
                ? () => setShowAddForm(true)
                : () => setShowVaultDialog(true)
            }
            vaults={vaults}
            selectedVaultId={selectedVaultId}
            onVaultSelect={handleVaultSelect}
            onBack={() => {
              setSelectedVaultId(null);
              updateVaultUrl(null);
            }}
            showBackButton={!!selectedVaultId}
          />
          {!selectedVaultId && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm font-mono">$ cat vault.sh</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vaults.map((vault) => (
                  <Card
                    key={vault.id}
                    className={`group relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                      selectedVaultId === vault.id
                        ? "border-primary"
                        : "border-dashed hover:border-primary/50"
                    }`}
                    onClick={() => handleVaultSelect(vault.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">
                              {vault.name}
                            </h3>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{vault.members.length} members</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {vault.isOwner && (
                              <Badge variant="secondary" className="rounded-lg">
                                Owner
                              </Badge>
                            )}
                            {vault.isOwner && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 hover:text-destructive-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setVaultToDelete(vault);
                                  setShowDeleteDialog(true);
                                }}
                                disabled={deletingVaultId === vault.id}
                              >
                                {deletingVaultId === vault.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Lock className="h-4 w-4" />
                          <span>Encrypted Vault</span>
                        </div>
                        <div className="pt-2">
                          <Button
                            className="w-full rounded-none border-dashed"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVaultSelect(vault.id);
                            }}
                          >
                            View Passwords
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {selectedVaultId ? (
            <Card className="w-full border-dashed border rounded-none shadow-none">
              <CardContent className="pt-6">
                {showAddForm && (
                  <PasswordForm
                    password={newPassword}
                    isLoading={isLoading}
                    isEditing={!!editingPassword}
                    onChange={handlePasswordChange}
                    onSave={savePassword}
                    onCancel={handleCancelEdit}
                  />
                )}

                <div className="space-y-6">
                  {isLoadingVault ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[300px]" />
                        </div>
                      ))}
                    </div>
                  ) : passwords.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="text-muted-foreground text-center space-y-2">
                        <p className="text-lg">No passwords yet</p>
                        <p className="text-sm">
                          Your vault is empty. Start by adding your first
                          password.
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowAddForm(true)}
                        className="rounded-none border-dashed"
                      >
                        Add Your First Password
                      </Button>
                    </div>
                  ) : (
                    passwords.map((entry) => (
                      <PasswordCard
                        key={entry.id}
                        title={entry.title}
                        domain={getDomain(entry.url)}
                        username={entry.username}
                        password={entry.password}
                        notes={entry.notes}
                        isDeleting={deletingPasswordId === entry.id}
                        onEdit={() => handleEdit(entry)}
                        onDelete={() => deletePassword(entry.id)}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="text-muted-foreground text-center space-y-2">
                <p className="text-lg">Select a vault to view passwords</p>
                <p className="text-sm">
                  Choose a vault from the list above or create a new one.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        password={encryptionPassword}
        onPasswordChange={setEncryptionPassword}
        onSubmit={handlePasswordSubmit}
      />

      <VaultDialog
        open={showVaultDialog}
        onOpenChange={setShowVaultDialog}
        onSubmit={handleAddVault}
        isLoading={isLoading}
      />

      <DeleteVaultDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => vaultToDelete && handleDeleteVault(vaultToDelete.id)}
        isLoading={!!deletingVaultId}
        vaultName={vaultToDelete?.name || ""}
      />

      <VaultLogger logs={logs} logsEndRef={logsEndRef} />
    </div>
  );
}
