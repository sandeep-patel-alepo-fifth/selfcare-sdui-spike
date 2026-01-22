import type { Metadata } from "next";
import { headers } from "next/headers";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alepo Selfcare",
  description: "Enterprise Self-Service Portal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get tenant ID from middleware-injected headers
  const headersList = await headers();
  const tenantId = headersList.get("x-tenant-id") || "default";

  return (
    <html lang="en">
      <body className="antialiased">
        <Providers tenantId={tenantId}>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
