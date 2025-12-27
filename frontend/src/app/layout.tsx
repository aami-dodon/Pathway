import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { DynamicFavicon } from "@/components/dynamic-favicon";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pathway - Learn from Expert Coaches",
  description: "Discover courses, read expert insights, and book coaching sessions to accelerate your growth.",
  keywords: ["coaching", "learning", "courses", "LMS", "blog", "experts"],
  openGraph: {
    title: "Pathway - Learn from Expert Coaches",
    description: "Discover courses, read expert insights, and book coaching sessions.",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1574169208507-84376144848b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA2MjZ8MHwxfHNlYXJjaHwxMXx8YWJzdHJhY3R8ZW58MHx8fHwxNzY2ODAxNDMwfDA&ixlib=rb-4.1.0&q=80&w=1080",
        width: 1080,
        height: 1080,
        alt: "Pathway - Learn from Expert Coaches",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DynamicFavicon />
          <AuthProvider>
            <div className="relative min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
