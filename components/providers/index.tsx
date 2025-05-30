import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { WalletProviders } from "./wallet-provider";

export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <Toaster position="bottom-right" closeButton />
      <WalletProviders>{children}</WalletProviders>
    </ThemeProvider>
  );
}
