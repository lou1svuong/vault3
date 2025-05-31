import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Link from "next/link";

interface VaultLoggerProps {
  logs: string[];
  logsEndRef: React.RefObject<HTMLDivElement | null>;
}

export function VaultLogger({ logs, logsEndRef }: VaultLoggerProps) {
  return (
    <Card className="w-full border-dashed border rounded-none shadow-none mt-4">
      <CardHeader className="border-b border-dashed pb-4">
        <div className="flex items-center space-x-2">
          <Terminal className="h-5 w-5" />
          <span className="text-sm font-mono">Vault³_log.sh</span>
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
      </CardFooter>
    </Card>
  );
}
