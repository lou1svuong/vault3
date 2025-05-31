import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { SuiClientProviderWrapper } from "./sui-client-provider";
import { WalletProviderWrapper } from "./wallet-provider";
import "@mysten/dapp-kit/dist/index.css";

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
      <SuiClientProviderWrapper>
        <WalletProviderWrapper>{children}</WalletProviderWrapper>
      </SuiClientProviderWrapper>
    </ThemeProvider>
  );
}
