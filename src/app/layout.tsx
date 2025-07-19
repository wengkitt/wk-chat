import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/custom/convex-client-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/custom/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WK Chat",
  description:
    "WK Chat is a modern AI chat platform. Access multiple advanced AI models, enjoy a sleek and user-friendly interface, and experience seamless, high-quality conversations—all in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>{children}</SidebarProvider>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
