"use client";

import { useState, useRef, useEffect } from "react";
import { Tusky } from "@tusky-io/ts-sdk/web";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  useCurrentAccount,
  useSignPersonalMessage,
  useCurrentWallet,
} from "@mysten/dapp-kit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Terminal, Lock } from "lucide-react";
import { PasswordCard } from "@/components/vault/password-card";
import { toast } from "sonner";
import Link from "next/link";

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
  const [isLocked, setIsLocked] = useState(false);

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
      addLog("Successfully signed in with wallet");
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
      addLog("Signing out...", "tusky.signOut()");
      tusky.signOut();
      setTusky(null);
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

  const handleLockVault = () => {
    if (tusky) {
      addLog("Locking vault...", "tusky.signOut()");
      tusky.signOut();
      setTusky(null);
      setIsLocked(true);
      addLog("Vault locked successfully");
    }
  };

  const handleUnlock = async () => {
    if (!encryptionPassword) {
      toast.error("Please enter your password");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      addLog("Initializing Tusky with wallet...");
      const tuskyInstance = new Tusky({
        wallet: {
          signPersonalMessage,
          account: account as any,
        },
      });

      addLog("Setting up encryption context...");
      await handleEncryptionContext(tuskyInstance);

      addLog("Adding keystore encrypter...");
      await tuskyInstance.addEncrypter({ keystore: true });

      setTusky(tuskyInstance);
      setIsLocked(false);
      addLog("Successfully unlocked vault");
      await loadPasswords(tuskyInstance);
      await loadTrashFiles(tuskyInstance);
    } catch (err) {
      console.error("Unlock error:", err);
      setError(err instanceof Error ? err.message : "Failed to unlock vault");
    } finally {
      setIsLoading(false);
      setEncryptionPassword("");
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
      ) : isLocked ? (
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
                <span>status</span>
              </div>
              <div className="space-y-1 pl-6">
                <div className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <p className="text-3xl font-bold">Vault Locked</p>
                </div>
                <p className="text-muted-foreground">
                  Your vault is currently locked. Please enter your encryption
                  password to continue.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="font-mono">
                    Encryption Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={encryptionPassword}
                    onChange={(e) => setEncryptionPassword(e.target.value)}
                    placeholder="Enter your encryption password"
                    className="rounded-none border-dashed"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnlock();
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-6 border-t border-dashed mt-6 flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-none border-dashed"
              asChild
            >
              <Link href="/">$ cd /home</Link>
            </Button>
            <Button
              onClick={handleUnlock}
              disabled={isLoading}
              className="flex-1 rounded-none border-dashed"
            >
              {isLoading ? "Unlocking..." : "Unlock Vault"}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="w-full border-dashed border mt-4 rounded-none shadow-none">
            <CardHeader className="border-b border-dashed flex items-center">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Terminal className="h-5 w-5" />
                  <span className="text-sm font-mono">vault.sh</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleLockVault}
                    variant="outline"
                    className="rounded-none border-dashed"
                  >
                    Lock Vault
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="rounded-none border-dashed"
                  >
                    Add New Password
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {showAddForm && (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground">$</span>
                    <span>
                      {editingPassword ? "edit_password" : "add_password"}
                    </span>
                  </div>
                  <div className="pl-6 space-y-4">
                    <Input
                      placeholder="Title"
                      value={newPassword.title || ""}
                      onChange={(e) =>
                        setNewPassword({
                          ...newPassword,
                          title: e.target.value,
                        })
                      }
                      className="rounded-none border-dashed"
                    />
                    <Input
                      placeholder="Username"
                      value={newPassword.username || ""}
                      onChange={(e) =>
                        setNewPassword({
                          ...newPassword,
                          username: e.target.value,
                        })
                      }
                      className="rounded-none border-dashed"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={newPassword.password || ""}
                      onChange={(e) =>
                        setNewPassword({
                          ...newPassword,
                          password: e.target.value,
                        })
                      }
                      className="rounded-none border-dashed"
                    />
                    <Input
                      placeholder="URL (optional)"
                      value={newPassword.url || ""}
                      onChange={(e) =>
                        setNewPassword({ ...newPassword, url: e.target.value })
                      }
                      className="rounded-none border-dashed"
                    />
                    <Textarea
                      placeholder="Notes (optional)"
                      value={newPassword.notes || ""}
                      onChange={(e) =>
                        setNewPassword({
                          ...newPassword,
                          notes: e.target.value,
                        })
                      }
                      className="rounded-none border-dashed"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        onClick={handleCancelEdit}
                        variant="outline"
                        className="rounded-none border-dashed"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={savePassword}
                        disabled={isLoading}
                        className="rounded-none border-dashed"
                      >
                        {isLoading
                          ? "Saving..."
                          : editingPassword
                          ? "Update"
                          : "Save"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {passwords.map((entry) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="border-dashed rounded-none">
          <DialogHeader>
            <DialogTitle className="font-mono">
              Set Encryption Password
            </DialogTitle>
            <DialogDescription className="font-mono">
              Please enter a password to encrypt your vault. This password will
              be required to access your vault in the future.
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
                value={encryptionPassword}
                onChange={(e) => setEncryptionPassword(e.target.value)}
                placeholder="Enter your encryption password"
                className="rounded-none border-dashed"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
              className="rounded-none border-dashed"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              disabled={!encryptionPassword}
              className="rounded-none border-dashed"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="w-full border-dashed border rounded-none shadow-none mt-4">
        <CardHeader className="border-b border-dashed pb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5" />
            <span className="text-sm font-mono">sdk_logs.sh</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-400">No activity yet...</p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`${
                    log.startsWith("  →")
                      ? "text-green-400 ml-4"
                      : "text-gray-300"
                  }`}
                >
                  {log}
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </CardContent>
        <CardFooter className="pt-6 border-t border-dashed mt-6 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-none border-dashed"
            asChild
          >
            <Link href="/">$ cd /home</Link>
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-none border-dashed"
            asChild
          >
            <Link href="/">$ locked_vault</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
