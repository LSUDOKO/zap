import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { WagmiProviderWrapper } from "@/lib/WagmiProviderWrapper";
import { MetaMaskSmartAccountProvider } from "@/lib/MetaMaskSmartAccountProvider";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { Toaster } from 'sonner';

const poppins = Manrope({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "zkPull - Decentralized Bounty Platform",
  description: "Open Source Contributions Rewarded with zkTLS on Mantle. Powered by MetaMask Smart Accounts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${poppins.className} bg-white relative`}
      >
        <WagmiProviderWrapper>
          <MetaMaskSmartAccountProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange={false}
            >
              <Header />
              <main className="space-y-10 px-5 xl:px-40 2xl:px-80">
                {children}
              </main>
              <Toaster position="bottom-right" toastOptions={{ duration: 3000 }}/>
            </ThemeProvider>
          </MetaMaskSmartAccountProvider>
        </WagmiProviderWrapper>
      </body>
    </html>
  );
}
