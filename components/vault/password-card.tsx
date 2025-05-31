"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardAction,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Eye, EyeOff, Edit, Trash2, ExternalLink } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { copyWithToast } from "@/lib/utils";
import Link from "next/link";

interface PasswordCardProps {
  title: string;
  domain?: string;
  username: string;
  password: string;
  notes?: string;
  updatedAt?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PasswordCard({
  title,
  domain,
  username,
  password,
  notes,
  updatedAt,
  onEdit,
  onDelete,
}: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copyUsername] = useCopyToClipboard();
  const [copyPassword] = useCopyToClipboard();

  return (
    <Card className="border p-4 relative">
      <CardHeader className="flex flex-row justify-between items-start p-0 mb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          {domain && (
            <Link
              href={`https://${domain}`}
              target="_blank"
              className="hover:underline"
            >
              <Badge
                variant="secondary"
                className="ml-2 flex items-center gap-1"
              >
                {domain}
                <ExternalLink className="w-4 h-4" />
              </Badge>
            </Link>
          )}
        </div>
        <CardAction className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-3 p-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">Username:</span>
          <span className="font-mono">{username}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyWithToast(copyUsername, username, "Username")}
            title="Copy username"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Password:</span>
          <span className="font-mono">
            {showPassword ? password : "•".repeat(password.length)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyWithToast(copyPassword, password, "Password")}
            title="Copy password"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        {notes && (
          <div>
            <span className="font-medium">Notes:</span> <span>{notes}</span>
          </div>
        )}
        {updatedAt && (
          <div className="text-xs text-gray-500 mt-2">Updated: {updatedAt}</div>
        )}
      </CardContent>
    </Card>
  );
}
