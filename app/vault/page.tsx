"use client";

import { useState, useRef, useEffect } from "react";
import { Tusky } from "@tusky-io/ts-sdk/web";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  useCurrentAccount,
  useSignPersonalMessage,
  useCurrentWallet,
} from "@mysten/dapp-kit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CustomConnectButton from "@/components/custom-connect-wallet/custom-connect-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
}

export default function VaultPage() {
  const [tusky, setTusky] = useState<Tusky | null>(null);
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPassword, setNewPassword] = useState<Partial<PasswordEntry>>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState("");
  const [currentTuskyInstance, setCurrentTuskyInstance] =
    useState<Tusky | null>(null);
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
    } catch (err) {
      console.error("Encryption error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to set up encryption"
      );
    } finally {
      setIsLoading(false);
      setShowPasswordDialog(false);
      setEncryptionPassword("");
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
      const vaults = await tuskyInstance.vault.listAll();
      const passwordVault = vaults.find((v) => v.name === "Password Vault");

      if (!passwordVault) {
        const { id } = await tuskyInstance.vault.create("Password Vault", {
          encrypted: true,
        });
        setPasswords([]);
        return;
      }

      const files = await tuskyInstance.file.listAll({
        vaultId: passwordVault.id,
      });
      const passwordEntries: PasswordEntry[] = [];

      for (const file of files) {
        const buffer = await tuskyInstance.file.arrayBuffer(file.id);
        const content = new TextDecoder().decode(buffer);
        passwordEntries.push(JSON.parse(content));
      }

      setPasswords(passwordEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load passwords");
    }
  };

  // Save new password
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
        await savePasswordToVault(tusky, passwordVault.id);
      }

      setShowAddForm(false);
      setNewPassword({});
      await loadPasswords(tusky);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save password");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to save password to vault
  const savePasswordToVault = async (tuskyInstance: Tusky, vaultId: string) => {
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
    await tuskyInstance.file.upload(vaultId, blob, {
      name: `${passwordEntry.title}.json`,
      mimeType: "application/json",
    });
  };

  // Delete password
  const deletePassword = async (id: string) => {
    if (!tusky) return;

    try {
      setIsLoading(true);
      setError(null);

      const vaults = await tusky.vault.listAll();
      const passwordVault = vaults.find((v) => v.name === "Password Vault");

      if (passwordVault) {
        const files = await tusky.file.listAll({ vaultId: passwordVault.id });
        const fileToDelete = files.find((f) => f.name === `${id}.json`);

        if (fileToDelete) {
          await tusky.file.delete(fileToDelete.id);
          await loadPasswords(tusky);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-4">
        <h1 className="h4 mb-3">Vault³</h1>
        <CustomConnectButton />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading vault...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : !tusky ? (
        <div className="d-grid gap-2">
          <Button onClick={handleSignInWithWallet} variant="default">
            Sign in with Wallet
          </Button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <Button onClick={() => setShowAddForm(true)} variant="default">
              Add New Password
            </Button>
          </div>

          {showAddForm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Add New Password</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Title"
                    value={newPassword.title || ""}
                    onChange={(e) =>
                      setNewPassword({ ...newPassword, title: e.target.value })
                    }
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
                  />
                  <Input
                    placeholder="URL (optional)"
                    value={newPassword.url || ""}
                    onChange={(e) =>
                      setNewPassword({ ...newPassword, url: e.target.value })
                    }
                  />
                  <Textarea
                    placeholder="Notes (optional)"
                    value={newPassword.notes || ""}
                    onChange={(e) =>
                      setNewPassword({ ...newPassword, notes: e.target.value })
                    }
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => setShowAddForm(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button onClick={savePassword} disabled={isLoading}>
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {passwords.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <CardTitle>{entry.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Username: {entry.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Password: ••••••••
                    </p>
                    {entry.url && (
                      <p className="text-sm text-muted-foreground">
                        URL:{" "}
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {entry.url}
                        </a>
                      </p>
                    )}
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground">
                        Notes: {entry.notes}
                      </p>
                    )}
                    <Button
                      onClick={() => deletePassword(entry.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Encryption Password</DialogTitle>
            <DialogDescription>
              Please enter a password to encrypt your vault. This password will
              be required to access your vault in the future.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={encryptionPassword}
                onChange={(e) => setEncryptionPassword(e.target.value)}
                placeholder="Enter your encryption password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPasswordDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordSubmit}
              disabled={!encryptionPassword}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>SDK Method Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="logs-container"
            style={{ maxHeight: "200px", overflowY: "auto" }}
          >
            {logs.map((log, index) => (
              <div
                key={index}
                className={`log-entry small ${
                  log.startsWith("  →") ? "text-primary" : "text-muted"
                }`}
              >
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
