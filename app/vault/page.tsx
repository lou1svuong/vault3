"use client";

import { useState, useRef, useEffect } from "react";
import { Tusky } from "@tusky-io/ts-sdk/web";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Terminal } from "lucide-react";
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

interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
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

  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const account = useCurrentAccount();
  const wallet = useCurrentWallet();

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
      await loadPasswords(currentTuskyInstance);
      await loadTrashFiles(currentTuskyInstance);
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

  // Load passwords from vault
  const loadPasswords = async (tuskyInstance: Tusky) => {
    try {
      addLog("Loading passwords from vault...");
      const vaults = await tuskyInstance.vault.listAll();
      const passwordVault = vaults.find((v) => v.name === "Password Vault");

      if (!passwordVault) {
        addLog("Password vault not found, creating new one...");
        const { id } = await tuskyInstance.vault.create("Password Vault", {
          encrypted: true,
        });
        setPasswords([]);
        return;
      }

      addLog(`Found password vault: ${passwordVault.id}`);
      const files = await tuskyInstance.file.listAll({
        vaultId: passwordVault.id,
      });
      addLog(`Found ${files.length} files in vault`);

      // Filter out files that are in trash
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

  const loadTrashFiles = async (tuskyInstance: Tusky) => {
    try {
      addLog("Loading trash files...");
      const vaults = await tuskyInstance.vault.listAll();
      const passwordVault = vaults.find((v) => v.name === "Password Vault");

      if (!passwordVault) {
        addLog("Password vault not found");
        return;
      }

      const files = await tuskyInstance.file.listAll({
        vaultId: passwordVault.id,
      });

      // Filter only trashed files
      const trashedFiles = files.filter((file) => file.isTrashed);
      addLog(`Found ${trashedFiles.length} files in trash`);
      addLog(
        "Trash files:",
        JSON.stringify(trashedFiles.map((f) => ({ id: f.id, name: f.name })))
      );

      setTrashFiles(trashedFiles);
    } catch (err) {
      console.error("Load trash error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load trash files"
      );
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

  const savePassword = async () => {
    if (!tusky) {
      setError("Tusky is not initialized");
      return;
    }

    // Check if required fields are filled
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

      const vaults = await tusky.vault.listAll();
      const passwordVault = vaults.find((v) => v.name === "Password Vault");

      if (!passwordVault) {
        const { id } = await tusky.vault.create("Password Vault", {
          encrypted: true,
        });
        await savePasswordToVault(tusky, id);
      } else {
        if (editingPassword) {
          // Delete old file if editing
          const files = await tusky.file.listAll({ vaultId: passwordVault.id });
          const oldFile = files.find(
            (f) => f.name === `${editingPassword.title}.json`
          );
          if (oldFile) {
            await tusky.file.delete(oldFile.id);
            await tusky.file.deletePermanently(oldFile.id);
          }
        }
        await savePasswordToVault(tusky, passwordVault.id);
      }

      setShowAddForm(false);
      setNewPassword({});
      setEditingPassword(null);
      await loadPasswords(tusky);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save password");
    } finally {
      setIsLoading(false);
    }
  };

  const savePasswordToVault = async (tuskyInstance: Tusky, vaultId: string) => {
    const passwordEntry: PasswordEntry = {
      id: Date.now().toString(),
      title: newPassword.title!,
      username: newPassword.username!,
      password: newPassword.password!,
      url: newPassword.url,
      notes: newPassword.notes,
    };

    addLog("Saving password entry:", JSON.stringify(passwordEntry));
    const blob = new Blob([JSON.stringify(passwordEntry)], {
      type: "application/json",
    });
    const fileName = `${passwordEntry.title}.json`;
    addLog(`Uploading file: ${fileName}`);
    await tuskyInstance.file.upload(vaultId, blob, {
      name: fileName,
      mimeType: "application/json",
    });
    addLog("File uploaded successfully");
  };

  // Delete password
  const deletePassword = async (id: string) => {
    if (!tusky) return;

    try {
      setError(null);
      setDeletingPasswordId(id);

      addLog("Listing vaults...", "tusky.vault.listAll()");
      const vaults = await tusky.vault.listAll();
      const passwordVault = vaults.find((v) => v.name === "Password Vault");

      if (passwordVault) {
        addLog(
          "Listing files in vault...",
          `tusky.file.listAll({ vaultId: ${passwordVault.id} })`
        );
        const files = await tusky.file.listAll({ vaultId: passwordVault.id });
        addLog(`Found ${files.length} files in vault`);
        addLog(
          "Files in vault:",
          JSON.stringify(files.map((f) => ({ id: f.id, name: f.name })))
        );

        // Find the password entry first to get its title
        const passwordToDelete = passwords.find((p) => p.id === id);
        if (!passwordToDelete) {
          addLog("Password entry not found in state");
          toast.error("Password entry not found.");
          return;
        }

        const fileToDelete = files.find(
          (f) => f.name === `${passwordToDelete.title}.json`
        );
        addLog(`Looking for file: ${passwordToDelete.title}.json`);

        if (fileToDelete) {
          addLog("Deleting file...", `tusky.file.delete(${fileToDelete.id})`);
          await tusky.file.delete(fileToDelete.id);

          // Permanently delete the file from trash
          addLog(
            "Permanently deleting file from trash...",
            `tusky.file.deletePermanently(${fileToDelete.id})`
          );
          await tusky.file.deletePermanently(fileToDelete.id);

          // Verify file is deleted
          const filesAfterDelete = await tusky.file.listAll({
            vaultId: passwordVault.id,
          });
          const fileStillExists = filesAfterDelete.some(
            (f) => f.id === fileToDelete.id
          );

          if (fileStillExists) {
            addLog("File still exists after deletion attempt");
            toast.error("Failed to delete password. Please try again.");
            return;
          }

          toast.success("Password deleted!");
          setPasswords((prev) => prev.filter((entry) => entry.id !== id));
        } else {
          addLog("File not found in vault");
          toast.error("Password file not found in vault.");
        }
      } else {
        addLog("Password vault not found");
        toast.error("Password vault not found.");
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

  return (
    <div className="container mx-auto px-4 border border-dashed mt-4">
      {isLoading ? (
        <Card className="w-full border-dashed border mt-4 rounded-none shadow-none">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-mono">Loading vault...</span>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="w-full border-dashed border mt-4 rounded-none shadow-none">
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
        <Card className="w-full border-dashed border mt-4 rounded-none shadow-none">
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
        <div className="space-y-4">
          <VaultHeader
            onSignOut={handleSignOut}
            onAddNew={() => setShowAddForm(true)}
          />
          <Card className="w-full border-dashed border mt-4 rounded-none shadow-none">
            <CardContent className="pt-4">
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
                {passwords.length === 0 ? (
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
        </div>
      )}

      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        password={encryptionPassword}
        onPasswordChange={setEncryptionPassword}
        onSubmit={handlePasswordSubmit}
      />

      <VaultLogger logs={logs} logsEndRef={logsEndRef} />
    </div>
  );
}
